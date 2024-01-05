<script lang="ts">
	import { browser } from '$app/environment'
	import { onMount, createEventDispatcher } from 'svelte'
	import { page } from '$app/stores'
	import type { Packery } from 'packery'
	// import Packery from 'packery'

	const uid = $page.params.id
	const dispatch = createEventDispatcher()

	export let gallery: Image[] = []
	export let presentGallery: Image[] = []
	export let packWrap: HTMLSpanElement

	let Packery, pk: Packery
	onMount(async () => {
		const module = await import('packery')
		Packery = module.default
		pk = new Packery(packWrap, {
			itemSelector: '#brickitem',
			gutter: 0,
			percentPosition: true,
		})
	})
	// $: console.log(`LOG..GalleryTiler: pk`, pk?.getItemElements().at(-1))

	let images = []
	$: if (pk && gallery) {
		// const newE = document.createElement('img')
		// newE.src = gallery[8].url
		// newE.id = 'brickitem'
		// newE.classList.add('z-0', 'w-48', 'h-48')
		// presentGallery = [...presentGallery, gallery[8]]

		pk.appended(images)
		debugger
	}
	const addOne = () => {
		const newE = document.createElement('img')
		newE.src = gallery[8].url
		newE.id = 'brickitem'
		newE.classList.add('z-0', 'w-48', 'h-48')
		// presentGallery = [...presentGallery, gallery[8]]
		pk.appended(newE)
		pk.layout()
		// debugger
		console.log(`LOG..GalleryTiler: `, pk?.getItemElements().at(-1))
	}

	$: if (gallery) pk?.layout()
</script>

<div class="hidden">
	{#each presentGallery as img, idx (idx)}
		<img bind:this={images[idx]} src={img.url} alt="" class="z-0 w-48 h-48" id="brickitem" />
	{/each}
</div>

<button class=" btn-primary" on:click={addOne}>addOne</button>
<div class="" bind:this={packWrap} id="packWrap">
	<!-- {#each presentGallery as img, idx (idx)}
		<div class="relative">
		<img src={img.url} alt="" class="z-0 w-48 h-48" id="brickitem" />
		</div>
	{/each} -->
</div>

<style>
</style>
