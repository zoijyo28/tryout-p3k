// app.js
// Logika utama aplikasi kuis interaktif PPPK

import { allQuestions, sections, testTypes } from './questions.js';
import { competencies } from './competencies.js';

// --- DOM Elements ---
const quizSelectionScreen = document.getElementById('quizSelectionScreen');
const quizScreen = document.getElementById('quizScreen');
const resultScreen = document.getElementById('resultScreen');

const sectionButtonsContainer = document.getElementById('sectionButtons');
const typeButtonsContainer = document.getElementById('typeButtons');
const startQuizBtn = document.getElementById('startQuizBtn');

const currentQuestionNumberSpan = document.getElementById('currentQuestionNumber');
const totalQuestionsSpan = document.getElementById('totalQuestions');
const quizSectionNameSpan = document.getElementById('quizSectionName');
const quizTypeNameSpan = document.getElementById('quizTypeName');
const questionTextElement = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const feedbackContainer = document.getElementById('feedbackContainer');
const feedbackText = document.getElementById('feedbackText');
const explanationText = document.getElementById('explanationText');
const competencyText = document.getElementById('competencyText');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

const finalScorePercentage = document.getElementById('finalScorePercentage');
const finalCorrectCount = document.getElementById('finalCorrectCount');
const finalTotalQuestions = document.getElementById('finalTotalQuestions');
const retakeQuizBtn = document.getElementById('retakeQuizBtn');

const viewHistoryBtn = document.getElementById('viewHistoryBtn');
const historyModal = document.getElementById('historyModal');
const closeHistoryModalBtn = document.getElementById('closeHistoryModalBtn');
const historyList = document.getElementById('historyList');
const noHistoryMessage = document.getElementById('noHistoryMessage');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

// --- Quiz State Variables ---
let currentSection = null;
let currentType = null;
let currentQuestions = []; // Questions for the current quiz session
let currentQuestionIndex = 0;
let userAnswers = []; // Stores user's selected option index for each question
let quizStarted = false; // To prevent multiple starts

// --- Utility Functions ---

// Shuffles an array (Fisher-Yates algorithm)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Gets competency description by name
function getCompetencyDescription(name) {
    const comp = competencies.find(c => c.name === name);
    return comp ? comp.description : "Deskripsi kompetensi tidak ditemukan.";
}

// --- Render Functions ---

// Renders section selection buttons
function renderSectionButtons() {
    sectionButtonsContainer.innerHTML = '';
    sections.forEach(section => {
        const button = document.createElement('button');
        button.textContent = section;
        button.classList.add('quiz-option-button');
        button.addEventListener('click', () => selectSection(section, button));
        sectionButtonsContainer.appendChild(button);
    });
}

// Renders test type selection buttons
function renderTypeButtons() {
    typeButtonsContainer.innerHTML = '';
    testTypes.forEach(type => {
        const button = document.createElement('button');
        button.textContent = type.toUpperCase(); // Display as MANSOKUL / TEKNIS
        button.classList.add('quiz-option-button');
        button.addEventListener('click', () => selectType(type, button));
        typeButtonsContainer.appendChild(button);
    });
}

// Selects a section and updates UI
function selectSection(section, button) {
    currentSection = section;
    Array.from(sectionButtonsContainer.children).forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
    checkStartButtonStatus();
}

// Selects a test type and updates UI
function selectType(type, button) {
    currentType = type;
    Array.from(typeButtonsContainer.children).forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
    checkStartButtonStatus();
}

// Enables/disables start quiz button based on selection
function checkStartButtonStatus() {
    startQuizBtn.disabled = !(currentSection && currentType);
}

// Displays the current question
function displayQuestion() {
    const question = currentQuestions[currentQuestionIndex];
    if (!question) {
        // This should not happen if logic is correct, but as a safeguard
        console.error("Question not found at index:", currentQuestionIndex);
        return;
    }

    currentQuestionNumberSpan.textContent = currentQuestionIndex + 1;
    totalQuestionsSpan.textContent = currentQuestions.length;
    quizSectionNameSpan.textContent = currentSection;
    quizTypeNameSpan.textContent = currentType.toUpperCase();
    questionTextElement.textContent = question.question;
    optionsContainer.innerHTML = '';
    feedbackContainer.classList.add('hidden'); // Hide feedback for new question

    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.textContent = option;
        button.classList.add('quiz-answer-button');
        button.dataset.index = index; // Store index for easy access

        // If user has already answered this question, show their selection
        if (userAnswers[currentQuestionIndex] !== undefined) {
            button.classList.add('disabled'); // Disable all options if already answered
            if (userAnswers[currentQuestionIndex] === index) {
                // Highlight user's selected answer
                button.classList.add(index === question.answer ? 'correct' : 'incorrect');
            }
            // Highlight the correct answer if user has answered
            if (index === question.answer && userAnswers[currentQuestionIndex] !== undefined) {
                 // Ensure correct answer is highlighted even if user chose wrong
                 if (userAnswers[currentQuestionIndex] !== question.answer) {
                    button.classList.add('correct');
                 }
            }
        } else {
            button.addEventListener('click', () => handleAnswer(index));
        }
        optionsContainer.appendChild(button);
    });

    // Show feedback if question has been answered
    if (userAnswers[currentQuestionIndex] !== undefined) {
        showFeedback(userAnswers[currentQuestionIndex] === question.answer);
    }

    updateNavigationButtons();
}

// Handles user's answer selection
function handleAnswer(selectedIndex) {
    if (userAnswers[currentQuestionIndex] !== undefined) return; // Prevent re-answering

    userAnswers[currentQuestionIndex] = selectedIndex;
    const question = currentQuestions[currentQuestionIndex];
    const isCorrect = selectedIndex === question.answer;

    // Apply styles to options
    Array.from(optionsContainer.children).forEach((button, index) => {
        button.classList.add('disabled'); // Disable all buttons after answer
        if (index === selectedIndex) {
            button.classList.add(isCorrect ? 'correct' : 'incorrect');
        } else if (index === question.answer) {
            // Highlight the correct answer if user chose wrong
            button.classList.add('correct');
        }
    });

    showFeedback(isCorrect);
    updateNavigationButtons(); // Update navigation after answering
}

// Shows feedback (correct/incorrect) and explanation
function showFeedback(isCorrect) {
    const question = currentQuestions[currentQuestionIndex];
    feedbackContainer.classList.remove('hidden');
    feedbackContainer.classList.remove('bg-green-100', 'bg-red-100', 'text-green-800', 'text-red-800');
    feedbackContainer.classList.add(isCorrect ? 'bg-green-100' : 'bg-red-100');
    feedbackContainer.classList.add(isCorrect ? 'text-green-800' : 'text-red-800');
    feedbackContainer.classList.add('border', isCorrect ? 'border-green-500' : 'border-red-500');

    feedbackText.textContent = isCorrect ? 'Jawaban Anda Benar!' : 'Jawaban Anda Salah.';
    explanationText.textContent = `Penjelasan: ${question.explanation}`;

    const competencyDescriptions = question.competency
        .map(compName => `• ${compName}: ${getCompetencyDescription(compName)}`)
        .join('\n');
    competencyText.textContent = `Kompetensi diuji:\n${competencyDescriptions}`;
}

// Updates the state of navigation buttons
function updateNavigationButtons() {
    prevBtn.disabled = currentQuestionIndex === 0;
    // Next button is disabled if not answered and not the last question
    nextBtn.disabled = (userAnswers[currentQuestionIndex] === undefined && currentQuestionIndex < currentQuestions.length - 1);

    // If all questions are answered, change next button to "Selesai"
    if (currentQuestionIndex === currentQuestions.length - 1 && userAnswers[currentQuestionIndex] !== undefined) {
        nextBtn.textContent = 'Selesai Kuis';
        nextBtn.disabled = false; // Enable to finish
    } else {
        nextBtn.textContent = 'Berikutnya';
    }
}

// --- Quiz Navigation ---

function goToNextQuestion() {
    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else if (userAnswers[currentQuestionIndex] !== undefined) {
        // All questions answered, show results
        showResults();
    }
}

function goToPrevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

// --- Quiz Flow Control ---

// Initializes and starts the quiz
function startQuiz() {
    if (!currentSection || !currentType || quizStarted) return;

    quizStarted = true;
    currentQuestions = shuffleArray([...allQuestions[currentSection][currentType]]);
    currentQuestionIndex = 0;
    userAnswers = new Array(currentQuestions.length).fill(undefined); // Reset answers

    quizSelectionScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    resultScreen.classList.add('hidden');

    displayQuestion();
}

// Shows the quiz results
function showResults() {
    let correctCount = 0;
    for (let i = 0; i < currentQuestions.length; i++) {
        if (userAnswers[i] !== undefined && userAnswers[i] === currentQuestions[i].answer) {
            correctCount++;
        }
    }

    const total = currentQuestions.length;
    const percentage = (correctCount / total * 100).toFixed(2);

    finalScorePercentage.textContent = `${percentage}%`;
    finalCorrectCount.textContent = correctCount;
    finalTotalQuestions.textContent = total;

    saveQuizHistory(currentSection, currentType, percentage, correctCount, total);

    quizScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    quizStarted = false; // Reset quiz started flag
}

// Resets quiz to selection screen
function retakeQuiz() {
    quizSelectionScreen.classList.remove('hidden');
    quizScreen.classList.add('hidden');
    resultScreen.classList.add('hidden');
    currentSection = null;
    currentType = null;
    // Deselect buttons
    Array.from(sectionButtonsContainer.children).forEach(btn => btn.classList.remove('selected'));
    Array.from(typeButtonsContainer.children).forEach(btn => btn.classList.remove('selected'));
    startQuizBtn.disabled = true; // Disable start button
}

// --- Local Storage for History ---

const HISTORY_KEY = 'pppkQuizHistory';

function saveQuizHistory(section, type, scorePercentage, correctCount, totalQuestions) {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    const newEntry = {
        id: Date.now(), // Unique ID for each entry
        section: section,
        type: type,
        score: scorePercentage,
        correct: correctCount,
        total: totalQuestions,
        date: new Date().toLocaleString()
    };
    history.push(newEntry);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function loadQuizHistory() {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    historyList.innerHTML = ''; // Clear previous list

    if (history.length === 0) {
        noHistoryMessage.classList.remove('hidden');
        clearHistoryBtn.classList.add('hidden');
    } else {
        noHistoryMessage.classList.add('hidden');
        clearHistoryBtn.classList.remove('hidden');
        history.sort((a, b) => b.id - a.id); // Sort by most recent first
        history.forEach(entry => {
            const div = document.createElement('div');
            div.classList.add('history-item');
            div.innerHTML = `
                <p class="font-semibold text-gray-800">${entry.section} - ${entry.type.toUpperCase()}</p>
                <p class="text-sm text-gray-600">Skor: <span class="font-bold text-blue-600">${entry.score}%</span> (${entry.correct}/${entry.total} Benar)</p>
                <p class="text-xs text-gray-500">Tanggal: ${entry.date}</p>
            `;
            historyList.appendChild(div);
        });
    }
}

function clearQuizHistory() {
    localStorage.removeItem(HISTORY_KEY);
    loadQuizHistory(); // Reload to show empty message
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    renderSectionButtons();
    renderTypeButtons();
    checkStartButtonStatus(); // Initial check
});

startQuizBtn.addEventListener('click', startQuiz);
nextBtn.addEventListener('click', goToNextQuestion);
prevBtn.addEventListener('click', goToPrevQuestion);
retakeQuizBtn.addEventListener('click', retakeQuiz);

viewHistoryBtn.addEventListener('click', () => {
    loadQuizHistory();
    historyModal.style.display = 'flex'; // Show modal
});

closeHistoryModalBtn.addEventListener('click', () => {
    historyModal.style.display = 'none'; // Hide modal
});

clearHistoryBtn.addEventListener('click', () => {
    // Implement a simple confirmation for clearing history
    if (confirm("Apakah Anda yakin ingin menghapus semua riwayat kuis?")) {
        clearQuizHistory();
    }
});

// Close modal if clicked outside content
window.addEventListener('click', (event) => {
    if (event.target === historyModal) {
        historyModal.style.display = 'none';
    }
});
