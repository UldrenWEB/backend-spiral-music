import mongoose from 'mongoose';

export const RoleSchema = new mongoose.Schema({
    idRol: { type: String, required: true, unique: true },
    description: { type: String, required: true },
  });
  
