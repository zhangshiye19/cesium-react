import * as Cesium from "cesium";


export interface DrawOptions {
    viewer: Cesium.Viewer
}

interface EventDraw {
    leftClick?: Cesium.Event,
    leftDoubleClick?: Cesium.Event,
    mouseMove?: Cesium.Event,
    finished?: Cesium.Event,
    start?: Cesium.Event,
    interrupt?: Cesium.Event
}

export interface Draw {
    start(): void,
    finish(): void,
    draw(): void,
    interrupt(): void,
    event: EventDraw,
    countClick: number    // 点击计数包括单机双击
}