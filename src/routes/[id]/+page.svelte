<script lang="ts">
	import { Icon } from '@steeze-ui/svelte-icon'
	import { Check, XMark } from '@steeze-ui/heroicons'
	import { onMount } from 'svelte'
	import { doc, getDoc } from 'firebase/firestore'
	import { db } from '$lib/firebase'
	import { dbUser } from '$lib/firestore'

	import type { PageData } from './$types'
	export let data: PageData

	const regex = new RegExp(
		/^(ftp|http|https|chrome|:\/\/|\.|@){2,}(localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|\S*:\w*@)*([a-zA-Z]|(\d{1,3}|\.){7}){1,}(\w|\.{2,}|\.[a-zA-Z]{2,3}|\/|\?|&|:\d|@|=|\/|\(.*\)|#|-|%)*$/gmu,
	)

	let newurl = '',
		urlValid = false

	let viewer = {}

	const addNew = (incoming: string) => {
		//
		console.log(`LOG..+page: incoming`, incoming)
	}

	function handleInputChange(e: KeyboardEvent) {
		let item = e.target!.value

		if (regex.test(item)) {
			urlValid = true
		} else {
			urlValid = false
		}

		if (e.code === 'Enter') {
			// enter
			addNew(item)
			newurl = ''
		}

		if (e.code === 'Escape') {
			// esc
			newurl = ''
		}
	}

	// onMount(async () => {
	// 	const viewRef = doc(db, `viewers/${dbUser.id}`)
	// 	viewer = await getDoc(viewRef)
	// 		.then(doc => ({ ...doc.data(), id: doc.id }))
	// 		.catch(err => console.error(err, JSON.stringify(err)))
	// 	return { viewer }
	// })

	$: console.log(`LOG..+page: data`, data)
</script>

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
		{:else if newurl && !urlValid}
			<Icon src={XMark} class="mr-2 text-red-600" />
		{/if}
	</div>
</div>
