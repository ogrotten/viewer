<script lang="ts">
	import AuthCheck from '$lib/components/AuthCheck.svelte'
	import { dbUser } from '$lib/firestore'
	import TopNav from './_components/TopNav.svelte'

	$: console.log(`LOG..+page: user`, $dbUser)
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
