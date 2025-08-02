const express = require("express");

const app = express();

const userRoutes = require("./routes/User");
const paymentRoutes = require("./routes/Payments");
const profileRoutes = require("./routes/Profile");
const CourseRoutes = require("./routes/Course");
const aiRoutes = require('./routes/AI');

const database = require("./config/database");
const cookieParser = require("cookie-parser");

const cors = require("cors");
const fileUpload = require("express-fileupload");
const { cloudnairyconnect } = require("./config/cloudinary");
const path = require("path");

const dotenv = require("dotenv");
dotenv.config();

// Debug: Check if environment variables are loaded
console.log("Environment check:");
console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
console.log("RAZORPAY_KEY_ID exists:", !!process.env.RAZORPAY_KEY_ID);
console.log("PORT:", process.env.PORT || 5001);

const PORT = process.env.PORT || 5001;

// Connect to database using the database config
database.connect();

// Updated CORS configuration to handle authorization header
const allowedOrigins = [
  "http://localhost:3000",  // React default port
  "http://localhost:5002",  // Your current setting
  "http://localhost:3001",  // Alternative React port
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5002"
];

// Add production origins if needed
if (process.env.NODE_ENV === 'production') {
  allowedOrigins.push(
    "https://yourdomain.com",
    "https://www.yourdomain.com"
  );
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Authorisation',  // Add both spellings
    'X-Requested-With', 
    'Accept', 
    'Origin'
  ],
  exposedHeaders: ['Authorization', 'Authorisation'],
}));

// CORS error handling middleware
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS Error: Origin not allowed',
      error: err.message
    });
  }
  next(err);
});

app.use(express.json());
app.use(cookieParser());

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

cloudnairyconnect();

app.use("/api/v1/auth", userRoutes);

app.use("/api/v1/payment", paymentRoutes);

app.use("/api/v1/profile", profileRoutes);

app.use("/api/v1/course", CourseRoutes);

app.use("/api/v1/contact", require("./routes/ContactUs"));

app.use('/api/v1/ai', aiRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the API",
  });
});

// CORS debug route
app.get("/cors-debug", (req, res) => {
  res.status(200).json({
    message: "CORS is working!",
    origin: req.headers.origin,
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
