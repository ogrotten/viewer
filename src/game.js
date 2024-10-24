import Phaser from 'phaser'

const config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	parent: 'phaser', // Attach Phaser game to the specific div
	scene: {
		preload: preload,
		create: create,
		update: update,
	},
	backgroundColor: '#ffffff',
}

const game = new Phaser.Game(config)

function preload() {
	// Load assets here
}

function create() {
	// Initialize game objects here
}

function update() {
	// Game logic goes here
}
