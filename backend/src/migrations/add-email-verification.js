const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');

/**
 * Migration script to add email verification fields to User table
 * and create the Token table if it doesn't exist
 */
async function runMigration() {
  const transaction = await sequelize.transaction();

  try {
    console.log('Starting migration...');

    // Check if isEmailVerified column exists in Users table
    const [userColumns] = await sequelize.query(
      "SHOW COLUMNS FROM Users LIKE 'isEmailVerified'",
      { type: QueryTypes.SELECT, transaction }
    );

    if (!userColumns) {
      console.log('Adding isEmailVerified column to Users table...');
      await sequelize.query(
        "ALTER TABLE Users ADD COLUMN isEmailVerified BOOLEAN DEFAULT false",
        { transaction }
      );
    } else {
      console.log('isEmailVerified column already exists in Users table');
    }

    // Check if lastLogin column exists in Users table
    const [lastLoginColumn] = await sequelize.query(
      "SHOW COLUMNS FROM Users LIKE 'lastLogin'",
      { type: QueryTypes.SELECT, transaction }
    );

    if (!lastLoginColumn) {
      console.log('Adding lastLogin column to Users table...');
      await sequelize.query(
        "ALTER TABLE Users ADD COLUMN lastLogin DATETIME NULL",
        { transaction }
      );
    } else {
      console.log('lastLogin column already exists in Users table');
    }

    // Check if Tokens table exists
    const [tokenTable] = await sequelize.query(
      "SHOW TABLES LIKE 'Tokens'",
      { type: QueryTypes.SELECT, transaction }
    );

    if (!tokenTable) {
      console.log('Creating Tokens table...');
      await sequelize.query(`
        CREATE TABLE Tokens (
          id VARCHAR(36) PRIMARY KEY,
          userId VARCHAR(36) NOT NULL,
          token VARCHAR(255) NOT NULL,
          type ENUM('password_reset', 'email_verification') NOT NULL,
          expiresAt DATETIME NOT NULL,
          createdAt DATETIME NOT NULL,
          updatedAt DATETIME NOT NULL,
          FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
        )
      `, { transaction });
    } else {
      console.log('Tokens table already exists');
    }

    await transaction.commit();
    console.log('Migration completed successfully!');
  } catch (error) {
    await transaction.rollback();
    console.error('Migration failed:', error);
    throw error;
  }
}

// Run the migration
runMigration()
  .then(() => {
    console.log('Database migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database migration failed:', error);
    process.exit(1);
  });
