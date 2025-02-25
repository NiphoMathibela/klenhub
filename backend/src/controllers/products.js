const Product = require('../models/Product');
const ProductSize = require('../models/ProductSize');
const ProductImage = require('../models/ProductImage');

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
      await Promise.all(
        images.map((image, index) => ProductImage.create({
          productId: product.id,
          imageUrl: image.url,
          isMain: index === 0 // First image is main by default
        }))
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

    // Update main product info
    await product.update({
      name: name || product.name,
      description: description || product.description,
      price: price || product.price,
      category: category || product.category
    });

    // Update sizes if provided
    if (sizes) {
      // Remove existing sizes
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
    if (images) {
      // Remove existing images
      await ProductImage.destroy({ where: { productId: product.id } });
      
      // Add new images
      await Promise.all(
        images.map((image, index) => ProductImage.create({
          productId: product.id,
          imageUrl: image.url,
          isMain: index === 0 // First image is main by default
        }))
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
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // This will also delete associated sizes and images due to CASCADE
    await product.destroy();

    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: {
        category: req.params.category
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
      ]
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
