<script lang="ts">
	import { user } from '$lib/firestore';

	$: console.log(`LOG..+page: user`, $user);
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
