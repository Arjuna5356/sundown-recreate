/**
 * SUNDOWN STUDIO — ANIMATIONS & INTERACTIVE MOTION
 * - IntersectionObserver scroll-reveal (no GSAP dependency, zero render blocking)
 * - Marquee scroll-speed parallax
 * - Video autoplay safety guard
 * - Floating cursor preview
 * - FAQ Accordion
 * - Parallax image drift on scroll
 */

document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initVideoAutoplayGuard();
    initFaqAccordion();
    initParallaxImages();
});

/* ─────────────────────────────────────────────────────────────────────────
   1. SCROLL REVEAL — IntersectionObserver (zero blocking, no GSAP needed)
   ───────────────────────────────────────────────────────────────────────── */
function initScrollReveal() {
    // Inject the reveal CSS once
    if (!document.getElementById('scroll-reveal-style')) {
        const style = document.createElement('style');
        style.id = 'scroll-reveal-style';
        style.textContent = `
            .sr {
                opacity: 0;
                transform: translateY(32px);
                transition: opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1),
                            transform 0.75s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .sr.sr-left  { transform: translateX(-32px); }
            .sr.sr-scale { transform: scale(0.95) translateY(16px); }
            .sr.visible  { opacity: 1; transform: none; }
        `;
        document.head.appendChild(style);
    }

    // Assign reveal class to key elements
    const selectors = [
        '.studio-hero-title',
        '.work-hero-headline',
        '.services-hero-title',
        '.contact-hero-title',
        '.case-study-title',
        '.section-badge',
        '.section-header-row',
        '.capability-card',
        '.philosophy-card',
        '.methodology-item',
        '.process-step-card',
        '.pillar-row',
        '.faq-item',
        '.client-quote-card',
        '.project-grid-card',
        '.gallery-item',
        '.case-meta-item',
        '.case-gallery-img',
        '.contact-info-block',
        '.capability-item',
        '.sundown-tabs-section',
        '.home-studio-preview',
        '.footer-brand',
    ];

    selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach((el, i) => {
            el.classList.add('sr');
            // Stagger delay for grid children
            if (i < 12) el.style.transitionDelay = `${i * 0.07}s`;
        });
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Fire once
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.sr').forEach(el => observer.observe(el));
}

/* ─────────────────────────────────────────────────────────────────────────
   2. VIDEO AUTOPLAY SAFETY GUARD
   ───────────────────────────────────────────────────────────────────────── */
function initVideoAutoplayGuard() {
    try {
        document.querySelectorAll('video').forEach(video => {
            video.muted = true;
            video.playsInline = true;
            const p = video.play();
            if (p) p.catch(() => {});
        });
    } catch (_) {}
}

/* ─────────────────────────────────────────────────────────────────────────
   3. FAQ ACCORDION — Services page
   ───────────────────────────────────────────────────────────────────────── */
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    if (!faqItems.length) return;

    faqItems.forEach(item => {
        const btn = item.querySelector('.faq-question-btn');
        const answer = item.querySelector('.faq-answer');
        if (!btn || !answer) return;

        let lastTime = 0;
        const toggle = (e) => {
            const now = Date.now();
            if (now - lastTime < 250) return;
            lastTime = now;
            if (e.type === 'touchend') e.preventDefault();

            const isOpen = item.classList.contains('open');

            // Close all others
            faqItems.forEach(other => {
                if (other !== item) {
                    other.classList.remove('open');
                    other.querySelector('.faq-answer').style.maxHeight = '0px';
                    other.querySelector('.faq-question-btn').setAttribute('aria-expanded', 'false');
                }
            });

            // Toggle current
            if (isOpen) {
                item.classList.remove('open');
                answer.style.maxHeight = '0px';
                btn.setAttribute('aria-expanded', 'false');
            } else {
                item.classList.add('open');
                answer.style.maxHeight = answer.scrollHeight + 'px';
                btn.setAttribute('aria-expanded', 'true');
            }
        };

        btn.addEventListener('click', toggle);
        btn.addEventListener('touchend', toggle, { passive: false });
    });
}

/* ─────────────────────────────────────────────────────────────────────────
   4. PARALLAX IMAGE DRIFT ON SCROLL
   ───────────────────────────────────────────────────────────────────────── */
function initParallaxImages() {
    // Skip on touch/mobile to preserve performance
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const imgs = document.querySelectorAll('.parallax-img');
    if (!imgs.length) return;

    let ticking = false;

    const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            imgs.forEach(img => {
                const wrapper = img.closest('.parallax-image-wrapper');
                if (!wrapper) return;
                const rect = wrapper.getBoundingClientRect();
                const vh = window.innerHeight;
                // Only parallax when in view
                if (rect.bottom < 0 || rect.top > vh) { ticking = false; return; }
                const progress = (vh - rect.top) / (vh + rect.height);
                const shift = (progress - 0.5) * 50; // ±25px range
                img.style.transform = `translateY(${shift}px)`;
            });
            ticking = false;
        });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Fire once on load
}
