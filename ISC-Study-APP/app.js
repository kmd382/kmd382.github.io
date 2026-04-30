// --- State Variables (The Wizard's Memory) 🧠 ---
let currentQuestionIndex = 0;
let score = parseInt(localStorage.getItem('iscQuestScore')) || 0;
let streak = parseInt(localStorage.getItem('iscQuestStreak')) || 0;
let questionsData = [];

// --- DOM Elements (The Magical Artifacts) 🏺 ---
const rankIcon = document.getElementById('rank-icon');
const rankTitle = document.getElementById('rank-title');
const scoreValue = document.getElementById('score-value');
const streakValue = document.getElementById('streak-value');
const questProgress = document.getElementById('quest-progress');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const feedbackBox = document.getElementById('feedback-box');
const feedbackTitle = document.getElementById('feedback-title');
const feedbackExplanation = document.getElementById('feedback-explanation');
const nextBtn = document.getElementById('next-btn');

// --- Initialization Spell 🌅 ---
async function startQuest() {
    updateStreak();
    updateRankAndScore();

    try {
        const response = await fetch('questions.json');
        const data = await response.json();
        
        // Bonus: Shuffle the questions so every study session is unique!
        questionsData = data.questions.sort(() => Math.random() - 0.5); 
        
        questProgress.max = questionsData.length;
        renderQuestion();
    } catch (error) {
        console.error("The summoning failed! 👺", error);
        questionText.innerText = "Error loading the scroll. Make sure you are running a local server to fetch the JSON.";
    }
}

// --- Tracking the Dragon Fire (Daily Streaks) 🐉🔥 ---
function updateStreak() {
    const today = new Date().toDateString();
    const lastPlayed = localStorage.getItem('iscLastPlayed');

    if (lastPlayed) {
        const lastDate = new Date(lastPlayed);
        const currentDate = new Date(today);
        const diffTime = Math.abs(currentDate - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

        if (diffDays === 1) {
            // Played yesterday, keep the streak going!
            streak++;
        } else if (diffDays > 1) {
            // Missed a day, dragon went to sleep.
            streak = 1; 
        }
        // If diffDays === 0, they already played today, streak stays the same.
    } else {
        // First time playing!
        streak = 1;
    }

    localStorage.setItem('iscLastPlayed', today);
    localStorage.setItem('iscQuestStreak', streak);
    streakValue.innerText = streak;
}

// --- The Leveling System 🔮 ---
function updateRankAndScore() {
    scoreValue.innerText = score;
    localStorage.setItem('iscQuestScore', score);

    if (score < 50) {
        rankIcon.innerText = "🧑‍🎓"; rankTitle.innerText = "Peasant Bookkeeper";
    } else if (score < 150) {
        rankIcon.innerText = "🧙‍♂️"; rankTitle.innerText = "Apprentice of the Ledger";
    } else if (score < 300) {
        rankIcon.innerText = "🛡️"; rankTitle.innerText = "Knight of Compliance";
    } else if (score < 500) {
        rankIcon.innerText = "🦅"; rankTitle.innerText = "Lord of the SOC Reports";
    } else {
        rankIcon.innerText = "🐉✨"; rankTitle.innerText = "Grand Audit Wizard";
    }
}

// --- Render the Challenge 👁️ ---
function renderQuestion() {
    feedbackBox.classList.add('hidden');
    optionsContainer.innerHTML = ''; 
    questProgress.value = currentQuestionIndex;

    const currentQ = questionsData[currentQuestionIndex];
    questionText.innerText = `Q${currentQuestionIndex + 1}: ${currentQ.questionText}`;

    currentQ.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.innerText = option;
        btn.onclick = () => checkAnswer(index, btn, currentQ);
        optionsContainer.appendChild(btn);
    });
}

// --- Evaluate the Spell (Check Answer) ⚡ ---
function checkAnswer(selectedIndex, clickedButton, currentQ) {
    // Disable all buttons so they can't guess again
    const allButtons = optionsContainer.querySelectorAll('button');
    allButtons.forEach(btn => btn.disabled = true);

    if (selectedIndex === currentQ.correctOptionIndex) {
        // Victory! ✨
        clickedButton.classList.add('correct-glow');
        feedbackTitle.innerText = "Correct! ✨🧚‍♂️";
        feedbackTitle.style.color = "green";
        
        // Add 10 Gold Coins to score
        score += 10;
        updateRankAndScore();

        // Trigger Canvas Confetti 🎉
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#f9a826', '#ccffcc', '#ffffff'] // Gold, Green, White
        });
    } else {
        // Damage! 👺
        clickedButton.classList.add('shake-error');
        feedbackTitle.innerText = "Incorrect! 👺⚡";
        feedbackTitle.style.color = "red";
        
        // Highlight the correct answer for them
        allButtons[currentQ.correctOptionIndex].classList.add('correct-glow');
    }

    // Show the specific explanation for the option they clicked
    feedbackExplanation.innerText = currentQ.explanations[selectedIndex];
    feedbackBox.classList.remove('hidden');
}

// --- Move to Next Challenge 🐎💨 ---
nextBtn.onclick = () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questionsData.length) {
        renderQuestion();
    } else {
        // Quest Complete!
        questProgress.value = questionsData.length;
        questionText.innerText = "🎉 Quest Complete! The scroll has been mastered.";
        optionsContainer.innerHTML = '';
        feedbackBox.classList.add('hidden');
        
        // Epic final confetti blast
        const duration = 3 * 1000;
        const end = Date.now() + duration;
        (function frame() {
            confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#f9a826'] });
            confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#f9a826'] });
            if (Date.now() < end) requestAnimationFrame(frame);
        }());
    }
};

// Start the adventure when the page loads
window.onload = startQuest;