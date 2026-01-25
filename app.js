const BASE = "/pwa";

const routes = {
  "/": `${BASE}/views/home.html`,
  "/checking": `${BASE}/views/checking.html`,
  "/transactions": `${BASE}/views/transactions.html`
};

const container = document.getElementById("app");
let currentView = null;
let isTransitioning = false;
let appInitialized = false;

/* ---------------------------------------
   Splash Screen Handler
---------------------------------------- */
function hideSplash() {
  const splash = document.getElementById("splash");
  if (splash) {
    setTimeout(() => {
      splash.style.opacity = "0";
      splash.style.transition = "opacity 0.3s ease";
      setTimeout(() => {
        splash.remove();
      }, 300);
    }, 1200); // Show splash for 1.2 seconds
  }
}

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

    // Hide splash on first load
    if (!appInitialized) {
      hideSplash();
      appInitialized = true;
    }

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
  
  // Get href from either href attribute or data-route attribute
  const path = link.getAttribute("href") || link.getAttribute("data-route");
  if (path) {
    navigate(path);
  }
});

/* ---------------------------------------
   Back Buttons
---------------------------------------- */
document.addEventListener("click", e => {
  if (e.target.closest("[data-back]")) {
    e.preventDefault();
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
