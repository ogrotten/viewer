<script lang="ts">
	import { page } from '$app/stores'
	import { dbUser } from '$lib/firestore'

	const { pathname } = $page.url
	const manage = pathname.includes('manage')
</script>

<div class="border-b navbar border-accent">
	<div class="flex-1">
		<p class="ml-8 font-bold btn-neutral-content">char.show</p>
		<ul class="px-1 menu menu-horizontal">
			<li class="" />
		</ul>
		<ul class="px-1 menu menu-horizontal">
			{#if $dbUser && !manage}
				<!-- <li><a href="/">Home</a></li> -->
				<li><a href={$dbUser.id}>Manage</a></li>
				<li><a href="/docs">Docs</a></li>
				<!-- <li><a href={`/show/${$dbUser.id}`}>Show</a></li> -->
			{/if}
		</ul>
	</div>
	<div class="flex-none">
		<ul class="px-1 menu menu-horizontal">
			{#if $dbUser}
				<li class="flex flex-row">
					<p class="">{$dbUser.email}</p>
					<a href="/logout">Logout</a>
				</li>
				<!-- {:else}
				<li><a href="/login">Login</a></li> -->
			{/if}
		</ul>
	</div>
</div>
