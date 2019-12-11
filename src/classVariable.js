import React from "react";
import _ from 'lodash'


export function Vector2d(xydata) {
    let vectorX = xydata[1][0] - xydata[0][0]
    let vectorY = xydata[1][1] - xydata[0][1]
    let vector = [vectorX, vectorY]
    let length = Math.sqrt(Math.pow(vectorX, 2) + Math.pow(vectorY, 2))
    let cos = vectorX / length
    let sin = vectorY / length
    return { vector, length, cos, sin }
}


export function Curve(startPoint, vector1, vector2, radius, a1, a2) {
    if (radius !== 0) {
        // let vector1 = Vector2d(xydata1);
        // let vector2 = Vector2d(xydata2);
        let angle = Math.acos((vector1.vector[0] * vector2.vector[0] + vector1.vector[1] * vector2.vector[1]) / (vector1.length * vector2.length))
        let arcRadius = radius
        let aBegin = a1
        let aEnd = a2

        let sign = 0

        if ((-1 * vector2.cos * vector1.sin + vector2.sin * vector1.cos) > 0) {
            sign = 1    // Counter clockwise
        }
        else {
            sign = -1   // Clockwise
        }

        let beginClothoid = Clothoid(radius, a1)
        let endClothoid = Clothoid(radius, a2)
        let arcAngle = angle - beginClothoid.angle - endClothoid.angle

        let beginOffset = beginClothoid.radiusCenterOffset + radius * Math.tan(angle / 2) +
            endClothoid.offset / Math.sin(angle) - beginClothoid.offset / Math.tan(angle)

        let endOffset = endClothoid.radiusCenterOffset + radius * Math.tan(angle / 2) +
            beginClothoid.offset / Math.sin(angle) - endClothoid.offset / Math.tan(angle)

        let beginClothoidCoord = [startPoint[0] + (vector1.length - beginOffset) * vector1.cos,
        startPoint[1] + (vector1.length - beginOffset) * vector1.sin]

        let beginArcCoord = [beginClothoidCoord[0] + beginClothoid.totalX * vector1.cos - sign * beginClothoid.totalY * vector1.sin,
        beginClothoidCoord[1] + beginClothoid.totalX * vector1.sin + sign * beginClothoid.totalY * vector1.cos]

        let arcCenter = [beginClothoidCoord[0] + beginClothoid.radiusCenterOffset * vector1.cos - sign * (radius + beginClothoid.offset) * vector1.sin,
        beginClothoidCoord[1] + beginClothoid.radiusCenterOffset * vector1.sin + sign * (radius + beginClothoid.offset) * vector1.cos]

        let endArcCoord = [arcCenter[0] + (beginArcCoord[0] - arcCenter[0]) * Math.cos(arcAngle) - sign * (beginArcCoord[1] - arcCenter[1]) * Math.sin(arcAngle),
        arcCenter[1] + (beginArcCoord[1] - arcCenter[1]) * Math.cos(arcAngle) + sign * (beginArcCoord[0] - arcCenter[0]) * Math.sin(arcAngle)]

        let endClothoidCoord = [endArcCoord[0] + endClothoid.totalX * vector2.cos + sign * endClothoid.totalY * vector2.sin,
        endArcCoord[1] + endClothoid.totalX * vector2.sin - sign * endClothoid.totalY * vector2.cos]

        function beginClothoidStation(l) {
            let clothoidX = l * (1 - l ** 4 / 40 / aBegin ** 4 + l ** 8 / 3456 / aBegin ** 8)
            let clothoidY = l ** 3 / 6 / aBegin ** 2 * (1 - l ** 4 / 56 / aBegin ** 4 + l ** 8 / 7040 / aBegin ** 8)
            let resultX = beginClothoidCoord[0] + vector1.cos * clothoidX - sign * vector1.sin * clothoidY
            let resultY = beginClothoidCoord[1] + vector1.sin * clothoidX + sign * vector1.cos * clothoidY
            let slopeDeltaX = (1 - l ** 4 * 5 / 40 / aBegin ** 4 + l ** 8 * 9 / 3456 / aBegin ** 8)
            let slopeDeltaY = l ** 2 / 6 / aBegin ** 2 * (3 - l ** 4 * 7 / 56 / aBegin ** 4 + l ** 8 * 11 / 7040 / aBegin ** 8)
            let slopeLength = Math.sqrt(slopeDeltaX ** 2 + slopeDeltaY ** 2)
            let normalCos = sign * slopeDeltaY / slopeLength
            let normalSin = -1 * slopeDeltaX / slopeLength
            let globalNormalCos = vector1.cos * normalCos - vector1.sin * normalSin
            let globalNormalSin = vector1.sin * normalCos + vector1.cos * normalSin
            return [resultX, resultY, globalNormalCos, globalNormalSin]
        }

        function endClothoidStation(l) {
            l = endClothoid.length - l
            let clothoidX = endClothoid.totalX - (l * (1 - l ** 4 / 40 / aEnd ** 4 + l ** 8 / 3456 / aEnd ** 8))
            let clothoidY = -1 * endClothoid.totalY + (l ** 3 / 6 / aEnd ** 2 * (1 - l ** 4 / 56 / aEnd ** 4 + l ** 8 / 7040 / aEnd ** 8))
            let resultX = endArcCoord[0] + vector2.cos * clothoidX - sign * vector2.sin * clothoidY
            let resultY = endArcCoord[1] + vector2.sin * clothoidX + sign * vector2.cos * clothoidY
            let slopeDeltaX = -1 * (1 - l ** 4 * 5 / 40 / aEnd ** 4 + l ** 8 * 9 / 3456 / aEnd ** 8)
            let slopeDeltaY = l ** 2 / 6 / aEnd ** 2 * (3 - l ** 4 * 7 / 56 / aEnd ** 4 + l ** 8 * 11 / 7040 / aEnd ** 8)
            let slopeLength = Math.sqrt(slopeDeltaX ** 2 + slopeDeltaY ** 2)
            let normalCos = -sign * slopeDeltaY / slopeLength
            let normalSin = slopeDeltaX / slopeLength
            let globalNormalCos = vector2.cos * normalCos - vector2.sin * normalSin
            let globalNormalSin = vector2.sin * normalCos + vector2.cos * normalSin
            return [resultX, resultY, globalNormalCos, globalNormalSin]
        }

        function arcStation(l) {
            let resultX = arcCenter[0] + (beginArcCoord[0] - arcCenter[0]) * Math.cos(l / arcRadius) - sign * (beginArcCoord[1] - arcCenter[1]) * Math.sin(l / arcRadius)
            let resultY = arcCenter[1] + (beginArcCoord[1] - arcCenter[1]) * Math.cos(l / arcRadius) + sign * (beginArcCoord[0] - arcCenter[0]) * Math.sin(l / arcRadius)
            let globalNormalCos = sign * (resultX - arcCenter[0]) / arcRadius
            let globalNormalSin = sign * (resultY - arcCenter[1]) / arcRadius
            return [resultX, resultY, globalNormalCos, globalNormalSin]
        }

        let result = {
            angle, arcRadius, a1, a2, beginClothoid, endClothoid, arcAngle, beginOffset, endOffset, beginClothoidCoord, beginArcCoord,
            arcCenter, endArcCoord, endClothoidCoord, beginClothoidStation, endClothoidStation, arcStation, sign
        }
        return result
    }
    else {
        let angle = 0
        let beginClothoid = Clothoid(radius, a1)
        let endClothoid = Clothoid(radius, a2)
        let arcRadius = 0
        let arcAngle = 0
        let beginOffset = 0
        let endOffset = 0
        let beginClothoidCoord = 0
        let beginArcCoord = 0
        let arcCenter = 0
        let endArcCoord = 0
        let endClothoidCoord = 0

        let result = {
            angle, arcRadius, a1, a2, beginClothoid, endClothoid, arcAngle, beginOffset, endOffset, beginClothoidCoord, beginArcCoord,
            arcCenter, endArcCoord, endClothoidCoord
        }
        return result
    }

}


function Clothoid(radius, a) {
    if (radius !== 0) {
        let length = Math.pow(a, 2) / radius
        let angle = Math.pow(a, 2) / Math.pow(radius, 2) / 2
        let totalX = length * (1 - Math.pow(length, 2) / 40 / Math.pow(radius, 2) + Math.pow(length, 4) / 3456 / Math.pow(radius, 4))
        let totalY = Math.pow(length, 2) / 6 / radius * (1 - Math.pow(length, 2) / 56 / Math.pow(radius, 2) + Math.pow(length, 4) / 7040 / Math.pow(radius, 4))
        let offset = totalY - radius * (1 - Math.cos(angle))
        let radiusCenterOffset = totalX - radius * Math.sin(angle)

        let result = { length, angle, totalX, totalY, offset, radiusCenterOffset }
        return result
    }
    else {
        let length = 0
        let angle = 0
        let totalX = 0
        let totalY = 0
        let offset = 0
        let radiusCenterOffset = 0
        let result = { length, angle, totalX, totalY, offset, radiusCenterOffset }
        return result
    }
}

// const startPoint = [0,0]
// const xy
// 1 = [[5, 5], [10, 15]]
// const xydata2 = [[10, 15], [30, 35]]
// const radius = 100
// const a1 = 10
// const a2 = 10
// const test = Curve(startPoint, xydata1, xydata2, radius, a1, a2)



