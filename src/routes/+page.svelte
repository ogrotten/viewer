<script lang="ts">
	import { goto } from '$app/navigation'
	import AuthCheck from '$lib/components/AuthCheck.svelte'
	import { dbUser } from '$lib/firestore'
	import TopNav from './_components/TopNav.svelte'
</script>

<div class="">
	<h1>Welcome</h1>

	{#if $dbUser}
		<p>Logged in as {$dbUser.email}</p>
		<br />
		<button class="btn btn-primary hover:btn-neutral" on:click={() => goto('/' + $dbUser.id)}>
			Manage
		</button>
	{:else}
		<p>Go <a href="/login">login</a></p>
	{/if}
</div>
