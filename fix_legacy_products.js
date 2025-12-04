const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function fixLegacyProducts() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/prime-apparel');
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const productsCollection = db.collection('products');

        // Update products with missing approvalStatus
        const result = await productsCollection.updateMany(
            {
                $or: [
                    { approvalStatus: { $exists: false } },
                    { approvalStatus: null }
                ]
            },
            {
                $set: {
                    approvalStatus: 'APPROVED',
                    status: 'ACTIVE' // Also ensure they are active
                }
            }
        );

        console.log(`\nUpdated ${result.modifiedCount} legacy products.`);
        console.log('Set approvalStatus to "APPROVED" and status to "ACTIVE".');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixLegacyProducts();
