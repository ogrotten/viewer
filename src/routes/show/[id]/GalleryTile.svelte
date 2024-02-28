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
		changedBool = false,
		zoom = 8

	export let orient, tile

	let images: HTMLDivElement[] = [],
		imagesAll: HTMLDivElement[] = [],
		imgBase: HTMLDivElement,
		itemDiv: HTMLDivElement,
		itemContentDiv: HTMLDivElement

	let size = 360

	$: size = window.innerWidth / zoom

	let Muuri, mu: any
	onMount(async () => {
		initLayout(galleryAll)
		console.log(`LOG..GalleryTile: here`)
	})

	let mouse = {
		drag: false,
		down: false,
		up: false,
		move: false,
		over: false,
		x: 0,
		y: 0,
		diff: 0,
	}

	const setupNode = incoming => {
		// debugger
		const img = imgBase.cloneNode() as HTMLDivElement
		const inner = itemContentDiv.cloneNode() as HTMLDivElement
		const outer = itemDiv.cloneNode() as HTMLDivElement

		img.title = incoming.title
		img.style.backgroundImage = `url(${incoming.url})`

		outer.style.display = 'none'

		outer.onmouseup = () => {
			console.log(`LOG..GalleryTile: up`, mouse.diff)
			if (!mouse.drag) dispatch('localNow', { id: incoming.id })
			mouse.drag = false
		}

		outer.onmousemove = e => {
			console.log(`LOG..GalleryTile: move`, mouse.down, mouse.drag)
			mouse.diff = Math.abs(mouse.x - e.clientX) + Math.abs(mouse.y - e.clientY)

			if (mouse.down && mouse.diff > 100) {
				mouse.drag = true
			} else {
				mouse.drag = false
			}
		}

		outer.onmousedown = e => {
			console.log(`LOG..GalleryTile: down`, mouse.diff)

			mouse.down = true

			mouse.x = e.clientX
			mouse.y = e.clientY
			e.stopPropagation()
		}

		outer.onmouseenter = () => {
			console.log(`LOG..GalleryTile: enter`, mouse.diff)
			mouse.over = true
		}

		outer.onmouseleave = () => {
			console.log(`LOG..GalleryTile: leave`, mouse.diff)
			mouse.over = false
		}

		outer.setAttribute('data-muuri-id', incoming.id)
		outer.setAttribute('title', incoming.title)

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

		let dimensions = { width: w, height: h }

		switch (orient) {
			case 'grid':
				if (ratio > 1.25) {
					// wide
					dimensions.width = size * 2
					dimensions.height = size
				} else if (ratio < 0.75) {
					// tall
					dimensions.width = size
					dimensions.height = size * 2
				} else {
					// square
					dimensions.width = size
					dimensions.height = size
				}
				break
			case 'square':
				dimensions.width = size
				dimensions.height = size
				break
			case 'wide':
				dimensions.width = tile.FWD
				dimensions.height = tile.FHT / presentGallery.length
				break
			case 'tall':
				dimensions.width = tile.FWD / presentGallery.length
				dimensions.height = tile.FHT
				break
			default:
				dimensions.width = w
				dimensions.height = h

				break
		}

		outer.style.width = `${dimensions.width}px`
		img.style.width = `${dimensions.width}px`
		outer.style.height = `${dimensions.height}px`
		img.style.height = `${dimensions.height}px`
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

		// mu.on('mouseDown', () => {
		// 	dispatch('localNow', { id: incoming.id })
		// })

		if (changedBool) {
			const toShow = gallery?.filter(item => item.gallery).map(item => item.id)
			mu?.filter(item => toShow.includes(item.getElement().getAttribute('data-muuri-id')))
			changedBool = false
		}
	}

	const setItemVis = () => {
		const el = images.filter(i => i.getAttribute('data-muuri-id') === changed.id)
		const item = mu?.getItem(el[0])

		item.getElement().classList.repl

		if (changed.added) mu?.show([item])
		else {
			mu?.hide([item])
		}

		changed = null
		mu.refreshItems(mu.getItems(), true)
		mu.layout()
	}

	$: if ((orient || changed || zoom) && mu) {
		const elements = mu.getItems().map(i => i.getElement())
		elements.forEach((outer: HTMLDivElement) => {
			const inner = outer.children as HTMLCollectionOf<HTMLDivElement>
			const img = inner[0].children[0] as HTMLImageElement
			const fromImages = galleryAll.find(i => i.id === outer.getAttribute('data-muuri-id'))
			console.log(`LOG..GalleryTile: `)
			setOrient(fromImages, outer, img)
		})

		if (changed?.id) setItemVis()
		mu.refreshItems(mu.getItems(), true)
		mu.layout()
	}

	// $: if (orient && mu) {
	// }
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
