import * as Cesium from 'cesium'


export default interface ViewAreaAnalysis {
    viewer: Cesium.Viewer,
    positionS: Cesium.Cartesian3,
    positionE: Cesium.Cartesian3,

    drawViewArea(): void,

    analysis(pointS: Cesium.Cartesian3, pointE: Cesium.Cartesian3, angle?: Number): void

    // new(option:{viewer:Cesium.Viewer}): ViewAreaAnalysis
}
