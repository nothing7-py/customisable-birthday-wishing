const STORAGE_KEY = "birthday-surprise-settings";
const REPLY_KEY = "birthday-surprise-reply";
const readStorage = (key, fallback = null) => { try { return JSON.parse(localStorage.getItem(key) || "null") || fallback; } catch (error) { localStorage.removeItem(key); return fallback; } };
const savedSettings = readStorage(STORAGE_KEY);
const savedReply = readStorage(REPLY_KEY);
const state = { page: 0, theme: savedSettings?.theme || CONFIG.theme, musicPlaying: false, candleCount: 0, surprise: null, openedGift: false, letterOpen: false, submitted: Boolean(savedReply), senderMode: false, birthday: savedSettings?.birthday || CONFIG.birthday, reply: savedReply };
const themes = {
  cherry: { name: "Cherry blossom", description: "A dreamy garden of petals and paper lanterns.", icon: "✿", className: "theme-cherry" },
  forest: { name: "Forest", description: "A quiet woodland with fireflies in the dusk.", icon: "⌁", className: "theme-forest" },
  night: { name: "Night sky", description: "A sky full of stars, just waiting for a wish.", icon: "☾", className: "theme-night" },
  ocean: { name: "Ocean", description: "A little blue world where everything moves gently.", icon: "≋", className: "theme-ocean" },
  mountain: { name: "Mountains", description: "Golden light, open air, and new horizons.", icon: "△", className: "theme-mountain" }
};
const journey = document.querySelector("#journey");
const toast = document.querySelector("#toast");
const music = document.querySelector("#music");
let resumeMusicOnReturn = false;
const getMusicSrc = () => {
  const src = CONFIG.music.src || "";
  if (!src) return "";
  return src.includes("?") ? src : `${src}?v=20260804`;
};
music.loop = true;
const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
const button = (label, action) => `<button class="button" data-action="${action}">${label}<span>↗</span></button>`;
const scene = (content, extra = "") => `<section class="screen ${extra}"><div class="section-inner">${content}</div></section>`;
const theme = () => themes[state.theme];
const pageCount = () => pages().length;
const go = (page) => { state.page = Math.max(0, Math.min(pageCount() - 1, page)); render(); window.scrollTo({ top: 0, behavior: "smooth" }); };
const photo = (item, index) => item.src ? `<img src="${esc(item.src)}" alt="${esc(item.caption)}" loading="lazy" onerror="this.style.display='none'; this.parentElement.classList.add('photo-fallback'); this.parentElement.innerHTML += '<div class=\"photo-placeholder\"><span>${["01", "02", "03"][index]}</span><small>photo loaded</small></div>';">` : `<div class="photo-placeholder"><span>${["01", "02", "03"][index]}</span><small>add a photo<br>in config.js</small></div>`;
const birthdayDate = () => { const now = new Date(); let date = new Date(now.getFullYear(), Number(state.birthday.month) - 1, Number(state.birthday.day), 0, 0, 0); if (date < now) date = new Date(now.getFullYear() + 1, Number(state.birthday.month) - 1, Number(state.birthday.day), 0, 0, 0); return date; };
const countdown = () => { const difference = birthdayDate() - new Date(); const days = Math.max(0, Math.floor(difference / 86400000)); const hours = Math.max(0, Math.floor(difference / 3600000) % 24); const minutes = Math.max(0, Math.floor(difference / 60000) % 60); return `${days}d ${hours}h ${minutes}m`; };
const saveSettings = () => localStorage.setItem(STORAGE_KEY, JSON.stringify({ birthday: state.birthday, theme: state.theme }));
const renderSender = () => { document.body.className = theme().className; journey.innerHTML = scene(`<div class="kicker">private sender view</div><h2>Make it<br><em>yours.</em></h2><p class="lede">Set the birthday date before sharing the experience. Their wish stays saved on this device.</p><form id="sender-form" class="sender-form"><label>Recipient name<input name="recipient" value="${esc(CONFIG.recipient)}" disabled></label><label>Birthday month<input name="month" type="number" min="1" max="12" value="${esc(state.birthday.month)}" required></label><label>Birthday day<input name="day" type="number" min="1" max="31" value="${esc(state.birthday.day)}" required></label><button class="button" type="submit">Save birthday setup <span>↗</span></button></form><div class="reply-panel"><div class="kicker">receiver's wish</div>${state.reply ? `<h3>“${esc(state.reply.message)}”</h3><p>Replied on ${esc(state.reply.sentAt)} by ${esc(state.reply.name || CONFIG.recipient)}.</p>` : `<p class="lede">No wish yet. It will appear here after the receiver sends it.</p>`}</div><button class="text-button" type="button" data-action="receiver">Back to receiver view</button>`, "sender-page"); };

function render() {
  if (state.senderMode) { renderSender(); return; }
  document.body.className = theme().className;
  document.documentElement.style.setProperty("--journey", `${((state.page + 1) / 12) * 100}%`);
  document.querySelector("#brand-name").textContent = CONFIG.title;
  document.querySelector("#footer-message").textContent = CONFIG.footer;
  document.querySelector("#progress-label").textContent = `chapter ${state.page + 1} of 12`;
  document.querySelector("#progress-bar").style.width = `${((state.page + 1) / 12) * 100}%`;
  journey.innerHTML = pages()[state.page];
  document.querySelector("#year").textContent = new Date().getFullYear();
  document.querySelector("#sound-toggle").innerHTML = `<span>${state.musicPlaying ? "Ⅱ" : "♪"}</span>`;
  document.querySelectorAll(".section-inner > *").forEach((element, index) => element.style.setProperty("--i", index));
}

function pages() {
  return [
    scene(`<div class="kicker">choose a little atmosphere</div><h1>A birthday world,<br><em>made for you.</em></h1><p class="lede">Pick the feeling you want to step into. You can change it anytime.</p><div class="theme-grid">${Object.entries(themes).map(([key, value]) => `<button class="theme-card ${state.theme === key ? "selected" : ""}" data-theme="${key}"><span class="theme-icon">${value.icon}</span><span><strong>${value.name}</strong><small>${value.description}</small></span><i>↗</i></button>`).join("")}</div>${button("Enter the birthday", "start")}`, "landing"),
    scene(`<div class="kicker">chapter 01 · save the date</div><h2>Something lovely<br><em>is waiting.</em></h2><div class="countdown-box"><strong>${countdown()}</strong><span>until ${esc(CONFIG.recipient)}'s birthday</span></div><p class="lede">Come back on ${esc(new Date(2000, state.birthday.month - 1, state.birthday.day).toLocaleDateString(undefined, { month: "long", day: "numeric" }))} for the full celebration.</p>${button("Continue", "next")}`, "countdown-page"),
    scene(`<div class="kicker">chapter 02 · welcome</div><div class="welcome-art" aria-hidden="true"><span>✦</span><span>♡</span><span>✿</span></div><h1>For the one who makes<br><em>life brighter.</em></h1><p class="lede">Hi, ${esc(CONFIG.recipient)}. There is a small universe of good things waiting for you.</p><p class="hint">A little surprise is waiting just for you.</p>${button("Begin the surprise", "next")}`, "welcome"),
    scene(`<div class="kicker">chapter 02 · something is waiting</div><h2>A present, wrapped<br><em>with intention.</em></h2><p class="lede">Some gifts are best opened slowly.</p><button class="gift" data-action="openGift" aria-label="Open the gift"><span class="gift-lid"></span><span class="gift-bow">✦</span><span class="gift-box"></span><span class="gift-ribbon"></span></button><p class="hint">tap the box</p>`, `gift-page ${state.openedGift ? "gift-open" : ""}`),
    scene(`<div class="kicker">chapter 03 · the big reveal</div><div class="countdown">3</div><p class="kicker">the wait is over</p><h1>Happy<br><em>birthday, ${esc(CONFIG.recipient)}!</em></h1><div class="burst" aria-hidden="true">✦　✧　✦</div><p class="lede">Today, the whole sky is celebrating you.</p>${button("There is more", "next")}`, "reveal"),
    scene(`<div class="kicker">chapter 04 · a few words</div><h2>A letter for<br><em>your pocket.</em></h2><div class="letter-wrap"><button class="envelope ${state.letterOpen ? "opened" : ""}" data-action="openLetter"><span class="seal">✦</span><span class="envelope-flap"></span><span class="letter-paper">${state.letterOpen ? `<strong>${esc(CONFIG.letter.intro)}</strong>${CONFIG.letter.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}<p class="signoff">${esc(CONFIG.letter.signoff).replace(/\n/g, "<br>")}</p>` : ""}</span></button></div><p class="hint">${state.letterOpen ? "a letter, from the heart" : "tap the seal to open"}</p>${state.letterOpen ? button("Keep going", "next") : ""}`, "letter-page"),
    scene(`<div class="kicker">chapter 05 · snapshots</div><h2>Proof that the<br><em>good days happened.</em></h2><div class="album">${CONFIG.photos.map((item, index) => `<figure class="polaroid p${index + 1}">${photo(item, index)}<figcaption>${esc(item.caption)}<small>${esc(item.note)}</small></figcaption></figure>`).join("")}</div><p class="hint">three moments worth keeping</p>${button("Turn the page", "next")}`, "album-page"),
    scene(`<div class="kicker">chapter 06 · memory book</div><h2>The pages I would<br><em>read again.</em></h2><div class="memory-book"><div class="memory-page"><small>${esc(CONFIG.memories[0].date)}</small><h3>${esc(CONFIG.memories[0].title)}</h3><p>${esc(CONFIG.memories[0].body)}</p><blockquote>“${esc(CONFIG.memories[0].quote)}”</blockquote></div><span class="book-spine"></span></div>${button("A few surprises", "next")}`, "memory-page-wrap"),
    scene(`<div class="kicker">chapter 07 · pick one</div><h2>Three tiny<br><em>secrets for you.</em></h2><div class="surprise-grid">${CONFIG.surprises.map((item, index) => `<button class="surprise-card ${state.surprise === index ? "revealed" : ""}" data-surprise="${index}"><span>${item.icon}</span><strong>${state.surprise === index ? esc(item.message) : item.label}</strong><small>${state.surprise === index ? "for you, always" : "open me"}</small></button>`).join("")}</div>${state.surprise !== null ? button("One last chapter", "next") : `<p class="hint">choose the one that calls to you</p>`}`, "surprises-page"),
    scene(`<div class="kicker">chapter 08 · this is why</div><h2>Things I hope you<br><em>never forget.</em></h2><div class="appreciation">${CONFIG.appreciation.map((item, index) => `<p style="--delay:${index * 100}ms"><span>♡</span>${esc(item)}</p>`).join("")}</div><p class="wish">${esc(CONFIG.wish)}</p>${button("Make a wish", "next")}`, "appreciation-page"),
    scene(`<div class="kicker">chapter 09 · make it count</div><h2>One breath.<br><em>One wish.</em></h2><div class="cake"><div class="flames">${[0, 1, 2].map((n) => `<button class="flame ${state.candleCount > n ? "out" : ""}" data-candle="${n}" aria-label="Blow out candle ${n + 1}">✦</button>`).join("")}</div><div class="candles">|||</div><div class="cake-top"></div><div class="cake-body"></div></div><p class="hint">tap each flame to blow it out</p>${state.candleCount >= 3 ? `<p class="success-note">wish sent into the universe ✦</p>${button("The final surprise", "next")}` : ""}`, "cake-page"),
    scene(`<div class="kicker">chapter 11 · before you go</div><h2>I have one tiny<br><em>birthday wish.</em></h2><p class="lede">${esc(CONFIG.giftPrompt)}</p>${state.submitted ? `<div class="final-note"><span>✦</span><h3>You just made my birthday even more special.</h3><p>Thank you for being you, ${esc(CONFIG.recipient)}.</p></div>` : `<form id="gift-form" class="gift-form"><textarea id="gift-input" placeholder="Type your wish here..." aria-label="Your wish" required></textarea><input id="gift-name" type="text" placeholder="Your name" aria-label="Your name" required><button class="button" type="submit">Send my wish <span>↗</span></button></form><p class="hint">Only the sender will see this wish and your name.</p>`}${CONFIG.catGif ? `<div class="final-cat-wrap"><img class="final-cat-gif" src="${esc(CONFIG.catGif)}" alt="cat gif" loading="lazy"></div>` : ""}<p class="signature">with love,<br><strong>${esc(CONFIG.sender)}</strong></p>`, "final-page")
  ];
}

function showToast(message) { toast.textContent = message; toast.classList.add("visible"); setTimeout(() => toast.classList.remove("visible"), 2400); }
function playMusic() { return music.play().then(() => { music.loop = true; music.currentTime = 0; state.musicPlaying = true; render(); }).catch(() => { state.musicPlaying = false; showToast("The song could not be played. Check music.src in config.js"); render(); }); }
function startMusic() { const src = getMusicSrc(); if (src) { music.src = src; music.load(); playMusic(); } else showToast("Add a song in config.js to make this part sing"); if (state.page === 2) { setTimeout(() => go(3), 220); } else { go(3); } }
document.addEventListener("click", (event) => {
  const themeButton = event.target.closest("[data-theme]"); if (themeButton) { state.theme = themeButton.dataset.theme; render(); return; }
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "start") go(1); if (action === "startMusic") startMusic(); if (action === "next") { if (state.page === 2) { startMusic(); return; } go(state.page + 1); } if (action === "receiver") { state.senderMode = false; render(); }
  if (action === "openGift") { state.openedGift = true; render(); setTimeout(() => go(4), 900); }
  if (action === "openLetter") { state.letterOpen = true; render(); }
  const surprise = event.target.closest("[data-surprise]"); if (surprise) { state.surprise = Number(surprise.dataset.surprise); showToast(CONFIG.surprises[state.surprise].message); render(); }
  const candle = event.target.closest("[data-candle]"); if (candle && Number(candle.dataset.candle) === state.candleCount) { state.candleCount += 1; render(); }
});
document.addEventListener("submit", (event) => {
  if (event.target.id === "gift-form") {
    event.preventDefault();
    const message = event.target.querySelector("#gift-input").value.trim();
    const name = event.target.querySelector("#gift-name").value.trim();
    state.reply = { name: name || CONFIG.recipient, message, sentAt: new Date().toLocaleString() };
    localStorage.setItem(REPLY_KEY, JSON.stringify(state.reply));
    state.submitted = true;
    showToast("Your wish has been saved ✦");
    render();
  }
  if (event.target.id === "sender-form") { event.preventDefault(); const form = new FormData(event.target); const month = Number(form.get("month")); const day = Number(form.get("day")); if (month < 1 || month > 12 || day < 1 || day > 31) { showToast("Enter a valid month and day"); return; } state.birthday = { month, day }; saveSettings(); showToast("Birthday setup saved ✦"); render(); }
});
document.querySelector("#sender-toggle").addEventListener("click", () => { state.senderMode = !state.senderMode; render(); });
document.querySelector("#sound-toggle").addEventListener("click", () => { if (!CONFIG.music.src) { showToast("Add a song in config.js first"); return; } if (state.musicPlaying) { music.pause(); state.musicPlaying = false; render(); } else playMusic(); });
music.addEventListener("ended", () => { if (music.loop) { music.currentTime = 0; music.play().catch(() => { state.musicPlaying = false; render(); }); return; } state.musicPlaying = false; render(); });
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    resumeMusicOnReturn = state.musicPlaying;
    if (resumeMusicOnReturn) { music.pause(); state.musicPlaying = false; render(); }
  } else if (resumeMusicOnReturn) {
    resumeMusicOnReturn = false;
    playMusic();
  }
});
if (CONFIG.music.src) { music.src = getMusicSrc(); music.load(); }
setInterval(() => { if (!state.senderMode && state.page === 1) render(); }, 60000);
if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("sw.js"));
render();