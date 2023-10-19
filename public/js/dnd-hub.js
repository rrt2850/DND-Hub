import MainScene from './MainScene.js';

const config = {
    width : window.innerWidth,
    height : window.innerHeight,
    backgroundColor: '#333333',
    type: Phaser.AUTO,
    parent: 'dnd-hub',
    scene:[MainScene],
    scale: {
        mode: Phaser.Scale.RESIZE, // scale the game to fit the screen
        autoCenter: Phaser.Scale.CENTER_BOTH,
        zoom: 2,
    },
    physics: {
        default: 'matter',
        matter: {
            debug: true,
            gravity: { y: 0 }
        }
    },
    plugins: {
        scene: [
            {
                plugin: PhaserMatterCollisionPlugin,
                key: 'matterCollision',
                mapping: 'matterCollision'
            }
        ]
    }
}

const game = new Phaser.Game(config);

// Listen for browser resize event
window.addEventListener('resize', () => {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Use Phaser's Scale Manager to resize the game canvas
    game.scale.resize(w, h);
});
