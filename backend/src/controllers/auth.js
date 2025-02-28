const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { createToken, verifyToken, deleteToken } = require('../utils/token');
const { sendEmail } = require('../utils/email');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

exports.register = async (req, res) => {
  try {
    console.log('Registration attempt:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Registration validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      console.log('Registration failed: Email already exists:', email);
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password
    });

    // Create verification token
    const verificationToken = await createToken(user.id, 'email_verification', 48);
    
    // Send verification email
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verificationToken.token}`;
    
    await sendEmail({
      to: user.email,
      subject: 'KlenHub - Verify Your Email',
      html: `
        <h1>Welcome to KlenHub!</h1>
        <p>Thank you for registering. Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}" style="padding: 10px 15px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>This link will expire in 48 hours.</p>
        <p>If you did not register for a KlenHub account, please ignore this email.</p>
      `
    });

    const token = generateToken(user.id);
    console.log('User registered successfully:', { id: user.id, email: user.email, role: user.role });

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login time
    await user.update({ lastLogin: new Date() });

    const token = generateToken(user.id);

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    const tokenRecord = await verifyToken(token, 'email_verification');
    if (!tokenRecord) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    
    const user = await User.findByPk(tokenRecord.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update user verification status
    await user.update({ isEmailVerified: true });
    
    // Delete the token
    await deleteToken(tokenRecord.id);
    
    // Redirect to frontend verification success page
    res.redirect(`${req.protocol}://${req.get('host').replace('3000', '5173')}/email-verified`);
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'No user with that email' });
    }
    
    // Create password reset token
    const resetToken = await createToken(user.id, 'password_reset', 1); // 1 hour expiry
    
    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host').replace('3000', '5173')}/reset-password/${resetToken.token}`;
    
    // Send email
    await sendEmail({
      to: user.email,
      subject: 'KlenHub - Password Reset',
      html: `
        <h1>Password Reset Request</h1>
        <p>You requested a password reset. Please click the link below to reset your password:</p>
        <a href="${resetUrl}" style="padding: 10px 15px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
      `
    });
    
    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    const tokenRecord = await verifyToken(token, 'password_reset');
    if (!tokenRecord) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    
    const user = await User.findByPk(tokenRecord.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update password
    await user.update({ password });
    
    // Delete the token
    await deleteToken(tokenRecord.id);
    
    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.resendVerificationEmail = async (req, res) => {
  try {
    // User must be logged in
    const user = await User.findByPk(req.user.id);
    
    if (user.isEmailVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }
    
    // Create verification token
    const verificationToken = await createToken(user.id, 'email_verification', 48);
    
    // Send verification email
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verificationToken.token}`;
    
    await sendEmail({
      to: user.email,
      subject: 'KlenHub - Verify Your Email',
      html: `
        <h1>Welcome to KlenHub!</h1>
        <p>Thank you for registering. Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}" style="padding: 10px 15px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>This link will expire in 48 hours.</p>
        <p>If you did not register for a KlenHub account, please ignore this email.</p>
      `
    });
    
    res.status(200).json({ message: 'Verification email sent' });
  } catch (error) {
    console.error('Resend verification email error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
