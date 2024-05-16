const mongoose = require("mongoose");

const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;

const MONGO_URI =
  process.env.MONGO_URI ||
  `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin`;

const connectDB = async () => {
  const dbURI = MONGO_URI;

  try {
    await mongoose.connect(dbURI);
    console.log("Conectado ao MongoDB.");
  } catch (err) {
    console.error("Erro ao conectar com MongoDB:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
