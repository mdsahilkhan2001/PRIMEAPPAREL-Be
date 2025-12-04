const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function markProductsWithImages() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/prime-apparel');
        console.log('Connected to MongoDB');

        const uploadsDir = path.join(__dirname, 'public/uploads');
        const db = mongoose.connection.db;
        const productsCollection = db.collection('products');

        // Get all files in uploads directory
        const actualFiles = fs.readdirSync(uploadsDir);
        console.log(`Total files in uploads directory: ${actualFiles.length}\n`);

        // Find all products
        const allProducts = await productsCollection.find({}).toArray();
        console.log(`Found ${allProducts.length} total products\n`);

        let productsWithImages = 0;
        let productsWithoutImages = 0;

        for (const product of allProducts) {
            // Check if product has images array and at least one image exists
            const hasValidImages = product.images && 
                                  product.images.length > 0 && 
                                  product.images.some(img => actualFiles.includes(img));

            if (hasValidImages) {
                productsWithImages++;
                console.log(`✓ ${product.name} - HAS ${product.images.filter(img => actualFiles.includes(img)).length} valid images`);
            } else {
                productsWithoutImages++;
                console.log(`✗ ${product.name} - NO valid images`);
            }
        }

        console.log(`\n=== Summary ===`);
        console.log(`Products with valid images: ${productsWithImages}`);
        console.log(`Products without valid images: ${productsWithoutImages}`);
        console.log(`Total: ${allProducts.length}`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

markProductsWithImages();
