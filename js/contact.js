/**
 * SUNDOWN STUDIO — CONTACT FORM CONTROLLER
 * Manages client-side validation, accessible error announcements, service pills, and submission state.
 */

document.addEventListener('DOMContentLoaded', () => {
    initContactForm();
});

function initContactForm() {
    const form = document.getElementById('sundown-inquiry-form');
    const feedbackCard = document.getElementById('form-feedback-card');
    if (!form) return;

    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const orgInput = document.getElementById('contact-org');
    const messageInput = document.getElementById('contact-message');
    const submitBtn = form.querySelector('button[type="submit"]');

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    function setFieldError(input, errorElementId, errorMessage) {
        input.classList.add('has-error');
        input.setAttribute('aria-invalid', 'true');
        const errEl = document.getElementById(errorElementId);
        if (errEl) {
            errEl.textContent = errorMessage;
            errEl.classList.add('visible');
        }
    }

    function clearFieldError(input, errorElementId) {
        input.classList.remove('has-error');
        input.removeAttribute('aria-invalid');
        const errEl = document.getElementById(errorElementId);
        if (errEl) {
            errEl.textContent = '';
            errEl.classList.remove('visible');
        }
    }

    // Input blur clear listeners
    if (nameInput) nameInput.addEventListener('input', () => clearFieldError(nameInput, 'error-name'));
    if (emailInput) emailInput.addEventListener('input', () => clearFieldError(emailInput, 'error-email'));
    if (messageInput) messageInput.addEventListener('input', () => clearFieldError(messageInput, 'error-message'));

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        let isValid = true;

        // 1. Validate Name
        if (!nameInput.value.trim()) {
            setFieldError(nameInput, 'error-name', 'Please enter your name.');
            isValid = false;
        } else {
            clearFieldError(nameInput, 'error-name');
        }

        // 2. Validate Email
        if (!emailInput.value.trim()) {
            setFieldError(emailInput, 'error-email', 'Please enter your email address.');
            isValid = false;
        } else if (!validateEmail(emailInput.value.trim())) {
            setFieldError(emailInput, 'error-email', 'Please enter a valid email address.');
            isValid = false;
        } else {
            clearFieldError(emailInput, 'error-email');
        }

        // 3. Validate Message
        if (!messageInput.value.trim()) {
            setFieldError(messageInput, 'error-message', 'Please provide a brief description of your project.');
            isValid = false;
        } else if (messageInput.value.trim().length < 10) {
            setFieldError(messageInput, 'error-message', 'Please enter at least 10 characters.');
            isValid = false;
        } else {
            clearFieldError(messageInput, 'error-message');
        }

        if (!isValid) {
            // Focus on first invalid input
            const firstInvalid = form.querySelector('.has-error');
            if (firstInvalid) firstInvalid.focus();
            return;
        }

        // Selected Services & Budget
        const selectedServices = Array.from(form.querySelectorAll('input[name="services"]:checked')).map(cb => cb.value);
        const selectedBudget = form.querySelector('input[name="budget"]:checked')?.value || 'Not specified';

        // Prepare submission state
        if (submitBtn) {
            submitBtn.disabled = true;
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = `<span>Transmitting Inquiry...</span>`;

            setTimeout(() => {
                form.style.display = 'none';
                if (feedbackCard) {
                    feedbackCard.classList.add('visible');
                    feedbackCard.focus();
                }
            }, 800);
        }
    });
}
