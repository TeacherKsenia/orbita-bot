const tools = [
  {id:'excuse',name:'Excuse Me',icon:'<svg viewBox="0 0 48 48"><path d="M10 11h28a6 6 0 0 1 6 6v12a6 6 0 0 1-6 6H23l-9 7 2-7h-6a6 6 0 0 1-6-6V17a6 6 0 0 1 6-6Z"/><circle cx="16" cy="23" r="1.8"/><circle cx="24" cy="23" r="1.8"/><circle cx="32" cy="23" r="1.8"/></svg>',color:'#ff7f5c',rgb:'255,127,92',desc:'Create a believable explanation',prompt:'What do you need to explain?',placeholder:'Describe what happened, who you’re talking to, and the tone you want…',sections:[['Suggested explanation','I’m sorry — I underestimated how much I had on my plate and wasn’t able to give this the attention it deserved. I should have let you know sooner.'],['More casual version','Hey, sorry about this. My day got away from me, and I should’ve given you a heads-up earlier.'],['More formal version','Please accept my apologies. An unexpected conflict affected my timing, and I regret not communicating the delay sooner.']]},
  {id:'untangle',name:'Untangle',icon:'<svg viewBox="0 0 48 48"><path d="M15 30c-8-2-8-14 0-16 5-9 17-6 17 2 9-1 12 11 5 15 2 8-9 12-14 6-6 5-14-2-8-7Z"/><path d="M16 27c3-9 14-11 18-3M19 15c7 2 11 8 8 16M13 21c7-3 15 1 17 9"/></svg>',color:'#a76bff',rgb:'167,107,255',desc:'Sort out chaotic thoughts',prompt:'Dump your thoughts.',placeholder:'Tell me what’s going on in your head…',sections:[['What’s going on','You’re holding several concerns at once, which makes each of them feel equally urgent.'],['What matters now','Choose the one thing with a real deadline or consequence today.'],['What can wait','Questions that don’t need an answer this week can be parked without being ignored.'],['First small step','Write down the next physical action and give it ten focused minutes.']]},
  {id:'good',name:'Find the Good',icon:'<svg viewBox="0 0 48 48"><path d="m24 6 5.2 10.6L41 18.3l-8.5 8.3 2 11.7L24 32.8l-10.5 5.5 2-11.7L7 18.3l11.8-1.7Z"/></svg>',color:'#ffc343',rgb:'255,195,67',desc:'Find the positives and wins',prompt:'Tell me about your day.',placeholder:'It can be messy, ordinary, difficult — share whatever happened…',sections:[['Something good','You made it through the day and paused long enough to reflect on it.'],['Small win','One imperfect step still counts as movement.'],['Something useful','The difficult part showed you where you need more space or support.'],['Worth remembering','A hard day is information, not a verdict on how you’re doing.']]},
  {id:'reality',name:'Reality Check',icon:'<svg viewBox="0 0 48 48"><path d="M24 8v31M15 40h18M10 14h28M14 14 7 28h14ZM34 14l-7 14h14Z"/><path d="M7 28c2 5 12 5 14 0M27 28c2 5 12 5 14 0"/></svg>',color:'#25d5e8',rgb:'37,213,232',desc:'Separate facts from assumptions',prompt:'What situation are you questioning?',placeholder:'Describe the facts and the story your mind is adding…',sections:[['Facts','You have limited information, and something important still feels unresolved.'],['Assumptions','You may be treating one possible explanation as the only explanation.'],['Possible overthinking','Predicting someone else’s thoughts before they’ve shared them.'],['What you know','You can ask one clear question and respond to what actually happens.']]},
  {id:'decide',name:'Help Me Decide',icon:'<svg viewBox="0 0 48 48"><path d="M23 8v32M23 14H12l-6 6 6 6h11M23 22h13l6 6-6 6H23"/></svg>',color:'#58dc89',rgb:'88,220,137',desc:'Compare options and decide',prompt:'What are you deciding between?',placeholder:'Share your options, constraints, and what matters most…',sections:[['Option A','Likely offers familiarity and lower short-term risk.'],['Option B','May bring more growth, with greater uncertainty at first.'],['Trade-off','The choice is between immediate comfort and a potentially better long-term fit.'],['Best fit','Prefer the option that supports your top priority, not the longest list of minor benefits.']]},
  {id:'perspective',name:'Perspective Shift',icon:'<svg viewBox="0 0 48 48"><path d="M3 24s8-13 21-13 21 13 21 13-8 13-21 13S3 24 3 24Z"/><circle cx="24" cy="24" r="7"/><circle cx="24" cy="24" r="2"/></svg>',color:'#f35caa',rgb:'243,92,170',desc:'See from different points of view',prompt:'What would you like to see differently?',placeholder:'Describe the situation from your point of view…',sections:[['From your side','Your reaction makes sense given what you expected and what you experienced.'],['From their side','They may be acting from incomplete information rather than bad intent.'],['From six months ahead','This may look less like a defining moment and more like one useful course correction.']]}
];

const root = document.documentElement;
const body = document.body;
const toolsEl = document.querySelector('#tools');
const orbitCamera = document.querySelector('#orbitCamera');
const orbitSystem = document.querySelector('#orbitSystem');
const core = document.querySelector('#core');
const workspace = document.querySelector('#workspace');
const form = document.querySelector('#toolForm');
const input = document.querySelector('#userInput');
const response = document.querySelector('#response');
const responseContent = document.querySelector('#responseContent');
const backButton = document.querySelector('#backButton');
const generateButton = document.querySelector('#generateButton');
const promptLabel = document.querySelector('#promptLabel');
const charCount = document.querySelector('#charCount');
const cursorTrail = document.querySelector('#cursorTrail');
const twinkleStars = document.querySelector('#twinkleStars');
const soundToggle = document.querySelector('#soundToggle');
const spaceBackground = document.querySelector('#bg');
const ambientAudio = document.querySelector('#ambientAudio');
const responseLabel = document.querySelector('.response-top span');

// Leave empty for local/same-origin hosting. Add the Timeweb server URL here
// when the frontend is published separately on GitHub Pages.
const API_BASE_URL = 'https://cx900410.tw1.ru';
const API_TIMEOUT_MS = 10000;

let active = null;
let activeButton = null;
let morphLocked = false;
let workspaceTimer = null;
let cleanupTimer = null;

const mobileQuery = matchMedia('(max-width: 760px) and (orientation: portrait)');
const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
const isMobile = () => mobileQuery.matches;
const reducedMotion = () => motionQuery.matches;
const isDesktopFirefox = () =>
  /Firefox\//.test(navigator.userAgent) &&
  matchMedia('(min-width: 761px) and (pointer: fine)').matches;

function toolButton(tool) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'tool';
  button.dataset.id = tool.id;
  button.style.setProperty('--color', tool.color);
  button.setAttribute('aria-label', `${tool.name}: ${tool.desc}`);
  button.innerHTML = `<span class="tool-orb" aria-hidden="true">${tool.icon}</span><span class="tool-name">${tool.name}</span><span class="tool-desc">${tool.desc}</span>`;
  button.addEventListener('click', () => selectTool(tool, button));
  return button;
}

tools.forEach(tool => toolsEl.append(toolButton(tool)));

function updateCount() {
  charCount.textContent = input.value.length;
}
input.addEventListener('input', updateCount);

function setToolUI(tool) {
  root.style.setProperty('--accent', tool.color);
  root.style.setProperty('--accent-rgb', tool.rgb);
  promptLabel.textContent = tool.prompt;
  input.placeholder = tool.placeholder;
  input.value = '';
  updateCount();
  response.hidden = true;
  responseContent.innerHTML = '';
  responseLabel.textContent = 'Toolkit response';
  workspace.classList.remove('has-response');
}

function clearTimers() {
  if (workspaceTimer) clearTimeout(workspaceTimer);
  if (cleanupTimer) clearTimeout(cleanupTimer);
  workspaceTimer = null;
  cleanupTimer = null;
}

function activeMotionSettings(button) {
  const zoom = parseFloat(getComputedStyle(root).getPropertyValue('--orbit-active-zoom')) || (isMobile() ? 1.27 : 1.68);

  // Use the untransformed local geometry of the orbit system. offsetLeft/offsetTop
  // ignore the current camera transform, so resize/recalculation cannot compound
  // an already-active rotation or pan.
  const center = { x: core.offsetLeft, y: core.offsetTop };
  const node = { x: button.offsetLeft, y: button.offsetTop };
  const vx = node.x - center.x;
  const vy = node.y - center.y;

  // Every tool gets its own clockwise rotation. All selected tools land on the
  // same focus ray to the right of the Core, which keeps the active composition
  // identical regardless of which node was chosen.
  const baseAngle = Math.atan2(vy, vx) * 180 / Math.PI;
  const focusAngle = 0;
  const rotationDeg = ((focusAngle - baseAngle) % 360 + 360) % 360;
  const theta = rotationDeg * Math.PI / 180;

  const rx = (vx * Math.cos(theta) - vy * Math.sin(theta)) * zoom;
  const ry = (vx * Math.sin(theta) + vy * Math.cos(theta)) * zoom;

  const target = isMobile()
    ? {x: innerWidth * .50, y: Math.min(190, innerHeight * .255)}
    : {x: Math.min(innerWidth * (innerWidth < 1200 ? .285 : .315), 500), y: innerHeight * .50};

  const viewportCenter = {x: innerWidth / 2, y: innerHeight / 2};

  // Long clockwise turns get a little more time so no tool whips around the orbit.
  const duration = reducedMotion() ? 20 : Math.round(Math.min(2200, Math.max(1500, 1500 + rotationDeg * 2)));

  return {
    rotationDeg,
    zoom,
    duration,
    panX: target.x - (viewportCenter.x + rx),
    panY: target.y - (viewportCenter.y + ry)
  };
}

function applyActiveTransform(settings) {
  root.style.setProperty('--morph-duration', `${settings.duration}ms`);
  root.style.setProperty('--camera-x', `${settings.panX}px`);
  root.style.setProperty('--camera-y', `${settings.panY}px`);
  root.style.setProperty('--orbit-rotation', `${settings.rotationDeg}deg`);
  root.style.setProperty('--counter-rotation', `${-settings.rotationDeg}deg`);
  root.style.setProperty('--orbit-zoom', settings.zoom);
}

function resetOrbitTransform() {
  root.style.setProperty('--camera-x', '0px');
  root.style.setProperty('--camera-y', '0px');
  root.style.setProperty('--orbit-rotation', '0deg');
  root.style.setProperty('--counter-rotation', '0deg');
  root.style.removeProperty('--orbit-zoom');
}

function setActiveNode(button) {
  document.querySelectorAll('.tool').forEach(node => {
    node.classList.toggle('selected', node === button);
    node.classList.toggle('dimmed', node !== button);
  });
}

async function selectTool(tool, button) {
  if (morphLocked) return;

  // Clicking the already-active tool is intentionally identical to Back to tools.
  if (active && activeButton === button) {
    returnToTools();
    return;
  }
  if (active) return;

  morphLocked = true;
  clearTimers();
  body.classList.remove('returning');
  body.classList.add('morphing');

  active = tool;
  activeButton = button;
  setToolUI(tool);
  setActiveNode(button);

  const settings = activeMotionSettings(button);

  // One camera morph: tool-specific clockwise rotation + zoom-in + pan.
  requestAnimationFrame(() => {
    body.classList.add('active-mode');
    applyActiveTransform(settings);
  });

  const revealDelay = reducedMotion() ? 0 : settings.duration;
  workspaceTimer = setTimeout(() => {
    workspace.classList.add('visible');
    workspace.setAttribute('aria-hidden', 'false');
    body.classList.remove('morphing');
  }, revealDelay);

  cleanupTimer = setTimeout(() => {
    morphLocked = false;
  }, settings.duration + 70);
}

function returnToTools() {
  if (morphLocked || !active) return;
  morphLocked = true;
  clearTimers();
  body.classList.add('morphing');

  const duration = parseFloat(getComputedStyle(root).getPropertyValue('--morph-duration')) || 1600;

  // The exact same camera transform reverses; the selected tool keeps its colour
  // until the orbit has settled back into the start composition.
  body.classList.add('returning');
  workspace.classList.remove('visible', 'has-response');
  workspace.setAttribute('aria-hidden', 'true');
  response.hidden = true;

  requestAnimationFrame(() => {
    resetOrbitTransform();
  });

  cleanupTimer = setTimeout(() => {
    body.classList.remove('active-mode', 'returning', 'morphing');
    document.querySelectorAll('.tool').forEach(node => node.classList.remove('selected', 'dimmed'));
    root.style.removeProperty('--accent');
    root.style.removeProperty('--accent-rgb');
    root.style.setProperty('--morph-duration', '1600ms');
    active = null;
    activeButton = null;
    morphLocked = false;
  }, reducedMotion() ? 20 : duration + 50);
}

backButton.addEventListener('click', returnToTools);

const API_TOOL_IDS = {
  excuse: 'excuse-me',
  untangle: 'untangle',
  good: 'find-the-good',
  reality: 'reality-check',
  decide: 'help-me-decide',
  perspective: 'perspective-shift'
};

const RESPONSE_TITLES = {
  excuse: [
    'Best option',
    'More casual',
    'More formal'
  ],

  untangle: [
    "What's actually tangled",
    'The part your brain may be amplifying',
    'What to do with it'
  ],

  good: [
    "The part that wasn't terrible",
    'Give yourself this one',
    'A different angle'
  ],

  reality: [
    'Facts',
    'Assumptions',
    'Balanced read'
  ],

  decide: [
    'How the options compare',
    'The real trade-off',
    'Best fit right now'
  ],

  perspective: [
    'Perspective 1 — The neutral observer',
    'Perspective 2 — What else could be true?',
    'Perspective 3 — Zoom way out'
  ]
};


function responseMarkup(tool, answer) {
  const normalized = answer
    .replace(/\r/g, '')
    .trim();

  // Split the AI response by Markdown headings in ANY language:
  // **Heading:**, **Заголовок:**, ### Heading, etc.
  const headingPattern =
    /(?:^|\n)\s*(?:#{1,6}\s+([^\n]+)|\*\*([^*\n]+?)\*\*)\s*(?:\n|$)/g;

  const matches = [...normalized.matchAll(headingPattern)];

  if (matches.length < 2) {
    return singleResponseMarkup(normalized);
  }

  const sections = matches.map((match, index) => {
    const start = match.index + match[0].length;
    const end = index + 1 < matches.length
      ? matches[index + 1].index
      : normalized.length;

    const title = (match[1] || match[2] || '')
      .trim()
      .replace(/:\s*$/, '');

    const text = normalized
  .slice(start, end)
  .trim()
  .replace(/\*\*(.*?)\*\*/g, '$1')
  .replace(/^\s*[-*]\s+/gm, '• ')
  .replace(/^\s*--+\s*$/gm, '')
  .trim();

    return [title, text];
  });

  const items = sections.map(([title, text]) => `
    <article class="response-item">
      <h3>${escapeHTML(title)}</h3>
      <p>${escapeHTML(text).replace(/\n/g, '<br>')}</p>
    </article>
  `).join('');

  return `
    <div class="response-grid response-count-${sections.length}">
      ${items}
    </div>
  `;
}


function singleResponseMarkup(answer) {
  return `
    <div class="response-grid response-count-1">
      <article class="response-item">
        <p>${escapeHTML(answer).replace(/\n/g, '<br>')}</p>
      </article>
    </div>
  `;
}


function mockAnswer(tool) {
  return tool.sections
    .map(([title, text]) => `**${title}**\n${text}`)
    .join('\n\n');
}


async function requestAI(tool, text) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  const baseUrl = API_BASE_URL.replace(/\/$/, '');

  try {
    const apiResponse = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tool: API_TOOL_IDS[tool.id],
        text
      }),
      signal: controller.signal
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok || !data.ok || typeof data.answer !== 'string') {
      throw new Error(data.error || 'AI request failed');
    }

    return data.answer;
  } finally {
    clearTimeout(timeout);
  }
}


form.addEventListener('submit', async event => {
  event.preventDefault();

  const userText = input.value.trim();

  if (!active || !userText) {
    input.focus();
    return;
  }

  generateButton.classList.add('loading');
  generateButton.innerHTML = '<span>✦</span> Thinking…';
  response.hidden = true;

  try {
    const answer = await requestAI(active, userText);

    responseContent.innerHTML = responseMarkup(
      active,
      answer
    );
    responseLabel.textContent = 'Toolkit response';

    workspace.classList.add('has-response');
    response.hidden = false;

  } catch (error) {
    console.warn('AI unavailable; using demo response.', error);

    responseContent.innerHTML = responseMarkup(active, mockAnswer(active));
    responseLabel.textContent = 'Demo response';

    workspace.classList.add('has-response');
    response.hidden = false;

  } finally {
    generateButton.classList.remove('loading');
    generateButton.innerHTML = '<span>✦</span> Generate';
  }
});

function escapeHTML(value) {
  return value.replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
}



/* ---------------- V6 AMBIENCE ---------------- */

function initSmoothBackgroundDrift() {
  if (!spaceBackground) return;

  spaceBackground.src = isMobile() ? 'back-mobile.webp' : 'back-desktop.webp';

  if (reducedMotion() || isDesktopFirefox()) {
    spaceBackground.style.transform = 'translate3d(0, 0, 0)';
    return;
  }

  const frames = window.BACKGROUND_DRIFT_FRAMES;
  if (!Array.isArray(frames) || !frames.length) return;

  spaceBackground.animate(frames, {
    duration: 68000,
    iterations: Infinity,
    easing: 'linear'
  });
}


function initTwinkleStars() {
  if (!twinkleStars) return;

  const stars = [
    [5.5, 17, 3.1, 5.4, -1.2],
    [13, 64, 2.4, 6.7, -3.6],
    [22, 9, 2.1, 7.2, -5.1],
    [31, 82, 3.0, 6.1, -2.0],
    [43, 16, 2.2, 7.7, -4.4],
    [60, 10, 2.5, 6.5, -1.8],
    [68, 77, 3.2, 5.9, -4.9],
    [77, 18, 2.0, 7.4, -3.0],
    [86, 70, 2.8, 6.8, -5.7],
    [93, 26, 3.1, 5.6, -2.7],
    [96, 55, 2.1, 7.9, -6.2],
    [84, 88, 2.6, 6.2, -1.4],
    [54, 90, 2.0, 7.1, -4.1],
    [8, 88, 2.7, 6.4, -5.3]
  ];

  twinkleStars.replaceChildren(...stars.map(([x, y, size, duration, delay]) => {
    const star = document.createElement('span');
    star.className = 'twinkle-star';
    star.style.left = `${x}%`;
    star.style.top = `${y}%`;
    star.style.setProperty('--twinkle-size', `${size}px`);
    star.style.setProperty('--twinkle-duration', `${duration}s`);
    star.style.setProperty('--twinkle-delay', `${delay}s`);
    return star;
  }));
}


function initCursorTrail() {
  if (!cursorTrail || reducedMotion() || !matchMedia('(pointer: fine)').matches) return;

  const ctx = cursorTrail.getContext('2d');
  if (!ctx) return;

  const pointCount = 34;
  const points = Array.from({length: pointCount}, () => ({
    x: innerWidth / 2,
    y: innerHeight / 2
  }));

  let targetX = innerWidth / 2;
  let targetY = innerHeight / 2;
  let visible = 0;
  let dpr = 1;
  let lastPointerAt = 0;
  let animationFrame = null;
  let pointerInitialized = false;

  function resizeTrail() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    cursorTrail.width = Math.round(innerWidth * dpr);
    cursorTrail.height = Math.round(innerHeight * dpr);
    cursorTrail.style.width = `${innerWidth}px`;
    cursorTrail.style.height = `${innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  addEventListener('resize', resizeTrail, {passive: true});

  addEventListener('pointermove', event => {
    targetX = event.clientX;
    targetY = event.clientY;
    if (!pointerInitialized) {
      points.forEach(point => {
        point.x = targetX;
        point.y = targetY;
      });
      pointerInitialized = true;
    }
    visible = Math.min(1, visible + .16);
    lastPointerAt = performance.now();
    if (animationFrame === null && !body.classList.contains('morphing')) {
      animationFrame = requestAnimationFrame(frame);
    }
  }, {passive: true});

  document.documentElement.addEventListener('mouseleave', () => {
    visible = 0;
    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
    ctx.clearRect(0, 0, innerWidth, innerHeight);
  });

  resizeTrail();

  function drawSparkle(x, y, size, alpha, angle, rgb) {
    const longRay = size * 3.4;
    const shortRay = size * 1.55;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = `rgba(${rgb}, 1)`;
    ctx.fillStyle = 'rgba(245, 250, 255, 1)';
    ctx.lineCap = 'round';
    ctx.shadowColor = `rgba(${rgb}, .72)`;
    ctx.shadowBlur = 7 + size * 4;

    ctx.lineWidth = Math.max(.55, size * .30);
    ctx.beginPath();
    ctx.moveTo(-longRay, 0);
    ctx.lineTo(longRay, 0);
    ctx.moveTo(0, -longRay);
    ctx.lineTo(0, longRay);
    ctx.stroke();

    ctx.globalAlpha = alpha * .72;
    ctx.lineWidth = Math.max(.4, size * .20);
    ctx.beginPath();
    ctx.moveTo(-shortRay, -shortRay);
    ctx.lineTo(shortRay, shortRay);
    ctx.moveTo(shortRay, -shortRay);
    ctx.lineTo(-shortRay, shortRay);
    ctx.stroke();

    ctx.globalAlpha = alpha;
    ctx.shadowBlur = 10 + size * 5;
    const core = Math.max(.7, size * .55);
    ctx.fillRect(-core / 2, -core / 2, core, core);

    ctx.restore();
  }

  function frame(now) {
    animationFrame = null;
    if (now - lastPointerAt > 120) visible *= .88;
    ctx.clearRect(0, 0, innerWidth, innerHeight);

    if (visible < .01 || body.classList.contains('morphing')) {
      visible = 0;
      return;
    }

    points.forEach((point, index) => {
      const leader = index === 0 ? {x: targetX, y: targetY} : points[index - 1];
      const easing = index === 0 ? .22 : Math.max(.105, .17 - index * .0013);
      point.x += (leader.x - point.x) * easing;
      point.y += (leader.y - point.y) * easing;
    });

    if (!frame.cachedRgb || now - frame.lastRgbRead > 240) {
      frame.cachedRgb = getComputedStyle(root).getPropertyValue('--accent-rgb').trim() || '167, 107, 255';
      frame.lastRgbRead = now;
    }
    const rgb = frame.cachedRgb;
    ctx.globalCompositeOperation = 'lighter';

    for (let i = pointCount - 1; i >= 0; i -= 1) {
      if (i % 2 !== 0) continue;

      const point = points[i];
      const headness = 1 - i / pointCount;
      const pulse = .84 + Math.sin(now * .004 + i * 1.37) * .16;
      const alpha = visible * (.025 + headness * .24) * pulse;
      const size = .55 + headness * 1.75;
      const angle = now * .00016 + i * .53;

      drawSparkle(point.x, point.y, size, alpha, angle, rgb);

      if (i % 6 === 0) {
        const offset = 4 + (i % 5);
        ctx.save();
        ctx.globalAlpha = alpha * .55;
        ctx.fillStyle = `rgba(${rgb}, 1)`;
        ctx.shadowColor = `rgba(${rgb}, .65)`;
        ctx.shadowBlur = 6;
        ctx.fillRect(point.x + offset, point.y - offset * .45, .9, .9);
        ctx.restore();
      }
    }

    ctx.globalCompositeOperation = 'source-over';
    animationFrame = requestAnimationFrame(frame);
  }
}


/* Real V6 background track supplied by the user. */
let ambientOn = false;
let autoplayUnlocked = false;

function updateSoundButton(on) {
  if (!soundToggle) return;
  soundToggle.setAttribute('aria-pressed', String(on));
  soundToggle.setAttribute('aria-label', on ? 'Pause ambient sound' : 'Play ambient sound');
  soundToggle.title = on ? 'Pause ambient sound' : 'Ambient sound';
}

async function tryStartAmbient() {
  if (!ambientAudio) return false;

  ambientAudio.loop = true;
  ambientAudio.volume = .10;

  try {
    await ambientAudio.play();
    ambientOn = true;
    autoplayUnlocked = true;
    updateSoundButton(true);
    return true;
  } catch (error) {
    ambientOn = false;
    updateSoundButton(false);
    return false;
  }
}

function installAutoplayFallback() {
  if (!ambientAudio) return;

  const unlock = async () => {
    if (autoplayUnlocked || ambientOn) return;

    const started = await tryStartAmbient();
    if (!started) return;

    ['pointerdown', 'keydown', 'touchstart'].forEach(type => {
      window.removeEventListener(type, unlock, true);
    });
  };

  ['pointerdown', 'keydown', 'touchstart'].forEach(type => {
    window.addEventListener(type, unlock, {capture: true, passive: type !== 'keydown'});
  });
}

if (ambientAudio) {
  ambientAudio.volume = .15;
  ambientAudio.loop = true;

  tryStartAmbient();
  installAutoplayFallback();

  ambientAudio.addEventListener('play', () => {
    ambientOn = true;
    updateSoundButton(true);
  });

  ambientAudio.addEventListener('pause', () => {
    ambientOn = false;
    updateSoundButton(false);
  });
}

if (soundToggle && ambientAudio) {
  soundToggle.addEventListener('click', async event => {
    event.preventDefault();

    if (ambientAudio.paused) {
      await tryStartAmbient();
    } else {
      ambientAudio.pause();
    }
  });
}

initSmoothBackgroundDrift();
initTwinkleStars();
initCursorTrail();

window.addEventListener('resize', () => {
  if (!active || !activeButton || morphLocked) return;
  // Recalculate camera framing without changing tool/workspace geometry.
  applyActiveTransform(activeMotionSettings(activeButton));
});
