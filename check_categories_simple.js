const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function checkCategories() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/prime-apparel');
        const db = mongoose.connection.db;
        const productsCollection = db.collection('products');

        const categories = await productsCollection.distinct('category');
        console.log('--- CATEGORIES START ---');
        console.log(JSON.stringify(categories, null, 2));
        console.log('--- CATEGORIES END ---');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkCategories();
