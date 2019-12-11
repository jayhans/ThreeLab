import React from "react";
import { Vector2d, Curve } from "./classVariable";
import {GirderLayoutGenerator} from "./uiFuntion";
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
  const spacing = 10;

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

  for (let i = Math.ceil(lineResult.beginStationNumber / spacing) * spacing; i < lineResult.endStationNumber; i += spacing) {
    lineResult.points.push(PointGenerator(i, lineResult));
  }
  return lineResult;
};

export const OffsetLine = (offset, line) => {
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
        stationNumber:line.points[i].stationNumber,
        x: line.points[i].x  + line.points[i].normalCos * offset,
        y: line.points[i].y  + line.points[i].normalSin * offset,
        z: 0,
        normalCos: line.points[i].normalCos,
        normalSin: line.points[i].normalSin,
        masterStationNumber: line.points[i].stationNumber,
        masterOffset: offset,
        virtual: false
        };
    lineResult.points.push(resultPoint)
    //console.log(lineResult.points[i].x, line.points[i].x, line.points[i].normalCos * offset)
  }
//   const pointsT = lineResult.points.map(item => {
//       console.log(item.normalSin)
//       return {x: item.x + item.normalCos*offset, y: item.y + item.normalSin*offset}
//   })
  return lineResult
}

export const LineMatch = (masterPoint, masterLine, slaveLine, skew) => {
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
  let sign = 1;
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
      let coe = splineCoefficient(slaveLine.points[i],slaveLine.points[i+1]);
      let a = alpha * coe.a2 + beta * coe.a1;
      let b = alpha * coe.b2 + beta * coe.b1;
      let c = alpha * coe.c2 + beta * coe.c1 + gamma;
      let t = 0;
      if (a == 0){
          t = -c/b;
      }else{
        t = (-b + Math.sqrt(b**2 - 4*a*c))/(2*a);
        if (t>1 && t<-1){
            t = (-b - Math.sqrt(b**2 - 4*a*c))/(2*a);
        };
      }
      
      let deltaX = 2* coe.a2 * (t) + coe.b2;
      let deltaY = 2* coe.a1 * (t) + coe.b1;
      let len = Math.sqrt(deltaX**2 + deltaY**2);
      resultPoint.normalCos = - deltaY/len;
      resultPoint.normalSin = deltaX/len;
      resultPoint.x = coe.a2 * (t**2) + coe.b2* t + coe.c2;
      resultPoint.y = coe.a1 * (t**2) + coe.b1* t + coe.c1;
    //   let segLen = splineLength(slaveLine.points[i],slaveLine.points[i+1]);
    //   let resultLen = splineLength(slaveLine.points[i],resultPoint);
    //   resultPoint.stationNumber = slaveLine.points[i].stationNumber + (slaveLine.points[i+1].stationNumber - slaveLine.points[i].stationNumber) * resultLen/segLen;
      let MasterPoint = PointLineMatch(resultPoint,masterLine)
      resultPoint.masterStationNumber = MasterPoint.masterStationNumber.toFixed(4)*1
      resultPoint.stationNumber = resultPoint.masterStationNumber
      if (MasterPoint.normalCos * (resultPoint.x - MasterPoint.x) + MasterPoint.normalSin * (resultPoint.y - MasterPoint.y) >= 0) {
        sign = 1
      }
      else {
        sign = -1
      }
      resultPoint.masterOffset = sign * Math.sqrt((resultPoint.x-MasterPoint.x)**2 + (resultPoint.y-MasterPoint.y)**2).toFixed(4)*1;
      break;
    }
  }
  return resultPoint
}


export const PointGenerator = (stationNumber, line) => {
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

export const splineLength =(point1, point2) =>{
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

export const PointLineMatch = (targetPoint, masterLine) =>{
    let resultPoint = {};
    let point1 = {};
    let point2 = {};
    let crossproduct1 = 0;
    let crossproduct2 = 0;
    let innerproduct = 1;
    let station1 = 0;
    let station2 = 0;
    let station3 = 0;
    const err = 0.0001;
    let num_iter = 0;
    let a = true;

    //matser_segment = variables.Segment_station_number(master_line_datalist)

    for (let i = 0; i< masterLine.segments.start.length;i++){
        station1 = masterLine.segments.start[i];
        station2 = masterLine.segments.end[i];
        point1 = PointGenerator(station1, masterLine)
        point2 = PointGenerator(station2, masterLine)
        crossproduct1 = (targetPoint.x - point1.x) * point1.normalSin - (targetPoint.y - point1.y) * point1.normalCos
        crossproduct2 = (targetPoint.x - point2.x) * point2.normalSin - (targetPoint.y - point2.y) * point2.normalCos

        if (crossproduct1 * crossproduct2 < 0){
            a = false;
            break;
        }else if (Math.abs(crossproduct1) < err){
            resultPoint = {...point1};
            break;
        } else if (Math.abs(crossproduct2) < err){
            resultPoint = {...point2};
            break;
        }
    }
    if (a == false){
        while (Math.abs(innerproduct) > err){
            innerproduct = (targetPoint.x - point1.x) * (-point1.normalSin) + (targetPoint.y - point1.y) * (point1.normalCos)
            station3 = station1 + innerproduct
            point1 = PointGenerator(station3, masterLine)
            station1 = point1.stationNumber
            crossproduct1 = (targetPoint.x - point1.x) * point1.normalSin - (targetPoint.y - point1.y) * point1.normalCos
            resultPoint = {...point1}
            num_iter += 1
            if (num_iter == 200){
                break;
            }
        }
    };
    //targetPoint.master_station_number = result.station_number
    return resultPoint
 };

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
        { name: "A1", angle: 90, spanLength: 0.7 },
        { name: "P1", angle: 90, spanLength: 55 },
        { name: "P2", angle: 90, spanLength: 55 },
        { name: "P3", angle: 90, spanLength: 60 },
        { name: "P4", angle: 90, spanLength: 60 },
        { name: "P5", angle: 90, spanLength: 55 },
        { name: "A2", angle: 89.7708167291586, spanLength: 55 },
        { name: "종점", angle: 90, spanLength: 0.8 }
    ],
    SEShape: {
        start: {
            A: 0.150, B: 0.300, C: 0.150, D: 0.50, E: 0.500,
            F: 2.000, G: 1.000, J: 0.470, S: 0.270, Taper: "parallel"
        },
        end: {
            A: 0.250, B: 0.300, C: 0.250, D: 0.50, E: 0.500,
            F: 2.000, G: 1.000, J: 0.470, S: 0.270, Taper: "parallel"
        }
    },
    getGirderList: [ {baseAlign: 'align1', alignOffset: -2.9000, isBeam:true},
        {baseAlign: 'align1', alignOffset: 0.1000, isBeam:false},
        {baseAlign: 'align1', alignOffset: 3.110, isBeam:true}
    ]};

    let line = LineGenerator(input);
    let line2 = OffsetLine(20,line)
    let hline = [];
    hline.push(line);
    let girderLayout = GirderLayoutGenerator(girderLayoutInput,hline)
    console.log(girderLayout)

  let MasterPoint = PointGenerator(1208.15,line);
  let pt = LineMatch(MasterPoint,line, line2, 70)

  return {p:[line.points, line2.points], mp:MasterPoint, sp:pt, girderLayout:{...girderLayout}};
};
// ---------------------- Test ----------------------------------

