import express from 'express';
import bodyParser from 'body-parser';
import PQueue from 'p-queue';
import mongoose from 'mongoose';
import { handleUserMessage } from './openai.js';

async function connectToDatabase() {
  try {
    await mongoose.connect('mongodb+srv://craftflowtechnologies:orx7LOaAADwH18sv@craftflowbot.85uhe.mongodb.net/?retryWrites=true&w=majority&appName=CraftflowBot', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB with Mongoose');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

connectToDatabase();

const queue = new PQueue({
  concurrency: 4,
  autoStart:false
});


const app = express();
app.use(bodyParser.json()); // Parse JSON payloads


// Webhook endpoint
app.post('/whatsapp', async (req, res) => {

  const event = req.body;
  //console.log('Webhook event received:', event);

  // Handle incoming messages
  if (event.event === 'onMessage' && event.data.isNewMsg) {
    const chatId = event.data.from;
    const msg = event.data.body;
    const name = event.data.notifyName;
    // Interact with OpenAI Assistant
    const reply = await handleUserMessage(chatId, msg, name);
    // Send the reply back via your WhatsApp webhook
    await respondToMessage(chatId, reply);
  }

  res.status(200).send('Event received');
});

// Function to send a message back via the EASY API
async function respondToMessage(chatId, text) {
  try {
    const response = await fetch('http://localhost:8002/sendText', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "args": {
          "to": chatId,
          "content": text
        }
      }),
    });
    if (response.ok) {
      console.log(`Message sent to ${chatId}: ${text}`);
    } else {
      console.error(`Failed to send message to ${chatId}:`, response.statusText);
    }
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

// Start the server
const PORT = process.env.PORT || 6014;
app.listen(PORT, () => console.log(`Webhook server running on port ${PORT}`));