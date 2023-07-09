<script lang="ts">
	import { Icon } from '@steeze-ui/svelte-icon'
	import { Check, XMark } from '@steeze-ui/heroicons'
	import { onMount } from 'svelte'
	import { doc, getDoc, updateDoc } from 'firebase/firestore'
	import { db } from '$lib/firebase'
	import { dbUser } from '$lib/firestore'

	import type { PageData } from './$types'
	export let data: PageData

	const viewersRef = doc(db, `viewers/${$dbUser?.id}`)

	let {
		viewer,
		viewer: { images },
	} = data

	let newurl = '',
		urlValid = false

	const addOne = (incoming: string) => {
		//
		updateDoc(viewersRef, { images: [...viewer.images, incoming] })
	}

	function handleInputChange(e: KeyboardEvent) {
		const regex = new RegExp(
			/^(ftp|http|https|chrome|:\/\/|\.|@){2,}(localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|\S*:\w*@)*([a-zA-Z]|(\d{1,3}|\.){7}){1,}(\w|\.{2,}|\.[a-zA-Z]{2,3}|\/|\?|&|:\d|@|=|\/|\(.*\)|#|-|%)*$/gmu,
		)
		let item = e.target!.value

		if (regex.test(item)) {
			urlValid = true
		} else {
			urlValid = false
		}

		if (e.code === 'Enter') {
			// enter
			addOne(item)
			newurl = ''
		}

		if (e.code === 'Escape') {
			// esc
			newurl = ''
		}
	}

	const imageDelete = (image: string) => {
		const remv = images.indexOf(image)
		const newimages = images.splice(remv, 1)
		updateDoc(viewersRef, { images: newimages })
		images = newimages
	}

	$: images = images

	// onMount(async () => {
	// 	const viewRef = doc(db, `viewers/${dbUser.id}`)
	// 	viewer = await getDoc(viewRef)
	// 		.then(doc => ({ ...doc.data(), id: doc.id }))
	// 		.catch(err => console.error(err, JSON.stringify(err)))
	// 	return { viewer }
	// })

	$: console.log(`LOG..+page: viewer`, viewer, viewer?.images)
</script>

<div class="flex flex-col gap-10">
	<div class="flex items-center justify-start gap-2">
		<input
			type="url"
			placeholder="Image URL"
			class="w-full max-w-xs input-sm input input-bordered input-primary"
			bind:value={newurl}
			on:keyup={handleInputChange}
		/>

		<div class="justify-start w-8 text-sm">
			{#if newurl && urlValid}
				<!-- <span class="flex w-min"> -->
				<!-- <Icon src={Check} class="mr-2 text-green-400" /> -->
				<kbd class="kbd kbd-sm min-w-min">Enter</kbd>
				<!-- </span> -->
			{:else if newurl && !urlValid}{/if}
		</div>
	</div>
	<div class="flex flex-row gap-6">
		{#if viewer?.images}
			{#each viewer.images as image}
				<!-- <Icon src={XMark} class="w-4 h-4 mr-2 font-bold text-red-600" /> -->
				<!-- svelte-ignore a11y-img-redundant-alt -->
				<span class="flex flex-col">
					<div class="flex justify-between">
						<a href={''} on:click={() => imageDelete(image)}>❌</a>
					</div>
					<img
						src={image}
						alt="image"
						class="object-cover object-top w-24 h-24 rounded-2xl"
					/>
				</span>
			{/each}
		{/if}
	</div>
</div>
