import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  orderBy, 
  where, 
  limit, 
  onSnapshot 
} from 'firebase/firestore';

// Configuration from our automatically provisioned firebase-applet-config.json
const firebaseConfig = {
  apiKey: "AIzaSyBNO-IvrbSO4tdJQII_yUGn9Dw8M_12bIg",
  authDomain: "voteguide-app.firebaseapp.com",
  projectId: "voteguide-app",
  storageBucket: "voteguide-app.firebasestorage.app",
  messagingSenderId: "836615451813",
  appId: "1:836615451813:web:c3a87c5bd4fa521348094c",
  // Specify custom firestore database ID from our config
  databaseId: "ai-studio-198875a5-ecd7-4dd5-bd97-83aeadc61e8a"
};

const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore
// By default, initialize Firestore with the custom databaseId from config if provided
export const db = getFirestore(app, firebaseConfig.databaseId);

export { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  orderBy, 
  where, 
  limit, 
  onSnapshot 
};
