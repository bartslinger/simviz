import './style.css';

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { run_bifilar_pendulum_simulation } from 'rustsim';

const cg_z = 1.72 - 3;

const output = run_bifilar_pendulum_simulation(
	15,
	1,
	new Float64Array([
		// velocity
		0.0,
		0.5,
		0.5,
		// rotation rates
		(50.0 * Math.PI) / 180,
		0.0,
		0.0,
		// rotation angles (euler)
		0.0,
		(90 * Math.PI) / 180,
		0.0,
		// position NED
		0.0,
		0.0,
		cg_z
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
scene.background = new THREE.Color(0xbfe3dd);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
	canvas: document.querySelector('#viewport') as HTMLCanvasElement
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

{
	const geometry = new THREE.BoxGeometry();
	// geometry.deleteAttribute('uv');

	const roomMaterial = new THREE.MeshLambertMaterial({
		side: THREE.BackSide
	});

	{
		const mainLight = new THREE.PointLight(0xffffff, 100, 100, 2);
		mainLight.position.set(-1.0, 0, -5);

		scene.add(mainLight);
	}

	const room = new THREE.Mesh(geometry, roomMaterial);
	room.position.set(-0.757, 13.219, 0.717);
	room.position.set(0, 0, -5.0);
	room.scale.set(20.0, 20.0, 10.0);

	scene.add(room);
}

// -------------------------

// put the camera on the negative x-axis and make it point towards the origin
// the z-axis of the world should be pointing down
camera.up.set(0, 0, -1);
camera.position.x = -3;
camera.position.y = 2;
camera.position.z = -2;

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, cg_z);

// const geometry = new THREE.BoxGeometry();
// geometry.scale(0.01, 0.01, 1.0);
// const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

const axesHelper = new THREE.AxesHelper(1);
scene.add(axesHelper);

// const geometry2 = new THREE.PlaneGeometry(5, 5);
// const material2 = new THREE.MeshLambertMaterial({ color: 0xffff00, side: THREE.DoubleSide });
// const plane = new THREE.Mesh(geometry2, material2);
// scene.add(plane);

// const origin = new THREE.Vector3(0, 0, 0);
// const dir = new THREE.Vector3(1, 0, 0);

// const arrow = new THREE.ArrowHelper(dir, origin, 1, 0xff0000);
// scene.add(arrow);
// const springArrow = new THREE.ArrowHelper(dir, origin, 1, 0x0000ff);
// scene.add(springArrow);
// const dragArrow = new THREE.ArrowHelper(dir, origin, 1, 0x00ff00);
// scene.add(dragArrow);

let model: any | undefined = undefined;
const loader = new GLTFLoader();
loader.load('/uav_low_poly/scene.gltf', (gltf) => {
	model = gltf.scene;
	model.scale.set(0.2, 0.2, 0.2);
	scene.add(model);
});

let spring1_roomsphere: any | undefined = undefined;
{
	const geometry = new THREE.SphereGeometry(0.03, 16, 16);
	const material = new THREE.MeshLambertMaterial({ color: 0x0000ff });
	spring1_roomsphere = new THREE.Mesh(geometry, material);
	spring1_roomsphere.position.set(0.0, 0.315 / 2, -3.0);
	scene.add(spring1_roomsphere);
}
let spring2_roomsphere: any | undefined = undefined;
{
	const geometry = new THREE.SphereGeometry(0.03, 16, 16);
	const material = new THREE.MeshLambertMaterial({ color: 0x0000ff });
	spring2_roomsphere = new THREE.Mesh(geometry, material);
	spring2_roomsphere.position.set(0.0, -0.315 / 2, -3.0);
	scene.add(spring2_roomsphere);
}

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
	// cube.position.x = data.pn[i];
	// cube.position.y = data.pe[i];
	// cube.position.z = data.pd[i];

	axesHelper.position.x = data.pn[i];
	axesHelper.position.y = data.pe[i];
	axesHelper.position.z = data.pd[i];

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
	// cube.setRotationFromQuaternion(quaternion);
	axesHelper.setRotationFromQuaternion(quaternion);

	const euler = new THREE.Euler(Math.PI, Math.PI / 2, Math.PI / 2); // Example: Rotate 90 degrees on X-axis
	const quaternion2 = new THREE.Quaternion().setFromEuler(euler);
	const model_quaternion = quaternion.multiply(quaternion2);
	// model?.setRotationFromQuaternion(quaternion2);

	const model_offset = new THREE.Vector3(0.0, 0.03, -0.18);
	const offset_rotatation = model_offset.applyQuaternion(model_quaternion);
	if (model) {
		model.position.x = data.pn[i] + offset_rotatation.x;
		model.position.y = data.pe[i] + offset_rotatation.y;
		model.position.z = data.pd[i] + offset_rotatation.z;
	}
	// model?.setRotationFromQuaternion(quaternion2);
	model?.setRotationFromQuaternion(model_quaternion);

	renderer.render(scene, camera);
}
animate();
