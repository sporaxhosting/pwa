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

// Pull to Refresh logic (LESS SENSITIVE)
let startY = 0;
let pullStartTime = 0;
const app = document.querySelector('.app');

app.addEventListener('touchstart', e => { 
    if (app.scrollTop === 0) {
        startY = e.touches[0].clientY;
        pullStartTime = Date.now();
    }
});

app.addEventListener('touchmove', e => {
    const delta = e.touches[0].clientY - startY;
    const timeElapsed = Date.now() - pullStartTime;
    
    // Only trigger if pulled significantly AND slowly (not during normal scroll)
    if (delta > 100 && app.scrollTop === 0 && timeElapsed > 100) {
        e.preventDefault();
        hapticMedium();
        // Trigger your refresh logic here
        console.log("Pull to refresh triggered");
    }
}, { passive: false });
