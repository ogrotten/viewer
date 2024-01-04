<script lang="ts">
	import { browser } from '$app/environment'
	import { onMount } from 'svelte'
	// import Muuri from 'muuri'

	let loading = false

	export let gallery: Image[] = []

	let listElem: HTMLUListElement
	let listHandler
	onMount(() => {
		console.log('mounted: item-list')

		// listHandler = new Muuri(listElem, {
		// 	dragEnabled: true,
		// 	items: '.item',
		// })

		// listHandler.on('layoutStart', i => {
		// 	console.log('item-list: layoutStart', i)
		// })
		// listHandler.on('layoutEnd', i => {
		// 	console.log('item-list: layoutEnd')
		// })
	})

	$: if (gallery?.length > 0 && listElem?.id === 'tile master') {
		loading = false
	}

	$: if (browser) {
		import('muuri')
			.then(Muuri => {
				// console.log('Muuri', Muuri)
				// Use module for something
				listHandler = new Muuri.default(listElem, {
					dragEnabled: true,
					items: '.item',
				})
				listHandler.on('layoutStart', i => {
					console.log('item-list: layoutStart', i)
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

	$: console.log(`LOG..GalleryTile: gallery`, gallery)
</script>

{#if loading}
	<!--  -->
{:else}
	<ul class="muuri" id="tile master" bind:this={listElem}>
		{#each gallery as item}
			<li class="item">
				<img
					id="brickitem"
					src={item?.url}
					alt={item?.title}
					title={item?.title}
					class="item-content"
				/>
			</li>
		{/each}
	</ul>
{/if}

<style lang="postcss">
	.mgrid {
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
