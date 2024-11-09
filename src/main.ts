import './style.css';

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls';

import { run_bifilar_pendulum_simulation } from 'rustsim';

const output = run_bifilar_pendulum_simulation(
	15,
	1,
	new Float64Array([
		// velocity
		0.0,
		0.0,
		0.0,
		// rotation rates
		(30.0 * Math.PI) / 180,
		0.0,
		0.0,
		// rotation angles (euler)
		0.0,
		(90 * Math.PI) / 180,
		0.0,
		// position NED
		0.0,
		0.0,
		1.72
	])
);

const data = {
	time: output.time(),
	u: output.u(),
	v: output.v(),
	w: output.w(),
	p: output.p(),
	q: output.q(),
	r: output.r(),
	q0: output.q0(),
	q1: output.q1(),
	q2: output.q2(),
	q3: output.q3(),
	pn: output.pn(),
	pe: output.pe(),
	pd: output.pd()
};

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
const dt = 1000 * (data.time[1] - data.time[0]);
function animate() {
	requestAnimationFrame(animate);
	controls.update();
	const now = Date.now();
	const delta = now - t_start;
	let i = Math.round(delta / dt);
	i = i % data.time.length;

	// get time between previous update and now
	cube.position.x = data.pn[i];
	cube.position.y = data.pe[i];
	cube.position.z = data.pd[i];

	// arrow.position.x = data.pn[i];
	// arrow.position.y = data.pe[i];
	// arrow.position.z = data.pd[i];
	//
	// springArrow.position.x = data.pn[i];
	// springArrow.position.y = data.pe[i];
	// springArrow.position.z = data.pd[i];
	//
	// dragArrow.position.x = data.pn[i];
	// dragArrow.position.y = data.pe[i];
	// dragArrow.position.z = data.pd[i];
	//
	// let Fs = new THREE.Vector3(state[10], state[11], state[12]);
	// springArrow.setLength(Fs.length() / 9.80665);
	// springArrow.setDirection(Fs.normalize());
	//
	// let Fg = new THREE.Vector3(state[7], state[8], state[9]).normalize();
	// arrow.setDirection(Fg);
	// arrow.setLength(1);
	//
	// let Fd = new THREE.Vector3(state[13], state[14], state[15]);
	// dragArrow.setLength((Fd.length() / 9.80665) * 10);
	// dragArrow.setDirection(Fd.normalize());

	const quaternion = new THREE.Quaternion(data.q1[i], data.q2[i], data.q3[i], data.q0[i]); // Note: Three.js uses (x, y, z, w)
	cube.setRotationFromQuaternion(quaternion);

	renderer.render(scene, camera);
}
animate();
