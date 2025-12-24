/* ======================================================
   BankFlow SPA Router – iOS PWA SAFE
   ====================================================== */

const BASE = "/pwa";

const routes = {
  "/": `${BASE}/views/home.html`,
  "/checking": `${BASE}/views/checking.html`,
  "/transactions": `${BASE}/views/transactions.html`
};

const container = document.getElementById("app");
let currentView = null;
let isNavigating = false;

/* ---------------------------------------
   Path Resolver
---------------------------------------- */
function getCurrentPath() {
  if (location.hash) {
    return location.hash.replace("#", "");
  }

  let path = location.pathname;
  if (path.startsWith(BASE)) {
    path = path.slice(BASE.length);
  }

  return path === "" ? "/" : path;
}

/* ---------------------------------------
   View Loader (guarded)
---------------------------------------- */
async function loadView(path) {
  if (isNavigating) return;
  isNavigating = true;

  const viewPath = routes[path] || routes["/"];

  try {
    const res = await fetch(viewPath);
    if (!res.ok) throw new Error("Fetch failed");

    const html = await res.text();
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;

    const nextView = wrapper.firstElementChild;
    if (!nextView) throw new Error("Invalid view");

    if (currentView) {
      currentView.classList.add("exit-left");
      setTimeout(() => currentView.remove(), 250);
    }

    nextView.classList.add("view");
    container.appendChild(nextView);

    requestAnimationFrame(() => {
      nextView.classList.add("active");
    });

    currentView = nextView;

  } catch (err) {
    console.error(err);
    container.innerHTML = `
      <div style="padding:20px;font-family:sans-serif">
        Failed to load app view.
      </div>
    `;
  } finally {
    setTimeout(() => {
      isNavigating = false;
    }, 350);
  }
}

/* ---------------------------------------
   Navigation (NO loadView here)
---------------------------------------- */
function navigate(path) {
  if (getCurrentPath() === path) return;
  history.pushState({}, "", BASE + path);
}

/* ---------------------------------------
   Link Interception
---------------------------------------- */
document.addEventListener("click", e => {
  const link = e.target.closest("[data-link]");
  if (!link) return;

  e.preventDefault();
  navigate(link.getAttribute("href"));
});

/* ---------------------------------------
   Back Buttons
---------------------------------------- */
document.addEventListener("click", e => {
  if (e.target.closest("[data-back]")) {
    history.back();
  }
});

/* ---------------------------------------
   History Listener (ONLY loader)
---------------------------------------- */
window.addEventListener("popstate", () => {
  loadView(getCurrentPath());
});

/* ---------------------------------------
   Initial Boot
---------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  loadView(getCurrentPath());
});
