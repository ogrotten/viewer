<script lang="ts">
	import { goto } from '$app/navigation'
	import { auth } from '$lib/firebase'
	import { onMount } from 'svelte'
	import type { PageData } from './$types'

	export let data: PageData

	onMount(() => {
		console.log('onMount')
		auth.signOut().then(() => {
			console.log('sign out')
		})
	})
</script>
