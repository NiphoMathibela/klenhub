const express = require('express');
const { check } = require('express-validator');
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct } = require('../controllers/products');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProduct);

router.post('/', [
  protect,
  authorize('admin'),
  check('name', 'Name is required').not().isEmpty(),
  check('price', 'Price must be a positive number').isFloat({ min: 0 }),
  check('stock', 'Stock must be a positive number').isInt({ min: 0 })
], createProduct);

router.put('/:id', [
  protect,
  authorize('admin'),
  check('name', 'Name is required').optional().not().isEmpty(),
  check('price', 'Price must be a positive number').optional().isFloat({ min: 0 }),
  check('stock', 'Stock must be a positive number').optional().isInt({ min: 0 })
], updateProduct);

router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;
