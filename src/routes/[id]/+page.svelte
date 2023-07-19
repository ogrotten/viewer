<script lang="ts">
	import { fly } from 'svelte/transition'
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
		getDoc,
	} from 'firebase/firestore'
	import { db } from '$lib/firebase'
	import { dbUser } from '$lib/firestore'

	let images: Image[],
		pref = {
			carouselTime: 0,
			carouselTransition: 0,
			tiles: false,
		}

	let newImg: Image = {
			url: '',
			carousel: false,
			gallery: false,
			now: false,
			title: '',
			id: '',
		},
		urlValid = false,
		many = '',
		manyFiltered: Image[],
		google = ''

	let show = { gallery: false, now: false, carousel: false },
		tab = 1,
		disableNow = false

	const resetImage = () => {
		newImg = {
			url: '',
			carousel: false,
			gallery: false,
			now: false,
			title: '',
		}
		urlValid = false
	}

	function setup() {
		getImages()
		getDoc(doc(db, 'viewers', $dbUser?.uid)).then(doc => {
			show = doc.data()
		})
	}

	async function getImages() {
		const querySnapshot = await getDocs(collection(db, 'viewers', $dbUser?.uid, 'images'))
		images = [...querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))]
		resetImage()
	}

	const addOne = async (incoming: Image) => {
		// Add a new document with a generated id.
		const docRef = await addDoc(collection(db, `viewers/${$dbUser?.uid}/images`), incoming)
		getImages()
	}

	const addMany = () => {
		manyFiltered.forEach(async (image, idx) => {
			await addDoc(collection(db, `viewers/${$dbUser?.uid}/images`), image)
		})
		getImages()
		manyFiltered = []
		many = ''
	}

	async function imageDelete<T>(image, idx) {
		await deleteDoc(doc(db, 'viewers', $dbUser?.uid, 'images', image.id)).then(() => {
			getImages()
		})
	}

	async function parameter(image: Image) {
		if (image.now) {
			const { id } = image
			images.forEach((img, idx) => {
				if (img.now && img.id !== id) {
					img.now = false
					updateDoc(doc(db, 'viewers', $dbUser?.uid, 'images', img.id), img)
				}
			})
		}
		updateDoc(doc(db, 'viewers', $dbUser?.uid, 'images', image.id), image).then(() => {
			getImages()
		})
	}

	function updateShow(e: Event & { target: HTMLButtonElement }) {
		const { name } = e.target
		show[name] = !show[name]
		updateDoc(doc(db, 'viewers', $dbUser?.uid), { [name]: show[name] })
	}

	onMount(async () => {})

	$: if ($dbUser?.id) setup()

	$: {
		const regex = new RegExp(
			/^(ftp|http|https|chrome|:\/\/|\.|@){2,}(localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|\S*:\w*@)*([a-zA-Z]|(\d{1,3}|\.){7}){1,}(\w|\.{2,}|\.[a-zA-Z]{2,3}|\/|\?|&|:\d|@|=|\/|\(.*\)|#|-|%)*$/gmu,
		)
		let item: Image = {
			url: newImg.url,
			carousel: false,
			gallery: false,
			now: false,
			title: '',
		}

		urlValid = regex.test(item.url)
	}

	$: {
		manyFiltered = many
			.split('\n')
			.filter(item => item.length > 0)
			.map(item => {
				const [url, title] = item.split(',')
				return {
					url,
					title: title?.trim() || '',
					carousel: false,
					gallery: false,
					now: false,
				}
			})
	}

	// $: console.log(`LOG..+page: show`, show)
</script>

<div class="flex flex-col gap-10">
	<div class="flex flex-row justify-around w-full h-16 gap-16 my-10">
		<button
			name="carousel"
			id="carousel"
			class:btn-outline={!show.carousel}
			class="h-full w-60 btn btn-outline btn-info"
			on:click={updateShow}
		>
			Carousel
		</button>
		<button
			name="gallery"
			id="gallery"
			class:btn-outline={!show.gallery}
			class="h-full w-60 btn btn-outline btn-secondary"
			on:click={updateShow}
		>
			Gallery
		</button>
		<button
			name="now"
			id="now"
			class:btn-outline={!show.now}
			class="h-full w-60 btn btn-outline btn-accent"
			on:click={updateShow}
		>
			Now
		</button>
	</div>

	<div class="">
		<div class="px-8 pt-2 pb-0 rounded-t-xl tabs bg-neutral-focus">
			<p class="mb-1 mr-4 font-bold">Add . . .</p>
			<a class="tab" class:active={tab === 0} on:click={() => (tab = 0)} href={''}>
				Just One
			</a>
			<a class="tab" class:active={tab === 1} on:click={() => (tab = 1)} href={''}> Many </a>
			<a class="tab" class:active={tab === 2} on:click={() => (tab = 2)} href={''}>
				from Google Drive
			</a>
		</div>
		<div class="w-full rounded-t-none shadow-xl card bg-neutral">
			<div class="card-body">
				{#if tab === 0}
					<div class="flex items-center justify-start gap-2" in:fly>
						<input
							type="title"
							placeholder="Title (optional)"
							class="w-full max-w-xs input-sm input input-bordered input-neutral"
							bind:value={newImg.title}
						/>
						<input
							type="url"
							placeholder="Image URL"
							class="w-full max-w-xs input-sm input input-bordered input-neutral"
							bind:value={newImg.url}
						/>

						<button
							class="btn btn-primary btn-sm"
							disabled={!urlValid}
							on:click={() => addOne(newImg)}
						>
							Add One
						</button>
					</div>
				{:else if tab === 1}
					<div class="flex flex-col gap-4" in:fly>
						<textarea
							rows="5"
							class="textarea textarea-bordered"
							placeholder="Enter a list, one per line.
URL, Title (optional)"
							bind:value={many}
						/>
						<button
							class="self-end btn btn-primary btn-sm"
							disabled={manyFiltered.length === 0}
							on:click={addMany}
						>
							Add Many
						</button>
					</div>
				{:else if tab === 2}
					<!--  -->
				{/if}
			</div>
		</div>
	</div>
	<div class="shadow-xl card bg-neutral">
		<div class="card-body">
			<div class="flex items-center justify-start gap-8">
				<div class="form-control">
					<label class="items-center gap-2 cursor-pointer label">
						<span class="label-text"> List</span>
						<input
							type="checkbox"
							class="toggle toggle-primary"
							bind:checked={pref.tiles}
						/>
						<span class="label-text">Thumbs</span>
					</label>
				</div>

				<span class="">
					<span class="pl-1 label-text">Carousel time</span>
					<div class="w-20 form-control">
						<input
							type="number"
							placeholder="Image URL"
							class="w-full max-w-xs input-sm input input-bordered input-neutral"
							bind:value={pref.carouselTransition}
						/>
					</div>
				</span>
				<span class="">
					<span class="pl-1 label-text">Transition</span>
					<div class="w-20 form-control">
						<input
							type="number"
							placeholder="Image URL"
							class="w-full max-w-xs input-sm input input-bordered input-neutral"
							bind:value={pref.carouselTransition}
						/>
					</div>
				</span>
			</div>
		</div>
	</div>
	<div class="flex flex-row flex-wrap gap-6">
		{#if images?.length > 0}
			{#if pref.tiles}
				{#each images as image, idx (image.id)}
					<!-- <Icon src={XMark} class="w-4 h-4 mr-2 font-bold text-red-600" /> -->
					<!-- svelte-ignore a11y-img-redundant-alt -->
					<span class="flex flex-col p-4 border bg-stone-800 border-stone-600">
						<div class="flex justify-between">
							<br />
							<button
								class="p-1 transition-all hover:bg-red-900"
								on:click={() => imageDelete(image, idx)}>❌</button
							>
						</div>
						<a href={image.url} class="" target="_blank">
							<img
								src={image.url}
								alt="image"
								class="object-cover object-top w-36 h-36 rounded-2xl"
							/>
						</a>
						<div class="flex flex-col gap-2">
							<p class=" min-h-8">{image.title || ''}</p>

							<button
								class="text-gray-800 btn btn-sm"
								class:unselected={!image.carousel}
								class:btn-primary={image.carousel}
								on:click={() => parameter({ ...image, carousel: !image.carousel })}
							>
								<span class="label-text">Carousel</span>
							</button>

							<button
								class="text-gray-800 btn btn-sm"
								class:unselected={!image.gallery}
								class:btn-secondary={image.gallery}
								on:click={() => parameter({ ...image, gallery: !image.gallery })}
							>
								<span class="label-text">Gallery</span>
							</button>

							<button
								class="text-gray-800 btn btn-sm"
								class:unselected={!image.now}
								class:btn-accent={image.now}
								on:click={() => parameter({ ...image, now: !image.now })}
							>
								<span class="label-text">Now</span>
							</button>
						</div>
					</span>
				{/each}
			{:else}
				<ul class="divide-y divide-stone-700">
					{#each images as image, idx (image.id)}
						<!-- <Icon src={XMark} class="w-4 h-4 mr-2 font-bold text-red-600" /> -->
						<!-- svelte-ignore a11y-img-redundant-alt -->
						<li class="flex flex-row items-center gap-12 p-2">
							<a
								href={image.url}
								class="flex flex-row items-center gap-2"
								target="_blank"
							>
								<img
									src={image.url}
									alt="image"
									class="object-cover object-top w-8 h-8 rounded"
								/>
								<p class="w-28 font-md">{image.title || ''}</p>
							</a>
							<!-- <div class="flex flex-col gap-2"> -->

							<button
								class="text-gray-800 btn btn-xs font-xs"
								class:unselected={!image.carousel}
								class:btn-primary={image.carousel}
								on:click={() => parameter({ ...image, carousel: !image.carousel })}
							>
								<span class="label-text">Carousel</span>
							</button>

							<button
								class="text-gray-800 btn btn-xs font-xs"
								class:unselected={!image.gallery}
								class:btn-secondary={image.gallery}
								on:click={() => parameter({ ...image, gallery: !image.gallery })}
							>
								<span class="label-text">Gallery</span>
							</button>

							<button
								class="text-gray-800 btn btn-xs font-xs"
								class:unselected={!image.now}
								class:btn-accent={image.now}
								on:click={() => parameter({ ...image, now: !image.now })}
							>
								<span class="label-text">Now</span>
							</button>
							<!-- </div> -->
							<div class="flex justify-between">
								<button
									class="p-1 transition-all hover:bg-red-900"
									on:click={() => imageDelete(image, idx)}>❌</button
								>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		{/if}
	</div>
</div>

<style>
	button {
		@apply text-gray-800;
	}
	.unselected {
		@apply btn-neutral text-gray-200;
	}
	.active {
		@apply bg-neutral tab-active rounded-t-lg;
	}
</style>
