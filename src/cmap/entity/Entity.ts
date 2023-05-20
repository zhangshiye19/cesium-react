import * as Cesium from "cesium";

export type PointOptions = {
    point: Cesium.PointGraphics.ConstructorOptions
}

export type PolylineOptions = {
    polyline: Cesium.PolylineGraphics.ConstructorOptions
}

export class Entity extends Cesium.Entity {
    constructor(options: Cesium.Entity.ConstructorOptions) {
        super(options);
    }
}

export class Point extends Entity {

    constructor(options: Cesium.Entity.ConstructorOptions & PointOptions) {
        super(options);
    }

    get instance() {
        return this.point as Cesium.PointGraphics;
    }
}

export class Polyline extends Entity {

    constructor(options: Cesium.Entity.ConstructorOptions & PolylineOptions) {
        super(options);
    }

    get instance() {
        return this.polyline as Cesium.PolylineGraphics;
    }

    set instance(polyline: Cesium.PolylineGraphics) {
        this.polyline = polyline
    }
}
