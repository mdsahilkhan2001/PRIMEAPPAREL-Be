// PDF Template Generator Functions
const Settings = require('../models/Settings');

// Helper to format date
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB');
};

// Get company settings (cached for performance)
let companySettings = null;
const getCompanySettings = async () => {
    if (!companySettings) {
        companySettings = await Settings.findOne() || {
            siteName: 'PRIME APPAREL EXPORTS',
            officeAddress: 'Office: Minara Masjid, Mohammad Ali Road, Mumbai – 400003',
            supportEmail: 'info@primeapparelexports.com',
            supportPhone: '+91 90000 12345'
        };
    }
    return companySettings;
};

// Proforma Invoice Template
exports.getPITemplate = (order, piNumber) => {
    // Assuming company settings are fixed as per user request for now
    // But keeping variable interpolation for Order specific data

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Arial', sans-serif; 
            font-size: 11px; 
            line-height: 1.4; 
            color: #000;
            padding: 30px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .company-name {
            font-size: 20px;
            font-weight: bold;
            color: #d4af37; /* Gold-ish color as per user hint maybe? or just black */
            color: #000;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .company-details { font-size: 10px; }
        
        .doc-title {
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            margin: 15px 0;
            text-decoration: underline;
        }
        
        .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .col { flex: 1; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .bold { font-weight: bold; }
        
        .section-header {
            background: #eee;
            font-weight: bold;
            padding: 5px;
            margin: 15px 0 5px 0;
            border-top: 1px solid #000;
            border-bottom: 1px solid #000;
            font-size: 11px;
        }

        table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 10px; }
        th { background: #eee; border: 1px solid #000; padding: 5px; text-align: left; }
        td { border: 1px solid #000; padding: 5px; }
        
        .footer-section { margin-top: 20px; page-break-inside: avoid; }
        
        .declaration { font-size: 10px; margin-top: 10px; font-style: italic; }
        
        .signature-box {
            margin-top: 30px;
            text-align: right;
            border-top: 1px solid #000; /* Separator if needed, or just space */
            border-top: none;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <div class="company-name">PRIME APPAREL EXPORTS</div>
        <div class="company-details">
            Office: Minara Masjid, Mohammad Ali Road, Mumbai – 400003<br>
            Factory: Sion, Mumbai<br>
            Email: info@primeapparelexports.com | Phone: +91 90000 12345<br>
            GST: 27ABCDE1234F1Z5 | IEC: 0399999999
        </div>
    </div>

    <!-- Title & PI Details -->
    <div class="doc-title">PROFORMA INVOICE (PI)</div>
    
    <div class="row">
        <div class="col">
            <div class="bold">PI No.: ${piNumber}</div>
        </div>
        <div class="col text-right">
            <div class="bold">Date: ${formatDate(new Date())}</div>
        </div>
    </div>

    <!-- Buyer Details -->
    <div style="margin-top: 10px; border: 1px solid #000; padding: 10px;">
        <div class="bold">Buyer:</div>
        <div>${order.buyerDetails?.name || order.userId?.name || 'N/A'}</div>
        <div>${order.buyerDetails?.company || ''}</div>
        <div>Address: ${order.buyerDetails?.address || 'India'}</div>
        <div>Contact: ${order.buyerDetails?.name || 'Buyer User'}</div>
        <div>Email: ${order.buyerDetails?.email || 'buyer@example.com'}</div>
        <div>Phone: ${order.buyerDetails?.phone || 'N/A'}</div>
    </div>

    <!-- Order Details -->
    <div class="section-header">ORDER DETAILS</div>
    <table>
        <thead>
            <tr>
                <th>Style Code</th>
                <th>Product</th>
                <th>Fabric</th>
                <th>Color</th>
                <th>Sizes</th>
                <th>Qty</th>
                <th>EXW Price (USD)</th>
                <th>Amount (USD)</th>
            </tr>
        </thead>
        <tbody>
            ${order.products.map(p => `
            <tr>
                <td>${p.styleNumber || 'PAE-KF-001'}</td>
                <td>${p.styleName || 'Product'}</td>
                <td>${p.fabric || 'Rayon'}</td>
                <td>${p.color || 'Navy Blue'}</td>
                <td>${p.sizeBreakdown || 'S-XL'}</td>
                <td>${p.quantity}</td>
                <td>$${p.unitPrice?.toFixed(2) || '0.00'}</td>
                <td>$${p.totalPrice?.toFixed(2) || '0.00'}</td>
            </tr>
            `).join('')}
            <tr>
                <td colspan="7" class="text-right bold">Subtotal:</td>
                <td class="bold">$${order.totalAmount?.toFixed(2) || '0.00'}</td>
            </tr>
            <tr>
                <td colspan="7" class="text-right bold">Taxes:</td>
                <td class="bold">NIL (Export)</td>
            </tr>
            <tr>
                <td colspan="7" class="text-right bold">Grand Total (USD):</td>
                <td class="bold">$${order.totalAmount?.toFixed(2) || '0.00'}</td>
            </tr>
        </tbody>
    </table>

    <!-- Shipping Terms -->
    <div class="section-header">SHIPPING TERMS</div>
    <div><span class="bold">Term:</span> ${order.commercialTerm || 'EXW'}</div>
    <div><span class="bold">Delivery Time:</span> 22–28 Days</div>
    <div><span class="bold">Port:</span> Mumbai</div>
    <div><span class="bold">Shipping & Duty:</span> Actuals will be informed before dispatch</div>
    <div>(We will share DHL/Aramex final rate before shipment)</div>

    <!-- Payment Terms -->
    <div class="section-header">PAYMENT TERMS</div>
    <div>50% Advance Required to start production</div>
    <div>50% Balance before shipment / after QC approval</div>
    <div><span class="bold">Payment Mode:</span> Bank Transfer (SWIFT)</div>

    <!-- Bank Details -->
    <div class="section-header">BANK DETAILS</div>
    <div><span class="bold">Bank:</span> HDFC Bank</div>
    <div><span class="bold">Account Name:</span> Prime Apparel Exports</div>
    <div><span class="bold">Account Number:</span> 000123456789</div>
    <div><span class="bold">IFSC:</span> HDFC0000123</div>
    <div><span class="bold">SWIFT:</span> HDFCINBBXXX</div>
    <div><span class="bold">Branch:</span> Sion, Mumbai</div>

    <!-- Production Flow -->
    <div class="section-header">PRODUCTION FLOW FOR THIS ORDER</div>
    <ol style="margin-left: 20px;">
        <li>Advance Received → Production Start</li>
        <li>Fabric/Trims Confirmation</li>
        <li>Cutting → Stitching → Finishing</li>
        <li>QC (Inline + Final)</li>
        <li>Packing & Carton</li>
        <li>DHL/Aramex Shipping</li>
        <li>Tracking + Full Docs shared</li>
    </ol>

    <!-- Declaration -->
    <div class="section-header">DECLARATION</div>
    <div>We confirm that all prices are as per OEM/ODM discussion.</div>
    <div>Custom branding, labels, and packaging included as discussed.</div>

    <!-- Signature -->
    <div class="footer-section">
        <div class="section-header">DIGITAL SIGNATURE</div>
        <div style="margin-top: 10px;">
            <div class="bold">For Prime Apparel Exports</div>
            <div style="font-family: 'Brush Script MT', cursive; font-size: 20px; margin: 10px 0;">Mohammad Sadab</div>
            <div>Auth. Signatory</div>
            <div style="margin-top: 10px;"><span class="bold">Name:</span> Mohammad Sadab</div>
            <div><span class="bold">Position:</span> Director</div>
            <div><span class="bold">Date:</span> ${formatDate(new Date())}</div>
        </div>
    </div>
</body>
</html>
    `;
};

// Commercial Invoice Template
exports.getCITemplate = (order, ciNumber, metadata) => {
    const settings = companySettings || {};

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Arial', sans-serif; 
            font-size: 12px; 
            line-height: 1.6; 
            color: #333;
            padding: 20px;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #000;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .company-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .company-details { font-size: 11px; line-height: 1.8; }
        
        .doc-title {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            margin: 20px 0;
            text-decoration: underline;
        }
        
        .info-section {
            margin-bottom: 20px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
        }
        .label { font-weight: bold; }
        
        .buyer-box {
            border: 1px solid #000;
            padding: 15px;
            margin: 20px 0;
            background: #f9f9f9;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th {
            background: #2c3e50;
            color: white;
            padding: 10px;
            text-align: left;
            font-size: 11px;
        }
        td {
            border: 1px solid #ddd;
            padding: 8px;
            font-size: 11px;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        
        .total-row {
            background: #ecf0f1;
            font-weight: bold;
        }
        
        .section-title {
            font-size: 14px;
            font-weight: bold;
            margin: 20px 0 10px 0;
            border-bottom: 2px solid #000;
            padding-bottom: 5px;
        }
        
        .signature-section {
            margin-top: 30px;
            page-break-inside: avoid;
        }
        
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <div class="company-name">${settings.siteName || 'PRIME APPAREL EXPORTS'}</div>
        <div class="company-details">
            ${settings.officeAddress || 'Office: Minara Masjid, Mohammad Ali Road, Mumbai – 400003'}<br>
            Factory: Sion, Mumbai<br>
            Email: ${settings.supportEmail || 'info@primeapparelexports.com'} | 
            Phone: ${settings.supportPhone || '+91 90000 12345'}<br>
            GST: 27ABCDE1234F1Z5 | IEC: 0399999999
        </div>
    </div>

    <!-- Document Title -->
    <div class="doc-title">COMMERCIAL INVOICE (CI)</div>

    <!-- Invoice Info -->
    <div class="info-section">
        <div class="info-row">
            <div><span class="label">Invoice No.:</span> ${ciNumber}</div>
            <div><span class="label">Invoice Date:</span> ${formatDate(new Date())}</div>
        </div>
        <div class="info-row">
            <div><span class="label">Buyer Order No.:</span> ${order.piNumber || 'N/A'}</div>
            <div><span class="label">Shipment Mode:</span> ${order.commercialTerm || 'DDP Air (DHL)'}</div>
        </div>
        <div class="info-row">
            <div><span class="label">AWB No.:</span> ${metadata.awbNumber || 'To be updated'}</div>
            <div><span class="label">Port of Loading:</span> Mumbai, India</div>
        </div>
        <div class="info-row">
            <div></div>
            <div><span class="label">Port of Destination:</span> ${order.buyerDetails?.country || 'N/A'}</div>
        </div>
    </div>

    <!-- Buyer Details -->
    <div class="section-title">Buyer Details</div>
    <div class="buyer-box">
        <div><strong>${order.buyerDetails?.company || order.userId?.company || 'N/A'}</strong></div>
        <div>${order.buyerDetails?.address || 'N/A'}</div>
        <div>Contact: ${order.buyerDetails?.name || order.userId?.name || 'N/A'}</div>
        <div>Email: ${order.buyerDetails?.email || order.userId?.email || 'N/A'}</div>
    </div>

    <!-- Exporter Details -->
    <div class="section-title">Exporter Details</div>
    <div class="info-section">
        <div><strong>Prime Apparel Exports</strong></div>
        <div>Sion, Mumbai</div>
        <div>GST: 27ABCDE1234F1Z5 | IEC: 0399999999</div>
    </div>

    <!-- Shipment Details -->
    <div class="section-title">SHIPMENT DETAILS (With HSN Codes)</div>
    <table>
        <thead>
            <tr>
                <th>Style Code</th>
                <th>Product</th>
                <th>HSN Code</th>
                <th>Fabric</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Unit Price (USD)</th>
                <th class="text-right">Amount (USD)</th>
            </tr>
        </thead>
        <tbody>
            ${order.products.map((product, index) => `
                <tr>
                    <td>${product.styleNumber || 'N/A'}</td>
                    <td>${product.styleName || product.name || 'N/A'}</td>
                    <td>${metadata.hsnCodes?.[index] || '620449'}</td>
                    <td>-</td>
                    <td class="text-right">${product.quantity}</td>
                    <td class="text-right">$${product.unitPrice?.toFixed(2)}</td>
                    <td class="text-right">$${product.totalPrice?.toFixed(2)}</td>
                </tr>
            `).join('')}
            <tr class="total-row">
                <td colspan="6" class="text-right">Total FOB/EXW Value:</td>
                <td class="text-right">$${order.totalAmount?.toFixed(2)}</td>
            </tr>
            ${metadata.freightCharges ? `
            <tr>
                <td colspan="6" class="text-right">Freight:</td>
                <td class="text-right">$${metadata.freightCharges?.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
                <td colspan="6" class="text-right"><strong>Grand Total (USD):</strong></td>
                <td class="text-right"><strong>$${(order.totalAmount + (metadata.freightCharges || 0)).toFixed(2)}</strong></td>
            </tr>
            ` : ''}
        </tbody>
    </table>

    <!-- Declaration -->
    <div class="section-title">DECLARATION</div>
    <div class="info-section">
        We declare that the goods are of Indian origin and the invoice is true & correct.<br>
        No prohibited items included.
    </div>

    <!-- Bank Details -->
    <div class="section-title">BANK DETAILS</div>
    <div class="info-section">
        <div><span class="label">Bank:</span> HDFC Bank</div>
        <div><span class="label">Account Name:</span> Prime Apparel Exports</div>
        <div><span class="label">A/C No.:</span> 000123456789</div>
        <div><span class="label">IFSC:</span> HDFC0000123</div>
        <div><span class="label">SWIFT:</span> HDFCINBBXXX</div>
    </div>

    <!-- Signature -->
    <div class="signature-section">
        <div class="section-title">SIGNATURE</div>
        <div><strong>For Prime Apparel Exports</strong></div>
        <div style="margin-top: 10px;">Name: Mohammad Sadab</div>
        <div>Designation: Director</div>
        <div style="margin-top: 20px;">Signature: ____________________</div>
        <div>Date: ${formatDate(new Date())}</div>
    </div>

    <div class="footer">
        This is a computer-generated commercial invoice.
    </div>
</body>
</html>
    `;
};

// Packing List Template
exports.getPackingListTemplate = (order, plNumber, metadata) => {
    const settings = companySettings || {};
    const totalCartons = metadata.cartonDetails?.length || 0;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Arial', sans-serif; 
            font-size: 12px; 
            line-height: 1.6; 
            color: #333;
            padding: 20px;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #000;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .company-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .company-details { font-size: 11px; line-height: 1.8; }
        
        .doc-title {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            margin: 20px 0;
            text-decoration: underline;
        }
        
        .info-section {
            margin-bottom: 20px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
        }
        .label { font-weight: bold; }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th {
            background: #2c3e50;
            color: white;
            padding: 10px;
            text-align: left;
            font-size: 11px;
        }
        td {
            border: 1px solid #ddd;
            padding: 8px;
            font-size: 11px;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        
        .total-row {
            background: #ecf0f1;
            font-weight: bold;
        }
        
        .section-title {
            font-size: 14px;
            font-weight: bold;
            margin: 20px 0 10px 0;
            border-bottom: 2px solid #000;
            padding-bottom: 5px;
        }
        
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <div class="company-name">${settings.siteName || 'PRIME APPAREL EXPORTS'}</div>
        <div class="company-details">
            ${settings.officeAddress || 'Office: Minara Masjid, Mohammad Ali Road, Mumbai – 400003'}<br>
            Factory: Sion, Mumbai<br>
            Email: ${settings.supportEmail || 'info@primeapparelexports.com'} | 
            Phone: ${settings.supportPhone || '+91 90000 12345'}
        </div>
    </div>

    <!-- Document Title -->
    <div class="doc-title">PACKING LIST</div>

    <!-- Packing List Info -->
    <div class="info-section">
        <div class="info-row">
            <div><span class="label">Packing List No.:</span> ${plNumber}</div>
            <div><span class="label">Date:</span> ${formatDate(new Date())}</div>
        </div>
        <div class="info-row">
            <div><span class="label">Invoice No.:</span> ${order.piNumber || 'N/A'}</div>
            <div><span class="label">Total Cartons:</span> ${totalCartons}</div>
        </div>
    </div>

    <!-- Buyer Info -->
    <div class="section-title">Consignee</div>
    <div class="info-section">
        <div><strong>${order.buyerDetails?.company || order.userId?.company || order.lead?.name || 'N/A'}</strong></div>
        <div>${order.buyerDetails?.address || order.lead?.country || 'N/A'}</div>
        <div>${order.buyerDetails?.email || order.userId?.email || order.lead?.email || 'N/A'}</div>
    </div>

    <!-- Carton Details -->
    <div class="section-title">CARTON DETAILS</div>
    <table>
        <thead>
            <tr>
                <th>Carton No.</th>
                <th>Product Description</th>
                <th>Quantity (pcs)</th>
                <th>Dimensions (cm)</th>
                <th class="text-right">Weight (kg)</th>
            </tr>
        </thead>
        <tbody>
            ${metadata.cartonDetails?.map((carton, index) => `
                <tr>
                    <td class="text-center">${index + 1}</td>
                    <td>${carton.contents || 'Mixed Items'}</td>
                    <td class="text-center">${carton.quantity || '-'}</td>
                    <td>${carton.dimensions || '-'}</td>
                    <td class="text-right">${carton.weight || '-'}</td>
                </tr>
            `).join('') || `
                <tr>
                    <td colspan="5" class="text-center">No carton details provided</td>
                </tr>
            `}
            ${metadata.totalWeight ? `
            <tr class="total-row">
                <td colspan="4" class="text-right">Total Gross Weight:</td>
                <td class="text-right">${metadata.totalWeight} kg</td>
            </tr>
            ` : ''}
            ${metadata.totalCBM ? `
            <tr class="total-row">
                <td colspan="4" class="text-right">Total CBM:</td>
                <td class="text-right">${metadata.totalCBM} m³</td>
            </tr>
            ` : ''}
        </tbody>
    </table>

    <!-- Product Summary -->
    <div class="section-title">PRODUCT SUMMARY</div>
    <table>
        <thead>
            <tr>
                <th>Style Code</th>
                <th>Description</th>
                <th class="text-right">Total Quantity</th>
            </tr>
        </thead>
        <tbody>
            ${order.products.map(product => `
                <tr>
                    <td>${product.styleNumber || 'N/A'}</td>
                    <td>${product.styleName || product.name || 'N/A'}</td>
                    <td class="text-right">${product.quantity} pcs</td>
                </tr>
            `).join('')}
            <tr class="total-row">
                <td colspan="2" class="text-right"><strong>Grand Total:</strong></td>
                <td class="text-right"><strong>${order.products.reduce((sum, p) => sum + (p.quantity || 0), 0)} pcs</strong></td>
            </tr>
        </tbody>
    </table>

    <div class="footer">
        This is a computer-generated packing list.
    </div>
</body>
</html>
    `;
};

// Initialize company settings on module load
(async () => {
    try {
        await getCompanySettings();
    } catch (error) {
        console.log('Failed to load company settings, using defaults');
    }
})();
