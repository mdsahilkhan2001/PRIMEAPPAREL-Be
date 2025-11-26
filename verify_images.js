const mongoose = require('mongoose');
const Product = require('./models/Product');
const http = require('http');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

async function checkSystem() {
    console.log('--- STARTING SYSTEM CHECK ---');

    // 1. Check DB Content
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/prime-apparel');
        console.log('✅ DB Connected');

        const product = await Product.findOne().sort({ createdAt: -1 });
        if (!product) {
            console.log('❌ No products found in DB');
            process.exit(1);
        }

        console.log(`ℹ️ Latest Product: ${product.name}`);
        console.log(`ℹ️ Stored Image Paths:`, product.images);

        if (!product.images || product.images.length === 0) {
            console.log('❌ Latest product has no images');
            process.exit(1);
        }

        // 2. Check File System
        const fs = require('fs');
        const firstImage = product.images[0]; // e.g., /uploads/filename.jpg
        const localPath = path.join(__dirname, 'public', firstImage);

        if (fs.existsSync(localPath)) {
            console.log(`✅ File exists locally at: ${localPath}`);
            const stats = fs.statSync(localPath);
            console.log(`   Size: ${stats.size} bytes`);
        } else {
            console.log(`❌ File NOT found locally at: ${localPath}`);
            console.log(`   Checked dir: ${path.dirname(localPath)}`);
            if (fs.existsSync(path.dirname(localPath))) {
                console.log('   Directory listing:', fs.readdirSync(path.dirname(localPath)));
            }
        }

        // 3. Check HTTP Serving
        const filename = firstImage.split('/').pop();
        // We need to handle the space in filename for the URL
        const encodedImage = firstImage.split('/').map(part => encodeURIComponent(part)).join('/').replace('%2F', '/');
        // Actually, the path in DB is /uploads/filename. The server serves /uploads.
        // So URL is http://localhost:5000/uploads/filename
        // But wait, the DB path *includes* /uploads.
        // And app.use('/uploads', ...) serves the directory.
        // So request to /uploads/filename maps to public/uploads/filename.

        // Let's try to fetch it
        // We need to encode the filename part properly
        const urlPath = firstImage.split('/').map(p => encodeURIComponent(p)).join('/').replace('%2F', '/');
        // The DB path is like /uploads/file name.jpg
        // We want http://localhost:5000/uploads/file%20name.jpg

        // Correct encoding:
        // split by / -> ['', 'uploads', 'file name.jpg']
        // map encode -> ['', 'uploads', 'file%20name.jpg']
        // join / -> /uploads/file%20name.jpg

        const testUrl = `http://localhost:5000${urlPath}`;
        console.log(`ℹ️ Testing HTTP URL: ${testUrl}`);

        http.get(testUrl, (res) => {
            console.log(`HTTP Status: ${res.statusCode}`);
            console.log(`Content-Type: ${res.headers['content-type']}`);
            console.log(`Content-Length: ${res.headers['content-length']}`);

            if (res.statusCode === 200) {
                console.log('✅ Image is serving correctly via HTTP');
            } else {
                console.log('❌ Failed to serve image via HTTP');
            }
            process.exit(0);
        }).on('error', (e) => {
            console.error(`❌ HTTP Request Error: ${e.message}`);
            process.exit(1);
        });

    } catch (err) {
        console.error('❌ Unexpected Error:', err);
        process.exit(1);
    }
}

checkSystem();
