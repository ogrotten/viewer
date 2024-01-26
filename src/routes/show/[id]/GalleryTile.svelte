<script lang="ts">
	import { onMount } from 'svelte'

	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	let loading = true

	export let galleryAll: Image[] = [],
		gallery: Image[] = [],
		presentGallery: Image[] = [],
		changed = null,
		attach

	let images: HTMLDivElement[] = [],
		imagesAll: HTMLDivElement[] = [],
		imgBase: HTMLDivElement,
		itemDiv: HTMLDivElement,
		itemContentDiv: HTMLDivElement

	const size = 360

	let Muuri, mu: any
	onMount(async () => {
		initLayout(galleryAll)
	})

	const setupNode = incoming => {
		// debugger
		const img = imgBase.cloneNode() as HTMLDivElement
		const inner = itemContentDiv.cloneNode() as HTMLDivElement
		const outer = itemDiv.cloneNode() as HTMLDivElement

		img.title = incoming.title
		img.style.backgroundImage = `url(${incoming.url})`

		if (!incoming.gallery) outer.style.display = 'none'
		outer.onclick = () => dispatch('localNow', { id: incoming.id })

		outer.setAttribute('data-muuri-id', incoming.id)

		const w: number = incoming.width as number
		const h: number = incoming.height as number
		const ratio = w / h

		// const scratio = size / Math.max(w, h)
		// outer.style.width = `${w * scratio}px`
		// img.style.width = `${w * scratio}px`
		// outer.style.height = `${h * scratio}px`
		// img.style.height = `${h * scratio}px`

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
		if (incoming.title)
			img.innerHTML = `<div class="absolute bottom-0 right-0 p-1 text-xl font-bold text-white bg-black bg-opacity-50">${incoming.title}</div>`
		inner.appendChild(img)
		outer.appendChild(inner)

		return outer
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

		mu.on('layoutStart', i => {
			console.log('item-list: layoutStart')
		})

		// mu.add([...images])
		mu.add([...images])

		mu.on('layoutEnd', i => {
			console.log('item-list: layoutEnd')
			loading = false
		})

		mu.on('onmouseup', (item, e) => {
			console.log(`LOG..GalleryTile: id, idx`, id, idx)
		})
	}

	async function muDo(incoming: Image[]) {
		if (incoming.length === 0) return
		images = incoming.map((one, idx) => setupNode(one))
		mu.add([...images])
	}

	const setItemVis = () => {
		const el = images.filter(i => i.getAttribute('data-muuri-id') === changed.id)
		const item = mu.getItem(el[0])

		if (changed.added) mu.show([item])
		else mu.hide([item])

		changed = null
	}

	$: if (changed && !loading) setItemVis()
</script>

{#await galleryAll then value}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="m-auto">
		<div class="hidden">
			<div bind:this={itemDiv} class="item">
				<div bind:this={itemContentDiv} class="item-content">
					<!--  -->
				</div>
			</div>
			<div
				bind:this={imgBase}
				id="brickitem"
				class="transition-all bg-center bg-no-repeat bg-cover border-2 border-black hover:scale-95"
				on:click={e => {
					console.log('brickitem: click', e)
				}}
			>
				<!--  -->
			</div>
		</div>

		<div id="muWrap" class="flex justify-center w-screen h-screen">
			<!--  -->
		</div>
	</div>
{/await}

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
