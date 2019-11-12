import "./App.css";
import * as THREE from "three";
export function steelBoxMesh(scene) {
    var baseline = girderCurve()    //geometry
    var spline = new THREE.CatmullRomCurve3(baseline.vertices)
    var splinelength = spline.getLength()
    var startpoint = 500;
    var diaphragmDistance = 5000;
    var sp = 5; // spacing 각 파트가 서로 중첩되지 않도록 간격 설정 0:원본값
    var material =  new THREE.MeshNormalMaterial(); //new THREE.MeshLambertMaterial( { color: 0x00aa00,emissive: 0x008800, wireframe: false } );
    var material2 =  new THREE.MeshLambertMaterial( { color: 0x00aa00,emissive: 0x00ff00, wireframe: true } );
    //control variables-start
    var B = 1800; // 하단 웹간격
    var H = 2500; // 웹높이
    var ULR = 1300; // 상단 웹간격/2
    var C = 100; // 하단플렌지돌출길이
    var C1 = 200; // 상단플렌지돌출길이
    var upperflangeThickness = 18;
    var webThickness = 12;
    var lowerflangeThickness = 14;
    var longiRibHeight = 150;
    var longiRibThickness = 12;
    var longiRibRayout = [-180,180]
    //diaphragm variables
    var lowerHeight = 250;
    var lowerThickness = 12;
    var lowerTopThickness = 10;
    var lowerTopwidth = 100;
    var upperThickness = 12;
    var upperHeight = 220;
    var sideHeight = 200;
    var sideThickness = 14;
    var leftsideTopwidth = 350;
    var leftsideTopThickness = 12;
    var leftsideToplength = 700;
    var rightsideTopwidth = 220;
    var rightsideTopThickness = 12;
    var rightsideToplength = 80;
    //v-stiffner variables
    var VsideHeight = 200;
    var VsideThickness = 14;
    var bottomOffset = 60;
    //h-stiffner variables
    var sideTopThickness = 14;
    var sideToplength = 700;
    var sideTopwidth = 300;

    var dia = diaphragm(material,sp,B, H, ULR, C1, lowerHeight,lowerThickness,lowerTopThickness,lowerTopwidth,upperThickness,longiRibHeight,longiRibRayout,
        upperHeight,sideHeight,sideThickness,leftsideTopwidth,leftsideTopThickness,leftsideToplength,rightsideTopwidth,rightsideTopThickness,rightsideToplength);
    var vstiff = vstiffner(material,sp,B,H,ULR,VsideHeight,VsideThickness,upperHeight,bottomOffset);

    //// diaphragm layout function
    for (let i = startpoint; i <= splinelength; i+=diaphragmDistance){
      var tangent = spline.getTangent(i/splinelength)
      var rad = Math.atan(tangent.y/tangent.x) - Math.PI/2
      var newdia = dia.clone()
      newdia.rotateOnWorldAxis(new THREE.Vector3(0,0,1),rad);
      var point = spline.getPoint(i/splinelength)
      newdia.position.set(point.x, point.y, point.z)
      scene.add(newdia)
    }
    vstiff.rotation.set(Math.PI/2,0,0);
    //// vstiffner layout function
    for (let i = startpoint + diaphragmDistance/2; i <= splinelength; i+=diaphragmDistance){
      var tangent = spline.getTangent(i/splinelength)
      var rad = Math.atan(tangent.y/tangent.x) - Math.PI/2
      var newvstiff = vstiff.clone()
      newvstiff.rotateOnWorldAxis(new THREE.Vector3(0,0,1),rad);
      var point = spline.getPoint(i/splinelength)
      newvstiff.position.set(point.x, point.y, point.z)
      scene.add(newvstiff)
    }
    scene.add(hstiff(spline,material,sp,B,H,ULR,upperHeight,VsideHeight,sideTopThickness,sideToplength,sideTopwidth))
    scene.add(boxShapes(material2,spline,sp,B,H,ULR,C,C1,upperflangeThickness,webThickness,lowerflangeThickness,longiRibHeight,longiRibThickness,longiRibRayout))
    scene.add(new THREE.Line(baseline, new THREE.LineBasicMaterial({ color: 0xff0000 })))
  }

  function girderCurve() {
    var geometry = new THREE.Geometry();
    geometry.vertices.push(
      new THREE.Vector3	(	0	,	0	,	2854	),
      new THREE.Vector3	(	1151	,	4735	,	2904	),
      new THREE.Vector3	(	2419	,	9439	,	2954	),
      new THREE.Vector3	(	3804	,	14110	,	3004	),
      new THREE.Vector3	(	5306	,	18745	,	3054	),
      new THREE.Vector3	(	6923	,	23341	,	3104	),
      new THREE.Vector3	(	8655	,	27895	,	3154	),
      new THREE.Vector3	(	10499	,	32404	,	3204	),
      new THREE.Vector3	(	12456	,	36866	,	3254	),
      new THREE.Vector3	(	14524	,	41277	,	3299	),
      new THREE.Vector3	(	16702	,	45636	,	3340	),
      new THREE.Vector3	(	18721	,	49450	,	3372	)
      );  
    // var curve = new THREE.SplineCurve(geometry.vertices);
    // var points = curve.getPoint(50);
    // var newgeometry = new THREE.BufferGeometry().setFromPoints(points);
    // var newline = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xff0000 }));
    return geometry
  }
   
  function boxShapes(material,spline,sp,B,H,ULR,C,C1,upperflangeThickness,webThickness,lowerflangeThickness,longiRibHeight,longiRibThickness,longiRibRayout){
    B = B + 2*sp
    ULR = ULR + sp

    var cosine = H/Math.sqrt(Math.pow(H,2) + Math.pow((ULR - B/2),2));
    var shapes = [];
    var leftupper = [
      new THREE.Vector2(-sp, ULR + C1),
      new THREE.Vector2(-sp,ULR - C1),
      new THREE.Vector2(-sp-upperflangeThickness, ULR - C1),
      new THREE.Vector2(-sp-upperflangeThickness, ULR + C1)
    ];
    shapes.push(new THREE.Shape(leftupper));
    var rightupper = [
      new THREE.Vector2(-sp, -ULR - C1),
      new THREE.Vector2(-sp, -ULR + C1),
      new THREE.Vector2(-sp-upperflangeThickness, -ULR + C1),
      new THREE.Vector2(-sp-upperflangeThickness, -ULR - C1)
    ];
    shapes.push(new THREE.Shape(rightupper));
    var leftweb = [
      new THREE.Vector2( 0, ULR),
      new THREE.Vector2(0, ULR  + webThickness / cosine),
      new THREE.Vector2(H, B/2 + webThickness),
      new THREE.Vector2(H, B/2)
    ];
    shapes.push(new THREE.Shape(leftweb));
    var rightweb = [
      new THREE.Vector2(0, -ULR),
      new THREE.Vector2(0, -ULR -webThickness / cosine),
      new THREE.Vector2( H, -B/2 -webThickness),
      new THREE.Vector2(H, -B/2)
    ];
    shapes.push(new THREE.Shape(rightweb));
    var lowerflange = [
      new THREE.Vector2(H + sp, -B/2 - C),
      new THREE.Vector2(H + sp, B/2 + C),
      new THREE.Vector2(H + sp + lowerflangeThickness, B/2 + C),
      new THREE.Vector2(H + sp + lowerflangeThickness, -B/2 - C)
    ];
    shapes.push(new THREE.Shape(lowerflange));
    for (let i = 0; i< longiRibRayout.length;i++){
      var Rib = [
        new THREE.Vector2(H, -longiRibRayout[i] - longiRibThickness/2),
        new THREE.Vector2(H, -longiRibRayout[i] + longiRibThickness/2),
        new THREE.Vector2(H - longiRibHeight, -longiRibRayout[i] + longiRibThickness/2),
        new THREE.Vector2(H - longiRibHeight, -longiRibRayout[i] - longiRibThickness/2),
      ];
      shapes.push(new THREE.Shape(Rib));
    }
    var boxgeometry = new THREE.ExtrudeBufferGeometry(shapes, {steps: 100, bevelEnabled: false, extrudePath: spline} );
    var boxmesh = new THREE.Mesh( boxgeometry, material );
    
    return boxmesh
  }
  
  
  function diaphragm(material, sp, B, H, ULR, C1, lowerHeight,lowerThickness,lowerTopThickness,lowerTopwidth,upperThickness,longiRibHeight,longiRibRayout,
    upperHeight,sideHeight,sideThickness,leftsideTopwidth,leftsideTopThickness,leftsideToplength,rightsideTopwidth,rightsideTopThickness,rightsideToplength){
  
    // var B = 2000;
    // var H = 2500;
    // var ULR = 1300;
    // //var C = 100;
    // //var C1 = 200;
    // var lowerHeight = 250;
    // var lowerThickness = 12;
    // var lowerTopThickness = 10;
    // var lowerTopwidth = 100;
    // var upperThickness = 12;
    // var longiRibHeight = 150;
    // var longiRibRayout = [-180,180]
    // var upperHeight = 220;
    // var sideHeight = 200;
    // var sideThickness = 14;
    // var leftsideTopwidth = 350;
    // var leftsideTopThickness = 12;
    // var leftsideToplength = 700;
    // var rightsideTopwidth = 220;
    // var rightsideTopThickness = 12;
    // var rightsideToplength = 80;
    var upperTopThickness = 10;
    var upperTopwidth = 150;
  
    var cosine = H/Math.sqrt(Math.pow(H,2) + Math.pow((ULR - B/2),2));
    var lower = new THREE.Shape();
    var upper = new THREE.Shape();
    var lowerTopShape = new THREE.Shape();
    var leftsideShape = new THREE.Shape();
    var rightsideShape = new THREE.Shape();
    var leftTopShape = new THREE.Shape();
    var rightTopShape = new THREE.Shape();
  
    var material = new THREE.MeshNormalMaterial(); //new THREE.MeshLambertMaterial( { color: 0xaaaa00,emissive: 0x888800, wireframe: false } );
    var material2 = new THREE.MeshNormalMaterial(); // new THREE.MeshLambertMaterial( { color: 0x0000aa,emissive: 0x000088, wireframe: false } )

  ///lower stiffener
    var plate = [];
    var lowerHeight2 = lowerHeight - sp;
    plate.push(new THREE.Vector2(-B/2 -lowerHeight2/H * (ULR - B/2),-H + lowerHeight2));
    plate.push(new THREE.Vector2(-B/2,-H));
    plate.push(new THREE.Vector2(B/2,-H));
    plate.push(new THREE.Vector2(B/2 + lowerHeight2/H * (ULR - B/2),-H + lowerHeight2));
    var points = [];
    points.push(plate[0]);
    points = points.concat(scallop(plate[0],plate[1],plate[2],35,4));
    //// longitudinal stiffner holes
    for (let i=0; i<longiRibRayout.length;i++){
      points.push(new THREE.Vector2( longiRibRayout[i] - 42,-H));
      var curve = new THREE.ArcCurve(longiRibRayout[i],-H + longiRibHeight,25,Math.PI,0,true);
      points = points.concat(curve.getPoints(8));
      points.push(new THREE.Vector2( longiRibRayout[i] + 42,-H));
    }
    ////
    points = points.concat(scallop(plate[1],plate[2],plate[3],35,4));
    points.push(plate[3]);
    lower.setFromPoints(points)
  var lowerGeometry = new THREE.ExtrudeBufferGeometry(lower,{depth: lowerThickness, steps: 1,bevelEnabled: false});
  //var lowerGeometry2 = new THREE.ExtrudeBufferGeometry(lower,{depth: -lowerThickness/2, steps: 1,bevelEnabled: false});
  var lowerMesh = new THREE.Mesh(lowerGeometry, material);
  lowerMesh.translateZ(-lowerThickness/2)
  //var lowerMesh2 = new THREE.Mesh(lowerGeometry2, material);
  ////
  var lowerTopPoints = [new THREE.Vector2(-B/2 -lowerHeight/H * (ULR - B/2),-H + lowerHeight),
                  new THREE.Vector2(-B/2 -(lowerHeight+lowerTopThickness)/H * (ULR - B/2),-H + (lowerHeight+lowerTopThickness)),
                  new THREE.Vector2(B/2 + (lowerHeight+lowerTopThickness)/H * (ULR - B/2),-H + (lowerHeight+lowerTopThickness)),
                  new THREE.Vector2(B/2 + lowerHeight/H * (ULR - B/2),-H + lowerHeight)];
  lowerTopShape.setFromPoints(lowerTopPoints);
  var lowerTopGeometry = new THREE.ExtrudeBufferGeometry(lowerTopShape, {steps: 1, bevelEnabled: false, depth: lowerTopwidth});
  //var lowerTopGeometry2 = new THREE.ExtrudeBufferGeometry(lowerTopShape, {steps: 1, bevelEnabled: false, depth: -lowerTopwidth/2});
  var lowerTopMesh = new THREE.Mesh(lowerTopGeometry,material2);
  lowerTopMesh.translateZ(-lowerTopwidth/2);
  //var lowerTopMesh2 = new THREE.Mesh(lowerTopGeometry2,material2);
  ////
  ///upper stiffener
  var upperHeight2 = upperHeight - sp
  var plate2 = [];
  plate2.push(new THREE.Vector2(-ULR,0));
  plate2.push(new THREE.Vector2(-ULR + upperHeight2/H * (ULR - B/2),-upperHeight2));
  plate2.push(new THREE.Vector2(ULR - upperHeight2/H * (ULR - B/2),-upperHeight2));
  plate2.push(new THREE.Vector2(ULR,0));
  var points2 = [];
  points2 = points2.concat(scallop(plate2[3],plate2[0],plate2[1],35,4));
  points2.push(plate2[1]);
  points2.push(plate2[2]);
  points2 = points2.concat(scallop(plate2[2],plate2[3],plate2[0],35,4));
  upper.setFromPoints(points2)
  var upperGeometry = new THREE.ExtrudeBufferGeometry(upper, {steps: 1, bevelEnabled: false, depth: upperThickness});
  //var upperGeometry2 = new THREE.ExtrudeBufferGeometry(upper, {steps: 1, bevelEnabled: false, depth: -upperThickness/2});
  var upperMesh = new THREE.Mesh(upperGeometry,material);
  upperMesh.translateZ(-upperThickness/2);
  //var upperMesh2 = new THREE.Mesh(upperGeometry2,material);
  
  //upperTopPlate
  var upperTop = [
    new THREE.Vector2(-ULR + C1, sp),
    new THREE.Vector2(ULR - C1, sp),
    new THREE.Vector2(ULR - C1, upperTopThickness + sp),
    new THREE.Vector2(-ULR + C1, upperTopThickness + sp)
  ];
  var upperTopShape = new THREE.Shape(upperTop);
  var upperTopGeometry = new THREE.ExtrudeBufferGeometry(upperTopShape, {steps: 1, bevelEnabled: false, depth: upperTopwidth});
  var upperTopMesh = new THREE.Mesh(upperTopGeometry,material);
  upperTopMesh.translateZ(-upperTopwidth/2);



  ////left side stiffner
  var lowerTopThickness2 = lowerTopThickness + sp
  var leftsideTopThickness2 = leftsideTopThickness + sp
  var leftplate = [new THREE.Vector2(-B/2 -(lowerHeight+lowerTopThickness2)/H * (ULR - B/2),-H + (lowerHeight+lowerTopThickness2)), 
    new THREE.Vector2(-B/2 -(lowerHeight+lowerTopThickness2)/H * (ULR - B/2) + sideHeight/cosine, -H + (lowerHeight+lowerTopThickness2)),
    new THREE.Vector2(-ULR + (upperHeight+leftsideTopThickness2)/H * (ULR - B/2)+ sideHeight/cosine,-(upperHeight+leftsideTopThickness2)),
    new THREE.Vector2(-ULR + (upperHeight+leftsideTopThickness2)/H * (ULR - B/2),-(upperHeight+leftsideTopThickness2))];
  leftsideShape.setFromPoints(leftplate);
  var leftplateGeometry = new THREE.ExtrudeBufferGeometry(leftsideShape, {steps: 1, bevelEnabled: false, depth: sideThickness});
  //var leftplateGeometry2 = new THREE.ExtrudeBufferGeometry(leftsideShape, {steps: 1, bevelEnabled: false, depth: -sideThickness/2});
  var leftplateMesh = new THREE.Mesh(leftplateGeometry,material);
  leftplateMesh.translateZ(-sideThickness/2);
  //var leftplateMesh2 = new THREE.Mesh(leftplateGeometry2,material);
  
  ////right side stiffner
  var rightsideTopThickness2 = rightsideTopThickness + sp
  var rightplate = [new THREE.Vector2(B/2 + (lowerHeight+lowerTopThickness2)/H * (ULR - B/2),-H + (lowerHeight+lowerTopThickness2)), 
    new THREE.Vector2(B/2 + (lowerHeight+lowerTopThickness2)/H * (ULR - B/2) - sideHeight/cosine, -H + (lowerHeight+lowerTopThickness2)),
    new THREE.Vector2(ULR - (upperHeight+rightsideTopThickness2)/H * (ULR - B/2)- sideHeight/cosine,-(upperHeight+rightsideTopThickness2)),
    new THREE.Vector2(ULR - (upperHeight+rightsideTopThickness2)/H * (ULR - B/2),-(upperHeight+rightsideTopThickness2))];
  rightsideShape.setFromPoints(rightplate);
  var rightplateGeometry = new THREE.ExtrudeBufferGeometry(rightsideShape, {steps: 1, bevelEnabled: false, depth: sideThickness/2});
  var rightplateGeometry2 = new THREE.ExtrudeBufferGeometry(rightsideShape, {steps: 1, bevelEnabled: false, depth: -sideThickness/2});
  var rightplateMesh = new THREE.Mesh(rightplateGeometry,material);
  var rightplateMesh2 = new THREE.Mesh(rightplateGeometry2,material);
  ////leftside top plate
  var leftTopPlate = [new THREE.Vector2(-ULR + upperHeight/H * (ULR - B/2),-upperHeight),
                    new THREE.Vector2(-ULR + (upperHeight+leftsideTopThickness)/H * (ULR - B/2),-(upperHeight+leftsideTopThickness)),
                    new THREE.Vector2(-ULR + (upperHeight+leftsideTopThickness)/H * (ULR - B/2)+leftsideTopwidth,-(upperHeight+leftsideTopThickness)),
                    new THREE.Vector2(-ULR + upperHeight/H * (ULR - B/2) + leftsideTopwidth, -upperHeight)];
  leftTopShape.setFromPoints(leftTopPlate);
  var leftTopGeometry = new THREE.ExtrudeBufferGeometry(leftTopShape, {steps: 1, bevelEnabled: false, depth: leftsideToplength});
  //var leftTopGeometry2 = new THREE.ExtrudeBufferGeometry(leftTopShape, {steps: 1, bevelEnabled: false, depth: -leftsideToplength/2});
  var leftTopMesh = new THREE.Mesh(leftTopGeometry,material2);
  leftTopMesh.translateZ(-leftsideToplength/2);
  //var leftTopMesh2 = new THREE.Mesh(leftTopGeometry2,material2);

  ////rightside top plate
  var rightTopPlate = [new THREE.Vector2(ULR - upperHeight/H * (ULR - B/2),-upperHeight),
                    new THREE.Vector2(ULR - (upperHeight+rightsideTopThickness)/H * (ULR - B/2),-(upperHeight+rightsideTopThickness)),
                    new THREE.Vector2(ULR - (upperHeight+rightsideTopThickness)/H * (ULR - B/2) - rightsideTopwidth,-(upperHeight+rightsideTopThickness)),
                    new THREE.Vector2(ULR - upperHeight/H * (ULR - B/2)  - rightsideTopwidth, -upperHeight)];
  rightTopShape.setFromPoints(rightTopPlate);
  var rightTopGeometry = new THREE.ExtrudeBufferGeometry(rightTopShape, {steps: 1, bevelEnabled: false, depth: rightsideToplength});
  //var rightTopGeometry2 = new THREE.ExtrudeBufferGeometry(rightTopShape, {steps: 1, bevelEnabled: false, depth: -rightsideToplength/2});
  var rightTopMesh = new THREE.Mesh(rightTopGeometry,material2);
  //var rightTopMesh2 = new THREE.Mesh(rightTopGeometry2,material2);
  rightTopMesh.translateZ(-rightsideToplength/2);

  /// k-frame diaphragm
  // var leftlinepints = [
  //   new THREE.Vector3(-50,0,upperThickness/2),
  //   new THREE.Vector3(lowerTopPoints[1].x,lowerTopPoints[1].y,lowerThickness/2)
  // ];
  var dummyline =  new THREE.LineCurve3(new THREE.Vector3(-50,0,upperThickness/2+sp),
                                        new THREE.Vector3(lowerTopPoints[1].x,lowerTopPoints[1].y,sideThickness/2+sp));
  var leftframeline = new THREE.LineCurve3(dummyline.getPoint(0.05),dummyline.getPoint(0.9));
  var dummyline2 =  new THREE.LineCurve3(new THREE.Vector3(50,0,upperThickness/2+sp),
                                        new THREE.Vector3(lowerTopPoints[2].x,lowerTopPoints[2].y,sideThickness/2+sp));
  var rightframeline = new THREE.LineCurve3(dummyline2.getPoint(0.9),dummyline2.getPoint(0.05));
  
  //L100x100x10 section point, origin = (0,0)
  var pts = [
    new THREE.Vector2(-100,28.22),
    new THREE.Vector2(0,28.22),
    new THREE.Vector2(0,-71.78),
    new THREE.Vector2(-10,-71.78),
    new THREE.Vector2(-10,18.22),
    new THREE.Vector2(-100,18.22)
  ];
  var shape = new THREE.Shape( pts );
  var geometry1 = new THREE.ExtrudeBufferGeometry( shape, {steps: 10, bevelEnabled: false, extrudePath: leftframeline} );
  var geometry2 = new THREE.ExtrudeBufferGeometry( shape, {steps: 10, bevelEnabled: false, extrudePath: rightframeline} );
  var leftframemesh1 = new THREE.Mesh( geometry1, material2 );
  var rightframemesh2 = new THREE.Mesh( geometry2, material2 );
  
  
  //var shapes = [upper,lower,lowerTopShape,leftsideShape,rightsideShape,leftTopShape,rightTopShape];
  //var Geometry = new THREE.ShapeBufferGeometry(shapes); //upper);
  //var Mesh = new THREE.Mesh(Geometry, material);
  
  var group = new THREE.Group();
  group.add(lowerMesh);
  //group.add(lowerMesh2);
  group.add(lowerTopMesh);
  //group.add(lowerTopMesh2);
  group.add(upperMesh);
  group.add(upperTopMesh);
  //group.add(upperMesh2);
  group.add(leftplateMesh);
  //group.add(leftplateMesh2);
  group.add(rightplateMesh);
  //group.add(rightplateMesh2);
  group.add(leftTopMesh);
  //group.add(leftTopMesh2);
  group.add(rightTopMesh);
  //group.add(rightTopMesh2);
  //group.add(Mesh);
  group.add(leftframemesh1);
  group.add(rightframemesh2);
  // group.add(Mesh);
  group.rotation.set(Math.PI/2,0,0);    
  return group
  }
  
  function vstiffner(material,sp,B,H,ULR,sideHeight,sideThickness,upperHeight,bottomOffset){
    // var B = 2000;
    // var H = 2500;
    // var ULR = 1300;
    // //var C = 100;
    // //var C1 = 200;
  
    // var sideHeight = 200;
    // var sideThickness = 14;
    // var upperHeight = 220;
    // var bottomOffset = 60;
  
    var cosine = H/Math.sqrt(Math.pow(H,2) + Math.pow((ULR - B/2),2));
    var sine = (ULR - B/2)/Math.sqrt(Math.pow(H,2) + Math.pow((ULR - B/2),2));
  
    var leftsideShape = new THREE.Shape();
    var rightsideShape = new THREE.Shape();
    
    //var material = new THREE.MeshNormalMaterial(); // new THREE.MeshLambertMaterial( { color: 0x00ff00,emissive: 0x00aa00, wireframe: false } );
    //var material2 = new THREE.MeshNormalMaterial(); //new THREE.MeshLambertMaterial( { color: 0x0000aa,emissive: 0x000088, wireframe: false } );
  
  ///left stiffener
    var leftplate = [
      new THREE.Vector2(-ULR,0),
      new THREE.Vector2(-B/2 -bottomOffset/H * (ULR - B/2),-H + bottomOffset),
      new THREE.Vector2(-B/2 -bottomOffset/H * (ULR - B/2) + cosine*sideHeight,-H + bottomOffset + sine*sideHeight),
      new THREE.Vector2(-ULR + cosine*sideHeight,0),
    ]
   
    var points = [];
    points = points.concat(scallop(leftplate[3],leftplate[0],leftplate[1],35,4));
    points.push(leftplate[1])
    points = points.concat(scallop(leftplate[1],leftplate[2],leftplate[3],sideHeight-20,1));
    points.push(leftplate[3])
  leftsideShape.setFromPoints(points);
  var leftGeometry = new THREE.ExtrudeBufferGeometry(leftsideShape,{depth: sideThickness, steps: 1,bevelEnabled: false});
  //var leftGeometry2 = new THREE.ExtrudeBufferGeometry(leftsideShape,{depth: -sideThickness/2, steps: 1,bevelEnabled: false});
  var leftMesh = new THREE.Mesh(leftGeometry, material);
  leftMesh.translateZ(-sideThickness/2)
  //var leftMesh2 = new THREE.Mesh(leftGeometry2, material);
  
  ///right stiffener
  var rightplate = [
    new THREE.Vector2(ULR,0),
    new THREE.Vector2(B/2 +bottomOffset/H * (ULR - B/2),-H + bottomOffset),
    new THREE.Vector2(B/2 +bottomOffset/H * (ULR - B/2) - cosine*sideHeight,-H + bottomOffset + sine*sideHeight),
    new THREE.Vector2(ULR - cosine*sideHeight,0),
  ]
  var points2 = [];
  points2 = points2.concat(scallop(rightplate[3],rightplate[0],rightplate[1],35,4));
  points2.push(rightplate[1])
  points2 = points2.concat(scallop(rightplate[1],rightplate[2],rightplate[3],sideHeight-20,1));
  points2.push(rightplate[3])
  rightsideShape.setFromPoints(points2);
  var rightGeometry = new THREE.ExtrudeBufferGeometry(rightsideShape,{depth: sideThickness, steps: 1,bevelEnabled: false});
  //var rightGeometry2 = new THREE.ExtrudeBufferGeometry(rightsideShape,{depth: -sideThickness/2, steps: 1,bevelEnabled: false});
  var rightMesh = new THREE.Mesh(rightGeometry, material);
  rightMesh.translateZ(-sideThickness/2)
  //var rightMesh2 = new THREE.Mesh(rightGeometry2, material);
  ////upper bracing
  var dummyline =  new THREE.LineCurve3(new THREE.Vector3(-ULR + upperHeight/H * (ULR - B/2),-upperHeight + sp,sideThickness/2+sp),
                                        new THREE.Vector3(ULR - upperHeight/H * (ULR - B/2),-upperHeight + sp,sideThickness/2+sp));
  var upperframeline = new THREE.LineCurve3(dummyline.getPoint(0.025),dummyline.getPoint(0.975));
 
  //L100x100x10 section point, origin = (0,0)
  var pts = [
    new THREE.Vector2(-100,0),
    new THREE.Vector2(0,0),
    new THREE.Vector2(0,100),
    new THREE.Vector2(-10,100),
    new THREE.Vector2(-10,10),
    new THREE.Vector2(-100,10)
  ];
  var shape = new THREE.Shape( pts );
  var geometry1 = new THREE.ExtrudeBufferGeometry( shape, {steps: 1, bevelEnabled: false, extrudePath: upperframeline} );
  var upperbracingmesh1 = new THREE.Mesh( geometry1, material );
  var group = new THREE.Group();
  group.add(leftMesh);
  //group.add(leftMesh2);
  group.add(rightMesh);
  //group.add(rightMesh2);
  group.add(upperbracingmesh1);
  // group.add(Mesh);
    
  return group
  }
  
  function hstiff(spline, material, sp,B,H,ULR,upperHeight,VsideHeight,sideTopThickness,sideToplength,sideTopwidth){
    var splinelength = spline.getLength()
    // var upperHeight = 220;
    // var VsideHeight = 200;
    // var sideTopThickness = 14;
    // var sideToplength = 700;
    // var sideTopwidth = 300;
    // var B = 2000;
    // var H = 2500;
    // var ULR = 1300;
    var points = [];
    var veclength = ULR -(upperHeight + sideTopThickness)/H * (ULR - B/2)
    var sign = 1;
    var group = new THREE.Group();
    //var material = new THREE.MeshNormalMaterial(); //new THREE.MeshLambertMaterial( { color: 0x0000ff,emissive: 0x000088, wireframe: false } )

    var plate = [];
    plate.push(new THREE.Vector2(-sideToplength/2, sideTopwidth));
    plate.push(new THREE.Vector2(-sideToplength/2, 0));
    plate.push(new THREE.Vector2(- 42, 0));
    var curve = new THREE.ArcCurve(0,VsideHeight,25,Math.PI,0,true);
    plate = plate.concat(curve.getPoints(8));
    plate.push(new THREE.Vector2( 42,0));
    plate.push(new THREE.Vector2(sideToplength/2, 0));
    plate.push(new THREE.Vector2(sideToplength/2, sideTopwidth));
  
    var plateShape = new THREE.Shape(plate);
    var sideTopGeometry = new THREE.ExtrudeBufferGeometry(plateShape, {steps: 10, bevelEnabled: false, depth: sideTopThickness});
    var sideTopMesh = new THREE.Mesh(sideTopGeometry,material);
  
  //L150x150x6.5x9 section point, origin = (0,0)
    var pts = [
      new THREE.Vector2(0,75),
      new THREE.Vector2(6.5,75),
      new THREE.Vector2(6.5,4.5),
      new THREE.Vector2(150,4.5),
      new THREE.Vector2(150,-4.5),
      new THREE.Vector2(6.5,-4.5),
      new THREE.Vector2(6.5,-75),
      new THREE.Vector2(0,-75)
    ];
    var shape = new THREE.Shape( pts );
  
    for (let i = 500; i <= splinelength; i+=2500){
      var tangent = spline.getTangent(i/splinelength)
      var normal = new THREE.Vector3(-tangent.y, tangent.x , 0).setLength(veclength)
      var point0 = new THREE.Vector3(sign*normal.x, sign*normal.y,-upperHeight - sideTopThickness)
      var point = spline.getPoint(i/splinelength)
      var dummyPoint = new THREE.Vector3().addVectors(point0,point)
      points.push(dummyPoint)
      var rad = Math.atan(tangent.y/tangent.x);
      if (sign === -1){
      var newsideTopMesh = sideTopMesh.clone();
      newsideTopMesh.rotateOnWorldAxis(new THREE.Vector3(0,0,1),rad);
      newsideTopMesh.position.set(dummyPoint.x, dummyPoint.y, dummyPoint.z);
      group.add(newsideTopMesh)
      }
      sign *= -1
    }
    //console.log(points)
    for (let i = 0; i< points.length - 1 ;i++){
       var dummyline =  new THREE.LineCurve3(points[i],points[i+1]);
       //console.log(dummyline)
       var upperframeline = new THREE.LineCurve3(dummyline.getPoint(0.05),dummyline.getPoint(0.95));
       
       var geometry1 = new THREE.ExtrudeBufferGeometry( shape, {steps: 1, bevelEnabled: false, extrudePath: upperframeline} );
       var  upperbracingmesh1 = new THREE.Mesh( geometry1, material );
       upperbracingmesh1.translateZ(-sp);
       group.add(upperbracingmesh1)
    }
    return group
  }
  
  
  function scallop(point1,point2,point3,radius,smoothness){
    var points = [];
    var v1 = new THREE.Vector2().subVectors(point1,point2).normalize();
    var v2 = new THREE.Vector2().subVectors(point3,point2).normalize();
    for (let i = 0; i < smoothness+1 ; i++){
      var v3 = new THREE.Vector2().addVectors(v1.clone().multiplyScalar(smoothness - i), v2.clone().multiplyScalar(i)).setLength(radius);
      points.push(new THREE.Vector2().addVectors(point2,v3));
      //console.log(v3)
    }
    return points
  }