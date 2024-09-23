import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD8ihKiHwow4PDL6bSdgSw2AmaQ3Op9ARc",
  authDomain: "praktikprojekt-c18e6.firebaseapp.com",
  projectId: "praktikprojekt-c18e6",
  storageBucket: "praktikprojekt-c18e6.appspot.com",
  messagingSenderId: "823568220412",
  appId: "1:823568220412:web:f7ed7c1ef1bc03ad5b1779"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };