import {Draw, DrawOptions, EventDraw} from "@/cmap/draw/Draw";
import * as Cesium from "cesium";

interface DrawPolylineOptions extends DrawOptions{

}

export default class DrawPolyline implements Draw{
    private _viewer: Cesium.Viewer;

    constructor(options: DrawPolylineOptions) {
        this._viewer = options.viewer;
        this.countClick = 0;
        this.event = {
            leftClick: new Cesium.Event()
        }
    }

    get viewer() {
        return this._viewer;
    }

    set viewer(viewer: Cesium.Viewer) {
        this._viewer = viewer;
    }

    countClick: number;
    event: EventDraw;

    draw(): void {
    }

    finish(): void {
    }

    interrupt(): void {
    }

    start(): void {
    }
}