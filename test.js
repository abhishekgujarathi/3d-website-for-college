import * as THREE from 'three'
import { PointLight } from 'three/src/lights/PointLight'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { GridHelper, PointLightHelper } from 'three'
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls'
import { AmbientLight } from 'three'
import CANNON from 'cannon'

// scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x00f5ff)

// camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.z = 2.7
camera.position.y = 3.2
camera.lookAt(0, 0.75, 0)

// renderer
const renderer = new THREE.WebGL1Renderer({ canvas: document.querySelector('#bg') })
renderer.setSize(window.innerWidth, window.innerHeight)
// document.body.appendChild(renderer.domElement)

// plane
const planeGeometry = new THREE.BoxGeometry(30, 0.01, 30)
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xbb9a59 })
const plane = new THREE.Mesh(planeGeometry, planeMaterial)
scene.add(plane)

// point light
const plight = new PointLight(0xffffff)
plight.position.set(5, 10, 2)
scene.add(plight)

const plightHelper = new PointLightHelper(plight)
scene.add(plightHelper)

//ambient light
const alight = new AmbientLight(0xffffff)
scene.add(alight)

let orbitControls = new OrbitControls(camera, renderer.domElement)

// Start the clock
let clock = new THREE.Clock();
clock.start();

let world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

let body = new CANNON.Body({
    mass: 1,
    shape: new CANNON.Sphere(new CANNON.Sphere(1))
});

const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 16), new THREE.MeshBasicMaterial({ color: 'green' }));
scene.add(mesh);
mesh.position.set(0, 1, 0)

let rigidBodies = []

body.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
body.quaternion.set(mesh.quaternion.x, mesh.quaternion.y, mesh.quaternion.z, mesh.quaternion.w);

world.addBody(body);

function updatePhysics(deltaTime) {
    world.step(deltaTime);
    for (let i = 0; i < rigidBodies.length; i++) {
        let objThree = rigidBodies[i];
        let objPhys = objThree.userData.physicsBody;
        objThree.position.copy(objPhys.position);
        objThree.quaternion.copy(objPhys.quaternion);
    }
}


function animate() {
    // Update the Three.js scene
    let deltaTime = clock.getDelta();
    updatePhysics(deltaTime);
    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}
animate()