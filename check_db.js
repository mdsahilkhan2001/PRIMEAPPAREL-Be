const mongoose = require('mongoose');
const Product = require('./models/Product');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/prime-apparel')
    .then(async () => {
        console.log('Connected to DB');
        const p = await Product.findOne().sort({ createdAt: -1 });
        if (p) {
            console.log('Latest Product Images:', p.images);
        } else {
            console.log('No products found');
        }
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
