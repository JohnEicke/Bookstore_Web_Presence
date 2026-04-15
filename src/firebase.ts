import { initializeApp } from "firebase/app";
    import { getAuth, GoogleAuthProvider } from "firebase/auth";
    import { getFirestore } from "firebase/firestore";
    import { getStorage } from "firebase/storage";
    
    // We'll use a placeholder if the config doesn't exist yet
    // This allows the app to compile while waiting for Firebase setup
    // import firebaseConfigData from "./firebase-applet-config.json";
    
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };
    
    const app = initializeApp(firebaseConfig);
    
    export const auth = getAuth(app);
    export const db = getFirestore(app, import.meta.env.VITE_FIREBASE_FIRESTORE_ID || "(default)");
    export const storage = getStorage(app);
    export const googleProvider = new GoogleAuthProvider();
    
    // Connection test
    import { doc, getDocFromCache } from "firebase/firestore"; 
    async function testConnection() {
      try {
        await getDocFromCache(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes("The client is offline")) {
          console.error("ERROR && error.message.includes('The client is offline')");
          // console.error("Please check your Firebase configuration.");
        }
      }
    }
    
    testConnection();
    
