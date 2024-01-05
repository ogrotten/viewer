<script lang="ts">
	import { browser } from '$app/environment'
	import { list } from 'postcss'
	import { onMount } from 'svelte'
	// import Muuri from 'muuri'

	let loading = true

	export let gallery: Image[] = [],
		presentGallery: Image[] = []

	let images: HTMLImageElement[] = [],
		imgBase: HTMLImageElement

	const size = 300

	let muWrap: HTMLSpanElement

	let Muuri, mu: any
	onMount(async () => {
		const module = await import('muuri').then()
		Muuri = module.default
		mu = new Muuri(muWrap, {
			dragEnabled: true,
			items: '.item',
		})

		mu.on('layoutStart', i => {
			console.log('item-list: layoutStart', i)
		})
		mu.on('layoutEnd', i => {
			console.log('item-list: layoutEnd')
		})
	})

	$: if (mu && presentGallery.length) {
		images = gallery.map(incoming => {
			const img = imgBase.cloneNode() as HTMLImageElement
			img.src = incoming.url
			img.alt = incoming.title
			// img.classList.add('')
			return img
		})
		// debugger
		mu.add(images)
	}
</script>

<div class="hidden">
	<img bind:this={imgBase} src="" alt="" id="brickitem" />
</div>

<div class="" bind:this={muWrap} id="muWrap">
	<!-- {#each presentGallery as img, idx (img.id)}
		<div class="relative">
			<img src={img.url} alt="" class="z-0 w-48 h-48" id="brickitem" />
		</div>
	{/each} -->
</div>

<style lang="postcss">
	.mgrid {
		position: relative;
	}

	.item {
		background: #000;
		color: #fff;
		display: block;
		height: 100px;
		margin: 5px;
		position: absolute;
		width: 100px;
		z-index: 1;
	}

	.item-wide {
		width: 200px;
	}
	.item-tall {
		height: 200px;
	}
	.item.muuri-item-dragging {
		z-index: 3;
	}
	.item.muuri-item-releasing {
		z-index: 2;
	}
	.item.muuri-item-hidden {
		z-index: 0;
	}
	.item-content {
		position: relative;
		width: 100%;
		height: 100%;
	}
</style>
