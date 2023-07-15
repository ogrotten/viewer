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
</script>

{#if $page.url.pathname !== '/show'}
	<TopNav />
{/if}

<div class="p-6 m-4 mt-0 border-t-2 border-gray-700">
	<slot />
</div>
