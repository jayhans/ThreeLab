import React, { useEffect, useRef } from "react";
import logo from "./logo.svg";
import "./App.css";

import * as THREE from "three";
import OrbitControls from "three-orbitcontrols";

var camera, scene, renderer;
var geometry, material, mesh;

function App() {
  var threeRef = useRef(null);

  function init() {
    camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      1000
    );
    camera.position.z = 10;
    // y z axis exchange
    camera.up = new THREE.Vector3( 0, 0, 1)

    scene = new THREE.Scene();

    geometry = new THREE.BoxGeometry(2, 2, 2);
    material = new THREE.MeshNormalMaterial();

    mesh = new THREE.Mesh(geometry, material);
    //mesh.position.set(10, 0, 0)
    scene.add(mesh);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    threeRef.current.appendChild(renderer.domElement);

    var GridHelper = new THREE.GridHelper(1000,100)
    //  y z axis exchange
    GridHelper.rotation.set(Math.PI/2 , 0 , 0)
    scene.add(GridHelper)

    var AxesHelper = new THREE.AxesHelper(50)
    AxesHelper.position.set(0,0,0.1)
    scene.add(AxesHelper)

    //THREE.Def
  }

  function animate() {
    requestAnimationFrame(animate);

    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.02;

    renderer.render(scene, camera);
  }

  useEffect(() => {
    init();
    animate();
  }, []);

  return <div ref={threeRef} className="App"></div>;
}

export default App;
