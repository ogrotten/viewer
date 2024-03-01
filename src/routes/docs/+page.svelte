<script lang="ts">
	import type { PageData } from './$types'

	export let data: PageData

	const links = [
		'https://i.imgur.com/0hMWPdQ.jpg?1',
		'https://i.imgur.com/ktczK2w.jpg?1',
		'https://i.imgur.com/4Xl0u9W.jpg?1',
		'https://i.imgur.com/JHXtIJJ.jpg?1',
		'https://i.imgur.com/avMpuaB.jpg?1',
		'https://i.imgur.com/bUIMpp4.jpg',
		'https://i.imgur.com/KaBH2vT.png',
		'https://i.imgur.com/aqj6S6W.png',
		'https://i.imgur.com/mcW6Auv.png',
		'https://i.imgur.com/CYkTzWX.png',
		'https://i.imgur.com/KCzyGmp.png',
		'https://i.imgur.com/27njUkZ.png?1',
		'https://i.imgur.com/85xDtry.jpg',
		'https://i.imgur.com/03JQqiB.png',
		'https://i.imgur.com/QNFQdIP.png',
		'https://i.imgur.com/IOar7h3.png',
		'https://i.imgur.com/egsolyN.jpg',
		'https://i.imgur.com/o7E8Rsn.jpg?1',
		'https://i.imgur.com/dYOp8Fs.jpg',
		'https://i.imgur.com/9e6LKB4.jpg?1',
		'https://i.imgur.com/OQzayn9.jpg',
		'https://i.imgur.com/CpH0282.jpg',
		'https://i.imgur.com/s9luDyo.png',
		'https://i.imgur.com/6di2icQ.jpg',
		'https://i.imgur.com/Bdcj7cq.jpg?1',
	]
</script>

<span class="space-y-4">
	<p class="mt-4 text-lg font-bold">Load some images</p>
	<ul>
		<li class="italic">Left sidebar > Add Images</li>
		<li>
			Images need to be hosted somewhere and have a direct link to the image. Imgur works
			flawlessly.
		</li>
		<li>
			For now, the image url must be formatted as url and file with extension:
			<span class="font-mono text-sm"> https://i.imgur.com/bUIMpp4.jpg </span>
		</li>
		<li>char.show does not host the images..</li>
		<li class="">You can add a title to the image, but it's optional.</li>
	</ul>

	<br />
	<p class="mt-4 text-lg font-bold">Use the "Click to copy" button.</p>
	<ul>
		<li>This leads to the "View" page.</li>
		<li>
			For testing, use that link in a new browser window (not tab) and position the windows so
			you can see them both.
		</li>
		<li>
			In the Real World, you'll give that link to your players OR cast it to another screen.
		</li>
		<li class="">
			The "View" page can be viewed on any browser including mobile. The changes you make on
			this Manage window will immediately happen on the View page.
		</li>
	</ul>

	<br />
	<p class="mt-4 text-lg font-bold">Select images</p>
	<ul>
		<li>Use the main panel to select images for the different views.</li>
		<li>The tabs and various buttonage should be self explanatory</li>
	</ul>
	<br />
	<p class="mt-4 text-lg font-bold">Manage Views</p>
	<ul>
		<li>Carousel: slideshow the selected the images on a 30sec pause</li>
		<li>Now: Choose one image to show right Now</li>
		<li>
			Gallery: Show all Gallery selected images on a single screen.
			<ul>
				<li>Grid: fit the pieces together brick-style based on size</li>
				<li>Square: make all images squares</li>
				<li>
					Wide/Tall: fit all images spanned in one direction. wide for scenery, tall for
					characters.
				</li>
			</ul>
		</li>
	</ul>

	<br />
	<p class="mt-4 text-lg font-bold">View Page.</p>
	<ul>
		<li class="">Drag images to whatever order (does not save... yet)</li>
		<li class="">
			Click image to get your own Now. Any user can do this affecting their view only.
		</li>
	</ul>
	<br />
	<p class="mt-4 text-lg font-bold">Known Issues</p>
	<ul>
		<li class="">The top navigation bar is a clunky. I'll probably remove it entirely.</li>
		<li class="">
			When you add images, and select them for a View, you'll need to manually reload the View
			page.
		</li>
		<li class="">
			<span class="font-bold">Manage > List View</span>
			would be better listing as vertical first, but I haven't really figured out how to do it.
		</li>
		<li class="">
			<span class="font-bold">Images > Add Many</span>
			planned to accept a google photos album. Any other ideas? (besides arbitrary image urls).
		</li>
		<li class="">
			<span class="font-bold">Images > Add</span>
			can take the exact same url multiple times. It needs to be unique.
		</li>
	</ul>
	<br />
	<p class="mt-4 text-lg font-bold">Demo Images</p>
	<ul>
		<li class="">
			You can use these urls to test the site if you don't have your own images or it's a pita
			to format the urls. These are Safe For Work images, Fallout themed.
		</li>
		<li class="">Copy the list and paste it into Add Images > Many</li>
		<li class="font-mono text-sm whitespace-pre-line">
			{#each links as link}
				{link}<br />
			{/each}
		</li>
	</ul>
</span>

<style lang="postcss">
	.help p {
		@apply mt-4;
	}

	li {
		@apply ml-8 list-inside mt-2;
	}
	.help .headr {
		@apply text-lg font-bold mt-10;
	}
</style>
