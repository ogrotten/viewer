<script lang="ts">
	import AuthCheck from '$lib/components/AuthCheck.svelte'
	import '../app.css'
	import TopNav from './_components/TopNav.svelte'
	import { dbUser } from '$lib/firestore'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'

	if (!dbUser) {
		console.log(`LOG..+layout: no user`)
		goto('/')
	}

	const show = $page.url.pathname === '/show'
	const debug = false
</script>

{#if !show}
	<TopNav />
{/if}

<div class="w-full h-full min-h-screen overflow-hidden" class:bg-red-800={debug} class:p-10={!show}>
	<slot />
</div>
