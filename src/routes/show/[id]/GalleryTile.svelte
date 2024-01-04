<script lang="ts">
	import { browser } from '$app/environment'
	import { list } from 'postcss'
	import { onMount } from 'svelte'
	// import Muuri from 'muuri'

	let loading = true

	export let gallery: Image[] = []

	let listElem: HTMLUListElement
	let listHandler: any
	let listItems: HTMLLIElement[] = []
	let images: HTMLImageElement[] = []

	const size = 300

	onMount(() => {
		if (browser) {
			import('muuri')
				.then(Muuri => {
					// console.log('Muuri', Muuri)
					// Use module for something
					listHandler = new Muuri.default(listElem, {
						dragEnabled: true,
						// items: listItems,
					})
					listHandler.on('layoutStart', i => {
						console.log('item-list: layoutStart')
					})
					listHandler.on('layoutEnd', i => {
						console.log('item-list: layoutEnd')
					})
					// debugger
				})
				.catch(err => {
					console.warn(`LOG..GalleryTile: err`, err)
				})
		}
	})

	const sizer = () => {
		// console.log('sizer', { listElem })
		// console.log(`LOG..GalleryTile: listHandler.`, listHandler.getItems()[0])
		console.log(`LOG..GalleryTile: listHandler.`, listItems.style)
	}

	$: if (listHandler) {
		console.log(`LOG..GalleryTile: listItems`, listItems)
		Promise.all(
			listItems.map((item, idx) => {
				const img: HTMLImageElement = images[idx]
				return new Promise((resolve, reject) => {
					img.onload = () => {
						resolve(img)
					}
					img.onerror = () => {
						reject(img)
					}
				})
			}),
		).then(imgs => {
			// imgs.forEach((img, idx) => {
			// 	if (img.naturalWidth > img.naturalHeight) {
			// 		listItems[idx].classList.add('item-wide')
			// 	} else {
			// 		listItems[idx].classList.add('item-tall')
			// 	}
			// })
			// listHandler.add(listItems)
			// listHandler.refreshItems()
			// loading = false
		})
	}

	$: console.log(`LOG..GalleryTile: listItems[1]`, listItems[1])
</script>

{#if loading}
	<!--  -->
{:else}
	<ul class="muuri" id="tile master" bind:this={listElem}>
		{#each gallery as item, idx (idx)}
			<li
				class="item {images[idx]?.naturalWidth > images[idx]?.naturalHeight
					? 'item-wide'
					: 'item-tall'}"
				bind:this={listItems[idx]}
				class:item-wide={images[idx]?.naturalWidth > images[idx]?.naturalHeight}
				class:item-tall={images[idx]?.naturalHeight > images[idx]?.naturalWidth}
			>
				<img
					bind:this={images[idx]}
					id="brickitem"
					src={item?.url}
					alt={item?.title}
					title={item?.title}
					class="object-cover item-content"
				/>
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->

				<!-- class="h-screen transition-all duration-500 origin-center scale-100 bg-center bg-no-repeat item-content hover:scale-95 group" -->
				<!-- <div
					class="h-screen transition-all duration-500 origin-center scale-100 bg-center bg-no-repeat item-content hover:scale-95 group"
					class:bg-contain={gallery.length <= 2}
					class:bg-cover={gallery.length > 2}
					style="background-image: url({item.url})"
				> -->
				<!-- on:click={() => {
						localNow[0] = img
						localShowNow = true
					}} -->
				<!-- <div style="background-image: url({item.url})" class="item-content"> -->
				{#if item.title}
					<p
						class="absolute bottom-0 left-0 w-full p-2 py-2 text-2xl font-bold text-center transition-all duration-500 opacity-50 group-hover:opacity-100 text-cyan-50"
						style="text-shadow: 2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;"
					>
						{item.title}
					</p>
				{/if}
				<!-- </div> -->
			</li>
		{/each}
	</ul>
{/if}

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
