/**
 * SUNDOWN STUDIO — CUSTOM CURSOR & MAGNETIC BUTTON SYSTEM
 * High-performance lerp cursor with contextual states and magnetic interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
    initCustomCursor();
    initMagneticElements();
});

function initCustomCursor() {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    let cursorDot = document.getElementById('custom-cursor');
    let cursorRing = document.getElementById('cursor-ring');

    if (!cursorDot) {
        cursorDot = document.createElement('div');
        cursorDot.id = 'custom-cursor';
        document.body.appendChild(cursorDot);
    }

    if (!cursorRing) {
        cursorRing = document.createElement('div');
        cursorRing.id = 'cursor-ring';
        cursorRing.innerHTML = '<span id="cursor-label">VIEW</span>';
        document.body.appendChild(cursorRing);
    }

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let isMoving = false;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (!isMoving) {
            document.body.classList.add('cursor-active');
            isMoving = true;
            renderCursor();
        }

        // Direct dot movement
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
    }, { passive: true });

    function renderCursor() {
        // Smooth lerp for outer ring
        ringX += (mouseX - ringX) * 0.18;
        ringY += (mouseY - ringY) * 0.18;

        cursorRing.style.left = `${ringX}px`;
        cursorRing.style.top = `${ringY}px`;

        requestAnimationFrame(renderCursor);
    }

    // Interactive Hover States
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, label, [data-cursor]');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            const cursorType = el.getAttribute('data-cursor');
            if (cursorType === 'view') {
                document.body.classList.add('cursor-view');
            } else {
                document.body.classList.add('cursor-hover');
            }
        });

        el.addEventListener('mouseleave', () => {
            document.body.classList.remove('cursor-hover', 'cursor-view');
        });
    });

    document.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-active', 'cursor-hover', 'cursor-view');
        isMoving = false;
    });
}

/**
 * Magnetic button interaction
 */
function initMagneticElements() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const magneticElements = document.querySelectorAll('.btn-pill, .btn-accent, .nav-item, .mobile-menu-btn');
    
    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            el.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
            el.style.transition = 'transform 0.4s var(--ease-out-expo)';
            setTimeout(() => {
                el.style.transition = '';
            }, 400);
        });
    });
}
