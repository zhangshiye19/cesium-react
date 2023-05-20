import {Draw, DrawOptions, EventDraw} from "@/cmap/draw/Draw";
import * as Cesium from "cesium";
import {CustomPolyline} from "@/cmap/entity/custom/CustomPolyline";

interface DrawPolylineOptions extends DrawOptions{

}

export default class DrawPolyline implements Draw{

    private viewer: Cesium.Viewer;
    countClick: number;
    event: EventDraw;
    entity: CustomPolyline | undefined;

    constructor(options: DrawPolylineOptions) {
        this.viewer = options.viewer;
        this.countClick = 0;
        this.event = {
            leftClick: new Cesium.Event()
        }
    }

    draw(): void {
    }

    finish(): void {
    }

    interrupt(): void {
    }

    start(): void {
    }
}