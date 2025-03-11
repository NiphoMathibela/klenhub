const { Order, OrderItem } = require('../models/Order');
const Product = require('../models/Product');
const { validationResult } = require('express-validator');

exports.createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      items, 
      total, 
      // Delivery details
      recipientName,
      phoneNumber,
      addressLine1,
      addressLine2,
      city,
      province,
      postalCode,
      deliveryInstructions
    } = req.body;

    const order = await Order.create({
      userId: req.user.id,
      total,
      // Add delivery details to order
      recipientName,
      phoneNumber,
      addressLine1,
      addressLine2,
      city,
      province,
      postalCode,
      deliveryInstructions
    });

    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        await order.destroy();
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }

      if (product.stock < item.quantity) {
        await order.destroy();
        return res.status(400).json({ error: `Insufficient stock for product ${product.name}` });
      }

      await OrderItem.create({
        OrderId: order.id,
        ProductId: item.productId,
        quantity: item.quantity,
        size: item.size,
        price: product.price
      });

      // Stock will be reduced after payment confirmation
      // await product.update({ stock: product.stock - item.quantity });
    }

    const completeOrder = await Order.findByPk(order.id, {
      include: [{ 
        model: OrderItem,
        include: [Product]
      }]
    });

    res.status(201).json(completeOrder);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [{ 
        model: OrderItem,
        include: [Product]
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ 
        model: OrderItem,
        include: [Product]
      }]
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user is admin or the order belongs to the user
    if (req.user.role !== 'admin' && order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to access this order' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get orders for the current user
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [{ 
        model: OrderItem,
        include: [Product]
      }],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(orders);
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update tracking number - admin only
exports.updateTrackingNumber = async (req, res) => {
  try {
    const { trackingNumber } = req.body;
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.trackingNumber = trackingNumber;
    await order.save();

    res.json(order);
  } catch (error) {
    console.error('Update tracking number error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
