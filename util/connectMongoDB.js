const mongoose = require('mongoose');

let cachedConnection = null;

const connectMongoDB = async () => {
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    cachedConnection = conn;
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err}`);
      cachedConnection = null;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      cachedConnection = null;
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      cachedConnection = null;
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

    return cachedConnection;

  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    cachedConnection = null;
    process.exit(1);
  }
};

module.exports = connectMongoDB;
