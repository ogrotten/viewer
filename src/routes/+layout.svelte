<script lang="ts">
	import AuthCheck from '$lib/components/AuthCheck.svelte';
	import '../app.css';
</script>

<AuthCheck>
	<slot />
</AuthCheck>
