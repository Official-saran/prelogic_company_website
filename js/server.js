const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Atlas connection
const mongoURI = 'mongodb+srv://Saran:SaranLife@prelogic.kswas.mongodb.net/?retryWrites=true&w=majority&appName=prelogic';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Define Schemas
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const serviceSchema = new mongoose.Schema({
    name: String,
    address: String,
    contact: String,
    email: String,
    service: String,
    description: String,
    period: String,
    amount: Number,
});

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    date: { type: Date, default: Date.now },
    total: { type: Number, required: true },
});

// Create Models
const User = mongoose.model('User', userSchema);
const Service = mongoose.model('Service', serviceSchema);
const Order = mongoose.model('Order', orderSchema);

// Authentication Middleware
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, 'your_jwt_secret'); // Replace with your secret key
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Routes

// User Registration
app.post('/api/user/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const user = new User({ name, email, password });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
});

// User Login
app.post('/api/user/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user || user.password !== password) { // Replace with bcrypt for secure password comparison
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, 'your_jwt_secret', { expiresIn: '1h' }); // Replace with your secret key
        res.json({ token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Fetch User Profile and Orders
// app.get('/api/user/profile', authMiddleware, async (req, res) => {
//     try {
//         const user = await User.findById(req.user.id).select('-password'); // Exclude password
//         const orders = await Order.find({ userId: req.user.id }).populate('serviceId'); // Fetch orders with service details

//         res.json({ user, orders });
//     } catch (error) {
//         console.error('Error fetching user profile:', error);
//         res.status(500).json({ message: 'Server error' });
//     }
// });


// Submit Service (Order)
app.post('/submit-service', async (req, res) => {
    const { name, address, contact, email, service, description, period, amount, userId } = req.body;

    try {
        const newService = new Service({
            name,
            address,
            contact,
            email,
            service,
            description,
            period,
            amount,
        });

        const savedService = await newService.save();

        // Create an order for the user
        const newOrder = new Order({
            userId,
            serviceId: savedService._id,
            total: amount,
        });

        await newOrder.save();

        res.status(200).json({ message: 'Service and order saved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error saving data', error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});