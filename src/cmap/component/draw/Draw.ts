import * as Cesium from "cesium";

export interface DrawOptions {
    viewer: Cesium.Viewer
}

export default interface Draw {
    start(): void,

    finish(): void,

    get position(): Cesium.Cartesian3[],

}