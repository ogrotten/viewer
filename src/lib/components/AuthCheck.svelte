<script lang="ts">
	import { goto } from '$app/navigation'
	import { dbUser } from '$lib/firestore'

	if (!dbUser) goto('/login')
</script>

{#if $dbUser}
	<slot />
{:else}
	<p class="text-error">
		You must be signed in to view this page.
		<a class="btn btn-primary" href="/login">Sign in</a>
	</p>
{/if}
