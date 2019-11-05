import React, { useEffect, useRef } from "react";

import "./App.css";

import * as THREE from "three";
import OrbitControls from "three-orbitcontrols";

import Stats from "stats.js";

import { ThreeInit } from './threeFuncs'

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

    RebarTest(camera, scene, renderer);
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
function RebarTest(camera, scene, renderer) {
  var extrudeSettings = {
    depth: 8,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 2,
    bevelSize: 1,
    bevelThickness: 1
  };

  var x = 0;
  var y = 0;
  var height = 150;
  var width = 250;
  var dia = 16;
  var extend = 50

  //console.log('testfefefe')


  
  var geometry = new THREE.Geometry();
  geometry.vertices.push(new THREE.Vector3(x+extend,y,0))
  geometry.vertices.push(new THREE.Vector3(x,y,0))
  geometry.vertices.push(new THREE.Vector3(x,y+height,0))
  geometry.vertices.push(new THREE.Vector3(x+width,y+height,0))
  geometry.vertices.push(new THREE.Vector3(x+width,y,dia))
  geometry.vertices.push(new THREE.Vector3(x,y,dia))
  geometry.vertices.push(new THREE.Vector3(x,y+extend,dia))
  var line = new THREE.Line(geometry,new THREE.LineBasicMaterial({ color: extrudeSettings }));
  //scene.add(line)
  
  var newGeometry = new THREE.Geometry();
  newGeometry.vertices.push(new THREE.Vector3(+extend,y,0))

  //var normal = new THREE.Vector3.crossVectors(line1.Vector3, line2.Vector3)
  var points = geometry.vertices
  var v1 = new THREE.Vector3();
  var vc1 = new THREE.Vector3();
  var vc2 = new THREE.Vector3();
  var vc3 = new THREE.Vector3();
  var vc4 = new THREE.Vector3();
  var vc5 = new THREE.Vector3();
  var v2 = new THREE.Vector3();
  var v3 = new THREE.Vector3();
  var normal = new THREE.Vector3();
  var center = new THREE.Vector3();
  var rad
  var l1
  var radius = 20
  //console.log(points.length)
  for (let i = 1; i < points.length -1; i++) {
    //console.log(points[i].x);
    v1.subVectors(points[i-1],points[i]).normalize();
    v2.subVectors(points[i+1],points[i]).normalize();
    rad = Math.acos(v1.dot(v2))
    l1 = radius/Math.sin(rad/2)
    normal.crossVectors(v1,v2);
    v3.addVectors(v1,v2).normalize();
    center.addVectors(points[i],v3.clone().multiplyScalar(l1));
  
    var p1 = new THREE.Vector3().addVectors(points[i],v1.multiplyScalar(radius/Math.tan(rad/2)))
    var p5 = new THREE.Vector3().addVectors(points[i],v2.multiplyScalar(radius/Math.tan(rad/2)))
    var p3 = new THREE.Vector3().addVectors(points[i],v3.multiplyScalar(l1-radius))

    vc1.subVectors(p1,center).normalize();
    vc3.subVectors(p3,center).normalize();
    vc5.subVectors(p5,center).normalize();
    vc2.addVectors(vc1,vc3).normalize().multiplyScalar(radius);
    vc4.addVectors(vc5,vc3).normalize().multiplyScalar(radius);
   
    var p2 = new THREE.Vector3().addVectors(center, vc2);
    var p4 = new THREE.Vector3().addVectors(center, vc4);

    newGeometry.vertices.push(p1)
    newGeometry.vertices.push(p2)
    newGeometry.vertices.push(p3)
    newGeometry.vertices.push(p4)
    newGeometry.vertices.push(p5)
    //console.log(p1)
    //console.log(radius/Math.tan(rad/2));
  }
  newGeometry.vertices.push(new THREE.Vector3(x,y+extend,dia))
  var line2 = new THREE.Line(newGeometry,new THREE.LineBasicMaterial({ color: extrudeSettings }));
  scene.add(line2)
}
