const { Order, OrderItem } = require('../models/Order');
const Product = require('../models/Product');
const yocoService = require('../services/yoco');

/**
 * Initialize a YOCO payment for an order
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.createPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    console.log(`Creating payment for order: ${orderId}`);
    
    // Get the order
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    console.log(`Order found: ${order.id}, Total: ${order.total}, Type: ${typeof order.total}`);
    
    // Check if order belongs to the user
    if (order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to access this order' });
    }
    
    // Convert order to plain object to ensure proper data handling
    const orderData = order.get({ plain: true });
    console.log(`Order data prepared: ${JSON.stringify(orderData)}`);
    
    // Initialize YOCO payment
    console.log('Sending order data to YOCO service:', JSON.stringify(orderData));
    console.log('User data for YOCO:', JSON.stringify(req.user));
    
    const payment = await yocoService.initializePayment(orderData, req.user);
    console.log(`Payment initialized, redirecting to: ${payment.authorizationUrl}`);
    
    // Update order status
    await order.update({ 
      status: 'pending',
      paymentReference: payment.reference 
    });
    
    res.json({
      success: true,
      redirectUrl: payment.authorizationUrl,
      reference: payment.reference
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Charge a YOCO payment using a payment token
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.chargePayment = async (req, res) => {
  try {
    const { token, orderId } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Payment token is required' });
    }
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    // Get the order
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if order belongs to the user
    if (order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to access this order' });
    }

    // Convert order total to cents
    const amountInCents = Math.round(parseFloat(order.total) * 100);

    // Create charge metadata
    const metadata = {
      order_id: order.id,
      customer_name: req.user.name || "Customer",
      customer_email: req.user.email
    };

    // Create charge using YOCO service
    const charge = await yocoService.createCharge(token, amountInCents, metadata);

    if (charge.status !== 'successful') {
      return res.status(400).json({ error: 'Payment was not successful' });
    }

    // Update order status and payment reference
    await order.update({
      status: 'processing',
      paymentReference: charge.chargeId
    });

    // Reduce stock for each item in the order
    const orderItems = await order.getOrderItems({ include: [Product] });
    for (const item of orderItems) {
      if (item.Product) {
        try {
          const product = await Product.findByPk(item.productId, {
            include: [{
              model: require('../models/ProductSize'),
              as: 'sizes'
            }]
          });

          if (product && product.sizes) {
            const sizeItem = product.sizes.find(s => s.size === item.size);
            if (sizeItem) {
              const newQuantity = Math.max(0, sizeItem.quantity - item.quantity);
              await sizeItem.update({ quantity: newQuantity });
            }
          }
        } catch (sizeError) {
          console.error(`Error updating stock for product ${item.productId}, size ${item.size}:`, sizeError);
        }
      }
    }

    res.json({
      success: true,
      message: 'Payment successful and order processed',
      orderId: order.id,
      chargeId: charge.chargeId
    });
  } catch (error) {
    console.error('Charge payment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Verify Paystack payment
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.query;
    
    if (!reference) {
      return res.status(400).json({ error: 'Reference is required' });
    }
    
    console.log(`Payment verification request received for reference: ${reference}`);
    
    // Extract the orderId if the reference is in the format order_<orderId>_<timestamp>
    let orderId = reference;
    if (reference.startsWith('order_')) {
      const parts = reference.split('_');
      if (parts.length >= 2) {
        orderId = parts[1];
        console.log(`Extracted orderId from reference: ${orderId}`);
      }
    }
    
    // Find order by orderId first
    let order = await Order.findByPk(orderId, {
      include: [{ 
        model: OrderItem,
        include: [Product]
      }]
    });
    
    if (order) {
      console.log(`Order found directly by ID: ${orderId}`);
    } else {
      // If not found by ID, try by payment reference
      order = await Order.findOne({ 
        where: { paymentReference: reference },
        include: [{ 
          model: OrderItem,
          include: [Product]
        }]
      });
      console.log(`Order lookup by payment reference: ${reference}, Found: ${!!order}`);
    }
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Process the order items to include product details
    if (order.OrderItems && order.OrderItems.length > 0) {
      // Transform OrderItems to match the expected interface in the frontend
      order.items = order.OrderItems.map(item => {
        return {
          id: item.id,
          productId: item.productId,
          name: item.Product ? item.Product.name : 'Unknown Product',
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          imageUrl: item.Product ? item.Product.imageUrl : null
        };
      });
    } else {
      // Set default empty items array if no items exist
      order.items = [];
    }
    
    // Try to verify with YOCO
    let verification = {
      success: false,
      status: 'pending',
      orderId: order.id
    };
    
    try {
      // Attempt to verify, but don't let errors block the process
      verification = await yocoService.verifyPayment(reference);
      console.log(`Paystack verification result:`, verification);
      
      // Update order status based on payment status
      if (verification.status === 'success') {
        await order.update({ status: 'processing' });
        console.log(`Order ${order.id} updated to status: processing`);
        
        // Reduce stock for each item in the order after payment confirmation
        if (order.OrderItems && order.OrderItems.length > 0) {
          console.log(`Reducing stock for ${order.OrderItems.length} items in order ${order.id}`);
          
          for (const item of order.OrderItems) {
            if (item.Product) {
              try {
                // Get the product with its sizes
                const product = await Product.findByPk(item.productId, {
                  include: [{
                    model: require('../models/ProductSize'),
                    as: 'sizes'
                  }]
                });
                
                if (product && product.sizes) {
                  // Find the specific size that was purchased
                  const sizeItem = product.sizes.find(s => s.size === item.size);
                  
                  if (sizeItem) {
                    // Reduce the quantity for this specific size
                    const newQuantity = Math.max(0, sizeItem.quantity - item.quantity);
                    await sizeItem.update({ quantity: newQuantity });
                    console.log(`Reduced stock for product ${product.id}, size ${item.size} from ${sizeItem.quantity} to ${newQuantity}`);
                  } else {
                    console.warn(`Size ${item.size} not found for product ${product.id}`);
                  }
                } else {
                  console.warn(`Product ${item.productId} or its sizes not found`);
                }
              } catch (sizeError) {
                console.error(`Error updating size stock for product ${item.productId}, size ${item.size}:`, sizeError);
              }
            } else {
              console.warn(`Product not found for OrderItem ${item.id}`);
            }
          }
        }
      }
    } catch (verifyError) {
      // Log the verification error but continue processing
      console.error('YOCO verification error, continuing with order processing:', verifyError.message);
    }
    
    // Always return the order, even if verification fails
    res.json({
      success: true,
      order,
      verification
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Handle Paystack webhook
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.handleWebhook = async (req, res) => {
  try {
    // Get signature from headers
    const signature = req.headers['x-yoco-signature'];
    
    // Process webhook event
    const event = await yocoService.handleWebhook(req.body, signature);
    
    if (event.event === 'charge.successful') {
      // Get order with items and products
      const order = await Order.findOne({
        where: { paymentReference: event.reference },
        include: [{ 
          model: OrderItem,
          include: [Product]
        }]
      });
      
      if (order) {
        console.log(`Webhook: Payment confirmed for order ${order.id}`);
        
        // Update order status
        await order.update({ status: 'processing' });
        
        // Reduce stock for each item in the order
        if (order.OrderItems && order.OrderItems.length > 0) {
          console.log(`Webhook: Reducing stock for ${order.OrderItems.length} items in order ${order.id}`);
          
          for (const item of order.OrderItems) {
            if (item.Product) {
              try {
                // Get the product with its sizes
                const product = await Product.findByPk(item.productId, {
                  include: [{
                    model: require('../models/ProductSize'),
                    as: 'sizes'
                  }]
                });
                
                if (product && product.sizes) {
                  // Find the specific size that was purchased
                  const sizeItem = product.sizes.find(s => s.size === item.size);
                  
                  if (sizeItem) {
                    // Reduce the quantity for this specific size
                    const newQuantity = Math.max(0, sizeItem.quantity - item.quantity);
                    await sizeItem.update({ quantity: newQuantity });
                    console.log(`Webhook: Reduced stock for product ${product.id}, size ${item.size} from ${sizeItem.quantity} to ${newQuantity}`);
                  } else {
                    console.warn(`Webhook: Size ${item.size} not found for product ${product.id}`);
                  }
                } else {
                  console.warn(`Webhook: Product ${item.productId} or its sizes not found`);
                }
              } catch (sizeError) {
                console.error(`Webhook: Error updating size stock for product ${item.productId}, size ${item.size}:`, sizeError);
              }
            } else {
              console.warn(`Webhook: Product not found for OrderItem ${item.id}`);
            }
          }
        }
      }
    }
    
    // Respond with 200 (YOCO expects this)
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook handling error:', error);
    res.status(500).send('Server error');
  }
};

/**
 * Handle successful payment return
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.handleSuccess = async (req, res) => {
  try {
    const { reference } = req.query;
    
    if (!reference) {
      return res.status(400).json({ error: 'Reference is required' });
    }
    
    // Get the order
    const order = await Order.findOne({
      where: { paymentReference: reference }
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Payment success handling error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
