const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function checkCategories() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/prime-apparel');
        const db = mongoose.connection.db;
        const productsCollection = db.collection('products');

        const categories = await productsCollection.distinct('category');
        console.log('Available Categories:', categories);

        const products = await productsCollection.find({}).project({ name: 1, category: 1, subCategory: 1 }).toArray();
        console.log('\nSample Products (first 5):');
        products.slice(0, 5).forEach(p => console.log(`- ${p.name} [Cat: ${p.category}, Sub: ${p.subCategory}]`));

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkCategories();
