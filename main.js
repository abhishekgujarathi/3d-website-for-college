import './style.css'

import * as CANNON from 'cannon-es'
import * as THREE from 'three'
import CannonDebugger from 'cannon-es-debugger';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { ConvexHull } from 'three/addons/math/ConvexHull';
import { OrbitControls } from 'three/addons/controls/OrbitControls';
import { threeToCannon, ShapeType } from 'three-to-cannon';


// three.js variables
let camera, scene, renderer
let mesh
let character
let mixer
let action
let walking
var pivot
let charPos = new THREE.Vector3()
let target
let c
var clock = new THREE.Clock();
let helper
let viewers = []
let viewersBB = []
let flagInter = false
let pano

// cannon.js variables
let world
let body, bbody, bbody2
let charBody
let cannonDebugger
let groundBody


const keys = {};
// Define camera offset values
let cameraOffset
let cameraVerticalOffset = -1;

// Create the camera
let camera2


initThree()
initCannon()
animate()
let a = document.querySelector("#viewerAsk")
a.style.display = "none"


function initThree() {
    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 100)
    camera.position.z = 5

    // Scene
    scene = new THREE.Scene()
    // scene.background = new THREE.Color(0x000)
    scene.background = new THREE.Color(0x00f5ff)

    // Renderer
    renderer = new THREE.WebGL1Renderer({ canvas: document.querySelector('#bg') })
    renderer.setSize(window.innerWidth, window.innerHeight)

    const alight = new THREE.AmbientLight(0xffffff)
    scene.add(alight)
    // const plight = new THREE.PointLight(0xffffff)
    // scene.add(plight)



    // plane
    const planeGeometry = new THREE.BoxGeometry(30, 0.01, 30)
    const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xbb9a59 })
    const plane = new THREE.Mesh(planeGeometry, planeMaterial)
    scene.add(plane)

    const controls = new OrbitControls(camera, renderer.domElement);

    window.addEventListener('resize', onWindowResize)


    // Define camera offset values
    cameraOffset = new THREE.Vector3(0, 0, -0.4); // Adjust the offset values according to your preference
    cameraVerticalOffset = 0.3;

    // Create the camera
    camera2 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    scene.add(camera2);



    const loader = new GLTFLoader();

    // loader.load('/character/newww.gltf', (gltf) => {
    loader.load('/character/newww.gltf', (gltf) => {
        mesh = gltf.scene;
        console.log(mesh)
        scene.add(mesh)
        mesh.scale.set(0.1, 0.1, 0.1)
    });


    // character
    loader.load('/character/test2.gltf',
        (obj) => {
            character = obj.scene
            character.position.y = 0.005
            character.scale.set(0.025, 0.025, 0.025)
            mixer = new THREE.AnimationMixer(obj.scene);
            action = mixer.clipAction(obj.animations[0]);
            walking = mixer.clipAction(obj.animations[1])
            action.play()
            scene.add(character)
            helper = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
            helper.setFromObject(character);
            character.traverse(function (child) {
                if (child.isMesh) {
                    addCharacterBody(child)
                }
            })
        },
        (xhr) => {
            // console.log(xhr)
        },
        (err) => {
            // console.log(err)
        }
    )
    scene.updateMatrixWorld(true)


    //controller
    // Event listeners to track key state
    document.addEventListener('keydown', (event) => {
        keys[event.code] = true;
    });

    document.addEventListener('keyup', (event) => {
        keys[event.code] = false;

        // Reset velocity when keys are released
        charBody.velocity.set(0, 0, 0);
    });


    // viewer stand
    let viewer = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), new THREE.MeshBasicMaterial({
        color: 'white',
        transparent: true,
        opacity: 0.3
    }));
    scene.add(viewer);
    viewer.position.set(-1.1, 0.63, 0.34)
    let viewerBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    viewerBB.setFromObject(viewer);
    viewers.push(viewer)
    viewersBB.push(viewerBB)

    let viewer2 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), new THREE.MeshBasicMaterial({
        color: 'white',
        transparent: true,
        opacity: 0.3
    })); scene.add(viewer2);
    viewer2.position.set(-0.6, 0.63, -0.8)
    let viewer2BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    viewer2BB.setFromObject(viewer2);
    viewers.push(viewer2)
    viewersBB.push(viewer2BB)

    let viewer3 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), new THREE.MeshBasicMaterial({
        color: 'white',
        transparent: true,
        opacity: 0.3
    })); scene.add(viewer3);
    viewer3.position.set(-0.17, 0.18, -0.3)
    let viewer3BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    viewer3BB.setFromObject(viewer3);
    viewers.push(viewer3)
    viewersBB.push(viewer3BB)

    let viewer4 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), new THREE.MeshBasicMaterial({
        color: 'white',
        transparent: true,
        opacity: 0.3
    })); scene.add(viewer4);
    viewer4.position.set(-0.3, 0.1, 2.5)
    let viewer4BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    viewer4BB.setFromObject(viewer4);
    viewers.push(viewer4)
    viewersBB.push(viewer4BB)

    // classroom
    let viewer5 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), new THREE.MeshBasicMaterial({
        color: 'white',
        transparent: true,
        opacity: 0.3
    })); scene.add(viewer5);
    viewer5.position.set(0.8, 0.2, -1.26)
    let viewer5BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    viewer5BB.setFromObject(viewer5);
    // viewers.push(viewer5)
    viewersBB.push(viewer5BB)

    let viewer6 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), new THREE.MeshBasicMaterial({
        color: 'white',
        transparent: true,
        opacity: 0.3
    }));
    scene.add(viewer6);
    viewer6.position.set(-0.8, 0.2, -1.8)
    let viewer6BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    viewer6BB.setFromObject(viewer6);
    viewers.push(viewer6)
    viewersBB.push(viewer6BB)

    let viewer7 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), new THREE.MeshBasicMaterial({
        color: 'white',
        transparent: true,
        opacity: 0.3
    }));
    scene.add(viewer7);
    viewer7.position.set(0.1, 0.63, -1.47)
    let viewer7BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    viewer7BB.setFromObject(viewer7);
    viewers.push(viewer7)
    viewersBB.push(viewer7BB)


}
function handlePlayerControls() {
    const rotationSpeed = 2; // Adjust the rotation speed according to your preference
    const movementSpeed = 0.7; // Adjust the movement speed according to your preference

    // Rotation
    // if (keys['KeyA'] || keys['KeyA']) {
    if (keys['KeyA']) {
        // charBody.angularDamping = 0;
        charBody.angularVelocity.y = rotationSpeed;
        // charBody.angularDamping = 1;
    }
    if (keys['KeyD']) {
        charBody.angularVelocity.y = -rotationSpeed;
    }
    // }
    if (!keys['KeyA'] && !keys['KeyD']) {
        charBody.angularVelocity.set(0, 0, 0);
    }

    // Movement in the direction of looking
    const forward = new CANNON.Vec3(0, 0, -1); // Initial forward direction
    const direction = new CANNON.Vec3();
    charBody.quaternion.vmult(forward, direction); // Rotate the forward direction based on player's rotation

    if (keys['KeyW']) {
        charBody.velocity.copy(direction.scale(-movementSpeed));
        action.stop()
        walking.play()
    } else if (keys['KeyS']) {
        charBody.velocity.copy(direction.scale(movementSpeed));
        walking.play()
        action.stop()
    } else {
        charBody.velocity.set(0, 0, 0);
        walking.stop()
        action.play()
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}

function initCannon() {
    let a = document.querySelector("#viewerAsk")
    a.style.display = "none"
    a.style.height = "min-content"

    world = new CANNON.World()
    world.gravity.set(0, -40, 0);
    cannonDebugger = new CannonDebugger(scene, world);

    // // Create wall geometry
    const wallWidth = 0.02; // Width of the wall

    const ground = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(7, 0.001, 7))
    })
    world.addBody(ground)
    // // Create a box shape for the wall

    // Create a rigid body for the wall
    const wall1 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(2, 0.6, wallWidth)),
    });
    wall1.position.set(0.3, 0.6, -2.1);
    world.addBody(wall1);

    const wall2 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(wallWidth, 0.6, 2)),
    });
    wall2.position.set(2.11, 0.6, 0);
    world.addBody(wall2);

    const wall3 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.55, 0.6, wallWidth)),
    });
    wall3.position.set(-1.1, 0.6, 2.08);
    world.addBody(wall3);

    const wall4 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.8, 0.6, wallWidth)),
    });
    wall4.position.set(0.8, 0.6, 2.08);
    world.addBody(wall4);

    const wall5 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.2, 0.6, wallWidth)),
    });
    wall5.position.set(-0.1, 0.6, 2.0);
    wall5.quaternion.setFromEuler(0, -0.8, 0)
    world.addBody(wall5);

    const wall6 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(wallWidth, 0.6, 2)),
    });
    wall6.position.set(-1.6, 0.6, 0);
    world.addBody(wall6);

    const wall7 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.28, 0.6, wallWidth)),
    });
    wall7.position.set(-0.8, 0.6, 2.3);
    wall7.quaternion.setFromEuler(0, 0.9, 0)
    world.addBody(wall7);

    const wall8 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(2, 0.1, 2)),
    });
    wall8.position.set(0.2, 0.005, 0);
    world.addBody(wall8);

    const wall9 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.6, 0.04, 0.2)),
    });
    wall9.position.set(0, -0.001, 2.2);
    wall9.quaternion.setFromEuler(0.3, 0, 0)
    world.addBody(wall9);

    const wall10 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.005, 0.19)),
    });
    wall10.position.set(-0.8, 0.24, -0.32);
    wall10.quaternion.setFromEuler(0, 0, -0.26)
    world.addBody(wall10);

    const wall11 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.36, 0.005, 0.19)),
    });
    wall11.position.set(-1.1, 0.48, -0.74);
    wall11.quaternion.setFromEuler(0, 0, 0.4)
    world.addBody(wall11);

    const wall12 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.2, 0.01, 0.4)),
    });
    wall12.position.set(-1.5, 0.36, -0.5);
    world.addBody(wall12);

    const wall13 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(wallWidth, 0.6, 0.72)),
    });
    wall13.position.set(-0.4, 0.0, 0.61);
    world.addBody(wall13);

    const wall14 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.6, 0.6, wallWidth)),
    });
    wall14.position.set(-1, 0.6, 1.32);
    world.addBody(wall14);

    const wall15 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(wallWidth, 0.6, 1.50)),
    });
    wall15.position.set(1.105, 0.6, 0.53);
    world.addBody(wall15);

    const wall16 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(wallWidth, 0.6, 0.5)),
    });
    wall16.position.set(0.195, 0.6, 1.58);
    world.addBody(wall16);

    const wall17 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.6, wallWidth)),
    });
    wall17.position.set(0.7, 0.6, 1.1);
    world.addBody(wall17);

    const wall18 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.55, 0.6, wallWidth)),
    });
    wall18.position.set(0.62, 0, -0.95);
    world.addBody(wall18);

    const wall19 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.7, 0.6, wallWidth)),
    });
    wall19.position.set(-0.95, 0, -0.95);
    world.addBody(wall19);

    const wall20 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(2, wallWidth, 0.7)),
    });
    wall20.position.set(0.3, 0.609, -1.68);
    world.addBody(wall20);

    const wall21 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.16, wallWidth, 1)),
    });
    wall21.position.set(-0.58, 0.609, 0);
    world.addBody(wall21);

    const wall22 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.8, wallWidth, 0.14)),
    });
    wall22.position.set(-0.58, 0.609, 1.2);
    world.addBody(wall22);

    const wall23 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.6, 0.6, wallWidth)),
    });
    wall23.position.set(-1, 0, -0.12);
    world.addBody(wall23);

    const wall24 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.4, 0.6, wallWidth)),
    });
    wall24.position.set(-1.155, 1, -0.12);
    world.addBody(wall24);

    const wall25 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.6, wallWidth, 0.8)),
    });
    wall25.position.set(-1, 0.609, 0.6);
    world.addBody(wall25);

    const wall26 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(wallWidth, 0.6, 0.52)),
    });
    wall26.position.set(-0.75, 1, 0.69);
    world.addBody(wall26);

    const wall27 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.7, 0.6, wallWidth)),
    });
    wall27.position.set(-0.75, 1, -1.27);
    world.addBody(wall27);

    const wall28 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.7, 0.6, wallWidth)),
    });
    wall28.position.set(0.905, 1, -1.27);
    world.addBody(wall28);

    const wall29 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.1, 0.4)),
    });
    wall29.position.set(-1.68, 0.68, 0.35);
    world.addBody(wall29);

    const wall30 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.07, 0.1, 0.3)),
    });
    wall30.position.set(-0.78, 0.67, -1.7);
    world.addBody(wall30);

    const wall31 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.3, 0.1, 0.07)),
    });
    wall31.position.set(-0.5, 0.67, -2);
    world.addBody(wall31);

    const wall32 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.3, 0.1, 0.07)),
    });
    wall32.position.set(-0.5, 0.67, -1.35);
    world.addBody(wall32);

    const wall33 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.07, 0.1, 0.3)),
    });
    wall33.position.set(1.02, 0.67, -1.7);
    world.addBody(wall33);

    const wall34 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.3, 0.1, 0.07)),
    });
    wall34.position.set(0.65, 0.67, -1.35);
    world.addBody(wall34);

    const wall35 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.3, 0.1, 0.07)),
    });
    wall35.position.set(0.65, 0.67, -2);
    world.addBody(wall35);

    const wall36 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.01, 0.2, 0.26)),
    });
    wall36.position.set(-0.17, 1, -1.85);
    world.addBody(wall36);

    const wall37 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.01, 0.2, 0.26)),
    });
    wall37.position.set(0.28, 1, -1.85);
    world.addBody(wall37);

    const wall38 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.12, 0.2, 0.01)),
    });
    wall38.position.set(0.15, 1, -1.6);
    world.addBody(wall38);

    const wall39 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.07, 0.1, 0.12)),
    });
    wall39.position.set(0.45, 0.68, -1.75);
    world.addBody(wall39);

    const wall40 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.07, 0.1, 0.12)),
    });
    wall40.position.set(0.2, 0.68, -1.82);
    world.addBody(wall40);

    const wall41 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.07, 0.1, 0.12)),
    });
    wall41.position.set(-0.3, 0.68, -1.75);
    world.addBody(wall41);

    const wall42 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.12, 0.1, 0.07)),
    });
    wall42.position.set(-0.1, 0.68, -2);
    world.addBody(wall42);

    const wall43 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.16, 0.1, 0.07)),
    });
    wall43.position.set(0.75, 0.1, -1);
    world.addBody(wall43);

    const wall44 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.44, 0.1, 0.3)),
    });
    wall44.position.set(0.8, 0.1, -1.75);
    world.addBody(wall44);

    const wall45 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.6, 0.1, 0.07)),
    });
    wall45.position.set(-1.02, 0.1, -2.05);
    world.addBody(wall45);

    const wall46 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.1, 0.14)),
    });
    wall46.position.set(-1.12, 0.1, -1.55);
    world.addBody(wall46);

    const wall47 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.6, 0.1, 0.07)),
    });
    wall47.position.set(-1.02, 0.1, -1);
    world.addBody(wall47);

    const wall48 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.18, 0.2, 0.01)),
    });
    wall48.position.set(0.1, 0.2, -1.55);
    world.addBody(wall48);

    const wall49 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.3, 0.2, 0.01)),
    });
    wall49.position.set(-0.85, 0.2, -1.55);
    world.addBody(wall49);

    const wall50 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.01, 0.2, 0.08)),
    });
    wall50.position.set(-0.55, 0.2, -1.4);
    world.addBody(wall50);

    const wall51 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.01, 0.2, 0.17)),
    });
    wall51.position.set(-0.335, 0.2, -1.15);
    world.addBody(wall51);

    const wall52 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.01, 0.2, 0.28)),
    });
    wall52.position.set(-0.335, 0.2, -1.83);
    world.addBody(wall52);

    const wall53 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.01, 0.2, 0.28)),
    });
    wall53.position.set(0.305, 0.2, -1.83);
    world.addBody(wall53);

    const wall54 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.01, 0.2, 0.1)),
    });
    wall54.position.set(0.305, 0.2, -1.15);
    world.addBody(wall54);

    const wall55 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.7, 0.1, 1.04)),
    });
    wall55.position.set(0.375, 0.62, 0.08);
    world.addBody(wall55);

    const wall56 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.01, 0.05, 0.2)),
    });
    wall56.position.set(-0.75, 0.63, -0.34);
    world.addBody(wall56);

    const wall57 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(0.4, 0.3, 0.02)),
    });
    wall57.position.set(-0.83, 0.32, -0.535);
    world.addBody(wall57);

    const wall58 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(wallWidth, 0.6, 4)),
    });
    wall58.position.set(4, 0.6, 0);
    world.addBody(wall58);

    const wall59 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(wallWidth, 0.6, 4)),
    });
    wall59.position.set(-4, 0.6, 0);
    world.addBody(wall59);

    const wall60 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(4, 0.6, wallWidth)),
    });
    wall60.position.set(0, 0.6, -4);
    world.addBody(wall60);

    const wall61 = new CANNON.Body({
        mass: 0, // Set mass to 0 to create a static object
        shape: new CANNON.Box(new CANNON.Vec3(4, 0.6, wallWidth)),
    });
    wall61.position.set(0, 0.6, 4);
    world.addBody(wall61);


}

// Update camera position and look-at target based on player's position and rotation
function updateCamera() {
    const playerPosition = character.position;

    // Calculate the camera position relative to the player
    const relativeCameraOffset = cameraOffset.clone().applyQuaternion(character.quaternion);
    const cameraPosition = playerPosition.clone().add(relativeCameraOffset);

    // Adjust camera position vertically
    // cameraPosition.y += cameraVerticalOffset;
    cameraPosition.y += 0.3;

    // Set the camera position and look-at target
    camera2.position.copy(cameraPosition);
    // camera2.lookAt(playerPosition);

    camera2.lookAt(new THREE.Vector3(playerPosition.x, playerPosition.y + 0.3, playerPosition.z));
}

function animate() {
    requestAnimationFrame(animate)

    try {

        // Step the physics world
        world.fixedStep()

        // Copy coordinates from cannon.js to three.js
        handlePlayerControls()
        // cannonDebugger.update()

        // Update camera
        updateCamera();

        // Update the physics world
        world.step(1 / 100);


        var delta = clock.getDelta();
        if (mixer) mixer.update(delta);

        // Update the character's position in the three.js world
        // character.position.copy(charBody.position);
        character.position.set(charBody.position.x, charBody.position.y - 0.02, charBody.position.z);
        character.quaternion.copy(charBody.quaternion);
    } catch (e) { }

    helper.setFromObject(character);
    detectCollision()
    // Render three.js
    renderer.render(scene, camera2)
}

function addCharacterBody() {
    charBody = new CANNON.Body({
        mass: 10, // Set mass to 0 to make it static
        shape: new CANNON.Sphere(0.05),
        // shape: new CANNON.Cylinder(0.08, 0.08, 0.01, 20),
    });
    // charBody = new CANNON.Body({mass:10})
    charBody.position.set(0, 0.15, 3)

    charBody.inertia.set(0, 0, 0);
    charBody.angularDamping = 0.5;
    charBody.angularFactor = new CANNON.Vec3(0, 1, 0);
    charBody.quaternion.setFromEuler(0, 3.14, 0)
    world.addBody(charBody);
}



// ADDING VIVWER ON COLID FUNCTION
let aViwer = false
let rViwer = false
async function addViwer(img) {
    if (localStorage.getItem("viwerState") === "false") {
        let a = document.querySelector("#viewerAsk")
        // if (document.querySelector('.pnlm-render-container')) {
        //     document.querySelector('.pnlm-render-container').remove()
        // }
        // document.querySelector("#contain").appendChild(a)

        pano = await pannellum.viewer('panorama', {
            "type": "equirectangular",
            "panorama": "./views/" + img,
            "autoLoad": true,
            "autoRotate": -2
        });
        localStorage.setItem("viwerImg", img)
        // pannellum.viewer.('panorama', {
        //     "type": "equirectangular",
        //     "panorama": "./views/" + img,
        //     "autoLoad": true,
        //     "autoRotate": -8
        // });


        let tmp = document.querySelectorAll(".pnlm-about-msg")
        console.log(tmp);

        tmp.forEach(element => {
            element.remove()
        });

        localStorage.setItem("viwerState", "true")
        a.style.display = "flex"
        a.style.height = "min-content"
    }
}
function removeViwer() {
    if (localStorage.getItem("viwerState") === "true") {
        try {
            // let vv = pannellum.viewer("panorama").getScene()
            pano.destroy()
        } catch (e) { console.log(e); }
        let a = document.querySelector("#viewerAsk")
        a.style.display = "none"
        a.style.height = "min-content"
        localStorage.setItem("viwerState", false)
        console.log("remove");

    }
}

async function detectCollision() {
    if (helper.intersectsBox(viewersBB[0])) {
        if (flagInter === false) {
            addViwer("views (1).jpg")
        }
    }

    else if (helper.intersectsBox(viewersBB[1])) {
        if (flagInter === false) {
            await addViwer("views (2).jpg")
        }
    }
    else if (helper.intersectsBox(viewersBB[2])) {
        if (flagInter === false) {
            await addViwer("views (3).jpg")
        }
    }
    else if (helper.intersectsBox(viewersBB[3])) {
        if (flagInter === false) {
            await addViwer("views (4).jpg")
        }
    }
    else if (helper.intersectsBox(viewersBB[4])) {
        if (flagInter === false) {
            await addViwer("views (5).jpg")
        }
    }

    else if (helper.intersectsBox(viewersBB[5])) {
        if (flagInter === false) {
            await addViwer("views (7).jpg")
        }
    }

    else if (helper.intersectsBox(viewersBB[6])) {
        if (flagInter === false) {
            await addViwer("views (8).jpg")
        }
    }
    else {
        flagInter = false
        removeViwer()
    }
}
// }































// document.body.onload = function () {
//     async function getData() {
//         const res = await fetch("http://localhost:3001/")
//         if (!res.ok) throw new Error("error")
//         const data = await res.json()
//         console.log(data);

//         document.querySelector('#welcome').innerHTML = data[0].data
//         document.querySelector('#vision').innerHTML = data[1].data
//         document.querySelector('#mission1').innerHTML = data[2].data
//         document.querySelector('#mission2').innerHTML = data[3].data
//         document.querySelector('#mission3').innerHTML = data[4].data
//     }
//     getData()
// }