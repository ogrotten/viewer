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
			let classes = 'square'
			if (img.width > img.height) {
				classes += ' wide'
			} else if (img.width < img.height) {
				classes += ' tall'
			}

			img.classList.add(classes)
			const inner = itemContentDiv.cloneNode()
			const outer = itemDiv.cloneNode()

			inner.appendChild(img)
			outer.appendChild(inner)

			// debugger
			return outer
		})

		debugger
		mu.add([...images])
	}

	// $: if (imgBase && imgBase.complete) {
	// 	// imgBase.addEventListener('load', () => {
	// 	// 	imgWrapper.appendChild(imgBase)
	// 	// })

	// 	debugger
	// }

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
		width: 100px;
		height: 100px;
		margin: 5px;
		z-index: 1;
		background: #000;
		color: #fff;
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
