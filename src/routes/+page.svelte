<script>
    import { onMount } from "svelte";
    import * as THREE from "three";
    import { OrbitControls } from "jsm/controls/OrbitControls.js";

    let container;

    onMount(() => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(w, h);
        container.appendChild(renderer.domElement);

        const fov = 75;
        const aspect = w / h;
        const near = 0.1;
        const far = 10;
        const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        camera.position.z = 2;
        const scene = new THREE.Scene();

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;

        const geo = new THREE.IcosahedronGeometry(1.0, 1);
        // const mat = new THREE.MeshBasicMaterial({color: 0x00ff00, wireframe: true})
        const mat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            flatShading: true,
        });
        const mesh = new THREE.Mesh(geo, mat);
        scene.add(mesh);

        const wireMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true,
        });
        const wireMesh = new THREE.Mesh(geo, wireMat);
        wireMesh.scale.setScalar(1.001);
        mesh.add(wireMesh);

        const hemilight = new THREE.HemisphereLight(0xffff00, 0x00fff0, 1);
        scene.add(hemilight);

        let frameId;
        function animate(t) {
            frameId = requestAnimationFrame(animate);
            mesh.rotation.x += 0.01;
            // mesh.scale.setScalar(Math.cos(t * 0.001) )
            renderer.render(scene, camera);
            controls.update();
        }

        animate();

        function onResize() {
            const w = window.innerWidth;
            const h = window.innerHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        }
        window.addEventListener("resize", onResize);

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener("resize", onResize);
            controls.dispose();
            renderer.dispose();
            renderer.domElement.remove();
        };
    });
</script>

<div bind:this={container}></div>
