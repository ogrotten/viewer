<script lang="ts">
	import AuthCheck from '$lib/components/AuthCheck.svelte'
	import '../app.css'
	import TopNav from './_components/TopNav.svelte'
</script>

<TopNav />
<div class="p-6 m-4 mt-0 border-t-2 border-gray-700">
	<slot />
</div>
