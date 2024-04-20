require('dotenv').config(); 
const OpenAI = require('openai').OpenAI;
const openai = new OpenAI();

async function main() {
    await openai.chat.completions.create({
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