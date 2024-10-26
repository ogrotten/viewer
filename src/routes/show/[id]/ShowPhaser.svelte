<script lang="ts">
	import PhaserGame, { type TPhaserRef } from '$game/PhaserGame.svelte'
	import { Scene } from 'phaser'

	export let showNow, localShowNow, showGallery, showCarousel, attach

	let phaserRef: TPhaserRef = { game: null, scene: null }

	const currentScene = (scene: Scene) => {
		console.log(`LOG..nothing here`)
	}
</script>

<PhaserGame
	bind:phaserRef
	currentActiveScene={currentScene}
	{showNow}
	{localShowNow}
	{showGallery}
	{showCarousel}
	{attach}
/>
