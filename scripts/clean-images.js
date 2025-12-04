const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const cleanImages = async () => {
    await connectDB();

    const dryRun = process.argv.includes('--dry-run');
    console.log(dryRun ? '=== DRY RUN MODE ===' : '=== EXECUTE MODE ===');

    try {
        const products = await Product.find({});
        let totalBroken = 0;
        let totalProductsAffected = 0;

        for (const product of products) {
            let productModified = false;
            const validImages = [];
            const brokenImages = [];

            if (product.images && product.images.length > 0) {
                for (const imagePath of product.images) {
                    // Handle both full URLs and relative paths if necessary, 
                    // but based on previous context, they seem to be relative like /uploads/...
                    // We need to strip /uploads/ to check the file in public/uploads

                    let filename = imagePath;
                    if (imagePath.startsWith('/uploads/')) {
                        filename = imagePath.replace('/uploads/', '');
                    }

                    const filePath = path.join(__dirname, '../public/uploads', filename);

                    if (fs.existsSync(filePath)) {
                        validImages.push(imagePath);
                    } else {
                        brokenImages.push(imagePath);
                    }
                }

                if (brokenImages.length > 0) {
                    console.log(`\nProduct: ${product.name} (${product._id})`);
                    console.log(`  Broken Images:`);
                    brokenImages.forEach(img => console.log(`    - ${img}`));

                    totalBroken += brokenImages.length;
                    totalProductsAffected++;
                    productModified = true;

                    if (!dryRun) {
                        product.images = validImages;
                        await product.save();
                        console.log('  [CLEANED]');
                    }
                }
            }
        }

        console.log('\n=== SUMMARY ===');
        console.log(`Total Products Scanned: ${products.length}`);
        console.log(`Products with Broken Images: ${totalProductsAffected}`);
        console.log(`Total Broken Links Found: ${totalBroken}`);

        if (dryRun && totalBroken > 0) {
            console.log('\nRun without --dry-run to remove these links.');
        }

    } catch (error) {
        console.error('Error:', error);
    }

    process.exit();
};

cleanImages();
