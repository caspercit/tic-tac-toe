import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCXOHR9X_g9UOPTPlW6nrphiWklFB9GeDM",
  authDomain: "tictactoepro-50d26.firebaseapp.com",
  projectId: "tictactoepro-50d26",
  storageBucket: "tictactoepro-50d26.firebasestorage.app",
  messagingSenderId: "544297093271",
  appId: "1:544297093271:web:c6afa1fc0fc346f8a641d2",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);