/**
 * SUNDOWN STUDIO — MAIN CONTROLLER & INTERACTION ENGINE
 * - Iconic 3-word animated intro loader with instant tap-to-dismiss
 * - Instant touch response & zero click lag
 * - Iconic 3-tab interactive showcase (Design / Project / Execution)
 */

document.addEventListener('DOMContentLoaded', () => {
    initSundownIntroLoader();
    initScrollHeader();
    initSundownTabShowcase();
});

/**
 * Iconic Sundown Intro Loader
 * Sequence: ENVIRONMENTS -> EXPERIENCES -> CONTENT -> Slide UP
 */
function initSundownIntroLoader() {
    const loader = document.getElementById('loader');
    if (!loader) return;

    // Dismiss loader immediately and remove from DOM
    function dismissLoader() {
        loader.classList.add('loaded');
        loader.style.pointerEvents = 'none';
        loader.style.display = 'none';
        if (loader.parentNode) {
            loader.parentNode.removeChild(loader);
        }
    }

    // Tap/Click anywhere to dismiss intro instantly
    loader.addEventListener('click', dismissLoader);
    loader.addEventListener('touchstart', dismissLoader, { passive: true });

    // Automatic dismissal after the 3-word sequence finishes (~2.2s)
    setTimeout(dismissLoader, 2200);
}

/**
 * Header Scroll State with Fast Response
 */
function initScrollHeader() {
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

/**
 * Iconic Sundown 3-Tab Interactive Showcase
 * "Design / Project / Execution"
 */
function initSundownTabShowcase() {
    const tabButtons = document.querySelectorAll('.sundown-tab-button');
    const tabDesc = document.getElementById('tab-description-text');
    const tabImg = document.getElementById('tab-display-image');

    if (!tabButtons.length || !tabDesc || !tabImg) return;

    const tabData = {
        design: {
            title: "Design",
            desc: "Our team blends physical architectural discipline with boundary-pushing digital craft. We work with clients to design bespoke spaces, flagships, and spatial narratives that make lasting emotional impressions.",
            image: "assets/images/hero-orange-glasses.jpg"
        },
        project: {
            title: "Project",
            desc: "Once a concept is crafted, we engineer and manage every phase of execution. From precision 3D CAD modeling and structural safety to on-site logistical coordination, we ensure seamless realization.",
            image: "assets/images/project-perfect-heat.jpg"
        },
        execution: {
            title: "Execution",
            desc: "We build directly in our workshops and on-site with master fabricators, electricians, and digital technicians. Every tactile fixture, lighting array, and structural surface is refined to perfection.",
            image: "assets/images/project-solar-eclipse.jpg"
        }
    };

    tabButtons.forEach(btn => {
        const switchTab = (e) => {
            e.preventDefault();
            const tabKey = btn.getAttribute('data-tab');
            if (!tabKey || !tabData[tabKey]) return;

            // Update active button state
            tabButtons.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');

            // Fade and update content
            tabDesc.style.opacity = '0';
            tabImg.style.opacity = '0';
            tabImg.style.transform = 'scale(0.96)';

            setTimeout(() => {
                tabDesc.textContent = tabData[tabKey].desc;
                tabImg.src = tabData[tabKey].image;
                tabImg.alt = `Sundown Studio ${tabData[tabKey].title} Showcase`;

                tabDesc.style.opacity = '1';
                tabImg.style.opacity = '1';
                tabImg.style.transform = 'scale(1)';
            }, 120);
        };

        btn.addEventListener('click', switchTab);
        btn.addEventListener('touchstart', switchTab, { passive: false });
    });
}
