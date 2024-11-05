import { Boot } from './scenes/Boot'
import { GameOver } from './scenes/GameOver'
import { Game as MainGame } from './scenes/Game'
import { Gallery } from './scenes/Gallery'
import { Carousel } from './scenes/Carousel'
import { AUTO, Game } from 'phaser'
import { Preloader } from './scenes/Preloader'

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1600,
    height: 900,
    parent: 'phaser',
    backgroundColor: '#028af8',
    scene: [
        Boot,
        Preloader,
        // MainMenu,
        // MainGame,
        GameOver,
        Gallery,
        Carousel,
    ]
}

const StartGame = (parent: string) => {

    return new Game({ ...config, parent })

}

export default StartGame
