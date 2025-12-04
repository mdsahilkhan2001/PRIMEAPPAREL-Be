const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function fixImagePaths() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/prime-apparel');
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const productsCollection = db.collection('products');

        // Find all products with images that start with /uploads/
        const products = await productsCollection.find({ 
            images: { $exists: true, $ne: [] } 
        }).toArray();

        console.log(`\nFound ${products.length} products with images\n`);

        let fixedCount = 0;

        for (const product of products) {
            let hasChanges = false;
            const updates = {};

            // Fix image paths
            const fixedImages = product.images.map(img => {
                if (!img) return img;
                if (typeof img === 'string' && img.startsWith('/uploads/')) {
                    console.log(`  Fixing: "${img}" -> "${img.replace('/uploads/', '')}"`);
                    hasChanges = true;
                    return img.replace('/uploads/', '');
                }
                return img;
            });

            if (hasChanges) {
                updates.images = fixedImages;
            }

            // Fix video path if exists
            if (product.video && product.video.startsWith('/uploads/')) {
                console.log(`  Fixing video: "${product.video}" -> "${product.video.replace('/uploads/', '')}"`);
                updates.video = product.video.replace('/uploads/', '');
                hasChanges = true;
            }

            // Fix techpack if exists
            if (product.techpack && product.techpack.startsWith('/uploads/')) {
                console.log(`  Fixing techpack: "${product.techpack}" -> "${product.techpack.replace('/uploads/', '')}"`);
                updates.techpack = product.techpack.replace('/uploads/', '');
                hasChanges = true;
            }

            // Fix compliance docs if exists
            if (product.costing?.complianceDocs && product.costing.complianceDocs.startsWith('/uploads/')) {
                console.log(`  Fixing compliance doc: "${product.costing.complianceDocs}" -> "${product.costing.complianceDocs.replace('/uploads/', '')}"`);
                updates['costing.complianceDocs'] = product.costing.complianceDocs.replace('/uploads/', '');
                hasChanges = true;
            }

            if (hasChanges) {
                await productsCollection.updateOne(
                    { _id: product._id },
                    { $set: updates }
                );
                console.log(`✓ Updated: ${product.name} (${product._id})\n`);
                fixedCount++;
            }
        }

        console.log(`\n=== Summary ===`);
        console.log(`Total products processed: ${products.length}`);
        console.log(`Products fixed: ${fixedCount}`);
        console.log(`\nImage paths have been fixed in the database!`);
        
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixImagePaths();
