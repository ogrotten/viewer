// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyB69NOmX0uQ9taZAq4jcEKLCLnxjxuqzdU",
	authDomain: "viewerino.firebaseapp.com",
	projectId: "viewerino",
	storageBucket: "viewerino.appspot.com",
	messagingSenderId: "228655171573",
	appId: "1:228655171573:web:afae377f88c35eb8f402bc",
	measurementId: "G-3BBGXLKDHB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, app, db, }
