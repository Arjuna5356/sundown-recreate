export const firebaseConfig = {
    apiKey: 'AIzaSyCKsHrwvdj_bNhg853KwySnkj2gep8srak',
    authDomain: 'sundow-8bc2f.firebaseapp.com',
    projectId: 'sundow-8bc2f',
    storageBucket: 'sundow-8bc2f.firebasestorage.app',
    messagingSenderId: '619907847196',
    appId: '1:619907847196:web:d9d273295906857044bbd9',
    measurementId: 'G-RC49360S7X'
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(
    value => value && !value.includes('REPLACE_WITH')
);
