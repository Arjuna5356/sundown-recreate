import {
    GoogleAuthProvider,
    browserLocalPersistence,
    getRedirectResult,
    onAuthStateChanged,
    setPersistence,
    signInWithPopup,
    signInWithRedirect,
    signOut
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import { isFirebaseConfigured } from './firebase-config.js';
import { getFirebaseServices, saveLocalUserProfile } from './user-profile.js';

const signInButton = document.querySelector('#google-sign-in');
const signOutButton = document.querySelector('#sign-out');
const message = document.querySelector('#auth-message');
const accountPanel = document.querySelector('#account-panel');
const signInPanel = document.querySelector('#sign-in-panel');
const userName = document.querySelector('#user-name');
const userEmail = document.querySelector('#user-email');
const userPhoto = document.querySelector('#user-photo');

function showMessage(text, isError = false) {
    message.textContent = text;
    message.classList.toggle('is-error', isError);
    message.hidden = !text;
}

function showSignedInUser(user) {
    signInPanel.hidden = true;
    accountPanel.hidden = false;
    userName.textContent = user.displayName || 'Signed-in user';
    userEmail.textContent = user.email || '';
    if (user.photoURL) {
        userPhoto.src = user.photoURL;
        userPhoto.hidden = false;
    } else {
        userPhoto.removeAttribute('src');
        userPhoto.hidden = true;
    }
}

if (!isFirebaseConfigured) {
    signInButton.disabled = true;
    showMessage(
        'Google sign-in is not connected yet. Add your Firebase web app configuration to js/firebase-config.js, enable Google in Firebase Authentication, and authorize this site domain.',
        true
    );
} else {
    const { auth } = getFirebaseServices();
    const provider = new GoogleAuthProvider();
    let returnHandled = false;
    let initialAuthStateResolved = false;
    let redirectResultResolved = false;

    const reportMissingRedirectSession = () => {
        if (
            returnHandled ||
            !initialAuthStateResolved ||
            !redirectResultResolved ||
            sessionStorage.getItem('sundown-auth-pending') !== 'true' ||
            auth.currentUser
        ) {
            return;
        }

        sessionStorage.removeItem('sundown-auth-pending');
        signInButton.disabled = false;
        showMessage(
            'Google returned to the site, but Firebase did not restore a signed-in session. Try again. If it repeats, check that localhost is an authorized domain in Firebase Authentication and allow cookies for this site.',
            true
        );
    };

    const completeSignIn = user => {
        if (returnHandled) return;
        returnHandled = true;
        sessionStorage.removeItem('sundown-auth-pending');
        try {
            saveLocalUserProfile(user);
            sessionStorage.setItem('sundown-auth-profile', JSON.stringify({
                status: 'saved',
                message: 'Your Google profile is saved on this device.'
            }));
        } catch (error) {
            sessionStorage.setItem('sundown-auth-profile', JSON.stringify({
                status: 'error',
                message: `Signed in, but this browser could not save the profile: ${error.message}`
            }));
        }
        window.location.replace('index.html?welcome=1');
    };

    setPersistence(auth, browserLocalPersistence).then(() => {
        onAuthStateChanged(auth, user => {
            initialAuthStateResolved = true;
            if (!user) {
                signInPanel.hidden = false;
                accountPanel.hidden = true;
                userPhoto.removeAttribute('src');
                window.setTimeout(reportMissingRedirectSession, 1500);
                return;
            }

            showSignedInUser(user);
            if (sessionStorage.getItem('sundown-auth-pending') === 'true') {
                completeSignIn(user);
            }
        }, error => {
            showMessage(`Could not check your sign-in status: ${error.message}`, true);
        });

        return getRedirectResult(auth).then(result => {
            redirectResultResolved = true;
            if (result?.user) completeSignIn(result.user);
            else window.setTimeout(reportMissingRedirectSession, 1500);
        });
    }).catch(error => {
        sessionStorage.removeItem('sundown-auth-pending');
        signInButton.disabled = false;
        showMessage(`Google sign-in failed: ${error.message}`, true);
    });

    signInButton.addEventListener('click', async () => {
        signInButton.disabled = true;
        showMessage('Connecting to Google…');
        try {
            const result = await signInWithPopup(auth, provider);
            completeSignIn(result.user);
        } catch (error) {
            if (error.code === 'auth/popup-blocked') {
                try {
                    sessionStorage.setItem('sundown-auth-pending', 'true');
                    showMessage('Opening Google sign-in…');
                    await signInWithRedirect(auth, provider);
                    return;
                } catch (redirectError) {
                    sessionStorage.removeItem('sundown-auth-pending');
                    signInButton.disabled = false;
                    showMessage(`Google sign-in failed: ${redirectError.message}`, true);
                    return;
                }
            }

            signInButton.disabled = false;
            if (error.code === 'auth/popup-closed-by-user') {
                showMessage('Google sign-in was closed before it finished.');
            } else {
                showMessage(`Google sign-in failed: ${error.message}`, true);
            }
        }
    });

    signOutButton.addEventListener('click', async () => {
        signOutButton.disabled = true;
        try {
            await signOut(auth);
            showMessage('You have signed out.');
        } catch (error) {
            showMessage(`Sign-out failed: ${error.message}`, true);
        } finally {
            signOutButton.disabled = false;
        }
    });
}
