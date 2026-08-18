/**
 * SUNDOWN STUDIO — WORK ARCHIVE INTERACTIVE ENHANCEMENT
 * - Debounced click+touchstart to prevent double-trigger
 * - Instant filter switching and view mode toggle
 * - Floating cursor-follow image preview (desktop only)
 */

document.addEventListener('DOMContentLoaded', () => {
    initWorkFilterEnhancement();
    initWorkCursorPreview();
});

function initWorkFilterEnhancement() {
    const gridContainer = document.getElementById('work-grid-container');
    const listContainer = document.getElementById('work-list-container');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const viewButtons = document.querySelectorAll('.view-btn');

    if (!gridContainer && !listContainer) return;

    // ── Filter Buttons ─────────────────────────────────────────────
    filterButtons.forEach(btn => {
        let lastTime = 0;

        const handleFilter = (e) => {
            const now = Date.now();
            if (now - lastTime < 300) return;
            lastTime = now;
            if (e.type === 'touchend') e.preventDefault();

            filterButtons.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');

            const filter = btn.getAttribute('data-filter') || 'all';

            if (gridContainer) {
                const cards = gridContainer.querySelectorAll('.project-grid-card');
                cards.forEach(card => {
                    const cat = card.getAttribute('data-category');
                    const visible = filter === 'all' || cat === filter;
                    card.style.display = visible ? 'flex' : 'none';
                    card.style.opacity = visible ? '1' : '0';
                });
            }

            if (listContainer) {
                const rows = listContainer.querySelectorAll('.project-list-row');
                rows.forEach(row => {
                    const cat = row.getAttribute('data-category');
                    const visible = filter === 'all' || cat === filter;
                    row.style.display = visible ? 'flex' : 'none';
                });
            }
        };

        btn.addEventListener('click', handleFilter);
        btn.addEventListener('touchend', handleFilter, { passive: false });
    });

    // ── View Mode Buttons (Grid / List) ────────────────────────────
    viewButtons.forEach(btn => {
        let lastTime = 0;

        const handleView = (e) => {
            const now = Date.now();
            if (now - lastTime < 300) return;
            lastTime = now;
            if (e.type === 'touchend') e.preventDefault();

            viewButtons.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');

            const view = btn.getAttribute('data-view') || 'grid';
            if (view === 'grid') {
                if (gridContainer) gridContainer.style.display = 'grid';
                if (listContainer) listContainer.style.display = 'none';
            } else {
                if (gridContainer) gridContainer.style.display = 'none';
                if (listContainer) listContainer.style.display = 'flex';
            }
        };

        btn.addEventListener('click', handleView);
        btn.addEventListener('touchend', handleView, { passive: false });
    });
}

function initWorkCursorPreview() {
    // Only for pointer (mouse) devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const floatingPreview = document.getElementById('floating-project-preview');
    if (!floatingPreview) return;

    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;
    let rafId = null;
    let isHovering = false;

    const lerp = (a, b, t) => a + (b - a) * t;

    const animate = () => {
        currentX = lerp(currentX, targetX, 0.15);
        currentY = lerp(currentY, targetY, 0.15);
        floatingPreview.style.left = `${currentX}px`;
        floatingPreview.style.top = `${currentY}px`;
        if (isHovering) {
            rafId = requestAnimationFrame(animate);
        }
    };

    document.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
    }, { passive: true });

    const rows = document.querySelectorAll('[data-preview-image]');
    rows.forEach(row => {
        row.addEventListener('mouseenter', () => {
            const img = row.getAttribute('data-preview-image');
            if (img) {
                floatingPreview.style.backgroundImage = `url('${img}')`;
                floatingPreview.classList.add('active');
                isHovering = true;
                cancelAnimationFrame(rafId);
                rafId = requestAnimationFrame(animate);
            }
        });

        row.addEventListener('mouseleave', () => {
            floatingPreview.classList.remove('active');
            isHovering = false;
        });
    });
}
