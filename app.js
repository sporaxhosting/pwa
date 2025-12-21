const routes = {
  "/": "/views/home.html",
  "/checking": "/views/checking.html",
  "/transactions": "/views/transactions.html"
};

const container = document.getElementById("app");
let currentView = null;

/* Load view */
async function loadView(path, direction = "forward") {
  const res = await fetch(routes[path] || routes["/"]);
  const html = await res.text();

  const view = document.createElement("div");
  view.innerHTML = html;
  const page = view.firstElementChild;

  if (currentView) {
    currentView.classList.add("exit-left");
    setTimeout(() => currentView.remove(), 350);
  }

  page.classList.add("active");
  container.appendChild(page);
  currentView = page;
}

/* Navigate */
function navigate(path) {
  history.pushState({}, "", path);
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

/* Back buttons */
document.addEventListener("click", e => {
  if (e.target.closest("[data-back]")) {
    history.back();
  }
});

/* Popstate */
window.addEventListener("popstate", () => {
  loadView(location.pathname, "back");
});

/* iOS swipe back gesture */
let startX = 0;
document.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
});

document.addEventListener("touchend", e => {
  const deltaX = e.changedTouches[0].clientX - startX;
  if (deltaX > 120) history.back();
});

/* Orientation lock */
if (screen.orientation?.lock) {
  screen.orientation.lock("portrait").catch(() => {});
}

/* Initial load */
loadView(location.pathname);
