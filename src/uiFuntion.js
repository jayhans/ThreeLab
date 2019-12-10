import React from "react";
import { Vector2d, Curve } from "./classVariable";
import { PointGenerator, SupportSkewPointGenerator } from "./nodeGenerator";
import _ from "lodash";
import { strict } from "assert";

function GirderLayoutGenerator(girderLayoutInput, hLine) {
    let line = {
        input: { slaveOrMaster, beginStation, horizonDataList },
        vectors: [],
        curves: [],
        segments: {},
        beginStationNumber: 0,
        startPoint: [],
        slaveOrMaster = true
    }

    let result = {
        masterLine: { ...line },
        centralSupportPoint =[],
        girderSupportPoint =[],
        girderInfoList =[],
        girderLengthList =[]
    }

    let girderInfoObj = {
        number: 0,
        baseLine: { ...line },
        alignOffset: 0,
        girderLine: { ...line },
        outerBeam: false
    }

    let GirderLengthObj = {
        crTotalLength: 0,
        girderTotalLength: 0,
        crSpanLength: [],
        griderSpanLength: []
    }

    let bridgeBeginStation = girderLayoutInput.baseValue.bridgeBeginStation
    let supportDataList = girderLayoutInput.supportData
    let beginShapeDataList = girderLayoutInput.SEShape.start   // 시점부
    let endShapeDataList = girderLayoutInput.SEShape.end       // 종점부
    let girderDataList = girderLayoutInput.getGirderList

    for (let i = 0; i < hLine.length; i++) {
        if (hLine[i].slaveOrMaster == true) {
            result.masterLine = hLine[i]
        }
    }

    i = 0
    girderInfoList = []
    for (const girderKey in girderDataList) {
        girderInfo = { ...girderInfoObj }
        girderInfo.number = i
        for (let k = 0; k < hLine.length; k++) {
            if ('align' + String(k + 1) == girderData.alignment.baseAlign) {
                girderInfoObj.baseLine = hLine[k]
            }
        }
        girderInfo.alignOffset = girderData.alignment.alignOffset
        girderInfo.outerBeam = (girderKey.indexOf('Beam') !== -1) ? true : false

        girderInfoList.push(girderInfo)
        i += 1
    }

    for (i = 0; i < supportDataList.length; i++) {
        if (i == 0) {
            result.centralSupportPoint.push(PointGenerator(supportStation, result.masterLine))
        }
        else if (i == 1) {
            result.centralSupportPoint.push(PointGenerator(bridgeBeginStation + (beginShapeDataList.A + beginShapeDataList.D + beginShapeDataList.E), result.masterLine))
        }   // A, D, E 단위확인
        else if (i >= 2 && i < supportDataList.length - 2) {
            supportStation = supportStation + supportData[i].spanLength
            result.centralSupportPoint.push(PointGenerator(supportStation, result.masterLine))
        }
        else if (i == supportData.length - 2) {
            supportStation = supportStation + supportDataList[i].spanLength
            result.centralSupportPoint.push(PointGenerator(supportStation - (endShapeDataList.A + endShapeDataList.D + endShapeDataList.E), result.masterLine))
        }   // A, D, E 단위확인
        else {
            result.centralSupportPoint.push(PointGenerator(supportStation, result.masterLine))
        }
    }

    for (let girder of girderInfoList) {
        result.girderSupportPoint.push(SupportSkewPointGenerator(result.centralSupportPoint, result.masterLine, girder, supportData))
    }
    result.girderInfoList = girderInfoList

    for (i = 0; i < girderInfo.length; i++) {
        girderLength = { ...GirderLengthObj }
        girderLength.crTotalLength = result.girderSupportPoint[i][supportDataList.length - 2].masterStationNumber - result.girderSupportPoint[i][1].masterStationNumber
        girderLength.girderTotalLength = result.girderSupportPoint[i][supportDataList.length - 2].stationNumber - result.girderSupportPoint[i][1].stationNumber

        result.girderLengthList.push(girderLength)

        for (j = 1; j < supportDataList.length - 2; j++) {
            result.girderLengthList[result.girderLengthList.length - 1].crSpanLength.push(
                result.girderSupportPoint[i][j + 1].masterStationNumber - result.girderSupportPoint[i][j].masterStationNumber
            )
            result.girderLengthList[result.girderLengthList.length - 1].girderSpanLength.push(
                result.girderSupportPoint[i][j + 1].stationNumber - result.girderSupportPoint[i][j].stationNumber
            )
        }
    }
    return result
}

// -------------------------------------- Test ---------------------------------------------
let girderLayoutInput = {
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