import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import { isFirebaseConfigured } from './firebase-config.js';
import { getFirebaseServices, saveUserProfile } from './user-profile.js';

const AUTH_CSS_URL = new URL('../css/auth.css', import.meta.url).href;

function ensureAuthStyles() {
    if (document.querySelector(`link[href="${AUTH_CSS_URL}"]`)) return;
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = AUTH_CSS_URL;
    document.head.appendChild(stylesheet);
}

function createProfileDialog() {
    const dialog = document.createElement('div');
    dialog.className = 'auth-dialog-backdrop';
    dialog.hidden = true;
    dialog.innerHTML = `
        <section class="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-dialog-title">
            <button class="auth-dialog-close" type="button" aria-label="Close profile">×</button>
            <img class="auth-dialog-photo" alt="" hidden>
            <span class="section-badge">SUNDOWN STUDIO</span>
            <h2 id="auth-dialog-title">Your account</h2>
            <p class="auth-dialog-name"></p>
            <p class="auth-dialog-email"></p>
            <p class="auth-dialog-status" role="status" aria-live="polite"></p>
            <button class="auth-sign-out-button" type="button">Sign out</button>
        </section>`;
    document.body.appendChild(dialog);
    return dialog;
}

function showProfileDialog(dialog, user, status) {
    const photo = dialog.querySelector('.auth-dialog-photo');
    const name = dialog.querySelector('.auth-dialog-name');
    const email = dialog.querySelector('.auth-dialog-email');
    const statusText = dialog.querySelector('.auth-dialog-status');

    name.textContent = user.displayName || 'Signed-in user';
    email.textContent = user.email || '';
    if (user.photoURL) {
        photo.src = user.photoURL;
        photo.hidden = false;
    } else {
        photo.hidden = true;
        photo.removeAttribute('src');
    }
    statusText.textContent = status.message;
    statusText.classList.toggle('is-error', status.status === 'error');
    dialog.hidden = false;
    dialog.querySelector('.auth-dialog-close').focus();
}

function readProfileResult() {
    const result = sessionStorage.getItem('sundown-auth-profile');
    if (!result) return null;
    sessionStorage.removeItem('sundown-auth-profile');
    try {
        return JSON.parse(result);
    } catch (error) {
        console.error('Could not read the sign-in profile status.', error);
        return null;
    }
}

export function initializeSiteAuth() {
    if (!isFirebaseConfigured) return;

    ensureAuthStyles();
    const { auth, db } = getFirebaseServices();
    const dialog = createProfileDialog();
    const desktopLink = document.querySelector('.liquid-nav-links .liquid-auth-link');
    const mobileLink = document.querySelector('.liquid-mobile-nav .liquid-auth-link');
    const signOutButton = dialog.querySelector('.auth-sign-out-button');
    const closeButton = dialog.querySelector('.auth-dialog-close');
    let currentUser = null;

    const closeDialog = () => {
        dialog.hidden = true;
    };

    [desktopLink, mobileLink].filter(Boolean).forEach(link => {
        link.addEventListener('click', event => {
            if (!currentUser) return;
            event.preventDefault();
            showProfileDialog(dialog, currentUser, {
                status: 'saved',
                message: 'Your account is signed in.'
            });
        });
    });

    closeButton.addEventListener('click', closeDialog);
    dialog.addEventListener('click', event => {
        if (event.target === dialog) closeDialog();
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !dialog.hidden) closeDialog();
    });

    signOutButton.addEventListener('click', async () => {
        signOutButton.disabled = true;
        try {
            await signOut(auth);
            closeDialog();
        } catch (error) {
            const statusText = dialog.querySelector('.auth-dialog-status');
            statusText.textContent = `Sign-out failed: ${error.message}`;
            statusText.classList.add('is-error');
        } finally {
            signOutButton.disabled = false;
        }
    });

    const showWelcome = new URLSearchParams(window.location.search).has('welcome');
    if (showWelcome) {
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete('welcome');
        window.history.replaceState({}, '', cleanUrl);
    }
    let redirectProfileResult = showWelcome ? readProfileResult() : null;

    onAuthStateChanged(auth, async user => {
        currentUser = user;
        [desktopLink, mobileLink].filter(Boolean).forEach(link => {
            const label = link.querySelector('span');
            if (label) label.textContent = user ? 'Account' : 'Sign in';
            link.setAttribute('aria-label', user ? 'Open account profile' : 'Sign in with Google');
        });

        if (!user) return;

        if (showWelcome && !dialog.hidden) return;

        if (showWelcome) {
            const initialStatus = redirectProfileResult || {
                status: 'saving',
                message: 'Signed in. Saving your profile…'
            };
            showProfileDialog(dialog, user, initialStatus);
            if (initialStatus.status === 'error') {
                redirectProfileResult = null;
                return;
            }
        }

        if (!redirectProfileResult || redirectProfileResult.status !== 'error') {
            try {
                await saveUserProfile(user, db);
                if (showWelcome) {
                    showProfileDialog(dialog, user, {
                        status: 'saved',
                        message: 'Your profile is saved to your account.'
                    });
                }
            } catch (error) {
                console.error('Could not save the Firebase user profile.', error);
                if (showWelcome) {
                    showProfileDialog(dialog, user, {
                        status: 'error',
                        message: `Signed in and saved on this device, but cloud profile save failed: ${error.message}. Create Cloud Firestore and publish firestore.rules to sync this profile online.`
                    });
                }
            }
        }
        redirectProfileResult = null;
    }, error => {
        console.error('Could not check Firebase sign-in state.', error);
    });
}
