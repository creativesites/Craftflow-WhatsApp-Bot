const express = require('express');
const bodyParser = require('body-parser');
const { WebhookClient } = require('dialogflow-fulfillment');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
app.use(bodyParser.json());

// OpenAI API Configuration
const openai = new OpenAIApi(
  new Configuration({
    apiKey: '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', // Set your OpenAI API key in an environment variable
  })
);

// Function to get a response from your fine-tuned model
async function getOpenAIResponse(prompt) {
  try {
    const response = await openai.createCompletion({
      model: 'ft:gpt-4o-2024-08-06:craftflow-technologies::AlFuv4AU', // Replace with your fine-tuned model ID
      prompt: prompt,
      max_tokens: 1500,
      temperature: 0.7,
    });
    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error('Error fetching OpenAI response:', error);
    return "Sorry, I'm having trouble finding the best response for you.";
  }
}

// Dialogflow Fulfillment Webhook
app.post('/webhook', async (req, res) => {
  const agent = new WebhookClient({ request: req, response: res });

  async function fallbackHandler(agent) {
    const userQuery = agent.query;
    const aiResponse = await getOpenAIResponse(userQuery);
    agent.add(aiResponse);
  }

  const intentMap = new Map();
  intentMap.set('Default Fallback Intent', fallbackHandler);

  agent.handleRequest(intentMap);
});

// Start the Express server
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});