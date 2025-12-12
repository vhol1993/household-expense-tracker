import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your project's config keys from Firebase Console
// Settings -> Project Settings -> General -> "Your apps" -> SDK Setup and Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDoPUzOwMfesfjp-Rjp8yWLEu57G6CYxvk",
    authDomain: "expenses-64ed1.firebaseapp.com",
    projectId: "expenses-64ed1",
    storageBucket: "expenses-64ed1.firebasestorage.app",
    messagingSenderId: "159598256090",
    appId: "1:159598256090:web:528d571c390e5870c9eae3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

import { enableMultiTabIndexedDbPersistence } from "firebase/firestore";
enableMultiTabIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        console.warn("Multiple tabs open, persistence can only be enabled in one tab at a a time.");
    } else if (err.code == 'unimplemented') {
        console.warn("The current browser does not support all of the features required to enable persistence");
    }
});
