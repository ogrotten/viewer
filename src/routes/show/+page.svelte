<script lang="ts">
	import { onMount } from 'svelte'
	import fadeScale from '$lib/svelte-transitions-fade-scale.js'
	import { cubicInOut } from 'svelte/easing'
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

<div id="show" class="box-border flex flex-row w-full h-full">
	{#each gallery as img}
		<div
			transition:fadeScale={{
				delay: 0,
				duration: 500,
				easing: cubicInOut,
				baseScale: 0.85,
			}}
			class="h-screen transition-all duration-1000 bg-center bg-no-repeat bg-cover"
			style="width: {100 / gallery.length}%; background-image: url({img.url})"
		/>
	{/each}
</div>
