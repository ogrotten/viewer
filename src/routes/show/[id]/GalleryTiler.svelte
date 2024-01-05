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

	let Packery, pk
	onMount(async () => {
		const module = await import('packery')
		Packery = module.default
		pk = new Packery(packWrap, {
			itemSelector: '#brickitem',
			gutter: 0,
			percentPosition: true,
		})
	})

	$: if (pk) {
		console.log(`LOG..GalleryTiler: pk`, pk.getItemElements()[0].naturalWidth)
	}

	// on:click={()=> dispatch('imageClick', img)}
</script>

<div class="" bind:this={packWrap} id="packWrap">
	{#each presentGallery as img, idx (img.id)}
		<div class="relative">
			<img src={img.url} alt="" class="z-0 w-48 h-48" id="brickitem" />
		</div>
	{/each}
</div>

<style>
</style>
