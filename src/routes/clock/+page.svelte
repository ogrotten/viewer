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
			smallestUnit: 'seconds',
			roundingMode: 'floor',
		})
		.toString()

	$: console.log(`LOG..+page: showtime`, showtime)

	onMount(() => {
		const interval = setInterval(() => {
			time = Temporal.Now.plainTimeISO()
		}, 1000)
		return () => clearInterval(interval)
	})
</script>

<div class="">
	{showtime}
</div>
