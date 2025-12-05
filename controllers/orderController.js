const Order = require('../models/Order');
const { generatePDF } = require('../services/pdfService');
const path = require('path');

exports.createOrder = async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.generatePI = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('lead');
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Generate PI Number if not exists
    if (!order.piNumber) {
      order.piNumber = `PI-${Date.now()}`;
      await order.save();
    }

    // HTML Template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Helvetica', sans-serif; color: #333; }
          .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .logo { font-size: 24px; font-weight: bold; color: #d4af37; }
          .invoice-title { font-size: 32px; font-weight: bold; text-align: right; }
          .details { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .table th, .table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          .table th { background-color: #f5f5f5; }
          .total { text-align: right; font-size: 18px; font-weight: bold; }
          .footer { margin-top: 50px; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">PRIME APPAREL EXPORTS</div>
          <div class="invoice-title">PROFORMA INVOICE</div>
        </div>

        <div class="details">
          <div>
            <strong>Bill To:</strong><br>
            ${order.buyerDetails.name}<br>
            ${order.buyerDetails.company}<br>
            ${order.buyerDetails.address}<br>
            ${order.buyerDetails.email}
          </div>
          <div style="text-align: right;">
            <strong>PI Number:</strong> ${order.piNumber}<br>
            <strong>Date:</strong> ${new Date().toLocaleDateString()}<br>
            <strong>Terms:</strong> ${order.commercialTerm}
          </div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Style No</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.products.map(p => `
              <tr>
                <td>${p.styleName}</td>
                <td>${p.styleNumber}</td>
                <td>${p.quantity}</td>
                <td>$${p.unitPrice.toFixed(2)}</td>
                <td>$${p.totalPrice.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total">
          Total Amount: $${order.totalAmount.toFixed(2)}
        </div>

        <div style="margin-top: 40px;">
          <strong>Payment Terms:</strong> ${order.paymentTerms}<br>
          <strong>Bank Details:</strong> Bank of America, Acc: 1234567890, Swift: BOFAUS3N
        </div>

        <div class="footer">
          <p>Thank you for your business. This is a computer-generated invoice.</p>
          <p>Prime Apparel Exports | New Delhi, India | +91 98765 43210</p>
        </div>
      </body>
      </html>
    `;

    const fileName = `PI-${order.piNumber}.pdf`;
    const pdfPath = await generatePDF(htmlContent, fileName);

    // In a real app, upload to S3 here and save URL
    const pdfUrl = `/pdfs/${fileName}`; // Local path for now
    order.documents.piUrl = pdfUrl;
    order.status = 'PI_GENERATED';
    await order.save();

    res.status(200).json({ success: true, data: order, pdfUrl });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.recordPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload payment proof' });
    }

    // In a real app, upload to S3 here
    const fileUrl = `/uploads/${req.file.filename}`;

    order.status = 'ORDER_CONFIRMED';
    order.timeline.advanceDate = Date.now();

    await order.save();

    res.status(200).json({ success: true, data: order, fileUrl });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get buyer's orders
// @route   GET /api/orders/my-orders
// @access  Private (Buyer)
exports.getBuyerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate('lead')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
