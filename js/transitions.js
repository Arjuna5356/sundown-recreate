/**
 * SUNDOWN STUDIO — GLOBAL PAGE TRANSITIONS
 * Seamless, cinematic page reveals using GSAP.
 */

document.addEventListener('DOMContentLoaded', () => {
    initPageTransitions();
});

function initPageTransitions() {
    let curtain = document.getElementById('page-transition-curtain');
    if (!curtain) {
        curtain = document.createElement('div');
        curtain.id = 'page-transition-curtain';
        document.body.appendChild(curtain);
    }

    // Entrance Animation on Page Load
    if (typeof gsap !== 'undefined') {
        gsap.set(curtain, { yPercent: 0 });
        gsap.to(curtain, {
            yPercent: -100,
            duration: 0.7,
            ease: "power3.inOut",
            delay: 0.1
        });
    }

    // Intercept internal page links
    const internalLinks = document.querySelectorAll('a[href]');
    internalLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            // Skip anchor jumps, external URLs, mailto, tel, or target="_blank"
            if (!href || 
                href.startsWith('#') || 
                href.startsWith('http://') || 
                href.startsWith('https://') || 
                href.startsWith('mailto:') || 
                href.startsWith('tel:') || 
                link.getAttribute('target') === '_blank' || 
                e.metaKey || e.ctrlKey || e.shiftKey) {
                return;
            }

            e.preventDefault();

            if (typeof gsap !== 'undefined') {
                gsap.set(curtain, { yPercent: 100 });
                gsap.to(curtain, {
                    yPercent: 0,
                    duration: 0.55,
                    ease: "power3.inOut",
                    onComplete: () => {
                        window.location.href = href;
                    }
                });
            } else {
                window.location.href = href;
            }
        });
    });
}
