import { Boot } from './scenes/Boot'
import { GameOver } from './scenes/GameOver'
import { Game as MainGame } from './scenes/Game'
import { Normal } from './scenes/Normal'
import { AUTO, Game } from 'phaser'
import { Preloader } from './scenes/Preloader'

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1024,
    height: 768,
    parent: 'phaser',
    backgroundColor: '#028af8',
    scene: [
        Boot,
        Preloader,
        // MainMenu,
        // MainGame,
        GameOver,
        Normal,
    ]
}

const StartGame = (parent: string) => {

    return new Game({ ...config, parent })

}

export default StartGame
