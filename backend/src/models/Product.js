const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const ProductSize = require('./ProductSize');
const ProductImage = require('./ProductImage');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    get() {
      const rawValue = this.getDataValue('price');
      return rawValue ? parseFloat(rawValue) : null;
    }
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true
});

// Define associations
Product.hasMany(ProductSize, {
  foreignKey: 'productId',
  as: 'sizes'
});

Product.hasMany(ProductImage, {
  foreignKey: 'productId',
  as: 'images'
});

ProductSize.belongsTo(Product, {
  foreignKey: 'productId'
});

ProductImage.belongsTo(Product, {
  foreignKey: 'productId'
});

module.exports = Product;
