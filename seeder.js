const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Lead = require('./models/Lead');
const Supplier = require('./models/Supplier');
const User = require('./models/User');
const Product = require('./models/Product');
const Costing = require('./models/Costing');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/prime-apparel');

const seedData = async () => {
    try {
        await Lead.deleteMany();
        await Supplier.deleteMany();
        await Costing.deleteMany();
        await User.deleteMany();
        await Product.deleteMany();

        console.log('Data Destroyed...');

        const users = [
            {
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'password123',
                role: 'ADMIN'
            },
            {
                name: 'Buyer User',
                email: 'buyer@example.com',
                password: 'password123',
                role: 'BUYER'
            },
            {
                name: 'Seller User',
                email: 'seller@example.com',
                password: 'password123',
                role: 'SELLER'
            },
            {
                name: 'Designer User',
                email: 'designer@example.com',
                password: 'password123',
                role: 'DESIGNER'
            }
        ];

        const createdUsers = await User.create(users);
        console.log('Users Added');

        const buyerUser = createdUsers.find(user => user.role === 'BUYER');

        const leads = [
            {
                name: 'John Doe',
                email: 'john@example.com',
                phone: '+1234567890',
                country: 'USA',
                productType: 'Resort Wear',
                quantity: 500,
                budget: 15000,
                message: 'Looking for high quality silk kaftans.',
                status: 'NEW',
                userId: buyerUser._id
            },
            {
                name: 'Jane Smith',
                email: 'jane@boutique.co.uk',
                phone: '+447700900077',
                country: 'UK',
                productType: 'Loungewear',
                quantity: 200,
                budget: 5000,
                message: 'Need cotton loungewear sets for summer collection.',
                status: 'QUALIFIED',
                userId: buyerUser._id
            }
        ];

        await Lead.insertMany(leads);
        console.log('Leads Added');

        const suppliers = [
            {
                name: 'Fabrics R Us',
                contactPerson: 'Mike Ross',
                email: 'mike@fabricsrus.com',
                phone: '9876543210',
                address: '123 Textile Market, Surat',
                category: 'FABRIC',
                ledger: { totalBilled: 5000, totalPaid: 2000, balance: 3000 }
            },
            {
                name: 'Premium Trims',
                contactPerson: 'Sarah Lee',
                email: 'sarah@premiumtrims.com',
                phone: '9123456789',
                address: '456 Button Street, Delhi',
                category: 'TRIMS',
                ledger: { totalBilled: 1000, totalPaid: 1000, balance: 0 }
            }
        ];

        await Supplier.insertMany(suppliers);
        console.log('Suppliers Added');

        const costings = [
            {
                styleName: 'Silk Kaftan 2024',
                styleNumber: 'SK-001',
                fabricCost: 5,
                fabricConsumption: 3,
                trimCost: 2,
                cmCost: 4,
                packingCost: 1,
                overheadCost: 1,
                profitMargin: 20,
                exwPrice: 27.6, // Approx
                totalPrice: 27.6
            }
        ];

        await Costing.insertMany(costings);
        console.log('Costings Added');

        const products = [
            {
                name: 'Premium Cotton Linen Resort Shirt',
                description: 'Experience the ultimate comfort with our Premium Cotton Linen Resort Shirt. Designed for the modern man, this shirt features a relaxed fit, breathable fabric, and a classic mandarin collar. Perfect for beach weddings, resort wear, or casual summer outings. The natural fiber blend ensures you stay cool even in tropical climates.',
                category: 'Men Clothing',
                subCategory: 'Shirts',
                images: [
                    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop', // Front
                    'https://images.unsplash.com/photo-1589465885857-44edb59ef526?q=80&w=1000&auto=format&fit=crop', // Back
                    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=1000&auto=format&fit=crop', // Detail
                    'https://images.unsplash.com/photo-1516257984-b1b4d8c9230c?q=80&w=1000&auto=format&fit=crop'  // Lifestyle
                ],
                priceTiers: [
                    { minQty: 50, maxQty: 199, price: 18.50 },
                    { minQty: 200, maxQty: 499, price: 16.50 },
                    { minQty: 500, price: 15.00 }
                ],
                colors: [
                    { name: 'Classic White', hex: '#FFFFFF' },
                    { name: 'Sky Blue', hex: '#87CEEB' },
                    { name: 'Sand Beige', hex: '#F4A460' },
                    { name: 'Olive Green', hex: '#556B2F' }
                ],
                sizes: ['S', 'M', 'L', 'XL', 'XXL'],
                moq: 50,
                leadTime: '20-25 days',
                customization: ['Logo Embroidery', 'Custom Buttons', 'Private Label'],
                specifications: {
                    material: '60% Cotton, 40% Linen',
                    fabricType: 'Woven',
                    technics: 'Garment Dyed',
                    feature: 'Breathable, Anti-Static, Eco-Friendly',
                    origin: 'India'
                }
            },
            {
                name: 'Bohemian Floral Maxi Kaftan',
                description: 'Step into luxury with our Bohemian Floral Maxi Kaftan. Crafted from high-quality silk blend fabric, this kaftan drapes beautifully and feels incredibly soft against the skin. The vibrant floral print is perfect for making a statement at pool parties or beach vacations. Features a drawstring waist for an adjustable fit.',
                category: 'Women Clothing',
                subCategory: 'Kaftan',
                images: [
                    '/products/kaftan-1.png', // Front (Local)
                    'https://images.unsplash.com/photo-1566206091558-7f218b696731?q=80&w=1000&auto=format&fit=crop', // Side/Back
                    'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=1000&auto=format&fit=crop', // Detail
                    'https://images.unsplash.com/photo-1605763240004-7e93b172d754?q=80&w=1000&auto=format&fit=crop'  // Lifestyle
                ],
                priceTiers: [
                    { minQty: 30, maxQty: 99, price: 28.00 },
                    { minQty: 100, maxQty: 499, price: 25.00 },
                    { minQty: 500, price: 22.00 }
                ],
                colors: [
                    { name: 'Ocean Blue Print', hex: '#1E90FF' },
                    { name: 'Sunset Orange Print', hex: '#FF4500' },
                    { name: 'Tropical Green Print', hex: '#32CD32' }
                ],
                sizes: ['One Size (Fits XS-XXL)'],
                moq: 30,
                leadTime: '15-20 days',
                customization: ['Custom Print Design', 'Label Customization'],
                specifications: {
                    material: 'Silk Blend (Polyester/Silk)',
                    fabricType: 'Woven',
                    technics: 'Digital Print',
                    feature: 'Quick Dry, Lightweight, Sheer',
                    origin: 'India'
                }
            },
            {
                name: 'Organic Cotton Waffle Lounge Set',
                description: 'Relax in style with our Organic Cotton Waffle Lounge Set. This two-piece set includes a long-sleeve top and matching joggers, both made from 100% organic cotton with a waffle texture. Ideal for loungewear collections, sleepwear, or casual work-from-home outfits.',
                category: 'Women Clothing',
                subCategory: 'Loungewear',
                images: [
                    'https://images.unsplash.com/photo-1605763240004-7e93b172d754?q=80&w=1000&auto=format&fit=crop', // Front
                    'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?q=80&w=1000&auto=format&fit=crop', // Detail
                    'https://images.unsplash.com/photo-1621452773781-0f992ee03591?q=80&w=1000&auto=format&fit=crop', // Lifestyle
                    'https://images.unsplash.com/photo-1519238263496-6362d74c1123?q=80&w=1000&auto=format&fit=crop'  // Lifestyle 2
                ],
                priceTiers: [
                    { minQty: 100, maxQty: 499, price: 24.00 },
                    { minQty: 500, price: 21.00 }
                ],
                colors: [
                    { name: 'Sage Green', hex: '#9CBA7F' },
                    { name: 'Dusty Rose', hex: '#DCAE96' },
                    { name: 'Charcoal Grey', hex: '#36454F' },
                    { name: 'Cream', hex: '#FFFDD0' }
                ],
                sizes: ['XS', 'S', 'M', 'L', 'XL'],
                moq: 100,
                leadTime: '25-30 days',
                customization: ['Custom Packaging', 'Logo Embroidery'],
                specifications: {
                    material: '100% Organic Cotton',
                    fabricType: 'Knitted (Waffle)',
                    technics: 'Piece Dyed',
                    feature: 'Sustainable, Soft Touch, Thermal',
                    origin: 'India'
                }
            },
            {
                name: 'Hand-Embroidered Denim Jacket',
                description: 'A masterpiece of craftsmanship, this Hand-Embroidered Denim Jacket features intricate floral embroidery on the back and shoulders. Made from premium denim, it offers a vintage wash and a comfortable fit. A unique addition to any boutique collection.',
                category: 'Women Clothing',
                subCategory: 'Jackets',
                images: [
                    'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1000&auto=format&fit=crop', // Front
                    'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?q=80&w=1000&auto=format&fit=crop', // Back/Detail
                    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1000&auto=format&fit=crop', // Lifestyle
                    'https://images.unsplash.com/photo-1584060622420-06735388f45a?q=80&w=1000&auto=format&fit=crop'  // Detail
                ],
                priceTiers: [
                    { minQty: 20, maxQty: 49, price: 45.00 },
                    { minQty: 50, price: 40.00 }
                ],
                colors: [
                    { name: 'Vintage Blue', hex: '#87CEEB' },
                    { name: 'Black Denim', hex: '#1C1C1C' }
                ],
                sizes: ['S', 'M', 'L', 'XL'],
                moq: 20,
                leadTime: '30-40 days',
                customization: ['Custom Embroidery Design', 'Branded Buttons'],
                specifications: {
                    material: '100% Cotton Denim',
                    fabricType: 'Woven',
                    technics: 'Hand Embroidered, Stone Wash',
                    feature: 'Durable, Unique Design',
                    origin: 'India'
                }
            },
            {
                name: 'Kids Summer Cotton Dress',
                description: 'Cute and comfortable, this Kids Summer Cotton Dress is perfect for playdates and parties. Made from 100% soft cotton, it features a gathered waist and a flared skirt. Available in a variety of fun prints.',
                category: 'Kids Clothing',
                subCategory: 'Dresses',
                images: [
                    'https://images.unsplash.com/photo-1621452773781-0f992ee03591?q=80&w=1000&auto=format&fit=crop', // Front
                    'https://images.unsplash.com/photo-1519238263496-6362d74c1123?q=80&w=1000&auto=format&fit=crop', // Lifestyle
                    'https://images.unsplash.com/photo-1605763240004-7e93b172d754?q=80&w=1000&auto=format&fit=crop', // Detail
                    'https://images.unsplash.com/photo-1566206091558-7f218b696731?q=80&w=1000&auto=format&fit=crop'  // Back
                ],
                priceTiers: [
                    { minQty: 100, price: 12.00 }
                ],
                colors: [
                    { name: 'Pink Polka Dot', hex: '#FFB7C5' },
                    { name: 'Yellow Floral', hex: '#FFFFE0' },
                    { name: 'Blue Stripe', hex: '#ADD8E6' }
                ],
                sizes: ['2Y', '4Y', '6Y', '8Y', '10Y'],
                moq: 100,
                leadTime: '20 days',
                customization: ['Custom Print', 'Label'],
                specifications: {
                    material: '100% Cotton Poplin',
                    fabricType: 'Woven',
                    technics: 'Screen Print',
                    feature: 'Soft, Breathable, Machine Washable',
                    origin: 'India'
                }
            }
        ];

        await Product.insertMany(products);
        console.log('Products Added');

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

seedData();
