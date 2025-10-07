const studentForm = document.getElementById('studentForm');
const studentInfo = document.getElementById('studentInfo');
const quizContainer = document.getElementById('quizContainer');
const quizContent = document.getElementById('quizContent');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const resultBox = document.getElementById('resultBox');
const showHistoryBtn = document.getElementById('showHistoryBtn');
const historyTable = document.getElementById('historyTable');
const historyBody = historyTable.querySelector("tbody");

let currentQuestion = 0;
let studentAnswers = [];
let studentData = {};
let questions = [];

// Hashing function
async function hashString(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Initialize questions with hashed answers
async function initQuestions() {
    const rawQuestions = [
        { question: "Which file extension is commonly used for an HTML file?", choices: [".txt", ".docx", ".html", ".css"], answer: ".html" },
        { question: "What is the correct boilerplate code to start an HTML document?", choices: ["<doc html>", "<html><head></head><body></body></html>", "<html start>", "<htmlpage>"], answer: "<html><head></head><body></body></html>" },
        { question: "Which declaration tells the browser that a document is HTML5?", choices: ["<doctype=5>", "<!DOCTYPE html>", "<html5>", "<doctype html5>"], answer: "<!DOCTYPE html>" },
        { question: "In HTML, which of the following is an element?", choices: ["<p>", "class", "id", "style=\"color:red;\""], answer: "<p>" },
        { question: "What is an attribute in HTML?", choices: ["The visible text inside an element", "Extra information added to an element inside the opening tag", "A type of heading", "The closing part of an element"], answer: "Extra information added to an element inside the opening tag" },
        { question: "Which HTML tag is used for the largest heading?", choices: ["<h6>", "<h3>", "<h1>", "<heading>"], answer: "<h1>" },
        { question: "Which tag is used to define a paragraph in HTML?", choices: ["<par>", "<p>", "<para>", "<text>"], answer: "<p>" },
        { question: "What is the difference between an opening tag and a closing tag?", choices: ["Opening tag has /, closing tag does not", "Closing tag has /, opening tag does not", "Both have /", "Neither has /"], answer: "Closing tag has /, opening tag does not" },
        { question: "In HTML, what is the 'value'?", choices: ["The text inside the body", "The data given to an attribute", "The name of a tag", "The number of elements on the page"], answer: "The data given to an attribute" },
        { question: "In HTML, what is 'content'?", choices: ["The text or elements placed between opening and closing tags", "The CSS style rules", "The name of the file", "The attributes inside a tag"], answer: "The text or elements placed between opening and closing tags" },
        { question: "Which of the following is an example of a void (empty) element in HTML?", choices: ["<p>", "<h1>", "<br>", "<div>"], answer: "<br>" },
        { question: "Where should the <title> tag be placed in an HTML document?", choices: ["Inside <body>", "Inside <head>", "At the very bottom of the page", "Before <!DOCTYPE html>"], answer: "Inside <head>" },
        { question: "Which of the following is the correct way to add an attribute to a tag?", choices: ["<p class=\"intro\">Hello</p>", "<p class.intro>Hello</p>", "<p:class=intro>Hello</p>", "<p class-intro>Hello</p>"], answer: "<p class=\"intro\">Hello</p>" },
        { question: "What does <body> represent in an HTML document?", choices: ["Metadata about the webpage", "The visible content shown in the browser", "The CSS stylesheet", "The JavaScript code"], answer: "The visible content shown in the browser" },
        { question: "Which HTML element is used to insert a line break?", choices: ["<break>", "<lb>", "<br>", "<line>"], answer: "<br>" },
        { question: "Which tag is used to create the smallest heading in HTML?", choices: ["<heading>", "<h6>", "<h1>", "<head>"], answer: "<h6>" },
        { question: "What attribute is required inside the <img> tag to make a image work?", choices: ["src", "href", "alt", "title"], answer: "src" },
        { question: "Which HTML tag is used to create a hyperlink?", choices: ["<link>", "<href>", "<a>", "<url>"], answer: "<a>" },
        { question: "What attribute is required inside the <a> tag to make a link work?", choices: ["src", "href", "alt", "title"], answer: "href" },
        { question: "Which HTML tag is used to display an image?", choices: ["<pic>", "<img>", "<image>", "<src>"], answer: "<img>" }
    ];

    for (const q of rawQuestions) {
        q.hashedAnswer = await hashString(q.answer);
        questions.push(q);
    }
}

// Show question
function showQuestion(index) {
    const q = questions[index];

    // Clear the container
    quizContent.innerHTML = "";

    // Question text
    const questionP = document.createElement("p");
    questionP.innerHTML = `<strong>Question ${index + 1}:</strong> `;
    const questionText = document.createTextNode(q.question);
    questionP.appendChild(questionText);
    quizContent.appendChild(questionP);

    // Choices
    const choicesDiv = document.createElement("div");
    choicesDiv.className = "choices";

    q.choices.forEach((choice, i) => {
        const label = document.createElement("label");

        const input = document.createElement("input");
        input.type = "radio";
        input.name = `question${index}`;
        input.value = i;
        if (studentAnswers[index] == i) input.checked = true;

        const choiceText = document.createTextNode(choice);

        label.appendChild(input);
        label.appendChild(choiceText);

        choicesDiv.appendChild(label);
    });

    quizContent.appendChild(choicesDiv);

    prevBtn.classList.remove("hidden");
    nextBtn.textContent = (index === questions.length - 1) ? "Submit" : "Next";
}

// Save answer
function saveAnswer() {
    const selected = document.querySelector(`input[name="question${currentQuestion}"]:checked`);
    studentAnswers[currentQuestion] = selected ? parseInt(selected.value) : null;
}

// Calculate score using hashed answers
async function calculateScore() {
    let score = 0;
    for (let i = 0; i < questions.length; i++) {
        const selectedIndex = studentAnswers[i];
        if (selectedIndex === null || selectedIndex === undefined) continue;
        const selectedChoice = questions[i].choices[selectedIndex];
        const hashedChoice = await hashString(selectedChoice);
        if (hashedChoice === questions[i].hashedAnswer) score++;
    }
    return score;
}

// Start quiz
studentForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    studentData = {
        name: document.getElementById("studentName").value.trim(),
        gender: document.getElementById("studentGender").value
    };
    historyTable.style.display = "none";
    showHistoryBtn.textContent = "Submit History";
    studentInfo.classList.add("hidden");
    quizContainer.classList.remove("hidden");

    await initQuestions();
    showQuestion(currentQuestion);
});

// Next button
nextBtn.addEventListener("click", async function () {
    saveAnswer();
    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        showQuestion(currentQuestion);
    } else {
        const score = await calculateScore();
        studentData.score = score;
        let results = JSON.parse(localStorage.getItem("quizResults")) || [];
        results.push(studentData);
        localStorage.setItem("quizResults", JSON.stringify(results));

        quizContainer.classList.add("hidden");
        resultBox.classList.remove("hidden");
        resultBox.innerHTML = `<p>Thank you, ${studentData.name}! 🎉 You scored ${score} out of ${questions.length}.</p>
        <div style="margin-top:15px; display:flex; gap:10px; justify-content:center;">
            <button id="viewResultBtn">View Result</button>
            <button id="homeBtn">Home</button>
        </div>`;

        document.getElementById("viewResultBtn").addEventListener("click", () => {
            showHistoryBtn.click();
            historyTable.scrollIntoView({ behavior: "smooth" });
        });
        document.getElementById("homeBtn").addEventListener("click", () => location.reload());
    }
});

// Previous button
prevBtn.addEventListener("click", () => {
    saveAnswer();
    if (currentQuestion > 0) {
        currentQuestion--;
        showQuestion(currentQuestion);
    } else {
        quizContainer.classList.add("hidden");
        studentInfo.classList.remove("hidden");
    }
});

// Show/hide history
showHistoryBtn.addEventListener("click", () => {
    if (historyTable.style.display === "none" || historyTable.style.display === "") {
        const results = JSON.parse(localStorage.getItem("quizResults")) || [];
        historyBody.innerHTML = "";
        results.forEach((r, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${r.name}</td><td>${r.gender}</td><td>${r.score}</td>
            <td class="action-col"><button class="deleteBtn" data-index="${index}">Delete</button></td>`;
            historyBody.appendChild(row);
        });
        historyTable.style.display = "table";
        showHistoryBtn.textContent = "Hide History";
    } else {
        historyTable.style.display = "none";
        showHistoryBtn.textContent = "Submit History";
    }
});

// Toggle Action column
document.addEventListener("keydown", (e) => {
    if (e.key === "F4") {
        e.preventDefault();
        document.querySelectorAll(".action-col").forEach(col => {
            col.style.display = (col.style.display === "none" || col.style.display === "") ? "table-cell" : "none";
        });
    }
});

// Delete row
historyBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("deleteBtn")) {
        const index = e.target.dataset.index;
        let results = JSON.parse(localStorage.getItem("quizResults")) || [];
        results.splice(index, 1);
        localStorage.setItem("quizResults", JSON.stringify(results));
        e.target.closest("tr").remove();
    }
});

// Enter key handling
quizContainer.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        const selected = document.querySelector(`input[name="question${currentQuestion}"]:checked`);
        if (selected) nextBtn.click();
        else alert("Please select an option before proceeding!");
    }
});

// Disable right-click
document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    // alert("Right-click is disabled on this page!");
});

// Disable common DevTools shortcuts
document.addEventListener("keydown", function (e) {
    // F12
    if (e.key === "F12") e.preventDefault();
    // Ctrl+Shift+I
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i") e.preventDefault();
    // Ctrl+Shift+J
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "j") e.preventDefault();
    // Ctrl+U (view source)
    if (e.ctrlKey && e.key.toLowerCase() === "u") e.preventDefault();
    // Ctrl+Shift+C (inspect element)
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "c") e.preventDefault();
});

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function escapeHTML(str) {
    return str.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

