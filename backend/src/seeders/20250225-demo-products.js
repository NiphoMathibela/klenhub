'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add demo products
    const products = await queryInterface.bulkInsert('Products', [
      {
        name: 'Classic White T-Shirt',
        description: 'A comfortable and versatile white t-shirt made from 100% cotton.',
        price: 29.99,
        category: 'T-Shirts',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Black Denim Jeans',
        description: 'Stylish black denim jeans with a modern fit.',
        price: 79.99,
        category: 'Jeans',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Casual Sneakers',
        description: 'Comfortable casual sneakers perfect for everyday wear.',
        price: 89.99,
        category: 'Shoes',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], { returning: true });

    // Add sizes for each product
    const sizes = [];
    products.forEach(product => {
      ['S', 'M', 'L', 'XL'].forEach(size => {
        sizes.push({
          productId: product.id,
          size: size,
          quantity: Math.floor(Math.random() * 20),
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });
    });

    await queryInterface.bulkInsert('ProductSizes', sizes);

    // Add images for each product
    const images = [
      {
        productId: products[0].id,
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
        isMain: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        productId: products[0].id,
        imageUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800',
        isMain: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        productId: products[1].id,
        imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800',
        isMain: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        productId: products[2].id,
        imageUrl: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800',
        isMain: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('ProductImages', images);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('ProductImages', null, {});
    await queryInterface.bulkDelete('ProductSizes', null, {});
    await queryInterface.bulkDelete('Products', null, {});
  }
};
