<script lang="ts">
	import AuthCheck from '$lib/components/AuthCheck.svelte'
	import { dbUser } from '$lib/firestore'
	import TopNav from './_components/TopNav.svelte'

	$: console.log(`LOG..+page: user`, $dbUser)
</script>

<h1>Welcome</h1>

{#if $dbUser}
	<p>Logged in as {$dbUser.email}</p>
{:else}
	<p>Go <a href="/login">login</a></p>
{/if}
