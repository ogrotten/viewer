import { initializeApp, type FirebaseApp } from "firebase/app"
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

let app: FirebaseApp
let db
let auth = {}

Promise.all([
	app = initializeApp(firebaseConfig),
]).then(() => {
	console.log(`LOG..firebase: run auth`, app.options)
	auth = getAuth(app)
	// db = getFirestore(app)
	return auth
}).then(() => {
	console.log(`LOG..firebase: run db`, app.options)
	db = getFirestore(app)
}).catch((error) => console.log(`LOG..firebase: error`, error))

// try {
// 	app = initializeApp(firebaseConfig)
// 	auth = getAuth(app)
// 	db = getFirestore(app)
// } catch (error) {
// 	console.log(`LOG..firebase: error`, error)
// }


export { auth, app, db, }
