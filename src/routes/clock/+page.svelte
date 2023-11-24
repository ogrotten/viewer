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
	let fullTime

	$: fullTime = time
		.round({
			smallestUnit: 'seconds',
			roundingMode: 'floor',
		})
		.toString()

	$: showtime = fullTime.split(':')

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

	let secAlarm = ['00', '15', '30', '45']
	secAlarm.push('55')

	let fullAlarm = ['14:42:20', '14:30:40']

	$: if (fullAlarm.includes(fullTime)) {
		console.log(`LOG..+page: new yay`, fullTime)
	}
</script>

<div class="w-screen h-screen bg-green-50 centering" id="SVG-CONTAINER">
	<svg class="border w-fit h-fit" xmlns="http://www.w3.org/2000/svg" version="1.1" id="SVG">
		<!-- <text x={`${W / 2}`} y={`${H / 2}`} fill="red" class="scale-150"> -->
		<text x="0" y="15" fill="red" class="m-auto scale-150 absolute-ce">
			{hh}:{mm}:{ss}
		</text>
	</svg>
	<!-- <p class="">{hh}:{mm}:{ss}</p> -->
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
