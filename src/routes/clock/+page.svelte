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

	let showtime: string[]
	let time: Temporal.PlainTime = Temporal.Now.plainTimeISO()
	let fullTime: string
	let fullAlarm: string[] = ['12:34:56']

	$: if (browser) {
		w = window
		orient = w.innerHeight > w.innerWidth ? 'portrait' : 'landscape'
		H = w?.innerHeight
		W = w?.innerWidth
	}

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

	$: [hh, mm, ss] = showtime

	$: if (fullAlarm.includes(fullTime)) {
		console.log(`LOG..+page: new yay`, fullTime)
	}

	const addAlarm = () => {
		fullAlarm = [...fullAlarm, '12:34:56']
	}

	const deleteAlarm = (incoming: number) => {
		console.log(`LOG..+page: inside`, fullAlarm[incoming])
		fullAlarm.splice(incoming, 1)
	}
</script>

<div class="flex flex-col w-screen h-screen bg-green-50 centering" id="SVG-CONTAINER">
	<div class="flex flex-col">
		{#each fullAlarm as alarm, idx}<input
				type="time"
				bind:value={alarm}
				on:change={e => console.log(`LOG..+page: e`, e.target.value)}
			/>
			<button on:click={() => deleteAlarm(idx)}>delete</button>
		{/each}
	</div>

	<div>
		<button on:click={addAlarm}> add </button>

		<svg class="border w-fit h-fit" xmlns="http://www.w3.org/2000/svg" version="1.1" id="SVG">
			<text x="0" y="15" fill="red" class="m-auto scale-150 absolute-ce">
				{hh}:{mm}:{ss}
			</text>
		</svg>
	</div>
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
