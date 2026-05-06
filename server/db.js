import mongoose from 'mongoose';

let cached = globalThis.__tochkaMongo;

if (!cached) {
  cached = globalThis.__tochkaMongo = { conn: null, promise: null };
}

export async function connectDb() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI не задан');
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
