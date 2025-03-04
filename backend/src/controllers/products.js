const Product = require('../models/Product');
const ProductSize = require('../models/ProductSize');
const ProductImage = require('../models/ProductImage');
const sequelize = require('../config/database'); // Fixed import path
const { Op } = require('sequelize');

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        {
          model: ProductSize,
          as: 'sizes'
        },
        {
          model: ProductImage,
          as: 'images'
        }
      ]
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get single product
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: ProductSize,
          as: 'sizes'
        },
        {
          model: ProductImage,
          as: 'images'
        }
      ]
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Create product
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, sizes, images } = req.body;

    // Validation
    if (!name || !description || !price || !category) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    // Create product
    const product = await Product.create({
      name,
      description,
      price,
      category
    });

    // Add sizes if provided
    if (sizes && sizes.length > 0) {
      await Promise.all(
        sizes.map(size => ProductSize.create({
          productId: product.id,
          size: size.size,
          quantity: size.quantity
        }))
      );
    }

    // Add images if provided
    if (images && images.length > 0) {
      const { processImage } = require('../utils/imageUtils');
      
      await Promise.all(
        images.map(async (image, index) => {
          try {
            console.log('Processing image:', image);
            
            // Process the image (either URL or file)
            let imageUrl;
            
            if (image.path) {
              // Already processed by multer
              imageUrl = image.path;
            } else {
              // URL-based image that needs processing
              imageUrl = await processImage(image);
              console.log('Image processed successfully:', imageUrl);
            }
            
            // Save the image URL to the database
            await ProductImage.create({
              productId: product.id,
              imageUrl: imageUrl,
              isMain: index === 0 // First image is main by default
            });
          } catch (error) {
            console.error('Error processing image:', error.message);
            console.error('Image data:', JSON.stringify(image));
            // Continue with other images even if one fails
          }
        })
      );
    }

    // Fetch the complete product with its associations
    const completeProduct = await Product.findByPk(product.id, {
      include: [
        {
          model: ProductSize,
          as: 'sizes'
        },
        {
          model: ProductImage,
          as: 'images'
        }
      ]
    });

    res.status(201).json(completeProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, sizes, images } = req.body;
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Update basic product info
    await product.update({
      name: name || product.name,
      description: description || product.description,
      price: price || product.price,
      category: category || product.category
    });

    // Update sizes if provided
    if (sizes && sizes.length > 0) {
      // Delete existing sizes
      await ProductSize.destroy({ where: { productId: product.id } });

      // Add new sizes
      await Promise.all(
        sizes.map(size => ProductSize.create({
          productId: product.id,
          size: size.size,
          quantity: size.quantity
        }))
      );
    }

    // Update images if provided
    if (images && images.length > 0) {
      const { processImage } = require('../utils/imageUtils');
      
      // Get existing images
      const existingImages = await ProductImage.findAll({
        where: { productId: product.id }
      });
      
      // Get existing image URLs to avoid re-downloading
      const existingImageUrls = existingImages.map(img => img.imageUrl);
      
      // Delete existing images if they're not in the new set
      await Promise.all(
        existingImages.map(async (img) => {
          const isInNewSet = images.some(newImg => 
            (newImg.id && newImg.id === img.id) || 
            (newImg.path && newImg.path === img.imageUrl) ||
            (newImg.url && newImg.url === img.imageUrl)
          );
          
          if (!isInNewSet) {
            // If the image is stored on the server, delete the file
            if (img.imageUrl.startsWith('/uploads/')) {
              try {
                const fs = require('fs');
                const path = require('path');
                const filePath = path.join(__dirname, '../..', img.imageUrl);
                if (fs.existsSync(filePath)) {
                  fs.unlinkSync(filePath);
                }
              } catch (err) {
                console.error('Error deleting image file:', err);
                // Continue even if file deletion fails
              }
            }
            
            // Delete the database record
            await img.destroy();
          }
        })
      );
      
      // Add or update images
      await Promise.all(
        images.map(async (image, index) => {
          try {
            // If the image already exists in the database
            if (image.id) {
              const existingImage = existingImages.find(img => img.id === image.id);
              if (existingImage) {
                await existingImage.update({
                  isMain: image.isMain || index === 0
                });
                return;
              }
            }
            
            // If it's a new image with a path (already uploaded)
            if (image.path) {
              await ProductImage.create({
                productId: product.id,
                imageUrl: image.path,
                isMain: image.isMain || index === 0
              });
              return;
            }
            
            // If it's a URL that's already in our database
            if (image.url && existingImageUrls.includes(image.url)) {
              const existingImage = existingImages.find(img => img.imageUrl === image.url);
              if (existingImage) {
                await existingImage.update({
                  isMain: image.isMain || index === 0
                });
                return;
              }
            }
            
            // Otherwise, process the new image
            const imageUrl = await processImage(image);
            
            await ProductImage.create({
              productId: product.id,
              imageUrl: imageUrl,
              isMain: image.isMain || index === 0
            });
          } catch (error) {
            console.error('Error processing image during update:', error);
            // Continue with other images even if one fails
          }
        })
      );
    }

    // Fetch the updated product with its associations
    const updatedProduct = await Product.findByPk(product.id, {
      include: [
        {
          model: ProductSize,
          as: 'sizes'
        },
        {
          model: ProductImage,
          as: 'images'
        }
      ]
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: ProductImage,
          as: 'images'
        }
      ]
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Delete associated image files from the server
    if (product.images && product.images.length > 0) {
      const fs = require('fs');
      const path = require('path');
      
      product.images.forEach(image => {
        if (image.imageUrl.startsWith('/uploads/')) {
          try {
            const filePath = path.join(__dirname, '../..', image.imageUrl);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          } catch (err) {
            console.error('Error deleting image file:', err);
            // Continue even if file deletion fails
          }
        }
      });
    }

    // Delete the product (this will cascade delete associated records)
    await product.destroy();

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    // Convert category to lowercase and handle special cases
    let normalizedCategory = category.toLowerCase();
    
    // Special handling for category filtering
    const whereClause = {};
    
    // If not 'all', add category filter
    if (normalizedCategory !== 'all') {
      whereClause.category = sequelize.where(
        sequelize.fn('LOWER', sequelize.col('category')),
        normalizedCategory
      );
    }

    const products = await Product.findAll({
      where: whereClause,
      include: [
        {
          model: ProductSize,
          as: 'sizes'
        },
        {
          model: ProductImage,
          as: 'images'
        }
      ],
      order: [['createdAt', 'DESC']] // Newest first by default
    });

    // Return empty array instead of 404 for no products
    res.json(products);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Search products
exports.searchProducts = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const products = await Product.findAll({
      where: {
        [Op.or]: [
          {
            name: {
              [Op.like]: `%${query}%`
            }
          },
          {
            description: {
              [Op.like]: `%${query}%`
            }
          },
          {
            category: {
              [Op.like]: `%${query}%`
            }
          }
        ]
      },
      include: [
        {
          model: ProductSize,
          as: 'sizes'
        },
        {
          model: ProductImage,
          as: 'images'
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(products);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Handle product image uploads
exports.uploadProductImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Transform the files to include URLs
    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      path: `/uploads/products/${file.filename}`,
      mimetype: file.mimetype,
      size: file.size
    }));

    res.status(200).json(uploadedFiles);
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
