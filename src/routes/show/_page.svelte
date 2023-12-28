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
	import Masonry from 'svelte-bricks'

	const debug = false

	let viewer: DocumentData = {},
		unsubViewer,
		showGallery = false,
		showNow = false,
		galleryTile = false

	let gallery: Image[] = [],
		now: Image[],
		unsubGallery,
		unsubNow

	let localNow: Image[] = [],
		localShowNow = false

	let carousel: Image[] = [],
		unsubCarousel,
		showCarousel = false

	let connected = false,
		connect = '',
		attach = ''

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
		unsubGallery = onSnapshot(c, snap => {
			carousel = [...snap.docs].map(doc => ({ id: doc.id, ...doc.data() }))
		})

		const g = query(collection(db, 'viewers', incoming, 'images'), where('gallery', '==', true))
		unsubGallery = onSnapshot(g, snap => {
			gallery = [...snap.docs].map(doc => ({ id: doc.id, ...doc.data() }))
		})

		const n = query(collection(db, 'viewers', incoming, 'images'), where('now', '==', true))

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
			nextImg()
		}, 30000)
	}

	function nextImg() {
		carIndex = (carIndex + 1) % carousel.length
	}

	onMount(() => {
		tile = {
			HT: window.innerHeight / 1.75,
			WD: window.innerWidth / 3.5,
			SHT: screen.height / 2,
			SWD: screen.width / 4,
		}
	})

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

	let tile = {
		HT: 0,
		WD: 0,
		SHT: 0,
		SWD: 0,
	}
</script>

<div class="relative">
	{#if !connected}
		<div class="flex items-center justify-center w-screen h-screen">
			<span class="w-fit">
				<input
					type="attach"
					placeholder="Connect to..."
					class="max-w-xs w-80 input-sm input input-bordered input-neutral"
					bind:value={attach}
				/>
			</span>
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
		<span class="">
			<img
				id="now"
				alt={localNow?.[0]?.title}
				src={localNow?.[0]?.url}
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
				on:click={() => (localShowNow = false)}
			/>
			<p
				class="absolute bottom-0 left-0 w-full p-2 py-2 text-2xl font-bold text-center transition-all bg-black bg-opacity-50 group-hover:bg-opacity-100 group-hover:bg-cyan-950 group-hover:text-white"
			>
				{localNow?.[0]?.title}
			</p>
		</span>
	{:else if showGallery}
		<div
			id={'svelte-bricks'}
			class=""
			transition:fadeScale={{
				delay: 0,
				duration: 500,
				easing: cubicInOut,
				baseScale: 0.85,
			}}
		>
			{#if galleryTile && gallery.length > 1}
				<div
					class="absolute w-full h-full p-10"
					transition:fadeScale={{
						delay: 0,
						duration: 500,
						easing: cubicInOut,
						baseScale: 0.85,
					}}
				>
					<Masonry
						items={gallery}
						let:item
						gap={0}
						minColWidth={tile.WD - 200}
						maxColWidth={tile.WD}
						animate={true}
						columnClass={'brickcol'}
					>
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
						<span class="p-8 group">
							<img
								id="brickitem"
								src={item?.url}
								alt={item?.title}
								on:click={() => {
									localNow[0] = item
									localShowNow = true
								}}
								title={item?.title}
								class="transition-all duration-500 origin-center scale-100 hover:scale-95"
							/>
							<p
								class="w-full p-2 py-2 text-2xl font-bold text-center transition-all group-hover:text-white"
							>
								{item.title}
							</p>
						</span>
					</Masonry>
				</div>
			{:else}
				<div
					id="gallery"
					class="box-border absolute flex flex-row w-full h-full"
					transition:fadeScale={{
						delay: 0,
						duration: 500,
						easing: cubicInOut,
						baseScale: 0.85,
					}}
				>
					{#each gallery as img}
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<!-- svelte-ignore a11y-no-static-element-interactions -->
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
									class="absolute bottom-0 left-0 w-full p-2 py-2 text-2xl font-bold text-center transition-all duration-500 bg-black bg-opacity-50 group-hover:bg-opacity-100 group-hover:bg-cyan-950 group-hover:text-white"
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
	{:else}
		<div class="flex items-center justify-center w-screen h-screen">
			<span class="w-fit">
				<!-- <p style="font-size: 400px" class="invert opacity-20 grayscale">🎥</p> -->
				<p
					style="font-size: 85px"
					class="absolute invert opacity-20 grayscale bottom-10 left-10"
				>
					🎦
				</p>
				<!-- <p style="font-size: 400px" class="opacity-20 grayscale">📸</p> -->
			</span>
		</div>
	{/if}
</div>

<style>
	#brickitem {
		@apply w-full h-fit object-contain;
		@apply max-h-[800px] px-4 pb-0;
	}
	.brickcol {
		@apply box-border px-4;
	}
</style>
