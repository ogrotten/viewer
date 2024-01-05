<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte'
	import { page } from '$app/stores'
	import { cubicInOut } from 'svelte/easing'
	import fadeScale from '$lib/svelte-transitions-fade-scale.js'

	const uid = $page.params.id
	const dispatch = createEventDispatcher()

	export let gallery: Image[] = []
	let presentGallery: Image[] = []
	let localNow: Image[] = [],
		localShowNow = false

	onMount(() => {})

	$: if (gallery?.length < presentGallery?.length) {
		let galleryIds = gallery.map(x => x.id)
		let removed = presentGallery.filter(x => !galleryIds.includes(x.id))
		presentGallery
			.splice(presentGallery.indexOf(removed[0]), 1)
			.sort((a, b) => b.index - a.index)
	} else if (gallery?.length > presentGallery?.length) {
		presentGallery = gallery.sort((a, b) => b.index - a.index)
	}
</script>

<span class="flex flex-wrap">
	{#each presentGallery as img, idx (img.id)}
		<img src={img.url} alt="" class="" />
		<!-- style="width: {100 / gallery.length}%" -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<!-- <div
			class="h-screen transition-all duration-500 origin-center scale-100 bg-center bg-no-repeat hover:scale-95 group"
			class:bg-contain={gallery.length <= 2}
			class:bg-cover={gallery.length > 2}
			style="width: {100 / gallery.length}%; background-image: url({img.url})"
			on:click={() => dispatch('imageClick', img)}
		>
			{#if img.title}
				<p
					class="absolute bottom-0 left-0 w-full p-2 py-2 text-2xl font-bold text-center transition-all duration-500 opacity-50 group-hover:opacity-100 text-cyan-50"
					style="text-shadow: 2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;"
				>
					{img.title}
				</p>
			{/if}
		</div> -->
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
