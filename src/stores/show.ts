import { type Writable, writable } from 'svelte/store'

const show: Writable<ShowStore> = writable()

show.subscribe((value: ShowStore) => {
	const { subscribe, set, update } = writable()
	return { subscribe, set, update }
})

interface ShowStore {
	attach: string
	carouselTime: number
	galleryTile: boolean
	showCarousel: boolean
	showGallery: boolean
	showNow: boolean
	viewer: any
	zoom: number
}

export { show }