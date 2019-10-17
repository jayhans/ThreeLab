import React, { useEffect, useRef } from "react";
import logo from "./logo.svg";
import "./App.css";

import * as THREE from "three";
import OrbitControls from "three-orbitcontrols";

import Stats from "stats.js";

var camera, scene, renderer;
var geometry, material, mesh;

var stats = new Stats();
stats.showPanel(0); // 0:fps, 1:ms, 2: mb, 3+: custom

var texture = new THREE.TextureLoader().load("brick_diffuse.jpg")
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set( 9, 1 );
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

var lastClickedMesh

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
    lastClickedMesh.material.transparent=false
   if(intersects[0]){
      console.log(intersects[0])
      if(intersects[0].object.type==="Mesh"){
         //intersects[0].object.material.wireframe = true
         console.log(intersects[0].object.userData)
         intersects[0].object.material.transparent= true
         intersects[0].object.material.opacity = 0.5
         lastClickedMesh = intersects[0].object
      }
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
    //window.addEventListener( 'mousemove', onMouseMove, false );
    camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      1000
    );
    camera.position.z = 400;
    // y z axis exchange
    camera.up = new THREE.Vector3(0, 0, 1);

    scene = new THREE.Scene();

    geometry = new THREE.BoxGeometry(200, 200, 200);
    var material = new THREE.MeshLambertMaterial({  map: texture, transparent:true, opacity:0.5});
    
    var tg = new THREE.SphereGeometry(5,5,5)
    var tm = new THREE.MeshNormalMaterial();
    var tmesh = new THREE.Mesh(tg, tm);

  

    mesh = new THREE.Mesh(geometry, material);
    mesh.userData = {"철근정보":999}

    mesh.position.set(10, 0, 0)

    tmesh.add(mesh)
    scene.add(tmesh);

    lastClickedMesh = mesh



    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    threeRef.current.appendChild(renderer.domElement);
    threeRef.current.appendChild(stats.dom);

    var GridHelper = new THREE.GridHelper(1000, 100);
    //  y z axis exchange
    GridHelper.rotation.set(Math.PI / 2, 0, 0);
    scene.add(GridHelper);

    var AxesHelper = new THREE.AxesHelper(50);
    AxesHelper.position.set(0, 0, 0.1);
    scene.add(AxesHelper);

    var light = new THREE.AmbientLight(0x000000);
    scene.add(light);

    var lights = [];
    lights[0] = new THREE.PointLight(0xffffff, 1, 0);
    lights[1] = new THREE.PointLight(0xffffff, 1, 0);
    lights[2] = new THREE.PointLight(0xffffff, 1, 0);
    lights[3] = new THREE.PointLight(0xffffff, 1, 0);
    lights[4] = new THREE.PointLight(0xffffff, 1, 0);
    lights[5] = new THREE.PointLight(0xffffff, 1, 0);
    lights[0].position.set(0, 200, 0);
    lights[1].position.set(100, 200, 100);
    lights[2].position.set(-100, -200, -100);
    lights[3].position.set(0, -200, 0);
    lights[4].position.set(0,0,200);
    lights[5].position.set(200,0,0);
    scene.add(lights[0]);
    scene.add(lights[1]);
    scene.add(lights[2]);
    scene.add(lights[3]);
    scene.add(lights[4]);
    scene.add(lights[5]);

    //THREE.Def
  }

  function animate() {
    stats.begin();
    stats.end();

    requestAnimationFrame(animate);

    mesh.rotation.x += 0.01;
    //mesh.rotation.y += 0.02;

   
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
