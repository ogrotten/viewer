import { initializeApp } from "firebase/app"
// import { getAnalytics } from "firebase/analytics"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyC1sH0nkn8vM0rhC47i2pOU77FAco3ljFg",
	authDomain: "viewer-54075.firebaseapp.com",
	projectId: "viewer-54075",
	storageBucket: "viewer-54075.appspot.com",
	messagingSenderId: "548385998993",
	appId: "1:548385998993:web:f0237c7a405215e29b9730",
	measurementId: "G-8FQQB400R2"
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)
// const analytics = getAnalytics(app)
export const db = getFirestore(app)
export const auth = getAuth(app)


