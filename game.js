// Game Configuration
const GAME_CONFIG = {
    minSpeed: 0.1, // Start very slow
    maxSpeed: 0.9, // End very fast
    jumpForce: 0.3, // Increased jump force
    gravity: 0.015,
    laneWidth: 3, // Increased lane width
    totalDistance: 1000 // Meters to run
};

let scene, camera, renderer;
let batman, floor;
let obstacles = [];
let gameActive = false;
let distance = 0;
let currentSpeed = GAME_CONFIG.minSpeed;
let playerPosition = 0; // -1 (left), 0 (center), 1 (right)
let isJumping = false;
let verticalVelocity = 0;
let scoreElement, gameOverElement, gameWinElement, startBtn, mobileControls;
let frameId;
let obstacleSpawnTimer = 0;

// Initialize Game
function initGame() {
    // UI Elements
    scoreElement = document.getElementById('score');
    gameOverElement = document.getElementById('game-over');
    gameWinElement = document.getElementById('game-win');
    startBtn = document.getElementById('start-btn');
    mobileControls = document.getElementById('mobile-controls');
    const container = document.getElementById('game-canvas-container');

    // Scene Setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);
    scene.fog = new THREE.Fog(0x111111, 10, 50);

    // Camera
    camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 7, 12); // Higher and further back
    camera.lookAt(0, 0, -5); // Look slightly ahead of the player

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffcc00, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Floor
    createFloor();

    // Batman Character
    createBatman();

    // Event Listeners
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('restart-btn').addEventListener('click', resetGame);
    document.getElementById('restart-win-btn').addEventListener('click', resetGame);
    window.addEventListener('keydown', handleInput);
    
    // Mobile Controls
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');
    const btnJump = document.getElementById('btn-jump');

    if (btnLeft && btnRight && btnJump) {
        const handleTouch = (action) => (e) => {
            e.preventDefault(); // Prevent default touch behavior
            e.stopPropagation();
            if (gameActive) action();
        };

        // Support both touch and click for better compatibility
        btnLeft.addEventListener('touchstart', handleTouch(moveLeft), { passive: false });
        btnLeft.addEventListener('click', (e) => { if(gameActive) moveLeft(); });

        btnRight.addEventListener('touchstart', handleTouch(moveRight), { passive: false });
        btnRight.addEventListener('click', (e) => { if(gameActive) moveRight(); });

        btnJump.addEventListener('touchstart', handleTouch(jump), { passive: false });
        btnJump.addEventListener('click', (e) => { if(gameActive) jump(); });
    }

    // Handle resizing
    window.addEventListener('resize', () => {
        if(renderer && camera) {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        }
    });

    animate();
}

function createFloor() {
    const geometry = new THREE.PlaneGeometry(50, 2000);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0x222222,
        roughness: 0.8
    });
    floor = new THREE.Mesh(geometry, material);
    floor.rotation.x = -Math.PI / 2;
    floor.position.z = -500;
    floor.receiveShadow = true;
    scene.add(floor);

    // Lane markers
    const lineGeo = new THREE.PlaneGeometry(0.2, 2000);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x444444 });
    
    const leftLine = new THREE.Mesh(lineGeo, lineMat);
    leftLine.rotation.x = -Math.PI / 2;
    leftLine.position.set(-GAME_CONFIG.laneWidth/2, 0.01, -500);
    scene.add(leftLine);

    const rightLine = new THREE.Mesh(lineGeo, lineMat);
    rightLine.rotation.x = -Math.PI / 2;
    rightLine.position.set(GAME_CONFIG.laneWidth/2, 0.01, -500);
    scene.add(rightLine);
}

function createBatman() {
    batman = new THREE.Group();

    // Body
    const bodyGeo = new THREE.BoxGeometry(1, 1, 2);
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const body = new THREE.Mesh(bodyGeo, blackMat);
    body.position.y = 0.5;
    body.castShadow = true;
    batman.add(body);

    // Head
    const headGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const head = new THREE.Mesh(headGeo, blackMat);
    head.position.set(0, 1.2, 0.8);
    head.castShadow = true;
    batman.add(head);

    // Ears
    const earGeo = new THREE.ConeGeometry(0.15, 0.4, 4);
    const earL = new THREE.Mesh(earGeo, blackMat);
    earL.position.set(-0.25, 1.7, 0.8);
    batman.add(earL);
    
    const earR = new THREE.Mesh(earGeo, blackMat);
    earR.position.set(0.25, 1.7, 0.8);
    batman.add(earR);

    // Eyes (Yellow)
    const eyeGeo = new THREE.BoxGeometry(0.15, 0.15, 0.1);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
    
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.2, 1.3, 1.21);
    batman.add(eyeL);

    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.2, 1.3, 1.21);
    batman.add(eyeR);

    // Tail
    const tailGeo = new THREE.BoxGeometry(0.2, 0.2, 1.5);
    const tail = new THREE.Mesh(tailGeo, blackMat);
    tail.position.set(0, 0.8, -1.2);
    tail.rotation.x = 0.5;
    batman.add(tail);

    // Collar
    const collarGeo = new THREE.BoxGeometry(0.85, 0.1, 0.85);
    const collarMat = new THREE.MeshBasicMaterial({ color: 0xff3b30 });
    const collar = new THREE.Mesh(collarGeo, collarMat);
    collar.position.set(0, 0.9, 0.8);
    batman.add(collar);

    // Rotate Batman to face away from camera (running forward into distance)
    batman.rotation.y = Math.PI;

    scene.add(batman);
}

function createObstacle(zPos) {
    const type = Math.random();
    let obstacle;

    if (type < 0.25) {
        // Crate
        const geo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        const mat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        obstacle = new THREE.Mesh(geo, mat);
        obstacle.position.y = 0.75;
    } else if (type < 0.5) {
        // Rock
        const geo = new THREE.DodecahedronGeometry(0.8);
        const mat = new THREE.MeshStandardMaterial({ color: 0x666666 });
        obstacle = new THREE.Mesh(geo, mat);
        obstacle.position.y = 0.8;
    } else if (type < 0.75) {
        // Dog
        obstacle = new THREE.Group();
        
        // Body
        const bodyGeo = new THREE.BoxGeometry(0.8, 0.6, 1.2);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xCD853F }); // Peru color
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.5;
        obstacle.add(body);
        
        // Head
        const headGeo = new THREE.BoxGeometry(0.5, 0.5, 0.6);
        const head = new THREE.Mesh(headGeo, bodyMat);
        head.position.set(0, 0.9, 0.5);
        obstacle.add(head);

        // Ears
        const earGeo = new THREE.ConeGeometry(0.1, 0.2, 4);
        const earL = new THREE.Mesh(earGeo, bodyMat);
        earL.position.set(-0.15, 1.2, 0.5);
        obstacle.add(earL);
        const earR = new THREE.Mesh(earGeo, bodyMat);
        earR.position.set(0.15, 1.2, 0.5);
        obstacle.add(earR);

        obstacle.position.y = 0;
    } else {
        // Fat Ugly Thief
        obstacle = new THREE.Group();
        
        // Fat Body
        const bodyGeo = new THREE.BoxGeometry(1.8, 1.5, 1.0); // Wide and fat
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2F4F4F }); // Dark Slate Gray
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.75;
        obstacle.add(body);
        
        // Ugly Head
        const headGeo = new THREE.BoxGeometry(0.5, 0.6, 0.5);
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xFFCCAA });
        const head = new THREE.Mesh(headGeo, skinMat);
        head.position.set(0, 1.6, 0);
        obstacle.add(head);
        
        // Mask
        const maskGeo = new THREE.BoxGeometry(0.55, 0.2, 0.55);
        const maskMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const mask = new THREE.Mesh(maskGeo, maskMat);
        mask.position.set(0, 1.85, 0);
        obstacle.add(mask);
        
        // Loot Bag
        const bagGeo = new THREE.DodecahedronGeometry(0.6);
        const bagMat = new THREE.MeshStandardMaterial({ color: 0xDAA520 }); // Gold color
        const bag = new THREE.Mesh(bagGeo, bagMat);
        bag.position.set(0.6, 1.0, -0.6);
        obstacle.add(bag);

        obstacle.position.y = 0;
    }

    // Random lane (-1, 0, 1)
    const lane = Math.floor(Math.random() * 3) - 1;
    obstacle.position.x = lane * GAME_CONFIG.laneWidth;
    obstacle.position.z = zPos;
    
    // Shadow support
    obstacle.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    
    // Add collision data
    obstacle.userData = { lane: lane, passed: false };
    
    scene.add(obstacle);
    obstacles.push(obstacle);
}

function createHouse() {
    if (house) scene.remove(house);
    house = new THREE.Group();
    
    // Base
    const baseGeo = new THREE.BoxGeometry(6, 4, 6);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 2;
    house.add(base);

    // Roof
    const roofGeo = new THREE.ConeGeometry(5, 3, 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xcc0000 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 5.5;
    roof.rotation.y = Math.PI / 4;
    house.add(roof);

    // Door
    const doorGeo = new THREE.BoxGeometry(1.5, 2.5, 0.1);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x654321 });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, 1.25, 3.01);
    house.add(door);

    house.position.z = -GAME_CONFIG.totalDistance; // End of track
    scene.add(house);
}

function startGame() {
    if(gameActive) return;
    gameActive = true;
    distance = 0;
    currentSpeed = GAME_CONFIG.minSpeed;
    playerPosition = 0;
    batman.position.set(0, 0, 0);
    
    // Clear old obstacles
    obstacles.forEach(ob => scene.remove(ob));
    obstacles = [];

    // Reset UI
    startBtn.style.display = 'none';
    gameOverElement.classList.add('hidden');
    gameWinElement.classList.add('hidden');
    if(mobileControls) mobileControls.classList.remove('hidden'); // Show mobile controls
    const lang = document.documentElement.lang || 'en';
    const prefix = (window.translations && window.translations[lang] && window.translations[lang].game_distance) || "Distance: ";
    scoreElement.innerText = `${prefix}0m`;

    createHouse();
}

function resetGame() {
    startGame();
}

// Action functions
function moveLeft() {
    if (playerPosition > -1) playerPosition--;
}

function moveRight() {
    if (playerPosition < 1) playerPosition++;
}

function jump() {
    if (!isJumping) {
        isJumping = true;
        verticalVelocity = GAME_CONFIG.jumpForce;
    }
}

function handleInput(e) {
    if (!gameActive) return;

    if (e.key === 'ArrowLeft') {
        moveLeft();
    } else if (e.key === 'ArrowRight') {
        moveRight();
    } else if (e.key === 'ArrowUp' || e.key === ' ') {
        jump();
    }
}

function checkCollision() {
    const batmanBox = new THREE.Box3().setFromObject(batman);
    
    for (let obs of obstacles) {
        const obsBox = new THREE.Box3().setFromObject(obs);
        if (batmanBox.intersectsBox(obsBox)) {
            gameOver();
            return;
        }
    }
}

function gameOver() {
    gameActive = false;
    gameOverElement.classList.remove('hidden');
    if(mobileControls) mobileControls.classList.add('hidden');
}

function gameWin() {
    gameActive = false;
    gameWinElement.classList.remove('hidden');
    if(mobileControls) mobileControls.classList.add('hidden');
}

function animate() {
    requestAnimationFrame(animate);

    if (gameActive) {
        // Calculate Dynamic Speed
        // Slow (minSpeed) to Fast (maxSpeed) from 0m to 900m
        if (distance < 900) {
            const progress = distance / 900;
            currentSpeed = GAME_CONFIG.minSpeed + (GAME_CONFIG.maxSpeed - GAME_CONFIG.minSpeed) * progress;
        } else {
            currentSpeed = GAME_CONFIG.maxSpeed;
        }

        // Move Forward
        distance += currentSpeed;
        const lang = document.documentElement.lang || 'en';
        const prefix = (window.translations && window.translations[lang] && window.translations[lang].game_distance) || "Distance: ";
        scoreElement.innerText = `${prefix}${Math.floor(distance)}m / ${GAME_CONFIG.totalDistance}m`;

        // Update Floor/World illusion (Move objects towards camera)
        // Actually simpler: Move Batman forward? No, usually world moves back.
        // Let's move obstacles and house towards Z+
        
        // Spawn Obstacles
        obstacleSpawnTimer++;
        // Adjust spawn rate based on speed to keep density consistent or harder
        // Higher speed = spawn faster?
        // Base rate 60 frames (1 sec at 60fps)
        // Let's spawn more often as we get faster to maintain challenge
        const spawnRate = Math.max(20, Math.floor(60 - (currentSpeed - GAME_CONFIG.minSpeed) * 80));
        
        if (obstacleSpawnTimer > spawnRate) { 
            if (distance < GAME_CONFIG.totalDistance - 50) { // Stop spawning near end
                createObstacle(-50); // Spawn far ahead
            }
            obstacleSpawnTimer = 0;
        }

        // Move Obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
            const obs = obstacles[i];
            obs.position.z += currentSpeed;

            // Simple wobble animation for characters (Groups)
            if (obs.type === 'Group') {
                obs.rotation.z = Math.sin(Date.now() * 0.01 + obs.id) * 0.05; // Waddle
                obs.position.y = Math.abs(Math.sin(Date.now() * 0.015 + obs.id)) * 0.1; // Hop
            }
            
            // Remove if passed
            if (obs.position.z > 10) {
                scene.remove(obs);
                obstacles.splice(i, 1);
            }
        }

        // Move House
        if (house) {
            house.position.z += currentSpeed;
            if (house.position.z > 0 && distance >= GAME_CONFIG.totalDistance) {
                gameWin();
            }
        }

        // Player Movement (Lerp for smooth lane switch)
        const targetX = playerPosition * GAME_CONFIG.laneWidth;
        batman.position.x += (targetX - batman.position.x) * 0.1;

        // Jump Physics
        if (isJumping) {
            batman.position.y += verticalVelocity;
            verticalVelocity -= GAME_CONFIG.gravity;
            if (batman.position.y <= 0) {
                batman.position.y = 0;
                isJumping = false;
            }
        }

        // Bobbing animation
        if (!isJumping) {
            batman.position.y = Math.abs(Math.sin(Date.now() * 0.01)) * 0.1;
        }
        
        // Check collisions (Simple distance check for lane + z)
        obstacles.forEach(obs => {
            // If in same lane
            // And Z overlap
            const zDiff = Math.abs(obs.position.z - batman.position.z);
            const xDiff = Math.abs(obs.position.x - batman.position.x);
            
            if (zDiff < 1.0 && xDiff < 1.0 && batman.position.y < 1.0) {
                gameOver();
            }
        });

        if (distance >= GAME_CONFIG.totalDistance + 10) {
           // Safety stop
           gameWin();
        }
    }

    renderer.render(scene, camera);
}

// Start
initGame();