import * as THREE from "three";
//import { CSG } from "@hi-level/three-csg";

export function ThreeInit(camera, scene, renderer){
  console.log('threeInit');

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
  })(roundedRectShape, 0, 0, 150, 50, 20);

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
}


export function DrawRamenFix(
    ramenWidth,
    ramenColumnXY,
    ramenBeamZ,
    height,
    spanLength,
    pivotMode,
    floor,
    floorHeight
  ) {
    var adjustedFloor = floor - 1;
    var ramenPosZ;
    var ramenPivotCenter
    var spanLengthFix
  
    switch (pivotMode) {
      case 0:
        ramenPosZ = -ramenColumnXY / 2;
        ramenPivotCenter = ramenColumnXY/2
        spanLengthFix = spanLength
        break;
      case 1:
        ramenPosZ = ramenColumnXY / 2;
        ramenPivotCenter = -ramenColumnXY/2
        spanLengthFix = spanLength + ramenColumnXY
        break;
  
      default:
        break;
    }
   
  
    var pivotGeo = new THREE.SphereGeometry(1, 15, 15);
    var pivotMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      wireframe: true
    });
    var pivotPoint = new THREE.Mesh(pivotGeo, pivotMat);
    pivotPoint.position.set(spanLengthFix, 0, adjustedFloor * floorHeight);
  
    var beamPivot = new THREE.Mesh(pivotGeo, pivotMat);
    beamPivot.position.set(0, 0, height - ramenBeamZ);

    var ramenPivot = new THREE.Mesh(pivotGeo, pivotMat);
    ramenPivot.position.set(0,0,0)

    var ramenPivot1 = new THREE.Mesh(pivotGeo, pivotMat);
    ramenPivot1.position.set(ramenWidth,0,0)
  
    //Ramen Beam
    var rbgeometry = new THREE.BoxGeometry(ramenWidth, ramenColumnXY, ramenBeamZ);
    var rbmaterial = new THREE.MeshStandardMaterial({
      color: 0xc0c0c0,
      
    });
    var ramenBeam = new THREE.Mesh(rbgeometry, rbmaterial);
    ramenBeam.position.set(ramenWidth / 2, ramenPosZ, ramenBeamZ/2);
  
    //first Ramen Column
    var geometry1 = new THREE.BoxGeometry(ramenColumnXY, ramenColumnXY, height);
    var material1 = new THREE.MeshStandardMaterial({
      color: 0xc0c0c0,
      
    });
    var ramenCol1 = new THREE.Mesh(geometry1, material1);
    ramenCol1.position.set(ramenColumnXY / 2, ramenPosZ, height / 2);
  
    //second Ramen Column
    var geometry2 = new THREE.BoxGeometry(ramenColumnXY, ramenColumnXY, height);
    var material2 = new THREE.MeshStandardMaterial({
      color: 0xc0c0c0,
      
    });
    var ramenCol2 = new THREE.Mesh(geometry2, material2);
    ramenCol2.position.set(-ramenColumnXY / 2, ramenPosZ, height / 2);
  
    beamPivot.add(ramenBeam);
    pivotPoint.add(beamPivot);
    ramenPivot.add(ramenCol1)
    //pivotPoint.add(ramenCol1);
    ramenPivot1.add(ramenCol2);
    pivotPoint.add(ramenPivot)
    pivotPoint.add(ramenPivot1)
    //pivotPoint.add(tramenBeam)
    //pivotPoint.rotation.set(0, 0, Math.PI / 2);
  
    // 다커짐 ....
    //pivotPoint.scale.set(2, 1 ,1)
  
    // 부분 만 커지게 .....
    //ramenBeam.scale.set(2, 1 ,1)
  
  
    var result = {
      floor: floor,
      nodes: [
        [ramenPivotCenter+spanLength, ramenColumnXY/2, adjustedFloor * floorHeight],
        [ramenPivotCenter+spanLength, ramenColumnXY/2, height-ramenBeamZ/2 +adjustedFloor * floorHeight],
        [ramenPivotCenter+spanLength, ramenWidth-ramenColumnXY/2, height-ramenBeamZ/2 +adjustedFloor * floorHeight],
        [ramenPivotCenter+spanLength, ramenWidth-ramenColumnXY/2, adjustedFloor * floorHeight]
      ]
    };
    // ramenNodeArr.push(result)
  
    // Section["1"] = {
    //   "name":"rahmen",
    //   "width":ramenColumnXY,
    //   "depth":ramenColumnXY,
    //   "height":height
    // }
  
    return pivotPoint;
  }