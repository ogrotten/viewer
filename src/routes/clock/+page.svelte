<script lang="ts">
	import { Temporal } from '@js-temporal/polyfill'
	import { browser } from '$app/environment'
	import type { PageData } from './$types'
	import { onMount } from 'svelte'

	export let data: PageData
	let optionsModal: HTMLDialogElement
	let w: Window | undefined,
		orient: 'portrait' | 'landscape' = 'landscape',
		H: number = 0,
		W: number = 0
	let showtime: string[]
	let time: Temporal.PlainTime = Temporal.Now.plainTimeISO()

	let options = {
		seconds: true,
		color: '#330000',
		leadingZero: false,
	}

	$: if (browser) {
		w = window
		orient = w.innerHeight > w.innerWidth ? 'portrait' : 'landscape'
		H = w?.innerHeight
		W = w?.innerWidth
	}

	$: showtime = time
		.round({
			smallestUnit: 'seconds',
			roundingMode: 'floor',
		})
		.toString()
		.split(':')

	onMount(() => {
		const interval = setInterval(() => {
			time = Temporal.Now.plainTimeISO()
		}, 1000)
		return () => clearInterval(interval)
	})

	// $: hh = showtime[0]
	$: hh = options.leadingZero ? showtime[0] : String(Number(showtime[0]))
	$: mm = showtime[1]
	// $: ss = Math.floor(+showtime[2]).toString()
	$: ss = showtime[2]

	$: console.warn(`LOG..+page: WATCH`, { H, W })
</script>

<!-- <div class="relative w-screen h-screen centering" id="SVG-CONTAINER">
	<svg class="relative centering" xmlns="http://www.w3.org/2000/svg" version="1.1" id="SVG">
		<text x={`${W / 2}`} y={`${H / 2}`} fill="red" class="scale-150">
		<text x="0" y="0" fill="red" class="fixed origin-center scale-150">
			{hh}:{mm}
			{ss}
		</text>
	</svg>
</div> -->
<div class="w-screen h-screen centering bg-black flex-col">
	<div class="flex items-center" style={`color: ${options.color};`}>
		<p class={`m-auto`} style={`font-size: 25vw;`}>
			{hh}:{mm}
		</p>
		{#if options.seconds}
			<span style="font-size: 8vw">{ss}</span>
		{/if}
	</div>
	<button
		class="btn"
		on:click={() => {
			optionsModal.showModal()
		}}>&nbsp;</button
	>
</div>

<dialog id="optionsModal" class="modal" bind:this={optionsModal}>
	<form method="dialog" class="modal-box">
		<h3 class="font-bold text-lg">Clock Options</h3>
		<ul class="n">
			<li>
				Show seconds: <input
					class="toggle toggle-xs"
					type="checkbox"
					bind:checked={options.seconds}
				/>
			</li>
			<li>HTML color: <input type="color" bind:value={options.color} /></li>
			<li>
				Hours leading zero: <input
					class="toggle toggle-xs"
					type="checkbox"
					bind:checked={options.leadingZero}
				/>
			</li>
		</ul>
		<div class="my-6 h-0 w-full border-b border-b-[#888]" />
		<!-- if there is a button in form, it will close the modal -->
		<button class="btn">Close</button>
	</form>
</dialog>

<style>
	.size {
		width: 100%;
		height: 100%;
		@apply text-9xl;
	}

	.light {
		/*  */
	}

	.dark {
		/*  */
	}

	.black {
		/*  */
	}

	.centering {
		@apply flex items-center justify-center;
	}
</style>
