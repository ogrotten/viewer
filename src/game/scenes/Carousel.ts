import { page } from '$app/stores'
import { get } from 'svelte/store'
import { type GameObjects, Scene } from 'phaser'
import { dbUser } from '$lib/firestore'
import type { Image, Changed } from '$lib/types'

import { EventBus } from '../EventBus'
import { getStorage, ref, listAll, getBlob } from 'firebase/storage'

const storage = getStorage()

export class Carousel extends Scene {
	// allImages: Image[]
	constructor() {
		super('Carousel')
	}

	create() {
		const uid = get(page).params.id
		const all = this.registry.get('allImages')
		const carousel = all.filter((image: Image) => image.carousel)
		console.log(`LOG..Carousel: carousel`, carousel)
		const w = this.game.config.width as number
		const h = this.game.config.height as number

		// let scale = { w: 1, h: 1 }
		// if (carousel[0].height > h) {
		// 	scale.h = (carousel[0].height / h)
		// } else {
		// 	scale.h = (h / carousel[0].height)
		// }

		// if (carousel[0].width > w) {
		// 	scale.w = (carousel[0].width / w)
		// } else {
		// 	scale.w = (w / carousel[0].width)
		// }

		const borderbox = new Phaser.Geom.Rectangle(w / 2, h / 2, w, h)

		// carousel.forEach((image: Image, idx: number) => {
		const storageRef = ref(storage, `viewers/${uid}/${carousel[0].filename}`)

		getBlob(storageRef).then((blob) => {

			const reader = new FileReader()
			reader.onloadend = () => {
				const blobString = reader.result as string

				const img = new Image()
				img.src = blobString

				img.onload = () => {
					this.textures.addImage(carousel[0].filename, img)
					// this.add.image(w / 2, h / 2, carousel[0].filename)

					// this.add.image(w / 2, h / 2, carousel[0].filename).setScale(Math.min(scale.w, scale.h))
					// this.add.image(w / 2, h / 2, carousel[0].filename).setDisplaySize(w, h)
					// this.add.image(w / 2, h / 2, carousel[0].filename).setDisplaySize(scale.w * w, scale.h * h)

					const txtr = this.add.image(w / 2, h / 2, carousel[0].filename)

					const scaleX = borderbox.width / txtr.width
					const scaleY = borderbox.height / txtr.height
					const scale = Math.min(scaleX, scaleY)
					txtr.setScale(scale)
					txtr.setOrigin(0.5, 0.5)
					// txtr.setPosition(borderbox.centerX, borderbox.centerY)
				}
			}
			reader.readAsDataURL(blob) // or reader.readAsText(blob) if you need plain text
		})
		// })
	}
}
