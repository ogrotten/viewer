<script lang="ts">
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	import { crossfade, fade } from 'svelte/transition'
	import { cubicInOut, cubicOut, cubicIn, linear } from 'svelte/easing'
	import fadeScale from '$lib/svelte-transitions-fade-scale.js'
	import {
		collection,
		doc,
		query,
		onSnapshot,
		where,
		getDoc,
		type DocumentData,
	} from 'firebase/firestore'
	import { db } from '$lib/firebase'
	import { dbUser } from '$lib/firestore'
	import Masonry from 'svelte-bricks'
	import { flip } from 'svelte/animate'
	import GalleryTile from './GalleryTile.svelte'
	import type { PageData } from './$types'

	export let data: PageData

	let loading = true

	const debug = false
	const uid = $page.params.id

	const { galleryAll } = data

	let viewer: DocumentData = {},
		unsubViewer,
		showGallery = false,
		showNow = false,
		galleryTile = false

	let gallery: Image[] = [],
		now: Image[],
		unsubGallery,
		presentGallery: Image[] = [],
		unsubNow

	let localNow: Image[] = [],
		localShowNow = false

	let carousel: Image[] = [],
		unsubCarousel,
		showCarousel = false

	let connected = false,
		connect = '',
		attach = uid || ''

	let bgimg = {}
	let carIndex = 0,
		carCount = 1,
		intervalId

	let tile = {
		HT: 0,
		WD: 0,
		SHT: 0,
		SWD: 0,
		FHT: 0,
		FWD: 0,
	}

	let changed: Changed | null = null
	let changedBool = false

	async function setup(incoming: string) {
		unsubViewer = onSnapshot(doc(db, 'viewers', incoming), doc => {
			viewer = doc.data()
			showGallery = viewer.gallery
			galleryTile = viewer.galleryTile
			showNow = viewer.now
			showCarousel = viewer.carousel
		})

		const c = query(
			collection(db, 'viewers', incoming, 'images'),
			where('carousel', '==', true),
		)
		unsubCarousel = onSnapshot(c, snap => {
			carousel = [...snap.docs].map(doc => ({ ...doc.data(), id: doc.id }))
		})

		const g = query(collection(db, 'viewers', incoming, 'images'), where('gallery', '==', true))
		unsubGallery = onSnapshot(g, snap => {
			gallery = [...snap.docs]
				.map(doc => ({ ...doc.data(), id: doc.id }))
				.sort((a, b) => b.index - a.index)
			snap.docChanges().forEach(change => {
				if (change.type === 'added') {
					let added = change.doc.data()
					presentGallery = [...gallery]
					changed = { id: added.id, added: true }
				} else if (change.type === 'modified') {
					presentGallery = [...gallery]
				} else if (change.type === 'removed') {
					let removed = change.doc.data()
					presentGallery.splice(presentGallery.indexOf(removed), 1)

					changed = { id: removed.id, added: false }
				} else changed = null
			})
		})

		const n = query(collection(db, 'viewers', incoming, 'images'), where('now', '==', true))

		unsubNow = onSnapshot(n, snap => {
			now = [...snap.docs].map(doc => ({ ...doc.data(), id: doc.id }))
		})

		Promise.all([unsubViewer, unsubGallery, unsubNow, unsubCarousel]).then(() => {
			loading = false
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

	function runBg() {
		intervalId = setInterval(() => {
			nextImg()
		}, 30000)
	}

	function nextImg() {
		carIndex = (carIndex + 1) % carousel.length
	}

	const setCols = (w: number, l: number) => {
		let outgoing
		if (l < 4) outgoing = tile.FWD / l - 100
		else outgoing = w - Math.floor(Math.floor((125 * Math.log(l * 0.85)) / 100)) * 100

		return outgoing
	}

	// $: maxColWidth = setCols(tile.WD, gallery?.length)

	onMount(() => {
		tile = {
			HT: Math.floor(window.innerHeight / 1.8),
			WD: Math.floor(window.innerWidth / 4),
			SHT: screen.height / 2,
			SWD: screen.width / 4,
			FHT: window.innerHeight,
			FWD: window.innerWidth,
		}
	})

	$: if (galleryTile) changedBool = true

	$: if (showCarousel) runBg()
	else clearInterval(intervalId)

	$: if (!showGallery && !showNow && !galleryTile && !showCarousel) {
		localShowNow = false
	}

	$: if (showNow) {
		localShowNow = false
	}

	$: {
		showGallery = viewer.gallery
		showNow = viewer.now
	}

	$: if (attach.length > 25) {
		getDoc(doc(db, 'viewers', attach)).then(doc => {
			if (doc.exists()) {
				connected = true
				connect = attach
				setup(attach)
			} else {
				connected = false
				connect = ''
			}
		})
	}

	const setChange = () => {
		let galleryIds = gallery.map(x => x.id)
		let presentGalleryIds = presentGallery.map(x => x.id)

		if (presentGallery?.length !== 0) {
			if (gallery?.length < presentGallery?.length && !loading) {
				let removed = presentGallery.filter(x => !galleryIds.includes(x.id))[0]
				presentGallery
					.splice(presentGallery.indexOf(removed), 1)
					.sort((a, b) => b.index - a.index)
				changed = { id: removed.id, added: false }
			} else if (gallery?.length > presentGallery?.length && !loading) {
				let added = gallery.filter(x => !presentGalleryIds.includes(x.id))[0]
				presentGallery = [...gallery]
				changed = { id: added.id, added: true }
			} else {
				changed = null
			}
		} else presentGallery = [...gallery]
	}
</script>

<div class="">
	{#if !connected}
		<div class="flex items-center justify-center w-screen h-screen">
			<!-- <span class="w-fit">
				<input
					type="attach"
					placeholder="Connect to..."
					class="max-w-xs w-80 input-sm input input-bordered input-neutral"
					bind:value={attach}
				/>
			</span> -->
		</div>
	{:else if showNow && now?.[0]?.url}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
		<span class="">
			<img
				id="now"
				alt={now?.[0]?.title}
				src={now?.[0]?.url}
				class="absolute object-contain w-screen h-screen transition-all duration-1000"
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
			<p
				class="absolute bottom-0 left-0 w-full p-2 py-2 text-2xl font-bold text-center transition-all bg-black bg-opacity-50 group-hover:bg-opacity-100 group-hover:bg-cyan-950 group-hover:text-white"
			>
				{now?.[0]?.title}
			</p>
		</span>
	{:else if localShowNow && localNow?.[0]?.url}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
		<div
			class="relative"
			in:fadeScale={{
				delay: 500,
				duration: 2000,
				easing: cubicOut,
				baseScale: 0.7,
			}}
		>
			<img
				id="now"
				alt={localNow?.[0]?.title}
				src={localNow?.[0]?.url}
				class="object-contain w-screen h-screen transition-all"
				out:fadeScale={{
					delay: 0,
					duration: 200,
					easing: cubicIn,
					baseScale: 0.85,
				}}
				on:click={() => {
					localShowNow = false
					changedBool = true
				}}
			/>
			<!-- <p
				class="absolute bottom-0 left-0 w-full p-2 py-2 text-2xl font-bold text-center transition-all opacity-50"
				in:fade={{
					delay: 200,
					duration: 2000,
					easing: cubicOut,
				}}
				out:fade={{
					delay: 0,
					duration: 100,
					easing: cubicOut,
				}}
				style="mix-blend-mode: difference; color: #8c8"
			>
				{localNow?.[0]?.title}
			</p> -->
			<p
				class="absolute bottom-0 left-0 w-full p-2 py-2 text-2xl font-bold text-center transition-all opacity-75 text-cyan-50"
				in:fade={{
					delay: 200,
					duration: 2000,
					easing: cubicOut,
				}}
				out:fade={{
					delay: 0,
					duration: 100,
					easing: cubicOut,
				}}
				style="text-shadow: 2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;"
			>
				{localNow?.[0]?.title}
			</p>
		</div>
	{:else if showGallery}
		<div id={'svelte-bricks'} class="relative">
			<!-- {#if galleryTile && gallery.length > 1} -->
			{#if galleryTile && !localShowNow}
				<GalleryTile
					{presentGallery}
					{gallery}
					{attach}
					{galleryAll}
					bind:changedBool
					bind:changed
					on:localNow={({ detail }) => {
						localNow[0] = presentGallery.filter(x => x.id === detail.id)[0]
						localShowNow = true
					}}
				/>
			{:else}
				<div
					id="gallery notile"
					class="box-border absolute flex flex-row w-full h-full"
					out:fadeScale={{
						delay: 0,
						duration: 500,
						easing: cubicInOut,
						baseScale: 0.85,
					}}
					in:fadeScale={{
						delay: 500,
						duration: 500,
						easing: cubicInOut,
						baseScale: 0.85,
					}}
				>
					{#each presentGallery as img, idx (img.id)}
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<!-- svelte-ignore a11y-no-static-element-interactions -->
						<!-- animate:flip={{
								delay: 0,
								duration: 500,
								easing: cubicInOut,
							}} -->
						<div
							transition:fadeScale={{
								delay: 0,
								duration: 500,
								easing: cubicInOut,
								baseScale: 0.85,
							}}
							class="h-screen transition-all duration-500 origin-center scale-100 bg-center bg-no-repeat hover:scale-95 group"
							class:bg-contain={gallery.length <= 2}
							class:bg-cover={gallery.length > 2}
							style="width: {100 / gallery.length}%; background-image: url({img.url})"
							on:click={() => {
								localNow[0] = img
								localShowNow = true
							}}
						>
							{#if img.title}
								<p
									class="absolute bottom-0 left-0 w-full p-2 py-2 text-2xl font-bold text-center transition-all duration-500 opacity-50 group-hover:opacity-100 text-cyan-50"
									style="text-shadow: 2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;"
								>
									{img.title}
								</p>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{:else if showCarousel}
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
					style="position: absolute;"
				/>
			{/each}
		</div>
	{:else if !showNow && !localShowNow && !showGallery && !showCarousel}
		<div class="flex items-center justify-center w-screen h-screen">
			<span class="w-fit">
				<!-- <p style="font-size: 400px" class="invert opacity-20 grayscale">🎥</p> -->
				<p
					style="font-size: 44px"
					class="absolute invert opacity-15 grayscale bottom-10 left-10 animate-pulse"
				>
					No images selected.
				</p>
				<!-- <p style="font-size: 400px" class="opacity-20 grayscale">📸</p> -->
			</span>
		</div>
	{/if}
</div>

<style>
	#brickitem {
		@apply w-full h-fit object-contain;
		@apply px-0 pb-0;
	}
	.brickcol {
		@apply box-border p-0;
	}
</style>
