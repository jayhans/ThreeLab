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
    //scene.add(line);

    var line2 = new THREE.Line(
      geometryPoints,
      new THREE.LineBasicMaterial({ color: extrudeSettings })
    );

    line2.position.set(0, 10, 0);
    line2.rotation.set(Math.PI / 2, 0, 0);
    //scene.add(line2);


    // var slab = DrawSlabFix(100, 100, 10, 30 , 1)

    // scene.add(slab)



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
  var rebarDia = 16;
  var extend = 50
  var line = makeStirrup(height, width, extend, rebarDia, new THREE.LineBasicMaterial({ color: extrudeSettings }))
  //var line = new THREE.Line(geometry,new THREE.LineBasicMaterial({ color: extrudeSettings }));
  scene.add(filletPolyline(line,20,5))
}

function makeStirrup(height, width, extend, rebarDia, material) {
  var geometry = new THREE.Geometry();
  geometry.vertices.push(new THREE.Vector3(extend,0,0))
  geometry.vertices.push(new THREE.Vector3(0,0,0))
  geometry.vertices.push(new THREE.Vector3(0,height,0))
  geometry.vertices.push(new THREE.Vector3(width,height,0))
  geometry.vertices.push(new THREE.Vector3(width,0,rebarDia))
  geometry.vertices.push(new THREE.Vector3(0,0,rebarDia))
  geometry.vertices.push(new THREE.Vector3(0,extend,rebarDia))
  return new THREE.Line(geometry,material);
}

function filletPolyline(line,radius,smoothness) {
  var points = line.geometry.vertices
  var newGeometry = new THREE.Geometry();
  var v1 = new THREE.Vector3();
  var v2 = new THREE.Vector3();
  var v3 = new THREE.Vector3();
  var vc1 = new THREE.Vector3();
  var vc2 = new THREE.Vector3();
  var center = new THREE.Vector3();
  var ang
  var l1

  newGeometry.vertices.push(points[0])
  for (let i = 1; i < points.length -1; i++) {
    //console.log(points[i].x);
    v1.subVectors(points[i-1],points[i]).normalize();
    v2.subVectors(points[i+1],points[i]).normalize();
    ang = Math.acos(v1.dot(v2))
    l1 = radius/Math.sin(ang/2)
    v3.addVectors(v1,v2).setLength(l1);
    center.addVectors(points[i],v3);
    var p1 = new THREE.Vector3().addVectors(points[i],v1.multiplyScalar(radius/Math.tan(ang/2)))
    var p2 = new THREE.Vector3().addVectors(points[i],v2.multiplyScalar(radius/Math.tan(ang/2)))
    vc1.subVectors(p1,center);
    vc2.subVectors(p2,center);
   
    newGeometry.vertices.push(p1)
    for (let j = 0; j < smoothness; j++)    {
      var dirVec = new THREE.Vector3().addVectors(vc1.clone().multiplyScalar(smoothness-j),vc2.clone().multiplyScalar(j+1)).setLength(radius);
      newGeometry.vertices.push(new THREE.Vector3().addVectors(center,dirVec));
    }
    newGeometry.vertices.push(p2)
  }
  newGeometry.vertices.push(points[points.length-1])
  //var line2 = new THREE.Line(newGeometry,line.material);
  //scene.add(line2)
  return new THREE.Line(newGeometry,line.material);
}