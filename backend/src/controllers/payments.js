const { Order, OrderItem } = require('../models/Order');
const Product = require('../models/Product');
const ProductSize = require('../models/ProductSize');
const yocoService = require('../services/yoco');
const paystackService = require('../services/paystack');
const Payment = require('../models/Payment');

/**
 * Helper function to reduce stock for an order
 * @param {Object} order - Order object
 */
async function reduceStockForOrder(order) {
  try {
    console.log(`Reducing stock for order ${order.id}`);
    const orderItems = order.OrderItems || await order.getOrderItems({ include: [Product] });
    
    if (!orderItems || orderItems.length === 0) {
      console.warn(`No order items found for order ${order.id}`);
      return;
    }
    
    console.log(`Processing ${orderItems.length} items for stock reduction`);
    
    for (const item of orderItems) {
      if (!item.productId) {
        console.warn(`OrderItem ${item.id} has no productId`);
        continue;
      }
      
      try {
        // Get the product with its sizes
        const product = await Product.findByPk(item.productId, {
          include: [{
            model: ProductSize,
            as: 'sizes'
          }]
        });
        
        if (!product) {
          console.warn(`Product ${item.productId} not found`);
          continue;
        }
        
        if (!product.sizes || product.sizes.length === 0) {
          console.warn(`Product ${item.productId} has no sizes`);
          continue;
        }
        
        // Find the specific size that was purchased
        const sizeItem = product.sizes.find(s => s.size === item.size);
        
        if (!sizeItem) {
          console.warn(`Size ${item.size} not found for product ${product.id}`);
          continue;
        }
        
        // Calculate new quantity ensuring it doesn't go below zero
        const currentQuantity = sizeItem.quantity || 0;
        const newQuantity = Math.max(0, currentQuantity - item.quantity);
        
        // Update the quantity
        await sizeItem.update({ quantity: newQuantity });
        console.log(`Reduced stock for product ${product.id}, size ${item.size} from ${currentQuantity} to ${newQuantity}`);
        
      } catch (itemError) {
        console.error(`Error processing stock for item ${item.id}:`, itemError);
      }
    }
  } catch (error) {
    console.error('Error reducing stock for order:', error);
  }
}

/**
 * Initialize a payment for an order
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.createPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    console.log(`Creating payment for order: ${orderId}`);
    
    // Get the order with detailed error handling
    let order;
    try {
      order = await Order.findByPk(orderId);
      if (!order) {
        console.error(`Order not found with ID: ${orderId}`);
        return res.status(404).json({ error: 'Order not found' });
      }
    } catch (dbError) {
      console.error(`Database error finding order ${orderId}:`, dbError);
      return res.status(500).json({ error: 'Database error locating order', details: dbError.message });
    }
    
    console.log(`Order found: ${order.id}, Total: ${order.total}, Type: ${typeof order.total}`);
    
    // Check if order belongs to the user
    if (order.userId !== req.user.id) {
      console.error(`Authorization failed: Order ${orderId} belongs to user ${order.userId}, not ${req.user.id}`);
      return res.status(403).json({ error: 'Not authorized to access this order' });
    }
    
    // Verify the order is in a valid state for payment
    if (order.status === 'paid' || order.status === 'completed') {
      console.log(`Order ${orderId} is already paid, returning existing payment info`);
      return res.json({
        success: true,
        message: 'Order is already paid',
        redirectUrl: `https://klenhub.co.za/payment/success?reference=${order.paymentReference || order.id}`,
        reference: order.paymentReference || order.id
      });
    }
    
    // Convert order to plain object to ensure proper data handling
    const orderData = order.get({ plain: true });
    console.log(`Order data prepared for payment processing`);
    
    // Try all payment services with full error handling
    let payment = null;
    let paymentProvider = '';
    let error = null;
    
    // First try Yoco if that's our primary provider
    try {
      console.log('Attempting payment with Yoco service');
      payment = await yocoService.initializePayment(orderData, req.user);
      console.log(`Yoco payment initialized successfully`);
      paymentProvider = 'yoco';
    } catch (yocoError) {
      console.error('Yoco payment initialization failed:', yocoError);
      error = yocoError;
      
      // If Yoco fails, try Paystack as fallback
      if (process.env.USE_PAYSTACK_FALLBACK === 'true') {
        console.log('Attempting fallback to Paystack service');
        try {
          payment = await paystackService.initializePayment(orderData, req.user);
          console.log(`Paystack payment initialized successfully, redirecting to: ${payment.authorizationUrl}`);
          paymentProvider = 'paystack';
          error = null; // Clear the error since fallback succeeded
        } catch (paystackError) {
          console.error('Paystack fallback payment initialization failed:', paystackError);
          error = paystackError;
        }
      }
    }
    
    // Handle case where all payment options failed
    if (!payment) {
      console.error('All payment initialization attempts failed');
      const errorMessage = error ? error.message : 'Unknown payment initialization error';
      return res.status(500).json({ 
        error: 'Payment initialization failed', 
        details: errorMessage 
      });
    }
    
    // Save payment information
    try {
      // Create a new payment record
      await Payment.create({
        orderId: order.id,
        reference: payment.reference,
        checkoutId: payment.id,
        provider: paymentProvider,
        amount: orderData.total,
        status: 'pending',
        metadata: {
          userId: req.user.id,
          email: req.user.email
        }
      });
      
      // Update order with payment reference
      await order.update({
        paymentReference: payment.reference || payment.id,
        paymentProvider: paymentProvider
      });
      
      console.log(`Payment record created for order ${order.id}, provider: ${paymentProvider}`);
    } catch (dbError) {
      console.error('Error creating payment record:', dbError);
      // Continue with payment process even if record saving fails
    }
    
    // Return successful response
    res.json({
      success: true,
      redirectUrl: payment.authorizationUrl || payment.checkoutUrl,
      reference: payment.reference || payment.id,
      provider: paymentProvider
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

/**
 * Verify payment status
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.query;
    
    if (!reference) {
      return res.status(400).json({ error: 'Reference is required' });
    }
    
    console.log(`Verifying payment with reference: ${reference}`);
    
    // Check if we have a payment record for this reference
    let payment = null;
    try {
      payment = await Payment.findOne({
        where: { 
          reference: reference 
        }
      });
      
      // If not found by reference, try by checkoutId
      if (!payment) {
        payment = await Payment.findOne({
          where: { 
            checkoutId: reference 
          }
        });
      }
    } catch (dbError) {
      console.error(`Database error fetching payment record:`, dbError);
    }
    
    // Get order information
    let order = null;
    let orderId = null;
    
    if (payment && payment.orderId) {
      // Get order ID from payment record
      orderId = payment.orderId;
      console.log(`Found payment record with order ID: ${orderId}`);
    } else {
      // Try to find order by payment reference
      try {
        order = await Order.findOne({
          where: { paymentReference: reference },
          include: [{ 
            model: OrderItem,
            include: [Product]
          }]
        });
        
        if (order) {
          orderId = order.id;
          console.log(`Found order by payment reference: ${orderId}`);
        }
      } catch (refError) {
        console.error(`Error looking up order by reference:`, refError);
      }
      
      // If still not found and reference might contain order ID (like order_UUID_timestamp)
      if (!order && reference && reference.includes('_')) {
        const parts = reference.split('_');
        if (parts.length >= 2) {
          const possibleOrderId = parts[1]; // Extract the UUID part
          
          try {
            order = await Order.findByPk(possibleOrderId, {
              include: [{ 
                model: OrderItem,
                include: [Product]
              }]
            });
            
            if (order) {
              orderId = order.id;
              console.log(`Found order by extracted ID from reference: ${orderId}`);
            }
          } catch (idError) {
            console.error(`Error looking up order by ID from reference:`, idError);
          }
        }
      }
    }
    
    // If we still don't have an order, but have an order ID, fetch it
    if (!order && orderId) {
      try {
        order = await Order.findByPk(orderId, {
          include: [{ 
            model: OrderItem,
            include: [Product]
          }]
        });
        console.log(`Fetched order ${orderId} using ID from payment record`);
      } catch (orderError) {
        console.error(`Error fetching order ${orderId}:`, orderError);
      }
    }
    
    // If no order found, report error
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Determine which payment provider was used
    const provider = order.paymentProvider || (payment ? payment.provider : null) || 'unknown';
    console.log(`Payment provider for order ${order.id}: ${provider}`);
    
    // Verify payment with the appropriate provider
    let verification = null;
    
    if (provider === 'yoco') {
      try {
        console.log(`Verifying Yoco payment for order ${order.id}`);
        verification = await yocoService.verifyPayment(reference, order);
      } catch (yocoError) {
        console.error('Yoco verification error:', yocoError);
      }
    } else if (provider === 'paystack') {
      try {
        console.log(`Verifying Paystack payment for order ${order.id}`);
        verification = await paystackService.verifyPayment(reference);
      } catch (paystackError) {
        console.error('Paystack verification error:', paystackError);
      }
    }
    
    // Default to unknown status if verification failed
    if (!verification) {
      verification = { status: 'unknown' };
    }
    
    // Update payment record status if we have one
    if (payment) {
      try {
        await payment.update({
          status: verification.status,
          verifiedAt: new Date()
        });
        console.log(`Updated payment record ${payment.id} status to ${verification.status}`);
      } catch (updateError) {
        console.error('Error updating payment record:', updateError);
      }
    }
    
    // Update order status based on payment status
    if (verification.status === 'success') {
      await order.update({ status: 'processing' });
      console.log(`Order ${order.id} updated to status: processing`);
      
      // Reduce stock for items in the order after payment confirmation
      await reduceStockForOrder(order);
    }
    
    // Return verification result
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
 * Handle payment webhooks (supports Yoco and Paystack)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.handleWebhook = async (req, res) => {
  try {
    console.log('Webhook received:', req.body);
    
    // Determine the webhook source based on headers
    let event;
    let paymentProvider = 'unknown';
    
    // Check for Yoco signature
    if (req.headers['x-yoco-signature']) {
      console.log('Processing Yoco webhook');
      paymentProvider = 'yoco';
      event = await yocoService.handleWebhook(req.body, req.headers['x-yoco-signature']);
    } 
    // Check for Paystack signature
    else if (req.headers['x-paystack-signature']) {
      console.log('Processing Paystack webhook');
      paymentProvider = 'paystack';
      event = await paystackService.handleWebhook(req.body, req.headers['x-paystack-signature']);
    }
    // No known signature
    else {
      console.warn('Unknown webhook source, attempting to process as generic');
      // Try to extract data from a generic webhook
      event = {
        success: true,
        event: req.body.event || 'unknown',
        reference: req.body.reference || (req.body.data ? req.body.data.reference : null),
        status: req.body.status || (req.body.data ? req.body.data.status : null)
      };
    }
    
    console.log('Parsed webhook event:', event);
    
    // Process payment success events
    if (event.success && 
        (event.event === 'charge.success' || 
         event.event === 'payment.succeeded' || 
         event.event === 'charge.successful')) {
      
      // Find the related order
      let order;
      
      // Try finding by payment reference
      if (event.reference) {
        order = await Order.findOne({
          where: { paymentReference: event.reference },
          include: [{ 
            model: OrderItem,
            include: [Product]
          }]
        });
      }
      
      // If not found and we have an orderId, try that
      if (!order && event.orderId) {
        order = await Order.findByPk(event.orderId, {
          include: [{ 
            model: OrderItem,
            include: [Product]
          }]
        });
      }
      
      // If we found an order, update its status and reduce stock
      if (order) {
        console.log(`Webhook: Payment confirmed for order ${order.id}`);
        
        // Update order status if not already processed
        if (order.status !== 'processing' && order.status !== 'completed') {
          await order.update({ 
            status: 'processing',
            paymentProvider: paymentProvider
          });
          
          // Also update the payment record if it exists
          try {
            const payment = await Payment.findOne({
              where: { orderId: order.id }
            });
            
            if (payment) {
              await payment.update({
                status: 'success',
                verifiedAt: new Date()
              });
              console.log(`Payment record ${payment.id} updated to success`);
            }
          } catch (paymentError) {
            console.error('Error updating payment record:', paymentError);
          }
          
          // Reduce stock for items in the order
          await reduceStockForOrder(order);
        }
      } else {
        console.warn(`Webhook: Could not find order for reference ${event.reference}`);
      }
    }
    
    // Always respond with 200 (payment providers expect this)
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
    const { reference, checkoutId } = req.query;
    
    if (!reference && !checkoutId) {
      return res.status(400).json({ error: 'Reference or checkoutId is required' });
    }
    
    const referenceValue = reference || checkoutId;
    console.log(`Payment success request for reference: ${referenceValue}`);
    
    // Find order using multiple lookup strategies
    let order = null;
    
    // Strategy 1: Look up by reference
    try {
      order = await Order.findOne({
        where: { paymentReference: referenceValue },
        include: [{ 
          model: OrderItem,
          include: [Product]
        }]
      });
      
      if (order) {
        console.log(`Order found by payment reference: ${referenceValue}`);
      }
    } catch (refError) {
      console.error(`Error looking up order by reference:`, refError);
    }
    
    // Strategy 2: If reference contains order ID (like order_UUID_timestamp)
    if (!order && referenceValue && referenceValue.includes('_')) {
      const parts = referenceValue.split('_');
      if (parts.length >= 2) {
        const possibleOrderId = parts[1]; // Extract the UUID part
        
        try {
          order = await Order.findByPk(possibleOrderId, {
            include: [{ 
              model: OrderItem,
              include: [Product]
            }]
          });
          
          if (order) {
            console.log(`Order found by extracted ID from reference: ${possibleOrderId}`);
          }
        } catch (idError) {
          console.error(`Error looking up order by ID from reference:`, idError);
        }
      }
    }
    
    // Strategy 3: Check Payment model if we have a checkout ID
    if (!order && checkoutId) {
      try {
        const payment = await Payment.findOne({ where: { checkoutId } });
        
        if (payment && payment.orderId) {
          order = await Order.findByPk(payment.orderId, {
            include: [{ 
              model: OrderItem,
              include: [Product]
            }]
          });
          
          if (order) {
            console.log(`Order found via Payment record with checkout ID: ${checkoutId}`);
          }
        }
      } catch (paymentError) {
        console.error(`Error looking up payment:`, paymentError);
      }
    }
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Process the order items for frontend display
    if (order.OrderItems && order.OrderItems.length > 0) {
      order.items = order.OrderItems.map(item => ({
        id: item.id,
        productId: item.productId,
        name: item.Product ? item.Product.name : 'Product Not Available',
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        image: item.Product ? item.Product.image : null
      }));
    } else {
      order.items = [];
    }
    
    res.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        total: order.total,
        shipping: order.shipping || 0,
        shippingAddress: order.shippingAddress,
        email: order.email,
        phone: order.phone,
        paymentReference: order.paymentReference,
        paymentProvider: order.paymentProvider,
        items: order.items
      }
    });
  } catch (error) {
    console.error('Payment success handling error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// --- YOCO Payment Controller Functions ---

/**
 * Initialize a Yoco payment for an order (prepare SDK parameters for frontend)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.initializeYocoPayment = async (req, res) => {
  const { orderId } = req.body;
  const userId = req.user.id;

  console.log(`[Yoco] Initialize payment request for order: ${orderId}, user: ${userId}`);

  try {
    const order = await Order.findByPk(orderId);
    if (!order) {
      console.error(`[Yoco] Order not found: ${orderId}`);
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.userId !== userId) {
      console.error(`[Yoco] User ${userId} not authorized for order ${orderId}`);
      return res.status(403).json({ success: false, message: 'Not authorized for this order' });
    }

    const user = {
      email: req.user.email, 
      name: req.user.name || `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim(),
      phone: order.phone || req.user.phone || '',
      address: order.shippingAddress ? 
        `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}` : 
        ''
    };

    const yocoParams = await yocoService.initializePayment(order, user);

    if (!yocoParams.success) {
        console.error('[Yoco] Failed to initialize Yoco payment SDK parameters:', yocoParams.message);
        return res.status(400).json(yocoParams);
    }

    console.log(`[Yoco] SDK parameters prepared for order ${orderId}:`, yocoParams.sdkParameters.metadata);
    res.json(yocoParams);

  } catch (error) {
    console.error('[Yoco] Error in initializeYocoPayment controller:', error);
    res.status(500).json({ success: false, message: 'Server error during Yoco payment initialization.', error: error.message });
  }
};

/**
 * Create a Yoco charge after frontend gets token from Yoco SDK
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.createYocoCharge = async (req, res) => {
  const { yocoToken, amountInCents, orderId } = req.body;
  const userId = req.user.id;
  const metadata = req.body.metadata || {}; 

  console.log(`[Yoco] Create charge request for order: ${orderId}, user: ${userId}, amount: ${amountInCents}`);

  try {
    const order = await Order.findByPk(orderId);
    if (!order) {
      console.error(`[Yoco] Order not found: ${orderId} for charge creation.`);
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.userId !== userId) {
      console.error(`[Yoco] User ${userId} not authorized for order ${orderId} charge creation.`);
      return res.status(403).json({ success: false, message: 'Not authorized for this order' });
    }

    const expectedAmountInCents = Math.round(parseFloat(order.total) * 100);
    if (parseInt(amountInCents, 10) !== expectedAmountInCents) {
      console.error(`[Yoco] Amount mismatch for order ${orderId}. Expected: ${expectedAmountInCents}, Received: ${amountInCents}`);
      return res.status(400).json({ success: false, message: 'Amount mismatch. Please try again.' });
    }

    if (order.status === 'paid' || order.status === 'completed') {
      console.log(`[Yoco] Order ${orderId} is already paid or completed.`);
      return res.json({ success: true, message: 'Order already processed.', charge: { status: order.status, chargeId: order.paymentReference } });
    }

    const chargeResult = await yocoService.createCharge(yocoToken, amountInCents, orderId, metadata);

    if (!chargeResult.success || chargeResult.charge?.status !== 'successful') {
      console.error('[Yoco] Yoco charge creation failed or not successful:', chargeResult.message, chargeResult.details || chargeResult.charge);
      await Payment.upsert({
        orderId: order.id,
        reference: chargeResult.charge?.id || `failed_${orderId}_${Date.now()}`,
        checkoutId: metadata?.checkoutId || chargeResult.charge?.metadata?.checkoutId || null,
        paymentId: chargeResult.charge?.id || null,
        provider: 'yoco',
        amount: order.total,
        status: chargeResult.charge?.status || 'failed',
        metadata: JSON.stringify(chargeResult.charge || chargeResult.details || { error: chargeResult.message })
      });
      return res.status(400).json(chargeResult);
    }

    console.log(`[Yoco] Charge successful for order ${orderId}. Charge ID: ${chargeResult.charge.id}`);

    order.status = 'paid';
    order.paymentReference = chargeResult.charge.id;
    order.paymentProvider = 'yoco';
    order.paidAt = new Date(chargeResult.charge.created_at || Date.now());
    await order.save();
    console.log(`[Yoco] Order ${orderId} status updated to paid.`);

    await Payment.upsert({
      orderId: order.id,
      reference: chargeResult.charge.metadata?.klenhub_reference || chargeResult.charge.id,
      checkoutId: metadata?.checkoutId || chargeResult.charge?.metadata?.checkoutId || null,
      paymentId: chargeResult.charge.id,
      provider: 'yoco',
      amount: chargeResult.charge.amount / 100,
      status: 'success',
      metadata: JSON.stringify(chargeResult.charge)
    });
    console.log(`[Yoco] Payment record updated for order ${orderId}.`);

    await reduceStockForOrder(order);
    console.log(`[Yoco] Stock reduction initiated for order ${orderId}.`);

    res.json(chargeResult);

  } catch (error) {
    console.error('[Yoco] Error in createYocoCharge controller:', error);
    res.status(500).json({ success: false, message: 'Server error during Yoco charge creation.', error: error.message });
  }
};

/**
 * Handle Yoco webhooks
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.handleYocoWebhook = async (req, res) => {
  const rawBody = req.body;
  const signature = req.headers['x-yoco-signature'];

  console.log('[Yoco] Webhook received.');

  try {
    const webhookResult = await yocoService.handleWebhook(rawBody, signature);

    if (!webhookResult.success) {
      console.error('[Yoco] Webhook processing failed:', webhookResult.message, webhookResult.error || '');
      if (webhookResult.error === 'InvalidSignature' || webhookResult.error === 'MissingSignature' || webhookResult.error === 'MissingRawBody') {
        return res.status(400).json({ status: 'error', message: webhookResult.message });
      }
      return res.status(200).json({ status: 'acknowledged_with_processing_error', message: webhookResult.message });
    }

    console.log('[Yoco] Webhook signature verified, event data:', webhookResult);

    if (webhookResult.type === 'payment.succeeded' && webhookResult.orderId && webhookResult.chargeId) {
      console.log(`[Yoco] Webhook: Payment success for order ${webhookResult.orderId}, charge ${webhookResult.chargeId}`);
      const order = await Order.findByPk(webhookResult.orderId);

      if (order) {
        if (order.status !== 'paid' && order.status !== 'completed') {
          order.status = 'paid';
          order.paymentReference = webhookResult.chargeId;
          order.paymentProvider = 'yoco';
          order.paidAt = new Date(webhookResult.paidAt || Date.now());
          await order.save();
          console.log(`[Yoco] Webhook: Order ${webhookResult.orderId} status updated to paid.`);

          await Payment.upsert({
            orderId: order.id,
            reference: webhookResult.reference || webhookResult.chargeId,
            checkoutId: webhookResult.rawEventData?.data?.object?.metadata?.checkoutId || webhookResult.rawEventData?.metadata?.checkoutId || null,
            paymentId: webhookResult.chargeId,
            provider: 'yoco',
            amount: webhookResult.amount,
            status: 'success',
            metadata: JSON.stringify(webhookResult.rawEventData)
          });
          console.log(`[Yoco] Webhook: Payment record updated for order ${webhookResult.orderId}.`);

          await reduceStockForOrder(order);
          console.log(`[Yoco] Webhook: Stock reduction initiated for order ${webhookResult.orderId}.`);
        } else {
          console.log(`[Yoco] Webhook: Order ${webhookResult.orderId} already processed (status: ${order.status}).`);
        }
      } else {
        console.warn(`[Yoco] Webhook: Order ${webhookResult.orderId} not found for successful payment event.`);
      }
    } else if (webhookResult.type === 'payment.failed') {
        console.warn(`[Yoco] Webhook: Payment failure for order ${webhookResult.orderId || 'Unknown'}, charge ${webhookResult.chargeId}. Message: ${webhookResult.message}`);
        if (webhookResult.orderId) {
            const order = await Order.findByPk(webhookResult.orderId);
            if (order && order.status !== 'paid' && order.status !== 'completed') {
                order.status = 'failed';
                await order.save();
                console.log(`[Yoco] Webhook: Order ${webhookResult.orderId} status updated to failed.`);

                await Payment.upsert({
                    orderId: order.id,
                    reference: webhookResult.reference || webhookResult.chargeId,
                    checkoutId: webhookResult.rawEventData?.data?.object?.metadata?.checkoutId || webhookResult.rawEventData?.metadata?.checkoutId || null,
                    paymentId: webhookResult.chargeId,
                    provider: 'yoco',
                    amount: order.total,
                    status: 'failed',
                    metadata: JSON.stringify(webhookResult.rawEventData)
                });
                console.log(`[Yoco] Webhook: Payment record updated as failed for order ${webhookResult.orderId}.`);
            }
        }
    } else {
      console.log('[Yoco] Webhook: Event acknowledged, type not handled for business logic or already handled:', webhookResult.type);
    }

    res.status(200).json({ status: 'success', message: 'Webhook processed' });

  } catch (error) {
    console.error('[Yoco] Error in handleYocoWebhook controller:', error);
    res.status(500).json({ status: 'error', message: 'Server error processing webhook.', error: error.message });
  }
};
