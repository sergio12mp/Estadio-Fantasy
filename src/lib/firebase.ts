// src/lib/firebase.ts

import { initializeApp, getApps } from "firebase/app";
import { getAuth, browserLocalPersistence, setPersistence } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyCsoRiT0lydN67YZYOaUPxkUrfinIpoeAE",
  authDomain: "estadiofantasy-563b1.firebaseapp.com",
  projectId: "estadiofantasy-563b1",
  storageBucket: "estadiofantasy-563b1.firebasestorage.app",
  messagingSenderId: "654809360207",
  appId: "1:654809360207:web:1af215eb65198443c3473a",
  measurementId: "G-F2BLQCMB5N"
};

//console.log("Firebase Config", firebaseConfig);

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence); // 👈 Esto mantiene la sesión en recargas

export { auth };
