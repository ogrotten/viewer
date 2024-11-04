import { get } from 'svelte/store'
import { type GameObjects, Scene } from 'phaser'
import { dbUser } from '$lib/firestore'
import type { Image, Changed } from '$lib/types'

import { EventBus } from '../EventBus'
import { getStorage, ref, uploadBytes, getDownloadURL, getBlob } from 'firebase/storage'

const storage = getStorage()

export class Normal extends Scene {
	// allImages: Image[]
	constructor() {
		super('Normal')
	}

	create() {
		// this.background = this.add.image(512, 384, 'background')

		// this.logo = this.add.image(512, 300, 'logo').setDepth(100)

		// this.title = this.add.text(512, 460, 'Normal', {
		//     fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
		//     stroke: '#000000', strokeThickness: 8,
		//     align: 'center'
		// }).setOrigin(0.5).setDepth(100)

		// console.log(`LOG..Normal`, this.registry.get('allImages'))

		// EventBus.emit('current-scene-ready', this)


		const user = get(dbUser)
		const storageRef = ref(storage, `viewers/zjaWkJBzHaMydPkXk42nGJfftWv2/ej7mOuW.png`)
		getBlob(storageRef).then((blob) => {
			const reader = new FileReader()
			reader.onloadend = () => {
				const blobString = reader.result as string
				console.log(`Blob String:`, blobString)

				// Create a new image element
				const img = new Image()
				img.src = blobString

				// Once the image is loaded, add it to Phaser
				img.onload = () => {
					this.textures.addImage('loadedImage', img)
					this.add.image(this.game.config.width / 2, this.game.config.height / 2, 'loadedImage')
				}
			}
			reader.readAsDataURL(blob) // or reader.readAsText(blob) if you need plain text
		})
		const all = this.registry.get('allImages')
		console.log(`LOG..all`, all)

		// const imgs = all.getChildren()

		// console.log(`LOG..Normal: 1st image`, this.textures.get(all[0].id).getSourceImage())
		// console.log(`LOG..Normal: 1st image`, all[0])

		// all.forEach(image => {
		//     this.add.image(this.game.config.width / 2, this.game.config.width / 2, image.id)
		// })

		// this.textures.addBase64(all[19].id, all[19].url)
	}


}
