// app.js
// Logika utama aplikasi kuis interaktif PPPK

import { allQuestions, sections, testTypes } from './questions.js';
import { competencies } from './competencies.js';

// --- DOM Elements ---
const dashboardScreen = document.getElementById('dashboard');
const testTypeSelectionScreen = document.getElementById('testTypeSelectionSection');
const questionSection = document.getElementById('questionSection');
const resultSection = document.getElementById('resultSection');
const testHistorySection = document.getElementById('testHistorySection');

const sectionButtonsContainer = document.getElementById('sectionButtons');
const typeButtonsContainer = document.getElementById('typeButtons');
const startQuizBtn = document.getElementById('startQuizBtn');
const selectedSectionDescription = document.getElementById('selectedSectionDescription');

// Elemen-elemen ini sekarang dibuat secara dinamis di dalam questionContainer,
// jadi tidak perlu diinisialisasi secara global di sini.
// const currentQuestionNumberSpan = document.getElementById('currentQuestionNumber');
// const totalQuestionsSpan = document.getElementById('totalQuestions');
// const quizSectionNameSpan = document.getElementById('currentSectionTitle');
// const quizTypeNameSpan = document.getElementById('currentSectionTitle');
// const questionTextElement = document.getElementById('questionText');
// const optionsContainer = document.getElementById('optionsContainer');
// const feedbackContainer = document.getElementById('feedbackContainer');
// const feedbackText = document.getElementById('feedbackText');
// const explanationText = document.getElementById('explanationText');
// const competencyText = document.getElementById('competencyText');

const questionContainerDiv = document.getElementById('questionContainer');
const prevBtn = document.getElementById('prevQuestionBtn');
const nextBtn = document.getElementById('nextQuestionBtn');
const submitBtn = document.getElementById('submitTestBtn');

const resultSectionName = document.getElementById('resultSectionName');
const resultTestType = document.getElementById('resultTestType');
const totalAnsweredQuestionsResult = document.getElementById('totalAnsweredQuestionsResult');
const totalQuestionsResult = document.getElementById('totalQuestionsResult');
const correctAnswersResult = document.getElementById('correctAnswersResult');
const userScore = document.getElementById('userScore');

const btnViewHistory = document.getElementById('btnViewHistory');
const btnBackToDashboardFromTypeSelection = document.getElementById('btnBackToDashboardFromTypeSelection');
const btnBackToDashboardFromQuiz = document.getElementById('btnBackToDashboardFromQuiz');
const btnBackToDashboardFromHistory = document.getElementById('btnBackToDashboardFromHistory');
const btnBackToDashboardFromResult = document.getElementById('btnBackToDashboardFromResult');

const testHistoryList = document.getElementById('testHistoryList');
const noHistoryMessage = document.getElementById('noHistoryMessage');

// Modal History
const historyModal = document.getElementById('historyModal');
const closeHistoryModalBtn = document.getElementById('closeHistoryModalBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');


// --- Quiz State Variables ---
let currentSection = null;
let currentTestType = null;
let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let quizStarted = false;

// --- Section Descriptions ---
const sectionDescriptions = {
    "Survei dan Pemetaan": "Menguji kompetensi terkait pengukuran, pemetaan, dan analisis data spasial menggunakan alat seperti GNSS dan drone.",
    "Penetapan Hak dan Pendaftaran": "Menguji pemahaman tentang prosedur pendaftaran hak tanah, legalitas, dan administrasi pertanahan.",
    "Penataan dan Pemberdayaan": "Menguji kompetensi dalam penataan ruang, pemberdayaan masyarakat, dan pengembangan wilayah.",
    "Pengadaan Tanah dan Pengembangan": "Menguji kemampuan dalam proses pengadaan tanah untuk pembangunan infrastruktur dan pengembangan kawasan.",
    "Pengendalian dan Penanganan Sengketa": "Menguji kompetensi dalam penyelesaian sengketa, konflik pertanahan, dan penegakan hukum agraria.",
    "Tata Usaha": "Menguji kompetensi manajerial, administrasi umum perkantoran, dan pengelolaan sumber daya organisasi."
};


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

// --- UI Helper Functions ---
function showLoading(message = "Memuat soal...") {
    document.getElementById('loadingText').textContent = message;
    document.getElementById('loadingOverlay').classList.add('visible');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('visible');
}

function hideAllSections() {
    dashboardScreen.style.display = 'none';
    questionSection.style.display = 'none';
    resultSection.style.display = 'none';
    testTypeSelectionScreen.style.display = 'none';
    testHistorySection.style.display = 'none';
}

// Resets quiz state variables
function resetTest() {
    currentSection = null;
    currentTestType = null;
    currentQuestions = [];
    currentQuestionIndex = 0;
    userAnswers = [];
    quizStarted = false;
}

// --- Render Functions ---

// Renders section selection buttons as cards
function renderSectionButtons() {
    console.log("renderSectionButtons: Memulai rendering tombol seksi.");
    sectionButtonsContainer.innerHTML = '';
    if (sections && sections.length > 0) {
        sections.forEach(section => {
            const card = document.createElement('div');
            card.classList.add('section-card');
            card.dataset.section = section; // Store section name on the card
            card.innerHTML = `
                <h3>${section}</h3>
                <p>${sectionDescriptions[section] || "Deskripsi tidak tersedia."}</p>
                <button class="button">Mulai Tes</button>
            `;
            // Attach event listener to the card itself for selection effect
            card.addEventListener('click', (event) => {
                // Only select card if the click is not directly on the button
                if (event.target.tagName !== 'BUTTON') {
                    selectSection(section, card);
                }
            });
            // Attach event listener to the button inside the card for starting the test
            card.querySelector('button').addEventListener('click', () => startTest(section));
            sectionButtonsContainer.appendChild(card);
            console.log(`renderSectionButtons: Kartu '${section}' ditambahkan.`);
        });
    } else {
        console.warn("renderSectionButtons: Array 'sections' kosong atau tidak terdefinisi.");
        sectionButtonsContainer.innerHTML = '<p class="text-red-500">Gagal memuat pilihan seksi. Mohon periksa file questions.js.</p>';
    }
}

// Renders test type selection buttons as cards
function renderTypeButtons() {
    console.log("renderTypeButtons: Memulai rendering tombol tipe tes.");
    typeButtonsContainer.innerHTML = '';
    if (testTypes && testTypes.length > 0) {
        testTypes.forEach(type => {
            const card = document.createElement('div');
            card.classList.add('type-card');
            card.dataset.type = type; // Store type name on the card
            card.innerHTML = `
                <h3>Tes ${type.toUpperCase()}</h3>
                <p>50 Soal</p>
                <button class="button">Pilih Tipe</button>
            `;
            // Attach event listener to the card itself for selection effect
            card.addEventListener('click', (event) => {
                // Only select card if the click is not directly on the button
                if (event.target.tagName !== 'BUTTON') {
                    selectType(type, card);
                }
            });
            // Attach event listener to the button inside the card for loading questions
            card.querySelector('button').addEventListener('click', () => loadQuestionsByType(type));
            typeButtonsContainer.appendChild(card);
            console.log(`renderTypeButtons: Kartu '${type.toUpperCase()}' ditambahkan.`);
        });
    } else {
        console.warn("renderTypeButtons: Array 'testTypes' kosong atau tidak terdefinisi.");
        typeButtonsContainer.innerHTML = '<p class="text-red-500">Gagal memuat pilihan tipe tes. Mohon periksa file questions.js.</p>';
    }
}

// Selects a section card and updates UI
function selectSection(section, cardElement) {
    console.log(`selectSection: Seksi '${section}' dipilih.`);
    currentSection = section;
    Array.from(sectionButtonsContainer.children).forEach(card => {
        card.classList.remove('selected');
        console.log(`selectSection: Menghapus 'selected' dari kartu: ${card.querySelector('h3').textContent}`);
    });
    cardElement.classList.add('selected');
    console.log(`selectSection: Menambahkan 'selected' ke kartu: ${cardElement.querySelector('h3').textContent}`);

    // Update section description
    selectedSectionDescription.textContent = sectionDescriptions[section] || "Deskripsi seksi tidak tersedia.";
    selectedSectionDescription.classList.remove('hidden');

    // Enable the "Mulai Kuis" button if both section and type are selected
    checkStartButtonStatus();
}

// Selects a test type card and updates UI
function selectType(type, cardElement) {
    console.log(`selectType: Tipe '${type}' dipilih.`);
    currentTestType = type; // Use currentTestType
    Array.from(typeButtonsContainer.children).forEach(card => {
        card.classList.remove('selected');
        console.log(`selectType: Menghapus 'selected' dari kartu: ${card.querySelector('h3').textContent}`);
    });
    cardElement.classList.add('selected');
    console.log(`selectType: Menambahkan 'selected' ke kartu: ${cardElement.querySelector('h3').textContent}`);
    
    // Enable the "Mulai Kuis" button if both section and type are selected
    checkStartButtonStatus();
}

// Enables/disables start quiz button based on selection
function checkStartButtonStatus() {
    // startQuizBtn is now on the test type selection screen
    startQuizBtn.disabled = !(currentSection && currentTestType);
    console.log(`checkStartButtonStatus: currentSection=${currentSection}, currentTestType=${currentTestType}. Tombol Mulai Kuis disabled: ${startQuizBtn.disabled}`);
}

// Displays the current question
function displayQuestion() {
    if (currentQuestionIndex >= currentQuestions.length) {
        submitTest(); // If it's the last question, submit the test
        return;
    }

    const q = currentQuestions[currentQuestionIndex];
    
    let optionsHtml = '';
    const optionLabels = ['A', 'B', 'C', 'D', 'E']; // Assuming max 5 options

    q.options.forEach((option, index) => {
        const checked = userAnswers[currentQuestionIndex] === index ? 'checked' : '';
        // Add option-label for A, B, C, D
        optionsHtml += `
            <label class="options-label-item">
                <input type="radio" name="question${currentQuestionIndex}" value="${index}" ${checked} data-question-index="${currentQuestionIndex}" data-option-index="${index}">
                <span class="option-label">${optionLabels[index]}.</span> ${option}
            </label>
        `;
    });

    // Set visibility of navigation buttons
    prevBtn.style.display = currentQuestionIndex > 0 ? 'inline-block' : 'none';
    nextBtn.style.display = currentQuestionIndex < currentQuestions.length - 1 ? 'inline-block' : 'none';
    submitBtn.style.display = currentQuestionIndex === currentQuestions.length - 1 ? 'inline-block' : 'none';

    // Display question and options
    questionContainerDiv.innerHTML = `
        <div class="question-container">
            <p class="question-text"><strong>Soal ${currentQuestionIndex + 1}/${currentQuestions.length}:</strong> ${q.question}</p>
            <div class="options">
                ${optionsHtml}
            </div>
            <div class="feedback" id="feedback-${currentQuestionIndex}"></div>
            <div class="explanation" id="explanation-${currentQuestionIndex}">
                <p><strong>Pembahasan:</strong> ${q.explanation}</p>
                <p>Kompetensi terkait: ${q.competency.map(c => `<b>${c}</b> (${getCompetencyDescription(c)})`).join(', ')}</p>
            </div>
        </div>
    `;

    // Attach event listeners to newly created radio buttons
    const radios = document.querySelectorAll(`#questionContainer input[name="question${currentQuestionIndex}"]`);
    radios.forEach(radio => {
        radio.addEventListener('change', (event) => {
            const qIndex = parseInt(event.target.dataset.questionIndex);
            const optionIndex = parseInt(event.target.dataset.optionIndex);
            recordAnswer(optionIndex);
        });
    });

    // If question has been answered, show feedback and explanation
    if (userAnswers[currentQuestionIndex] !== null) {
        showFeedbackAndExplanation(userAnswers[currentQuestionIndex], q.answer, currentQuestionIndex);
    }
}

window.recordAnswer = function(selectedIndex) { // Make global
    userAnswers[currentQuestionIndex] = selectedIndex;
    const q = currentQuestions[currentQuestionIndex];
    showFeedbackAndExplanation(selectedIndex, q.answer, currentQuestionIndex);
}

function showFeedbackAndExplanation(selectedIndex, correctAnswerIndex, qIndex) {
    const feedbackDiv = document.getElementById(`feedback-${qIndex}`);
    const explanationDiv = document.getElementById(`explanation-${qIndex}`);
    const optionsLabels = document.querySelectorAll(`#questionContainer .options label`);

    // Reset all option styles
    optionsLabels.forEach(label => {
        label.classList.remove('selected-correct', 'selected-incorrect', 'correct-answer');
    });

    if (selectedIndex === correctAnswerIndex) {
        feedbackDiv.textContent = "Jawaban Anda Benar!";
        feedbackDiv.className = "feedback correct";
        optionsLabels[selectedIndex].classList.add('selected-correct');
    } else {
        feedbackDiv.textContent = "Jawaban Anda Salah.";
        feedbackDiv.className = "feedback incorrect";
        optionsLabels[selectedIndex].classList.add('selected-incorrect');
        // Highlight correct answer if user chose wrong
        optionsLabels[correctAnswerIndex].classList.add('correct-answer');
    }
    feedbackDiv.style.display = 'block';
    explanationDiv.style.display = 'block'; // Display explanation

    // Disable radio buttons after answering for the current question
    const radios = document.querySelectorAll(`#questionContainer input[name="question${qIndex}"]`);
    radios.forEach(radio => radio.disabled = true);
}

window.nextQuestion = function() { // Make global
    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else if (currentQuestionIndex === currentQuestions.length - 1 && userAnswers[currentQuestionIndex] !== null) {
        // If it's the last question and answered, submit the test
        submitTest();
    }
}

window.prevQuestion = function() { // Make global
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

window.submitTest = async function() { // Make global
    let correctCount = 0;
    let answeredCount = 0;
    userAnswers.forEach((answer, index) => {
        if (answer !== null) { // Only count answered questions
            answeredCount++;
            if (answer === currentQuestions[index].answer) {
                correctCount++;
            }
        }
    });

    // Calculate score based on answered questions
    const score = (answeredCount > 0) ? (correctCount / answeredCount) * 100 : 0;

    hideAllSections();
    resultSection.style.display = 'block';
    resultSectionName.textContent = currentSection;
    resultTestType.textContent = currentTestType === 'mansoskul' ? 'Manajerial & Sosial Kultural' : 'Teknis';
    totalQuestionsResult.textContent = currentQuestions.length;
    totalAnsweredQuestionsResult.textContent = answeredCount;
    correctAnswersResult.textContent = correctCount;
    userScore.textContent = score.toFixed(2) + '%';

    // Save test result to Local Storage
    saveTestResult({
        section: currentSection,
        testType: currentTestType,
        totalQuestions: currentQuestions.length,
        answeredQuestions: answeredCount,
        correctAnswers: correctCount,
        score: parseFloat(score.toFixed(2)),
        timestamp: new Date().toISOString()
    });
}

// --- Local Storage Functions ---
const LOCAL_STORAGE_KEY = 'testHistory';

function saveTestResult(result) {
    try {
        const existingHistory = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
        existingHistory.push(result);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existingHistory));
        console.log("Hasil tes berhasil disimpan di Local Storage!");
    } catch (error) {
        console.error("Error saving test result to Local Storage:", error);
        // Using custom modal instead of alert
        const errorModal = document.createElement('div');
        errorModal.classList.add('modal');
        errorModal.innerHTML = `
            <div class="modal-content">
                <h2 class="text-xl font-semibold mb-4 text-red-600">Kesalahan Penyimpanan!</h2>
                <p class="mb-6">Gagal menyimpan hasil tes di browser Anda. Pastikan Local Storage diaktifkan. Pesan Error: ${error.message}</p>
                <button id="closeErrorModalBtn" class="button">Tutup</button>
            </div>
        `;
        document.body.appendChild(errorModal);
        errorModal.style.display = 'flex';
        document.getElementById('closeErrorModalBtn').addEventListener('click', () => {
            errorModal.remove();
        });
    }
}

window.viewTestHistory = function() { // Make global
    hideAllSections();
    testHistorySection.style.display = 'block';
    testHistoryList.innerHTML = ''; // Clear previous list
    noHistoryMessage.style.display = 'none';

    try {
        const storedHistory = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];

        if (storedHistory.length === 0) {
            noHistoryMessage.textContent = "Anda belum memiliki riwayat tes. Ikuti tes untuk menyimpannya!";
            noHistoryMessage.style.display = 'block';
        } else {
            // Sort from most recent
            storedHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            storedHistory.forEach((data) => {
                const listItem = document.createElement('li');
                listItem.className = 'test-history-item';
                const date = new Date(data.timestamp).toLocaleString();
                listItem.innerHTML = `
                    <strong>Seksi: ${data.section}</strong><br>
                    Tipe Tes: ${data.testType === 'mansoskul' ? 'Manajerial & Sosial Kultural' : 'Teknis'}<br>
                    Tanggal: ${date}<br>
                    Jawaban Benar: ${data.correctAnswers} dari ${data.totalQuestions}<br>
                    Skor: <span class="score">${data.score}%</span>
                `;
                testHistoryList.appendChild(listItem);
            });
        }
    } catch (error) {
        console.error("Error loading test history from Local Storage:", error);
        noHistoryMessage.textContent = `Gagal memuat riwayat tes dari browser Anda: ${error.message}`;
        noHistoryMessage.style.display = 'block';
    }
}

// Function to clear history (using custom modal for confirmation)
window.clearTestHistory = function() {
    const confirmModal = document.createElement('div');
    confirmModal.classList.add('modal');
    confirmModal.innerHTML = `
        <div class="modal-content">
            <span class="close-button" id="closeClearHistoryModalBtn">&times;</span>
            <h2 class="text-xl font-semibold mb-4">Konfirmasi Hapus Riwayat</h2>
            <p class="mb-6">Apakah Anda yakin ingin menghapus semua riwayat kuis?</p>
            <div class="flex justify-center gap-4">
                <button id="confirmClearBtn" class="button bg-red-600 hover:bg-red-700">Ya, Hapus</button>
                <button id="cancelClearBtn" class="button bg-gray-300 text-gray-800 hover:bg-gray-400">Batal</button>
            </div>
        </div>
    `;
    document.body.appendChild(confirmModal);
    confirmModal.style.display = 'flex';

    document.getElementById('confirmClearBtn').addEventListener('click', () => {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        viewTestHistory(); // Reload to show empty message
        confirmModal.remove(); // Remove the modal
        console.log("clearTestHistory: Riwayat kuis dihapus.");
    });

    document.getElementById('cancelClearBtn').addEventListener('click', () => {
        confirmModal.remove(); // Remove the modal
        console.log("clearTestHistory: Penghapusan riwayat dibatalkan.");
    });

    // Close modal if clicked outside content
    window.addEventListener('click', (event) => {
        if (event.target === confirmModal) {
            confirmModal.remove();
        }
    });

    // Close button inside the modal
    document.getElementById('closeClearHistoryModalBtn').addEventListener('click', () => {
        confirmModal.remove();
    });
}


// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded: DOM fully loaded.");
    goToDashboard(); // Start by showing the dashboard

    // Attach event listeners to the dashboard buttons (these are now global functions)
    btnViewHistory.addEventListener('click', viewTestHistory);
    btnBackToDashboardFromTypeSelection.addEventListener('click', goToDashboard);
    btnBackToDashboardFromQuiz.addEventListener('click', goToDashboard);
    btnBackToDashboardFromHistory.addEventListener('click', goToDashboard);
    btnBackToDashboardFromResult.addEventListener('click', goToDashboard);

    // Attach event listeners for question navigation buttons
    prevBtn.addEventListener('click', prevQuestion);
    nextBtn.addEventListener('click', nextQuestion);
    submitBtn.addEventListener('click', submitTest);

    // Initial rendering of section and type buttons
    renderSectionButtons();
    renderTypeButtons(); // Render type buttons, but they are hidden until a section is chosen

    // Attach start quiz button listener
    startQuizBtn.addEventListener('click', () => {
        // This button is on the test type selection screen
        if (currentSection && currentTestType) {
            loadQuestionsByType(currentTestType); // Reuse loadQuestionsByType to actually start the quiz
        } else {
            // Using custom modal instead of alert
            const warningModal = document.createElement('div');
            warningModal.classList.add('modal');
            warningModal.innerHTML = `
                <div class="modal-content">
                    <span class="close-button" id="closeWarningModalBtn">&times;</span>
                    <h2 class="text-xl font-semibold mb-4 text-orange-600">Peringatan!</h2>
                    <p class="mb-6">Mohon pilih Seksi dan Tipe Tes terlebih dahulu.</p>
                    <button id="closeWarningModalBtn2" class="button">Tutup</button>
                </div>
            `;
            document.body.appendChild(warningModal);
            warningModal.style.display = 'flex';
            document.getElementById('closeWarningModalBtn').addEventListener('click', () => { // First close button
                warningModal.remove();
            });
            document.getElementById('closeWarningModalBtn2').addEventListener('click', () => { // Second close button
                warningModal.remove();
            });
            window.addEventListener('click', (event) => { // Click outside modal
                if (event.target === warningModal) {
                    warningModal.remove();
                }
            });
        }
    });
});

// Global functions for navigation (to be called from HTML)
window.goToDashboard = function() {
    hideAllSections();
    dashboardScreen.style.display = 'block';
    resetTest();
    selectedSectionDescription.classList.add('hidden'); // Hide description
    selectedSectionDescription.textContent = ''; // Clear description
    // Deselect all cards when returning to dashboard
    Array.from(sectionButtonsContainer.children).forEach(card => card.classList.remove('selected'));
    Array.from(typeButtonsContainer.children).forEach(card => card.classList.remove('selected'));
    startQuizBtn.disabled = true; // Disable start button
};

window.startTest = function(section) {
    currentSection = section;
    hideAllSections();
    testTypeSelectionScreen.style.display = 'block';
    document.getElementById('testTypeSelectionTitle').textContent = `Pilih Tipe Tes untuk ${section}`;
    // Ensure "Mulai Kuis" button is disabled until type is selected
    startQuizBtn.disabled = true;
    // Deselect type cards when a new section is chosen
    Array.from(typeButtonsContainer.children).forEach(card => card.classList.remove('selected'));
};

window.loadQuestionsByType = async function(type) {
    currentTestType = type;
    hideAllSections();
    questionSection.style.display = 'block';
    // Update the title to show both section and type
    document.getElementById('currentSectionTitle').textContent = `Tes Kompetensi ${currentSection} - ${type === 'mansoskul' ? 'Manajerial & Sosial Kultural' : 'Teknis'}`;

    showLoading(`Memuat 50 soal ${type === 'mansoskul' ? 'Manajerial & Sosial Kultural' : 'Teknis'} untuk ${currentSection}...`);

    if (allQuestions[currentSection] && allQuestions[currentSection][type]) {
        currentQuestions = shuffleArray([...allQuestions[currentSection][type]]);
    } else {
        // Using custom modal instead of alert
        const errorModal = document.createElement('div');
        errorModal.classList.add('modal');
        errorModal.innerHTML = `
            <div class="modal-content">
                <span class="close-button" id="closeErrorModalBtn">&times;</span>
                <h2 class="text-xl font-semibold mb-4 text-red-600">Terjadi Kesalahan!</h2>
                <p class="mb-6">Bank soal tidak ditemukan untuk seksi atau tipe tes ini. Mohon coba lagi atau periksa file questions.js.</p>
                <button id="closeErrorModalBtn2" class="button">Tutup</button>
            </div>
        `;
        document.body.appendChild(errorModal);
        errorModal.style.display = 'flex';
        document.getElementById('closeErrorModalBtn').addEventListener('click', () => { // First close button
            errorModal.remove();
            goToDashboard();
        });
        document.getElementById('closeErrorModalBtn2').addEventListener('click', () => { // Second close button
            errorModal.remove();
            goToDashboard();
        });
        window.addEventListener('click', (event) => { // Click outside modal
            if (event.target === errorModal) {
                errorModal.remove();
                goToDashboard();
            }
        });
        hideLoading();
        return;
    }
    
    hideLoading();

    if (currentQuestions.length === 0) {
        // Using custom modal instead of alert
        const warningModal = document.createElement('div');
        warningModal.classList.add('modal');
        warningModal.innerHTML = `
            <div class="modal-content">
                <span class="close-button" id="closeWarningModalBtn">&times;</span>
                <h2 class="text-xl font-semibold mb-4 text-orange-600">Peringatan!</h2>
                <p class="mb-6">Tidak ada soal yang tersedia untuk tipe tes ini. Silakan pilih tipe lain.</p>
                <button id="closeWarningModalBtn2" class="button">Tutup</button>
            </div>
        `;
        document.body.appendChild(warningModal);
        warningModal.style.display = 'flex';
        document.getElementById('closeWarningModalBtn').addEventListener('click', () => { // First close button
            warningModal.remove();
            goToDashboard();
        });
        document.getElementById('closeWarningModalBtn2').addEventListener('click', () => { // Second close button
            warningModal.remove();
            goToDashboard();
        });
        window.addEventListener('click', (event) => { // Click outside modal
            if (event.target === warningModal) {
                warningModal.remove();
                goToDashboard();
            }
        });
        return;
    }

    userAnswers = new Array(currentQuestions.length).fill(null);
    currentQuestionIndex = 0;
    displayQuestion();
};

// Add event listener for clear history button if it exists in HTML
// Since clearHistoryBtn is not in the provided HTML, this block is commented out.
// if (document.getElementById('clearHistoryBtn')) {
//     document.getElementById('clearHistoryBtn').addEventListener('click', window.clearTestHistory);
// }

// Close modal if clicked outside content (for history modal)
window.addEventListener('click', (event) => {
    const historyModalElement = document.getElementById('historyModal');
    if (historyModalElement && event.target === historyModalElement) {
        historyModalElement.style.display = 'none';
    }
});
