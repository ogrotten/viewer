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
		query,
		onSnapshot,
	} from 'firebase/firestore'
	import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'

	import type { UserWithMeta, Image, UserPref } from '$lib/types'
	import FileUpload from '../_components/FileUpload.svelte'

	const debug = false
	let setupLink = `${$page.url.origin}/show/`
	let loading = true,
		showAdd = false,
		linkcopied = false,
		idcopied = false

	let images: Image[],
		pref: UserPref = {
			carouselTime: 0,
			carouselTransitionTime: 0,
			tiles: false,
			favorites: [],
			sort: false,
			sortType: 'recent',
		}
	const sortTypes = [
		{ name: 'Title Text', value: 'title' },
		{ name: 'Date Added', value: 'added' },
		{ name: 'Most Recent Activity', value: 'recent' },
	]

	let newImg: Image = {
			url: '',
			carousel: false,
			gallery: false,
			now: false,
			title: '',
			id: '',
			index: Date.now(),
			added: Date.now(),
		},
		urlValid = false,
		many = '',
		manyFiltered: Image[],
		google = ''

	let show = {
			gallery: false,
			now: false,
			carousel: false,
			galleryTile: false,
			orient: 'grid',
		},
		tab = 1,
		disableNow = false

	let orientOptions = ['grid', 'square', 'wide', 'tall']

	let allusers: UserWithMeta[] = [],
		viewerId: string,
		isAdmin = $dbUser?.role === 'admin'

	let showHover = -1

	let nameFilter = ''

	const filterByName = e => {
		console.log(`LOG..+page: `)
		viewerImages = images.filter(image =>
			image.title.toLocaleLowerCase().includes(nameFilter.toLocaleLowerCase()),
		)
	}

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
			setupLink += $dbUser?.id
		}
	})

	async function setup() {
		viewerId = $dbUser?.uid

		await Promise.all([
			getImages(),
			getPrefs(),
			getDoc(doc(db, 'viewers', $dbUser?.uid)).then(doc => {
				show = doc.data()
			}),
		]).then(() => {
			loading = false
			changeSort(pref.sortType)
		})

		if ($dbUser.role === 'admin') {
			getDocs(collection(db, 'users')).then(querySnapshot => {
				allusers = [...querySnapshot.docs].map(doc => ({ ...doc.data(), id: doc.id }))
				allusers.sort((a, b) => a.name.localeCompare(b.name))
			})
		}
	}

	let unsubAllImages

	const selectViewerId = e => {
		viewerId = e.target.value
		getImages()
	}

	async function getImages() {
		const querySnapshot = query(collection(db, 'viewers', viewerId, 'images'))
		unsubAllImages = onSnapshot(querySnapshot, snap => {
			images = [...snap.docs]
				.map(doc => ({ ...doc.data(), id: doc.id }))
				.sort((a, b) => a.added - b.added)
			changeViewerTab(viewerTabOptions[viewerTab])
		})
		resetImage()
	}

	const addOne = async (incoming: Image) => {
		// Add a new document with a generated id.
		// const docRef =
		await addDoc(collection(db, `viewers/${$dbUser?.uid}/images`), incoming).then(docRef => {
			console.log(`LOG..+page: Document written with ID: ${docRef.id}`)
			getImages()
		})
		// getImages()
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
		showTitleEdit = -1
		updateDBImage(img)
	}

	const updateDBImage = (incoming: Image) => {
		updateDoc(doc(db, 'viewers', $dbUser?.uid, 'images', incoming.id), incoming).then(() => {
			getImages()
		})
	}

	async function parameter(image: Image) {
		// if (!image.added) image.added = Date.now()
		if (image.now) {
			const { id } = image
			images.forEach((img, idx) => {
				if (img.now && img.id !== id) {
					img.now = false
					updateDoc(doc(db, 'viewers', $dbUser?.uid, 'images', img.id), img)
				}
			})
		}
		image.index = Date.now()
		console.log(`LOG..+page: image`, image)
		updateDoc(doc(db, 'viewers', $dbUser?.uid, 'images', image.id), image).then(() => {
			getImages()
		})
	}

	function updateShow(e: Event & { target: HTMLButtonElement }) {
		const { name } = e.target
		if (name === 'orient') show[name] = e.target.value
		else if (name === 'zoom') show[name] = zoomRange.outgoing
		else if (name === 'carouselTime') show[name] = carouselTime.current
		else show[name] = !show[name]
		updateDoc(doc(db, 'viewers', $dbUser?.uid), { [name]: show[name] })
	}

	const clear = (incoming: string) => {
		if (incoming === 'favorites') {
			pref.favorites = []
			updatePrefs()
			return
		}

		const filteredImages = images
			.filter(image => image[incoming])
			.forEach(image => {
				parameter({ ...image, [incoming]: false })
				show[incoming] = false
				updateDoc(doc(db, 'viewers', $dbUser?.uid), { [incoming]: false })
			})
	}

	const resetShowStates = () => {
		show = { gallery: false, now: false, carousel: false, galleryTile: false }
		updateDoc(doc(db, 'viewers', $dbUser?.uid), {
			carousel: false,
			gallery: false,
			now: false,
			// galleryTile: true,
		})
	}

	const setGalleryItem = (image: Image) => {
		if (image.gallery) {
			image.gallery = false
		} else {
			image.gallery = true
		}
		// return
		parameter(image)
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
			.filter(item => item?.length > 0)
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
	const updateImage = ({ e, idx }) => {
		if (images[idx].width) return
		images[idx].width = e.target.naturalWidth
		images[idx].height = e.target.naturalHeight

		updateDoc(doc(db, 'viewers', $dbUser?.uid, 'images', images[idx].id), images[idx])
	}

	const getPrefs = async () => {
		if (!$dbUser?.uid) return
		await getDoc(doc(db, 'users', $dbUser?.uid)).then(doc => {
			pref = doc.data().pref || pref
			console.log(`LOG..+page: `)
		})
	}

	const updatePrefs = () => {
		updateDoc(doc(db, 'users', $dbUser?.uid), { pref: pref })
		changeViewerTab(viewerTabOptions[viewerTab])
	}

	const viewerTabOptions = [
		{ name: 'All' },
		{ name: 'Favorites' },
		{ name: 'Carousel' },
		{ name: 'Gallery' },
	]

	$: viewerTabOptions.forEach((option, idx) => {
		option.value = idx
	})

	let viewerTab: number = 0,
		viewerImages: Image[]

	$: if (images?.length === 0 && !loading) viewerTab = 0

	function changeViewerTab(tab) {
		viewerTab = tab?.value ?? 0

		if (viewerTab === 0) viewerImages = [...images]

		if (viewerTab === 1)
			viewerImages = [...images].filter(image => pref.favorites.includes(image.id))

		if (viewerTab > 1)
			viewerImages = [...images.filter(image => image[tab?.name?.toLowerCase()])]

		changeSort(pref.sortType)
	}

	const imageFave = (image, idx) => {
		if (pref.favorites.includes(image.id)) {
			pref.favorites = pref.favorites.filter(id => id !== image.id)
		} else {
			throbId = image.id
			throb = true
			pref = { ...pref, favorites: [...pref.favorites, image.id] }
		}
		updatePrefs()
	}

	// $: pref.sort
	// 	? (viewerImages = [...viewerImages].sort((a, b) => b.added - a.added))
	// 	: (viewerImages = [...viewerImages].sort((a, b) => b.index - a.index))

	const changeSort = value => {
		// console.log(`LOG..+page: e.target.value`, e.target.value)

		switch (value) {
			case 'title':
				viewerImages = viewerImages.sort((a, b) => a.title.localeCompare(b.title))
				const notitles = viewerImages.filter(image => !image.title)
				viewerImages = [...viewerImages.filter(image => image.title), ...notitles]
				break
			case 'added':
				viewerImages = viewerImages.sort((a, b) => b.added - a.added)
				break
			case 'recent':
				viewerImages = viewerImages.sort((a, b) => b.index - a.index)
				break
			default:
				console.log(`LOG..+page: woops sort`)
				break
		}
		nameFilter = ''
	}

	let throbId
	$: if (throb) {
		setTimeout(() => {
			throb = false
		}, 100)
	}

	let throb = false
	let zoomRange = {
		min: 4,
		max: 12,
		current: 8,
		outgoing: 8,
	}

	const changeZoom = e => {
		zoomRange.outgoing = zoomRange.max - e.target.value + zoomRange.min
		updateShow(e)
	}

	let carouselTime = {
		min: 5,
		max: 30,
		current: 20,
	}

	const changeTime = e => {
		carouselTime.current = e.target.value
		updateShow(e)
	}

	const modifyDimension = e => {
		const { name } = e.target
		const image = viewerImages.find(image => image.id === throbId)
		// updateDoc(doc(db, 'viewers', $dbUser?.uid, 'images', image.id), image)
	}

	$: if (!loading) console.time('load')
	$: if (images?.length > 0) console.timeEnd('load')

	$: console.log(`LOG..+page: `, pref.sortType)

	/**
	 *
	 *  storage uploading
	 *
	 */

	const storage = getStorage()
	let showUpload = true
	let upPct = 0
	let doReset = false

	const upImages = files => {
		showUpload = false
		console.log(`LOG..+page: files`, files)
		// const vRef = ref(storage, `viewers/${$dbUser?.uid}`)
		let count = 0

		files.forEach(async (f, idx) => {
			// const imgRef = ref(vRef, f.name)
			const imgRef = ref(storage, `viewers/${$dbUser?.uid}/${f.name}`)
			console.log(`LOG..+page: imgRef`, imgRef)
			uploadBytes(imgRef, f)
				.then(snapshot => {
					console.log(`LOG..+page: snapshot`, snapshot)
					upPct = Math.ceil(((count + 1) / files.length) * 100)
					count++
					return getDownloadURL(imgRef)
				})
				.then(url => {
					return addOne({
						url,
						carousel: false,
						gallery: false,
						now: false,
						title: '',
						id: '',
						index: Date.now(),
						added: Date.now(),
					})
				})
				.catch(e => {
					console.error(`LOG..+page: e`, e)
				})
		})
	}

	$: console.log(`LOG..+page: showUpload`, showUpload)
</script>

<svelte:window
	on:keydown={e => {
		if (e.key === 'Escape') showTitleEdit = -1
	}}
/>

{#if loading && unsubAllImages}
	<div transition:fade class="absolute flex items-center justify-center w-screen">
		<div class="m-auto loading loading-bars loading-lg" />
	</div>
{:else}
	<div transition:fade class="flex flex-row gap-10">
		<!-- SIDE PANEL -->
		<div class="space-y-8 min-w-[300px]">
			<div class="space-y-8">
				<div class="m-auto">
					<button
						class="z-50 transition-all border border-success btn-outline btn-success btn-sm"
						on:click={() => {
							navigator.clipboard.writeText(setupLink).then(() => {})
							linkcopied = true
						}}
					>
						🔗 Click to copy live show link.
					</button>
					{#if linkcopied}
						<button
							class="z-0 font-bold transition duration-200 border pointer-events-none border-success btn-outline btn-success btn-xs"
							transition:fly={{ x: -20 }}
						>
							👍 Copied!
						</button>
					{/if}
				</div>
				<div class="">
					<div
						class="flex flex-col items-center gap-4 p-8 bg-opacity-25 rounded-t-lg bg-primary"
					>
						<button
							name="carousel"
							id="carousel"
							class:btn-outline={!show.carousel}
							class="w-full h-12 btn btn-outline btn-info"
							on:click={updateShow}
						>
							Carousel
						</button>
						<div class="flex flex-col w-full gap-1">
							<div class="flex items-center justify-between">
								<p class="scale-75 label-text">:{carouselTime.min}</p>
								<p class=" label-text">·</p>
								<p class=" label-text">·</p>
								<p class=" label-text">·</p>
								<p class="-ml-3 -mr-3 scale-100 label-text">
									{carouselTime.current} sec
								</p>
								<p class=" label-text">·</p>
								<p class=" label-text">·</p>
								<p class=" label-text">·</p>
								<p class="scale-75 label-text">:{carouselTime.max}</p>
							</div>
							<input
								type="range"
								name="carouselTime"
								min={carouselTime.min}
								max={carouselTime.max}
								bind:value={carouselTime.current}
								class="w-full range range-info"
								on:mouseup={changeTime}
								step={1}
							/>
						</div>
					</div>
					<div class="flex flex-col items-center gap-4 p-8 bg-opacity-25 bg-secondary">
						<button
							name="gallery"
							id="gallery"
							class:btn-outline={!show.gallery}
							class="w-full h-12 btn btn-outline btn-secondary"
							on:click={updateShow}
						>
							Gallery
						</button>
						<div class="gap-4 form-control">
							<div class="join">
								{#each orientOptions as option}
									<button
										class="btn btn-xs join-item btn-secondary"
										name="orient"
										class:btn-outline={show.orient !== option}
										on:click={updateShow}
										value={option}
									>
										{option}
									</button>
								{/each}
							</div>
						</div>
						<div
							class="flex flex-col w-full gap-1"
							class:opacity-30={show.orient === 'wide' || show.orient === 'tall'}
						>
							<div class="flex items-center justify-between">
								<p class="scale-50 label-text">🟩</p>
								<p class=" label-text">·</p>
								<p class=" label-text">·</p>
								<p class=" label-text">·</p>
								<p class="-ml-3 -mr-3 scale-75 label-text">Zoom</p>
								<!-- <p class="scale-75 label-text">🟩</p> -->
								<p class=" label-text">·</p>
								<p class=" label-text">·</p>
								<p class=" label-text">·</p>
								<p class="scale-100 label-text">🟩</p>
							</div>
							<input
								type="range"
								name="zoom"
								disabled={show.orient === 'wide' || show.orient === 'tall'}
								min={zoomRange.min}
								max={zoomRange.max}
								bind:value={zoomRange.current}
								class="w-full range"
								class:range-secondary={show.orient === 'grid' ||
									show.orient === 'square'}
								on:mouseup={changeZoom}
								step={1}
							/>
						</div>
					</div>
					<div class="p-8 bg-opacity-25 rounded-b-lg bg-accent">
						<button
							name="now"
							id="now"
							class:btn-outline={!show.now}
							class="w-full h-12 btn btn-outline btn-accent"
							on:click={updateShow}
						>
							Now
						</button>
					</div>
				</div>
				<!-- <div id="add-images" class="mb-8">
					<div class="flex items-center justify-between p-4 rounded-lg bg-neutral-focus">
						<div class="flex flex-row items-center justify-start w-full gap-8">
							<button
								class=" btn btn-xs btn-neutral"
								on:click={() => (showAdd = !showAdd)}
							>
								<div class="text-neutral-content">
									{showAdd ? 'Cancel' : 'Add Images'}
								</div>
							</button>
							{#if showAdd}
								{#each ['Just One', 'Many'] as item, idx}
									<div class="flex items-center justify-start h-4 text-sm">
										<a
											class="text-secondary-focus"
											class:underline={tab === idx}
											on:click={() => (tab = idx)}
											href={''}
										>
											{item}
										</a>
									</div>
								{/each}
							{/if}
						</div>
					</div>
					{#if showAdd}
						<div
							class="w-full rounded-t-none shadow-xl card bg-neutral"
							transition:fly={{ y: -10 }}
							class:h-0={!showAdd}
						>
							<div class="p-4">
								{#if tab === 0}
									<div class="flex flex-col gap-4" in:fly>
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
											<p class="">
												Enter a list, one per line (title optional):
											</p>
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
									nothin
								{/if}
								<p class="pt-10">
									<span class="font-bold">Image URL</span> should have a file extension
									(.jpg, .png, etc.) and be a direct link to the image. If you're using
									Google Drive, make sure the link is public.
								</p>
							</div>
						</div>
					{/if}
				</div> -->
				<div id="reset" class="flex items-center gap-2">
					<button class="btn btn-error btn-outline btn-xs" on:click={resetShowStates}>
						wtf...
					</button>
					<p class="text-xs">
						Click to reset if it's being stupid. Won't reset image selections.
					</p>
				</div>

				<div class="min-h-max">
					{#if showUpload}
						<FileUpload
							on:change={() => console.log('Files changed')}
							maxFiles={100}
							callback={data => upImages(data)}
							fixed={false}
							doneText="Complete!"
							bind:reset={doReset}
						/>
					{:else}
						<div class="flex items-center justify-between">
							<progress
								class="w-4/5 progress progress-primary"
								value={upPct}
								max="100"
							/>
							<button
								class="btn btn-success btn-outline btn-xs"
								disabled={upPct !== 100}
								on:click={() => {
									showUpload = true
									doReset = true
									upPct = 0
								}}
							>
								OK
							</button>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- BODY -->
		<div class="flex flex-col gap-10 shrink">
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
									bind:value={pref.carouselTime}
								/>
							</div>
						</span>
						<span class="">
							<span class="pl-1 label-text">Transition time</span>
							<div class="w-20 form-control">
								<input
									type="number"
									placeholder="Image URL"
									class="w-full max-w-xs input-sm input input-bordered input-neutral"
									bind:value={pref.carouselTransitionTime}
								/>
							</div>
						</span>
					</div>
				</div>
			</div>

			{#if isAdmin}
				<div class="w-full p-6 border-2 card border-warning">
					<div class="flex items-center justify-start gap-4">
						<div class="btn btn-primary btn-outline btn-xs">Admin</div>
						<div class="flex items-center gap-4">
							<p class="font-bold">All Users</p>
							<select
								class="select select-bordered select-neutral"
								on:change={selectViewerId}
							>
								<option value="">Select a user</option>
								{#each allusers as user}
									<option value={user.uid}>{user.name}</option>
								{/each}
							</select>
						</div>
					</div>
				</div>
			{/if}
			<section id="image-list" class="">
				<div class="flex items-center justify-between">
					<div role="tablist" class="gap-4 tabs tabs-lifted tabs-xs">
						{#each viewerTabOptions as option}
							<a
								class="border rounded-t-lg opacity-75 tab border-secondary-focus hover:text-secondary-focus hover:opacity-100"
								class:active={viewerTab === option.value}
								on:click={() => changeViewerTab(option)}
								href={''}
							>
								{option.name}
							</a>
						{/each}
						{viewerImages?.length} / {images?.length}
					</div>
					{#if viewerTab !== 0 && viewerTab !== 99}
						<button
							class="w-48 transition-all btn btn-xs btn-warning btn-outline"
							on:click={() => {
								clear(viewerTabOptions[viewerTab].name.toLowerCase())
							}}
						>
							<span class="">
								Clear {viewerTabOptions[viewerTab].name}
							</span>
						</button>
					{/if}
				</div>
				{#if viewerImages}
					<!-- {@const viewerImages = getViewerImages(viewerTab)} -->
					<div
						id="list-container"
						class="w-full p-4 border border-secondary"
						transition:fly
					>
						<!-- {/if} -->

						<div class="flex items-center justify-start min-w-fit">
							<label
								class="items-center gap-2 cursor-pointer label min-w-fit"
								for="filterbyname"
							>
								<span class="min-w-max label-text">Filter by name: &nbsp;</span>
							</label>
							<input
								id="filterbyname"
								type="text"
								class="w-64 max-w-lg input-sm input input-bordered input-neutral"
								bind:value={nameFilter}
								on:change={filterByName}
								placeholder="Type partial match, press enter"
							/>
							{#if nameFilter?.length}
								<button
									class="-ml-6"
									on:click={() => {
										nameFilter = ''
										filterByName()
									}}
									>✖️
								</button>
							{/if}
							<!-- <label class="items-center gap-2 cursor-pointer label">
								<input
									type="checkbox"
									class="toggle toggle-xs bg-primary"
									on:change={e => {
										e.target.checked)
									}}
								/>
								bind:checked={pref.tiles}
								<span class="label-text"> Show Named Only </span>
							</label> -->
						</div>
						<div class="flex items-center justify-start gap-8">
							<div class="cursor-pointer w">
								<label class="items-center gap-2 cursor-pointer label">
									<!-- <input
										type="checkbox"
										class="toggle toggle-xs bg-primary"
										bind:checked={pref.sort}
										on:change={updatePrefs}
									/> -->
									<span class="label-text">
										Sort by: &nbsp;
										<!-- <span class="font-bold">
											{pref.sort ? 'Added' : 'Recent'}
										</span> -->
										<select
											class="select select-bordered select-sm select-neutral"
											on:change={e => {
												console.log(`LOG..+page: `)
												pref.sortType = e.target.value
												updatePrefs()
											}}
										>
											{#each sortTypes as t}
												<option
													value={t.value}
													selected={pref.sortType === t.value}
												>
													{t.name}
												</option>
											{/each}
										</select>
									</span>
								</label>
							</div>
							<div class="flex justify-start w-fit">
								<!-- <div class="form-control"> -->
								<label class="items-center gap-2 cursor-pointer label">
									<input
										type="checkbox"
										class="toggle toggle-xs bg-primary"
										bind:checked={pref.tiles}
										on:change={updatePrefs}
									/>
									<span class="label-text">
										Showing as:
										<span class="font-bold">
											{pref.tiles ? 'Tiles' : 'List'}
										</span>
									</span>
								</label>
								<!-- </div> -->
							</div>
						</div>
						{#if pref.tiles}
							<div
								id="list-cont"
								class="flex flex-row flex-wrap justify-start w-full gap-6"
							>
								{#each viewerImages as image, idx (image.id)}
									{@const url = debug ? 'https://dummyimage.com/144' : image.url}
									<!-- <Icon src={XMark} class="w-4 h-4 mr-2 font-bold text-red-600" /> -->
									<!-- svelte-ignore a11y-img-redundant-alt -->
									<span
										id="list-tiles"
										class="flex flex-col p-4 border bg-stone-800 border-stone-600"
									>
										<!-- transition:fly|local={{ x: -20 }} -->
										<div class="flex justify-between">
											<button
												class="relative"
												on:click={() => imageFave(image, idx)}
											>
												{#if pref.favorites?.includes(image.id)}
													<p class="z-10">❤️</p>
													{#if throbId === image.id}
														<p
															class="absolute left-0 z-0 top-1"
															class:throbOn={throb}
															class:throbOff={!throb}
														>
															🩷
														</p>
													{/if}
												{:else}
													<p class="z-10">🖤</p>
												{/if}
											</button>
											<button
												class="p-1"
												on:click={() => imageDelete(image, idx)}
											>
												<svg
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
											on:load={e => updateImage({ e, idx })}
										/>
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
													parameter({
														...image,
														carousel: !image.carousel,
													})}
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
										<div class="flex flex-row justify-between mt-4">
											<!-- <button
												class="font-normal text-gray-800 capitalize btn btn-xs font-xs"
												name="taller"
												class:unselected={!image.taller}
												class:btn-success={image.taller}
												on:click={() =>
													parameter({ ...image, taller: !image.taller })}
											>
											
											</button> -->
											<span class="flex items-center gap-2">
												<input
													type="checkbox"
													class="transition-all toggle toggle-xs"
													class:bg-primary={image.taller}
													class:bg-neutral={!image.taller}
													bind:checked={image.taller}
													on:click={() =>
														parameter({
															...image,
															taller: !image.taller,
														})}
												/>
												<span class="label-text">Taller</span>
											</span>
											<span class="flex items-center gap-2">
												<input
													type="checkbox"
													class="transition-all toggle toggle-xs"
													class:bg-primary={image.wider}
													class:bg-neutral={!image.wider}
													bind:checked={image.wider}
													on:click={() => {
														parameter({
															...image,
															wider: !image.wider,
														})
													}}
												/>
												<span class="label-text">Wider</span>
											</span>
										</div>
									</span>
								{/each}
							</div>
						{:else}
							<!-- svelte-ignore a11y-img-redundant-alt -->
							<!-- svelte-ignore a11y-mouse-events-have-key-events -->
							<ul
								id="list-list"
								class="flex flex-wrap justify-start gap-1 divide-stone-700"
							>
								{#each viewerImages as image, idx (image.id)}
									{@const url = debug ? 'https://dummyimage.com/32' : image.url}
									<li
										class="relative flex flex-row items-center w-[540px] gap-4 p-2 border border-stone-700"
									>
										<button
											class="relative"
											on:click={() => imageFave(image, idx)}
										>
											{#if pref.favorites?.includes(image.id)}
												<p class="z-10">❤️</p>
												{#if throbId === image.id}
													<p
														class="absolute left-0 z-0 top-1"
														class:throbOn={throb}
														class:throbOff={!throb}
													>
														🩷
													</p>
												{/if}
											{:else}
												<p class="z-10">🖤</p>
											{/if}
										</button>
										{#if showTitleEdit !== idx}
											<span class="flex flex-row items-center gap-2">
												<a href={image.url} class="" target="_blank">
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
														on:load={e => updateImage({ e, idx })}
													/>
												</a>
												<button
													class="p-1 transition-all opacity-50 hover:opacity-100"
													class:bg-blue-700={showTitleEdit === idx}
													on:click={() => {
														showTitleEdit === -1
															? (showTitleEdit = idx)
															: (showTitleEdit = -1)
													}}>✏️</button
												>
												<p class="w-28 font-md">{image.title || ''}</p>
											</span>
										{:else}
											<span class="flex flex-row items-center gap-2">
												<img
													src={url}
													alt="image"
													class="object-cover object-top w-8 h-8 rounded"
													on:load={e => updateImage({ e, idx })}
												/>
												<button
													class="w-8 h-8 p-1 transition-all opacity-50 hover:opacity-100"
													on:click={() => {
														showTitleEdit === -1
															? (showTitleEdit = idx)
															: (showTitleEdit = -1)
													}}>✅</button
												>
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
										{#if showHover === idx}
											<img
												src={url}
												alt="image"
												class="absolute z-10 object-cover object-top w-48 h-48 left-28 rounded-2xl"
											/>
										{/if}
										<span title={image.id}>
											<button
												class="text-gray-800 btn btn-xs font-xs"
												class:unselected={!image.carousel}
												class:btn-primary={image.carousel}
												on:click={() =>
													parameter({
														...image,
														carousel: !image.carousel,
													})}
											>
												<span class="label-text">Carousel</span>
											</button>
											<button
												class="text-gray-800 btn btn-xs font-xs"
												class:unselected={!image.gallery}
												class:btn-secondary={image.gallery}
												on:click={() => setGalleryItem(image)}
											>
												<span class="label-text">Gallery</span>
											</button>
											<button
												class="text-gray-800 btn btn-xs font-xs"
												class:unselected={!image.now}
												class:btn-accent={image.now}
												on:click={() =>
													parameter({ ...image, now: !image.now })}
											>
												<span class="label-text">Now</span>
											</button>
										</span>
										<!-- </div> -->
										<div class="flex justify-between">
											<button
												class="p-1 transition-all hover:bg-red-900"
												on:click={() => imageDelete(image, idx)}
											>
												❌
											</button>
										</div>
									</li>
								{/each}
							</ul>
						{/if}
					</div>
				{/if}
			</section>
		</div>
	</div>
{/if}

<style lang="postcss">
	.help p {
		@apply mt-4;
	}

	li {
		@apply ml-8 list-inside mt-2;
	}
	.help .headr {
		@apply text-lg font-bold mt-10;
	}
	button {
		@apply text-gray-800;
	}
	.unselected {
		@apply hover:bg-neutral-focus bg-neutral text-primary-content rounded-t-lg transition-opacity border-none opacity-75 hover:opacity-100;
		/* @apply btn-outline rounded-t-lg; */
	}
	.active {
		@apply bg-secondary-focus tab-active rounded-t-lg text-secondary-content hover:text-secondary-content border-none opacity-100;
	}

	.disable-clear {
		@apply pointer-events-none opacity-50;
	}

	.throbOn {
		@apply scale-100 opacity-100;
	}

	.throbOff {
		@apply scale-[200%] opacity-0 transition-all duration-[1000ms] ease-out;
	}
</style>
