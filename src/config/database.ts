import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      console.error('ERRO: MONGO_URI não está definida no arquivo .env');
      process.exit(1);
    }

    await mongoose.connect(mongoURI);
    console.log('Aplicação conectada ao MongoDB.');

  } catch (error: any) {
    console.error('Erro ao conectar com MongoDB:', error.message);
    process.exit(1);
  }
};

export default connectDB;