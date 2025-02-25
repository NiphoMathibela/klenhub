const Product = require('../models/Product');

// Get all products
exports.getProducts = async (req, res) => {
  try {
    console.log('Fetching all products');
    const products = await Product.findAll();
    console.log(`Found ${products.length} products`);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Error fetching products' });
  }
};

// Get single product
exports.getProduct = async (req, res) => {
  try {
    console.log('Fetching product with ID:', req.params.id);
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      console.log('Product not found:', req.params.id);
      return res.status(404).json({ error: 'Product not found' });
    }

    console.log('Product found:', product.id);
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Error fetching product' });
  }
};

// Create product
exports.createProduct = async (req, res) => {
  try {
    console.log('Creating new product:', req.body);
    const { name, description, price, category, imageUrl, stock } = req.body;

    // Validation
    if (!name || !description || !price || !category) {
      console.log('Missing required fields');
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      imageUrl,
      stock: stock || 0
    });

    console.log('Product created successfully:', product.id);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Error creating product' });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    console.log('Updating product:', req.params.id, req.body);
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      console.log('Product not found for update:', req.params.id);
      return res.status(404).json({ error: 'Product not found' });
    }

    const { name, description, price, category, imageUrl, stock } = req.body;

    await product.update({
      name: name || product.name,
      description: description || product.description,
      price: price || product.price,
      category: category || product.category,
      imageUrl: imageUrl || product.imageUrl,
      stock: stock !== undefined ? stock : product.stock
    });

    console.log('Product updated successfully:', product.id);
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Error updating product' });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    console.log('Deleting product:', req.params.id);
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      console.log('Product not found for deletion:', req.params.id);
      return res.status(404).json({ error: 'Product not found' });
    }

    await product.destroy();
    console.log('Product deleted successfully:', req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Error deleting product' });
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    console.log('Fetching products by category:', category);
    
    const products = await Product.findAll({
      where: { category }
    });

    console.log(`Found ${products.length} products in category:`, category);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ error: 'Error fetching products by category' });
  }
};
