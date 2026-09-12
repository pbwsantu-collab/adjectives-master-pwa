/* Adjectives Master – Core Application */
const App = {
  state: {
    screen: 'home',
    lessonIndex: 0,
    stepIndex: 0,
    voiceOn: true,
    rate: 0.95,
    rateLabel: '▶ Normal',
    quizIndex: 0,
    answers: {},
    completedLessons: JSON.parse(localStorage.getItem('adj_completed') || '[]'),
    achievements: JSON.parse(localStorage.getItem('adj_achievements') || '[]')
  },

  init() {
    this.bindEvents();
    this.renderHome();
    this.updateProgress();
    this.checkAchievements();
  },

  bindEvents() {
    document.getElementById('startBtn').onclick = () => this.startLesson(0);
    document.getElementById('continueBtn').onclick = () => {
      const last = this.state.completedLessons.length ? Math.min(this.state.completedLessons.length, LESSONS.length - 1) : 0;
      this.startLesson(last);
    };
    document.getElementById('challengeBtn').onclick = () => this.startChallenge();
    document.getElementById('menuBtn').onclick = () => this.showHome();
    document.getElementById('prevStepBtn').onclick = () => this.prevStep();
    document.getElementById('nextStepBtn').onclick = () => this.nextStep();
    document.getElementById('playPauseBtn').onclick = () => this.togglePlay();
    document.getElementById('replayBtn').onclick = () => this.replayStep();
    document.getElementById('voiceToggleBtn').onclick = () => this.toggleVoice();
    document.getElementById('speedBtn').onclick = () => this.cycleSpeed();
    document.getElementById('prevLessonBtn').onclick = () => this.prevLesson();
    document.getElementById('nextLessonBtn').onclick = () => this.nextLesson();
    document.getElementById('reviewWrongBtn').onclick = () => this.showReview();
    document.getElementById('retryBtn').onclick = () => this.startChallenge();
    document.getElementById('printResultBtn').onclick = () => window.print();
    document.getElementById('homeFromResultBtn').onclick = () => this.showHome();
    document.getElementById('backFromReviewBtn').onclick = () => this.showResult();
  },

  showHome() {
    TTS.stop();
    this.state.screen = 'home';
    this.hideAll();
    document.getElementById('homeScreen').classList.remove('hidden');
    document.getElementById('controls').style.display = 'none';
    this.renderHome();
    this.updateProgress();
  },

  hideAll() {
    ['homeScreen','lessonScreen','quizScreen','resultScreen','reviewScreen'].forEach(id => {
      document.getElementById(id).classList.add('hidden');
    });
  },

  renderHome() {
    const list = document.getElementById('lessonList');
    list.innerHTML = LESSONS.map((l, i) => {
      const done = this.state.completedLessons.includes(i);
      return `<div class="lesson-item ${done ? 'done' : ''}" onclick="App.startLesson(${i})">
        <div class="lesson-num">${done ? '✓' : i + 1}</div>
        <div class="lesson-title">${l.title}</div>
        <div class="lesson-status">${done ? 'Completed' : ''}</div>
      </div>`;
    }).join('');
    this.renderAchievements('homeAchievements');
  },

  startLesson(idx) {
    TTS.stop();
    this.state.lessonIndex = idx;
    this.state.stepIndex = 0;
    this.state.screen = 'lesson';
    this.hideAll();
    document.getElementById('lessonScreen').classList.remove('hidden');
    document.getElementById('controls').style.display = 'flex';
    this.renderStep();
    this.updateProgress();
  },

  renderStep() {
    const lesson = LESSONS[this.state.lessonIndex];
    const step = lesson.steps[this.state.stepIndex];
    const card = document.getElementById('slideCard');
    card.innerHTML = step.html;
    const reveals = card.querySelectorAll('.reveal');
    reveals.forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), 120 + i * 180);
    });
    document.getElementById('progressLabel').textContent = `Lesson ${this.state.lessonIndex + 1} of ${LESSONS.length} · Step ${this.state.stepIndex + 1}/${lesson.steps.length}`;
    this.updateProgressBar((this.state.lessonIndex + (this.state.stepIndex + 1) / lesson.steps.length) / LESSONS.length * 100);
    if (this.state.voiceOn && step.voice) {
      setTimeout(() => TTS.speakSequence(step.voice), 400);
    }
  },

  nextStep() {
    TTS.stop();
    const lesson = LESSONS[this.state.lessonIndex];
    if (this.state.stepIndex < lesson.steps.length - 1) {
      this.state.stepIndex++;
      this.renderStep();
    } else {
      this.completeLesson(this.state.lessonIndex);
      if (this.state.lessonIndex < LESSONS.length - 1) {
        this.state.lessonIndex++;
        this.state.stepIndex = 0;
        this.renderStep();
      } else {
        this.startChallenge();
      }
    }
  },

  prevStep() {
    TTS.stop();
    if (this.state.stepIndex > 0) {
      this.state.stepIndex--;
      this.renderStep();
    } else if (this.state.lessonIndex > 0) {
      this.state.lessonIndex--;
      this.state.stepIndex = LESSONS[this.state.lessonIndex].steps.length - 1;
      this.renderStep();
    }
  },

  nextLesson() {
    TTS.stop();
    this.completeLesson(this.state.lessonIndex);
    if (this.state.lessonIndex < LESSONS.length - 1) {
      this.state.lessonIndex++;
      this.state.stepIndex = 0;
      this.renderStep();
    } else {
      this.startChallenge();
    }
  },

  prevLesson() {
    TTS.stop();
    if (this.state.lessonIndex > 0) {
      this.state.lessonIndex--;
      this.state.stepIndex = 0;
      this.renderStep();
    }
  },

  completeLesson(idx) {
    if (!this.state.completedLessons.includes(idx)) {
      this.state.completedLessons.push(idx);
      localStorage.setItem('adj_completed', JSON.stringify(this.state.completedLessons));
      this.checkAchievements();
    }
  },

  togglePlay() {
    if (TTS.speaking) {
      TTS.stop();
      document.getElementById('playPauseBtn').textContent = '▶';
    } else {
      this.replayStep();
      document.getElementById('playPauseBtn').textContent = '⏸';
    }
  },

  replayStep() {
    const step = LESSONS[this.state.lessonIndex].steps[this.state.stepIndex];
    if (step.voice) {
      TTS.speakSequence(step.voice).then(() => {
        document.getElementById('playPauseBtn').textContent = '▶';
      });
      document.getElementById('playPauseBtn').textContent = '⏸';
    }
  },

  toggleVoice() {
    this.state.voiceOn = TTS.toggle();
    document.getElementById('voiceToggleBtn').textContent = this.state.voiceOn ? '🔊' : '🔇';
    if (!this.state.voiceOn) TTS.stop();
  },

  cycleSpeed() {
    const speeds = [
      { r: 0.75, label: '🐢 Slow' },
      { r: 0.95, label: '▶ Normal' },
      { r: 1.15, label: '⚡ Fast' }
    ];
    const cur = speeds.findIndex(s => s.r === this.state.rate);
    const next = speeds[(cur + 1) % speeds.length];
    this.state.rate = next.r;
    this.state.rateLabel = next.label;
    TTS.setRate(next.r);
    document.getElementById('speedBtn').textContent = next.label;
  },

  startChallenge() {
    TTS.stop();
    this.state.screen = 'quiz';
    this.state.quizIndex = 0;
    this.state.answers = {};
    this.hideAll();
    document.getElementById('quizScreen').classList.remove('hidden');
    document.getElementById('controls').style.display = 'none';
    this.renderQuestion();
  },

  renderQuestion() {
    const q = QUESTIONS[this.state.quizIndex];
    document.getElementById('qNum').textContent = `Question ${this.state.quizIndex + 1} / 100`;
    document.getElementById('qText').textContent = q.q;
    const opts = document.getElementById('qOptions');
    const fb = document.getElementById('qFeedback');
    fb.className = 'feedback';
    fb.innerHTML = '';
    const nav = document.getElementById('quizNav');
    nav.innerHTML = '';

    if (q.type === 'mcq') {
      opts.innerHTML = q.options.map((o, i) =>
        `<div class="option" data-i="${i}">${String.fromCharCode(65 + i)}. ${o}</div>`
      ).join('');
      opts.querySelectorAll('.option').forEach(el => {
        el.onclick = () => this.selectAnswer(parseInt(el.dataset.i));
      });
    } else {
      opts.innerHTML = `<input type="text" id="fillInput" placeholder="Type your answer..." style="width:100%;padding:0.8rem;border-radius:10px;border:1px solid #475569;background:#1e293b;color:#f1f5f9;font-size:1rem">
        <button class="btn btn-primary mt-1" id="checkFillBtn">Check Answer</button>`;
      document.getElementById('checkFillBtn').onclick = () => {
        const val = document.getElementById('fillInput').value.trim().toLowerCase();
        this.selectAnswer(val);
      };
    }
    this.updateProgressBar((this.state.quizIndex + 1) / 100 * 100);
    document.getElementById('progressLabel').textContent = `Challenge · ${this.state.quizIndex + 1}/100`;
  },

  selectAnswer(ans) {
    const q = QUESTIONS[this.state.quizIndex];
    this.state.answers[q.id] = ans;
    const fb = document.getElementById('qFeedback');
    let correct = false;
    if (q.type === 'mcq') {
      correct = ans === q.answer;
      document.querySelectorAll('.option').forEach((el, i) => {
        el.classList.remove('selected', 'correct', 'wrong');
        if (i === q.answer) el.classList.add('correct');
        if (i === ans && !correct) el.classList.add('wrong');
        el.style.pointerEvents = 'none';
      });
    } else {
      const expected = q.answer.toLowerCase();
      correct = ans === expected || ans.includes(expected) || expected.includes(ans);
    }
    fb.className = `feedback show ${correct ? 'correct' : 'wrong'}`;
    fb.innerHTML = `
      <strong>${correct ? '✓ Correct!' : '✗ Incorrect'}</strong><br>
      ${q.type === 'mcq' ? `Correct Answer: ${q.options[q.answer]}` : `Answer: ${q.answer}`}<br>
      <div class="bn" style="margin-top:0.5rem">${q.bn}</div>
      <small style="color:var(--text-muted)">Rule: ${q.rule}</small>
    `;
    const nav = document.getElementById('quizNav');
    if (this.state.quizIndex < 99) {
      nav.innerHTML = `<button class="btn btn-primary" onclick="App.nextQuestion()">Next Question →</button>`;
    } else {
      nav.innerHTML = `<button class="btn btn-accent" onclick="App.showResult()">See Result 🎉</button>`;
    }
  },

  nextQuestion() {
    this.state.quizIndex++;
    this.renderQuestion();
  },

  showResult() {
    this.hideAll();
    document.getElementById('resultScreen').classList.remove('hidden');
    let correct = 0, wrong = 0, unanswered = 0;
    QUESTIONS.forEach(q => {
      const a = this.state.answers[q.id];
      if (a === undefined) unanswered++;
      else if (q.type === 'mcq' ? a === q.answer : String(a).toLowerCase().includes(q.answer.toLowerCase())) correct++;
      else wrong++;
    });
    const pct = Math.round((correct / 100) * 100);
    document.getElementById('scorePct').textContent = pct + '%';
    document.getElementById('scoreText').textContent = `${correct} / 100`;
    document.getElementById('scoreCircle').style.setProperty('--pct', pct);
    let msg = 'Keep Practising!';
    if (pct >= 90) msg = 'Excellent! You are an Adjective Master! 🏆';
    else if (pct >= 75) msg = 'Very Good! Strong command of Adjectives. 🎓';
    else if (pct >= 50) msg = 'Good effort! Review the weak areas. 📖';
    document.getElementById('scoreMessage').textContent = msg;
    if (pct >= 90) this.unlockAchievement('🏆 Adjective Master');
    if (correct >= 50) this.unlockAchievement('⚡ Practice Champion');
    this.updateProgressBar(100);
  },

  showReview() {
    this.hideAll();
    document.getElementById('reviewScreen').classList.remove('hidden');
    const list = document.getElementById('wrongList');
    const wrongs = QUESTIONS.filter(q => {
      const a = this.state.answers[q.id];
      if (a === undefined) return false;
      return q.type === 'mcq' ? a !== q.answer : !String(a).toLowerCase().includes(q.answer.toLowerCase());
    });
    if (!wrongs.length) {
      list.innerHTML = '<p>No wrong answers – perfect score! 🎉</p>';
      return;
    }
    list.innerHTML = wrongs.map(q => `
      <div style="margin:1rem 0;padding:1rem;background:var(--bg-soft);border-radius:12px">
        <strong>Q${q.id}. ${q.q}</strong><br>
        Your answer: ${q.type === 'mcq' ? q.options[this.state.answers[q.id]] : this.state.answers[q.id]}<br>
        Correct: ${q.type === 'mcq' ? q.options[q.answer] : q.answer}<br>
        <div class="bn">${q.bn}</div>
        <small>Rule: ${q.rule}</small>
      </div>
    `).join('');
  },

  updateProgress() {
    const done = this.state.completedLessons.length;
    this.updateProgressBar((done / LESSONS.length) * 100);
  },

  updateProgressBar(pct) {
    document.getElementById('progressFill').style.width = Math.min(100, pct) + '%';
  },

  unlockAchievement(name) {
    if (!this.state.achievements.includes(name)) {
      this.state.achievements.push(name);
      localStorage.setItem('adj_achievements', JSON.stringify(this.state.achievements));
    }
  },

  checkAchievements() {
    if (this.state.completedLessons.length >= 1) this.unlockAchievement('📖 Lesson Starter');
    if (this.state.completedLessons.length >= 10) this.unlockAchievement('🎓 Rule Learner');
    if (this.state.completedLessons.length >= 25) this.unlockAchievement('🧠 Grammar Thinker');
  },

  renderAchievements(elId) {
    const el = document.getElementById(elId);
    if (!el) return;
    const all = ['📖 Lesson Starter','🎓 Rule Learner','🧠 Grammar Thinker','⚡ Practice Champion','🏆 Adjective Master'];
    el.innerHTML = all.map(a =>
      `<span class="badge ${this.state.achievements.includes(a) ? 'unlocked' : ''}">${a}</span>`
    ).join('');
  }
};

function startChallenge() { App.startChallenge(); }

document.addEventListener('DOMContentLoaded', () => App.init());
