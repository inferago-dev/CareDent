import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB() {
  mongoose.set('strictQuery', true);
  try {
    const conn = await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 8000 });
    console.log(`[db] connected -> ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error('\n[db] Could not connect to MongoDB.');
    console.error(`     URI: ${env.mongoUri.replace(/\/\/([^:]+):[^@]+@/, '//$1:****@')}`);
    console.error(`     ${err.message}`);
    console.error('\n     Fixes: start a local mongod, or set MONGODB_URI to a MongoDB Atlas connection string in BACKEND/.env\n');
    throw err;
  }
}

export async function disconnectDB() {
  await mongoose.connection.close();
}
