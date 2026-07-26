import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import postRoutes from './routes/posts.routes.js';
import userRoutes from './routes/user.routes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(postRoutes);
app.use(userRoutes);
app.use(express.static('uploads'));

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

    const PORT = process.env.PORT || 9080;
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

  
    process.on('SIGINT', async () => {
      console.log('SIGINT received, shutting down gracefully...');
      server.close(() => {
        console.log('HTTP server closed');
        mongoose.connection.close(false, () => {
          console.log('MongoDB connection closed');
          process.exit(0);
        });
      }
      );
    }
    );
    
  } catch (error) {
    console.error(error);
  }
};

start();