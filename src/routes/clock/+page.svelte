<script lang="ts">
	import { Temporal } from '@js-temporal/polyfill'
	import { browser } from '$app/environment'
	import type { PageData } from './$types'
	import { onMount } from 'svelte'

	export let data: PageData

	let w: Window | undefined,
		orient: 'portrait' | 'landscape' = 'landscape'
	$: if (browser) {
		w = window
		orient = w.innerHeight > w.innerWidth ? 'portrait' : 'landscape'
	}

	let showtime: string
	let time: Temporal.PlainTime = Temporal.Now.plainTimeISO()

	$: showtime = time
		.round({
			smallestUnit: 'minutes',
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
</script>

<div class="">
	{hh}:{mm}
	{ss}
</div>

<style>
	.light {
		/*  */
	}

	.dark {
		/*  */
	}

	.black {
		/*  */
	}
</style>
