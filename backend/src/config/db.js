const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

const connectToMongo = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Database connected successfully");
    } catch (err) {
        console.error("Error while connecting to database:", err.message);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectToMongo;
