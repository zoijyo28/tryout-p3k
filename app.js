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
    console.log("renderSectionButtons: Memulai rendering tombol seksi.");
    sectionButtonsContainer.innerHTML = '';
    if (sections && sections.length > 0) {
        sections.forEach(section => {
            const button = document.createElement('button');
            button.textContent = section;
            button.classList.add('quiz-option-button');
            button.addEventListener('click', () => selectSection(section, button));
            sectionButtonsContainer.appendChild(button);
            console.log(`renderSectionButtons: Tombol '${section}' ditambahkan.`);
        });
    } else {
        console.warn("renderSectionButtons: Array 'sections' kosong atau tidak terdefinisi.");
        sectionButtonsContainer.innerHTML = '<p class="text-red-500">Gagal memuat pilihan seksi. Mohon periksa file questions.js.</p>';
    }
}

// Renders test type selection buttons
function renderTypeButtons() {
    console.log("renderTypeButtons: Memulai rendering tombol tipe tes.");
    typeButtonsContainer.innerHTML = '';
    if (testTypes && testTypes.length > 0) {
        testTypes.forEach(type => {
            const button = document.createElement('button');
            button.textContent = type.toUpperCase(); // Display as MANSOKUL / TEKNIS
            button.classList.add('quiz-option-button');
            button.addEventListener('click', () => selectType(type, button));
            typeButtonsContainer.appendChild(button);
            console.log(`renderTypeButtons: Tombol '${type.toUpperCase()}' ditambahkan.`);
        });
    } else {
        console.warn("renderTypeButtons: Array 'testTypes' kosong atau tidak terdefinisi.");
        typeButtonsContainer.innerHTML = '<p class="text-red-500">Gagal memuat pilihan tipe tes. Mohon periksa file questions.js.</p>';
    }
}

// Selects a section and updates UI
function selectSection(section, button) {
    console.log(`selectSection: Seksi '${section}' dipilih.`);
    currentSection = section;
    Array.from(sectionButtonsContainer.children).forEach(btn => {
        btn.classList.remove('selected');
        console.log(`selectSection: Menghapus 'selected' dari tombol: ${btn.textContent}`);
    });
    button.classList.add('selected');
    console.log(`selectSection: Menambahkan 'selected' ke tombol: ${button.textContent}`);
    checkStartButtonStatus();
}

// Selects a test type and updates UI
function selectType(type, button) {
    console.log(`selectType: Tipe '${type}' dipilih.`);
    currentType = type;
    Array.from(typeButtonsContainer.children).forEach(btn => {
        btn.classList.remove('selected');
        console.log(`selectType: Menghapus 'selected' dari tombol: ${btn.textContent}`);
    });
    button.classList.add('selected');
    console.log(`selectType: Menambahkan 'selected' ke tombol: ${button.textContent}`);
    checkStartButtonStatus();
}

// Enables/disables start quiz button based on selection
function checkStartButtonStatus() {
    startQuizBtn.disabled = !(currentSection && currentType);
    console.log(`checkStartButtonStatus: currentSection=${currentSection}, currentType=${currentType}. Tombol Mulai Kuis disabled: ${startQuizBtn.disabled}`);
}

// Displays the current question
function displayQuestion() {
    const question = currentQuestions[currentQuestionIndex];
    if (!question) {
        console.error("displayQuestion: Soal tidak ditemukan pada indeks:", currentQuestionIndex);
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

// --- Quiz Flow Control ---

// Initializes and starts the quiz
function startQuiz() {
    if (!currentSection || !currentType || quizStarted) return;

    console.log(`startQuiz: Memulai kuis untuk Seksi: ${currentSection}, Tipe: ${currentType}`);
    quizStarted = true;
    // Pastikan allQuestions[currentSection][currentType] tidak undefined
    if (!allQuestions[currentSection] || !allQuestions[currentSection][currentType]) {
        console.error("startQuiz: Data soal tidak ditemukan untuk seksi atau tipe yang dipilih.");
        // Menggunakan modal kustom sebagai pengganti alert
        const errorModal = document.createElement('div');
        errorModal.classList.add('modal');
        errorModal.innerHTML = `
            <div class="modal-content">
                <h2 class="text-xl font-semibold mb-4 text-red-600">Terjadi Kesalahan!</h2>
                <p class="mb-6">Data soal tidak ditemukan untuk seksi atau tipe yang dipilih. Mohon coba lagi atau periksa file questions.js.</p>
                <button id="closeErrorModalBtn" class="bg-blue-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-700">Tutup</button>
            </div>
        `;
        document.body.appendChild(errorModal);
        errorModal.style.display = 'flex';
        document.getElementById('closeErrorModalBtn').addEventListener('click', () => {
            errorModal.remove();
        });

        quizStarted = false; // Reset flag
        return;
    }

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
    console.log("retakeQuiz: Kembali ke layar pemilihan kuis.");
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
    console.log("saveQuizHistory: Riwayat kuis disimpan.", newEntry);
}

function loadQuizHistory() {
    console.log("loadQuizHistory: Memuat riwayat kuis.");
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    historyList.innerHTML = ''; // Clear previous list

    if (history.length === 0) {
        noHistoryMessage.classList.remove('hidden');
        clearHistoryBtn.classList.add('hidden');
        console.log("loadQuizHistory: Tidak ada riwayat kuis.");
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
            console.log("loadQuizHistory: Menambahkan entri riwayat:", entry);
        });
    }
}

function clearQuizHistory() {
    // Menggunakan modal kustom sebagai pengganti alert/confirm
    const confirmModal = document.createElement('div');
    confirmModal.classList.add('modal');
    confirmModal.innerHTML = `
        <div class="modal-content">
            <h2 class="text-xl font-semibold mb-4">Konfirmasi Hapus Riwayat</h2>
            <p class="mb-6">Apakah Anda yakin ingin menghapus semua riwayat kuis?</p>
            <div class="flex justify-center gap-4">
                <button id="confirmClearBtn" class="bg-red-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-red-700">Ya, Hapus</button>
                <button id="cancelClearBtn" class="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg shadow-md hover:bg-gray-400">Batal</button>
            </div>
        </div>
    `;
    document.body.appendChild(confirmModal);
    confirmModal.style.display = 'flex';

    document.getElementById('confirmClearBtn').addEventListener('click', () => {
        localStorage.removeItem(HISTORY_KEY);
        loadQuizHistory(); // Reload to show empty message
        confirmModal.remove(); // Remove the modal
        console.log("clearQuizHistory: Riwayat kuis dihapus.");
    });

    document.getElementById('cancelClearBtn').addEventListener('click', () => {
        confirmModal.remove(); // Remove the modal
        console.log("clearQuizHistory: Penghapusan riwayat dibatalkan.");
    });
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded: DOM sepenuhnya dimuat.");
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

clearHistoryBtn.addEventListener('click', clearQuizHistory); // Menggunakan fungsi clearQuizHistory baru

// Close modal if clicked outside content
window.addEventListener('click', (event) => {
    if (event.target === historyModal) {
        historyModal.style.display = 'none';
    }
});
