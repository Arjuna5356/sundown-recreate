import { getApp, getApps, initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import {
    doc,
    getFirestore,
    serverTimestamp,
    setDoc
} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

export function getFirebaseServices() {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    return {
        auth: getAuth(app),
        db: getFirestore(app)
    };
}

export function saveLocalUserProfile(user) {
    const profile = {
        uid: user.uid,
        displayName: user.displayName || '',
        email: user.email || '',
        photoURL: user.photoURL || '',
        providerId: user.providerData[0]?.providerId || 'google.com',
        updatedAt: new Date().toISOString()
    };
    localStorage.setItem(`sundown-user-profile-${user.uid}`, JSON.stringify(profile));
    return profile;
}

export async function saveUserProfile(user, db) {
    const profile = saveLocalUserProfile(user);
    await setDoc(doc(db, 'users', user.uid), {
        ...profile,
        createdAt: user.metadata.creationTime
            ? new Date(user.metadata.creationTime)
            : serverTimestamp(),
        updatedAt: serverTimestamp()
    }, { merge: true });
}
