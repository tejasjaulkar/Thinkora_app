const Razorpay = require("razorpay");

// Only initialize Razorpay if the required environment variables are present
let instance = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_SECRET) {
    instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_SECRET,
    });
} else {
    console.log("⚠️  Razorpay configuration not found. Payment features will be disabled.");
}

exports.instance = instance;