<script lang="ts">
	import { browser } from '$app/environment'
	import { onMount, createEventDispatcher } from 'svelte'
	import { page } from '$app/stores'
	// import Packery from 'packery'

	const uid = $page.params.id
	const dispatch = createEventDispatcher()

	export let gallery: Image[] = []
	export let presentGallery: Image[] = []
	export let packWrap: HTMLSpanElement
	let Packery
	onMount(async () => {
		const module = await import('packery')
		Packery = module.default
		// console.log(`LOG..GalleryTiler: Packery`, Packery)
		const pk = new Packery(packWrap, {
			itemSelector: '#brickitem',
			gutter: 0,
			percentPosition: true,
		})
	})

	$: if (browser) {
		// const Packery = import('packery')
		// debugger
		// packery = new Packery(packWrap, {
		// 	itemSelector: '#brickitem',
		// 	gutter: 0,
		// 	percentPosition: true,
		// })
		// packery.addItems(gallery)
		// import('packery')
		// 	.then(Packery => {
		// 		// debugger
		// 		const pk = new Packery(packWrap, {
		// 			itemSelector: '#brickitem',
		// 			gutter: 0,
		// 			percentPosition: true,
		// 		})
		// 		pk.addItems(gallery)
		// 	})
		// 	.catch(err => {
		// 		console.warn(`LOG..GalleryTile: err`, err)
		// 	})
	}

	// on:click={()=> dispatch('imageClick', img)}
</script>

<div class="" bind:this={packWrap}>
	{#each presentGallery as img, idx (img.id)}
		<img src={img.url} alt="" class="w-48 h-48" id="brickitem" />
	{/each}
</div>

<style>
</style>
