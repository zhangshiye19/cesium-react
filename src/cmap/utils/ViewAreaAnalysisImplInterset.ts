import * as Cesium from 'cesium';
import ViewAreaAnalysis from '@/cmap/utils/ViewAreaAnalysis';

type ViewAreaAnalysisConstructorProperty = {
    viewer: Cesium.Viewer,
    positionS?: Cesium.Cartesian3,
    positionE?: Cesium.Cartesian3,
    angle?: number
}

// 实现方式绘制很多条线段
export default class ViewAreaAnalysisImplByIntersect implements ViewAreaAnalysis {

    positionS: Cesium.Cartesian3;
    positionE: Cesium.Cartesian3;
    angle: number;          // degree
    viewer: Cesium.Viewer;
    geometryInstances: Cesium.GeometryInstance[]

    // radius: number;

    constructor(option: ViewAreaAnalysisConstructorProperty) {
        this.positionS = option.positionS || new Cesium.Cartesian3();
        this.positionE = option.positionE || new Cesium.Cartesian3();
        this.angle = option.angle || 45;
        this.viewer = option.viewer;
        this.geometryInstances = []
        // this.radius = 0; //似乎没用
    }

    analysis(pointS: Cesium.Cartesian3, pointE: Cesium.Cartesian3, angle?: number) {
        this.positionS = pointS;
        this.positionE = pointE;
        this.angle = angle || this.angle;
        // this.radius = Cesium.Cartesian3.distance(this.positionS, this.positionE);

        //绘制可视区域
        this.drawViewArea();
    }

    drawSector() {
        for (let i = -this.angle / 2; i <= this.angle / 2; i++) {
            const pointS = this.positionS;
            const pointE = this.rotatePointByAngle(this.positionE, this.positionS, i);
            const intersect = this.computeIntersectPoint(pointS, pointE);
            // if (Cesium.defined(intersect)) {
            //     // 焦点位置可能会比终点长
            //     if (intersect && Cesium.Cartesian3.distance(pointS, pointE) > Cesium.Cartesian3.distance(pointS, intersect)) {
            //         // this.drawLine(pointS, intersect, Cesium.Color.GREEN);
            //         // this.drawLine(intersect, pointE, Cesium.Color.RED);
            //         this.addLineInstance(pointS, pointE, intersect);
            //     } else {
            //         this.addLineInstance(pointS, pointE, undefined);
            //         // this.drawLine(pointS, pointE, Cesium.Color.GREEN);
            //     }
            // } else { // 没有焦点，全部可见
            //     this.addLineInstance(pointS, pointE, undefined);
            //     // this.drawLine(pointS, pointE, Cesium.Color.GREEN);
            // }

            // 代码优化
            if (intersect && Cesium.Cartesian3.distance(pointS, pointE) > Cesium.Cartesian3.distance(pointS, intersect)) {
                this.addLineInstance(pointS, pointE, intersect);
            } else {
                this.addLineInstance(pointS, pointE, undefined);
            }

        }

        this.viewer.scene.primitives.add(new Cesium.Primitive({
            geometryInstances: this.geometryInstances,
            appearance: new Cesium.PolylineColorAppearance(),
            depthFailAppearance: new Cesium.PolylineColorAppearance()
            // appearance: new Cesium.PerInstanceColorAppearance({
            //     flat: true
            // }),
            // depthFailAppearance: new Cesium.PerInstanceColorAppearance({
            //     flat:true
            // })
        }))
    }

    drawViewArea() {
        this.drawSector();
    }

    // pointA绕pointB旋转angle
    rotatePointByAngle(pointA: Cesium.Cartesian3, pointB: Cesium.Cartesian3, angle: number) {
        let localToWorld_Matrix = Cesium.Transforms.eastNorthUpToFixedFrame(pointB);
        //求世界坐标到局部坐标的变换矩阵
        let worldToLocal_Matrix = Cesium.Matrix4.inverse(localToWorld_Matrix, new Cesium.Matrix4());
        //B点在局部坐标的位置，其实就是局部坐标原点
        // let localPosition_B = Cesium.Matrix4.multiplyByPoint(worldToLocal_Matrix, pointB, new Cesium.Cartesian3());
        //A点在以B点为原点的局部的坐标位置
        let localPosition_A = Cesium.Matrix4.multiplyByPoint(worldToLocal_Matrix, pointA, new Cesium.Cartesian3());
        //根据数学公式A点逆时针旋转angle度后在局部坐标系中的x,y,z位置
        let new_x = localPosition_A.x * Math.cos(Cesium.Math.toRadians(angle)) + localPosition_A.y * Math.sin(Cesium.Math.toRadians(angle));
        let new_y = localPosition_A.y * Math.cos(Cesium.Math.toRadians(angle)) - localPosition_A.x * Math.sin(Cesium.Math.toRadians(angle));
        let new_z = localPosition_A.z;
        //最后应用局部坐标到世界坐标的转换矩阵求得旋转后的A点世界坐标
        return Cesium.Matrix4.multiplyByPoint(localToWorld_Matrix, new Cesium.Cartesian3(new_x, new_y, new_z), new Cesium.Cartesian3());
    }

    computeIntersectPoint(pointS: Cesium.Cartesian3, pointE: Cesium.Cartesian3) {
        // 计算方向
        let direction = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(pointE, pointS, new Cesium.Cartesian3()), new Cesium.Cartesian3());
        // 射线
        let ray = new Cesium.Ray(pointS, direction);
        return this.viewer.scene.globe.pick(ray, this.viewer.scene);
    }

    // drawLine(pointS: Cesium.Cartesian3, pointE: Cesium.Cartesian3, color: Cesium.Color) {
    //     this.viewer.entities.add({
    //         polyline: {
    //             positions: [pointS, pointE],
    //             material: color || Cesium.Color.GREEN,
    //             depthFailMaterial: color || Cesium.Color.GREEN
    //         }
    //     })

    // const geometryInstances = new Cesium.GeometryInstance({
    //     geometry: new Cesium.PolylineGeometry({
    //         positions: [pointS, pointE],
    //     }),
    //     attributes: {
    //         color: Cesium.ColorGeometryInstanceAttribute.fromColor(color)
    //     }
    // })
    //
    // this.geometryInstances = [
    //     geometryInstances,
    //     ...this.geometryInstances
    // ]
    // }

    addLineInstance(pointS: Cesium.Cartesian3, pointE: Cesium.Cartesian3, intersect: Cesium.Cartesian3 | undefined) {
        let geometryInstances: Cesium.GeometryInstance;
        if (intersect) {
            geometryInstances = new Cesium.GeometryInstance({
                geometry: new Cesium.PolylineGeometry({
                    positions: [pointS, intersect, pointE],
                    colors: [Cesium.Color.GREEN, Cesium.Color.RED, Cesium.Color.RED],
                    // vertexFormat : Cesium.PolylineColorAppearance.VERTEX_FORMAT,
                    width: 2,
                    // colorsPerVertex: true
                }),
            })
        } else {
            geometryInstances = new Cesium.GeometryInstance({
                geometry: new Cesium.PolylineGeometry({
                    positions: [pointS, pointE],
                    width: 2,
                    // vertexFormat : Cesium.PolylineColorAppearance.VERTEX_FORMAT,
                    colors: [Cesium.Color.GREEN, Cesium.Color.GREEN],
                    // colorsPerVertex: true
                }),
            })
        }


        this.geometryInstances = [
            geometryInstances,
            ...this.geometryInstances
        ]
    }

}