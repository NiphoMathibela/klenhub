const { Order, OrderItem } = require('../models/Order');
const Product = require('../models/Product');
const { validationResult } = require('express-validator');

exports.createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, total } = req.body;

    const order = await Order.create({
      userId: req.user.id,
      total
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

      await product.update({ stock: product.stock - item.quantity });
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
      where: { userId: req.user.id },
      include: [{ 
        model: OrderItem,
        include: [Product]
      }]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { 
        id: req.params.id,
        userId: req.user.id
      },
      include: [{ 
        model: OrderItem,
        include: [Product]
      }]
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = req.body.status;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
