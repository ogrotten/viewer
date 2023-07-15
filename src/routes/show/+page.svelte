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

	const debug = true

	let gallery: Image[] = []

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

	$: console.log(`LOG..+page: gallery`, gallery[0])
</script>

<div id="show" class="flex flex-row">
	{#each gallery as img}
		<div
			class="h-screen transition-all bg-center bg-no-repeat bg-cover"
			style="width: {100 / gallery.length}%; background-image: url({img.url})"
		/>
	{/each}
</div>
