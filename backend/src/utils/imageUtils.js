const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const https = require('https');
const http = require('http');

/**
 * Downloads an image from a URL and saves it to the file system
 * @param {string} url - The URL of the image to download
 * @returns {Promise<string>} - The local path to the saved image
 */
const downloadImage = async (url) => {
  return new Promise((resolve, reject) => {
    // Determine if it's http or https
    const client = url.startsWith('https') ? https : http;
    
    // Create the uploads/products directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../../uploads');
    const productImagesDir = path.join(uploadDir, 'products');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    
    if (!fs.existsSync(productImagesDir)) {
      fs.mkdirSync(productImagesDir);
    }
    
    // Generate a unique filename
    const urlWithoutParams = url.split('?')[0]; // Remove query parameters
    const filename = `${uuidv4()}${path.extname(urlWithoutParams) || '.jpg'}`;
    const filePath = path.join(productImagesDir, filename);
    
    // Create a write stream
    const fileStream = fs.createWriteStream(filePath);
    
    // Set request options with headers to mimic a browser request
    const requestUrl = new URL(url);
    const options = {
      hostname: requestUrl.hostname,
      path: requestUrl.pathname + requestUrl.search,
      protocol: requestUrl.protocol,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://klenhub.com/'
      }
    };
    
    // Download the image
    const request = client.get(options, (response) => {
      // Check if the response is valid
      if (response.statusCode !== 200) {
        // If we get a redirect, follow it
        if (response.statusCode === 301 || response.statusCode === 302) {
          if (response.headers.location) {
            // Clean up the file stream
            fileStream.close();
            fs.unlinkSync(filePath);
            
            // Try downloading from the new location
            // Handle relative URLs in redirects
            let redirectUrl = response.headers.location;
            if (redirectUrl.startsWith('/')) {
              // It's a relative URL, construct the absolute URL
              redirectUrl = `${requestUrl.protocol}//${requestUrl.hostname}${redirectUrl}`;
            }
            
            downloadImage(redirectUrl)
              .then(resolve)
              .catch(reject);
            return;
          }
        }
        
        // Otherwise, report the error
        fileStream.close();
        fs.unlinkSync(filePath);
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }
      
      // Check if the response is actually an image
      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.startsWith('image/')) {
        fileStream.close();
        fs.unlinkSync(filePath);
        reject(new Error('URL does not point to an image'));
        return;
      }
      
      // Pipe the response to the file
      response.pipe(fileStream);
      
      // Handle errors
      fileStream.on('error', (err) => {
        fileStream.close();
        fs.unlinkSync(filePath);
        reject(err);
      });
      
      // Handle request errors
      request.on('error', (err) => {
        console.error('Error downloading image:', err.message, 'URL:', url);
        fileStream.close();
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (unlinkErr) {
          console.error('Error removing file after download failure:', unlinkErr);
        }
        reject(err);
      });
      
      // When the download is complete
      fileStream.on('finish', () => {
        fileStream.close();
        // Return the relative path to the image (for storing in the database)
        resolve(`/uploads/products/${filename}`);
      });
    });
    
    // Set a timeout for the request
    request.setTimeout(10000, () => {
      request.abort();
      fileStream.close();
      fs.unlinkSync(filePath);
      reject(new Error('Request timeout'));
    });
  });
};

/**
 * Processes an image URL or file and returns a local path
 * @param {Object} image - The image object with url or file properties
 * @returns {Promise<string>} - The local path to the image
 */
const processImage = async (image) => {
  try {
    console.log('Processing image in imageUtils:', image);
    
    // If it's a URL-based image (not a data URL)
    if (image.url && !image.file && !image.url.startsWith('data:')) {
      console.log('Processing URL-based image:', image.url);
      
      // If the URL is already a local path (from our server)
      if (image.url.startsWith('/uploads/')) {
        return image.url;
      }
      
      // Validate URL format
      try {
        new URL(image.url);
      } catch (error) {
        console.error('Invalid URL format:', image.url);
        return '/uploads/products/placeholder.jpg';
      }
      
      // If the URL is an external URL, store it directly
      if (image.url.startsWith('http://') || image.url.startsWith('https://')) {
        console.log('Using external URL directly:', image.url);
        return image.url; // Return the URL as is, without downloading
      }
      
      try {
        // Download the image from the URL (for non-http/https URLs or backward compatibility)
        const result = await downloadImage(image.url);
        console.log('Image downloaded successfully:', result);
        return result;
      } catch (error) {
        console.error('Error downloading image:', error.message, 'URL:', image.url);
        // If we can't download the image, use a placeholder
        return '/uploads/products/placeholder.jpg';
      }
    }
    
    // If it's a file upload (already processed by multer)
    if (image.file) {
      console.log('Processing file upload:', image.file.filename);
      // The file path is already set by multer
      return `/uploads/products/${image.file.filename}`;
    }
    
    // If it's a data URL, we don't support this anymore
    if (image.url && image.url.startsWith('data:')) {
      console.error('Data URLs are no longer supported');
      throw new Error('Data URLs are no longer supported. Please use file uploads or external URLs.');
    }
    
    console.error('Invalid image format:', image);
    throw new Error('Invalid image format');
  } catch (error) {
    console.error('Error processing image:', error.message);
    throw error;
  }
};

// Create a placeholder image if it doesn't exist
const createPlaceholder = () => {
  const uploadDir = path.join(__dirname, '../../uploads');
  const productImagesDir = path.join(uploadDir, 'products');
  const placeholderPath = path.join(productImagesDir, 'placeholder.jpg');
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }
  
  if (!fs.existsSync(productImagesDir)) {
    fs.mkdirSync(productImagesDir);
  }
  
  if (!fs.existsSync(placeholderPath)) {
    // Create a simple placeholder image (1x1 pixel transparent PNG)
    const placeholderData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
    fs.writeFileSync(placeholderPath, placeholderData);
  }
};

// Create placeholder on module load
createPlaceholder();

module.exports = {
  downloadImage,
  processImage
};
