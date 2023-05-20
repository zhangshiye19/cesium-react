import * as Cesium from "cesium";
import {Point, Polyline, PolylineOptions} from "@/cmap/entity/Entity";


export class CustomPolyline extends Polyline {
    private vertexes: Cesium.Entity[]

    constructor(options: PolylineOptions) {
        super(options);

        this.vertexes = [];
        // this.instance.definitionChanged.addEventListener((event: any) => {
        //     console.log("event",event)
        // })
        this.autoAddVertex();
    }

    autoAddVertex() {
        this.instance.definitionChanged.addEventListener((origin: Cesium.PolylineGraphics, property: string, value: Cesium.Property | Cesium.Cartesian3[], valueOld: Cesium.Property | Cesium.Cartesian3[]) => {
            // console.log(origin,property,value,valueOld)
            // 删除所有vertexes
            this.removeAllVertex();
            if (value instanceof Cesium.ConstantProperty) {
                let positions = value.getValue() as Cesium.Cartesian3[];
                positions.forEach((position, index) => {
                    this.vertexes[index] = this.createVertex(position); // 创建vertex
                    this.entityCollection.add(this.vertexes[index])
                })
            }
        })
    }

    removeAllVertex() {
        // let entities = this.entityCollection;
        // 删除所有vertex
        this.vertexes.forEach(vertex => {
            this.entityCollection.remove(vertex);
        })
        this.vertexes = [];
    }

    createVertex(position: Cesium.Cartesian3) {
        return new Point({
            position: position,
            point: {
                pixelSize: 40,
                color: Cesium.Color.GREEN
            }
        });
    }
}