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

    function createCatModel() {
        catGroup = new THREE.Group();

        const blackMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x111111, 
            roughness: 0.6,
            metalness: 0.1
        });
        
        const eyeMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffcc00,
            emissive: 0xffaa00,
            emissiveIntensity: 0.5,
            roughness: 0.2
        });

        const collarMaterial = new THREE.MeshStandardMaterial({ color: 0xff3b30 });
        const collarStripeMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc00 });

        // 1. Body (Rounded Box)
        const bodyGeo = new THREE.SphereGeometry(0.9, 32, 32);
        bodyGeo.scale(1, 0.7, 1.4); // Stretch for body shape
        const body = new THREE.Mesh(bodyGeo, blackMaterial);
        body.position.y = 0.9;
        body.castShadow = true;
        body.receiveShadow = true;
        catGroup.add(body);

        // 2. Head (Sphere)
        const headGeo = new THREE.SphereGeometry(0.7, 32, 32);
        const head = new THREE.Mesh(headGeo, blackMaterial);
        head.position.set(0, 1.8, 1.1); // Forward and Up
        head.castShadow = true;
        catGroup.add(head);

        // 3. Ears (Cones)
        const earGeo = new THREE.ConeGeometry(0.2, 0.6, 16);
        
        const earL = new THREE.Mesh(earGeo, blackMaterial);
        earL.position.set(-0.35, 2.3, 1.1);
        earL.rotation.z = 0.3;
        earL.rotation.x = -0.2;
        catGroup.add(earL);

        const earR = new THREE.Mesh(earGeo, blackMaterial);
        earR.position.set(0.35, 2.3, 1.1);
        earR.rotation.z = -0.3;
        earR.rotation.x = -0.2;
        catGroup.add(earR);

        // 4. Eyes (Spheres)
        const eyeGeo = new THREE.SphereGeometry(0.12, 16, 16);
        
        const eyeL = new THREE.Mesh(eyeGeo, eyeMaterial);
        eyeL.position.set(-0.25, 1.9, 1.65);
        eyeL.scale.set(1, 1.2, 0.5); // Oval cat eyes
        catGroup.add(eyeL);

        const eyeR = new THREE.Mesh(eyeGeo, eyeMaterial);
        eyeR.position.set(0.25, 1.9, 1.65);
        eyeR.scale.set(1, 1.2, 0.5);
        catGroup.add(eyeR);

        // Pupils
        const pupilGeo = new THREE.SphereGeometry(0.05, 8, 8);
        const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        
        const pupilL = new THREE.Mesh(pupilGeo, pupilMat);
        pupilL.position.set(-0.25, 1.9, 1.72);
        pupilL.scale.set(0.5, 1.5, 0.2);
        catGroup.add(pupilL);

        const pupilR = new THREE.Mesh(pupilGeo, pupilMat);
        pupilR.position.set(0.25, 1.9, 1.72);
        pupilR.scale.set(0.5, 1.5, 0.2);
        catGroup.add(pupilR);

        // 5. Collar (Torus)
        const collarGeo = new THREE.TorusGeometry(0.55, 0.1, 16, 32);
        const collar = new THREE.Mesh(collarGeo, collarMaterial);
        collar.position.set(0, 1.5, 0.95);
        collar.rotation.x = Math.PI / 2.5;
        catGroup.add(collar);

        // Yellow Stripes (Small spheres/cubes embedded)
        // Just add a small detail for the bell
        const bellGeo = new THREE.SphereGeometry(0.15, 16, 16);
        const bell = new THREE.Mesh(bellGeo, collarStripeMaterial);
        bell.position.set(0, 1.35, 1.5);
        catGroup.add(bell);

        // 6. Tail (Curved Tube using several spheres or a tube geometry)
        // Simple long tail made of spheres for flexibility feel
        const tailGroup = new THREE.Group();
        tailGroup.position.set(0, 0.8, -1.2);
        
        // Base
        for(let i=0; i<8; i++) {
            const segGeo = new THREE.SphereGeometry(0.15 - i*0.01, 16, 16);
            const seg = new THREE.Mesh(segGeo, blackMaterial);
            // Curve it up and back
            seg.position.set(0, i*0.15, i*0.15); 
            tailGroup.add(seg);
        }
        // Tip
        const tailTip = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), blackMaterial);
        tailTip.position.set(0, 8*0.15, 8*0.15);
        tailGroup.add(tailTip);
        
        // Animate tail locally in render loop if needed, but static curve is fine for now
        catGroup.add(tailGroup);

        // 7. Legs (Cylinders/Capsules)
        const legGeo = new THREE.CylinderGeometry(0.15, 0.12, 0.8, 16);
        
        // Front L
        const legFL = new THREE.Mesh(legGeo, blackMaterial);
        legFL.position.set(-0.4, 0.4, 1.0);
        catGroup.add(legFL);

        // Front R
        const legFR = new THREE.Mesh(legGeo, blackMaterial);
        legFR.position.set(0.4, 0.4, 1.0);
        catGroup.add(legFR);

        // Back L
        const legBL = new THREE.Mesh(legGeo, blackMaterial);
        legBL.position.set(-0.45, 0.4, -0.8);
        legBL.rotation.x = 0.2;
        catGroup.add(legBL);

        // Back R
        const legBR = new THREE.Mesh(legGeo, blackMaterial);
        legBR.position.set(0.45, 0.4, -0.8);
        legBR.rotation.x = 0.2;
        catGroup.add(legBR);

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