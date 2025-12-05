const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Product = require('./models/Product');
const CustomizationRequest = require('./models/customization/CustomizationRequest');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/garment-manufacturing')
    .then(async () => {
        console.log('✅ Connected\n');

        // Find ALL users
        const allUsers = await User.find();
        console.log(`📊 All Users (${allUsers.length} total):\n`);
        allUsers.forEach(u => {
            console.log(`${u.role.padEnd(10)} | ${u.email.padEnd(30)} | ${u.name}`);
        });

        // Find SELLER by role (not email)
        const seller = await User.findOne({ role: 'SELLER' });

        if (!seller) {
            console.log('\n❌ No SELLER role found!');
            process.exit(1);
        }

        console.log(`\n✅ Found SELLER: ${seller.email} (${seller.name})`);
        console.log(`   Seller ID: ${seller._id}\n`);

        // Assign to ALL products
        const allProducts = await Product.find();
        console.log(`📦 Assigning seller to ${allProducts.length} products...\n`);

        let updated = 0;
        for (const product of allProducts) {
            product.seller = seller._id;
            await product.save();
            console.log(`   ✅ ${product.name}`);
            updated++;
        }

        console.log(`\n✅ Updated ${updated} products`);

        // Fix ALL customization requests
        const allRequests = await CustomizationRequest.find();
        console.log(`\n📋 Fixing ${allRequests.length} customization requests...\n`);

        let fixedRequests = 0;
        for (const req of allRequests) {
            req.seller = seller._id;
            await req.save();
            console.log(`   ✅ Fixed request ${req._id.toString().substring(0, 8)}...`);
            fixedRequests++;
        }

        console.log(`\n✅ Fixed ${fixedRequests} requests`);

        console.log('\n' + '='.repeat(60));
        console.log('✅ SUCCESS!');
        console.log('='.repeat(60));
        console.log(`Seller: ${seller.email}`);
        console.log(`Products linked: ${updated}`);
        console.log(`Requests fixed: ${fixedRequests}`);
        console.log('\nAll products and requests are now linked to this seller!');
        console.log('New customization requests will automatically link to this seller.');
        console.log('='.repeat(60));

        await mongoose.connection.close();
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err.message);
        console.error(err);
        process.exit(1);
    });
