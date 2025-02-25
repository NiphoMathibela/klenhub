const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  imageUrl: {
    type: DataTypes.STRING
  },
  category: {
    type: DataTypes.STRING
  },
  sizes: {
    type: DataTypes.JSON,
    defaultValue: ['S', 'M', 'L', 'XL']
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

module.exports = Product;
