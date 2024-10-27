import { type GameObjects, Scene } from 'phaser'
import type { Image, Changed } from '$lib/types'

import { EventBus } from '../EventBus'

export class Normal extends Scene {
    // allImages: Image[]
    constructor() {
        super('MainMenu')
        // this.allImages = []
    }

    create() {
        // this.background = this.add.image(512, 384, 'background')

        // this.logo = this.add.image(512, 300, 'logo').setDepth(100)

        // this.title = this.add.text(512, 460, 'Main Menu', {
        //     fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
        //     stroke: '#000000', strokeThickness: 8,
        //     align: 'center'
        // }).setOrigin(0.5).setDepth(100)

        console.log(`LOG..Normal`, this.allImages)

        EventBus.emit('current-scene-ready', this)
    }


}
