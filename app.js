const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const STORAGE_KEY = "yawarKnowledgeCenterV1";
const starterResources = [
  {id:"loops",title:"Understanding loops in C++",category:"Programming",icon:"⌘",description:"A beginner-friendly reminder of for, while, and do-while loops, with a simple practice approach.",body:"Loops repeat a block of code while a condition or count allows it. A for loop is useful when the number of repetitions is known. A while loop checks its condition before each repetition. A do-while loop runs at least once. Dry-run tip: write down the variable values after every iteration."},
  {id:"problem-solving",title:"A problem-solving checklist",category:"Study",icon:"✓",description:"Break a difficult question into smaller steps before writing the solution.",body:"1. Restate the problem in your own words. 2. Identify inputs and expected outputs. 3. Work through a small example by hand. 4. Write the steps in plain language or pseudocode. 5. Implement one part at a time. 6. Test normal cases and edge cases. 7. Explain why your solution works."},
  {id:"ai-basics",title:"AI project foundations",category:"AI",icon:"✧",description:"Learn the pieces of an AI-enabled application and keep API credentials secure.",body:"A typical AI application has a frontend, a backend, and a model/API provider. The frontend collects user input. A backend validates requests and keeps secret API keys out of public browser code. The model generates a response, which the backend returns to the frontend. Always check provider pricing and usage limits before connecting a service."}
];
let state = loadState();
let activeCategory = "All";
let selectedDocumentText = "";
let selectedDocumentName = "";

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      theme: saved.theme || "light",
      accent: saved.accent || "#6657e8",
      notes: Array.isArray(saved.notes) ? saved.notes : [],
      bookmarks: Array.isArray(saved.bookmarks) ? saved.bookmarks : [],
      chat: Array.isArray(saved.chat) ? saved.chat : []
    };
  } catch {
    return {theme:"light",accent:"#6657e8",notes:[],bookmarks:[],chat:[]};
  }
}
function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch { toast("Browser storage is full. Export your data or remove old items."); }
}
function toast(message) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("show"), 2600);
}
function applyAppearance() {
  document.body.classList.toggle("dark", state.theme === "dark");
  document.documentElement.style.setProperty("--accent", state.accent);
  const hex = state.accent.replace("#","");
  const rgb = [0,2,4].map(i => parseInt(hex.slice(i,i+2),16)).join(",");
  document.documentElement.style.setProperty("--accent-rgb", rgb);
  $("#themeBtn").textContent = state.theme === "dark" ? "☀" : "☾";
  $$(".swatch").forEach(s => s.classList.toggle("active", s.dataset.color === state.accent));
}
function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  persist(); applyAppearance();
  toast(`${state.theme === "dark" ? "Dark" : "Light"} mode enabled`);
}
function navigate(view) {
  const names = {dashboard:"Dashboard",knowledge:"Knowledge library",notes:"My notes",bookmarks:"Bookmarks",assistant:"AI assistant",documents:"Documents",settings:"Settings"};
  $$(".view").forEach(v => v.classList.add("hidden"));
  $(`#${view}View`)?.classList.remove("hidden");
  $$(".nav-item[data-view]").forEach(b => b.classList.toggle("active", b.dataset.view === view));
  $("#crumb").textContent = names[view] || "Dashboard";
  $("#sidebar").classList.remove("open");
  if (view === "notes") renderNotes();
  if (view === "knowledge") renderResources();
  if (view === "bookmarks") renderBookmarks();
  if (view === "dashboard") updateStats();
}
function resourceCard(item) {
  const saved = state.bookmarks.includes(item.id);
  return `<article class="resource-card">
    <div class="resource-top"><div class="resource-icon">${escapeHTML(item.icon || "▤")}</div><button class="bookmark-btn ${saved ? "saved" : ""}" data-bookmark="${escapeHTML(item.id)}" title="${saved ? "Remove bookmark" : "Bookmark"}">${saved ? "★" : "☆"}</button></div>
    <span class="category">${escapeHTML(item.category)}</span><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.description || item.body || "")}</p>
    <div class="resource-footer"><span>Knowledge resource</span><button class="open-resource" data-open-resource="${escapeHTML(item.id)}">Read resource →</button></div>
  </article>`;
}
function getAllResources() {
  return [...starterResources, ...state.notes.map(n => ({id:`note-${n.id}`,title:n.title,category:"My notes",icon:"✎",description:n.body,body:n.body}))];
}
function renderResources() {
  const term = ($("#librarySearch")?.value || "").trim().toLowerCase();
  const resources = getAllResources().filter(r => (activeCategory === "All" || r.category === activeCategory) && `${r.title} ${r.category} ${r.description || ""} ${r.body || ""}`.toLowerCase().includes(term));
  $("#resourceGrid").innerHTML = resources.length ? resources.map(resourceCard).join("") : `<p class="empty-state">No matching resources. Try a different search or category.</p>`;
}
function renderBookmarks() {
  const resources = getAllResources().filter(r => state.bookmarks.includes(r.id));
  $("#bookmarkGrid").innerHTML = resources.map(resourceCard).join("");
  $("#emptyBookmarks").classList.toggle("hidden", resources.length > 0);
}
function updateStats() {
  $("#statKnowledge").textContent = getAllResources().length;
  $("#statNotes").textContent = state.notes.length;
  $("#statBookmarks").textContent = state.bookmarks.length;
}
function renderNotes() {
  $("#notesCountLabel").textContent = `${state.notes.length} ${state.notes.length === 1 ? "note" : "notes"}`;
  $("#noteList").innerHTML = state.notes.length ? state.notes.map(n => `<article class="note-item"><h3>${escapeHTML(n.title)}</h3><p>${escapeHTML(n.body)}</p><footer><span>${new Date(n.updatedAt).toLocaleString()}</span><button class="danger-link" data-delete-note="${escapeHTML(n.id)}">Delete</button></footer></article>`).join("") : `<p class="empty-state">No notes yet. Write your first idea above.</p>`;
  updateStats();
}
function saveNote(title, body) {
  title = title.trim(); body = body.trim();
  if (!title || !body) { toast("Add both a title and some note text first."); return false; }
  const existing = state.notes.find(n => n.id === $("#saveNoteBtn").dataset.editing);
  if (existing) {
    existing.title = title; existing.body = body; existing.updatedAt = Date.now();
    delete $("#saveNoteBtn").dataset.editing;
  } else {
    state.notes.unshift({id:`n${Date.now()}${Math.random().toString(36).slice(2,6)}`,title,body,updatedAt:Date.now()});
  }
  persist(); $("#noteTitle").value = ""; $("#noteBody").value = "";
  renderNotes(); renderResources(); renderBookmarks(); toast("Note saved on this device."); return true;
}
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function toggleBookmark(id) {
  if (state.bookmarks.includes(id)) state.bookmarks = state.bookmarks.filter(x => x !== id);
  else state.bookmarks.push(id);
  persist(); renderResources(); renderBookmarks(); updateStats();
  toast(state.bookmarks.includes(id) ? "Added to bookmarks." : "Removed from bookmarks.");
}
function readResource(id) {
  const item = getAllResources().find(r => r.id === id);
  if (!item) return;
  const content = item.body || item.description || "No additional content.";
  const modal = document.createElement("div");
  modal.className = "resource-modal";
  modal.innerHTML = `<div class="resource-modal-backdrop" data-close-modal></div><section class="resource-modal-card" role="dialog" aria-modal="true" aria-label="${escapeHTML(item.title)}"><button class="resource-modal-close" data-close-modal aria-label="Close">×</button><span class="category">${escapeHTML(item.category)}</span><h2>${escapeHTML(item.title)}</h2><p>${escapeHTML(content)}</p><button class="primary-btn" data-modal-bookmark="${escapeHTML(item.id)}">${state.bookmarks.includes(item.id) ? "★ Bookmarked" : "☆ Add bookmark"}</button></section>`;
  document.body.appendChild(modal);
}
function appendChat(text, role) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${role === "user" ? "user-message" : "assistant-message"}`;
  wrapper.innerHTML = `${role === "assistant" ? '<div class="mini-avatar">✧</div>' : ""}<div class="bubble"><p>${escapeHTML(text)}</p></div>`;
  $("#chatMessages").appendChild(wrapper);
  $("#chatMessages").scrollTop = $("#chatMessages").scrollHeight;
}
function demoReply(message) {
  const m = message.toLowerCase();
  if (m.includes("loop") || m.includes("c++") || m.includes("program")) return "Start by identifying the input, expected output, and repetition rule. For loops, dry-run each iteration in a small table: variable value, condition, and output. This is a local demo response, not a live AI answer.";
  if (m.includes("study") || m.includes("exam") || m.includes("revise")) return "Try a short study cycle: choose one topic, review the definition, solve a worked example, then answer 3–5 questions without looking. Finish by writing down mistakes to revisit tomorrow. Adjust the plan to your actual syllabus and time.";
  if (m.includes("organize") || m.includes("note")) return "Use one note per concept. Give it a clear title, add a small example, and write down common mistakes. Bookmark important resources so you can find them quickly. You can save notes from the My notes section.";
  if (m.includes("project") || m.includes("api") || m.includes("ai")) return "A small software project can be divided into interface, data/storage, and optional backend/model integration. Build and test the interface first. Keep API secrets on a backend—not in public JavaScript—and check a provider's current free-tier limits.";
  return "Thanks for your question! This is the local demo chat, so it cannot generate a true AI answer yet. You can still test the interface, and your chat history is saved in this browser. To get real AI responses, connect an AI model through a secure backend.";
}
function sendChat(message) {
  const text = message.trim(); if (!text) return;
  state.chat.push({role:"user",text,at:Date.now()});
  appendChat(text,"user");
  const reply = demoReply(text);
  state.chat.push({role:"assistant",text:reply,at:Date.now()});
  appendChat(reply,"assistant"); persist();
}
function renderChatHistory() {
  if (!state.chat.length) return;
  $("#chatMessages").innerHTML = "";
  state.chat.forEach(m => appendChat(m.text,m.role));
}
function exportData() {
  const blob = new Blob([JSON.stringify({exportedAt:new Date().toISOString(),...state},null,2)],{type:"application/json"});
  const url = URL.createObjectURL(blob); const a = document.createElement("a");
  a.href=url; a.download="yawar-knowledge-center-data.json"; a.click(); URL.revokeObjectURL(url);
  toast("Export file created.");
}

document.addEventListener("click", e => {
  const nav = e.target.closest("[data-view]"); if (nav) navigate(nav.dataset.view);
  const go = e.target.closest("[data-go]"); if (go) navigate(go.dataset.go);
  const bookmark = e.target.closest("[data-bookmark]"); if (bookmark) toggleBookmark(bookmark.dataset.bookmark);
  const open = e.target.closest("[data-open-resource]"); if (open) readResource(open.dataset.openResource);
  const del = e.target.closest("[data-delete-note]"); if (del) {
    if (confirm("Delete this note?")) {
      const id = del.dataset.deleteNote;
      state.notes = state.notes.filter(n => n.id !== id);
      state.bookmarks = state.bookmarks.filter(b => b !== `note-${id}`);
      persist(); renderNotes(); renderResources(); renderBookmarks(); toast("Note deleted.");
    }
  }
  const category = e.target.closest("[data-category]"); if (category) {
    activeCategory = category.dataset.category;
    $$(".filter-chip").forEach(b => b.classList.toggle("selected", b === category));
    renderResources();
  }
  const prompt = e.target.closest("[data-prompt]"); if (prompt) {
    navigate("assistant"); $("#chatInput").value = prompt.dataset.prompt; $("#chatInput").focus();
  }
  const close = e.target.closest("[data-close-modal]"); if (close) close.closest(".resource-modal")?.remove();
  const modalBookmark = e.target.closest("[data-modal-bookmark]"); if (modalBookmark) {
    toggleBookmark(modalBookmark.dataset.modalBookmark);
    modalBookmark.closest(".resource-modal")?.remove();
    readResource(modalBookmark.dataset.modalBookmark);
  }
  const swatch = e.target.closest("[data-color]"); if (swatch) {
    state.accent = swatch.dataset.color; persist(); applyAppearance(); toast("Accent color updated.");
  }
});
$("#themeBtn").addEventListener("click", toggleTheme);
$("#settingsThemeBtn").addEventListener("click", toggleTheme);
$("#menuBtn").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
$("#newNoteBtn").addEventListener("click", () => { navigate("notes"); $("#noteTitle").focus(); });
$("#quickAddBtn").addEventListener("click", () => { navigate("notes"); $("#noteTitle").focus(); });
$("#notesAddBtn").addEventListener("click", () => { $("#noteTitle").focus(); window.scrollTo({top:0,behavior:"smooth"}); });
$("#saveNoteBtn").addEventListener("click", () => saveNote($("#noteTitle").value,$("#noteBody").value));
$("#librarySearch").addEventListener("input", renderResources);
$("#chatForm").addEventListener("submit", e => {
  e.preventDefault(); const input = $("#chatInput"); const text = input.value;
  if (!text.trim()) return; input.value = ""; sendChat(text);
});
$("#clearChatBtn").addEventListener("click", () => {
  state.chat = []; persist();
  $("#chatMessages").innerHTML = `<div class="message assistant-message"><div class="mini-avatar">✧</div><div class="bubble"><strong>Chat cleared.</strong><p>Ask a question to try the local demo assistant.</p></div></div>`;
});
$("#documentInput").addEventListener("change", async e => {
  const file = e.target.files?.[0]; if (!file) return;
  if (file.size > 2 * 1024 * 1024) { toast("Please choose a file smaller than 2 MB."); e.target.value = ""; return; }
  selectedDocumentName = file.name;
  selectedDocumentText = await file.text();
  $("#fileName").textContent = `${file.name} · ${file.size.toLocaleString()} bytes`;
  $("#documentTitle").textContent = file.name;
  $("#documentText").textContent = selectedDocumentText;
  $("#documentPreview").classList.remove("hidden");
  toast("Document read locally in your browser.");
});
$("#saveDocumentNote").addEventListener("click", () => {
  if (!selectedDocumentText) return;
  navigate("notes");
  $("#noteTitle").value = selectedDocumentName;
  $("#noteBody").value = selectedDocumentText.slice(0,100000);
  toast("Document text is ready to save as a note.");
});
$("#exportBtn").addEventListener("click", exportData);
$$("[data-go]").forEach(b => b.addEventListener("keydown", e => { if (e.key === "Enter") navigate(b.dataset.go); }));
applyAppearance();
renderResources();
renderNotes();
renderBookmarks();
renderChatHistory();
updateStats();
