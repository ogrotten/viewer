<script lang="ts">
	import { browser } from '$app/environment'
	import { list } from 'postcss'
	import { onMount } from 'svelte'
	// import Muuri from 'muuri'

	let loading = true

	export let gallery: Image[] = [],
		presentGallery: Image[] = []

	let images: HTMLDivElement[] = [],
		imgBase: HTMLImageElement,
		itemDiv: HTMLDivElement,
		itemContentDiv: HTMLDivElement

	const size = 300

	let muWrap: HTMLSpanElement

	let Muuri, mu: any
	onMount(async () => {
		const module = await import('muuri').then()
		Muuri = module.default

		mu = new Muuri('#muWrap', {
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
		images = gallery.map((incoming, idx) => {
			const img = imgBase.cloneNode() as HTMLImageElement
			img.src = incoming.url
			img.alt = incoming.title

			const inner = itemContentDiv.cloneNode()
			const outer = itemDiv.cloneNode()

			if (incoming.width > incoming.height) {
				outer.style.width = `${size * 2}px`
				outer.style.height = `${size}px`
			} else if (incoming.width < incoming.height) {
				outer.style.width = `${size}px`
				outer.style.height = `${size * 2}px`
			} else {
				outer.style.width = `${size}px`
				outer.style.height = `${size}px`
			}

			inner.appendChild(img)
			outer.appendChild(inner)

			return outer
		})

		mu.add([...images])
	}

	$: console.log(`LOG..GalleryTile: images`, images)
</script>

<div class="hidden">
	<div bind:this={itemDiv} class="item">
		<div bind:this={itemContentDiv} class="item-content">
			<!--  -->
		</div>
	</div>
	<img bind:this={imgBase} src="" alt="" id="brickitem" />
</div>

<div id="muWrap" class=" bg-slate-500">
	<!--  -->
</div>

<!-- {#each images as m}
	{m}
{/each} -->

<!-- <div class="invisible" bind:this={muWrap} id="muWrap">
	<div class="item">
		<div class="item-content">
			{}
		</div>
	</div>
	{#each presentGallery as img, idx (img.id)}
		<div class="relative">
			<img src={img.url} alt="" class="z-0 w-48 h-48" id="brickitem" />
		</div>
	{/each}
</div> -->

<style lang="postcss">
	#muwrap {
		position: relative;
	}

	.item {
		display: block;
		position: absolute;
		width: 200px;
		height: 200px;
		margin: 0;
		z-index: 1;
		background: #000;
		color: #fff;
	}

	.wide {
		width: 400px;
	}
	.tall {
		height: 400px;
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
	}
</style>
