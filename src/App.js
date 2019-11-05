import React, { useEffect, useRef } from "react";

import "./App.css";

import * as THREE from "three";
import OrbitControls from "three-orbitcontrols";

import Stats from "stats.js";

import { ThreeInit , DrawSlabFix } from "./threeFuncs";

var camera, scene, renderer;

var stats = new Stats();
stats.showPanel(0); // 0:fps, 1:ms, 2: mb, 3+: custom

function App() {
  var threeRef = useRef(null);

  function init() {
    camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      30000
    );
    camera.position.z = 400;
    // y z axis exchange
    camera.up = new THREE.Vector3(0, 0, 1);

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controls.screenSpacePanning = true;
    threeRef.current.appendChild(renderer.domElement);
    threeRef.current.appendChild(stats.dom);

    ThreeInit(camera, scene, renderer);

    // Rounded rectangle
    var roundedRectShape = new THREE.Shape();
    (function roundedRect(ctx, x, y, width, height, radius) {
      ctx.moveTo(x, y + radius);
      ctx.lineTo(x, y + height - radius);
      ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
      ctx.lineTo(x + width - radius, y + height);
      ctx.quadraticCurveTo(
        x + width,
        y + height,
        x + width,
        y + height - radius
      );
      ctx.lineTo(x + width, y + radius);
      ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
      ctx.lineTo(x + radius, y);
      ctx.quadraticCurveTo(x, y, x, y + radius);
    })(roundedRectShape, 0, 0, 100, 10, 5);

    var extrudeSettings = {
      depth: 8,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 2,
      bevelSize: 1,
      bevelThickness: 1
    };
    //addShape( roundedRectShape, extrudeSettings, 0x008000, - 150, 150, 0, 0, 0, 0, 1 );

    roundedRectShape.autoClose = true;
    var points = roundedRectShape.getPoints();

    var geometryPoints = new THREE.BufferGeometry().setFromPoints(points);

    // solid line
    var line = new THREE.Line(
      geometryPoints,
      new THREE.LineBasicMaterial({ color: extrudeSettings })
    );
    line.position.set(0, 0, 0);
    line.rotation.set(Math.PI / 2, 0, 0);
    line.scale.set(1, 1, 1);
    scene.add(line);

    var line2 = new THREE.Line(
      geometryPoints,
      new THREE.LineBasicMaterial({ color: extrudeSettings })
    );

    line2.position.set(0, 10, 0);
    line2.rotation.set(Math.PI / 2, 0, 0);
    scene.add(line2);


    var slab = DrawSlabFix(100, 100, 10, 30 , 1)

    scene.add(slab)



  }

  function animate() {
    stats.begin();
    stats.end();

    requestAnimationFrame(animate);

    renderer.render(scene, camera);
  }

  useEffect(() => {
    init();
    animate();
  }, []);

  return <div ref={threeRef} className="App"></div>;
}

export default App;
