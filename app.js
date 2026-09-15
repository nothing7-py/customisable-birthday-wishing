const STORAGE_KEY = "birthday-surprise-settings";
const REPLY_KEY = "birthday-surprise-reply";
const readStorage = (key, fallback = null) => {
  try {
    if (typeof window === "undefined" || !window.localStorage) return fallback;
    const stored = window.localStorage.getItem(key);
    return stored === null ? fallback : JSON.parse(stored) ?? fallback;
  } catch (error) {
    if (typeof window !== "undefined") window.localStorage.removeItem(key);
    return fallback;
  }
};
const savedSettings = readStorage(STORAGE_KEY, {});
const savedReplies = readStorage(REPLY_KEY, []);
const themes = {
  cherry: { name: "Cherry blossom", description: "A dreamy garden of petals and paper lanterns.", icon: "✿", className: "theme-cherry" },
  forest: { name: "Forest", description: "A quiet woodland with fireflies in the dusk.", icon: "⌁", className: "theme-forest" },
  night: { name: "Night sky", description: "A sky full of stars, just waiting for a wish.", icon: "☾", className: "theme-night" },
  ocean: { name: "Ocean", description: "A little blue world where everything moves gently.", icon: "≋", className: "theme-ocean" },
  mountain: { name: "Mountains", description: "Golden light, open air, and new horizons.", icon: "△", className: "theme-mountain" }
};
const normalizeReplies = (value) => Array.isArray(value) ? value : value ? [value] : [];
const normalizeBirthday = (value, fallback = CONFIG.birthday) => {
  const month = Number(value?.month ?? fallback.month);
  const day = Number(value?.day ?? fallback.day);
  return {
    month: Number.isInteger(month) && month >= 1 && month <= 12 ? month : Number(fallback.month),
    day: Number.isInteger(day) && day >= 1 && day <= 31 ? day : Number(fallback.day)
  };
};
const normalizeRecipient = (value, fallback = CONFIG.recipient) => {
  const nextValue = String(value ?? fallback).trim();
  return nextValue || fallback;
};
const normalizeTheme = (value, fallback = CONFIG.theme) => Object.prototype.hasOwnProperty.call(themes, String(value ?? "").trim()) ? String(value).trim() : fallback;
const resolveProfile = (searchString = window.location.search, savedProfile = savedSettings, defaultProfile = { recipient: CONFIG.recipient, birthday: CONFIG.birthday, theme: CONFIG.theme }) => {
  const params = new URLSearchParams(searchString || "");
  const sharedSecret = params.get("share");
  if (sharedSecret) {
    const decoded = globalThis.ProfileUtils?.decodeProfileShare ? globalThis.ProfileUtils.decodeProfileShare(sharedSecret) : null;
    if (decoded) {
      return {
        recipient: normalizeRecipient(decoded.recipient, defaultProfile.recipient),
        birthday: normalizeBirthday({ month: decoded.month, day: decoded.day }, defaultProfile.birthday),
        theme: normalizeTheme(decoded.theme, defaultProfile.theme)
      };
    }
  }

  const hasSharedProfile = params.has("recipient") || params.has("month") || params.has("day") || params.has("theme");

  if (hasSharedProfile) {
    return {
      recipient: normalizeRecipient(params.get("recipient"), defaultProfile.recipient),
      birthday: normalizeBirthday({ month: params.get("month"), day: params.get("day") }, defaultProfile.birthday),
      theme: normalizeTheme(params.get("theme"), defaultProfile.theme)
    };
  }

  if (savedProfile && (savedProfile.recipient || savedProfile.birthday)) {
    return {
      recipient: normalizeRecipient(savedProfile.recipient, defaultProfile.recipient),
      birthday: normalizeBirthday(savedProfile.birthday, defaultProfile.birthday),
      theme: normalizeTheme(savedProfile.theme, defaultProfile.theme)
    };
  }

  return {
    recipient: normalizeRecipient(defaultProfile.recipient),
    birthday: normalizeBirthday(defaultProfile.birthday, defaultProfile.birthday),
    theme: normalizeTheme(defaultProfile.theme, defaultProfile.theme)
  };
};
const sharedProfile = (() => {
  const params = new URLSearchParams(window.location.search);
  const hasShared = params.has("share") || params.has("recipient") || params.has("month") || params.has("day") || params.has("theme");
  return hasShared ? resolveProfile(window.location.search, null, { recipient: CONFIG.recipient, birthday: CONFIG.birthday, theme: CONFIG.theme }) : null;
})();
const initialProfile = sharedProfile || resolveProfile(window.location.search, savedSettings, { recipient: CONFIG.recipient, birthday: CONFIG.birthday, theme: CONFIG.theme });
const state = { page: 0, theme: initialProfile.theme, musicPlaying: false, candleCount: 0, surprise: null, openedGift: false, letterOpen: false, senderMode: false, recipient: initialProfile.recipient, birthday: initialProfile.birthday, replies: normalizeReplies(savedReplies) };
const journey = document.querySelector("#journey");
const toast = document.querySelector("#toast");
const music = document.querySelector("#music");
let resumeMusicOnReturn = false;
const getMusicSrc = () => {
  const src = CONFIG.music.src || "";
  if (!src) return "";
  return src.includes("?") ? src : `${src}?v=20260824`;
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
const saveSettings = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ recipient: normalizeRecipient(state.recipient), birthday: normalizeBirthday(state.birthday), theme: state.theme })); } catch (error) { /* Sharing works even when storage is unavailable. */ } };
if (sharedProfile) saveSettings();
const applySenderProfile = (recipient, month, day) => {
  const nextRecipient = normalizeRecipient(recipient);
  const nextMonth = Number(month);
  const nextDay = Number(day);

  state.recipient = nextRecipient;
  state.birthday = normalizeBirthday({ month: nextMonth, day: nextDay });
  saveSettings();
};
const saveReplies = () => localStorage.setItem(REPLY_KEY, JSON.stringify(state.replies));
const replyCards = () => state.replies.length ? state.replies.slice().reverse().map((reply, index) => `<article class="reply-card"><span class="reply-number">${state.replies.length - index}</span><h3>“${esc(reply.message)}”</h3>${reply.feedback ? `<p class="reply-feedback">“${esc(reply.feedback)}”</p>` : ""}<p>Replied on ${esc(reply.sentAt)} by ${esc(reply.name || state.recipient)}${reply.rating ? ` · Rated ${esc(reply.rating)}/10` : ""}.</p></article>`).join("") : `<p class="lede">No replies yet. They will appear here after the receiver sends them.</p>`;
const receiverLink = () => {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  const shareValue = window.ProfileUtils?.encodeProfileShare ? window.ProfileUtils.encodeProfileShare({ recipient: state.recipient, month: state.birthday.month, day: state.birthday.day, theme: state.theme }) : encodeURIComponent(JSON.stringify({ recipient: state.recipient, month: state.birthday.month, day: state.birthday.day, theme: state.theme }));
  url.searchParams.set("share", shareValue);
  return url.toString();
};
const copyReceiverLink = async () => { const link = receiverLink(); try { await navigator.clipboard.writeText(link); showToast("Receiver link copied ✦"); } catch (error) { window.prompt("Copy this receiver link:", link); } };
const renderSender = () => { document.body.className = theme().className; journey.innerHTML = scene(`<div class="kicker">private sender view</div><h2>Keep their<br><em>replies safe.</em></h2><p class="lede">Set the receiver name and birthday date once. The same details are used by every theme and saved in this browser.</p><form id="sender-form" class="sender-form"><label>Receiver name<input name="recipient" value="${esc(state.recipient)}" required></label><label>Birthday month<input name="month" type="number" min="1" max="12" value="${esc(state.birthday.month)}" required></label><label>Birthday day<input name="day" type="number" min="1" max="31" value="${esc(state.birthday.day)}" required></label><button class="button" type="submit">Save birthday setup <span>↗</span></button></form><div class="share-panel"><strong>Send this link to the receiver</strong><p>It contains the private profile in a hidden share code, so the page does not reveal the birthday details in the URL.</p><button class="button" type="button" data-action="copy-link">Copy receiver link <span>↗</span></button></div><div class="reply-panel"><div class="kicker">receiver replies · ${state.replies.length}</div>${replyCards()}</div><button class="text-button" type="button" data-action="receiver">Back to receiver view</button>`, "sender-page"); };

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
    scene(`<div class="kicker">chapter 01 · save the date</div><h2>Something lovely<br><em>is waiting.</em></h2><div class="countdown-box"><div class="confetti" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><strong>${countdown()}</strong><span>until ${esc(state.recipient)}'s birthday</span></div><p class="lede">Come back on ${esc(new Date(2000, state.birthday.month - 1, state.birthday.day).toLocaleDateString(undefined, { month: "long", day: "numeric" }))} for the full celebration.</p>${button("Continue", "next")}`, "countdown-page"),
    scene(`<div class="kicker">chapter 02 · welcome</div><div class="welcome-art" aria-hidden="true"><span>✦</span><span>♡</span><span>✿</span></div><h1>For the one who makes<br><em>life brighter.</em></h1><p class="lede">Hi, ${esc(state.recipient)}. There is a small universe of good things waiting for you.</p><p class="hint">A little surprise is waiting just for you.</p>${button("Begin the surprise", "next")}`, "welcome"),
    scene(`<div class="kicker">chapter 02 · something is waiting</div><h2>A present, wrapped<br><em>with intention.</em></h2><p class="lede">Some gifts are best opened slowly.</p><button class="gift" data-action="openGift" aria-label="Open the gift"><span class="gift-lid"></span><span class="gift-bow">✦</span><span class="gift-box"></span><span class="gift-ribbon"></span></button><p class="hint">tap the box</p>`, `gift-page ${state.openedGift ? "gift-open" : ""}`),
    scene(`<div class="kicker">chapter 03 · the big reveal</div><div class="countdown">3</div><p class="kicker">the wait is over</p><h1>Happy<br><em>birthday, ${esc(state.recipient)}!</em></h1><div class="burst" aria-hidden="true">✦　✧　✦</div><p class="lede">Today, the whole sky is celebrating you.</p>${button("There is more", "next")}`, "reveal"),
    scene(`<div class="kicker">chapter 04 · a few words</div><h2>A letter for<br><em>your pocket.</em></h2><div class="letter-wrap"><button class="envelope ${state.letterOpen ? "opened" : ""}" data-action="openLetter"><span class="seal">✦</span><span class="envelope-flap"></span><span class="letter-paper">${state.letterOpen ? `<strong>${esc(CONFIG.letter.intro)}</strong>${CONFIG.letter.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}<p class="signoff">${esc(CONFIG.letter.signoff).replace(/\n/g, "<br>")}</p>` : ""}</span></button></div><p class="hint">${state.letterOpen ? "a letter, from the heart" : "tap the seal to open"}</p>${state.letterOpen ? button("Keep going", "next") : ""}`, "letter-page"),
    scene(`<div class="kicker">chapter 05 · snapshots</div><h2>Proof that the<br><em>good days happened.</em></h2><div class="album">${CONFIG.photos.map((item, index) => `<figure class="polaroid p${index + 1}">${photo(item, index)}<figcaption>${esc(item.caption)}<small>${esc(item.note)}</small></figcaption></figure>`).join("")}</div><p class="hint">three moments worth keeping</p>${button("Turn the page", "next")}`, "album-page"),
    scene(`<div class="kicker">chapter 06 · memory book</div><h2>The pages I would<br><em>read again.</em></h2><div class="memory-book"><div class="memory-page"><small>${esc(CONFIG.memories[0].date)}</small><h3>${esc(CONFIG.memories[0].title)}</h3><p>${esc(CONFIG.memories[0].body)}</p><blockquote>“${esc(CONFIG.memories[0].quote)}”</blockquote></div><span class="book-spine"></span></div>${button("A few surprises", "next")}`, "memory-page-wrap"),
    scene(`<div class="kicker">chapter 07 · pick one</div><h2>Three tiny<br><em>secrets for you.</em></h2><div class="surprise-grid">${CONFIG.surprises.map((item, index) => `<button class="surprise-card ${state.surprise === index ? "revealed" : ""}" data-surprise="${index}"><span>${item.icon}</span><strong>${state.surprise === index ? esc(item.message) : item.label}</strong><small>${state.surprise === index ? "for you, always" : "open me"}</small></button>`).join("")}</div>${state.surprise !== null ? button("One last chapter", "next") : `<p class="hint">choose the one that calls to you</p>`}`, "surprises-page"),
    scene(`<div class="kicker">chapter 08 · this is why</div><h2>Things I hope you<br><em>never forget.</em></h2><div class="appreciation">${CONFIG.appreciation.map((item, index) => `<p style="--delay:${index * 100}ms"><span>♡</span>${esc(item)}</p>`).join("")}</div><p class="wish">${esc(CONFIG.wish)}</p>${button("Make a wish", "next")}`, "appreciation-page"),
    scene(`<div class="kicker">chapter 09 · make it count</div><h2>One breath.<br><em>One wish.</em></h2><div class="cake"><div class="flames">${[0, 1, 2].map((n) => `<button class="flame ${state.candleCount > n ? "out" : ""}" data-candle="${n}" aria-label="Blow out candle ${n + 1}">✦</button>`).join("")}</div><div class="candles">|||</div><div class="cake-top"></div><div class="cake-body"></div></div><p class="hint">tap each flame to blow it out</p>${state.candleCount >= 3 ? `<p class="success-note">wish sent into the universe ✦</p>${button("The final surprise", "next")}` : ""}`, "cake-page"),
    scene(`<div class="kicker">chapter 10 · before you go</div><h2>I have one tiny<br><em>birthday wish.</em></h2><p class="lede">${esc(CONFIG.giftPrompt)}</p>${state.replies.length ? `<p class="reply-count">${state.replies.length} ${state.replies.length === 1 ? "reply" : "replies"} saved so far. You can send another anytime.</p>` : ""}<form id="gift-form" class="gift-form"><div class="form-section wish-section"><span class="form-section-mark">✦</span><label for="gift-input">Your birthday wish</label><textarea id="gift-input" placeholder="Type your wish here..." aria-label="Your birthday wish" required></textarea></div><label for="gift-name">Your name</label><input id="gift-name" type="text" placeholder="Your name" aria-label="Your name" required><div class="form-section rating-section"><span class="form-section-mark">10</span><label for="gift-rating">How would you rate this little world?</label><div class="gift-rating-row"><div class="rating-field"><input id="gift-rating" type="number" min="1" max="10" step="1" placeholder="8" aria-label="Rate the site out of 10" required><span>/ 10</span></div></div></div><button class="button" type="submit">Send my reply <span>↗</span></button></form><p class="hint">Every reply is saved and visible in the sender view.</p>${CONFIG.catGif ? `<div class="final-cat-wrap"><img class="final-cat-gif" src="${esc(CONFIG.catGif)}" alt="cat gif" loading="lazy"></div>` : ""}<p class="signature">with love,<br><strong>${esc(CONFIG.sender)}</strong></p>`, "final-page")
  ];
}

function showToast(message) { toast.textContent = message; toast.classList.add("visible"); setTimeout(() => toast.classList.remove("visible"), 2400); }
function playMusic() { return music.play().then(() => { music.loop = true; music.currentTime = 0; state.musicPlaying = true; render(); }).catch(() => { state.musicPlaying = false; showToast("The song could not be played. Check music.src in config.js"); render(); }); }
function startMusic() { const src = getMusicSrc(); if (src) { music.src = src; music.load(); playMusic(); } else showToast("Add a song in config.js to make this part sing"); if (state.page === 2) { setTimeout(() => go(3), 220); } else { go(3); } }
document.addEventListener("click", (event) => {
  const themeButton = event.target.closest("[data-theme]"); if (themeButton) { state.theme = themeButton.dataset.theme; saveSettings(); render(); return; }
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "start") go(1); if (action === "startMusic") startMusic(); if (action === "next") { if (state.page === 2) { startMusic(); return; } go(state.page + 1); } if (action === "receiver") { state.senderMode = false; render(); } if (action === "copy-link") copyReceiverLink();
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
    const ratingField = event.target.querySelector("#gift-rating");
    const ratingValue = Number(ratingField?.value);

    if (!message) { showToast("Write your birthday wish first"); return; }
    if (!name) { showToast("Add your name before sending"); return; }
    if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 10) { showToast("Rate the site from 1 to 10"); return; }

    state.replies.push({ name: name || state.recipient, message, rating: ratingValue, sentAt: new Date().toLocaleString() });
    saveReplies();
    showToast(`Reply ${state.replies.length} has been saved ✦`);
    render();
  }
  if (event.target.id === "sender-form") { event.preventDefault(); const form = new FormData(event.target); const recipient = String(form.get("recipient") || "").trim(); const month = Number(form.get("month")); const day = Number(form.get("day")); if (!recipient) { showToast("Enter the receiver's name"); return; } if (month < 1 || month > 12 || day < 1 || day > 31) { showToast("Enter a valid month and day"); return; } applySenderProfile(recipient, month, day); showToast("Birthday setup saved ✦"); render(); }
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