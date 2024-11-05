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

		gallery.forEach((image: Image, idx: number) => {
			const storageRef = ref(storage, `viewers/${uid}/${image.filename}`)

			getBlob(storageRef).then((blob) => {

				const reader = new FileReader()
				reader.onloadend = () => {
					const blobString = reader.result as string

					const img = new Image()
					img.src = blobString

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
