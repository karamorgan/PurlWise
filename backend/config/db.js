const mongoose = require('mongoose');

async function connectDB() {
    try {
        const db = await mongoose.connect('mongodb://localhost/knitting');
        console.log(`MongoDB connected: ${db.connection.host}`); 
    } catch(err) {
        console.log(err);
        process.exit(1);
    }
};

module.exports = connectDB;