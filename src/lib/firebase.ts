import { initializeApp, type FirebaseApp } from "firebase/app"
// import { getAnalytics } from "firebase/analytics"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"


const firebaseConfig = {
	apiKey: "AIzaSyB69NOmX0uQ9taZAq4jcEKLCLnxjxuqzdU",
	authDomain: "viewerino.firebaseapp.com",
	projectId: "viewerino",
	storageBucket: "viewerino.appspot.com",
	messagingSenderId: "228655171573",
	appId: "1:228655171573:web:afae377f88c35eb8f402bc",
	// measurementId: "G-3BBGXLKDHB"
};

let app: FirebaseApp
let db
let auth = {}

Promise.all([
	app = initializeApp(firebaseConfig),
]).then(() => {
	auth = getAuth(app)
	// db = getFirestore(app)
	return auth
}).then(() => {
	db = getFirestore(app)
}).catch((error) => console.log(`LOG..firebase: error`, error))


export { auth, app, db, }
