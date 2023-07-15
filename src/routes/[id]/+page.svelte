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
	} from 'firebase/firestore'
	import { db } from '$lib/firebase'
	import { dbUser } from '$lib/firestore'

	let images: Image[]

	let newImg: Image = {
			url: '',
			carousel: false,
			gallery: false,
			now: false,
			title: '',
			id: '',
		},
		urlValid = false,
		disableNow = false

	let show = { gallery: false, now: false, carousel: false }

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

	async function getImages() {
		const querySnapshot = await getDocs(collection(db, 'viewers', $dbUser?.uid, 'images'))
		images = [...querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))]
		resetImage()
	}

	const addOne = async (incoming: Image) => {
		// Add a new document with a generated id.
		console.log(`LOG..+page: addOne`, incoming)
		const docRef = await addDoc(collection(db, `viewers/${$dbUser?.uid}/images`), incoming)
		getImages()
	}

	function handleInputChange(e: Event & { target: HTMLInputElement; code: string }) {
		const regex = new RegExp(
			/^(ftp|http|https|chrome|:\/\/|\.|@){2,}(localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|\S*:\w*@)*([a-zA-Z]|(\d{1,3}|\.){7}){1,}(\w|\.{2,}|\.[a-zA-Z]{2,3}|\/|\?|&|:\d|@|=|\/|\(.*\)|#|-|%)*$/gmu,
		)
		let item: Image = {
			url: e.target.value,
			carousel: false,
			gallery: false,
			now: false,
			title: '',
		}

		urlValid = regex.test(item.url)
	}

	async function imageDelete<T>(image, idx) {
		await deleteDoc(doc(db, 'viewers', $dbUser?.uid, 'images', image.id)).then(() => {
			console.log(`LOG..+page: deleted`)
			getImages()
		})
	}

	async function parameter(image: Image) {
		console.log(`LOG..+page: parameter`, image.carousel)
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

	$: if ($dbUser?.id) getImages()
</script>

<div class="flex flex-col gap-10">
	<div class="flex flex-row justify-around w-full h-16 gap-16 my-10">
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
		<button
			name="carousel"
			id="carousel"
			class:btn-outline={!show.carousel}
			class="h-full w-60 btn btn-outline btn-info"
			on:click={updateShow}
		>
			Carousel
		</button>
	</div>
	<div class="flex items-center justify-start gap-2">
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
			on:change={handleInputChange}
		/>

		<button class="btn btn-primary btn-sm" disabled={!urlValid} on:click={() => addOne(newImg)}>
			Add
		</button>
	</div>
	<div class="flex flex-row flex-wrap gap-6">
		{#if images?.length > 0}
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
</style>
