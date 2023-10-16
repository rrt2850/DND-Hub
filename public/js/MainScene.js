// Importing the Player class
import Player from './player.js';

/**
 * MainScene class - Represents the primary scene of the game
 * @extends Phaser.Scene
 */
export default class MainScene extends Phaser.Scene {
    
    /**
     * Constructor for the MainScene
     */
    constructor() {
        super('MainScene');
    }

    /**
     * Preload - Load necessary assets before the scene starts
     */
    preload() {
        // Preload player assets
        Player.preload(this);

        // Load the tileset image
        this.load.image('1', 'assets/maps/tilesets/Set 1.0.png');

        // Load the tilemap in JSON format
        this.load.tilemapTiledJSON('map', 'assets/maps/test.json');
    }

    /**
     * Create - Initialization logic to be run when the scene starts
     */
    create() {
        this.setupMap();
        this.setupColliders();
        this.setupPlayer();
    }

    /**
     * Sets up the game map including the ground and garnish layers
     */
    setupMap() {
        // Create a tilemap using the 'map' key
        this.map = this.make.tilemap({ key: 'map' });

        // Add a tileset image to the map
        this.tileset = this.map.addTilesetImage('1', '1', 16, 16, 0, 0);

        // Create static layers for ground and garnish based on the tileset
        this.groundLayer = this.map.createStaticLayer('Ground', this.tileset, 0, 0);
        this.garnishLayer = this.map.createStaticLayer('garnish', this.tileset, 0, 0);
    }

    /**
     * Configures colliders for the game's static elements
     */
    setupColliders() {
        // Convert the tiles in the ground layer into colliders for Matter physics
        this.matter.world.convertTilemapLayer(this.groundLayer);
        
        // Fetch wall objects from the tilemap
        const wallsObjects = this.map.getObjectLayer('walls').objects;

        // Iterate through the wall objects and create rectangles as colliders where required
        wallsObjects.forEach(obj => {
            if (obj.properties && obj.properties.find(p => p.name === "collides" && p.value)) {
                this.matter.add.rectangle(
                    obj.x + obj.width / 2, 
                    obj.y + obj.height / 2,
                    obj.width,
                    obj.height, 
                    { isStatic: true }
                );
            }
        });
    }

    /**
     * Initializes player-related game entities
     */
    setupPlayer() {
        // Instantiate the main player character
        this.player = new Player({scene:this, x:20, y:20, texture:'player', frame:'down-idle__(1)'});
        
        // Set up controls for the player
        this.player.setupMouseControls();

        // Example of creating another player instance (textPlayer for illustrative purposes)
        let textPlayer = new Player({scene:this, x:100, y:100, texture:'player', frame:'down-idle__(1)'});
    }

    /**
     * Update - Logic to be run on every game frame update
     */
    update() {
        // Update the player's state and animations
        this.player.update();
    }
}
