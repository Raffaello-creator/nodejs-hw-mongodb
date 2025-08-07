import mongoose from 'mongoose';

export const initMongoConnection = async () => {
  try {
    const { MONGODB_USER, MONGODB_PASSWORD, MONGODB_URL, MONGODB_DB } =
      process.env;

    const connectionString = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_URL}/${MONGODB_DB}?retryWrites=true&w=majority`;

    console.log('Trying to connect to Mongo with:', {
      user: MONGODB_USER,
      pass: MONGODB_PASSWORD ? '***' : 'missing',
      url: MONGODB_URL,
      db: MONGODB_DB,
    });

    await mongoose.connect(connectionString);
    console.log('Mongo connection successfully established!');
  } catch (error) {
    console.error('Mongo connection failed:', error.message);
    process.exit(1);
  }
};
