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
		seconds: false,
		color: '#440000',
		leadingZero: false,
		ampm: true,
		twelve: true,
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

	$: ampm = time.hour >= 12 ? 'pm' : 'am'
	$: twelvehour = time.hour > 12 ? time.hour - 12 : time.hour === 0 ? 12 : time.hour

	// $: hh = options.leadingZero ? showtime[0] : String(Number(showtime[0]))
	$: hh = options.leadingZero ? showtime[0] : String(Number(showtime[0]))
	$: mm = showtime[1]
	$: ss = showtime[2]

	$: options.twelve ? null : (options.ampm = false)
</script>

<div class="w-screen h-screen centering bg-black flex-col">
	<div
		class="flex items-center cursor-pointer"
		style={`color: ${options.color};`}
		role="button"
		tabindex="0"
		on:click={() => {
			optionsModal.showModal()
		}}
		on:keydown={e => {}}
	>
		<p class={`m-auto`} style={`font-size: 25vw;`}>
			{options.twelve ? twelvehour : hh}:{mm}
		</p>
		{#if options.seconds || options.ampm}
			<div style="font-size: 8vw" class="flex flex-col ml-2 mt-[1vh]">
				{#if options.seconds}
					<span class="">{ss}</span>
				{/if}
				{#if options.ampm && options.seconds}
					<div class="h-8" />
				{/if}
				{#if options.ampm}
					<span class="text-[6vw]">{ampm}</span>
				{/if}
			</div>
		{/if}
	</div>
</div>

<dialog id="optionsModal" class="modal" bind:this={optionsModal}>
	<form method="dialog" class="modal-box">
		<h3 class="font-bold text-lg">Clock Options</h3>
		<ul class="n">
			<li>
				12 hr: <input
					class="toggle toggle-xs"
					type="checkbox"
					bind:checked={options.twelve}
				/>
			</li>
			<li>
				Show am/pm: <input
					class="toggle toggle-xs"
					type="checkbox"
					disabled={!options.twelve}
					bind:checked={options.ampm}
				/>
			</li>
			<li>
				Show seconds: <input
					class="toggle toggle-xs"
					type="checkbox"
					bind:checked={options.seconds}
				/>
			</li>
			<!-- <li>
				Hours leading zero: <input
					class="toggle toggle-xs"
					type="checkbox"
					bind:checked={options.leadingZero}
				/>
			</li> -->
			<br />
			<li>HTML color: <input type="color" bind:value={options.color} /></li>
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
