const BASE = "/pwa";

const routes = {
  "/": `${BASE}/views/home.html`,
  "/checking": `${BASE}/views/checking.html`,
  "/transactions": `${BASE}/views/transactions.html`
};

const container = document.getElementById("app");
let currentView = null;

/* Normalize path */
function normalizePath(path) {
  if (path.startsWith(BASE)) {
    path = path.slice(BASE.length);
  }
  return path === "" ? "/" : path;
}

/* Load view safely */
async function loadView(rawPath) {
  const path = normalizePath(rawPath);
  const viewPath = routes[path] || routes["/"];

  try {
    const res = await fetch(viewPath);
    if (!res.ok) throw new Error("Fetch failed");

    const html = await res.text();
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;

    const view = wrapper.firstElementChild;
    if (!view) throw new Error("Invalid view");

    if (currentView) {
      currentView.classList.remove("active");
      currentView.remove();
    }

    view.classList.add("active");
    container.appendChild(view);
    currentView = view;

  } catch (err) {
    console.error("View load error:", err);
    container.innerHTML = `
      <div style="padding:20px;font-family:sans-serif">
        Failed to load app view.
      </div>
    `;
  }
}

/* Navigation */
function navigate(path) {
  history.pushState({}, "", BASE + path);
  navigator.vibrate?.(10);
  loadView(path);
}

/* Link interception */
document.addEventListener("click", e => {
  const link = e.target.closest("[data-link]");
  if (!link) return;
  e.preventDefault();
  navigate(link.getAttribute("href"));
});

/* Back */
window.addEventListener("popstate", () => {
  loadView(location.pathname);
});

/* Initial boot (CRITICAL) */
document.addEventListener("DOMContentLoaded", () => {
  loadView(location.pathname);
});
