import { type GameObjects, Scene } from 'phaser'
import type { Image, Changed } from '$lib/types'

import { EventBus } from '../EventBus'

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

		console.log(`LOG..Normal`, this.registry.get('allImages'))

		// EventBus.emit('current-scene-ready', this)


		const all = this.registry.get('allImages')
		console.log(`LOG..all`, all)

		// const imgs = all.getChildren()

		// this.images?.forEach(image => {
		//     this.add.image(this.game.config.width / 2, this.game.config.width / 2, image.id)
		// })

		this.add.image(720, 480, all[0].id)
		// this.add.image(512, 384, all[0].id)
		// this.textures.addImage(all[0].id, all[0].url)
		const iggle = this.textures.get(all[0].id).getSourceImage().src
		this.textures.addBase64(all[0].id, iggle)
	}


}
