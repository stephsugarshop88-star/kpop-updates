const dailyEl = document.getElementById("daily");
const weeklyEl = document.getElementById("weekly");
const trendingGrid = document.getElementById("trendingGrid");
const latestGrid = document.getElementById("latestGrid");
const weeklyGrid = document.getElementById("weeklyGrid");
const tabs = document.querySelectorAll(".tab");
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const todayChip = document.getElementById("todayChip");

let DATA = { daily: [], weekly: [] };

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getGroup(item) {
  return item.group || item.artist || (item.id || "K-POP").split("-")[0].toUpperCase();
}

function cardTemplate(item, index = 0) {
  const sources = item.sources || [];
  return `
    <article class="card" style="animation-delay:${Math.min(index * 70, 420)}ms">
      <div class="card-image-wrap">
        <img class="card-image"
             src="${escapeHtml(item.image)}"
             alt="${escapeHtml(item.title)}"
             loading="lazy"
             onerror="this.style.display='none'"/>
        <span class="group-pill">🎤 ${escapeHtml(getGroup(item))}</span>
      </div>
      <div class="card-body">
        <div class="card-meta">✦ ${escapeHtml(item.badge || "K-Pop Update")} <span>•</span> ${escapeHtml(item.time || sources[0]?.time || "Today")}</div>
        <h3 class="card-title">${escapeHtml(item.title)}</h3>
        <p class="card-desc">${escapeHtml(item.description || "")}</p>
        <div class="sources">
          ${sources.length ? sources.map(s => `
            <a class="source-link" href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">
              <span>${escapeHtml(s.title || "Read source")} <span class="source-site">· ${escapeHtml(s.site || "Source")}</span></span>
              <span class="source-arrow">↗</span>
            </a>
          `).join("") : `<div class="empty">No source links added yet.</div>`}
        </div>
      </div>
    </article>
  `;
}

function renderGrid(element, items) {
  if (!items.length) {
    element.innerHTML = `<div class="empty">No updates here yet — add one in <b>data.json</b> ♡</div>`;
    return;
  }
  element.innerHTML = items.map((item, i) => cardTemplate(item, i)).join("");
}

function render() {
  const daily = DATA.daily || [];
  const weekly = DATA.weekly || [];

  // First daily item(s) act as the trending row; remaining items become latest.
  const trending = daily.slice(0, Math.min(3, daily.length));
  const latest = daily.slice(Math.min(3, daily.length));

  renderGrid(trendingGrid, trending);
  renderGrid(latestGrid, latest);
  renderGrid(weeklyGrid, weekly);
}

function setupTabs() {
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const mode = tab.dataset.mode;
      dailyEl.classList.toggle("hidden", mode !== "daily");
      weeklyEl.classList.toggle("hidden", mode !== "weekly");
      window.scrollTo({ top: document.querySelector(".tabs").offsetTop - 85, behavior: "smooth" });
    });
  });
}

function setupTheme() {
  const saved = localStorage.getItem("newsly-theme");
  if (saved === "dark") document.body.classList.add("dark");
  updateThemeIcon();

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("newsly-theme", document.body.classList.contains("dark") ? "dark" : "light");
    updateThemeIcon();
  });
}

function updateThemeIcon() {
  themeIcon.textContent = document.body.classList.contains("dark") ? "☀" : "☾";
}

function setupDate() {
  const now = new Date();
  const text = now.toLocaleDateString(undefined, { month: "short", day: "numeric" }).toUpperCase();
  todayChip.textContent = `✦ ${text}`;
}

async function loadData() {
  try {
    const response = await fetch("./data.json");
    if (!response.ok) throw new Error("Could not load data.json");
    DATA = await response.json();
    render();
  } catch (error) {
    trendingGrid.innerHTML = `<div class="empty"><b>Couldn't load the updates.</b><br>Please make sure <code>data.json</code> is in the same folder and the site is being served through GitHub Pages.</div>`;
    latestGrid.innerHTML = "";
    weeklyGrid.innerHTML = "";
    console.error(error);
  }
}

setupTabs();
setupTheme();
setupDate();
loadData();
