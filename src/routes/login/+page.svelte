<script lang="ts">
	import { goto } from '$app/navigation'
	import { auth } from '$lib/firebase'
	import { dbUser } from '$lib/firestore'

	import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'

	async function signInWithGoogle() {
		const provider = new GoogleAuthProvider()
		const user = await signInWithPopup(auth, provider).then(res => {
			console.log('res', res)
			goto('/' + res.user.id)
		})
	}

	$: if (dbUser.id) {
		goto(`${$dbUser.id}`)
	}
</script>

<!-- <h2>Login</h2> -->

<button class="btn btn-primary hover:btn-neutral" on:click={signInWithGoogle}>
	Sign in with Google
</button>
