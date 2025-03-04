import React, { useState, useCallback, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Link as LinkIcon, Plus, ToggleLeft, ToggleRight } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { productService } from '../services/api';

interface Size {
  size: string;
  quantity: number;
}

interface Image {
  url: string;
  isMain: boolean;
  file?: File;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  sizes: Size[];
  images: Image[];
}

interface ProductFormProps {
  initialData?: ProductFormData;
  onSubmit: (data: ProductFormData) => void;
  isLoading: boolean;
}

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const CATEGORIES = ['SALE', 'NEW', 'TOPS', 'BOTTOMS', 'ACCESSORIES', 'SHOES'];

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  isLoading
}) => {
  const [formData, setFormData] = useState<ProductFormData>(initialData || {
    name: '',
    description: '',
    price: 0,
    category: '',
    sizes: [],
    images: []
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData | 'imageUrl', string>>>({});
  const [imageUrl, setImageUrl] = useState('');
  const [showImageUrlInput, setShowImageUrlInput] = useState(false);
  const [useUrlUpload, setUseUrlUpload] = useState(false);
  const [isTestingUrl, setIsTestingUrl] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [urlInputStatus, setUrlInputStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [urlInputMessage, setUrlInputMessage] = useState('');

  useEffect(() => {
    // If we have files to upload when submitting the form
    if (uploadedFiles.length > 0 && !isLoading) {
      // Reset the uploaded files after form submission
      setUploadedFiles([]);
    }
  }, [isLoading, uploadedFiles.length]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Store the files for later upload
    setUploadedFiles(prev => [...prev, ...acceptedFiles]);
    
    // Preview the files immediately
    acceptedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const imageUrl = reader.result as string;
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, {
            url: imageUrl,
            isMain: prev.images.length === 0,
            file
          }]
        }));
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    multiple: true
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : value
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSizeChange = (size: string, quantity: number) => {
    setFormData(prev => {
      const existingSizeIndex = prev.sizes.findIndex(s => s.size === size);
      const newSizes = [...prev.sizes];

      if (existingSizeIndex >= 0) {
        if (quantity === 0) {
          newSizes.splice(existingSizeIndex, 1);
        } else {
          newSizes[existingSizeIndex] = { size, quantity };
        }
      } else if (quantity > 0) {
        newSizes.push({ size, quantity });
      }

      return { ...prev, sizes: newSizes };
    });
  };

  const handleImageRemove = (index: number) => {
    setFormData(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      
      // If we're removing an image with a file, also remove it from uploadedFiles
      const imageToRemove = prev.images[index];
      if (imageToRemove.file) {
        setUploadedFiles(prevFiles => 
          prevFiles.filter(file => file !== imageToRemove.file)
        );
      }
      
      // Update main image if needed
      if (prev.images[index].isMain && newImages.length > 0) {
        newImages[0].isMain = true;
      }
      
      return { ...prev, images: newImages };
    });
  };

  const setMainImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        isMain: i === index
      }))
    }));
  };

  const testImageUrl = async (url: string) => {
    if (!url.trim()) return false;
    
    // Basic URL validation
    try {
      new URL(url);
    } catch (e) {
      setErrors(prev => ({ ...prev, imageUrl: 'Please enter a valid URL' }));
      setUrlInputStatus('error');
      setUrlInputMessage('Invalid URL format');
      return false;
    }
    
    // Check if URL is an image URL (common image extensions)
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    const urlLower = url.toLowerCase();
    const hasImageExtension = imageExtensions.some(ext => 
      urlLower.endsWith(ext) || urlLower.includes(`${ext}?`)
    );
    
    if (!hasImageExtension) {
      console.log('URL does not have a common image extension:', url);
      // We'll still try to load it, but warn the user
      setUrlInputMessage('URL does not appear to be an image, but we\'ll try to load it');
    }
    
    // Test if the image can be loaded
    setIsTestingUrl(true);
    setUrlInputStatus('loading');
    setUrlInputMessage('Testing image URL...');
    
    return new Promise<boolean>((resolve) => {
      const img = new Image();
      let timeoutId: NodeJS.Timeout;
      
      img.onload = () => {
        setIsTestingUrl(false);
        setErrors(prev => ({ ...prev, imageUrl: undefined }));
        setUrlInputStatus('success');
        setUrlInputMessage('Image URL is valid');
        clearTimeout(timeoutId);
        resolve(true);
      };
      
      img.onerror = () => {
        setIsTestingUrl(false);
        setErrors(prev => ({ ...prev, imageUrl: 'Could not load image from URL' }));
        setUrlInputStatus('error');
        setUrlInputMessage('Could not load image from this URL. The server may block direct access.');
        clearTimeout(timeoutId);
        resolve(false);
      };
      
      // Add crossorigin attribute to handle CORS issues
      img.crossOrigin = 'anonymous';
      img.src = url;
      
      // Set a timeout in case the image takes too long to load
      timeoutId = setTimeout(() => {
        if (img.complete) return;
        
        setIsTestingUrl(false);
        setErrors(prev => ({ ...prev, imageUrl: 'Image loading timed out' }));
        setUrlInputStatus('error');
        setUrlInputMessage('Image loading timed out. The URL may still work on the server.');
        resolve(true); // Allow it anyway, the server will handle it
      }, 10000);
    });
  };

  const handleAddImageUrl = async () => {
    if (!imageUrl.trim()) return;
    
    // Sanitize URL - remove query parameters if needed
    let sanitizedUrl = imageUrl.trim();
    
    // Basic URL validation
    try {
      new URL(sanitizedUrl);
    } catch (e) {
      setErrors(prev => ({ ...prev, imageUrl: 'Please enter a valid URL' }));
      setUrlInputStatus('error');
      setUrlInputMessage('Invalid URL format');
      return;
    }
    
    const isValid = await testImageUrl(sanitizedUrl);
    if (!isValid) return;
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, {
        url: sanitizedUrl,
        isMain: prev.images.length === 0
      }]
    }));
    
    // Reset the input and status
    setImageUrl('');
    setUrlInputStatus('idle');
    setUrlInputMessage('');
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProductFormData | 'imageUrl', string>> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.category) newErrors.category = 'Category is required';
    if (formData.sizes.length === 0) newErrors.sizes = 'At least one size is required';
    if (formData.images.length === 0) newErrors.images = 'At least one image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    // If we have files to upload, process them first
    if (uploadedFiles.length > 0) {
      try {
        const uploadedImages = await productService.uploadProductImages(uploadedFiles);
        
        // Update the formData with the uploaded image paths
        const updatedImages = formData.images.map(image => {
          if (image.file) {
            // Find the corresponding uploaded file
            const uploadedFile = uploadedImages.find(
              uploaded => uploaded.filename === image.file?.name || 
                         uploaded.mimetype === image.file?.type
            );
            
            if (uploadedFile) {
              // Return the image with the server path instead of the data URL
              return {
                ...image,
                url: uploadedFile.path,
                file: undefined // Remove the file reference as it's now uploaded
              };
            }
          }
          return image;
        });
        
        // Submit the form with the updated images
        onSubmit({
          ...formData,
          images: updatedImages
        });
      } catch (error) {
        console.error('Error uploading images:', error);
        setErrors(prev => ({ ...prev, images: 'Failed to upload images. Please try again.' }));
      }
    } else {
      // No files to upload, just submit the form as is
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-4 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Basic Info */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              } focus:border-black focus:ring-black`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              } focus:border-black focus:ring-black`}
            />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                } focus:border-black focus:ring-black`}
              />
              {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                } focus:border-black focus:ring-black`}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map(category => (
                  <option key={category} value={category.toLowerCase()}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
            </div>
          </div>
        </div>

        {/* Right Column - Sizes and Images */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sizes and Quantities</label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {AVAILABLE_SIZES.map(size => (
                <div key={size} className="flex flex-col space-y-1 p-2 border rounded-md">
                  <label className="text-sm font-medium text-gray-700">{size}</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.sizes.find(s => s.size === size)?.quantity || 0}
                    onChange={(e) => handleSizeChange(size, parseInt(e.target.value))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                  />
                </div>
              ))}
            </div>
            {errors.sizes && <p className="mt-1 text-sm text-red-500">{errors.sizes}</p>}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Images</label>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setUseUrlUpload(!useUrlUpload);
                    setUrlInputStatus('idle');
                    setUrlInputMessage('');
                  }}
                  className="inline-flex items-center text-sm text-gray-700 hover:text-black"
                >
                  {useUrlUpload ? (
                    <>
                      <ToggleRight className="w-5 h-5 mr-1 text-black" />
                      URL Mode
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-5 h-5 mr-1 text-gray-400" />
                      File Mode
                    </>
                  )}
                </button>
                {useUrlUpload && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowImageUrlInput(!showImageUrlInput);
                      setUrlInputStatus('idle');
                      setUrlInputMessage('');
                    }}
                    className="inline-flex items-center text-sm text-gray-700 hover:text-black"
                  >
                    <LinkIcon className="w-4 h-4 mr-1" />
                    {showImageUrlInput ? 'Hide URL Input' : 'Add Image URL'}
                  </button>
                )}
              </div>
            </div>

            {useUrlUpload && showImageUrlInput && (
              <div className="mb-4 space-y-2">
                <div className="flex">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      if (urlInputStatus !== 'idle') {
                        setUrlInputStatus('idle');
                        setUrlInputMessage('');
                      }
                    }}
                    placeholder="Enter image URL"
                    className={`flex-grow rounded-l-md border ${
                      urlInputStatus === 'error' ? 'border-red-500' : 
                      urlInputStatus === 'success' ? 'border-green-500' : 'border-gray-300'
                    } shadow-sm focus:border-black focus:ring-black sm:text-sm`}
                    disabled={isTestingUrl}
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    disabled={isTestingUrl || !imageUrl.trim()}
                    className="bg-black text-white px-3 py-2 rounded-r-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isTestingUrl ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {urlInputMessage && (
                  <p className={`text-sm ${
                    urlInputStatus === 'error' ? 'text-red-500' : 
                    urlInputStatus === 'success' ? 'text-green-500' : 'text-gray-500'
                  }`}>
                    {urlInputMessage}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Tip: Enter a direct URL to an image (e.g., ending with .jpg, .png, etc.)
                </p>
              </div>
            )}

            {!useUrlUpload && (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-black bg-gray-50' : 'border-gray-300'
                }`}
              >
                <input {...getInputProps()} />
                <div className="space-y-2">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    {isDragActive
                      ? 'Drop the images here...'
                      : 'Drag & drop images here, or click to select files'}
                  </p>
                  <p className="text-xs text-gray-500">Supports: PNG, JPG, JPEG, WebP</p>
                </div>
              </div>
            )}
            {errors.images && <p className="mt-1 text-sm text-red-500">{errors.images}</p>}

            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {formData.images.map((image, index) => (
                <div key={index} className="relative group aspect-square">
                  <img
                    src={image.url}
                    alt={`Product ${index + 1}`}
                    className={`w-full h-full object-cover rounded-md ${
                      image.isMain ? 'ring-2 ring-black' : ''
                    }`}
                    onError={(e) => {
                      // Handle image loading errors
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Image+Error';
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setMainImage(index)}
                      className="text-white bg-black bg-opacity-50 p-2 rounded-md hover:bg-opacity-75 transition-colors"
                    >
                      {image.isMain ? 'Main Image' : 'Set as Main'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleImageRemove(index)}
                      className="text-white bg-red-500 bg-opacity-50 p-2 rounded-md hover:bg-opacity-75 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </form>
  );
};
