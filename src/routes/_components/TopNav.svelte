<script lang="ts">
	import { dbUser } from '$lib/firestore'
</script>

<div class="border-b navbar border-accent">
	<div class="flex-1">
		<ul class="px-1 menu menu-horizontal">
			{#if $dbUser}
				<li><a href={`/`}>Home</a></li>
				<li><a href={`${$dbUser.id}`}>Manage</a></li>
				<li><a href={'/show'}>Show</a></li>
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
			{:else}
				<li><a href="/login">Login</a></li>
			{/if}
		</ul>
	</div>
</div>
