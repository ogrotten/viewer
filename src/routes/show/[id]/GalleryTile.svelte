<script lang="ts">
	import fadeScale from '$lib/svelte-transitions-fade-scale'
	import { onMount } from 'svelte'

	import { createEventDispatcher } from 'svelte'
	import { cubicInOut } from 'svelte/easing'
	import { fade } from 'svelte/transition'

	const dispatch = createEventDispatcher()

	let loading = true

	export let galleryAll: Image[] = [],
		gallery: Image[] = [],
		presentGallery: Image[] = [],
		changed = null,
		attach,
		changedBool = false

	export let orient

	let images: HTMLDivElement[] = [],
		imagesAll: HTMLDivElement[] = [],
		imgBase: HTMLDivElement,
		itemDiv: HTMLDivElement,
		itemContentDiv: HTMLDivElement

	const size = 360

	let Muuri, mu: any
	onMount(async () => {
		initLayout(galleryAll)
		console.log(`LOG..GalleryTile: here`)
	})

	let mousedown = false
	let drag = false

	const setupNode = incoming => {
		// debugger
		const img = imgBase.cloneNode() as HTMLDivElement
		const inner = itemContentDiv.cloneNode() as HTMLDivElement
		const outer = itemDiv.cloneNode() as HTMLDivElement

		img.title = incoming.title
		img.style.backgroundImage = `url(${incoming.url})`

		outer.style.display = 'none'
		outer.onmouseup = () => {
			console.log(`LOG..GalleryTile: up`)
			if (!drag) dispatch('localNow', { id: incoming.id })
			drag = false
		}
		outer.onmousemove = () => {
			console.log(`LOG..GalleryTile: move`)
			drag = true
		}

		outer.onmousedown = () => {
			console.log(`LOG..GalleryTile: down`)
			mousedown = true
			drag = false
		}

		outer.setAttribute('data-muuri-id', incoming.id)
		outer.setAttribute('title', incoming.title)

		// const scratio = size / Math.max(w, h)
		// outer.style.width = `${w * scratio}px`
		// img.style.width = `${w * scratio}px`
		// outer.style.height = `${h * scratio}px`
		// img.style.height = `${h * scratio}px`

		setOrient(incoming, outer, img)

		if (incoming.title)
			img.innerHTML = `<div class="absolute bottom-0 right-0 p-1 text-xl font-bold text-white bg-black bg-opacity-50">${incoming.title}</div>`
		inner.appendChild(img)
		outer.appendChild(inner)

		return outer
	}

	const setOrient = (incoming, outer, img) => {
		const w: number = incoming.width as number
		const h: number = incoming.height as number
		const ratio = w / h
		const portrait = { w: w / presentGallery.length, h }
		const landscape = { w, h: h / presentGallery.length }

		switch (orient) {
			case 'masonry':
				if (ratio > 1.25) {
					// wide
					outer.style.width = `${size * 2}px`
					img.style.width = `${size * 2}px`
					outer.style.height = `${size}px`
					img.style.height = `${size}px`
				} else if (ratio < 0.75) {
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
				break
			case 'portrait':
				outer.style.width = `${portrait.w}px`
				img.style.width = `${portrait.w}px`
				outer.style.height = `${portrait.h}px`
				img.style.height = `${portrait.h}px`
				break
			case 'landscape':
				outer.style.width = `${landscape.w}px`
				img.style.width = `${landscape.w}px`
				outer.style.height = `${landscape.h}px`
				img.style.height = `${landscape.h}px`
				break
			case 'square':
				break
			default:
				break
		}
	}

	const initLayout = async incoming => {
		if (incoming.length === 0) return
		images = incoming.map((one, idx) => {
			let outgoing = setupNode(one)
			outgoing.setAttribute('data-muuri-idx', idx)
			return outgoing
		})

		const module = await import('muuri').then()
		Muuri = module.default
		mu = new Muuri('#muWrap', {
			dragEnabled: true,
			items: '.item',
			layout: {
				fillGaps: true,
			},
		})
		mu.add([...images])

		mu.on('mouseDown', () => {
			dispatch('localNow', { id: incoming.id })
		})

		if (changedBool) {
			const toShow = gallery?.filter(item => item.gallery).map(item => item.id)
			mu?.filter(item => toShow.includes(item.getElement().getAttribute('data-muuri-id')))
			changedBool = false
		}
	}

	const setItemVis = () => {
		const el = images.filter(i => i.getAttribute('data-muuri-id') === changed.id)
		const item = mu?.getItem(el[0])

		if (changed.added) mu?.show([item])
		else mu?.hide([item])

		changed = null
	}

	$: if (changed) {
		setItemVis()
	}

	$: if (orient && mu) {
		const elements = mu.getItems().map(i => i.getElement())
		elements.forEach((outer: HTMLDivElement) => {
			const inner = outer.children as HTMLCollectionOf<HTMLDivElement>
			const img = inner[0].children[0] as HTMLImageElement
			const fromImages = galleryAll.find(i => i.id === outer.getAttribute('data-muuri-id'))
			console.log(`LOG..GalleryTile: `)
			setOrient(fromImages, outer, img)
		})

		mu.refreshItems(mu.getItems(), true)
		mu.layout()
	}
</script>

<div class="" transition:fade>
	{#await galleryAll then value}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div class="m-auto">
			<div class="hidden">
				<div bind:this={itemDiv} class="item" id="outer">
					<div bind:this={itemContentDiv} class="item-content" id="inner">
						<!--  -->
					</div>
				</div>
				<div
					bind:this={imgBase}
					id="img"
					class="transition-all bg-center bg-no-repeat bg-cover border-2 border-black hover:scale-95"
				>
					<!--  -->
				</div>
			</div>

			<div id="muWrap" class="flex justify-center w-screen h-screen">
				<!--  -->
			</div>
		</div>
	{/await}
</div>

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
