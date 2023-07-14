<script lang="ts">
	import { Icon } from '@steeze-ui/svelte-icon'
	import { Check, XMark } from '@steeze-ui/heroicons'
	import { onMount } from 'svelte'
	import { addDoc, collection, doc, query, onSnapshot, getDocs } from 'firebase/firestore'
	import { db } from '$lib/firebase'
	import { dbUser } from '$lib/firestore'

	let images: Image[]

	let newImg: Image = {
			url: '',
			carousel: false,
			gallery: false,
			now: false,
			title: '',
		},
		urlValid = false

	const addOne = async (incoming: Image) => {
		// Add a new document with a generated id.
		console.log(`LOG..+page: addOne`, incoming)
		const docRef = await addDoc(collection(db, `viewers/${$dbUser?.uid}/images`), incoming)
		images = [...images, incoming]
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

	const imageDelete = (image: {}) => {}

	$: if ($dbUser?.id) {
		const querySnapshot = getDocs(collection(db, 'viewers', $dbUser?.uid, 'images')).then(
			querySnapshot => {
				console.log(`LOG..+page: begin`, querySnapshot)

				images = [...querySnapshot.docs.map(doc => doc.data())]
			},
		)
	}

	// console.log(`LOG..+page: querySnapshot`, querySnapshot)

	onMount(async () => {})

	$: console.log(`LOG..+page: WATCH`, images)
</script>

<div class="flex flex-col gap-10">
	<div class="flex items-center justify-start gap-2">
		<input
			type="title"
			placeholder="Title (optional)"
			class="w-full max-w-xs input-sm input input-bordered input-primary"
			bind:value={newImg.title}
		/>
		<input
			type="url"
			placeholder="Image URL"
			class="w-full max-w-xs input-sm input input-bordered input-primary"
			bind:value={newImg.url}
			on:change={handleInputChange}
		/>

		<button class="btn btn-primary btn-sm" disabled={!urlValid} on:click={() => addOne(newImg)}>
			Add
		</button>
	</div>
	<div class="flex flex-row gap-6">
		{#if images?.length > 0}
			{#each images as image}
				<!-- <Icon src={XMark} class="w-4 h-4 mr-2 font-bold text-red-600" /> -->
				<!-- svelte-ignore a11y-img-redundant-alt -->
				<span class="flex flex-col">
					<div class="flex justify-between">
						<a href={''} on:click={() => imageDelete(image)}>❌</a>
					</div>
					<img
						src={image.url}
						alt="image"
						class="object-cover object-top w-36 h-36 rounded-2xl"
					/>
					<div class="flex flex-col">
						<p class="h-8">{image.title || ''}</p>
						<label class="cursor-pointer label">
							<input type="checkbox" checked={image.carousel} />
							<span class="label-text">Carousel?</span>
						</label>
					</div>
				</span>
			{/each}
		{/if}
	</div>
</div>
