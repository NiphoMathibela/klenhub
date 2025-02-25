import React, { useState } from 'react';
import { X } from 'lucide-react';

interface Size {
  size: string;
  quantity: number;
}

interface Image {
  url: string;
  isMain: boolean;
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : value
    }));
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

  const handleImageAdd = (url: string) => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, { url, isMain: prev.images.length === 0 }]
    }));
  };

  const handleImageRemove = (index: number) => {
    setFormData(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      // If we removed the main image, make the first remaining image the main one
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Price</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          required
          min="0"
          step="0.01"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
        >
          <option value="">Select a category</option>
          {CATEGORIES.map(category => (
            <option key={category} value={category.toLowerCase()}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Sizes and Quantities</label>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {AVAILABLE_SIZES.map(size => (
            <div key={size} className="flex flex-col space-y-1">
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
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="url"
              placeholder="Enter image URL"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const input = e.target as HTMLInputElement;
                  handleImageAdd(input.value);
                  input.value = '';
                }
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {formData.images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.url}
                  alt={`Product ${index + 1}`}
                  className={`w-full h-32 object-cover rounded-md ${
                    image.isMain ? 'ring-2 ring-black' : ''
                  }`}
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setMainImage(index)}
                    className="text-white bg-black bg-opacity-50 p-1 rounded-md hover:bg-opacity-75"
                  >
                    Set as Main
                  </button>
                  <button
                    type="button"
                    onClick={() => handleImageRemove(index)}
                    className="text-white bg-red-500 bg-opacity-50 p-1 rounded-md hover:bg-opacity-75"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </form>
  );
};
