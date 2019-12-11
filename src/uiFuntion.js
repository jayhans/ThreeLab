import React from "react";
import { Vector2d, Curve } from "./classVariable";
import { PointGenerator, LineMatch, PointLineMatch, splineLength, OffsetLine } from "./nodeGenerator";
import _ from "lodash";
import { strict } from "assert";

export function GirderLayoutGenerator(girderLayoutInput, hLine) {
    let result = {
        masterLine: { },
        centralSupportPoint:[],
        girderSupportPoint :[],
        girderInfoList :[],
        girderLengthList :[],
        girderSpanPoint:[]
    }
    let girderInfoObj = {
        number: 0,
        baseLine: { },
        alignOffset: 0,
        girderLine: { },
        outerBeam: false
    }
    let GirderLengthObj = {
        crTotalLength: 0,
        girderTotalLength: 0,
        crSpanLength: [],
        griderSpanLength: []
    }
    let supportDataList = girderLayoutInput.supportData
    // let beginShapeDataList = girderLayoutInput.SEShape.start   // 시점부
    // let endShapeDataList = girderLayoutInput.SEShape.end       // 종점부
    let girderDataList = girderLayoutInput.getGirderList
    let supportStation = girderLayoutInput.baseValue.bridgeBeginStation;
    for (let i = 0; i < hLine.length; i++) {
        if (hLine[i].slaveOrMaster == true) {
            result.masterLine = {...hLine[i]}
        }
    }
    let i = 0
    let girderInfoList = []
    for (let j = 0; j < girderDataList.length;j++) {
        let girderInfo = { ...girderInfoObj }
        girderInfo.number = i
        for (let k = 0; k < hLine.length; k++) {
            if ('align' + String(k + 1) == girderDataList[j].baseAlign) {
                girderInfoObj.baseLine = hLine[k]
            }
        }
        girderInfo.girderLine = OffsetLine(girderDataList[j].alignOffset,girderInfoObj.baseLine)
        girderInfo.alignOffset = girderDataList[j].alignOffset
        girderInfo.outerBeam = girderDataList[j].isBeam? true : false
        girderInfoList.push(girderInfo)
        i += 1
    }
    //console.log(supportDataList)
    result.centralSupportPoint.push(PointGenerator(supportStation, result.masterLine))
    for (i = 1; i < supportDataList.length; i++) {
            supportStation = supportStation + supportDataList[i].spanLength
            result.centralSupportPoint.push(PointGenerator(supportStation, result.masterLine))
    }
    for (let i = 0; i< girderInfoList.length;i++) {
        result.girderSupportPoint.push(SupportSkewPointGenerator(result.centralSupportPoint, result.masterLine, girderInfoList[i].girderLine, supportDataList))
    }
    for (let i = 0; i < result.girderSupportPoint.length;i++){ // i:girderIndex
        let PointsList = [];
        for (let j = 1; j < result.girderSupportPoint[i].length -2 ;j++){ // j:supportIndex
            let Points = [];
            for (let k = 0; k < girderInfoList[i].girderLine.points.length;k++){
                if (girderInfoList[i].girderLine.points[k].masterStationNumber>result.girderSupportPoint[i][j].masterStationNumber 
                    && girderInfoList[i].girderLine.points[k].masterStationNumber < result.girderSupportPoint[i][j+1].masterStationNumber){
                Points.push(girderInfoList[i].girderLine.points[k]);
                }
            }
            PointsList.push(Points)
        }
        result.girderSpanPoint.push(PointsList);
    }
    // result.girderInfoList = girderInfoList

    // for (i = 0; i < girderInfo.length; i++) {
    //     girderLength = { ...GirderLengthObj }
    //     girderLength.crTotalLength = result.girderSupportPoint[i][supportDataList.length - 2].masterStationNumber - result.girderSupportPoint[i][1].masterStationNumber
    //     girderLength.girderTotalLength = result.girderSupportPoint[i][supportDataList.length - 2].stationNumber - result.girderSupportPoint[i][1].stationNumber

    //     result.girderLengthList.push(girderLength)

    //     for (j = 1; j < supportDataList.length - 2; j++) {
    //         result.girderLengthList[result.girderLengthList.length - 1].crSpanLength.push(
    //             result.girderSupportPoint[i][j + 1].masterStationNumber - result.girderSupportPoint[i][j].masterStationNumber
    //         )
    //         result.girderLengthList[result.girderLengthList.length - 1].girderSpanLength.push(
    //             result.girderSupportPoint[i][j + 1].stationNumber - result.girderSupportPoint[i][j].stationNumber
    //         )
    //     }
    // }
    //console.log(result)
    return result
}

function SupportSkewPointGenerator(centralSupportPoint, masterLine, girderLine, supportDatalist) {
  let resultPoint = []
  for (let i = 0; i < centralSupportPoint.length; i++) {
    let skew = supportDatalist[i].angle
    if (skew !== 0) {
        let dummyPoint = LineMatch(centralSupportPoint[i], masterLine, girderLine, skew)
        resultPoint.push(dummyPoint)
    } else {
      console.log('Skew value is not available');
      resultPoint = null;
    }
}   
  return resultPoint
}

