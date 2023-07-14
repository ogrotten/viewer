<script lang="ts">
	import { Icon } from '@steeze-ui/svelte-icon'
	import { Check, XMark } from '@steeze-ui/heroicons'
	import { onMount } from 'svelte'
	import { addDoc, collection, doc, getDoc, updateDoc } from 'firebase/firestore'
	import { db } from '$lib/firebase'
	import { dbUser } from '$lib/firestore'

	const viewersRef = doc(db, `viewers/${$dbUser?.id}`)

	let viewer = {
		images: [],
	}

	let newImg: Image = {
			url: '',
			carousel: false,
			gallery: false,
			now: false,
			title: '',
		},
		urlValid = false

	const addOne = async (incoming: {}) => {
		// Add a new document with a generated id.
		console.log(`LOG..+page: $dbUser.id`, $dbUser)
		const docRef = await addDoc(collection(db, `viewers/${$dbUser?.uid}/images`), incoming)
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

	const imageDelete = (image: {}) => {
		const remv = viewer.images.indexOf(image)
		const newimages = viewer.images.splice(remv, 1)
		updateDoc(viewersRef, { images: newimages })
		images = newimages
	}

	getDoc(viewersRef).then(doc => {
		let M = doc.data()
		console.log(`LOG..+page: M`, M)
	})

	onMount(async () => {})

	$: console.log(`LOG..+page: WATCH`, $dbUser?.id)
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

		<button class="btn btn-primary btn-sm" disabled={!urlValid} on:click={addOne}> Add </button>
	</div>
	<div class="flex flex-row gap-6">
		{#if viewer?.images}
			{#each viewer.images as image}
				<!-- <Icon src={XMark} class="w-4 h-4 mr-2 font-bold text-red-600" /> -->
				<!-- svelte-ignore a11y-img-redundant-alt -->
				<span class="flex flex-col">
					<div class="flex justify-between">
						<br />
						<a href={''} on:click={() => imageDelete(image)}>❌</a>
					</div>
					<img
						src={image}
						alt="image"
						class="object-cover object-top w-36 h-36 rounded-2xl"
					/>
					<div class="">
						<label class="cursor-pointer label">
							<input
								type="checkbox"
								class="toggle toggle-xs toggle-secondary"
								checked
							/>
							<span class="label-text">Carousel?</span>
						</label>
					</div>
				</span>
			{/each}
		{/if}
	</div>
</div>
