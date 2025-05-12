const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Fix 1: Proper CORS configuration (place this at the top)
app.use(cors({
    origin: '*', // Allow all origins (for development - restrict in production)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(bodyParser.json());

// MongoDB Connection
const mongoURI = 'mongodb+srv://Saran:SaranLife@prelogic.kswas.mongodb.net/prelogic?retryWrites=true&w=majority&appName=prelogic';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));


// Schemas
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    createdAt: { type: Date, default: Date.now }
});

const serviceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    serviceType: { type: String, required: true },
    description: String,
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    clientDetails: {
        name: String,
        address: String,
        contact: String,
        email: String,
        period: String,
        amount: String
    }
});

// Models
const User = mongoose.model('User', userSchema);
const Service = mongoose.model('Service', serviceSchema);

// JWT Configuration
const JWT_SECRET = 'your_secret_key';

// Authentication Middleware
// Authentication Middleware
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Authentication token missing' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};


// User Signup
app.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (await User.findOne({ email })) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        const token = jwt.sign({ userId: newUser._id }, JWT_SECRET);
        res.status(201).json({
            token,
            user: {
                id: newUser._id,
                username,
                email,
                role: newUser.role
            }
        });
    } catch (err) {
        res.status(400).json({ error: 'Error creating user' });
    }
});

// User Signin
app.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET);
        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Error during authentication' });
    }
});

// Get User Profile with Services
app.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        const services = await Service.find({ userId: req.user._id });
        res.json({ user, services });
    } catch (err) {
        res.status(500).json({ error: 'Error fetching profile' });
    }
});


app.post('/submit-service', authMiddleware, async (req, res) => {
    try {
        // Add validation
        const requiredFields = ['name', 'address', 'contact', 'email'];
        for (const field of requiredFields) {
            if (!req.body.clientDetails[field]) {
                return res.status(400).json({
                    error: `${field} is required`
                });
            }
        }

        const newService = new Service({
            userId: req.user._id,
            serviceType: req.body.service, // Changed from 'service' to match client
            description: req.body.description,
            clientDetails: {
                name: req.body.clientDetails.name,
                address: req.body.clientDetails.address,
                contact: req.body.clientDetails.contact,
                email: req.body.clientDetails.email,
                period: req.body.period,
                amount: req.body.amount
            }
        });

        const savedService = await newService.save();

        res.status(201).json({
            message: 'Service request submitted successfully',
            service: savedService
        });

    } catch (error) {
        console.error('Error saving service:', error);
        res.status(500).json({
            error: 'Error submitting service request',
            details: error.message // Send actual error message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});