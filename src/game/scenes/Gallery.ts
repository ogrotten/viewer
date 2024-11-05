import { page } from '$app/stores'
import { get } from 'svelte/store'
import { type GameObjects, Scene } from 'phaser'
import { dbUser } from '$lib/firestore'
import type { Image, Changed } from '$lib/types'

import { EventBus } from '../EventBus'
import { getStorage, ref, listAll, getBlob } from 'firebase/storage'

const storage = getStorage()

export class Gallery extends Scene {
	// allImages: Image[]
	constructor() {
		super('Normal')
	}

	create() {
		const uid = get(page).params.id
		const all = this.registry.get('allImages')
		const gallery = all.filter((image: Image) => image.gallery)

		const user = get(dbUser)
		const listRef = ref(storage, `viewers/${uid}`)

		listAll(listRef)
			.then((res) => {
				res.prefixes.forEach((folderRef) => {
					// All the prefixes under listRef.
					// You may call listAll() recursively on them.
				})
				res.items.forEach((itemRef) => {
					// All the items under listRef.
				})

				console.log(`LOG..Normal: res.items`, res.items)
			}).catch((error) => {
				// Uh-oh, an error occurred!
			})

		gallery.forEach((image: Image, idx: number) => {
			const storageRef = ref(storage, `viewers/${uid}/${image.filename}`)

			getBlob(storageRef).then((blob) => {

				const reader = new FileReader()
				reader.onloadend = () => {
					const blobString = reader.result as string
					// console.log(`Blob String:`, blobString)

					// Create a new image element
					const img = new Image()
					img.src = blobString

					// Once the image is loaded, add it to Phaser
					img.onload = () => {
						this.textures.addImage(image.filename, img)
						this.add.image(this.game.config.width * (idx / gallery.length), this.game.config.height / 4, image.filename)
					}
				}
				reader.readAsDataURL(blob) // or reader.readAsText(blob) if you need plain text
			})
		})
	}
}
