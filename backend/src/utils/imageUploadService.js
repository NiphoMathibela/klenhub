/**
 * Image Upload Service
 * Provides enhanced functionality for handling product image uploads
 */
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { promisify } = require('util');
const imageUtils = require('./imageUtils');

// Promisify fs functions
const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);
const existsAsync = promisify(fs.exists);
const mkdirAsync = promisify(fs.mkdir);

// Define upload paths
const UPLOAD_BASE_PATH = path.join(__dirname, '../../uploads');
const PRODUCT_IMAGES_PATH = path.join(UPLOAD_BASE_PATH, 'products');

/**
 * Ensures the upload directories exist
 * @returns {Promise<void>}
 */
const ensureUploadDirectories = async () => {
  try {
    console.log('Checking upload directories...');
    console.log('UPLOAD_BASE_PATH:', UPLOAD_BASE_PATH);
    console.log('PRODUCT_IMAGES_PATH:', PRODUCT_IMAGES_PATH);
    
    // Check if base upload directory exists
    if (!await existsAsync(UPLOAD_BASE_PATH)) {
      console.log('Base upload directory does not exist, creating it...');
      await mkdirAsync(UPLOAD_BASE_PATH, { recursive: true });
      console.log('Created base upload directory');
    } else {
      console.log('Base upload directory already exists');
    }

    // Check if products directory exists
    if (!await existsAsync(PRODUCT_IMAGES_PATH)) {
      console.log('Products upload directory does not exist, creating it...');
      await mkdirAsync(PRODUCT_IMAGES_PATH, { recursive: true });
      console.log('Created products upload directory');
    } else {
      console.log('Products upload directory already exists');
    }
    
    // List files in the products directory to verify access
    try {
      const files = await fs.promises.readdir(PRODUCT_IMAGES_PATH);
      console.log(`Found ${files.length} files in products directory`);
    } catch (readErr) {
      console.error('Error reading products directory:', readErr);
    }
  } catch (error) {
    console.error('Error ensuring upload directories:', error);
    throw error;
  }
};

/**
 * Saves an uploaded file to the server
 * @param {Object} file - The file object from multer
 * @returns {Promise<Object>} - Object containing file information
 */
const saveUploadedFile = async (file) => {
  try {
    console.log('Saving uploaded file:', file.originalname);
    await ensureUploadDirectories();

    // Generate a unique filename
    const filename = `${uuidv4()}${path.extname(file.originalname)}`;
    const filePath = path.join(PRODUCT_IMAGES_PATH, filename);
    console.log('Generated filename:', filename);
    console.log('Full file path:', filePath);
    
    // Get the API base URL from environment or use the production URL
    const apiBaseUrl = process.env.API_BASE_URL || 'https://service.klenhub.co.za';
    console.log('Using API base URL:', apiBaseUrl);
    
    // If the file is already saved by multer, just return the info
    if (file.path) {
      console.log('File already saved by multer at:', file.path);
      
      // Copy the file to our uploads directory to ensure it's in the right place
      try {
        // Read the file from multer's path
        const fileData = await fs.promises.readFile(file.path);
        // Write it to our uploads directory
        await writeFileAsync(filePath, fileData);
        console.log('Successfully copied file to uploads directory');
        
        // Verify the file exists
        if (await existsAsync(filePath)) {
          console.log('Verified file exists at:', filePath);
        } else {
          console.error('File does not exist after saving:', filePath);
        }
      } catch (copyError) {
        console.error('Error copying file to uploads directory:', copyError);
      }
      
      const fileInfo = {
        filename,
        path: `/uploads/products/${filename}`,
        url: `${apiBaseUrl}/uploads/products/${filename}`,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      };
      
      console.log('Returning file info:', fileInfo);
      return fileInfo;
    }

    // If we have a buffer, save it
    if (file.buffer) {
      console.log('Saving file from buffer, size:', file.buffer.length);
      await writeFileAsync(filePath, file.buffer);
      
      // Verify the file exists
      if (await existsAsync(filePath)) {
        console.log('Verified file exists at:', filePath);
      } else {
        console.error('File does not exist after saving:', filePath);
      }
      
      const fileInfo = {
        filename,
        path: `/uploads/products/${filename}`,
        url: `${apiBaseUrl}/uploads/products/${filename}`,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.buffer.length
      };
      
      console.log('Returning file info:', fileInfo);
      return fileInfo;
    }

    throw new Error('Invalid file object - no path or buffer found');
  } catch (error) {
    console.error('Error saving uploaded file:', error);
    throw error;
  }
};

/**
 * Processes an array of files from a multipart form upload
 * @param {Array} files - Array of file objects from multer
 * @returns {Promise<Array>} - Array of processed file information
 */
const processUploadedFiles = async (files) => {
  try {
    if (!files || files.length === 0) {
      return [];
    }

    // Process each file
    const processedFiles = await Promise.all(
      files.map(async (file) => {
        return await saveUploadedFile(file);
      })
    );

    return processedFiles;
  } catch (error) {
    console.error('Error processing uploaded files:', error);
    throw error;
  }
};

/**
 * Deletes an image file from the server
 * @param {string} imageUrl - The URL or path of the image to delete
 * @returns {Promise<boolean>} - True if deletion was successful
 */
const deleteImage = async (imageUrl) => {
  try {
    // Skip if it's an external URL
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      console.log('Skipping deletion of external URL:', imageUrl);
      return true;
    }

    // Extract the filename from the URL
    const filename = path.basename(imageUrl);
    const filePath = path.join(PRODUCT_IMAGES_PATH, filename);

    // Check if file exists
    if (await existsAsync(filePath)) {
      await unlinkAsync(filePath);
      console.log('Successfully deleted image:', filename);
      return true;
    } else {
      console.warn('Image file not found for deletion:', filePath);
      return false;
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};

/**
 * Creates a database entry for an uploaded image
 * @param {Object} db - Database connection or model
 * @param {number} productId - ID of the product to associate with the image
 * @param {string} imageUrl - URL of the image
 * @param {boolean} isMain - Whether this is the main product image
 * @returns {Promise<Object>} - The created database record
 */
const createImageRecord = async (ProductImage, productId, imageUrl, isMain = false) => {
  try {
    const imageRecord = await ProductImage.create({
      productId,
      imageUrl,
      isMain
    });
    
    return imageRecord;
  } catch (error) {
    console.error('Error creating image record:', error);
    throw error;
  }
};

// Initialize by ensuring directories exist
ensureUploadDirectories().catch(console.error);

module.exports = {
  processUploadedFiles,
  saveUploadedFile,
  deleteImage,
  createImageRecord,
  ensureUploadDirectories
};
