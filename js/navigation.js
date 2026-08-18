/**
 * SUNDOWN STUDIO — LIQUID GLASS NAVBAR CONTROLLER
 * Production liquid glassmorphism, responsive capsule states,
 * dynamic scroll sheen reaction, and authentic brand preservation.
 */

document.addEventListener('DOMContentLoaded', () => {
    initLiquidNavbar();
    initScrollReaction();
    highlightActiveRoute();
});

function initLiquidNavbar() {
    const header = document.getElementById('header');
    const toggleBtn = document.querySelector('.liquid-mobile-toggle');
    const mobileLinks = document.querySelectorAll('.liquid-mobile-link');

    if (!header || !toggleBtn) return;

    let isOpen = false;
    let lastToggle = 0;

    const toggle = (e) => {
        const now = Date.now();
        if (now - lastToggle < 300) return;
        lastToggle = now;
        if (e.type === 'touchend') e.preventDefault();

        isOpen = !isOpen;
        if (isOpen) {
            header.classList.add('open');
            toggleBtn.setAttribute('aria-expanded', 'true');
        } else {
            header.classList.remove('open');
            toggleBtn.setAttribute('aria-expanded', 'false');
        }
    };

    toggleBtn.addEventListener('click', toggle);
    toggleBtn.addEventListener('touchend', toggle, { passive: false });

    // Close when clicking any mobile link
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (isOpen) {
                isOpen = false;
                header.classList.remove('open');
                toggleBtn.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // Close when clicking outside header
    document.addEventListener('click', (e) => {
        if (isOpen && !header.contains(e.target)) {
            isOpen = false;
            header.classList.remove('open');
            toggleBtn.setAttribute('aria-expanded', 'false');
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen) {
            isOpen = false;
            header.classList.remove('open');
            toggleBtn.setAttribute('aria-expanded', 'false');
            toggleBtn.focus();
        }
    });
}

function initScrollReaction() {
    const header = document.getElementById('header');
    if (!header) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 30) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

function highlightActiveRoute() {
    const pathname = window.location.pathname.toLowerCase();
    const navItems = document.querySelectorAll('.liquid-nav-item, .liquid-mobile-link, .nav-item, .mobile-nav-link');

    navItems.forEach(item => {
        const page = item.getAttribute('data-nav-page');
        let isActive = false;

        if (page === 'home' && (pathname.endsWith('index.html') || pathname === '/' || pathname.endsWith('/mohanwe/') || pathname.endsWith('/mohanwe'))) {
            isActive = true;
        } else if (page && (pathname.includes('/' + page) || pathname.includes(page + '.html'))) {
            isActive = true;
        }

        if (isActive) {
            item.classList.add('active');
            item.setAttribute('aria-current', 'page');
        } else {
            item.classList.remove('active');
            item.removeAttribute('aria-current');
        }
    });
}
