/* ═══════════════════════════════════════════════
   script.js — AI Chapter 10 Study Guide
═══════════════════════════════════════════════ */

/* ──────────────────────────────────────────────
   1. PARTICLE CANVAS BACKGROUND
────────────────────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.r  = Math.random() * 1.5 + 0.5;
      this.alpha = Math.random() * 0.5 + 0.15;
      this.color = Math.random() > 0.5 ? '79,142,255' : '162,89,255';
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
      ctx.fill();
    }
  }

  const N = Math.min(120, Math.floor(W * H / 8000));
  for (let i = 0; i < N; i++) particles.push(new Particle());

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(79,142,255,${0.08 * (1 - d / 100)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ──────────────────────────────────────────────
   2. NEURAL NET SVG ANIMATION (HERO)
────────────────────────────────────────────── */
(function buildNeuralNet() {
  const container = document.getElementById('neural-net');
  if (!container) return;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '380');
  svg.setAttribute('height', '380');
  svg.setAttribute('viewBox', '0 0 380 380');
  svg.style.overflow = 'visible';
  container.appendChild(svg);

  // Layer definitions [x, nodeCount]
  const layers = [
    { x: 60,  nodes: 3 },
    { x: 150, nodes: 5 },
    { x: 240, nodes: 5 },
    { x: 330, nodes: 3 },
  ];
  const cy = 190;
  const spacing = 55;
  const colors  = ['#4f8eff', '#a259ff', '#00d9a3'];

  // Compute node positions
  const nodePos = layers.map(({ x, nodes }) => {
    const startY = cy - ((nodes - 1) * spacing) / 2;
    return Array.from({ length: nodes }, (_, i) => ({ x, y: startY + i * spacing }));
  });

  // Draw connections
  const connGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  connGroup.setAttribute('opacity', '0.25');
  nodePos.forEach((layer, li) => {
    if (li === nodePos.length - 1) return;
    layer.forEach(a => {
      nodePos[li + 1].forEach(b => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);
        line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
        line.setAttribute('stroke', 'url(#lineGrad)');
        line.setAttribute('stroke-width', '1');
        connGroup.appendChild(line);
      });
    });
  });

  // Gradient def
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  grad.setAttribute('id', 'lineGrad');
  grad.setAttribute('x1', '0%'); grad.setAttribute('x2', '100%');
  [['0%', '#4f8eff'], ['100%', '#a259ff']].forEach(([offset, color]) => {
    const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop.setAttribute('offset', offset); stop.setAttribute('stop-color', color);
    grad.appendChild(stop);
  });
  defs.appendChild(grad);
  svg.appendChild(defs);
  svg.appendChild(connGroup);

  // Draw nodes
  nodePos.forEach((layer, li) => {
    layer.forEach((pos, ni) => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

      // Glow ring
      const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      ring.setAttribute('cx', pos.x); ring.setAttribute('cy', pos.y); ring.setAttribute('r', '16');
      ring.setAttribute('fill', 'none');
      ring.setAttribute('stroke', colors[li % colors.length]);
      ring.setAttribute('stroke-width', '1');
      ring.setAttribute('opacity', '0.3');
      g.appendChild(ring);

      // Node
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', pos.x); circle.setAttribute('cy', pos.y); circle.setAttribute('r', '10');
      circle.setAttribute('fill', colors[li % colors.length]);
      circle.setAttribute('opacity', '0.9');
      // Pulse animation
      const anim = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
      anim.setAttribute('attributeName', 'r');
      anim.setAttribute('values', '10;12;10');
      anim.setAttribute('dur', `${1.5 + (li * 0.3 + ni * 0.2)}s`);
      anim.setAttribute('repeatCount', 'indefinite');
      circle.appendChild(anim);
      g.appendChild(circle);
      svg.appendChild(g);
    });
  });

  // Animated signal dots
  function createSignal() {
    const li    = Math.floor(Math.random() * (layers.length - 1));
    const fromN = Math.floor(Math.random() * nodePos[li].length);
    const toN   = Math.floor(Math.random() * nodePos[li + 1].length);
    const from  = nodePos[li][fromN];
    const to    = nodePos[li + 1][toN];
    const dot   = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('r', '4');
    dot.setAttribute('fill', '#00d9a3');
    dot.setAttribute('opacity', '0.9');

    const dur  = 0.8 + Math.random() * 0.4;
    const animX = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    animX.setAttribute('attributeName', 'cx');
    animX.setAttribute('from', from.x); animX.setAttribute('to', to.x);
    animX.setAttribute('dur', `${dur}s`); animX.setAttribute('fill', 'freeze');
    const animY = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    animY.setAttribute('attributeName', 'cy');
    animY.setAttribute('from', from.y); animY.setAttribute('to', to.y);
    animY.setAttribute('dur', `${dur}s`); animY.setAttribute('fill', 'freeze');
    const animO = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    animO.setAttribute('attributeName', 'opacity');
    animO.setAttribute('from', '0.9'); animO.setAttribute('to', '0');
    animO.setAttribute('dur', `${dur}s`); animO.setAttribute('fill', 'freeze');

    dot.appendChild(animX); dot.appendChild(animY); dot.appendChild(animO);
    dot.setAttribute('cx', from.x); dot.setAttribute('cy', from.y);
    svg.appendChild(dot);
    setTimeout(() => svg.removeChild(dot), dur * 1000);
  }
  setInterval(createSignal, 300);
})();

/* ──────────────────────────────────────────────
   3. SCROLL PROGRESS BAR
────────────────────────────────────────────── */
const progressBar = document.getElementById('progress-bar');
window.addEventListener('scroll', () => {
  const doc = document.documentElement;
  const pct = (doc.scrollTop / (doc.scrollHeight - doc.clientHeight)) * 100;
  progressBar.style.width = pct + '%';
}, { passive: true });

/* ──────────────────────────────────────────────
   4. NAV SCROLL-SHRINK & HAMBURGER
────────────────────────────────────────────── */
const topnav   = document.getElementById('topnav');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');

window.addEventListener('scroll', () => {
  topnav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

/* ──────────────────────────────────────────────
   5. ACTIVE NAV LINK (IntersectionObserver)
────────────────────────────────────────────── */
const sections = document.querySelectorAll('section[id], header[id]');
const navItems  = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navItems.forEach(n => n.classList.remove('active'));
      const active = document.querySelector(`.nav-link[href="#${e.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => sectionObserver.observe(s));

/* ──────────────────────────────────────────────
   6. SCROLL REVEAL ANIMATION
────────────────────────────────────────────── */
const revealables = document.querySelectorAll(
  '.toc-card, .info-card, .paradigm-card, .method-section, ' +
  '.callout, .sidebar-card, .un-task, .ens-card, .timeline-item, ' +
  '.comparison-table, .case-study, .mpi-analogy, .mpi-pillars, ' +
  '.quiz-question, .pillar, .feat-card'
);
revealables.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.08 });

revealables.forEach(el => revealObserver.observe(el));

/* ──────────────────────────────────────────────
   7. SUPERVISED LEARNING TABS
────────────────────────────────────────────── */
document.querySelectorAll('.sl-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const targetId = 'tab-content-' + tab.dataset.tab;
    document.querySelectorAll('.sl-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.sl-tab-content').forEach(c => c.classList.add('hidden'));
    tab.classList.add('active');
    document.getElementById(targetId).classList.remove('hidden');
  });
});

/* ──────────────────────────────────────────────
   8. QUIZ SYSTEM
────────────────────────────────────────────── */
const QUIZ_DATA = [
  {
    q: 'Which learning method stores input-output pairs directly in memory without any generalisation?',
    options: ['Supervised Learning', 'Rote Learning', 'Ensemble Learning', 'Reinforcement Learning'],
    answer: 1,
    explanation: 'Rote Learning simply memorises exact input-output pairs and retrieves them via direct lookup — no generalisation occurs, which is both its greatest strength and its key limitation.'
  },
  {
    q: 'What is the key distinguishing characteristic of Supervised Learning?',
    options: [
      'It requires no training data',
      'It discovers hidden clusters without labels',
      'It trains on labeled input-output pairs',
      'It combines multiple models'
    ],
    answer: 2,
    explanation: 'Supervised Learning requires a labeled dataset where each training example has a known correct output — the model learns the mapping f(X) → Y from these examples.'
  },
  {
    q: 'In the "Bank Credit Risk" example, which feature for Ram indicated a high risk of default?',
    options: ['His age (32)', 'His employment status (employed)', 'His low credit score (580) and high existing debts', 'His annual income'],
    answer: 2,
    explanation: 'While Ram is employed and has an income, his credit score of 580 (Fair) and high existing debts are the strongest predictors of default risk — the model recognised this pattern from historical data.'
  },
  {
    q: 'What does Semi-supervised Learning solve compared to pure Supervised Learning?',
    options: [
      'It eliminates the need for any data',
      'It reduces the cost and burden of labeling large datasets',
      'It always achieves higher accuracy',
      'It can work without any labeled examples'
    ],
    answer: 1,
    explanation: 'Semi-supervised Learning leverages a small amount of labeled data combined with large amounts of unlabeled data, dramatically reducing the expensive manual labeling requirement of pure supervised approaches.'
  },
  {
    q: 'Which Ensemble Learning strategy trains models sequentially, with each model focusing on the errors of the previous one?',
    options: ['Bagging', 'Stacking', 'Boosting', 'Dropout'],
    answer: 2,
    explanation: 'Boosting (e.g., XGBoost, AdaBoost) trains a sequence of models where each successive learner is tuned to correct the mistakes of its predecessor — this is a powerful technique for reducing bias.'
  },
  {
    q: 'Knowledge Discovery in Databases (KDD) / Data Mining emphasises which property MOST uniquely compared to standard ML?',
    options: [
      'High prediction accuracy',
      'Human interpretability and novelty of the extracted knowledge',
      'Using labeled data for training',
      'Combining multiple models'
    ],
    answer: 1,
    explanation: 'KDD/Data Mining specifically requires that discovered patterns be previously unknown, valid, useful, AND understandable — human interpretability is a first-class requirement, unlike in many ML tasks.'
  },
  {
    q: 'Learning by Problem Solving is the theoretical foundation of which major ML paradigm?',
    options: ['Convolutional Neural Networks', 'Generative Adversarial Networks', 'Reinforcement Learning', 'Transfer Learning'],
    answer: 2,
    explanation: 'Learning by Problem Solving — where an agent improves by iteratively solving tasks and receiving reward signals — is exactly the core mechanism of Reinforcement Learning (RL).'
  },
  {
    q: 'The "Job Application Feedback" analogy is used to explain which AI framework?',
    options: ['k-Means Clustering', 'Multi-perspective Integrated Intelligence (MPI)', 'Backpropagation', 'Bayes Theorem'],
    answer: 1,
    explanation: 'MPI is explained through the analogy of a job applicant receiving rejection feedback, learning from it, adapting, and reapplying — mirroring the observe → reason → learn → act cycle of integrated intelligent systems.'
  }
];

let quizScore = 0;
let answered  = 0;

function buildQuiz() {
  const container = document.getElementById('quiz-container');
  const scoreDiv  = document.getElementById('quiz-score');
  container.innerHTML = '';
  scoreDiv.style.display = 'none';
  quizScore = 0; answered = 0;

  QUIZ_DATA.forEach((item, idx) => {
    const qDiv = document.createElement('div');
    qDiv.className = 'quiz-question reveal';
    qDiv.id = `q-${idx}`;

    const qTitle = document.createElement('h4');
    qTitle.textContent = `Q${idx + 1}. ${item.q}`;
    qDiv.appendChild(qTitle);

    const optGroup = document.createElement('div');
    optGroup.className = 'quiz-options';
    item.options.forEach((opt, oi) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option';
      btn.textContent = `${String.fromCharCode(65 + oi)}. ${opt}`;
      btn.addEventListener('click', () => handleAnswer(idx, oi, qDiv, item));
      optGroup.appendChild(btn);
    });

    qDiv.appendChild(optGroup);
    container.appendChild(qDiv);

    // Trigger reveal
    setTimeout(() => {
      revealObserver.observe(qDiv);
    }, 50);
  });
}

function handleAnswer(qIdx, chosen, qDiv, item) {
  const buttons = qDiv.querySelectorAll('.quiz-option');
  buttons.forEach((btn, i) => {
    btn.disabled = true;
    if (i === item.answer) btn.classList.add('correct');
    if (i === chosen && chosen !== item.answer) btn.classList.add('wrong');
  });

  const explanation = document.createElement('div');
  explanation.className = 'quiz-explanation';
  explanation.innerHTML = `<strong>${chosen === item.answer ? '✅ Correct!' : '❌ Incorrect.'}</strong> ${item.explanation}`;
  qDiv.appendChild(explanation);

  if (chosen === item.answer) quizScore++;
  answered++;

  if (answered === QUIZ_DATA.length) {
    setTimeout(showScore, 600);
  }
}

function showScore() {
  const scoreDiv = document.getElementById('quiz-score');
  const emoji    = document.getElementById('score-emoji');
  const text     = document.getElementById('score-text');
  const pct = Math.round((quizScore / QUIZ_DATA.length) * 100);

  const results = [
    { t: 50,  e: '📖', m: `${quizScore}/${QUIZ_DATA.length} — Keep studying! Review the sections you missed.` },
    { t: 75,  e: '👍', m: `${quizScore}/${QUIZ_DATA.length} — Good effort! A few more review sessions and you'll be ready.` },
    { t: 90,  e: '🌟', m: `${quizScore}/${QUIZ_DATA.length} — Excellent! You have a strong grasp of the material.` },
    { t: 101, e: '🏆', m: `${quizScore}/${QUIZ_DATA.length} — Perfect score! You're fully prepared for the seminar!` },
  ];

  const r = results.find(x => pct < x.t);
  emoji.textContent = r.e;
  text.textContent  = r.m;
  scoreDiv.style.display = 'block';
  scoreDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

document.getElementById('retake-btn').addEventListener('click', () => {
  buildQuiz();
  document.getElementById('quiz-container').scrollIntoView({ behavior: 'smooth' });
});

buildQuiz();

/* ──────────────────────────────────────────────
   9. SMOOTH ANCHOR SCROLL (offset for fixed nav)
────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id = anchor.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ──────────────────────────────────────────────
   10. COUNTER ANIMATION FOR HERO STATS
────────────────────────────────────────────── */
function animateCounter(el, target, suffix = '') {
  let current = 0;
  const step  = Math.ceil(target / 40);
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current + suffix;
    if (current >= target) clearInterval(timer);
  }, 30);
}

const heroObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    const stats = document.querySelectorAll('.stat-num');
    const values = [[8, ''], [3, ''], [10, '+']];
    stats.forEach((el, i) => {
      const [val, suf] = values[i];
      animateCounter(el, val, suf);
    });
    heroObserver.disconnect();
  }
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) heroObserver.observe(heroStats);

/* ──────────────────────────────────────────────
   11. TOOLTIP ON METHOD CHIPS (just a nice touch)
────────────────────────────────────────────── */
const chipHints = {
  'Rote'           : 'Section 10.3.1 — Direct memorisation',
  'Observations'   : 'Section 10.3.2 — Pattern extraction from facts',
  'Supervised'     : 'Section 10.3.3 — Learning with labels',
  'Unsupervised'   : 'Section 10.3.4 — Hidden structure discovery',
  'Semi-supervised': 'Section 10.3.5 — Hybrid approach',
  'Ensemble'       : 'Section 10.3.6 — Combining models',
  'Discovery'      : 'Section 10.3.7 — Data Mining / KDD',
  'Problem Solving': 'Section 10.3.8 — Learn by doing',
};

document.querySelectorAll('.method-chip').forEach(chip => {
  const key = Object.keys(chipHints).find(k => chip.textContent.includes(k));
  if (key) chip.title = chipHints[key];
});

console.log('%c🧠 AI Chapter 10 — Study Guide Loaded', 'color:#4f8eff;font-size:14px;font-weight:bold;');
console.log('%cGood luck on your seminar! 🎓', 'color:#00d9a3;font-size:12px;');
