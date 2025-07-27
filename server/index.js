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

const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://root:Tej%40s476@cluster0.r1ok0.mongodb.net/Thinkora", {
    useNewUrlParser: true,
    useUnifiedTopology:true,
})
.then(() => console.log("DB Connected Successfully"))
.catch( (error) => {
    console.log("DB Connection Failed");
    console.error(error);
    process.exit(1);
} )

// Updated CORS configuration to handle authorization header
app.use(cors({
  origin: "http://localhost:5002",
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
