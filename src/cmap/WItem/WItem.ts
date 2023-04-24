import * as Cesium from 'cesium'
export default class WItem extends Cesium.Entity{
    constructor(position: Cesium.Cartesian3,opts: object) {
        const option = {
            position: position,
            ...opts
        }
        super(option);
    }
}