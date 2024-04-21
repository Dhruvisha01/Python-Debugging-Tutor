// document.addEventListener('DOMContentLoaded', function () {
//     var paragraph = document.getElementById("myParagraph");
//     paragraph.textContent = "This content is manipulated by script.js";
// });



document.addEventListener('DOMContentLoaded', function () {

    const codeEditor = document.getElementById('codeEditor');
    codeEditor.addEventListener('submit', function (event) {
        event.preventDefault();
        const codeArea = document.querySelector('.actual-input');
        const codeContent = codeArea.value;
        const outputArea = document.querySelector('.outputValue');
        // const outputContent = outputArea.value;
        // AJAX request to send code data to the server
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/codeRun', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    // Clear textarea after sending message
                    // textarea.value = '';
                    const responseMessage = JSON.parse(xhr.responseText);
                    const debuggerMessage = responseMessage.debuggerMessage;
                    const outputContent = responseMessage.output;
                    const debuggerMessageDiv = document.createElement('div');
                    debuggerMessageDiv.classList.add('message');
                    debuggerMessageDiv.innerHTML = `
                        <div class="message-header">
                            <img class="message-icon" src="/images/tutor-icon.png" alt="icon">
                            <h6 class="inter-semibold">Debugging Tutor</h6>
                        </div>
                        <div class="message-content">
                            <p class="inter-regular">${debuggerMessage}</p>
                        </div>
                    `;
                    document.querySelector('.messages').appendChild(debuggerMessageDiv);
                    codeArea.value = codeContent;
                    outputArea.innerHTML = outputContent;

                    scrollToBottom();

                } else {
                    console.error('Error sending message:', xhr.status);
                }
            }
        };
        xhr.send(JSON.stringify({ code: codeContent }));
    });





    const form = document.getElementById('chatForm');
    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent de fault form submission behavior

        const textarea = document.querySelector('.input-message');
        const messageContent = textarea.value;

        // AJAX request to send form data to the server
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/chatgpt', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    const newMessageDiv = document.createElement('div');
                    newMessageDiv.classList.add('message');
                    newMessageDiv.innerHTML = `
                        <div class="message-header">
                            <img class="message-icon" src="/images/user-icon.png" alt="icon">
                            <h6 class="inter-semibold">You</h6>
                        </div>
                        <div class="message-content">
                            <p class="inter-regular">${messageContent}</p>
                        </div>
                    `;
                    document.querySelector('.messages').appendChild(newMessageDiv);


                    // Clear textarea after sending message
                    textarea.value = '';
                    scrollToBottom();
                    // const response = JSON.parse(xhr.responseText);
                    // const newMessage = response.message; // Assuming your server sends back a 'message' property
                    const newMessage = xhr.responseText;

                    const tutorMessageDiv = document.createElement('div');
                    tutorMessageDiv.classList.add('message');
                    tutorMessageDiv.innerHTML = `
                        <div class="message-header">
                            <img class="message-icon" src="/images/tutor-icon.png" alt="icon">
                            <h6 class="inter-semibold">Debugging Tutor</h6>
                        </div>
                        <div class="message-content">
                            <p class="inter-regular">${newMessage}</p>
                        </div>
                    `;
                    // document.querySelector('.messages').appendChild(tutorMessageDiv);
                    setTimeout(function () {
                        // Append the debug tutor message after the delay
                        document.querySelector('.messages').appendChild(tutorMessageDiv);
                        scrollToBottom(); // Scroll to the bottom after both messages are added
                    }, 1000);
                    scrollToBottom();

                } else {
                    console.error('Error sending message:', xhr.status);
                }
            }
        };
        xhr.send(JSON.stringify({ content: messageContent }));
    });
});

function scrollToBottom() {
    var chatbox = document.getElementById('messages');
    chatbox.scrollTop = chatbox.scrollHeight;
}

window.addEventListener('beforeunload', function (event) {
    // Send an asynchronous request to the server to reset the session
    fetch('/reset-session', {
        method: 'GET',
        credentials: 'same-origin' // Include credentials if needed (e.g., for cookies)
    })
        .then(response => {
            if (response.ok) {
                console.log('Session reset successfully');
            } else {
                console.error('Failed to reset session');
            }
        })
        .catch(error => {
            console.error('Error occurred:', error);
        });
});
