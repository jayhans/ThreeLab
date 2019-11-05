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
  var ramenPivotCenter;
  var spanLengthFix;

  switch (pivotMode) {
    case 0:
      ramenPosZ = -ramenColumnXY / 2;
      ramenPivotCenter = ramenColumnXY / 2;
      spanLengthFix = spanLength;
      break;
    case 1:
      ramenPosZ = ramenColumnXY / 2;
      ramenPivotCenter = -ramenColumnXY / 2;
      spanLengthFix = spanLength + ramenColumnXY;
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
  ramenPivot.position.set(0, 0, 0);

  var ramenPivot1 = new THREE.Mesh(pivotGeo, pivotMat);
  ramenPivot1.position.set(ramenWidth, 0, 0);

  //Ramen Beam
  var rbgeometry = new THREE.BoxGeometry(ramenWidth, ramenColumnXY, ramenBeamZ);
  var rbmaterial = new THREE.MeshStandardMaterial({
    color: 0xc0c0c0
  });
  var ramenBeam = new THREE.Mesh(rbgeometry, rbmaterial);
  ramenBeam.position.set(ramenWidth / 2, ramenPosZ, ramenBeamZ / 2);

  //first Ramen Column
  var geometry1 = new THREE.BoxGeometry(ramenColumnXY, ramenColumnXY, height);
  var material1 = new THREE.MeshStandardMaterial({
    color: 0xc0c0c0
  });
  var ramenCol1 = new THREE.Mesh(geometry1, material1);
  ramenCol1.position.set(ramenColumnXY / 2, ramenPosZ, height / 2);

  //second Ramen Column
  var geometry2 = new THREE.BoxGeometry(ramenColumnXY, ramenColumnXY, height);
  var material2 = new THREE.MeshStandardMaterial({
    color: 0xc0c0c0
  });
  var ramenCol2 = new THREE.Mesh(geometry2, material2);
  ramenCol2.position.set(-ramenColumnXY / 2, ramenPosZ, height / 2);

  beamPivot.add(ramenBeam);
  pivotPoint.add(beamPivot);
  ramenPivot.add(ramenCol1);
  //pivotPoint.add(ramenCol1);
  ramenPivot1.add(ramenCol2);
  pivotPoint.add(ramenPivot);
  pivotPoint.add(ramenPivot1);
  //pivotPoint.add(tramenBeam)
  //pivotPoint.rotation.set(0, 0, Math.PI / 2);

  // 다커짐 ....
  //pivotPoint.scale.set(2, 1 ,1)

  // 부분 만 커지게 .....
  //ramenBeam.scale.set(2, 1 ,1)

  var result = {
    floor: floor,
    nodes: [
      [
        ramenPivotCenter + spanLength,
        ramenColumnXY / 2,
        adjustedFloor * floorHeight
      ],
      [
        ramenPivotCenter + spanLength,
        ramenColumnXY / 2,
        height - ramenBeamZ / 2 + adjustedFloor * floorHeight
      ],
      [
        ramenPivotCenter + spanLength,
        ramenWidth - ramenColumnXY / 2,
        height - ramenBeamZ / 2 + adjustedFloor * floorHeight
      ],
      [
        ramenPivotCenter + spanLength,
        ramenWidth - ramenColumnXY / 2,
        adjustedFloor * floorHeight
      ]
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

export function DrawSlabFix(
  slabX,
  slabY,
  slabZ,
  floorHeight,
  floor,
  lc,
  rc,
  load
) {
  var pivotGeo = new THREE.SphereGeometry(1, 15, 15);
  var pivotMat = new THREE.MeshStandardMaterial({
    color: 0xc0c0c0,
    // wireframe: true
    transparent: true,
    opacity: 0.5
  });
  var pivotPoint = new THREE.Mesh(pivotGeo, pivotMat);

  pivotPoint.position.set(0, 0, floorHeight * floor);

  //first Ramen Column
  console.log(`slabX is ${slabX}`);
  var geometry1 = new THREE.BoxGeometry(slabX, slabY, slabZ);
  var material1 = new THREE.MeshLambertMaterial({
    color: 0xc0c0c0,
    // wireframe: true
    transparent: true,
    opacity: 0.5
  });
  var slabMesh = new THREE.Mesh(geometry1, material1);
  slabMesh.position.set(slabX / 2, -slabY / 2, -slabZ / 2);

  pivotPoint.add(slabMesh);

  // var tubegeometry = new THREE.TorusGeometry(10, 0.3, 26, 32);
  // var tubematerial = new THREE.MeshStandardMaterial({
  //   color: 0x346644,
  //   // wireframe: true
  //   transparent: true,
  //   opacity: 0.5
  // });
  // var tubeMesh = new THREE.Mesh(tubegeometry, tubematerial)

  //pivotPoint.add(tubeMesh)

  // lc, rc 가 존재할경우 추가해서 , pivot point 의 자식으로 넣어주자

  if (lc !== 0 && lc !== undefined) {
    var geometry = new THREE.BoxGeometry(slabX, lc, slabZ);
    var material = new THREE.MeshBasicMaterial({
      color: 0xffbb00,
      wireframe: true
    });
    var lcMesh = new THREE.Mesh(geometry, material);
    lcMesh.position.set(slabX / 2, lc / 2, -slabZ / 2);
    pivotPoint.add(lcMesh);
  }

  if (rc !== 0 && rc !== undefined) {
    var geometry = new THREE.BoxGeometry(slabX, rc, slabZ);
    var material = new THREE.MeshBasicMaterial({
      color: 0xffbb00,
      wireframe: true
    });
    var rcMesh = new THREE.Mesh(geometry, material);
    rcMesh.position.set(slabX / 2, -rc / 2 - slabY, -slabZ / 2);
    pivotPoint.add(rcMesh);
  }

  //var rebarG = drawRebar(rc+lc+slabX , slabZ , slabZ/2 )
  var rebarG = drawRebar(slabY, slabX, slabZ, slabZ / 2, 1, 10, 2, 10, 3);

  pivotPoint.add(rebarG);

  pivotPoint.rotation.set(0, 0, Math.PI / 2);

  // var result = {
  //   floor: floor,
  //   nodes: [
  //     [-lc, 0, floor * floorHeight - slabZ],
  //     [slabY + rc, 0, floor * floorHeight - slabZ],
  //     [slabY + rc, slabX, floor * floorHeight - slabZ],
  //     [-lc, slabX, floor * floorHeight - slabZ]
  //   ],
  //   loads: load
  // };
  // slabNodeArr.push(result);

  // Section["2"] = {
  //   name: "slab",
  //   width: slabY,
  //   depth: slabX,
  //   height: slabZ
  // };

  return pivotPoint;
}

// 길이가 긴 방향 lng ,    직선이 lng ,,, 짧은 방향이 감싼다. 
// width , height 나 여러가지 인자등이 커버 틱니스의 영향을 받아야함 ... 
function drawRebar(
  slabY,
  width,
  height,
  radius,
  lngRad,
  lngSpan,
  latRad,
  latSpan,
  coverThickness
) {
  var group = new THREE.Group()


  var insideBoxGeo = new THREE.BoxGeometry(width-coverThickness, slabY-coverThickness,height-coverThickness)
  var insideMat  = new THREE.MeshBasicMaterial({
    color: 0x777777,
    // wireframe: true,
    transparent: true,
    opacity: 0.5
  });
  var insideBox = new THREE.Mesh(insideBoxGeo, insideMat)
  insideBox.position.set((width)/2, (slabY)/2,-(height)/2)
  group.add(insideBox)




  var material = new THREE.LineBasicMaterial({
    color: 0xf2f2f2
  });

  // var geometry = new THREE.Geometry();
  // geometry.vertices.push(
  //   new THREE.Vector3(0, 0, -5),
  //   new THREE.Vector3(0, slabY, -5),

  //   new THREE.Vector3(0, 0, -height),
  //   new THREE.Vector3(0, slabY, -height)
  // );

  var numOfLatRebar = width / latSpan;
  for (let index = 1; index < numOfLatRebar; index++) {
    var geometry = new THREE.Geometry();
    geometry.vertices.push(
      new THREE.Vector3(0, 0, -latRad),
      new THREE.Vector3(0, slabY, -latRad),

      new THREE.Vector3(0, 0, -height+latRad),
      new THREE.Vector3(0, slabY, -height+latRad)
    );
    var line = new THREE.LineSegments(geometry, material);
    line.position.set(index*latSpan , 0 , 0)
    
    group.add(line);
  }

  // coverthickness 로 줄어든 내부상자의 비주얼화 필요 .... 

  var roundedRectShape = new THREE.Shape();
  // radius 는 height 의 반값 정도로 처리하자 ...
  // coverThickness 는 width height 에서 2배해서 빼주고 위치 보정 작업 으로 ??
  roundedRect(roundedRectShape, 0, -height, width, height, radius);

  roundedRectShape.autoClose = true;
  var points = roundedRectShape.getPoints();

  var geometryPoints = new THREE.BufferGeometry().setFromPoints(points);
  var mat = new THREE.LineBasicMaterial({ color: "#f2f2f2" });

  // solid line

  var numOfLngRebar = slabY / lngSpan;
  for (let index = 0; index < numOfLngRebar; index++) {
    var line = new THREE.Line(geometryPoints, mat);
    line.position.set(0, index * lngSpan, 0);
    line.rotation.set(Math.PI / 2, 0, 0);
    line.scale.set(1, 1, 1);
    group.add(line);
  }

  // var line = new THREE.Line(
  //   geometryPoints,
  //   new THREE.LineBasicMaterial({ color: '#f2f2f2' })
  // );
  // line.position.set(0, 0, 0);
  // line.rotation.set(Math.PI / 2, 0, 0);
  // line.scale.set(1, 1, 1);

  group.add(line);
  group.rotation.set(0, 0, -Math.PI / 2);

  return group;
}

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
