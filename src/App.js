import React, { useEffect, useRef } from "react";

import "./App.css";

import * as THREE from "three";
import OrbitControls from "three-orbitcontrols";

import Stats from "stats.js";

import {ThreeInit} from './threeFuncs'

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


    ThreeInit(camera, scene, renderer)

      
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
