import React from "react";
import { Vector2d, Curve } from "./classVariable";
// import {Vector2d, Curve, LineSegment} from "./Class_variable";
import _ from "lodash";
import { stringLiteral } from "@babel/types";
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from "constants";

const LineGenerator = inputs => {
  // console.time("for loop");
  let lineResult = {
    vectors: [],
    curves: [],
    segments: { start: [], end: [] },
    beginStationNumber: 0,
    endStationNumber: 0,
    startPoint: [],
    slaveOrMaster: true,
    input: { ...inputs },
    points : []
  };

  for (let i = 0; i < lineResult.input.horizonDataList.length - 1; i++) {
    lineResult.startPoint.push(_.take(lineResult.input.horizonDataList[i], 2));
    lineResult.vectors.push(
      Vector2d([
        _.take(lineResult.input.horizonDataList[i], 2),
        _.take(lineResult.input.horizonDataList[i + 1], 2)
      ])
    );
  }

  for (let i = 0; i < lineResult.input.horizonDataList.length - 2; i++) {
    lineResult.curves.push(
      Curve(
        _.take(lineResult.input.horizonDataList[i], 2),
        lineResult.vectors[i],
        lineResult.vectors[i+1],
        lineResult.input.horizonDataList[i + 1][2],
        lineResult.input.horizonDataList[i + 1][3],
        lineResult.input.horizonDataList[i + 1][4],
      )
    );
  }
  const dataList = lineResult.input.horizonDataList;
  let segmentsStation = lineResult.input.beginStation
  lineResult.segments.start.push(segmentsStation);
  for (let j = 0; j < (dataList.length - 2); j++) {
    if (j === 0){
      segmentsStation += lineResult.vectors[j].length - lineResult.curves[j].beginOffset; //초기값은 항상 직선으로 시작
      lineResult.segments.start.push(segmentsStation);
    } else {
      segmentsStation += lineResult.vectors[j].length - lineResult.curves[j].beginOffset - lineResult.curves[j-1].endOffset
      lineResult.segments.start.push(segmentsStation);
    }
    segmentsStation += lineResult.curves[j].beginClothoid.length
    lineResult.segments.start.push(segmentsStation);
    segmentsStation +=  lineResult.curves[j].arcAngle * lineResult.curves[j].arcRadius
    lineResult.segments.start.push(segmentsStation);
    segmentsStation +=  lineResult.curves[j].endClothoid.length
    lineResult.segments.start.push(segmentsStation);
  }
  lineResult.segments.end.push(..._.drop(lineResult.segments.start));
  if (lineResult.curves.length === 0){
    segmentsStation += lineResult.vectors[lineResult.vectors.length-1].length
  }else {
    segmentsStation += lineResult.vectors[lineResult.vectors.length-1].length - lineResult.curves[lineResult.curves.length -1].endOffset
  }
  lineResult.segments.end.push(segmentsStation);
  lineResult.beginStationNumber = lineResult.segments.start[0];
  lineResult.endStationNumber = lineResult.segments.end[lineResult.segments.end.length - 1];

  for (let i = Math.ceil(lineResult.beginStationNumber / 10) * 10; i < lineResult.endStationNumber; i += 10) {
    lineResult.points.push(PointGenerator(i, lineResult));
  }
  return lineResult;
};

const OffsetLine = (offset, line) => {
let lineResult = {
    vectors: line.vectors,
    curves: line.curves,
    segments: line.segments,
    beginStationNumber: line.beginStationNumber,
    endStationNumber: line.endStationNumber,
    startPoint: [],
    slaveOrMaster: false,
    input: line.inputs,
    points : []
    };

  //let lineResult = {...line}
//   let points = [];
  for (let i = 0; i<line.points.length;i++){
    let resultPoint = {
        stationNumber:0,
        x: 0,
        y: 0,
        z: 0,
        normalCos: 0,
        normalSin: 0,
        masterStationNumber: 0,
        masterOffset: 0,
        virtual: false
        };
    resultPoint.x = line.points[i].x  + line.points[i].normalCos * offset
    resultPoint.y = line.points[i].y  + line.points[i].normalSin * offset
    lineResult.points.push(resultPoint)
    //console.log(lineResult.points[i].x, line.points[i].x, line.points[i].normalCos * offset)
  }
//   const pointsT = lineResult.points.map(item => {
//       console.log(item.normalSin)
//       return {x: item.x + item.normalCos*offset, y: item.y + item.normalSin*offset}
//   })
  return lineResult
}

const LineMatch = (masterPoint, slaveLine, skew) => {
  let resultPoint = {
    stationNumber : 0,
    x: 0,
    y: 0,
    z: 0,
    normalCos: 0,
    normalSin: 0,
    masterStationNumber: 0,
    masterOffset: 0,
    virtual: false
  };
  const unitVx = -1 * masterPoint.normalSin;
  const unitVy = masterPoint.normalCos;
  const skewRadian = skew * Math.PI / 180;
  let dX = unitVx * Math.cos(skewRadian) - unitVy * Math.sin(skewRadian);
  let dY = unitVx * Math.sin(skewRadian) + unitVy * Math.cos(skewRadian);
  let alpha = dY;
  let beta = -1 * dX;
  let gamma = - alpha * masterPoint.x - beta * masterPoint.y;
  // console.log(alpha);
  // console.log(beta);
  // console.log(gamma);
  let dummy1 = 0;
  let dummy2 = 0;
  for (let i = 0; i<slaveLine.points.length -1;i++){
    dummy1 = alpha * slaveLine.points[i].x + beta * slaveLine.points[i].y + gamma;
    dummy2 = alpha * slaveLine.points[i+1].x + beta * slaveLine.points[i+1].y + gamma;
    //console.log(dummy2*dummy1)
    if (dummy1 ===0){
      resultPoint = slaveLine.points[i]    
      break;
    }
    else if (dummy2 ===0) {
      resultPoint = slaveLine.points[i+1]    
      break;
    }
    else if (dummy1*dummy2 < 0){
      resultPoint.x = (slaveLine.points[i].x + slaveLine.points[i+1].x)/2
      resultPoint.y = (slaveLine.points[i].y + slaveLine.points[i+1].y)/2
      break;
    }
  }
  return resultPoint
}


const PointGenerator = (stationNumber, line) => {
  let resultPoint = {
    stationNumber,
    x: 0,
    y: 0,
    z: 0,
    normalCos: 0,
    normalSin: 0,
    masterStationNumber: stationNumber,
    masterOffset: 0,
    virtual: false
  };
  const dataList = line.input.horizonDataList;
  const startStationNumList = line.segments.start;
  const endStationNumList = line.segments.end;

  let l = 0;
  let lineNum = 0;
  let varCase = 0;
  const startPoint = line.startPoint;
  let tempRes = [0,0,0,0
  
  ];
  
  for (let i = 0; i <= 4 * (dataList.length-2); i++) {
    l = stationNumber - startStationNumList[i];

    lineNum = Math.floor(i / 4);
    varCase = i % 4;
    if (
      stationNumber >= startStationNumList[i] &&
      stationNumber <= endStationNumList[i]
    ) {
      switch (varCase) {
        case 0:
          if (i === 0 || (dataList[lineNum][2] === 0 && dataList[lineNum - 1][2] === 0 && dataList[lineNum + 1][2] === 0 )) {
            tempRes[0] = startPoint[lineNum][0] + l * line.vectors[lineNum].cos;
            tempRes[1] = startPoint[lineNum][1] + l * line.vectors[lineNum].sin;
          } else {
            tempRes[0] = line.curves[lineNum - 1].endClothoidCoord[0] + l * line.vectors[lineNum].cos;
            tempRes[1] = line.curves[lineNum - 1].endClothoidCoord[1] + l * line.vectors[lineNum].sin;
          }
          tempRes[2] = line.vectors[lineNum].sin;
          tempRes[3] = -1 * line.vectors[lineNum].cos;
          break;
        case 1:
          tempRes = line.curves[lineNum].beginClothoidStation(l);
          break;
        case 2:
          tempRes = line.curves[lineNum].arcStation(l);
          break;
        case 3:
          tempRes = line.curves[lineNum].endClothoidStation(l);
          break;
        default:
          break;
      }
      resultPoint.x = tempRes[0];
      resultPoint.y = tempRes[1];
      resultPoint.normalCos = tempRes[2];
      resultPoint.normalSin = tempRes[3];
      break;
    }
  }
  return resultPoint;
};

const splineCoefficient = (point1, point2) =>{
    const x1 = point1.x;
    const y1 = point1.y;
    const x2 = point2.x;
    const y2 = point2.y;

    let b1 = (y2 - y1) / 2;
    let b2 = (x2 - x1) / 2;
    let a1 = 0.0;
    let a2 = 0.0;
    let df1 = 0.0;
    let df2 = 0.0;
    if (point1.normalSin === 0){
        if (point2.normalSin === 0){
            return Math.abs(y2 - y1)
        }
        else{
            df2 = -point2.normalCos / point2.normalSin
            a2 = b2 / 2
            a1 = (-b1 + df2 * (2 * a2 + b2)) / 2
        } 
    } else if (point2.normalSin === 0){
        if (point2.normalSin === 0){
            return Math.abs(y2 - y1)
        }else{
            df1 = -point1.normalCos / point1.normalSin
            a2 = b2 / -2
            a1 = (-b1 + df1 * (-2 * a2 + b2)) / -2
        }
    }else{
        df1 = -point1.normalCos / point1.normalSin
        df2 = -point2.normalCos / point2.normalSin

        if (df1 === df2){
            a1 = 0
            a2 = 0
        }else{
            a2 = (2*b1-(df1+df2)*b2)/(2*(df2-df1))
            a1 = (-b1 + df1 * (-2 * a2 + b2)) / -2
            //console.log('check')
            //console.log(a1,a2,b1,b2, df1,df2)
            // console.log((2 * b1))
            // console.log((2*b1-(df1+df2)*b2))
            // console.log(((df1+df2)*b2))
        }
    }
    const c1 = y2 - a1 - b1;
    const c2 = x2 - a2 - b2;
 return {a1:a1,b1:b1,c1:c1,a2:a2,b2:b2,c2:c2}
}

const splineLength =(point1, point2) =>{
    const coe = splineCoefficient(point1,point2)
    const w1 = 5/9
    const w2 = 8/9
    const w3 = w1
    const t1 = -0.77459666924
    const t2 = 0
    const t3 = 0.77459666924

    let length = Math.sqrt(Math.pow((2 * coe.a1 * t1 + coe.b1), 2) + Math.pow((2 * coe.a2 * t1 + coe.b2),2)) * w1 
            + Math.sqrt(Math.pow((2 * coe.a1 * t2 + coe.b1), 2) + Math.pow((2 * coe.a2 * t2 + coe.b2),2)) * w2
            + Math.sqrt(Math.pow((2 * coe.a1 * t3 + coe.b1), 2) + Math.pow((2 * coe.a2 * t3 + coe.b2),2)) * w3
    return length.toFixed(4)*1
}

// function SupportSkewPointGenerator(supportPoint, masterLine, girder, supportDatalist) {

//   let resultPoint = []
//   for (let i = 0; i < supportPoint.length; i++) {
//     let point = {
//       x: 0,
//       y: 0,
//       z: 0,
//       normalCos: 0,
//       normalSin: 0,
//       stationNumber: 0,
//       masterStationNumber: 0,
//       masterOffset: 0,
//       virtual: 0,
//       curvature: 0,
//       slope: 0
//     }

//     let originPoint = { ...point }
//     let dummyPoint = { ...point }
//     let dummyMaster = { ...point }
//     let girderDistance = 0
//     let sign = 1

//     let skew = supportDatalist[i].angle
//     if (skew !== 0) {
//       originPoint = supportPoint[i]
//       girderDistance = girder.alignOffset  // 단위확인, 현재: mm
//       if (
//         girder.baseLine.slaveOrMaster == true &&
//         girderDistance == 0
//       ) {
//         dummyPoint = originPoint
//       }
//       else {
//         dummyPoint = lineMatch(originPoint, girder.baseLine, skew, girderDistance)
//       }

//       if (
//         girder.baseLine.slaveOrMaster == true &&
//         girderDistance == 0
//       ) {
//         dummyPoint.masterStationNumber = originPoint.stationNumber
//         dummyPoint.masterOffset = girderDistance
//       }
//       else {
//         dummyMaster = pointLineMatch(dummyPoint, masterLine)
//         dummyPoint.masterStationNumber = dummyMaster.stationNumber

//         if (dummyMaster.normalCos * (dummyPoint.x - dummyMaster.x) + dummyMaster.normalSin * (dummyPoint.y - dummyMaster.y) >= 0) {
//           sign = 1
//         }
//         else {
//           sign = -1
//         }

//         dummyPoint.masterOffset = sign * Math.sqrt((dummyPoint.x - dummyMaster.x)**2 + (dummyPoint.y - dummyMaster.y)**2)
//       }

//       dummyPoint.masterStationNumber = dummyPoint.masterStationNumber
//       resultPoint.push(dummyPoint)
//     }

//     else {
//       console.log('Skew value is not available')
//       resultPoint = null
//       break
//     }
//   }

//   return resultPoint
// }


// ---------------------- Test ----------------------------------
export function Main() {
  const horizonDataList = [
    [178551.19287, 552443.31955, 0, 0, 0],
    [178321.1309, 552413.5884, 200, 100, 100],
    [178264.9318, 551804.2057, 200, 100, 90],
    [178142.69905, 551723.23752, 0, 0, 0]
  ];
  const beginStation = 769.45242;
  const slaveOrMaster = true
  const input = { beginStation, horizonDataList, slaveOrMaster };
  const girderLayoutInput = {
    baseValue: {
        bridgeBeginStation: 1208.15
    },
    supportData: [
        { name: "시점", angle: 90, spanlength: 0 },
        { name: "A1", angle: 90, spanLength: 0 },
        { name: "P1", angle: 90, spanLength: 55.15 },
        { name: "P2", angle: 90, spanLength: 55 },
        { name: "P3", angle: 90, spanLength: 60 },
        { name: "P4", angle: 90, spanLength: 60 },
        { name: "P5", angle: 90, spanLength: 55 },
        { name: "A2", angle: 89.7708167291586, spanLength: 55.25 },
        { name: "종점", angle: 90, spanLength: 0 }
    ],
    SEShape: {
        start: {
            A: 150, B: 300, C: 150, D: 50, E: 500,
            F: 2000, G: 1000, J: 470, S: 270, Taper: "parallel"
        },
        end: {
            A: 250, B: 300, C: 250, D: 50, E: 500,
            F: 2000, G: 1000, J: 470, S: 270, Taper: "parallel"
        }
    },
    getGirderList: {
        leftBeam: {
            alignment: {baseAlign: 'align1', alignOffset: -2900}
        },
        girder1: {
            alignment: {baseAlign: 'align1', alignOffset: 100}
        },
        rightBeam: {
            alignment: {baseAlign: 'align1', alignOffset: 3110}
        }
    }
}




  let line = LineGenerator(input);
  let line2 = OffsetLine(20,line)

  let MasterPoint = PointGenerator(1208.15,line);
  let pt = LineMatch(MasterPoint, line2, 70)
  //console.log(line.points)
  //console.log(line2.points)
  //console.log(pt)
    for (let i = 0;i<line.points.length -1;i++){
        console.log(splineLength(line.points[i],line.points[i+1]));
    //    let coe = splineCoefficient(line.points[32],line.points[33]);
    //    console.log(coe)
    }

    // for (let i = 0;i<line.points.length;i++){
    //     console.log(line.points[i].x,line.points[i].y, line.points[i].normalCos,line.points[i].normalSin);
    // }


  return [line.points, line2.points];
};
// ---------------------- Test ----------------------------------
export default Main;
