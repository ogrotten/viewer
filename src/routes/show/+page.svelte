<script lang="ts">
	import { onMount } from 'svelte'
	import fadeScale from '$lib/svelte-transitions-fade-scale.js'
	import { crossfade, fade } from 'svelte/transition'
	import { cubicInOut, cubicOut, cubicIn, linear } from 'svelte/easing'
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

	let carousel: Image[] = [],
		unsubCarousel,
		showCarousel = false

	let nowCount = 0

	async function setup() {
		unsubViewer = onSnapshot(doc(db, 'viewers', $dbUser?.uid), doc => {
			viewer = doc.data()
			showGallery = viewer.gallery
			showNow = viewer.now
			showCarousel = viewer.carousel
		})

		const c = query(
			collection(db, 'viewers', $dbUser?.uid, 'images'),
			where('carousel', '==', true),
		)
		unsubGallery = onSnapshot(c, snap => {
			carousel = [...snap.docs].map(doc => ({ id: doc.id, ...doc.data() }))
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

	const [send, receive] = crossfade({
		duration: d => Math.sqrt(d * 2000),

		fallback(node, params) {
			const style = getComputedStyle(node)
			const transform = style.transform === 'none' ? '' : style.transform

			return {
				duration: 2000,
				easing: linear,
				css: t => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`,
			}
		},
	})

	let bgimg = {}
	let carIndex = 0,
		carCount = 1,
		intervalId

	function runBg() {
		intervalId = setInterval(() => {
			// carCount++
			// carCount = carCount >= carousel.length ? 0 : carCount
			// console.log(`LOG..+page: carCount`, carousel[carCount].url)
			// bgimg = {
			// 	url: carousel[carCount].url,
			// 	title: carousel[carCount].title,
			// }
			nextImg()
		}, 10000)
	}

	function nextImg() {
		carIndex = (carIndex + 1) % carousel.length
	}

	$: if (showCarousel) runBg()
	else clearInterval(intervalId)

	$: if ($dbUser?.id) setup()

	$: {
		showGallery = viewer.gallery
		showNow = viewer.now
	}

	$: console.log(`LOG..+page: carousel`, carousel?.[carIndex]?.url)
</script>

{#if showNow && now?.[0]?.url}
	<img
		id="now"
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
{:else if showGallery}
	<div
		id="gallery"
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
				class="h-screen transition-all duration-500 origin-top scale-100 bg-center bg-no-repeat hover:scale-105"
				class:bg-contain={gallery.length === 1}
				class:bg-cover={gallery.length > 1}
				style="width: {100 / gallery.length}%; background-image: url({img.url})"
			/>
		{/each}
	</div>
{:else if showCarousel}
	<!-- {#each carousel as img, idx}
		{#if idx % 2 === 0} -->
	<div
		id="carousel"
		class=""
		transition:fade={{
			delay: 0,
			duration: 3000,
			easing: cubicInOut,
		}}
	>
		{#each [carousel[carIndex]] as img (carIndex)}
			<img
				alt={img?.title}
				src={img?.url}
				class="object-contain w-screen h-screen transition-all duration-1000"
				transition:fade={{
					delay: 0,
					duration: 3000,
					easing: cubicInOut,
				}}
			/>
		{/each}
		<!-- <img
			src={carousel?.[firstIndex]?.url}
			alt={carousel?.[firstIndex]?.title}
			class="object-contain w-screen h-screen transition-all duration-1000"
			class:visible={showFirst}
		/>
		<img
			src={carousel?.[secondIndex]?.url}
			alt={carousel?.[secondIndex]?.title}
			class="object-contain w-screen h-screen transition-all duration-1000"
			class:visible={!showFirst}
		/> -->
	</div>
	<!-- in:receive={{ key: img.id }}
		out:send={{ key: img.id }} -->
	<!-- {:else}
			<img
				alt={now?.[0]?.title}
				src={now?.[0]?.url}
				class="object-contain w-screen h-screen transition-all duration-1000"
				in:receive={{ key: img.id }}
				out:send={{ key: img.id }}
			/>
		{/if}
	{/each} -->
{/if}

<style>
	img {
		position: absolute;
	}
</style>
