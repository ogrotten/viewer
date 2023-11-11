<script lang="ts">
	import { Temporal } from '@js-temporal/polyfill'
	import { browser } from '$app/environment'
	import type { PageData } from './$types'
	import { onMount } from 'svelte'

	export let data: PageData

	let w: Window | undefined,
		orient: 'portrait' | 'landscape' = 'landscape',
		H: number = 0,
		W: number = 0

	$: if (browser) {
		w = window
		orient = w.innerHeight > w.innerWidth ? 'portrait' : 'landscape'
		H = w?.innerHeight
		W = w?.innerWidth
	}

	let showtime: string[]
	let time: Temporal.PlainTime = Temporal.Now.plainTimeISO()

	$: showtime = time
		.round({
			smallestUnit: 'milliseconds',
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

	$: hh = showtime[0]
	$: mm = showtime[1]
	$: ss = showtime[2]

	$: console.warn(`LOG..+page: WATCH`, { H, W })
</script>

<div class="relative w-screen h-screen centering" id="SVG-CONTAINER">
	<svg class="relative centering" xmlns="http://www.w3.org/2000/svg" version="1.1" id="SVG">
		<!-- <text x={`${W / 2}`} y={`${H / 2}`} fill="red" class="scale-150"> -->
		<text x="0" y="0" fill="red" class="fixed origin-center scale-150">
			{hh}:{mm}
			<!-- {ss} -->
		</text>
	</svg>
	<p class="">{hh}:{mm}:{Math.floor(ss)}</p>
</div>

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
