import { initializeApp } from "firebase/app"
// import { getAnalytics } from "firebase/analytics"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyCoigXNyquAp7oe4xoIXlxKwGq6bzSqlHw",
	authDomain: "viewer-dc297.firebaseapp.com",
	projectId: "viewer-dc297",
	storageBucket: "viewer-dc297.appspot.com",
	messagingSenderId: "565427240686",
	appId: "1:565427240686:web:7d6c7651abc02298e57dff"
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)
// const analytics = getAnalytics(app)
export const db = getFirestore(app)
export const auth = getAuth(app)


