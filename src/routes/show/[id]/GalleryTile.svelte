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
		imgBase: HTMLDivElement,
		itemDiv: HTMLDivElement,
		itemContentDiv: HTMLDivElement

	const size = 400

	let muWrap: HTMLSpanElement

	let Muuri, mu: any
	onMount(async () => {
		const module = await import('muuri').then()
		Muuri = module.default

		mu = new Muuri('#muWrap', {
			dragEnabled: false,
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
			const img = imgBase.cloneNode() as HTMLDivElement
			img.title = incoming.title
			img.style.backgroundImage = `url(${incoming.url})`

			const inner = itemContentDiv.cloneNode() as HTMLDivElement
			const outer = itemDiv.cloneNode() as HTMLDivElement
			outer.onclick = () => dispatch('localNow', { id: img.id, idx })

			const w: number = incoming.width as number
			const h: number = incoming.height as number
			const ratio = w / h

			// const scratio = size / Math.max(w, h)
			// outer.style.width = `${w * scratio}px`
			// img.style.width = `${w * scratio}px`
			// outer.style.height = `${h * scratio}px`
			// img.style.height = `${h * scratio}px`

			if (ratio > 1.3) {
				// wide
				outer.style.width = `${size * 2}px`
				img.style.width = `${size * 2}px`
				outer.style.height = `${size}px`
				img.style.height = `${size}px`
			} else if (ratio < 0.7) {
				// tall
				outer.style.width = `${size}px`
				img.style.width = `${size}px`
				outer.style.height = `${size * 2}px`
				img.style.height = `${size * 2}px`
			} else {
				// square
				outer.style.width = `${size}px`
				img.style.width = `${size}px`
				outer.style.height = `${size}px`
				img.style.height = `${size}px`
			}
			if (incoming.title)
				img.innerHTML = `<div class="absolute bottom-0 right-0 p-1 font-bold text-white bg-black bg-opacity-50 text-md">${incoming.title}</div>`
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
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<div
		bind:this={imgBase}
		id="brickitem"
		class="transition-all bg-center bg-no-repeat bg-cover border border-black hover:scale-95"
	>
		<!--  -->
	</div>
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
