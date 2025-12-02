const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect('mongodb://localhost:27017/prime-impreal')
    .then(async () => {
        console.log('Connected to database');

        const products = await Product.find({})
            .select('name seller approvalStatus status createdAt')
            .populate('seller', 'name email role')
            .sort({ createdAt: -1 });

        console.log(`\nTotal products in database: ${products.length}\n`);

        if (products.length === 0) {
            console.log('No products found in database!');
        } else {
            products.forEach((p, index) => {
                console.log(`${index + 1}. ${p.name}`);
                console.log(`   Seller: ${p.seller?.email || 'Unknown'} (${p.seller?.role || 'N/A'})`);
                console.log(`   Status: ${p.status}`);
                console.log(`   Approval: ${p.approvalStatus || 'APPROVED (default)'}`);
                console.log(`   Created: ${p.createdAt}`);
                console.log('');
            });
        }

        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
