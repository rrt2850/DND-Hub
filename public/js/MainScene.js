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

        // Load the tileset images
        //this.load.image('1', 'assets/maps/tilesets/Set 1.0.png');
        this.load.image('grass', 'assets/RPG Village Tileset/landscape/dakotatown_outside.png')
        this.load.image('house', 'assets/RPG Village Tileset/houses/dakotatown_house.png')

        // Load the tilemaps in JSON format
        //this.load.tilemapTiledJSON('map', 'assets/maps/test.json');
        this.load.tilemapTiledJSON('dakotatown', 'assets/maps/bruh.json');
    }

    /**
     * Create - Initialization logic to be run when the scene starts
     */
    create() {
        this.setupMap();
        this.setupColliders();
        this.setupPlayer();
        this.setupCamera();
        this.matter.world.createDebugGraphic();

    }

    /**
     * Sets up the game map including the ground and garnish layers
     */
    setupMap() {
        // Create a tilemap using the 'map' key
        //this.map = this.make.tilemap({ key: 'map' });
        this.map = this.make.tilemap({ key: 'dakotatown' });

        // Add a tileset image to the map
        //this.tileset = this.map.addTilesetImage('1', '1', 16, 16, 0, 0);
        this.groundTiles = this.map.addTilesetImage('grass', 'grass', 18, 18, 0, 0);
        this.houseTiles = this.map.addTilesetImage('house', 'house', 18, 18, 0, 0);

        // Create static layers for ground and garnish based on the tileset
        //this.groundLayer = this.map.createStaticLayer('Ground', this.tileset, 0, 0);
        //this.garnishLayer = this.map.createStaticLayer('garnish', this.tileset, 0, 0);
        this.groundLayer = this.map.createStaticLayer('ground', this.groundTiles, 0, 0);
        this.shadowLayer = this.map.createStaticLayer('shadows', this.houseTiles, 0, 0);
        this.houseLayer = this.map.createStaticLayer('house', this.houseTiles, 0, 0);
        this.garnishLayer = this.map.createStaticLayer('garnish', this.houseTiles, 0, 0);
        
        this.groundLayer.setPosition(0, 0);
        this.shadowLayer.setPosition(0, 0);
        this.houseLayer.setPosition(0, 0);
        this.garnishLayer.setPosition(0, 0);

        
    }

    /**
     * Configures colliders for the game's static elements
     */
    setupColliders() {
        // Convert the tiles in the ground layer into colliders for Matter physics
        this.matter.world.convertTilemapLayer(this.groundLayer);
        
        // Fetch wall objects from the tilemap
        const wallsObjects = this.map.getObjectLayer('worldColliders').objects;


        // Iterate through the wall objects and create rectangles as colliders where required
        wallsObjects.forEach(obj => {
            if (obj.properties && obj.properties.find(p => p.name === "collides" && p.value)) {
                console.log("collider found");
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
        this.player = new Player({scene:this, x:310, y:444, texture:'player', frame:'down-idle__(1)'});

        // Set up controls for the player
        this.player.setupMouseControls();

        // Example of creating another player instance (textPlayer for illustrative purposes)
        let textPlayer = new Player({scene:this, x:100, y:100, texture:'player', frame:'down-idle__(1)'});
    }


    /**
     * Sets up the camera to follow the player
     * 
     * NOTE: must be called after the player is instantiated
     */
    setupCamera() {
        const camera = this.cameras.main;
        
        camera.resetFX();

        // Set the camera to follow the player
        camera.startFollow(this.player, true, 0.09, 0.09);

        // Adjust the offset if the player's origin isn't in the center
        // (You'll need to adjust the values if necessary)
        camera.followOffset.set(0, 0);


        camera.setSize(window.innerWidth, window.innerHeight);

        // Make the camera bounds huge so it won't stop following the player
        camera.setBounds(0, 0, 2000, 2000);  

        camera.zoom = 2;

        this.player.setScrollFactor(1);
        

        console.log(camera);
    }


    /**
     * Update - Logic to be run on every game frame update
     */
    update() {
        this.player.update();
    }    
}
