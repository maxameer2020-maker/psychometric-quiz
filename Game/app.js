let questionsData = [];
let activeQuestions = [];
let wrongQuestions = [];

let playerName = "";
let correctCount = 0;
let currentIndex = 0;
let timeLeft = 45;
let timerId = null;
let isReviewMode = false;

let currentShuffledOptions = [];
let currentCorrectIdx = -1;

// Load JSON questions
fetch('questions2.json')
  .then(res => res.json())
  .then(data => {
    questionsData = data;
  })
  .catch(err => alert("Could not load questions2.json file: " + err));

function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function startGame() {
  const nameInput = document.getElementById('player-name-input').value.trim();
  if (!nameInput) {
    alert("الرجاء إدخال اسمك أولاً!");
    return;
  }
  playerName = nameInput;
  activeQuestions = shuffleArray([...questionsData]);

  document.getElementById('welcome-screen').classList.add('hidden');
  document.getElementById('quiz-screen').classList.remove('hidden');

  loadQuestion();
}

function loadQuestion() {
  updateHeader();
  stopTimer();

  const q = activeQuestions[currentIndex];
  document.getElementById('analogy-label').innerText = q.analogy;
  document.getElementById('result-label').innerText = "";
  document.getElementById('exp-label').innerText = "";
  document.getElementById('words-label').innerText = "";

  const hintBtn = document.getElementById('hint-btn');
  hintBtn.disabled = false;
  hintBtn.style.background = "#FDE68A";

  const nextBtn = document.getElementById('next-btn');
  nextBtn.disabled = true;

  // Shuffle options
  currentShuffledOptions = shuffleArray([...q.options]);
  currentCorrectIdx = currentShuffledOptions.indexOf(q.correct_text);

  const container = document.getElementById('options-container');
  container.innerHTML = "";
  const prefixes = ["أ)", "ب)", "ج)", "د)"];

  currentShuffledOptions.forEach((optText, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerText = `${prefixes[i]}  ${optText}`;
    btn.onclick = () => checkAnswer(i);
    container.appendChild(btn);
  });

  timeLeft = 45;
  document.getElementById('timer-label').innerText = `⏳ ${timeLeft}`;
  runTimer();
}

function runTimer() {
  timerId = setInterval(() => {
    timeLeft--;
    document.getElementById('timer-label').innerText = `⏳ ${timeLeft}`;
    if (timeLeft <= 0) {
      stopTimer();
      timeOut();
    }
  }, 1000);
}

function stopTimer() {
  if (timerId) clearInterval(timerId);
}

function showHint() {
  const q = activeQuestions[currentIndex];
  document.getElementById('words-label').innerText = q.words;
  const hintBtn = document.getElementById('hint-btn');
  hintBtn.disabled = true;
  hintBtn.style.background = "#FEF3C7";
}

function checkAnswer(selectedIdx) {
  stopTimer();
  const q = activeQuestions[currentIndex];
  const buttons = document.querySelectorAll('.option-btn');

  buttons.forEach(btn => btn.disabled = true);
  document.getElementById('hint-btn').disabled = true;

  if (selectedIdx === currentCorrectIdx) {
    buttons[selectedIdx].classList.add('correct');
    document.getElementById('result-label').innerText = "إجابة صحيحة! 🎉";
    document.getElementById('result-label').style.color = "#10B981";
    correctCount++;
  } else {
    buttons[selectedIdx].classList.add('wrong');
    buttons[currentCorrectIdx].classList.add('correct');
    document.getElementById('result-label').innerText = "إجابة خاطئة! ❌";
    document.getElementById('result-label').style.color = "#EF4444";
    if (!isReviewMode) wrongQuestions.push(q);
  }

  document.getElementById('exp-label').innerText = `📌 العلاقة: ${q.explanation}\n\n📖 معاني الكلمات:\n${q.words}`;
  updateHeader();
  document.getElementById('next-btn').disabled = false;
}

function timeOut() {
  const q = activeQuestions[currentIndex];
  const buttons = document.querySelectorAll('.option-btn');

  buttons.forEach(btn => btn.disabled = true);
  document.getElementById('hint-btn').disabled = true;

  buttons[currentCorrectIdx].classList.add('correct');
  document.getElementById('result-label').innerText = "انتهى الوقت! ⏰";
  document.getElementById('result-label').style.color = "#EF4444";
  document.getElementById('exp-label').innerText = `📌 العلاقة: ${q.explanation}\n\n📖 معاني الكلمات:\n${q.words}`;

  if (!isReviewMode) wrongQuestions.push(q);
  document.getElementById('next-btn').disabled = false;
}

function nextQuestion() {
  currentIndex++;

  // Round break every 5 questions
  if (!isReviewMode && currentIndex > 0 && currentIndex % 5 === 0 && currentIndex < activeQuestions.length) {
    alert(`نهاية الشوط 🏆\n\nأحسنت يا ${playerName}! أنهيت هذا الشوط بنجاح.\nاضغط موافق للانتقال للشوط التالي.`);
  }

  if (currentIndex < activeQuestions.length) {
    loadQuestion();
  } else {
    if (!isReviewMode && wrongQuestions.length > 0) {
      const confirmReview = confirm(`انتهت اللعبة!\nعدد إجاباتك الصحيحة: ${correctCount} من ${questionsData.length}\nلديك ${wrongQuestions.length} أخطاء. هل ترغب في مراجعتها الآن؟`);
      if (confirmReview) {
        isReviewMode = true;
        activeQuestions = shuffleArray([...wrongQuestions]);
        currentIndex = 0;
        alert("مرحلة المراجعة: ستتم الآن مراجعة الأسئلة التي أخطأت بها بأسلوب عشوائي.");
        loadQuestion();
      } else {
        endGame();
      }
    } else {
      endGame();
    }
  }
}

function updateHeader() {
  const mode = isReviewMode ? "🔄 مراجعة الأخطاء" : `🏆 الشوط ${Math.floor(currentIndex / 5) + 1}`;
  document.getElementById('info-label').innerText = `👤 اللاعب: ${playerName}  |  ✅ إجابات صحيحة: ${correctCount}  |  ${mode}  |  📝 سؤال ${currentIndex + 1}/${activeQuestions.length}`;
}

function endGame() {
  stopTimer();
  document.getElementById('quiz-screen').classList.add('hidden');
  document.getElementById('end-screen').classList.remove('hidden');

  document.getElementById('end-title').innerText = `🎉 انتهى التحدي يا ${playerName}! 🎉`;
  document.getElementById('final-score').innerText = `${correctCount} من ${questionsData.length}`;
}