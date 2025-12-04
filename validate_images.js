const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function validateAndFixImages() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/prime-apparel');
        console.log('Connected to MongoDB');

        const uploadsDir = path.join(__dirname, 'public/uploads');
        const db = mongoose.connection.db;
        const productsCollection = db.collection('products');

        // Get all files in uploads directory
        const actualFiles = fs.readdirSync(uploadsDir);
        console.log(`\nTotal files in uploads directory: ${actualFiles.length}\n`);

        // Find all products with images
        const products = await productsCollection.find({ 
            images: { $exists: true, $ne: [] } 
        }).toArray();

        console.log(`Found ${products.length} products with image references\n`);

        let fixedProducts = [];
        let deletedProducts = [];

        for (const product of products) {
            // Check if any images exist
            const existingImages = product.images.filter(img => actualFiles.includes(img));
            
            if (existingImages.length === 0) {
                // No images exist for this product - mark for deletion or update
                console.log(`❌ NO IMAGES FOUND: ${product.name} (${product._id})`);
                console.log(`   Expected: ${product.images[0]}`);
                console.log(`   Will be removed from listing\n`);
                deletedProducts.push(product._id);
            } else if (existingImages.length < product.images.length) {
                // Some images missing
                console.log(`⚠️  PARTIAL IMAGES: ${product.name}`);
                console.log(`   Found ${existingImages.length}/${product.images.length} images`);
                console.log(`   Missing: ${product.images.filter(img => !existingImages.includes(img))}\n`);
                
                // Update to only include existing images
                await productsCollection.updateOne(
                    { _id: product._id },
                    { $set: { images: existingImages } }
                );
                fixedProducts.push(product._id);
            } else {
                // All images exist
                console.log(`✓ ${product.name} - All ${existingImages.length} images found`);
            }
        }

        console.log(`\n=== Summary ===`);
        console.log(`Total products: ${products.length}`);
        console.log(`Products with missing images: ${deletedProducts.length}`);
        console.log(`Products with partial fixes: ${fixedProducts.length}`);
        console.log(`Products with all images: ${products.length - deletedProducts.length - fixedProducts.length}`);

        console.log(`\n⚠️  NOTE: Products with NO images are still in the database but won't display images.`);
        console.log(`   To fully remove them, set their status to INACTIVE.`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

validateAndFixImages();
