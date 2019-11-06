import * as THREE from "three";
//import { CSG } from "@hi-level/three-csg";

export function ThreeInit(camera, scene, renderer) {
  console.log("threeInit");

  var GridHelper = new THREE.GridHelper(1000, 100);
  //  y z axis exchange
  GridHelper.rotation.set(Math.PI / 2, 0, 0);
  scene.add(GridHelper);

  var AxesHelper = new THREE.AxesHelper(30);
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
  lights[4].position.set(0, 0, 200);
  lights[5].position.set(200, 0, 0);
  scene.add(lights[0]);
  scene.add(lights[1]);
  scene.add(lights[2]);
  scene.add(lights[3]);
  scene.add(lights[4]);
  scene.add(lights[5]);

  let materialArray = [];
  let texture_ft = new THREE.TextureLoader().load("arid2_ft.jpg");
  let texture_bk = new THREE.TextureLoader().load("arid2_bk.jpg");
  let texture_up = new THREE.TextureLoader().load("arid2_up.jpg");
  let texture_dn = new THREE.TextureLoader().load("arid2_dn.jpg");
  let texture_rt = new THREE.TextureLoader().load("arid2_rt.jpg");
  let texture_lf = new THREE.TextureLoader().load("arid2_lf.jpg");

  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_ft }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_bk }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_up }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_dn }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_rt }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_lf }));

  for (let i = 0; i < 6; i++) materialArray[i].side = THREE.BackSide;

  let skyboxGeo = new THREE.BoxGeometry(10000, 10000, 10000);
  let skybox = new THREE.Mesh(skyboxGeo, materialArray);
  skybox.rotation.set(Math.PI / 2, 0, 0);
  scene.add(skybox);
}


  //////////////////////////////////////////////////////

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
  // })(roundedRectShape, 0, 0, 150, 50, 20);

  // var extrudeSettings = {
  //   depth: 8,
  //   bevelEnabled: true,
  //   bevelSegments: 2,
  //   steps: 2,
  //   bevelSize: 1,
  //   bevelThickness: 1
  // };
  // //addShape( roundedRectShape, extrudeSettings, 0x008000, - 150, 150, 0, 0, 0, 0, 1 );

  // roundedRectShape.autoClose = true;
  // var points = roundedRectShape.getPoints();

  // var geometryPoints = new THREE.BufferGeometry().setFromPoints(points);

  // // solid line
  // var line = new THREE.Line(
  //   geometryPoints,
  //   new THREE.LineBasicMaterial({ color: extrudeSettings })
  // );
  // line.position.set(0, 0, 0);
  // line.rotation.set(Math.PI / 2, 0, 0);
  // line.scale.set(1, 1, 1);
  // scene.add(line);

  // var line2 = new THREE.Line(
  //   geometryPoints,
  //   new THREE.LineBasicMaterial({ color: extrudeSettings })
  // );

  // line2.position.set(0, 10, 0);
  // line2.rotation.set(Math.PI / 2, 0, 0);
  // scene.add(line2);

  ////////////////////////////////////////////////////////////
//}

//   var numOfLngRebar = slabY / lngSpan;
//   for (let index = 0; index < numOfLngRebar; index++) {
//     var line = new THREE.Line(geometryPoints, mat);
//     line.position.set(0, index * lngSpan, 0);
//     line.rotation.set(Math.PI / 2, 0, 0);
//     line.scale.set(1, 1, 1);
//     group.add(line);
//   }

//   // var line = new THREE.Line(
//   //   geometryPoints,
//   //   new THREE.LineBasicMaterial({ color: '#f2f2f2' })
//   // );
//   // line.position.set(0, 0, 0);
//   // line.rotation.set(Math.PI / 2, 0, 0);
//   // line.scale.set(1, 1, 1);

//   group.add(line);
//   group.rotation.set(0, 0, -Math.PI / 2);

//   return group;
// }

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.moveTo(x, y + radius);
  ctx.lineTo(x, y + height - radius);
  ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
  ctx.lineTo(x + width - radius, y + height);
  ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
  ctx.lineTo(x + width, y + radius);
  ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
  ctx.lineTo(x + radius, y);
  ctx.quadraticCurveTo(x, y, x, y + radius);
}
