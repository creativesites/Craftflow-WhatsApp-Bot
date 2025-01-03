import { User } from './models/User.js';
import { encoding_for_model } from '@dqbd/tiktoken';

const enc = encoding_for_model('gpt-4o'); // Replace with your model

export function countTokens(text) {
    return enc.encode(text).length;
}

export async function findOrCreateUser(chatId, name) {
    const phoneNumber = chatId.match(/^\d+/)[0];  // Extracts the phone number
    // Format the phone number with a plus sign
    const formattedPhoneNumber = `+${phoneNumber}`;
    let user = await User.findOne({ chatId });
    if (!user) {
        user = new User({
            chatId,
            name,
            formattedPhoneNumber,
            chatHistory: []
        });
        await user.save();
    }
    return user;
}

export async function addMessageToHistory(chatId, message) {
    await User.updateOne(
        { chatId },
        { $push: { chatHistory: message } }
    );
}

export async function trimChatHistory(chatId, maxTokens) {
    const user = await User.findOne({ chatId });
    if (!user) return;

    let totalTokens = 0;
    const trimmedHistory = [];

    for (let i = user.chatHistory.length - 1; i >= 0; i--) {
        const message = user.chatHistory[i];
        const messageTokens = countTokens(message.content);

        if (totalTokens + messageTokens > maxTokens) break;

        trimmedHistory.unshift(message);
        totalTokens += messageTokens;
    }

    user.chatHistory = trimmedHistory;
    await user.save();
}