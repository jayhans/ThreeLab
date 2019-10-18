import * as THREE from "three";
//import { CSG } from "@hi-level/three-csg";


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