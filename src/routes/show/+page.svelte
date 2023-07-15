<script lang="ts">
	import { onMount } from 'svelte'
	import {
		addDoc,
		collection,
		doc,
		query,
		onSnapshot,
		getDocs,
		deleteDoc,
		updateDoc,
		where,
	} from 'firebase/firestore'
	import { db } from '$lib/firebase'
	import { dbUser } from '$lib/firestore'

	let gallery: Image[]

	let unsubGallery

	async function getGallery() {
		const q = query(
			collection(db, 'viewers', $dbUser?.uid, 'images'),
			where('gallery', '==', true),
		)

		unsubGallery = onSnapshot(q, snap => {
			gallery = [...snap.docs].map(doc => ({ id: doc.id, ...doc.data() }))
		})
	}

	$: if ($dbUser?.id) getGallery()

	$: console.log(`LOG..+page: gallery`, gallery)
</script>
