/**
 * SUNDOWN STUDIO — LIQUID GLASS NAVBAR CONTROLLER
 * Production liquid glassmorphism, responsive capsule states,
 * dynamic scroll sheen reaction, and authentic brand preservation.
 */

const navigationScriptUrl = document.currentScript?.src;

document.addEventListener('DOMContentLoaded', () => {
    addAuthNavigationLinks();
    initLiquidNavbar();
    initScrollReaction();
    highlightActiveRoute();
    initializeSiteAuth();
});

function initializeSiteAuth() {
    if (!navigationScriptUrl) return;

    import(new URL('./site-auth.js', navigationScriptUrl).href)
        .then(module => module.initializeSiteAuth())
        .catch(error => console.error('Could not initialize account navigation.', error));
}

function addAuthNavigationLinks() {
    const desktopNav = document.querySelector('.liquid-nav-links');
    const mobileNav = document.querySelector('.liquid-mobile-nav');
    if (!navigationScriptUrl) return;

    const authUrl = new URL('../auth.html', navigationScriptUrl).href;
    const addLink = (nav, className) => {
        if (!nav || nav.querySelector('[data-nav-page="auth"]')) return;

        const link = document.createElement('a');
        link.href = authUrl;
        link.className = className;
        link.dataset.navPage = 'auth';
        link.classList.add('liquid-auth-link');
        link.innerHTML = `<svg class="liquid-auth-google-mark" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.7c3.9-3.6 6-8.8 6-15z"/>
            <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.7-5.1c-1.8 1.2-4 1.9-6.8 1.9-5.2 0-9.6-3.5-11.2-8.2H5.9v5.3A20 20 0 0 0 24 44z"/>
            <path fill="#FBBC05" d="M12.8 27.7a12 12 0 0 1 0-7.4V15H5.9a20 20 0 0 0 0 18z"/>
            <path fill="#EA4335" d="M24 12.1c3 0 5.7 1 7.8 3.1l5.9-5.9A19.7 19.7 0 0 0 24 4 20 20 0 0 0 5.9 15l6.9 5.3c1.6-4.7 6-8.2 11.2-8.2z"/>
        </svg><span>Sign in</span>`;
        nav.appendChild(link);
    };

    addLink(desktopNav, 'liquid-nav-item');
    addLink(mobileNav, 'liquid-mobile-link');
}

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
        } else if (page === 'auth' && pathname.endsWith('/auth.html')) {
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
