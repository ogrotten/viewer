<script lang="ts">
	import { onMount } from 'svelte'
	import fadeScale from '$lib/svelte-transitions-fade-scale.js'
	import { cubicInOut, cubicOut, cubicIn } from 'svelte/easing'
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
		getDoc,
		type DocumentData,
	} from 'firebase/firestore'
	import { db } from '$lib/firebase'
	import { dbUser } from '$lib/firestore'

	const debug = true

	let viewer: DocumentData = {},
		unsubViewer,
		showGallery = false,
		showNow = false

	let gallery: Image[] = [],
		now: Image[],
		unsubGallery,
		unsubNow

	let nowCount = 0

	async function setup() {
		unsubViewer = onSnapshot(doc(db, 'viewers', $dbUser?.uid), doc => {
			viewer = doc.data()
			showGallery = viewer.gallery
			showNow = viewer.now
		})

		const g = query(
			collection(db, 'viewers', $dbUser?.uid, 'images'),
			where('gallery', '==', true),
		)
		unsubGallery = onSnapshot(g, snap => {
			gallery = [...snap.docs].map(doc => ({ id: doc.id, ...doc.data() }))
		})

		const n = query(collection(db, 'viewers', $dbUser?.uid, 'images'), where('now', '==', true))

		unsubNow = onSnapshot(n, snap => {
			now = [...snap.docs].map(doc => ({ id: doc.id, ...doc.data() }))
		})
	}

	$: if ($dbUser?.id) setup()

	$: {
		showGallery = viewer.gallery
		showNow = viewer.now
	}
</script>

{#if showGallery}
	<div
		id="show"
		class="box-border flex flex-row w-full h-full"
		transition:fadeScale={{
			delay: 0,
			duration: 500,
			easing: cubicInOut,
			baseScale: 0.85,
		}}
	>
		{#each gallery as img}
			<div
				transition:fadeScale={{
					delay: 0,
					duration: 500,
					easing: cubicInOut,
					baseScale: 0.85,
				}}
				class="h-screen transition-all duration-500 bg-center bg-no-repeat hover:ring-[24px] ring-inset ring-slate-500/50 scale-100 hover:scale-105 origin-top"
				class:bg-contain={gallery.length === 1}
				class:bg-cover={gallery.length > 1}
				style="width: {100 / gallery.length}%; background-image: url({img.url})"
			/>
		{/each}
	</div>
{:else if showNow && now?.[0]?.url}
	<img
		alt={now[0].title}
		src={now[0].url}
		class="object-contain w-screen h-screen transition-all duration-1000"
		in:fadeScale={{
			delay: 0,
			duration: 2000,
			easing: cubicOut,
			baseScale: 0.85,
		}}
		out:fadeScale={{
			delay: 0,
			duration: 2000,
			easing: cubicIn,
			baseScale: 0.85,
		}}
	/>
{/if}
