// import './style.css';
import './form.ts';

import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { run_bifilar_pendulum_simulation } from 'rustsim';

const cg_z = 1.72 - 3;

const spring1_b = [0.06, 0.07 / 2, 0.0];
const spring2_b = [0.06, -0.07 / 2, 0.0];
const spring1_w = [0.0, 0.315 / 2, -3.0];
const spring2_w = [0.0, -0.315 / 2, -3.0];

const output = run_bifilar_pendulum_simulation(
	15,
	1,
	new Float64Array([
		// velocity
		0.0,
		0.0,
		0.0,
		// rotation rates
		(100.0 * Math.PI) / 180,
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
	]),
	new Float64Array(spring1_b),
	new Float64Array(spring2_b),
	new Float64Array(spring1_w),
	new Float64Array(spring2_w)
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

const aspectRatio = () => {
	if (window.innerWidth > 640) {
		return (window.innerWidth - 416) / window.innerHeight;
	} else {
		return window.innerWidth / ((window.innerHeight * 3) / 2);
	}
};

const camera = new THREE.PerspectiveCamera(75, aspectRatio(), 0.1, 1000);
const setCameraOffset = () => {
	if (window.innerWidth > 640) {
		camera.fov = 75;
		camera.setViewOffset(
			window.innerWidth + 416,
			window.innerHeight,
			0,
			0,
			window.innerWidth,
			window.innerHeight
		);
	} else {
		camera.fov = 120;
		camera.setViewOffset(
			window.innerWidth,
			(window.innerHeight * 3) / 2,
			0,
			0,
			window.innerWidth,
			window.innerHeight
		);
	}
};
setCameraOffset();

const canvas_element = document.querySelector('#viewport') as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({
	canvas: canvas_element
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
// scene.add(axesHelper);

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
	const scale = 0.15;
	model.scale.set(scale, scale, scale);
	scene.add(model);
});

let spring1_roomsphere: any | undefined = undefined;
{
	const geometry = new THREE.SphereGeometry(0.03, 16, 16);
	const material = new THREE.MeshLambertMaterial({ color: 0x0000ff });
	spring1_roomsphere = new THREE.Mesh(geometry, material);
	spring1_roomsphere.position.set(spring1_w[0], spring1_w[1], spring1_w[2]);
	scene.add(spring1_roomsphere);
}
let spring2_roomsphere: any | undefined = undefined;
{
	const geometry = new THREE.SphereGeometry(0.03, 16, 16);
	const material = new THREE.MeshLambertMaterial({ color: 0x0000ff });
	spring2_roomsphere = new THREE.Mesh(geometry, material);
	spring2_roomsphere.position.set(spring2_w[0], spring2_w[1], spring2_w[2]);
	scene.add(spring2_roomsphere);
}
let spring1_bodysphere: any | undefined = undefined;
{
	const geometry = new THREE.SphereGeometry(0.03, 16, 16);
	const material = new THREE.MeshLambertMaterial({ color: 0x0000ff });
	spring1_bodysphere = new THREE.Mesh(geometry, material);
	scene.add(spring1_bodysphere);
}
let spring2_bodysphere: any | undefined = undefined;
{
	const geometry = new THREE.SphereGeometry(0.03, 16, 16);
	const material = new THREE.MeshLambertMaterial({ color: 0x0000ff });
	spring2_bodysphere = new THREE.Mesh(geometry, material);
	scene.add(spring2_bodysphere);
}

let spring1_line: any | undefined;
const spring1_points = [];
spring1_points.push(new THREE.Vector3(spring1_w[0], spring1_w[1], spring1_w[2]));
spring1_points.push(new THREE.Vector3(0.0, 0.315 / 2, 0.0));
{
	const material = new THREE.LineBasicMaterial({ color: 0x000000 });
	const geometry = new THREE.BufferGeometry().setFromPoints(spring1_points);
	spring1_line = new THREE.Line(geometry, material);
	scene.add(spring1_line);
}

let spring2_line: any | undefined;
const spring2_points = [];
spring2_points.push(new THREE.Vector3(spring2_w[0], spring2_w[1], spring2_w[2]));
spring2_points.push(new THREE.Vector3(0.0, -0.315 / 2, 0.0));
{
	const material = new THREE.LineBasicMaterial({ color: 0x000000 });
	const geometry = new THREE.BufferGeometry().setFromPoints(spring2_points);
	spring2_line = new THREE.Line(geometry, material);
	scene.add(spring2_line);
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
	const model_quaternion = quaternion.clone().multiply(quaternion2);
	// model?.setRotationFromQuaternion(quaternion2);

	// const inverse_quaternion = quaternion.clone().invert();
	const spring1_body_offset = new THREE.Vector3(spring1_b[0], spring1_b[1], spring1_b[2]);
	const spring1_ned_offset = spring1_body_offset.applyQuaternion(quaternion);
	spring1_bodysphere.position.x = data.pn[i] + spring1_ned_offset.x;
	spring1_bodysphere.position.y = data.pe[i] + spring1_ned_offset.y;
	spring1_bodysphere.position.z = data.pd[i] + spring1_ned_offset.z;

	const spring2_body_offset = new THREE.Vector3(spring2_b[0], spring2_b[1], spring2_b[2]);
	const spring2_ned_offset = spring2_body_offset.applyQuaternion(quaternion);
	spring2_bodysphere.position.x = data.pn[i] + spring2_ned_offset.x;
	spring2_bodysphere.position.y = data.pe[i] + spring2_ned_offset.y;
	spring2_bodysphere.position.z = data.pd[i] + spring2_ned_offset.z;

	// spring1_line.attributes
	const positionAttribute1 = spring1_line.geometry.getAttribute('position');
	positionAttribute1.setXYZ(
		1,
		spring1_bodysphere.position.x,
		spring1_bodysphere.position.y,
		spring1_bodysphere.position.z
	);
	positionAttribute1.needsUpdate = true;

	// spring2_line.attributes
	const positionAttribute2 = spring2_line.geometry.getAttribute('position');
	positionAttribute2.setXYZ(
		1,
		spring2_bodysphere.position.x,
		spring2_bodysphere.position.y,
		spring2_bodysphere.position.z
	);
	positionAttribute2.needsUpdate = true;

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

window.addEventListener('resize', () => {
	// camera.aspect = (window.innerWidth + 416) / window.innerHeight;
	setCameraOffset();
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});
