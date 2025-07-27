const cloudinary = require('cloudinary').v2

exports.cloudnairyconnect = () => {
    try {
        // Check if Cloudinary environment variables are present
        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
            cloudinary.config({
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET
            });
            console.log("✅ Cloudinary connected successfully");
        } else {
            console.log("⚠️  Cloudinary configuration not found. File upload features will be disabled.");
        }
    } catch (error) {
        console.log("❌ Error connecting to Cloudinary:", error.message);
    }
}