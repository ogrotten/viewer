import { get } from 'svelte/store'
import { page } from '$app/stores'
import { db } from '$lib/firebase'
import { type DocumentData, onSnapshot, doc, query, collection, where } from 'firebase/firestore'
import { Scene } from 'phaser'

import type { Image } from '$lib/types'
import { show } from '$stores/show'
import { type ShowStore } from '$lib/types'

export class Preloader extends Scene {
	allImages: Image[] | null
	loaderCompleted: boolean
	fireBaseCompleted: boolean

	constructor() {
		super('Preloader')
		this.allImages = null
		this.loaderCompleted = false
		this.fireBaseCompleted = false
	}

	init() {
		const uid = get(page).params.id
		//  We loaded this image in our Boot Scene, so we can display it here
		onSnapshot(query(collection(db, 'viewers', uid, 'images'), where('id', '!=', "")), snap => {
			this.allImages = [...snap.docs]
				.map(doc => ({ ...doc.data(), id: doc.id } as Image))
				.sort((a, b) => b.index - a.index)

			this.registry.set('allImages', this.allImages)

			this.fbResult()
		})
	}

	preload() {
		//  Load the assets for the game - Replace with your own assets

	}

	create() {
		//  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
		//  For example, you can define global animations here, so we can use them in other scenes.

		//  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.

		this.loaderCompleted = true
		if (this.fireBaseCompleted) {
			this.scene.start('Carousel')
		}
	}

	// update() {
	// 	let check = this.registry.get('all').getChildren().length
	// 	console.log(`LOG..update`,)
	// 	if (check > 0) {
	// 		this.scene.start('Normal')
	// 	}
	// }

	fbResult() {
		this.fireBaseCompleted = true
		if (this.loaderCompleted) {
			this.scene.start('Carousel')
		}
	}

}

// export let showNow: boolean, localShowNow: boolean, showGallery: boolean, showCarousel: boolean, attach: string


// let loading = true

// let galleryTile = false,
// 	// showGallery = false,
// 	// showNow = false,
// 	unsubViewer,
// 	viewer: DocumentData = {},
// 	zoom = 8

// let //gallery: Image[] = [],
// 	now: Image[],
// 	unsubGallery,
// 	presentGallery: Image[] = [],
// 	unsubNow

// let carousel: Image[] = [],
// 	unsubCarousel,
// 	// showCarousel = false,
// 	carouselTime = 10


// let changed: Changed | null = null
// let changedBool = false

// async function setup(incoming: string) {
// 	if (!incoming) return
// 	unsubViewer = onSnapshot(doc(db, 'viewers', incoming), doc => {
// 		carouselTime = viewer.carouselTime
// 		galleryTile = viewer.galleryTile
// 		showCarousel = viewer.carousel
// 		showGallery = viewer.gallery
// 		showNow = viewer.now
// 		viewer = doc.data() as DocumentData
// 		zoom = viewer.zoom
// 	})

// 	const c = query(
// 		collection(db, 'viewers', incoming, 'images'),
// 		where('carousel', '==', true),
// 	)
// 	unsubCarousel = onSnapshot(c, snap => {
// 		carousel = [...snap.docs].map(doc => ({ ...doc.data(), id: doc.id } as Image))
// 	})

// 	const g = query(collection(db, 'viewers', incoming, 'images'), where('gallery', '==', true))
// 	unsubGallery = onSnapshot(g, snap => {
// 		gallery = [...snap.docs]
// 			.map(doc => ({ ...doc.data(), id: doc.id } as Image))
// 			.sort((a, b) => b.index - a.index)
// 		snap.docChanges().forEach(change => {
// 			if (change.type === 'added') {
// 				let added = change.doc.data()
// 				presentGallery = [...gallery]
// 				changed = {
// 					id: added.id,
// 					added: true,
// 					wider: added.wider,
// 					taller: added.taller,
// 				}
// 			} else if (change.type === 'modified') {
// 				let modified = change.doc.data()
// 				presentGallery = [...gallery]
// 				changed = {
// 					id: modified.id,
// 					modded: true,
// 					wider: modified.wider,
// 					taller: modified.taller,
// 				}
// 			} else if (change.type === 'removed') {
// 				let removed = change.doc.data()
// 				// presentGallery.splice(presentGallery.indexOf(removed), 1)
// 				presentGallery = [...presentGallery.filter(x => x.id !== removed.id)]
// 				changed = { id: removed.id, removed: true }
// 			} else changed = null
// 		})
// 	})

// 	const n = query(collection(db, 'viewers', incoming, 'images'), where('now', '==', true))

// 	unsubNow = onSnapshot(n, snap => {
// 		now = [...snap.docs].map(doc => ({ ...doc.data(), id: doc.id } as Image))
// 	})

// 	console.log(`LOG..`, carouselTime, galleryTile, showCarousel, showGallery, showNow, viewer, zoom, incoming,)

// 	Promise.all([unsubViewer, unsubGallery, unsubNow, unsubCarousel]).then(() => {
// 		loading = false
// 	})
// 	return gallery
// }
