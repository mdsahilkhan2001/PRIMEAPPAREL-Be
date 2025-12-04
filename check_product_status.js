const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function checkProductStatus() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/prime-apparel');
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const productsCollection = db.collection('products');

        // Count total products
        const total = await productsCollection.countDocuments();
        console.log(`\nTotal Products: ${total}`);

        // Group by status
        const statusCounts = await productsCollection.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]).toArray();

        console.log('\nBy Status:');
        statusCounts.forEach(s => console.log(`  ${s._id || 'undefined'}: ${s.count}`));

        // Group by approvalStatus
        const approvalCounts = await productsCollection.aggregate([
            { $group: { _id: "$approvalStatus", count: { $sum: 1 } } }
        ]).toArray();

        console.log('\nBy Approval Status:');
        approvalCounts.forEach(s => console.log(`  ${s._id || 'undefined'}: ${s.count}`));

        // Check for soft deleted
        const deletedCount = await productsCollection.countDocuments({ isDeleted: true });
        console.log(`\nSoft Deleted (isDeleted: true): ${deletedCount}`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkProductStatus();
