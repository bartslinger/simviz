import './style.css';

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls';
import { data } from './data';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
	canvas: document.querySelector('#viewport') as HTMLCanvasElement
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// put the camera on the negative x-axis and make it point towards the origin
// the z-axis of the world should be pointing down
camera.up.set(0, 0, -1);
camera.position.x = -3;
camera.position.z = 2;
// camera.lookAt(0, 0, 0);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 2);

const geometry = new THREE.BoxGeometry();
geometry.scale(0.1, 0.4, 0.05);
const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// const circle_geometry = new THREE.CircleGeometry(2, 32);
// const circle_material = new THREE.MeshBasicMaterial({ color: 0x555555 });
// const circle = new THREE.Mesh(circle_geometry, circle_material);
// circle.setRotationFromEuler(new THREE.Euler(0, -Math.PI / 2, 0));
// scene.add(circle);

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(-1, -1, 0);
scene.add(pointLight);
const light = new THREE.AmbientLight(0x909040); // soft white light
scene.add(light);

const axesHelper = new THREE.AxesHelper(1);
scene.add(axesHelper);

const origin = new THREE.Vector3(0, 0, 0);
const dir = new THREE.Vector3(1, 0, 0);

const arrow = new THREE.ArrowHelper(dir, origin, 1, 0xff0000);
scene.add(arrow);
const springArrow = new THREE.ArrowHelper(dir, origin, 1, 0x0000ff);
scene.add(springArrow);
const dragArrow = new THREE.ArrowHelper(dir, origin, 1, 0x00ff00);
scene.add(dragArrow);

const t_start = Date.now();
function animate() {
	requestAnimationFrame(animate);
	controls.update();
	const now = Date.now();
	const delta = now - t_start;
	let i = Math.round(delta / 10);
	i = i % data.length;

	const state = data[i];

	// get time between previous update and now
	cube.position.x = state[0];
	cube.position.y = state[1];
	cube.position.z = state[2];

	arrow.position.x = state[0];
	arrow.position.y = state[1];
	arrow.position.z = state[2];

	springArrow.position.x = state[0];
	springArrow.position.y = state[1];
	springArrow.position.z = state[2];

	dragArrow.position.x = state[0];
	dragArrow.position.y = state[1];
	dragArrow.position.z = state[2];

	let Fs = new THREE.Vector3(state[10], state[11], state[12]);
	springArrow.setLength(Fs.length() / 9.80665);
	springArrow.setDirection(Fs.normalize());

	let Fg = new THREE.Vector3(state[7], state[8], state[9]).normalize();
	arrow.setDirection(Fg);
	arrow.setLength(1);

	let Fd = new THREE.Vector3(state[13], state[14], state[15]);
	dragArrow.setLength((Fd.length() / 9.80665) * 10);
	dragArrow.setDirection(Fd.normalize());

	const quaternion = new THREE.Quaternion(state[4], state[5], state[6], state[3]); // Note: Three.js uses (x, y, z, w)
	cube.setRotationFromQuaternion(quaternion);

	renderer.render(scene, camera);
}
animate();
