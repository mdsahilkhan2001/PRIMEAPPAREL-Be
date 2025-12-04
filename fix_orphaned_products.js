const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function deactivateOrphanedProducts() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/prime-apparel');
        console.log('Connected to MongoDB');

        const uploadsDir = path.join(__dirname, 'public/uploads');
        const db = mongoose.connection.db;
        const productsCollection = db.collection('products');

        // Get all files in uploads directory
        const actualFiles = fs.readdirSync(uploadsDir);

        // Find products with missing images
        const products = await productsCollection.find({ 
            images: { $exists: true, $ne: [] } 
        }).toArray();

        let deactivatedCount = 0;

        for (const product of products) {
            // Check if any images exist
            const existingImages = product.images.filter(img => actualFiles.includes(img));
            
            if (existingImages.length === 0) {
                // Deactivate this product
                await productsCollection.updateOne(
                    { _id: product._id },
                    { $set: { status: 'INACTIVE' } }
                );
                console.log(`✓ Deactivated: ${product.name}`);
                deactivatedCount++;
            }
        }

        console.log(`\n=== Summary ===`);
        console.log(`Products deactivated: ${deactivatedCount}`);
        console.log(`\n✅ These products will no longer appear in listings`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

deactivateOrphanedProducts();
