const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Connect to DB
mongoose.connect('mongodb://127.0.0.1:27017/prime-impreal')
    .then(async () => {
        console.log('Connected to MongoDB');

        // Define simple schema to avoid model loading issues
        const productSchema = new mongoose.Schema({}, { strict: false });
        const Product = mongoose.model('Product', productSchema);

        const products = await Product.find({});
        console.log(`Found ${products.length} products`);

        for (const p of products) {
            console.log(`Product: ${p.name}, Status: ${p.status}, Approval: ${p.approvalStatus}, Seller: ${p.seller}`);
        }

        // Update all to ACTIVE and APPROVED
        const result = await Product.updateMany(
            {},
            {
                $set: {
                    status: 'ACTIVE',
                    approvalStatus: 'APPROVED'
                }
            }
        );
        console.log(`Updated ${result.modifiedCount} products to ACTIVE/APPROVED`);

        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
