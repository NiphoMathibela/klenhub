const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const sequelize = require('./config/database');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Handle password reset redirects
app.get('/reset-password/:token', (req, res) => {
  const { token } = req.params;
  res.redirect(`https://klenhub.co.za/reset-password/${token}`);
});

// Handle email verification redirects from frontend to backend
app.get('/api/auth/verify-email/:token', (req, res) => {
  const { token } = req.params;
  // Redirect to the actual backend API endpoint
  res.redirect(`https://service.klenhub.co.za/api/auth/verify-email/${token}`);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
let server;

// Path to store the server process ID
const PID_FILE_PATH = path.join(__dirname, '..', 'server.pid');

// Graceful shutdown function
const gracefulShutdown = () => {
  console.log('Received shutdown signal. Closing server gracefully...');
  
  // Close the HTTP server
  if (server) {
    server.close(() => {
      console.log('HTTP server closed.');
      
      // Close database connection
      sequelize.close().then(() => {
        console.log('Database connection closed.');
        
        // Remove PID file
        if (fs.existsSync(PID_FILE_PATH)) {
          fs.unlinkSync(PID_FILE_PATH);
          console.log('PID file removed.');
        }
        
        console.log('Server shutdown complete.');
        process.exit(0);
      }).catch(err => {
        console.error('Error closing database connection:', err);
        process.exit(1);
      });
    });
    
    // Force shutdown after timeout if server doesn't close gracefully
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

// Register shutdown handlers
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Sync database and start server
const start = async () => {
  try {
    // Only use force or alter in development, and only when needed
    // For production, use regular sync without altering the schema
    await sequelize.sync();
    console.log('Database connected successfully');
    
    // Create admin user if it doesn't exist
    const User = require('./models/User');
    const adminExists = await User.findOne({ where: { email: 'admin@example.com' } });
    
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin'
      });
      console.log('Admin user created');
    }
    
    // Start the server and save the server instance
    server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      
      // Save the process ID to a file for the shutdown script
      fs.writeFileSync(PID_FILE_PATH, process.pid.toString());
      console.log(`Server PID ${process.pid} saved to ${PID_FILE_PATH}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

start();
