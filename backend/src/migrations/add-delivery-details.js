const sequelize = require('../config/database');

async function addDeliveryDetailsColumns() {
  try {
    console.log('Starting migration: Adding delivery details columns to Orders table');
    
    // Add recipientName column
    await sequelize.query(`
      ALTER TABLE Orders 
      ADD COLUMN recipientName VARCHAR(255) NULL
    `);
    console.log('Added recipientName column');
    
    // Add phoneNumber column
    await sequelize.query(`
      ALTER TABLE Orders 
      ADD COLUMN phoneNumber VARCHAR(20) NULL
    `);
    console.log('Added phoneNumber column');
    
    // Add addressLine1 column
    await sequelize.query(`
      ALTER TABLE Orders 
      ADD COLUMN addressLine1 VARCHAR(255) NULL
    `);
    console.log('Added addressLine1 column');
    
    // Add addressLine2 column
    await sequelize.query(`
      ALTER TABLE Orders 
      ADD COLUMN addressLine2 VARCHAR(255) NULL
    `);
    console.log('Added addressLine2 column');
    
    // Add city column
    await sequelize.query(`
      ALTER TABLE Orders 
      ADD COLUMN city VARCHAR(100) NULL
    `);
    console.log('Added city column');
    
    // Add province column
    await sequelize.query(`
      ALTER TABLE Orders 
      ADD COLUMN province VARCHAR(100) NULL
    `);
    console.log('Added province column');
    
    // Add postalCode column
    await sequelize.query(`
      ALTER TABLE Orders 
      ADD COLUMN postalCode VARCHAR(20) NULL
    `);
    console.log('Added postalCode column');
    
    // Add deliveryInstructions column
    await sequelize.query(`
      ALTER TABLE Orders 
      ADD COLUMN deliveryInstructions TEXT NULL
    `);
    console.log('Added deliveryInstructions column');
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  addDeliveryDetailsColumns()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = addDeliveryDetailsColumns;
