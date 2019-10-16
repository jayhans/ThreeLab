import React, { useEffect, useRef } from "react";
import logo from "./logo.svg";
import "./App.css";

import * as THREE from "three";
import OrbitControls from "three-orbitcontrols";

var camera, scene, renderer;
var geometry, material, mesh;

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

function onMouseMove(event) {
  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // update the picking ray with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // calculate objects intersecting the picking ray
  //var intersects = raycaster.intersectObjects(scene.children);
  //console.log(intersects)
  
  // 자식 및으로만 서칭 ... 
  var intersects = raycaster.intersectObjects(scene.children, true);
  //console.log(intersects)

  if(intersects){
     console.log(intersects[0])
    // if(intersects[0].object.material.wireframe){
    //   intersects[0].object.material.wireframe = true
    // } 
  }
}

function onMouseClick(event) {
  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  console.log(mouse)

   // update the picking ray with the camera and mouse position
   raycaster.setFromCamera(mouse, camera);

   // calculate objects intersecting the picking ray
   //var intersects = raycaster.intersectObjects(scene.children);
   //console.log(intersects)

   var intersects = raycaster.intersectObjects(scene.children, true);
   console.log(intersects)

   if(intersects){
      console.log(intersects[0])
     //intersects[0].object.material.wireframe = true
   }

  //  for (var i = 0; i < intersects.length; i++) {
  //    intersects[i].object.material.wireframe = true
  //  }

}
//'#'+(Math.random()*0xFFFFFF<<0).toString(16);

function App() {
  var threeRef = useRef(null);

  function init() {
    window.addEventListener( 'click', onMouseClick, false );
    window.addEventListener( 'mousemove', onMouseMove, false );
    camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      1000
    );
    camera.position.z = 10;
    // y z axis exchange
    camera.up = new THREE.Vector3(0, 0, 1);

    scene = new THREE.Scene();

    var tg = new THREE.SphereGeometry(5,5,5)
    var tm = new THREE.MeshNormalMaterial();
    var tmesh = new THREE.Mesh(tg, tm);

    geometry = new THREE.BoxGeometry(2, 2, 2);
    material = new THREE.MeshNormalMaterial();

    mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(10, 0, 0)

    tmesh.add(mesh)
    scene.add(tmesh);



    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    threeRef.current.appendChild(renderer.domElement);

    var GridHelper = new THREE.GridHelper(1000, 100);
    //  y z axis exchange
    GridHelper.rotation.set(Math.PI / 2, 0, 0);
    scene.add(GridHelper);

    var AxesHelper = new THREE.AxesHelper(50);
    AxesHelper.position.set(0, 0, 0.1);
    scene.add(AxesHelper);
  }

  function animate() {
    requestAnimationFrame(animate);

    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.02;

   
    renderer.render(scene, camera);

    //renderer.render(scene, camera);
  }

  useEffect(() => {
    init();
    animate();
  }, []);

  return <div ref={threeRef} className="App"></div>;
}

export default App;
