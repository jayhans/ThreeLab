import React, { useEffect, useRef } from "react";
import "./App.css";
import * as THREE from "three";
import OrbitControls from "three-orbitcontrols";
import Stats from "stats.js";
import { ThreeInit } from './threeFuncs'
import { steelBoxMesh } from './steelBoxGirder'
import {Main, PointGenerator, LineMatch} from './nodeGenerator'
var camera, scene, renderer;

var stats = new Stats();
stats.showPanel(0); // 0:fps, 1:ms, 2: mb, 3+: custom

function App() {
  var threeRef = useRef(null);

  function init() {
    camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      1,
      300000
    );
    camera.position.z = 5000;
    // y z axis exchange
    camera.up = new THREE.Vector3(0, 0, 1000);

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

    // // Rounded rectangle
    // var roundedRectShape = new THREE.Shape();
    // (function roundedRect(ctx, x, y, width, height, radius) {
    //   ctx.moveTo(x, y + radius);
    //   ctx.lineTo(x, y + height - radius);
    //   ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
    //   ctx.lineTo(x + width - radius, y + height);
    //   ctx.quadraticCurveTo(
    //     x + width,
    //     y + height,
    //     x + width,
    //     y + height - radius
    //   );
    //   ctx.lineTo(x + width, y + radius);
    //   ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
    //   ctx.lineTo(x + radius, y);
    //   ctx.quadraticCurveTo(x, y, x, y + radius);
    // })(roundedRectShape, 0, 0, 100, 10, 5);

    var extrudeSettings = {
      depth: 8,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 2,
      bevelSize: 1,
      bevelThickness: 1
    };
    // //addShape( roundedRectShape, extrudeSettings, 0x008000, - 150, 150, 0, 0, 0, 0, 1 );

    // roundedRectShape.autoClose = true;
    // var points = roundedRectShape.getPoints();

    // var geometryPoints = new THREE.BufferGeometry().setFromPoints(points);
    // scene.add(line);
    // // var slab = DrawSlabFix(100, 100, 10, 30 , 1)
    // scene.add(slab)
    //steelBoxMesh(scene);
    let linedata = Main();

    console.log(linedata)

    // solid line
    var geometry = new THREE.Geometry();
    const xInit = linedata.p[0][0].x
    const yInit = linedata.p[0][0].y
    const zInit = linedata.p[0][0].z
    for (let i = 0; i<linedata.p[0].length;i++){
      geometry.vertices.push( new THREE.Vector3	(linedata.p[0][i].x - xInit,	linedata.p[0][i].y - yInit,	linedata.p[0][i].z - zInit));
    }
    var line = new THREE.Line(
      geometry, new THREE.LineBasicMaterial({ color: extrudeSettings })
    );
    scene.add(line);
    var geometry2 = new THREE.Geometry();
    for (let i = 0; i<linedata.p[1].length;i++){
      geometry2.vertices.push( new THREE.Vector3	(linedata.p[1][i].x - xInit,	linedata.p[1][i].y - yInit,	linedata.p[1][i].z - zInit));
    }
    var line2 = new THREE.Line(
      geometry2, new THREE.LineBasicMaterial({ color: extrudeSettings })
    );
    //console.log(geometry2)
    //scene.add(line2);

  //   let pts = linedata.girderLayout.centralSupportPoint;
  //   for (let i = 0; i<pts.length-1;i++){
  //   var newgeometry = new THREE.Geometry();
  //   newgeometry.vertices.push(new THREE.Vector3	(pts[i].x - xInit,	pts[i].y - yInit,	pts[i].z - zInit));
  //   newgeometry.vertices.push(new THREE.Vector3	(pts[i+1].x - xInit,	pts[i+1].y - yInit,	pts[i+1].z - zInit));
  //   scene.add(new THREE.Line(newgeometry, new THREE.LineBasicMaterial({ color: extrudeSettings })));
  // }
  let girdersupport = linedata.girderLayout.girderSupportPoint
  let girderSpan = linedata.girderLayout.girderSpanPoint

  for (let j = 0; j<girdersupport.length;j++){
    for (let i=1; i<girdersupport[j].length-2;i++){
      for (let k=0;k<girderSpan[j][i-1].length + 1;k++){
        let spts = {}
        let epts = {}
        if (k === 0){
          spts = {...girdersupport[j][i]}
          epts = {...girderSpan[j][i-1][k]}
        }else if (k === girderSpan[j][i-1].length){
          spts = {...girderSpan[j][i-1][k-1]}
          epts = {...girdersupport[j][i+1]}
          console.log(epts)
        }else{
          spts = {...girderSpan[j][i-1][k -1]}
          epts = {...girderSpan[j][i-1][k]}
        }
        var newgeometry = new THREE.Geometry();
        newgeometry.vertices.push(new THREE.Vector3	(spts.x - xInit,	spts.y - yInit,	spts.z - zInit));
        newgeometry.vertices.push(new THREE.Vector3	(epts.x - xInit,	epts.y - yInit,	epts.z - zInit));
        scene.add(new THREE.Line(newgeometry, new THREE.LineBasicMaterial({ color: extrudeSettings })));
      }
    }
  }
  // var newgeometry = new THREE.Geometry();
  // newgeometry.vertices.push(new THREE.Vector3	(linedata.mp.x - xInit,	linedata.mp.y - yInit,	linedata.mp.z - zInit));
  // newgeometry.vertices.push(new THREE.Vector3	(linedata.sp.x - xInit,	linedata.sp.y - yInit,	linedata.sp.z - zInit));
  // scene.add(new THREE.Line(newgeometry, new THREE.LineBasicMaterial({ color: extrudeSettings })));
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


function makeStirrup(height, width, extend, rebarDia, material) {
  var geometry = new THREE.Geometry();
  geometry.vertices.push(new THREE.Vector3(extend, 0, 0))
  geometry.vertices.push(new THREE.Vector3(0, 0, 0))
  geometry.vertices.push(new THREE.Vector3(0, height, 0))
  geometry.vertices.push(new THREE.Vector3(width, height, 0))
  geometry.vertices.push(new THREE.Vector3(width, 0, rebarDia))
  geometry.vertices.push(new THREE.Vector3(0, 0, rebarDia))
  geometry.vertices.push(new THREE.Vector3(0, extend, rebarDia))
  return geometry;
}

function filletPolyline(geometry, radius, smoothness) {
  var points = geometry.vertices
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
  for (let i = 1; i < points.length - 1; i++) {
    //console.log(points[i].x);
    v1.subVectors(points[i - 1], points[i]).normalize();
    v2.subVectors(points[i + 1], points[i]).normalize();
    ang = Math.acos(v1.dot(v2))
    l1 = radius / Math.sin(ang / 2)
    v3.addVectors(v1, v2).setLength(l1);
    center.addVectors(points[i], v3);
    var p1 = new THREE.Vector3().addVectors(points[i], v1.multiplyScalar(radius / Math.tan(ang / 2)))
    var p2 = new THREE.Vector3().addVectors(points[i], v2.multiplyScalar(radius / Math.tan(ang / 2)))
    vc1.subVectors(p1, center);
    vc2.subVectors(p2, center);

    newGeometry.vertices.push(p1)
    for (let j = 0; j < smoothness; j++) {
      var dirVec = new THREE.Vector3().addVectors(vc1.clone().multiplyScalar(smoothness - j), vc2.clone().multiplyScalar(j + 1)).setLength(radius);
      newGeometry.vertices.push(new THREE.Vector3().addVectors(center, dirVec));
    }
    newGeometry.vertices.push(p2)
  }
  newGeometry.vertices.push(points[points.length - 1])
  //var line2 = new THREE.Line(newGeometry,line.material);
  //scene.add(line2)
  return newGeometry;
}



