import { Schema, model } from 'mongoose';

const messageSchema = new Schema({
    role: { type: String, required: true }, // 'user' or 'assistant'
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

const userSchema = new Schema({
    chatId: { type: String, unique: true, required: true }, // Primary key
    name: { type: String },
    phone: { type: String, required: false },
    chatHistory: [messageSchema],
    metadata: { type: Object, default: {} }
});

export const User = model('User', userSchema);