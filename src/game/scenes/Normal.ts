import { type GameObjects, Scene } from 'phaser'

import { EventBus } from '../EventBus'

export class Normal extends Scene {
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

        // EventBus.emit('current-scene-ready', this)


        const all = this.registry.get('allImages')
        console.log(`LOG..all`, all)

        // const imgs = all.getChildren()

        // this.images?.forEach(image => {
        //     this.add.image(this.game.config.width / 2, this.game.config.width / 2, image.id)
        // })
    }


}
