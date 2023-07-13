<script lang="ts">
	import { dbUser } from '$lib/firestore'
	// import { goto } from '$app/navigation'
	// import { auth } from '$lib/firebase'
	// import { onMount } from 'svelte'
	// // import type { PageData } from './$types'

	// export let data: PageData
</script>

<div class="navbar bg-base-100">
	<div class="flex-1">
		<!-- <a class="text-xl normal-case btn btn-ghost">daisyUI</a> -->
		<ul class="px-1 menu menu-horizontal">
			{#if $dbUser}
				<li><a href={`${$dbUser.id}`}>Manage</a></li>
				<li><a href="/show">Show</a></li>
				<!-- <li><a>Link</a></li>
			<li><a>Link</a></li> -->
			{/if}
		</ul>
	</div>
	<div class="flex-none">
		<ul class="px-1 menu menu-horizontal">
			{#if $dbUser}
				<!-- <li><a href="/profile">Profile</a></li> -->
				<li><a href="/logout">Logout</a></li>
			{:else}
				<li><a href="/login">Login</a></li>
			{/if}
			<!-- <li><a>Link</a></li>
			<li><a>Link</a></li> -->
		</ul>
	</div>
</div>
