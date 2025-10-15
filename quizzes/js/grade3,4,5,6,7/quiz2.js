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

// ✅ Auto-detect grade from file name (e.g., grade3.html → Grade 3)
const currentPage = window.location.pathname;
const matchGrade = currentPage.match(/grade(\d+)/i);
const detectedGrade = matchGrade ? `Grade ${matchGrade[1]}` : "Unknown Grade";

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
        {
            question: "What are the three main parts of a story plot?",
            choices: ["Beginning, Middle, and End", "Characters, Setting, and Theme", "Problem, Solution, and Ending", "Title, Author, and Date"],
            answer: "Beginning, Middle, and End"
            // image: "../images/grade2/plot.png"
        },
        {
            question: "What is a “main character”?",
            choices: ["A background character in a story", "The person or animal the story is mostly about", "The author of the story", "A minor detail in the story"],
            answer: "The person or animal the story is mostly about"
            // image: "../images/grade2/character.png"
        },
        {
            question: "Why is it important to have a good setting in your story?",
            choices: ["It helps readers imagine where and when the story happens", "It shows how long the story will be", "It tells what the main character looks like", "It makes the story shorter"],
            answer: "It helps readers imagine where and when the story happens"
            // image: "../images/grade2/setting.png"
        },
        {
            question: "What kind of problem could happen in the middle of a story?",
            choices: ["The character faces a challenge or conflict", "The story ends suddenly", "The author changes the title", "The setting disappears"],
            answer: "The character faces a challenge or conflict"
            // image: "../images/grade2/problem.png"
        },
        {
            question: "What is one way you can make your story ending exciting or surprising?",
            choices: ["Repeat the same events again", "Introduce a twist or unexpected event", "Add more characters", "Change the setting at the end"],
            answer: "Introduce a twist or unexpected event"
            // image: "../images/grade2/ending.png"
        },
        {
            question: "What does “plot” mean in a story?",
            choices: ["The background of the story", "The clothes the character wears", "The beginning, middle, and end of a story", "The name of the Scratch project"],
            answer: "The beginning, middle, and end of a story"
            // image: "../images/grade2/plot2.png"
        },
        {
            question: "Which part of the story shows the most action or conflict?",
            choices: ["Beginning", "Middle", "End", "Title"],
            answer: "Middle"
            // image: "../images/grade2/action.png"
        },
        {
            question: "Which of the following is a good example of a story beginning?",
            choices: [
                "“The dragon eats the treasure and flies away.”",
                "“She solves the puzzle and opens the door.”",
                "“One morning, Max the cat woke up with a strange map in his paw.”",
                "“The villain disappears forever.”"
            ],
            answer: "“One morning, Max the cat woke up with a strange map in his paw.”"
            // image: "../images/grade2/beginning.png"
        },
        {
            question: "What can you use in Scratch to move your character into a new scene?",
            choices: ["A color effect", "The “switch backdrop” block", "The “say” block", "The paint tool"],
            answer: "The “switch backdrop” block"
            // image: "../images/grade2/scratch.png"
        },
        {
            question: "Why is feedback helpful for your story plot?",
            choices: ["So your friends can copy your idea", "To make your story longer", "To improve your story and fix problems", "So you don’t have to finish your work"],
            answer: "To improve your story and fix problems"
            // image: "../images/grade2/feedback.png"
        }
    ];

    for (const q of rawQuestions) {
        q.hashedAnswer = await hashString(q.answer);
        questions.push(q);
    }
}

// Helper function to safely escape HTML special characters
function escapeHTML(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function showQuestion(index) {
    const q = questions[index];
    quizContent.innerHTML = "";

    // Escape special characters in question text
    const questionP = document.createElement("p");
    questionP.innerHTML = `<strong>Question ${index + 1}:</strong> ${escapeHTML(q.question)}`;
    quizContent.appendChild(questionP);

    // ✅ Add image if available
    if (q.image) {
        const img = document.createElement("img");
        img.src = q.image;
        img.alt = "Question image";
        img.style.maxWidth = "300px";
        img.style.display = "block";
        img.style.margin = "10px auto";
        quizContent.appendChild(img);
    }

    // ✅ Make a copy of the choices and shuffle them
    const shuffledChoices = [...q.choices].sort(() => Math.random() - 0.5);

    const choicesDiv = document.createElement("div");
    choicesDiv.className = "choices";

    shuffledChoices.forEach((choice, i) => {
        const label = document.createElement("label");
        const input = document.createElement("input");
        input.type = "radio";
        input.name = `question${index}`;
        input.value = choice; // ✅ Store choice text instead of index

        // If previously selected, restore checked state
        if (studentAnswers[index] === choice) input.checked = true;

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
    studentAnswers[currentQuestion] = selected ? selected.value : null;
}

// Calculate score
async function calculateScore() {
    let score = 0;
    for (let i = 0; i < questions.length; i++) {
        const selectedChoice = studentAnswers[i];
        if (!selectedChoice) continue;
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
        gender: document.getElementById("studentGender").value,
        grade: detectedGrade  // ✅ Automatically included grade
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
            row.innerHTML = `
                <td>${r.name}</td>
                <td>${r.gender}</td>
                <td>${r.grade || "Unknown"}</td>
                <td>${r.score}</td>
                <td class="action-col"><button class="deleteBtn" data-index="${index}">Delete</button></td>
            `;
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
document.addEventListener("contextmenu", e => e.preventDefault());

// Disable common DevTools shortcuts
document.addEventListener("keydown", (e) => {
    if (e.key === "F12") e.preventDefault();
    if (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase())) e.preventDefault();
    if (e.ctrlKey && e.key.toLowerCase() === "u") e.preventDefault();
});
