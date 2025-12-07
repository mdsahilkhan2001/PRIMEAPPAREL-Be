const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function restoreMissingImages() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/prime-apparel');
        console.log('Connected to MongoDB');

        const uploadsDir = path.join(__dirname, 'public/uploads');
        const sourceImage = path.join(uploadsDir, 'placeholder_restored.png');

        if (!fs.existsSync(sourceImage)) {
            console.error('Source placeholder image not found!');
            process.exit(1);
        }

        const db = mongoose.connection.db;
        const productsCollection = db.collection('products');

        // Get all products
        const allProducts = await productsCollection.find({}).toArray();
        console.log(`Checking ${allProducts.length} products for missing images...`);

        let restoredCount = 0;
        let missingFilesCount = 0;

        for (const product of allProducts) {
            if (product.images && product.images.length > 0) {
                for (const imgFilename of product.images) {
                    const imgPath = path.join(uploadsDir, imgFilename);

                    if (!fs.existsSync(imgPath)) {
                        console.log(`Missing file: ${imgFilename} for product "${product.name}"`);

                        // Copy placeholder to this filename
                        fs.copyFileSync(sourceImage, imgPath);
                        console.log(`  -> Restored using placeholder`);
                        missingFilesCount++;
                    }
                }
            }
        }

        console.log(`\n=== Summary ===`);
        console.log(`Restored ${missingFilesCount} missing image files.`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

restoreMissingImages();
