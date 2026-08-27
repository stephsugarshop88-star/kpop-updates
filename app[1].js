const dailyEl = document.getElementById("daily");
const weeklyEl = document.getElementById("weekly");
const tabs = document.querySelectorAll(".tab");

let DATA = null;

function escapeHtml(str) {
  return String(str).replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function cardTemplate(item){
  return `
    <article class="card">
      <div class="card-top">
        <img class="thumb" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}"/>
        <div class="card-title">
          <h2>${escapeHtml(item.title)}</h2>
          <div class="badge"><span class="dot"></span> ${escapeHtml(item.badge || "Update")}</div>
        </div>
      </div>
      <div class="card-desc">${escapeHtml(item.description || "")}</div>

      <div class="sources">
        ${(item.sources || []).map(s => `
          <div class="source-item">
            <a href="${escapeHtml(s.url)}" target="_blank" rel="noreferrer">
              ${escapeHtml(s.title)}
            </a>
            <div class="source-meta">
              <span class="small-pill">${escapeHtml(s.site)}</span>
              <span>•</span>
              <span>${escapeHtml(s.time || "")}</span>
            </div>
          </div>
        `).join("")}
      </div>
    </article>
  `;
}

function render(){
  dailyEl.innerHTML = (DATA.daily || []).map(cardTemplate).join("");
  weeklyEl.innerHTML = (DATA.weekly || []).map(cardTemplate).join("");
}

async function loadData(){
  const res = await fetch("./data.json");
  DATA = await res.json();
  render();
}

function setupTabs(){
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const mode = tab.dataset.mode;
      if(mode === "daily"){
        dailyEl.classList.remove("hidden");
        weeklyEl.classList.add("hidden");
      } else {
        weeklyEl.classList.remove("hidden");
        dailyEl.classList.add("hidden");
      }
    });
  });
}

setupTabs();
loadData();
