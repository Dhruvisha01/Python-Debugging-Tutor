import dotenv from 'dotenv';
dotenv.config();

import { OpenAI } from 'openai';
// const OpenAI = require('openai').OpenAI;
const openai = new OpenAI();

async function main() {
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'system',
                content: 'You are Bob, a kind and friendly chatbot'
            },
            {
                role: 'user',
                content: 'Hello! What is your name?'
            }
        ]
    });

    console.log(response.choices[0].message.content)
}

main()