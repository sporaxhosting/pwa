// Haptic Feedback
function hapticLight() { if (navigator.vibrate) navigator.vibrate(10); }
function hapticMedium() { if (navigator.vibrate) navigator.vibrate([20, 30, 20]); }

// Native Navigation Interceptor
document.querySelectorAll('a[href]').forEach(link => {
    if (!link.href.includes('#')) {
        link.addEventListener('click', e => {
            e.preventDefault();
            hapticLight();
            const target = link.getAttribute('href');
            document.querySelector('.app').classList.add('page-exit');
            setTimeout(() => { window.location.href = target; }, 220);
        });
    }
});

// Pull to Refresh logic (Simplified)
let startY = 0;
const app = document.querySelector('.app');
app.addEventListener('touchstart', e => { startY = e.touches[0].clientY; });
app.addEventListener('touchmove', e => {
    const delta = e.touches[0].clientY - startY;
    if (delta > 60 && app.scrollTop === 0) {
        hapticMedium();
        // Trigger your refresh logic here
    }
});
