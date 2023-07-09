<script lang="ts">
	import { dbUser } from '$lib/firestore';
</script>

{#if $dbUser}
	<slot />
{:else}
	<p class="text-error">
		You must be signed in to view this page.
		<a class="btn btn-primary" href="/login">Sign in</a>
	</p>
{/if}
