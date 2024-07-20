import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

document.addEventListener("DOMContentLoaded", function () {
    const folders = ['sedan', 'coupe', 'convertible', 'hatchback', 'sport', 'crossover', 'suv'];

    const carouselContainer = document.getElementById('carousel-container');

    folders.forEach(folder => {
        const cardCol = document.createElement('div');
        cardCol.className = 'item';
        carouselContainer.appendChild(cardCol);

        const card = document.createElement('div');
        card.className = 'card';
        cardCol.appendChild(card);

        const transparentOverlay = document.createElement('div');
        transparentOverlay.className = 'transparent-overlay';
        card.appendChild(transparentOverlay);

        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        const loaderCircle = document.createElement('div');
        loaderCircle.className = 'loader-circle';
        loadingOverlay.appendChild(loaderCircle);
        card.appendChild(loadingOverlay);

        const modelName = document.createElement('div');
        modelName.className = 'model-name';
        modelName.textContent = folder.charAt(0).toUpperCase() + folder.slice(1);
        cardCol.appendChild(modelName);

        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(75, card.clientWidth / card.clientHeight, 0.1, 1000);
        camera.position.set(2, 1, 2);

        const renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setSize(card.clientWidth, card.clientHeight);
        card.appendChild(renderer.domElement);

        const topLight = new THREE.DirectionalLight(0xffffff, 1.5);
        topLight.position.set(0, 10, 10);
        topLight.castShadow = true;
        scene.add(topLight);

        const ambientLight = new THREE.AmbientLight(0x333333, 1);
        scene.add(ambientLight);

        const frontLight = new THREE.DirectionalLight(0xffffff, 0.5);
        frontLight.position.set(10, 0, 10);
        scene.add(frontLight);

        const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
        backLight.position.set(-10, 0, -10);
        scene.add(backLight);

        const gltfLoader = new GLTFLoader();
        let object;

        function degreesToRadians(degrees) {
            return degrees * (Math.PI / 180);
        }

        gltfLoader.load(
            `/static/models/${folder}/scene.gltf`,
            function (gltf) {
                object = gltf.scene;
                if (folder === 'hatchback') {
                    object.rotation.y = degreesToRadians(100);
                } else if (folder === 'crossover') {
                    object.rotation.y = degreesToRadians(180);
                } else if (folder === 'sedan') {
                    object.rotation.y = degreesToRadians(180); 
                    object.position.set(0, 0.25, 0);
                } else {
                    object.position.set(0, 0, 0);
                }
                object.scale.set(0.6, 0.6, 0.6);
                scene.add(object);
                loadingOverlay.style.display = 'none';
                setTimeout(() => {
                    window.dispatchEvent(new Event('resize'));
                }, 100);
            },
            function (xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (error) {
                console.error(error);
                loadingOverlay.textContent = 'Failed to load';
            }
        );

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 0, 0);
        controls.enableZoom = false;
        controls.enableRotate = false;
        controls.enablePan = false;
        controls.update();

        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            if (object) {
                object.rotation.y += 0.01;
            }
            renderer.render(scene, camera);
        }

        window.addEventListener("resize", function () {
            camera.aspect = card.clientWidth / card.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(card.clientWidth, card.clientHeight);
        });

        animate();
    });

    $('#carousel-container').owlCarousel({
        loop: false,
        margin: 10,
        nav: true,
        responsive: {
            0: {
                items: 1
            },
            600: {
                items: 2
            },
            1000: {
                items: 3
            }
        }
    });
});

(function() {
    var supportsPassive = false;
    try {
        var opts = Object.defineProperty({}, 'passive', {
            get: function() {
                supportsPassive = true;
            }
        });
        window.addEventListener('test', null, opts);
    } catch (e) {}
    window.supportsPassive = supportsPassive;
})();

const originalAddEventListener = EventTarget.prototype.addEventListener;
EventTarget.prototype.addEventListener = function(type, listener, options) {
    if ((type === 'touchstart' || type === 'touchmove') && typeof options === 'object' && !options.passive && !listener.isOrbitControls) {
        options = options || {};
        options.passive = true;
    }
    originalAddEventListener.call(this, type, listener, options);
};
