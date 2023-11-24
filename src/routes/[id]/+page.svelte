<script lang="ts">
	import { fly, fade } from 'svelte/transition'
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { db } from '$lib/firebase'
	import { dbUser } from '$lib/firestore'
	import {
		addDoc,
		collection,
		doc,
		getDocs,
		deleteDoc,
		updateDoc,
		getDoc,
	} from 'firebase/firestore'

	const debug = false
	let setupLink = 'https://char.show/show/'
	let loading = true,
		showAdd = false,
		linkcopied = false,
		idcopied = false

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
			index: Date.now(),
		},
		urlValid = false,
		many = '',
		manyFiltered: Image[],
		google = ''

	let show = { gallery: false, now: false, carousel: false, galleryTile: false },
		tab = 1,
		disableNow = false

	let showHover = -1

	const resetImage = () => {
		newImg = {
			url: '',
			carousel: false,
			gallery: false,
			now: false,
			title: '',
			id: '',
			index: Date.now(),
		}
		urlValid = false
	}

	onMount(async () => {
		if ($dbUser?.id !== $page.params.id) {
			console.log(`LOG..+page: NOPE`, $dbUser?.id, $page.params.id)
			goto('/')
		} else {
			loading = false
			setupLink += $dbUser?.id
		}
	})

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

	let showTitleEdit = -1
	const titleEdit = img => {
		updateDoc(doc(db, 'viewers', $dbUser?.uid, 'images', img.id), img).then(() => {
			showTitleEdit = -1
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

	const clear = (incoming: string) => {
		const filteredImages = images
			.filter(image => image[incoming])
			.forEach(image => {
				parameter({ ...image, [incoming]: false })
				show[incoming] = false
				updateDoc(doc(db, 'viewers', $dbUser?.uid), { [incoming]: false })
			})
		console.log(`LOG..+page: filteredImages`, filteredImages)
	}

	const resetShowStates = () => {
		show = { gallery: false, now: false, carousel: false, galleryTile: false }
		updateDoc(doc(db, 'viewers', $dbUser?.uid), {
			carousel: false,
			gallery: false,
			now: false,
			galleryTile: false,
		})
	}

	const setGalleryItem = (image: Image) => {
		if (image.gallery) {
			image.gallery = false
			image.index = 0
		} else {
			image.gallery = true
			image.index = Date.now()
		}
		return parameter(image)
	}

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

	$: {
		if (linkcopied || idcopied) {
			setTimeout(() => {
				idcopied = false
				linkcopied = false
			}, 1500)
		}
	}

	let imgLists = {
		carousel: <Image[]>[],
		gallery: <Image[]>[],
	}

	$: imgLists = {
		carousel: images?.filter(image => image.carousel),
		gallery: images?.filter(image => image.gallery),
	}

	$: console.log(
		`LOG..+page: imgLists.gallery`,
		imgLists?.gallery?.map(img => img.index),
	)
</script>

<svelte:window
	on:keydown={e => {
		if (e.key === 'Escape') showTitleEdit = -1
	}}
/>
<!-- on:click|preventDefault={() => {
		if (showTitleEdit !== -1) showTitleEdit = -1
	}} -->
{#if loading}
	<div class="" />
{:else}
	<div class="flex flex-col gap-10">
		<span class="">
			<p class="flex flex-row items-center font-semibold">
				Use this url to see the live show:
				<button
					class="z-50 h-full ml-2 transition-all border w-fit border-warning btn-outline btn-warning btn-xs"
					on:click={() => {
						navigator.clipboard.writeText(setupLink).then(() => {})
						linkcopied = true
					}}
				>
					{setupLink}
				</button>
				{#if linkcopied}
					<button
						class="z-0 h-full font-bold transition duration-200 border pointer-events-none w-fit border-success btn-outline btn-success btn-xs"
						transition:fly={{ x: 20 }}
					>
						👍 Copied!
					</button>
				{/if}
			</p>
		</span>
		<div class="flex flex-row items-start justify-around w-full h-16 gap-16 my-10">
			<button
				name="carousel"
				id="carousel"
				class:btn-outline={!show.carousel}
				class="h-12 w-60 btn btn-outline btn-info"
				on:click={updateShow}
			>
				Carousel
			</button>
			<span class="">
				<button
					name="gallery"
					id="gallery"
					class:btn-outline={!show.gallery}
					class="h-12 w-60 btn btn-outline btn-secondary"
					on:click={updateShow}
				>
					Gallery
				</button>
				<div class="form-control">
					<label class="flex items-center justify-center gap-2 cursor-pointer label">
						<input
							name="galleryTile"
							id="galleryTile"
							type="checkbox"
							class="bg-primary checkbox checkbox-success checkbox-sm"
							bind:checked={show.galleryTile}
							on:click={updateShow}
						/>
						<span class="font-semibold">Tile</span>
					</label>
				</div>
			</span>
			<button
				name="now"
				id="now"
				class:btn-outline={!show.now}
				class="h-12 w-60 btn btn-outline btn-accent"
				on:click={updateShow}
			>
				Now
			</button>
		</div>
		<div id="reset" class="flex items-center gap-2">
			<button class="btn btn-error btn-outline btn-xs" on:click={resetShowStates}>
				wtf...
			</button>
			<p class="text-xs">
				Click to reset if it's being stupid. Won't reset image selections below.
			</p>
		</div>
		<div id="add-images" class="">
			<div
				class="flex flex-row items-center justify-start gap-4 px-8 min-h-8 rounded-t-xl tabs bg-neutral-focus"
				class:rounded-b-xl={!showAdd}
			>
				<!-- class:pb-0={showAdd} -->
				<!-- <p class="mb-1 mr-4 font-bold">Add Images . . .</p> -->
				<button class=" btn btn-xs btn-neutral" on:click={() => (showAdd = !showAdd)}>
					<span class="text-gray-200">Add Images...</span>
				</button>
				{#if showAdd}
					<a class="tab" class:active={tab === 0} on:click={() => (tab = 0)} href={''}>
						Just One
					</a>
					<a class="tab" class:active={tab === 1} on:click={() => (tab = 1)} href={''}>
						Many
					</a>
					<!-- <a class="tab" class:active={tab === 2} on:click={() => (tab = 2)} href={''}>
					from Google Drive
					</a> -->
				{/if}
			</div>
			{#if showAdd}
				<div
					class="w-full rounded-t-none shadow-xl card bg-neutral"
					transition:fly={{ y: -10 }}
					class:h-0={!showAdd}
				>
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
								<div class="">
									Enter a list, one per line (title optional):
									<pre
										data-prefix=""
										class="p-1 mt-2 text-sm bg-black border rounded-lg border-cyan-900 w-fit"><code> <span
												class="font-bold">URL, Title</span
											> </code></pre>
								</div>
								<textarea
									rows="5"
									class="textarea textarea-bordered"
									placeholder=""
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
			{/if}
		</div>
		<div class="hidden shadow-xl card bg-neutral">
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

		<section id="image-list" class="">
			<div class="flex justify-start gap-16 mb-8">
				<div class="form-control">
					<label class="items-center gap-2 cursor-pointer label">
						<input
							type="checkbox"
							class="toggle toggle-xs bg-primary"
							bind:checked={pref.tiles}
						/>
						<span class="label-text">{pref.tiles ? 'Tiles' : 'List'}</span>
					</label>
				</div>
				<div class="flex flex-row items-center justify-start gap-4">
					<p class="">Clear all:</p>
					<button
						class="text-gray-800 btn btn-xs btn-neutral"
						on:click={() => {
							clear('carousel')
						}}
					>
						<span class="label-text">Carousel</span>
					</button>
					<button
						class="text-gray-800 btn btn-xs btn-neutral"
						on:click={() => clear('gallery')}
					>
						<span class="label-text">Gallery</span>
					</button>
					<button class="text-gray-800 btn btn-xs btn-neutral" on:click={() => {}}>
						<span class="label-text">Now</span>
					</button>
				</div>
			</div>
			{#if images?.length > 0}
				<div id="list-container" class="w-full" transition:fly>
					{#if pref.tiles}
						<div
							id="list-cont"
							class="flex flex-row flex-wrap justify-start w-full gap-6"
						>
							{#each images as image, idx (image.id)}
								{@const url = debug ? 'https://dummyimage.com/144' : image.url}
								<!-- <Icon src={XMark} class="w-4 h-4 mr-2 font-bold text-red-600" /> -->
								<!-- svelte-ignore a11y-img-redundant-alt -->
								<span
									id="list-tiles"
									class="flex flex-col p-4 border bg-stone-800 border-stone-600"
								>
									<div class="flex justify-between">
										<br />
										<button class="p-1" on:click={() => imageDelete(image, idx)}
											><svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												fill="currentColor"
												class="w-6 h-6 p-0.5 text-gray-500 transition-all rounded hover:bg-red-800 hover:text-white"
											>
												<path
													fill-rule="evenodd"
													d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
													clip-rule="evenodd"
												/>
											</svg>
										</button>
									</div>
									<img
										src={url}
										alt="image"
										class="z-0 object-cover object-top w-48 h-36 rounded-2xl"
									/>
									<!-- <a href={image.url} class="" target="_blank">
									<div class="relative">
										<button
											class="absolute top-0 right-0 z-10 p-1 transition-all hover:bg-red-900"
											on:click={() => imageDelete(image, idx)}>❌</button
										>
										<img
											src={url}
											alt="image"
											class="z-0 object-cover object-top w-48 h-36 rounded-2xl"
										/>
									</div>
								</a> -->
									<div class="flex items-center justify-start gap-2 py-4">
										<button
											class="p-1 transition-all hover:bg-blue-600"
											class:bg-blue-700={showTitleEdit === idx}
											on:click={() => {
												showTitleEdit === -1
													? (showTitleEdit = idx)
													: (showTitleEdit = -1)
											}}>✏️</button
										>
										{#if showTitleEdit !== idx}
											<a class="font-md w-28">{image.title || ''}</a>
										{:else}
											<form on:submit={() => titleEdit(image)} class="">
												<input
													autofocus
													type="text"
													placeholder="Title"
													class="input input-xs input-bordered input-neutral w-28"
													bind:value={image.title}
													on:keydown={e => {
														if (e.key === 'Escape') {
															showTitleEdit = -1
														}
													}}
												/>
											</form>
										{/if}
									</div>
									<div class="flex flex-row justify-between gap-2">
										<button
											class="font-normal text-gray-800 capitalize btn btn-xs font-xs"
											class:unselected={!image.carousel}
											class:btn-primary={image.carousel}
											on:click={() =>
												parameter({ ...image, carousel: !image.carousel })}
										>
											<span class="label-text">Carousel</span>
										</button>
										<button
											class="font-normal text-gray-800 capitalize btn btn-xs font-xs"
											class:unselected={!image.gallery}
											class:btn-secondary={image.gallery}
											on:click={() => setGalleryItem(image)}
										>
											<span class="label-text">Gallery</span>
										</button>
										<button
											class="font-normal text-gray-800 capitalize btn btn-xs font-xs"
											class:unselected={!image.now}
											class:btn-accent={image.now}
											on:click={() =>
												parameter({ ...image, now: !image.now })}
										>
											<span class="label-text">Now</span>
										</button>
									</div>
								</span>
							{/each}
						</div>
					{:else}
						<ul
							id="list-list"
							class="flex flex-wrap justify-start divide-y divide-stone-700 gap-x-12"
						>
							{#each images as image, idx (image.id)}
								{@const url = debug ? 'https://dummyimage.com/32' : image.url}

								<!-- svelte-ignore a11y-img-redundant-alt -->
								<li
									class="relative flex flex-row items-center gap-4 p-2 border-t border-stone-700"
								>
									<button
										class="p-1 transition-all hover:bg-blue-600"
										class:bg-blue-700={showTitleEdit === idx}
										on:click={() => {
											showTitleEdit === -1
												? (showTitleEdit = idx)
												: (showTitleEdit = -1)
										}}>✏️</button
									>
									{#if showTitleEdit !== idx}
										<!-- svelte-ignore a11y-mouse-events-have-key-events -->
										<a
											href={image.url}
											class="flex flex-row items-center gap-2"
											target="_blank"
										>
											<img
												src={url}
												alt="image"
												class="object-cover object-top w-8 h-8 rounded"
												on:mouseenter={() => {
													showHover = idx
												}}
												on:mouseout={() => {
													showHover = -1
												}}
											/>
											<p class="w-28 font-md">{image.title || ''}</p>
										</a>
									{:else}
										<span class="flex flex-row items-center gap-2">
											<img
												src={url}
												alt="image"
												class="object-cover object-top w-8 h-8 rounded"
											/>
											<form on:submit={() => titleEdit(image)} class="">
												<input
													autofocus
													type="text"
													placeholder="Title"
													class="w-28 input input-sm input-bordered input-neutral"
													bind:value={image.title}
													on:keydown={e => {
														if (e.key === 'Escape') {
															showTitleEdit = -1
														}
													}}
												/>
											</form>
										</span>
									{/if}
									<!-- <div class="flex flex-col gap-2"> -->
									{#if showHover === idx}
										<img
											src={url}
											alt="image"
											class="absolute z-10 object-cover object-top w-48 h-48 left-28 rounded-2xl"
										/>
									{/if}
									<button
										class="text-gray-800 btn btn-xs font-xs"
										class:unselected={!image.carousel}
										class:btn-primary={image.carousel}
										on:click={() =>
											parameter({ ...image, carousel: !image.carousel })}
									>
										<span class="label-text">Carousel</span>
									</button>
									<button
										class="text-gray-800 btn btn-xs font-xs"
										class:unselected={!image.gallery}
										class:btn-secondary={image.gallery}
										on:click={() => setGalleryItem(image)}
									>
										<!-- on:click={() =>
											parameter({ ...image, gallery: !image.gallery })
											} -->
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
				</div>
			{/if}
		</section>
	</div>
{/if}

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
