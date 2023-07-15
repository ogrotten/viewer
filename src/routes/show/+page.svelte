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

	$: console.log(`LOG..+page: gallery`, gallery)
</script>

<div id="show" class="flex flex-wrap w-full h-full overflow-hidden" class:bg-yellow-800={debug}>
	{#each gallery as img}
		<img
			src={img.url}
			alt={img.title}
			class="object-contain w-1/{gallery.length} h-screen flex-shrink"
		/>
	{/each}
</div>
