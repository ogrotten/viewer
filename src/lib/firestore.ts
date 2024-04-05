import { writable } from 'svelte/store'
import { auth } from '$lib/firebase'
import { doc, getFirestore, onSnapshot, getDoc, setDoc, type DocumentData } from "firebase/firestore"
import { onAuthStateChanged, type User } from 'firebase/auth'
import { db } from '$lib/firebase'

// import type { User } from 'firebase/auth'
import { goto } from '$app/navigation'

interface UserWithRole extends User {
	role: string;
}

/**
 * @returns a store with the current firebase user
 */
function userStore() {
	let unsubscribe: () => void

	if (!auth || !globalThis.window) {
		console.warn('Auth is not initialized or not in browser')
		const { subscribe } = writable(null)
		return {
			subscribe,
		}
	}


	const { subscribe } = writable(auth?.currentUser ?? null, (set) => {

		unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (!user) {
				set(null)
				goto('/')
				return
			}

			user.id = user.uid

			set(user)

			const userRef = doc(db, `users/${user.uid}`)
			const viewRef = doc(db, `viewers/${user.uid}`)
			if (user) {
				await getDoc(userRef).then(async (doc) => {
					if (!doc.exists()) {
						console.log('Creating user')
						setDoc(userRef, {
							name: user.displayName,
							email: user.email,
							photoURL: user.photoURL,
							id: user.uid,
						})
						setDoc(viewRef, {
							gallery: false,
							now: false,
							carousel: false,
						})
					}

					const data = doc.data() as DocumentData
					const userWithRole = user as UserWithRole;
					userWithRole.role = data.role
				})
			}
		})

		return () => unsubscribe()
	})

	return {
		subscribe,
	}
}

export function docStore<T>(
	path: string,
) {
	let unsubscribe: () => void

	const docRef = doc(db, path)

	const { subscribe } = writable<T | null>(null, (set) => {
		unsubscribe = onSnapshot(docRef, (snapshot) => {
			set((snapshot.data() as T) ?? null)
		})

		return () => unsubscribe()
	})

	return {
		subscribe,
		ref: docRef,
		id: docRef.id,
	}
}

export const dbUser = userStore()