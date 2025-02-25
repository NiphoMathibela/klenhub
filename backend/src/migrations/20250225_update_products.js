const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove columns from Products table
    await queryInterface.removeColumn('Products', 'stock');
    await queryInterface.removeColumn('Products', 'imageUrl');

    // Create ProductSizes table
    await queryInterface.createTable('ProductSizes', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Products',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      size: {
        type: DataTypes.STRING,
        allowNull: false
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // Create ProductImages table
    await queryInterface.createTable('ProductImages', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Products',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: false
      },
      isMain: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop the new tables
    await queryInterface.dropTable('ProductSizes');
    await queryInterface.dropTable('ProductImages');

    // Add back the removed columns
    await queryInterface.addColumn('Products', 'stock', {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
    await queryInterface.addColumn('Products', 'imageUrl', {
      type: DataTypes.STRING,
      allowNull: true
    });
  }
};
