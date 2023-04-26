import Draw, {DrawOptions} from "@/cmap/component/draw/Draw";
import * as Cesium from "cesium";


interface DrawPolylineOption extends DrawOptions {
    width?: number
}

export default class DrawPolyline implements Draw {
    private _position: Cesium.Cartesian3[];
    private width: number;
    private readonly viewer: Cesium.Viewer;

    constructor(options: DrawOptions) {
        this.viewer = options.viewer
        this._position = [];
        this.width = 3; // 默认为3
    }

    start(): void {
    }

    finish(): void {
    }

    get position(): Cesium.Cartesian3[] {
        return [];
    }

}