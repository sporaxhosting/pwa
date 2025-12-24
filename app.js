const BASE = "/pwa";

const routes = {
  "/": `${BASE}/views/home.html`,
  "/checking": `${BASE}/views/checking.html`,
  "/transactions": `${BASE}/views/transactions.html`
};

const container = document.getElementById("app");
let currentView = null;
let isTransitioning = false;

/* ---------------------------------------
   Path Resolver
---------------------------------------- */
function getCurrentPath() {
  let path = location.pathname;

  if (path.startsWith(BASE)) {
    path = path.slice(BASE.length);
  }

  return path === "" ? "/" : path;
}

/* ---------------------------------------
   View Loader (SAFE)
---------------------------------------- */
async function loadView(path) {
  if (isTransitioning) return;
  isTransitioning = true;

  const viewPath = routes[path] || routes["/"];

  try {
    const res = await fetch(viewPath, { cache: "no-store" });
    if (!res.ok) throw new Error("Fetch failed");

    const html = await res.text();
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;

    const nextView = wrapper.firstElementChild;
    if (!nextView) throw new Error("Invalid view");

    nextView.classList.add("view");
    container.appendChild(nextView);

    // Force layout before activating
    nextView.getBoundingClientRect();

    nextView.classList.add("active");

    if (currentView) {
      currentView.classList.add("exit-left");

      currentView.addEventListener(
        "transitionend",
        () => currentView.remove(),
        { once: true }
      );
    }

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
      isTransitioning = false;
    }, 400);
  }
}

/* ---------------------------------------
   Navigation
---------------------------------------- */
function navigate(path) {
  if (getCurrentPath() === path) return;
  history.pushState({}, "", BASE + path);
  loadView(path);
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
   Browser Back / Forward
---------------------------------------- */
window.addEventListener("popstate", () => {
  loadView(getCurrentPath());
});

/* ---------------------------------------
   Initial Load
---------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  loadView(getCurrentPath());
});
