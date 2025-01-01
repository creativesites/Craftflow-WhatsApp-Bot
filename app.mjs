import { create, Client, decryptMedia, ev } from '@open-wa/wa-automate';
import PQueue from 'p-queue';
import OpenAI from "openai";

const queue = new PQueue({
    concurrency: 4,
    autoStart:false
});
  
const openai = new OpenAI({
  apiKey: "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",
});
  
  async function start(client) {
    const proc = async message => {
        //do something with the message here
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            store: true,
            messages: [
              {"role": "user", "content": message.body},
            ],
          });
          console.log(message)
          await client.sendText(message.from, result.choices[0].message);
          return true;
    }
      
    const processMessage = message => queue.add(()=>proc(message));
    const unreadMessages = await client.getAllUnreadMessages();
    unreadMessages.forEach(processMessage)
    await client.onMessage(processMessage);
    queue.start();
  }
  
  create().then(client => start(client));
  
  //create takes 1 argument and that is the config object :
  // https://docs.openwa.dev/interfaces/api_model_config.ConfigObject.html
  
  create({
    // For Mac:
    //executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    // For Windows:
    // executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    autoRefresh:true,
    cacheEnabled:false,
    customUserAgent: 'some custom user agent'
  })
  .then(client => start(client));