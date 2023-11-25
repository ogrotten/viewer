<script lang="ts">
	import { Temporal } from '@js-temporal/polyfill'
	import { browser } from '$app/environment'
	import type { PageData } from './$types'
	import { onMount } from 'svelte'
	import { dbUser } from '$lib/firestore'
	import { db } from '$lib/firebase'
	import { getDocs, collection } from 'firebase/firestore'

	export let data: PageData

	let w: Window | undefined,
		orient: 'portrait' | 'landscape' = 'landscape',
		H: number = 0,
		W: number = 0

	let showtime: string[]
	let time: Temporal.PlainTime = Temporal.Now.plainTimeISO()
	let fullTime: string
	let alarms: string[] = ['12:34:56']

	onMount(() => {
		getAlarms()
		const interval = setInterval(() => {
			time = Temporal.Now.plainTimeISO()
		}, 1000)
		return () => clearInterval(interval)
	})

	async function getAlarms() {
		const querySnapshot = await getDocs(collection(db, 'users', $dbUser?.uid, 'alarms'))
		alarms = [...querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))]
		// resetImage()
	}

	const addAlarm = () => {
		alarms = [...alarms, '12:34:56']
	}

	const deleteAlarm = (incoming: number) => {
		// debugger
		alarms.splice(incoming, 1)
		alarms = alarms
		console.log(`LOG..+page: inside`, alarms)
	}

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

	$: [hh, mm, ss] = showtime

	$: if (alarms.includes(fullTime)) {
		console.log(`LOG..+page: new yay`, fullTime)
	}

	$: console.log(`LOG..+page: WATCH`, $dbUser.displayName)
</script>

<div class="flex flex-col w-screen h-screen gap-2 bg-green-50 centering" id="SVG-CONTAINER">
	<div class="flex flex-col gap-2">
		{#each alarms as alarm, idx}
			<div class="flex gap-2">
				<input
					type="time"
					bind:value={alarm}
					on:change={e => console.log(`LOG..+page: e`, e.target.value)}
				/>
				<button on:click={() => deleteAlarm(idx)}>❌</button>
			</div>
		{/each}
	</div>

	<div>
		<div class="flex justify-end pb-2">
			<button on:click={addAlarm} class="p-1 text-white bg-green-300 border rounded-lg">
				➕ add
			</button>
		</div>

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
