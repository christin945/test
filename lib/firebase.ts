import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBqgM1F1MK4hRl1yOpXc5aUy27QrUh-oGI",
  authDomain: "proj2-b2295.firebaseapp.com",
  projectId: "proj2-b2295",
  storageBucket: "proj2-b2295.firebasestorage.app",
  messagingSenderId: "313821136466",
  appId: "1:313821136466:web:95d833aaee6834b30f018b",
  measurementId: "G-S68E0C4YHQ"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export default app
