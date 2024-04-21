import express from "express";
import session from "express-session";
import crypto from 'crypto';
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bodyParser from "body-parser";

import dotenv from 'dotenv';
dotenv.config();

import { OpenAI } from 'openai';

const app = express();
const port = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const openai = new OpenAI();

const secretKey = crypto.randomBytes(32).toString('hex');
// console.log('Generated secret key:', secretKey);
app.use(session({
    secret: secretKey, // Use your generated secret key here
    resave: false,
    saveUninitialized: true,
}));



// req.session.messagesHistory = [
//     {
//         role: 'system',
//         content: 'You are an experienced programming tutor and I am a student asking you for help with my Python code.\
//             Use the Socratic method to ask me one question at a time or give me one hint at a time in order to guide me to \
//             discover the answer on my own. Do NOT directly give me the answer. Even if I give up and ask you for the answer, \
//             do not give me the answer. Instead, ask me just the right question at each point to get me to think for myself. Do\
//             NOT edit my code or write new code for me since that might give away the answer. Instead, give me hints of where \
//             to look in my existing code for where the problem might be. You can also print out specific parts of my code to point\
//              me in the right direction. Do NOT use advanced concepts that students in an introductory class have not learned yet. \
//              Instead, use concepts that are taught in introductory-level classes and beginner-level programming tutorials. Also, \
//              prefer the Python standard library and built-in features over external libraries.'
//         // content: 'You are an experienced debugging tutor and I am a student asking you for help with debugging my Python code. \
//         // You should not only teach me Python, but you should also teach me important debugging strategies so I can learn to debug \
//         // on my own. For example, you could start by helping me identify the type of error. Then, help me identify where in my code \
//         // the error message might be. When we identify the issue in the code, also explain the error message and Python concepts to \
//         // me. Do not jump to the answer right away.\
//         // Use the Socratic method to ask me one question at a time or give me one hint at a time in order to guide me to discover the \
//         // answer on my own. Do NOT directly give me the answer. Even if I give up and ask you for the answer, do not give me the answer. \
//         // Instead, ask me just the right question at each point to get me to think for myself. \
//         // Instead of asking open-ended questions, try to ask multiple choice questions. Always add a "I don\'t know" option in the answer\
//         //  choices. When you ask the question, you should know what the correct answer is. Then, compare it to the answer I give you. If \
//         //  you ask a follow-up question, you should try to ask it as a multiple choice question if applicable. Do NOT edit my code or write \
//         //  new code for me since that might give away the answer. Instead, give me hints of where to look \
//         // in my existing code for where the problem might be. You can also print out specific parts of my code to point me in the right \
//         // direction. Do NOT use advanced concepts that students in an introductory class have not learned yet. Instead, use concepts that \
//         // are taught in introductory-level classes and beginner-level programming tutorials. Also, prefer the Python standard library and built-in \
//         // features over external libraries. Remember, it is important to ask multiple-choice questions where applicable, rather than open-ended questions.\
//         // When you give the answer choices, format it as "A) ___, B) ____, etc." Remember to add a "I don\'t know" option.'
//     },

// ];

// req.session.firstRun = true;

app.use((req, res, next) => {
    if (!req.session.messagesHistory) {
        req.session.messagesHistory = [
            {
                role: 'system',
                content: 'You are an experienced programming tutor and I am a student asking you for help with my Python code.\
                    Use the Socratic method to ask me one question at a time or give me one hint at a time in order to guide me to \
                    discover the answer on my own. Do NOT directly give me the answer. Even if I give up and ask you for the answer, \
                    do not give me the answer. Instead, ask me just the right question at each point to get me to think for myself. Do\
                    NOT edit my code or write new code for me since that might give away the answer. Instead, give me hints of where \
                    to look in my existing code for where the problem might be. You can also print out specific parts of my code to point\
                     me in the right direction. Do NOT use advanced concepts that students in an introductory class have not learned yet. \
                     Instead, use concepts that are taught in introductory-level classes and beginner-level programming tutorials. Also, \
                     prefer the Python standard library and built-in features over external libraries.'
                // content: 'You are an experienced debugging tutor and I am a student asking you for help with debugging my Python code. \
                // You should not only teach me Python, but you should also teach me important debugging strategies so I can learn to debug \
                // on my own. For example, you could start by helping me identify the type of error. Then, help me identify where in my code \
                // the error message might be. When we identify the issue in the code, also explain the error message and Python concepts to \
                // me. Do not jump to the answer right away.\
                // Use the Socratic method to ask me one question at a time or give me one hint at a time in order to guide me to discover the \
                // answer on my own. Do NOT directly give me the answer. Even if I give up and ask you for the answer, do not give me the answer. \
                // Instead, ask me just the right question at each point to get me to think for myself. \
                // Instead of asking open-ended questions, try to ask multiple choice questions. Always add a "I don\'t know" option in the answer\
                //  choices. When you ask the question, you should know what the correct answer is. Then, compare it to the answer I give you. If \
                //  you ask a follow-up question, you should try to ask it as a multiple choice question if applicable. Do NOT edit my code or write \
                //  new code for me since that might give away the answer. Instead, give me hints of where to look \
                // in my existing code for where the problem might be. You can also print out specific parts of my code to point me in the right \
                // direction. Do NOT use advanced concepts that students in an introductory class have not learned yet. Instead, use concepts that \
                // are taught in introductory-level classes and beginner-level programming tutorials. Also, prefer the Python standard library and built-in \
                // features over external libraries. Remember, it is important to ask multiple-choice questions where applicable, rather than open-ended questions.\
                // When you give the answer choices, format it as "A) ___, B) ____, etc." Remember to add a "I don\'t know" option.'
            },
        ];
    }
    if (typeof req.session.firstRun === 'undefined') {
        req.session.firstRun = true;
    }
    next();
});
function parseCode(code) {
    const lines = code.split(/\r?\n/); // Splits by either \n or \r\n
    // console.log(lines);

    const result = [];

    for (let i = 0; i < lines.length; i++) {
        result.push((i + 1) + ". " + lines[i]);
    }

    // console.log(result);

    const concatenatedString = result.join("\n");

    // console.log(concatenatedString);

    return concatenatedString;

}

async function codeEditor(code) {
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'system',
                content: 'You are a Python interpreter. You will receive a python code and you will reply with what the python output should show. You should only reply with the terminal output inside one unique code block, and nothing else. Do no write explanations, output only what python outputs. And, pay attention to indentation errors.'
            },
            {
                role: 'user',
                content: code
            }
        ]
    });

    return response.choices[0].message.content;
}

async function outputChecker(output) {
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'system',
                content: 'You are a bug checker in Python. You will be given the output from a Python interpreter. You will check if the output says if there is an error or not. You will say "yes" if there is an error indicated in the output. You will say "no" if there is not an error indicated in the output.'
            },
            {
                role: 'user',
                content: output
            },
        ]
    });

    return response.choices[0].message.content;
}

async function codeDebugger(messages) {
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages
    });

    return response.choices[0].message.content;
}
// HTML and CSS
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, "public")));

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    var output = "";
    var code = "";
    var debuggerMessage = ""
    var error = ""
    res.render('index', { content: output, code: code, error: error, tutor: debuggerMessage }, (err, html) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            res.send(html);
        }
    });
});

app.post("/codeRun", async (req, res) => {

    // console.log("Using Body-parser: ", req.body.code);
    var code = req.body.code;
    // console.log("with variable ", code);
    var codeLines = parseCode(code);
    console.log(codeLines);
    var output = await codeEditor(codeLines);
    console.log("Output- ", output);
    var error = await outputChecker(output);
    console.log(error)
    var temp_dict = {};
    var userCode = {}
    userCode["role"] = "user";
    userCode["content"] = `This is my code - ${codeLines}. The output I am getting is - ${output}`;
    console.log("First Temp dict - ", userCode)
    req.session.messagesHistory.push(userCode);
    console.log("Messages history after first temp dict")
    console.log(req.session.messagesHistory)

    if (error == "yes") {
        var debuggerMessage = "It looks like we got an error. When I start debugging, I like to remind myself of the purpose of my code. Sometimes, that helps me figure out the issue faster. Could you describe what your code is supposed to do?";

    }
    else {
        var debuggerMessage = "The output doesn't show that your code has an error. Is your code behaving in the way you expect it to?";
    }
    if (req.session.firstRun) {
        temp_dict["role"] = "assistant";
        temp_dict["content"] = debuggerMessage;
        console.log("Second Temp dict - ", temp_dict)
        req.session.messagesHistory.push(temp_dict);
        console.log("Messages history after second temp dict")
        console.log(req.session.messagesHistory)
    }
    else {
        var tutor = await codeDebugger(req.session.messagesHistory);
        console.log(tutor)
        var debuggerMessage = tutor
        // res.status(200).send(tutor);

    }

    req.session.firstRun = false;

    // res.render('index', { content: output, code: code, error: error, tutor: debuggerMessage }, (err, html) => {
    //     if (err) {
    //         console.error(err);
    //         res.status(500).send('Internal Server Error');
    //     } else {
    //         res.send(html);
    //     }
    // });
    var result = { debuggerMessage: debuggerMessage, output: output }
    res.status(200).send(result);

});

app.post('/chatgpt', async (req, res) => {
    var messageContent = req.body.content;
    // You can handle the message content here (e.g., store it in a database)
    // For demonstration purposes, I'm just logging it to the console
    console.log('Received message:', messageContent);
    // messageContent = messageContent + " When you ask the question, you should know what the correct answer is. Then, compare it to the answer I give you. \
    // Remember to ask questions in the form of multiple choice questions when applicable. The multiple choice question\
    // should be in the form 'A) ___, B) ____, etc.' Remember to add a 'I don\'t know' option. "

    var temp_dict = {}
    temp_dict["role"] = "user";
    temp_dict["content"] = messageContent;
    req.session.messagesHistory.push(temp_dict);
    console.log(req.session.messagesHistory);
    var tutor = await codeDebugger(req.session.messagesHistory);
    console.log(tutor)
    var chatgptResponse = {}
    chatgptResponse["role"] = "assistant";
    chatgptResponse["content"] = tutor;
    req.session.messagesHistory.push(chatgptResponse);
    console.log(req.session.messagesHistory);
    // res.status(200).send('Message sent successfully');
    res.status(200).send(tutor);
});
app.get('/reset-session', (req, res) => {
    // Reset session-specific data or variables
    req.session.messagesHistory = [
        {
            role: 'system',
            content: 'You are an experienced programming tutor and I am a student asking you for help with my Python code.\
                Use the Socratic method to ask me one question at a time or give me one hint at a time in order to guide me to \
                discover the answer on my own. Do NOT directly give me the answer. Even if I give up and ask you for the answer, \
                do not give me the answer. Instead, ask me just the right question at each point to get me to think for myself. Do\
                NOT edit my code or write new code for me since that might give away the answer. Instead, give me hints of where \
                to look in my existing code for where the problem might be. You can also print out specific parts of my code to point\
                 me in the right direction. Do NOT use advanced concepts that students in an introductory class have not learned yet. \
                 Instead, use concepts that are taught in introductory-level classes and beginner-level programming tutorials. Also, \
                 prefer the Python standard library and built-in features over external libraries.'
            // content: 'You are an experienced debugging tutor and I am a student asking you for help with debugging my Python code. \
            // You should not only teach me Python, but you should also teach me important debugging strategies so I can learn to debug \
            // on my own. For example, you could start by helping me identify the type of error. Then, help me identify where in my code \
            // the error message might be. When we identify the issue in the code, also explain the error message and Python concepts to \
            // me. Do not jump to the answer right away.\
            // Use the Socratic method to ask me one question at a time or give me one hint at a time in order to guide me to discover the \
            // answer on my own. Do NOT directly give me the answer. Even if I give up and ask you for the answer, do not give me the answer. \
            // Instead, ask me just the right question at each point to get me to think for myself. \
            // Instead of asking open-ended questions, try to ask multiple choice questions. Always add a "I don\'t know" option in the answer\
            //  choices. When you ask the question, you should know what the correct answer is. Then, compare it to the answer I give you. If \
            //  you ask a follow-up question, you should try to ask it as a multiple choice question if applicable. Do NOT edit my code or write \
            //  new code for me since that might give away the answer. Instead, give me hints of where to look \
            // in my existing code for where the problem might be. You can also print out specific parts of my code to point me in the right \
            // direction. Do NOT use advanced concepts that students in an introductory class have not learned yet. Instead, use concepts that \
            // are taught in introductory-level classes and beginner-level programming tutorials. Also, prefer the Python standard library and built-in \
            // features over external libraries. Remember, it is important to ask multiple-choice questions where applicable, rather than open-ended questions.\
            // When you give the answer choices, format it as "A) ___, B) ____, etc." Remember to add a "I don\'t know" option.'
        },
    ];
    req.session.firstRun = true;
    console.log("Reset session confirming - ")
    console.log(req.session.messagesHistory)
    res.send('Session reset successful');
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`);
});