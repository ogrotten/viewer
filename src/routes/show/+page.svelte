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

<!-- <div
	id="show"
	class="grid grid-cols{gallery.length} w-full h-full overflow-hidden"
	class:bg-yellow-800={debug}
>
	{#each gallery as img}
		<img src={img.url} alt={img.title} class="w-1/{gallery.length} h-screen" />
		<div class="bg-[url({img.url})] w-1/{gallery.length} h-screen" />
		{/each}
	</div> -->

<div
	class="w-1/4 h-screen bg-center bg-no-repeat bg-cover"
	style="background-image: url({gallery[0]?.url})"
/>
