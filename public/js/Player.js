// Constants for player speed and a quarter of PI (used for angle calculations)
const PLAYER_SPEED = 2.5;
const QUARTER_PI = Math.PI / 4;

/**
 * Player Class representing a player character in a game using the Phaser library
 * Extends Phaser's Matter Sprite to include physics
 */
export default class Player extends Phaser.Physics.Matter.Sprite {
    
    /**
     * Constructor for the Player class
     * 
     * @param {Object} data - Configuration data for the Player
     * @param {Phaser.Scene} data.scene - Scene where the player will be added
     * @param {number} data.x - X coordinate of the player
     * @param {number} data.y - Y coordinate of the player
     * @param {string} data.texture - The key of the texture to be used
     * @param {string} data.frame - Frame name from texture to be used
     */
    constructor(data) {
        const { scene, x, y, texture, frame } = data;
        super(scene.matter.world, x, y, texture, frame);
        
        // Add this sprite to the current scene
        scene.add.existing(this);

        // Default direction for the player
        this.lastDirection = 'down';

        // Setting up Matter.js bodies for collision and sensor detection
        const { Body, Bodies } = Phaser.Physics.Matter.Matter;
        const playerCollider = Bodies.circle(x, y, 6, { isSensor: false, label: 'playerCollider' });
        const playerSensor = Bodies.circle(x, y, 12, { isSensor: true, label: 'playerSensor' });

        const compoundBody = Body.create({
            parts: [playerCollider, playerSensor],
            frictionAir: 0.35,
        });

        Body.setPosition(compoundBody, { x, y });

        this.setExistingBody(compoundBody);
        this.setFixedRotation();

        // Object to store keyboard inputs
        this.inputKeys = {};
        this.setupInputKeys();

        // Flag to check if an animation is playing
        this.isPlayingAnimation = false;

        this.on('animationstart', (animation) => {
            if (this.isActionAnimation(animation.key)) {
                this.isPlayingAnimation = true;
            }
        });
        
        this.on('animationcomplete', (animation) => {
            if (this.isActionAnimation(animation.key)) {
                this.isPlayingAnimation = false;
            }
        });        
    }

    /**
     * Method to set up keyboard keys for player movement
     */
    setupInputKeys() {
        this.inputKeys = this.scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        });
    }

    isActionAnimation(animationKey) {
        const actionAnimations = ['right-swing', 'down-swing', 'up-swing']; // Add other action animations if needed
        return actionAnimations.includes(animationKey);
    }
    

    /**
     * Method to set up mouse controls for the player's attack
     */
    setupMouseControls() {
        this.scene.input.off('pointerdown', this.boundHandleAttack); // remove if previously set
        this.boundHandleAttack = this.handleAttack.bind(this); // bind once and keep a reference
        this.scene.input.on('pointerdown', this.boundHandleAttack);
    }

    /**
     * Method to remove mouse controls for the player's attack
     */
    removeMouseControls() {
        this.scene.input.off('pointerdown', this.boundHandleAttack);
    }
    /**
     * Handle player's attack based on the angle between player and mouse pointer
     * 
     * @param {Phaser.Input.Pointer} pointer - The mouse pointer object.
     */
    handleAttack(pointer) {
        // If an attack animation is playing, don't attack
        if (this.isPlayingAnimation) {
            return;
        }
        
        // get angle between player and mouse pointer
        const angle = Phaser.Math.Angle.Between(this.x, this.y, pointer.x, pointer.y);
        
        // Constants for angle calculations
        const QUARTER_PI = Math.PI / 4;
        const THREE_QUARTERS_PI = 3 * Math.PI / 4;
        
        // Right:
        if (angle >= -QUARTER_PI && angle < QUARTER_PI) {
            this.anims.play('right-swing', false);
            this.flipX = false;
            this.lastDirection = 'right';
        }
        // Up:
        else if (angle >= QUARTER_PI && angle < THREE_QUARTERS_PI) {
            this.anims.play('up-swing', false);
            this.lastDirection = 'up';
        }
        // Left:
        else if (angle >= THREE_QUARTERS_PI || angle < -THREE_QUARTERS_PI) {
            this.anims.play('right-swing', false);
            this.flipX = true;
            this.lastDirection = 'left';
        }
        // Down:
        else if (angle >= -THREE_QUARTERS_PI && angle < -QUARTER_PI) {
            this.anims.play('down-swing', false);
            this.lastDirection = 'down';
        }
    }
    
    /**
     * Preloads assets for the player character
     * 
     * @param {Phaser.Scene} scene - The current scene
     */
    static preload(scene) {
        // TODO: rewrite this but generic
        scene.load.atlas('player', 'assets/npc/player/player.png', 'assets/npc/player/player_atlas.json');
        scene.load.animation('playerAnim', 'assets/npc/player/player_anim.json');
    }

    /**
     * Getter for player's current velocity
     * 
     * @returns {Phaser.Physics.Matter.Components.Velocity} - The velocity of the player
     */
    get velocity() {
        return this.body.velocity;
    }

    /**
     * Play animation based on player's movement direction
     * 
     * @param {Phaser.Math.Vector2} playerVelocity - The current velocity of the player
     */
    playAnimationBasedOnMovement(playerVelocity) {
        // If an animation is playing, don't switch the animation
        if (this.isPlayingAnimation) {
            return;
        }

        // If the player is moving, play the walk animation
        // based on the player's direction
        if (playerVelocity.x) {
            this.anims.play('right-run', true);
        } else if (playerVelocity.y) {
            if (playerVelocity.y < 0) {
                this.anims.play('up-run', true);
            } else {
                this.anims.play('down-run', true);
            }
        }
        // If the player is still, play the idle animation
        // based on the player's last direction
        else {
            if (this.lastDirection === 'up') {
                this.anims.play('up-idle', true);
            } else if (this.lastDirection === 'down') {
                this.anims.play('down-idle', true);
            } else {
                this.anims.play('right-idle', true);
                if (this.lastDirection === 'left') {
                    this.flipX = true;
                } else {
                    this.flipX = false;
                }
            }
        }
    }

    /**
     * Update method called on every frame. Handles player's movement and attack
     */
    update() {
        let playerVelocity = new Phaser.Math.Vector2();
    
        // Handle vertical movement
        if (this.inputKeys.up?.isDown) {
            playerVelocity.y = -PLAYER_SPEED;
            this.lastDirection = 'up';
        } else if (this.inputKeys.down?.isDown) {
            playerVelocity.y = PLAYER_SPEED;
            this.lastDirection = 'down';
        }
    
        // Handle horizontal movement
        if (this.inputKeys.left?.isDown) {
            playerVelocity.x = -PLAYER_SPEED;
            this.lastDirection = 'left';
            this.flipX = true;
        } else if (this.inputKeys.right?.isDown) {
            playerVelocity.x = PLAYER_SPEED;
            this.lastDirection = 'right';
            this.flipX = false;
        }
    
        // fix fast diagonal movement
        playerVelocity.normalize().scale(PLAYER_SPEED);
        
        // Update player's velocity
        this.setVelocity(playerVelocity.x, playerVelocity.y);
    
        // Play animations based on player's movement
        this.playAnimationBasedOnMovement(playerVelocity);
    }
}
