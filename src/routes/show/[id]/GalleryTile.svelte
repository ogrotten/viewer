<script lang="ts">
	import { browser } from '$app/environment'
	import { list } from 'postcss'
	import { onMount } from 'svelte'

	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	let loading = true

	export let gallery: Image[] = [],
		presentGallery: Image[] = []

	let images: HTMLDivElement[] = [],
		imgBase: HTMLImageElement,
		itemDiv: HTMLDivElement,
		itemContentDiv: HTMLDivElement

	const size = 600

	let muWrap: HTMLSpanElement

	let Muuri, mu: any
	onMount(async () => {
		const module = await import('muuri').then()
		Muuri = module.default

		mu = new Muuri('#muWrap', {
			dragEnabled: true,
			items: '.item',
			layout: {
				fillGaps: true,
			},
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

			const inner = itemContentDiv.cloneNode() as HTMLDivElement
			const outer = itemDiv.cloneNode() as HTMLDivElement
			outer.onclick = () => dispatch('localNow', { id: img.id, idx })

			const w: number = incoming.width as number
			const h: number = incoming.height as number
			const ratio = w / h

			const scratio = size / Math.max(w, h)

			outer.style.width = `${w * scratio}px`
			outer.style.height = `${h * scratio}px`

			// if (ratio > 1.1) {
			// 	// wide
			// 	outer.style.width = `${size * 2}px`
			// 	outer.style.height = `${size}px`
			// } else if (ratio < 0.9) {
			// 	// tall
			// 	outer.style.width = `${size}px`
			// 	outer.style.height = `${size * 2}px`
			// } else {
			// 	// square
			// 	outer.style.width = `${size}px`
			// 	outer.style.height = `${size}px`
			// }

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
		<div bind:this={itemContentDiv} class="flex items-center justify-center item-content">
			<!--  -->
		</div>
	</div>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<img
		bind:this={imgBase}
		src=""
		alt=""
		id="brickitem"
		style="object-fit: cover;"
		class="transition-all hover:scale-95"
	/>
</div>

<div id="muWrap" class="">
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
