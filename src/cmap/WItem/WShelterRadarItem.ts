import * as Cesium from 'cesium'

export type ShelterRadarTypeProps = {
    viewer: Cesium.Viewer
}
export type CreateRadarType = {
    position: Cesium.Cartesian3,
    num?: number,
    maxAngle?: number,
    radii?: Cesium.Cartesian3,
    innerRadii?: Cesium.Cartesian3
}
export class ShelterRadar {
    private viewer: Cesium.Viewer
    private randarArr: Cesium.Entity[] = []
    constructor(props: ShelterRadarTypeProps) {
        this.viewer = props.viewer
    }
    createRadar(params: CreateRadarType) {
        const { position, num, maxAngle = 120, radii, innerRadii } = params
        let num1 = num || 0
        const randar = this.viewer.entities.add({
            position: position,
            orientation: new Cesium.CallbackProperty(() => {
                num1 += 0.3;
                if (num1 >= maxAngle) num1 = 0;
                return Cesium.Transforms.headingPitchRollQuaternion(
                    position,
                    new Cesium.HeadingPitchRoll((num1 * Math.PI) / 180, 0, 0)
                );
            }, false),
            ellipsoid: {
                radii: radii || new Cesium.Cartesian3(5000.0, 5000.0, 2000.0), // 扇形半径
                innerRadii: innerRadii || new Cesium.Cartesian3(1.0, 1.0, 1.0), // 内半径
                minimumClock: Cesium.Math.toRadians(-10),
                maximumClock: Cesium.Math.toRadians(10),
                minimumCone: Cesium.Math.toRadians(90), // 上下偏角  可以都设置为90
                maximumCone: Cesium.Math.toRadians(90),
                material: Cesium.Color.GREEN.withAlpha(0.5),
                outline: true,
                outlineColor: Cesium.Color.GREEN.withAlpha(.8),
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, //RELATIVE_TO_GROUND CLAMP_TO_GROUND
            },
        });
        this.randarArr.push(randar)
        return randar;
    }
    clear() {
        for (let i = 0; i < this.randarArr.length; i++) {
            this.viewer.entities.remove(this.randarArr[i])
        }
        this.randarArr = []
    }
    clearOne(entity: Cesium.Entity) {
        this.viewer.entities.remove(entity)
        this.randarArr = this.randarArr.filter(x => x.id !== entity.id)
    }
}

export type createRadarType = {
    lat: number;
    lng: number;
    alt?: number;
    scanColor?: Cesium.Color;
    duration?: number;
    radius?: number;
}
export class StickRadar {
    private viewer: Cesium.Viewer
    private randarArr: any = []
    constructor(props: ShelterRadarTypeProps) {
        this.viewer = props.viewer
    }
    createRadar(params: createRadarType) {
        const { lat, lng, alt = 0, scanColor, duration, radius } = params
        const geographySpace = new Cesium.Cartographic(Cesium.Math.toRadians(lng), Cesium.Math.toRadians(lat), alt);
        // 扫描颜色
        const color = scanColor || new Cesium.Color(119 / 255, 214 / 255, 209 / 255, 0.6)
        // 持续时间 毫秒
        var time = duration || 4000;
        // 绘制平面雷达扫描线
        var radarRadius = radius || 3000
        const radar = this.addRadarScanPostStage(geographySpace, radarRadius, color, time);
        this.randarArr.push(radar)
    }
    /*
      添加雷达扫描线 地形遮挡开启
      cartographicCenter 扫描中心【new Cesium.Cartographic(Cesium.Math.toRadians(lon), Cesium.Math.toRadians(lat), 0);】
      radius  半径 米【1500】
      scanColor 扫描颜色【new Cesium.Color(1.0, 0.0, 0.0, 1)】
      duration 持续时间 毫秒【4000】
    */
    addRadarScanPostStage(cartographicCenter: Cesium.Cartographic, radius: number, scanColor: Cesium.Color, duration: number) {
        /* // 彩色纹理
          uniform sampler2D colorTexture;
          // 深度纹理
          uniform sampler2D depthTexture;
          // 纹理坐标
          varying vec2 v_textureCoordinates;
          // 扫描中心
          uniform vec4 u_scanCenterEC;
          // 扫描平面法线EC
          uniform vec3 u_scanPlaneNormalEC;
          // 扫描线法线EC
          uniform vec3 u_scanLineNormalEC;
          // 半径
          uniform float u_radius;
          // 扫描的颜色
          uniform vec4 u_scanColor;
          vec4 toEye( in vec2 uv, infloat depth) {
              vec2 xy = vec2((uv.x * 2.0 - 1.0), (uv.y * 2.0 - 1.0));
              vec4 posInCamera = czm_inverseProjection * vec4(xy, depth, 1.0);
              posInCamera = posInCamera / posInCamera.w;
              return posInCamera;
          }
          bool isPointOnLineRight( in vec3 ptOnLine, invec3 lineNormal, invec3 testPt) {
              vec3 v01 = testPt - ptOnLine;
              normalize(v01);
              vec3 temp = cross(v01, lineNormal);
              float d = dot(temp, u_scanPlaneNormalEC);
              return d > 0.5;
          }
          vec3 pointProjectOnPlane( in vec3 planeNormal, invec3 planeOrigin, invec3 point) {
              vec3 v01 = point - planeOrigin;
              float d = dot(planeNormal, v01);
              return (point - planeNormal * d);
          }
          float distancePointToLine( in vec3 ptOnLine, invec3 lineNormal, invec3 testPt) {
              vec3 tempPt = pointProjectOnPlane(lineNormal, ptOnLine, testPt);
              return length(tempPt - ptOnLine);
          }
          float getDepth( in vec4 depth) {
              float z_window = czm_unpackDepth(depth);
              z_window = czm_reverseLogDepth(z_window);
              float n_range = czm_depthRange.near;
              float f_range = czm_depthRange.far;
              return (2.0 * z_window - n_range - f_range) / (f_range - n_range);
          }
          void main() {
              // 得到釉色 = 结构二维(彩色纹理,纹理坐标)
              vFragColor = texture(colorTexture, v_textureCoordinates);
              // 深度 = (釉色 = 结构二维(深度纹理,纹理坐标))
              float depth = getDepth(texture(depthTexture, v_textureCoordinates));
              // 视角 = (纹理坐标,深度)
              vec4 viewPos = toEye(v_textureCoordinates, depth);
              // 平面点投影 = (扫描平面法线,扫描中心,视角)
              vec3 prjOnPlane = pointProjectOnPlane(u_scanPlaneNormalEC.xyz, u_scanCenterEC.xyz, viewPos.xyz);
              // 差值
              float dis = length(prjOnPlane.xyz - u_scanCenterEC.xyz);
              // 直径 = 两个半径
              float twou_radius = u_radius * 2.0;
              if (dis < u_radius) {
                  float f0 = 1.0 - abs(u_radius - dis) / u_radius;
                  f0 = pow(f0, 64.0);
                  vec3 lineEndPt = vec3(u_scanCenterEC.xyz) + u_scanLineNormalEC * u_radius;
                  float f = 0.0;
                  if (isPointOnLineRight(u_scanCenterEC.xyz, u_scanLineNormalEC.xyz, prjOnPlane.xyz)) {
                      float dis1 = length(prjOnPlane.xyz - lineEndPt);
                      f = abs(twou_radius - dis1) / twou_radius;
                      f = pow(f, 3.0);
                  }
                  vFragColor = mix(vFragColor, u_scanColor, f + f0);
              }
          } */
        var ScanSegmentShader =
            "uniform sampler2D colorTexture;\n" +
            "uniform sampler2D depthTexture;\n" +
            "in vec2 v_textureCoordinates;\n" +
            "uniform vec4 u_scanCenterEC;\n" +
            "uniform vec3 u_scanPlaneNormalEC;\n" +
            "uniform vec3 u_scanLineNormalEC;\n" +
            "uniform float u_radius;\n" +
            "uniform vec4 u_scanColor;\n" +
            "out vec4 vFragColor;\n"+

            "vec4 toEye(in vec2 uv, in float depth)\n" +
            " {\n" +
            " vec2 xy = vec2((uv.x * 2.0 - 1.0),(uv.y * 2.0 - 1.0));\n" +
            " vec4 posInCamera =czm_inverseProjection * vec4(xy, depth, 1.0);\n" +
            " posInCamera =posInCamera / posInCamera.w;\n" +
            " return posInCamera;\n" +
            " }\n" +

            "bool isPointOnLineRight(in vec3 ptOnLine, in vec3 lineNormal, in vec3 testPt)\n" +
            "{\n" +
            "vec3 v01 = testPt - ptOnLine;\n" +
            "normalize(v01);\n" +
            "vec3 temp = cross(v01, lineNormal);\n" +
            "float d = dot(temp, u_scanPlaneNormalEC);\n" +
            "return d > 0.5;\n" +
            "}\n" +

            "vec3 pointProjectOnPlane(in vec3 planeNormal, in vec3 planeOrigin, in vec3 point)\n" +
            "{\n" +
            "vec3 v01 = point -planeOrigin;\n" +
            "float d = dot(planeNormal, v01) ;\n" +
            "return (point - planeNormal * d);\n" +
            "}\n" +

            "float distancePointToLine(in vec3 ptOnLine, in vec3 lineNormal, in vec3 testPt)\n" +
            "{\n" +
            "vec3 tempPt = pointProjectOnPlane(lineNormal, ptOnLine, testPt);\n" +
            "return length(tempPt - ptOnLine);\n" +
            "}\n" +

            "float getDepth(in vec4 depth)\n" +
            "{\n" +
            "float z_window = czm_unpackDepth(depth);\n" +
            "z_window = czm_reverseLogDepth(z_window);\n" +
            "float n_range = czm_depthRange.near;\n" +
            "float f_range = czm_depthRange.far;\n" +
            "return (2.0 * z_window - n_range - f_range) / (f_range - n_range);\n" +
            "}\n" +

            "void main()\n" +
            "{\n" +
            "vFragColor = texture(colorTexture, v_textureCoordinates);\n" +
            "float depth = getDepth( texture(depthTexture, v_textureCoordinates));\n" +
            "vec4 viewPos = toEye(v_textureCoordinates, depth);\n" +
            "vec3 prjOnPlane = pointProjectOnPlane(u_scanPlaneNormalEC.xyz, u_scanCenterEC.xyz, viewPos.xyz);\n" +
            "float dis = length(prjOnPlane.xyz - u_scanCenterEC.xyz);\n" +
            "float twou_radius = u_radius * 2.0;\n" +
            "if(dis < u_radius)\n" +
            "{\n" +
            "float f0 = 1.0 -abs(u_radius - dis) / u_radius;\n" +
            "f0 = pow(f0, 64.0);\n" +
            // lineEndPt扫描线
            "vec3 lineEndPt = vec3(u_scanCenterEC.xyz) + u_scanLineNormalEC * u_radius * 0.5;\n" +
            "float f = 0.0;\n" +
            "if(isPointOnLineRight(u_scanCenterEC.xyz, u_scanLineNormalEC.xyz, prjOnPlane.xyz))\n" +
            "{\n" +
            "float dis1= length(prjOnPlane.xyz - lineEndPt);\n" +
            "f = abs(twou_radius -dis1) / twou_radius;\n" +
            "f = pow(f, 3.0);\n" +
            "}\n" +
            //外边框 内边框颜色
            "vFragColor = mix(vFragColor, u_scanColor, f + f0);\n" +
            "}\n" +
            "}\n";

        var _Cartesian3Center = Cesium.Cartographic.toCartesian(cartographicCenter);
        var _Cartesian4Center = new Cesium.Cartesian4(_Cartesian3Center.x, _Cartesian3Center.y, _Cartesian3Center.z, 1);

        var _CartographicCenter1 = new Cesium.Cartographic(cartographicCenter.longitude, cartographicCenter.latitude, cartographicCenter.height + 500);
        var _Cartesian3Center1 = Cesium.Cartographic.toCartesian(_CartographicCenter1);
        var _Cartesian4Center1 = new Cesium.Cartesian4(_Cartesian3Center1.x, _Cartesian3Center1.y, _Cartesian3Center1.z, 1);

        var _CartographicCenter2 = new Cesium.Cartographic(cartographicCenter.longitude + Cesium.Math.toRadians(0.001), cartographicCenter.latitude, cartographicCenter.height);
        var _Cartesian3Center2 = Cesium.Cartographic.toCartesian(_CartographicCenter2);
        var _Cartesian4Center2 = new Cesium.Cartesian4(_Cartesian3Center2.x, _Cartesian3Center2.y, _Cartesian3Center2.z, 1);
        var _RotateQ = new Cesium.Quaternion();
        var _RotateM = new Cesium.Matrix3();

        var _time = (new Date()).getTime();

        var _scratchCartesian4Center = new Cesium.Cartesian4();
        var _scratchCartesian4Center1 = new Cesium.Cartesian4();
        var _scratchCartesian4Center2 = new Cesium.Cartesian4();
        var _scratchCartesian3Normal = new Cesium.Cartesian3();
        var _scratchCartesian3Normal1 = new Cesium.Cartesian3();

        var ScanPostStage = new Cesium.PostProcessStage({
            fragmentShader: ScanSegmentShader,
            uniforms: {
                u_scanCenterEC: () => {
                    return Cesium.Matrix4.multiplyByVector(this.viewer.camera.viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
                },
                u_scanPlaneNormalEC: () => {
                    var temp = Cesium.Matrix4.multiplyByVector(this.viewer.camera.viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
                    var temp1 = Cesium.Matrix4.multiplyByVector(this.viewer.camera.viewMatrix, _Cartesian4Center1, _scratchCartesian4Center1);
                    _scratchCartesian3Normal.x = temp1.x - temp.x;
                    _scratchCartesian3Normal.y = temp1.y - temp.y;
                    _scratchCartesian3Normal.z = temp1.z - temp.z;

                    Cesium.Cartesian3.normalize(_scratchCartesian3Normal, _scratchCartesian3Normal);
                    return _scratchCartesian3Normal;
                },
                u_radius: radius,
                u_scanLineNormalEC: () => {
                    var temp = Cesium.Matrix4.multiplyByVector(this.viewer.camera.viewMatrix, _Cartesian4Center, _scratchCartesian4Center);
                    var temp1 = Cesium.Matrix4.multiplyByVector(this.viewer.camera.viewMatrix, _Cartesian4Center1, _scratchCartesian4Center1);
                    var temp2 = Cesium.Matrix4.multiplyByVector(this.viewer.camera.viewMatrix, _Cartesian4Center2, _scratchCartesian4Center2);

                    _scratchCartesian3Normal.x = temp1.x - temp.x;
                    _scratchCartesian3Normal.y = temp1.y - temp.y;
                    _scratchCartesian3Normal.z = temp1.z - temp.z;

                    Cesium.Cartesian3.normalize(_scratchCartesian3Normal, _scratchCartesian3Normal);

                    _scratchCartesian3Normal1.x = temp2.x - temp.x;
                    _scratchCartesian3Normal1.y = temp2.y - temp.y;
                    _scratchCartesian3Normal1.z = temp2.z - temp.z;

                    var tempTime = (((new Date()).getTime() - _time) % duration) / duration;
                    // 第二个参数为 扫描幅度
                    Cesium.Quaternion.fromAxisAngle(_scratchCartesian3Normal, tempTime * Cesium.Math.PI * 2, _RotateQ);
                    Cesium.Matrix3.fromQuaternion(_RotateQ, _RotateM);
                    Cesium.Matrix3.multiplyByVector(_RotateM, _scratchCartesian3Normal1, _scratchCartesian3Normal1);
                    Cesium.Cartesian3.normalize(_scratchCartesian3Normal1, _scratchCartesian3Normal1);
                    return _scratchCartesian3Normal1;
                },
                u_scanColor: scanColor
            }
        });
        return this.viewer.scene.postProcessStages.add(ScanPostStage);
    }
    clear() {
        for (let i = 0; i < this.randarArr.length; i++) {
            this.viewer.scene.postProcessStages.remove(this.randarArr[i])
        }
        this.randarArr = []
    }
}

