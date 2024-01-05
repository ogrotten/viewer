<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte'
	import { page } from '$app/stores'
	import Packery from 'packery'

	const uid = $page.params.id
	const dispatch = createEventDispatcher()

	export let gallery: Image[] = []
	export let presentGallery: Image[] = []

	onMount(() => {})

	// on:click={()=> dispatch('imageClick', img)}
</script>

<span class="flex flex-wrap">
	{#each presentGallery as img, idx (img.id)}
		<img src={img.url} alt="" class="" />
	{/each}
</span>

<style>
	#brickitem {
		@apply w-full h-fit object-contain;
		@apply px-0 pb-0;
	}
	.brickcol {
		@apply box-border p-0;
	}
</style>
