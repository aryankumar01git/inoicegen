import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Firebase configuration - New Project
const firebaseConfig = {
    apiKey: "AIzaSyBJHsj6mmujyf7WvIjapQvk8PnYJfE7Ezg",
    authDomain: "ips-school-e307a.firebaseapp.com",
    databaseURL: "https://ips-school-e307a-default-rtdb.firebaseio.com",
    projectId: "ips-school-e307a",
    storageBucket: "ips-school-e307a.firebasestorage.app",
    messagingSenderId: "268090703845",
    appId: "1:268090703845:web:51d489b0291ad09c8c390c",
    measurementId: "G-YFLD2TZDRE"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
