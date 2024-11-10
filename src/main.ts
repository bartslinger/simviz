// import './style.css';
import './form.ts';
import $ from 'jquery';

import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/addons/controls/OrbitControls';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { run_bifilar_pendulum_simulation } from 'rustsim';

const spring1_b = [0.06, 0.07 / 2, 0.0];
const spring2_b = [0.06, -0.07 / 2, 0.0];
const spring1_w = [0.0, 0.315 / 2, -3.0];
const spring2_w = [0.0, -0.315 / 2, -3.0];
let t_start = Date.now();

let data:
	| {
			time: Float64Array;
			u: Float64Array;
			v: Float64Array;
			w: Float64Array;
			p: Float64Array;
			q: Float64Array;
			r: Float64Array;
			q0: Float64Array;
			q1: Float64Array;
			q2: Float64Array;
			q3: Float64Array;
			pn: Float64Array;
			pe: Float64Array;
			pd: Float64Array;
	  }
	| undefined;

const runSimulation = () => {
	$('#run-simulation').text('Stop Simulation');
	t_start = Date.now();
	const output = run_bifilar_pendulum_simulation(
		15,
		1,
		// mass
		Number($('#mass').val()),
		// inertia
		new Float64Array([
			Number($('#ixx').val()),
			Number($('#ixy').val()),
			Number($('#ixz').val()),
			Number($('#iyx').val()),
			Number($('#iyy').val()),
			Number($('#iyz').val()),
			Number($('#izx').val()),
			Number($('#izy').val()),
			Number($('#izz').val())
		]),
		new Float64Array([
			Number($('#spring1-body-x').val()),
			Number($('#spring1-body-y').val()),
			Number($('#spring1-body-z').val())
		]),
		new Float64Array([
			Number($('#spring2-body-x').val()),
			Number($('#spring2-body-y').val()),
			Number($('#spring2-body-z').val())
		]),
		new Float64Array([
			0.0,
			Number($('#springs-spacing').val()) / 2.0,
			-Number($('#springs-height').val())
		]),
		new Float64Array([
			0.0,
			-Number($('#springs-spacing').val()) / 2.0,
			-Number($('#springs-height').val())
		]),
		// spring lengths
		new Float64Array([Number($('#spring1-length').val()), Number($('#spring2-length').val())]),
		new Float64Array([
			// velocity
			Number($('#initial-u').val()),
			Number($('#initial-v').val()),
			Number($('#initial-w').val()),
			// rotation rates
			Number($('#initial-p').val()) * (Math.PI / 180),
			Number($('#initial-q').val()) * (Math.PI / 180),
			Number($('#initial-r').val()) * (Math.PI / 180),
			// rotation angles (euler)
			Number($('#initial-phi').val()) * (Math.PI / 180),
			Number($('#initial-theta').val()) * (Math.PI / 180),
			Number($('#initial-psi').val()) * (Math.PI / 180),
			// position NED
			Number($('#initial-pn').val()),
			Number($('#initial-pe').val()),
			Number($('#initial-pd').val())
		]),
		new Float64Array([Number($('#springs-kp').val()), Number($('#springs-kd').val())]),
		new Float64Array([
			Number($('#damping-u').val()),
			Number($('#damping-v').val()),
			Number($('#damping-w').val())
		]),
		new Float64Array([
			Number($('#damping-p').val()),
			Number($('#damping-q').val()),
			Number($('#damping-r').val())
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
	return data;
};

data = runSimulation();

$('#parameters-form').on('submit', (e) => {
	e.preventDefault();
	if (data) {
		data = undefined;
		$('#run-simulation').text('Run Simulation');
		return;
	}
	data = runSimulation();
});

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
controls.target.set(0, 0, Number($('#initial-pd').val()));

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

type State = {
	u: number;
	v: number;
	w: number;
	p: number;
	q: number;
	r: number;
	q0: number;
	q1: number;
	q2: number;
	q3: number;
	pn: number;
	pe: number;
	pd: number;
};

function animate() {
	requestAnimationFrame(animate);
	controls.update();
	controls.target.set(0, 0, Number($('#initial-pd').val()));
	let state: State;
	if (!data) {
		const euler = new THREE.Euler(
			-(Math.PI / 180.0) * Number($('#initial-phi').val()),
			-(Math.PI / 180.0) * Number($('#initial-theta').val()),
			-(Math.PI / 180.0) * Number($('#initial-psi').val())
		);
		const quaternion = new THREE.Quaternion().setFromEuler(euler).invert();
		state = {
			u: 0.0,
			v: 0.0,
			w: 0.0,
			p: 0.0,
			q: 0.0,
			r: 0.0,
			q0: quaternion.w,
			q1: quaternion.x,
			q2: quaternion.y,
			q3: quaternion.z,
			pn: Number($('#initial-pn').val()),
			pe: Number($('#initial-pe').val()),
			pd: Number($('#initial-pd').val())
		};
	} else {
		const dt = 1000 * (data.time[1] - data.time[0]);
		const now = Date.now();
		const delta = now - t_start;
		let i = Math.round(delta / dt);
		i = i % data.time.length;
		state = {
			u: data.u[i],
			v: data.v[i],
			w: data.w[i],
			p: data.p[i],
			q: data.q[i],
			r: data.r[i],
			q0: data.q0[i],
			q1: data.q1[i],
			q2: data.q2[i],
			q3: data.q3[i],
			pn: data.pn[i],
			pe: data.pe[i],
			pd: data.pd[i]
		};
	}

	axesHelper.position.x = state.pn;
	axesHelper.position.y = state.pe;
	axesHelper.position.z = state.pd;

	const quaternion = new THREE.Quaternion(state.q1, state.q2, state.q3, state.q0); // Note: Three.js uses (x, y, z, w)
	// cube.setRotationFromQuaternion(quaternion);
	axesHelper.setRotationFromQuaternion(quaternion);

	const euler = new THREE.Euler(Math.PI, Math.PI / 2, Math.PI / 2); // Example: Rotate 90 degrees on X-axis
	const quaternion2 = new THREE.Quaternion().setFromEuler(euler);
	const model_quaternion = quaternion.clone().multiply(quaternion2);
	// model?.setRotationFromQuaternion(quaternion2);

	// const inverse_quaternion = quaternion.clone().invert();
	const spring1_body_offset = new THREE.Vector3(
		Number.parseFloat(($('#spring1-body-x').val() ?? 0).toString()) ?? 0.0,
		Number.parseFloat(($('#spring1-body-y').val() ?? 0).toString()) ?? 0.0,
		Number.parseFloat(($('#spring1-body-z').val() ?? 0).toString()) ?? 0.0
	);
	const spring1_ned_offset = spring1_body_offset.applyQuaternion(quaternion);
	spring1_bodysphere.position.x = state.pn + spring1_ned_offset.x;
	spring1_bodysphere.position.y = state.pe + spring1_ned_offset.y;
	spring1_bodysphere.position.z = state.pd + spring1_ned_offset.z;

	const spring2_body_offset = new THREE.Vector3(
		Number.parseFloat(($('#spring2-body-x').val() ?? 0).toString()) ?? 0.0,
		Number.parseFloat(($('#spring2-body-y').val() ?? 0).toString()) ?? 0.0,
		Number.parseFloat(($('#spring2-body-z').val() ?? 0).toString()) ?? 0.0
	);
	const spring2_ned_offset = spring2_body_offset.applyQuaternion(quaternion);
	spring2_bodysphere.position.x = state.pn + spring2_ned_offset.x;
	spring2_bodysphere.position.y = state.pe + spring2_ned_offset.y;
	spring2_bodysphere.position.z = state.pd + spring2_ned_offset.z;

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
		model.position.x = state.pn + offset_rotatation.x;
		model.position.y = state.pe + offset_rotatation.y;
		model.position.z = state.pd + offset_rotatation.z;
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
