// 3D Cat Viewer Script
(function() {
    const container = document.getElementById('cat-viewer-canvas');
    if (!container) return;

    let scene, camera, renderer, catGroup;
    let frameId;

    function init() {
        // Scene Setup
        scene = new THREE.Scene();
        // Transparent background handled by renderer
        
        // Camera
        camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
        camera.position.set(4, 3, 6);
        camera.lookAt(0, 0, 0);

        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
        dirLight.position.set(5, 10, 7);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        scene.add(dirLight);

        const fillLight = new THREE.PointLight(0xffcc00, 0.5);
        fillLight.position.set(-5, 2, -5);
        scene.add(fillLight);

        // Controls
        if (typeof THREE.OrbitControls !== 'undefined') {
            const controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.minDistance = 3;
            controls.maxDistance = 10;
            controls.autoRotate = true;
            controls.autoRotateSpeed = 2.0;
            
            // Store controls in scene userData to access in animate loop if needed
            scene.userData.controls = controls;
        }

        // --- Build 3D Cat Model (Cute Low Poly) ---
        createCatModel();

        // Handle Resize
        window.addEventListener('resize', onWindowResize);
        
        // Start Animation Loop
        animate();
    }

    function createStripeTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // Background Black
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, 512, 64);
        
        // Yellow Stripes (Vertical along the collar ring)
        ctx.fillStyle = '#ffcc00';
        
        const numStripes = 40; // "Alot" of stripes
        const segmentWidth = 512 / numStripes;
        const stripeWidth = segmentWidth * 0.15; // 15% yellow, 85% black (Thin stripes)
        
        for (let i = 0; i < numStripes; i++) {
            const x = i * segmentWidth;
            ctx.fillRect(x, 0, stripeWidth, 64);
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    function createCatModel() {
        catGroup = new THREE.Group();

        // Materials
        const blackMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x111111, 
            roughness: 0.6,
            metalness: 0.1,
            flatShading: true 
        });
        
        const darkGreyMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x222222, 
            roughness: 0.8,
            flatShading: true 
        });

        const eyeMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffcc00,
            emissive: 0xffaa00,
            emissiveIntensity: 0.5,
            roughness: 0.2
        });
        
        const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const noseMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 }); 
        const whiskerMaterial = new THREE.LineBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.5 });
        
        // Collar with Stripes Texture
        const stripeTexture = createStripeTexture();
        const collarMaterial = new THREE.MeshStandardMaterial({ 
            map: stripeTexture,
            roughness: 0.4,
            metalness: 0.3
        });
        
        const bellMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffcc00, 
            roughness: 0.2, 
            metalness: 0.6 
        });

        // --- BODY (Slimmer & Longer) ---
        const bodyGroup = new THREE.Group();
        
        // Main Torso - Thinner and Longer
        const torsoGeo = new THREE.CylinderGeometry(0.55, 0.62, 2.2, 12);
        torsoGeo.rotateX(Math.PI / 2);
        const torso = new THREE.Mesh(torsoGeo, blackMaterial);
        torso.position.y = 1.2;
        torso.castShadow = true;
        bodyGroup.add(torso);
        
        // Chest - Smaller
        const chestGeo = new THREE.SphereGeometry(0.64, 12, 12);
        const chest = new THREE.Mesh(chestGeo, blackMaterial);
        chest.position.set(0, 1.2, 1.0);
        bodyGroup.add(chest);
        
        // Rear - Smaller
        const rearGeo = new THREE.SphereGeometry(0.64, 12, 12);
        const rear = new THREE.Mesh(rearGeo, blackMaterial);
        rear.position.set(0, 1.2, -1.0);
        bodyGroup.add(rear);

        catGroup.add(bodyGroup);

        // --- HEAD GROUP ---
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 2.1, 1.6); // Higher and further forward
        
        // Main Head Sphere
        const headGeo = new THREE.SphereGeometry(0.6, 16, 16);
        headGeo.scale(1, 0.85, 0.85); 
        const head = new THREE.Mesh(headGeo, blackMaterial);
        head.castShadow = true;
        headGroup.add(head);

        // Ears
        const earGeo = new THREE.ConeGeometry(0.22, 0.5, 4);
        
        const earL = new THREE.Mesh(earGeo, blackMaterial);
        earL.position.set(-0.3, 0.45, 0);
        earL.rotation.set(-0.2, 0, 0.4);
        headGroup.add(earL);
        
        const earR = new THREE.Mesh(earGeo, blackMaterial);
        earR.position.set(0.3, 0.45, 0);
        earR.rotation.set(-0.2, 0, -0.4);
        headGroup.add(earR);

        // Inner Ears
        const innerEarGeo = new THREE.ConeGeometry(0.12, 0.35, 4);
        const innerEarL = new THREE.Mesh(innerEarGeo, darkGreyMaterial);
        innerEarL.position.set(-0.3, 0.45, 0.05);
        innerEarL.rotation.set(-0.2, 0, 0.4);
        headGroup.add(innerEarL);
        
        const innerEarR = new THREE.Mesh(innerEarGeo, darkGreyMaterial);
        innerEarR.position.set(0.3, 0.45, 0.05);
        innerEarR.rotation.set(-0.2, 0, -0.4);
        headGroup.add(innerEarR);

        // Eyes
        const eyeGeo = new THREE.SphereGeometry(0.12, 12, 12);
        
        const eyeL = new THREE.Mesh(eyeGeo, eyeMaterial);
        eyeL.position.set(-0.2, 0.05, 0.45);
        eyeL.scale.set(1, 1.2, 0.5);
        headGroup.add(eyeL);
        
        const eyeR = new THREE.Mesh(eyeGeo, eyeMaterial);
        eyeR.position.set(0.2, 0.05, 0.45);
        eyeR.scale.set(1, 1.2, 0.5);
        headGroup.add(eyeR);

        // Pupils
        const pupilGeo = new THREE.SphereGeometry(0.05, 8, 8);
        
        const pupilL = new THREE.Mesh(pupilGeo, pupilMaterial);
        pupilL.position.set(-0.2, 0.05, 0.5);
        pupilL.scale.set(0.5, 1.5, 0.2);
        headGroup.add(pupilL);
        
        const pupilR = new THREE.Mesh(pupilGeo, pupilMaterial);
        pupilR.position.set(0.2, 0.05, 0.5);
        pupilR.scale.set(0.5, 1.5, 0.2);
        headGroup.add(pupilR);

        // Snout
        const snoutGeo = new THREE.SphereGeometry(0.22, 12, 12);
        snoutGeo.scale(1, 0.8, 0.8);
        const snout = new THREE.Mesh(snoutGeo, blackMaterial);
        snout.position.set(0, -0.18, 0.45);
        headGroup.add(snout);

        // Nose
        const noseGeo = new THREE.ConeGeometry(0.05, 0.05, 3);
        noseGeo.rotateX(Math.PI / 2);
        noseGeo.rotateZ(Math.PI);
        const nose = new THREE.Mesh(noseGeo, noseMaterial);
        nose.position.set(0, -0.13, 0.65);
        headGroup.add(nose);

        // Whiskers
        const whiskerGroup = new THREE.Group();
        const whiskerGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0.6, 0.1, 0)
        ]);
        
        // Left Whiskers
        for(let i=0; i<3; i++) {
            const w = new THREE.Line(whiskerGeo, whiskerMaterial);
            w.position.set(-0.18, -0.18 + (i*0.05), 0.55);
            w.rotation.set(0, 0.3, 2.8 + (i*0.2));
            whiskerGroup.add(w);
        }
        
        // Right Whiskers
        for(let i=0; i<3; i++) {
            const w = new THREE.Line(whiskerGeo, whiskerMaterial);
            w.position.set(0.18, -0.18 + (i*0.05), 0.55);
            w.rotation.set(0, -0.3, 0.3 - (i*0.2));
            whiskerGroup.add(w);
        }
        headGroup.add(whiskerGroup);

        catGroup.add(headGroup);

        // --- NECK ---
        // Connects Body (Y=1.2, Z=1.0) to Head (Y=2.1, Z=1.6)
        const neckGeo = new THREE.CylinderGeometry(0.35, 0.5, 1.0, 16);
        const neck = new THREE.Mesh(neckGeo, blackMaterial);
        neck.position.set(0, 1.6, 1.3);
        neck.rotation.x = 0.9; // Tilt forward (Positive rotation for +Z)
        catGroup.add(neck);

        // --- COLLAR ---
        // Rotate geometry to lie flat in XZ plane (perpendicular to Y axis)
        // Increased radius to 0.45 to ensure it clears the neck all around
        const collarGeo = new THREE.TorusGeometry(0.45, 0.05, 12, 48).rotateX(Math.PI / 2);
        const collar = new THREE.Mesh(collarGeo, collarMaterial);
        // Positioned concentric with neck axis. 
        // Neck center (0, 1.6, 1.3), rotation 0.9.
        // Moving up neck axis by +0.15 units:
        // dy = 0.15 * cos(0.9) = 0.093
        // dz = 0.15 * sin(0.9) = 0.117
        // New Pos = (0, 1.6+0.093, 1.3+0.117) = (0, 1.69, 1.42)
        collar.position.set(0, 1.69, 1.42); 
        collar.rotation.x = 0.9; // Align with neck rotation
        catGroup.add(collar);
        
        // Bell - Attached to collar throat
        const bellGeo = new THREE.SphereGeometry(0.08, 12, 12);
        const bell = new THREE.Mesh(bellGeo, bellMaterial);
        // Position relative to collar center (0, 1.69, 1.42)
        // Move forward along local Z (which is tilted) and down?
        // Actually, easiest to offset from collar position using trig
        // Local Z offset (throat) = radius (0.45)
        // Global dy = -0.45 * sin(0.9) = -0.35
        // Global dz = 0.45 * cos(0.9) = 0.28
        // Bell Pos = (0, 1.69-0.35, 1.42+0.28) = (0, 1.34, 1.70)
        bell.position.set(0, 1.34, 1.70); 
        catGroup.add(bell);

        // --- LEGS (Longer) ---
        function createLeg(x, y, z) {
            const legGroup = new THREE.Group();
            legGroup.position.set(x, y, z);
            
            // Upper Leg - Thinner & Longer
            const upperGeo = new THREE.CylinderGeometry(0.15, 0.12, 1.2, 8);
            const upper = new THREE.Mesh(upperGeo, blackMaterial);
            upper.position.y = -0.6; // Center of cylinder
            legGroup.add(upper);
            
            // Paw
            const pawGeo = new THREE.SphereGeometry(0.16, 12, 12);
            pawGeo.scale(1, 0.6, 1.2);
            const paw = new THREE.Mesh(pawGeo, blackMaterial);
            paw.position.set(0, -1.2, 0.05); // Lower paw position
            legGroup.add(paw);
            
            return legGroup;
        }

        // Attach legs higher on body, but they extend further down
        const legY = 1.3; 
        
        const legFL = createLeg(-0.3, legY, 1.2);
        catGroup.add(legFL);
        
        const legFR = createLeg(0.3, legY, 1.2);
        catGroup.add(legFR);
        
        const legBL = createLeg(-0.35, legY, -0.8);
        catGroup.add(legBL);
        
        const legBR = createLeg(0.35, legY, -0.8);
        catGroup.add(legBR);

        // --- TAIL (Long S-Shape to back) ---
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0.6, -0.5),   // Start arch up
            new THREE.Vector3(0, 0.3, -1.2),   // Dip down (The S)
            new THREE.Vector3(0, 1.0, -1.8),   // Curve back up
            new THREE.Vector3(0, 1.6, -2.2)    // Long tip
        ]);
        
        // Thinner tube radius: 0.07
        const tailGeo = new THREE.TubeGeometry(curve, 24, 0.07, 8, false);
        const tail = new THREE.Mesh(tailGeo, blackMaterial);
        tail.position.set(0, 1.0, -1.2);
        catGroup.add(tail);

        // Final Scale Adjustment
        catGroup.scale.set(0.85, 0.85, 0.85);
        catGroup.position.y = -0.8; // Lower the whole group so paws touch "ground"

        scene.add(catGroup);
    }

    function onWindowResize() {
        if (!camera || !renderer) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }

    function animate() {
        frameId = requestAnimationFrame(animate);
        
        if (catGroup) {
            // Gentle breathing animation
            const time = Date.now() * 0.002;
            catGroup.position.y = Math.sin(time) * 0.05 - 0.5; // Bob up and down slightly
        }

        if (scene && scene.userData.controls) {
            scene.userData.controls.update();
        }

        renderer.render(scene, camera);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();