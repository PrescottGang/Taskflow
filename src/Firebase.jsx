import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Import manquant

const firebaseConfig = {
  apiKey: "AIzaSyDY-em3Xh8Z3-dcF9VNf7L2_lidnN3AmM4",
  authDomain: "taskflow-a0382.firebaseapp.com",
  projectId: "taskflow-a0382",
  storageBucket: "taskflow-a0382.firebasestorage.app",
  messagingSenderId: "333301743076",
  appId: "1:333301743076:web:ab40e75728e020f629dbf1",
  measurementId: "G-LP882YN2KG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Initialisation de Firestore manquante
const googleProvider = new GoogleAuthProvider();

// Configuration optionnelle du provider Google
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

const handleGoogleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (error) {
    // Gestion des erreurs spécifiques
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Connexion annulée par l\'utilisateur');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup bloquée par le navigateur');
    } else if (error.code === 'auth/cancelled-popup-request') {
      throw new Error('Demande de popup annulée');
    } else {
      throw new Error('Erreur lors de la connexion avec Google');
    }
  }
};

// Export de db ajouté
export { auth, db, googleProvider, handleGoogleLogin };