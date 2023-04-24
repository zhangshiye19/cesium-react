import * as Cesium from 'cesium';
// import CMap from "@/cmap/CMap";
// import {PerspectiveFrustum} from "cesium";
//
// type ViewShedOption = {
//     horizontalAngle: number,
//     verticalAngle: number,
//     distance: number,
//
//     viewPosition: Cesium.Cartesian3,
//
//     viewOrientation: Cesium.HeadingPitchRoll,
//
//     viewPositionEnd: Cesium.Cartesian3,
//
//     visibleAreaColor: Cesium.Color,
//     invisibleAreaColor: Cesium.Color,
//     enable: boolean,
//     softShadows: boolean,
//     size: number,
//
// }
//
// interface ViewShedInterface {
//     sketch: Cesium.Entity | null,
//     lightCamera: Cesium.Camera | null,
//     frustumOutline: Cesium.Primitive | null,
//     postStage: Cesium.PostProcessStage | null,
//     viewPosition: Cesium.Cartesian3,
//     viewPositionEnd: Cesium.Cartesian3,
//     viewDistance: number,
//     horizontalAngle: number,
//     verticalAngle: number,
//     viewOrientation: Cesium.HeadingPitchRoll,
//     visibleAreaColor: Cesium.Color,
//     invisibleAreaColor: Cesium.Color,
//     enable: boolean,
//     softShadows: boolean,
//     size: number,
//     shadowMap: Cesium.ShadowMap | null
// }
//
// class ViewShed implements ViewShedInterface {
//
//     sketch: Cesium.Entity | null;
//     lightCamera: Cesium.Camera | null;
//     // 视锥线
//     frustumOutline: Cesium.Primitive | null;
//     postStage: Cesium.PostProcessStage | null;
//     viewPosition: Cesium.Cartesian3;
//     viewPositionEnd: Cesium.Cartesian3;
//     horizontalAngle: number;
//     verticalAngle: number;
//     viewDistance: number;
//     viewOrientation: Cesium.HeadingPitchRoll;
//
//     visibleAreaColor: Cesium.Color;
//     invisibleAreaColor: Cesium.Color;
//     enable: boolean;
//     softShadows: boolean;
//     size: number;
//     shadowMap: Cesium.ShadowMap;
//
//     constructor(option: ViewShedOption) {
//         this.viewPosition = option.viewPosition;
//
//         // 优先 dest 计算，然后option数值，最后默认
//         this.viewPositionEnd = option.viewPositionEnd;
//         this.viewDistance = this.viewPositionEnd ? Cesium.Cartesian3.distance(this.viewPosition, this.viewPositionEnd) : (option.distance || 100.0);
//
//         if (this.viewPositionEnd) {
//             const headingPitch = this.computeHeadingPitch(this.viewPosition, this.viewPositionEnd);
//             this.viewOrientation = new Cesium.HeadingPitchRoll();
//             this.viewOrientation.heading = headingPitch[0];
//             this.viewOrientation.pitch = headingPitch[1];
//         } else {
//             this.viewOrientation = option.viewOrientation;
//         }
//
//         this.horizontalAngle = option.horizontalAngle;
//         this.verticalAngle = option.verticalAngle;
//         this.visibleAreaColor = option.visibleAreaColor || Cesium.Color.GREEN;
//         this.invisibleAreaColor = option.invisibleAreaColor || Cesium.Color.RED;
//         this.enable = option.enable || true;
//         this.softShadows = option.softShadows || true;
//         this.size = option.size || 2048;
//
//         // 赋值NULL
//         this.sketch = null;
//         this.lightCamera = null;
//         this.frustumOutline = null;
//         this.postStage = null;
//         this.shadowMap = this.createShadowMap();
//
//         //创建雷达
//         this.createLightCamera();
//         this.createShadowMap();
//     }
//
//     clear() {
//         if (this.sketch) {
//             CMap.getInstance().viewer.entities.remove(this.sketch);
//             this.sketch = null;
//         }
//         if (this.frustumOutline) {
//             this.frustumOutline.destroy();
//             this.frustumOutline = null;
//         }
//         if (this.postStage) {
//             CMap.getInstance().viewer.scene.postProcessStages.remove(this.postStage)
//             this.postStage = null;
//         }
//     }
//
//     computeHeadingPitch(positionFrom: Cesium.Cartesian3, positionTo: Cesium.Cartesian3) {
//         let positionFinal = new Cesium.Cartesian3();
//         let matrix4 = Cesium.Transforms.eastNorthUpToFixedFrame(positionFrom);
//         Cesium.Matrix4.inverse(matrix4, matrix4);
//         Cesium.Matrix4.multiplyByPoint(matrix4, positionTo, positionFinal);
//         Cesium.Cartesian3.normalize(positionFinal, positionFinal);
//         return [
//             Cesium.Math.toDegrees(Math.atan2(positionFinal.x, positionFinal.y)),
//             Cesium.Math.toDegrees(Math.asin(positionFinal.z))
//         ];
//     }
//
//
//     createPostStage() {
//         const fs = `#define USE_CUBE_MAP_SHADOW true
//  uniform sampler2D colorTexture;
//  uniform sampler2D depthTexture;
//  varying vec2 v_textureCoordinates;
//  uniform mat4 camera_projection_matrix;
//  uniform mat4 camera_view_matrix;
//  uniform samplerCube shadowMap_textureCube;
//  uniform mat4 shadowMap_matrix;
//  uniform vec4 shadowMap_lightPositionEC;
//  uniform vec4 shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness;
//  uniform vec4 shadowMap_texelSizeDepthBiasAndNormalShadingSmooth;
//  uniform float helsing_viewDistance;
//  uniform vec4 helsing_visibleAreaColor;
//  uniform vec4 helsing_invisibleAreaColor;
//  struct zx_shadowParameters
//  {
//      vec3 texCoords;
//      float depthBias;
//      float depth;
//      float nDotL;
//      vec2 texelStepSize;
//      float normalShadingSmooth;
//      float darkness;
//  };
//  float czm_shadowVisibility(samplerCube shadowMap, zx_shadowParameters shadowParameters)
//  {
//      float depthBias = shadowParameters.depthBias;
//      float depth = shadowParameters.depth;
//      float nDotL = shadowParameters.nDotL;
//      float normalShadingSmooth = shadowParameters.normalShadingSmooth;
//      float darkness = shadowParameters.darkness;
//      vec3 uvw = shadowParameters.texCoords;
//      depth -= depthBias;
//      float visibility = czm_shadowDepthCompare(shadowMap, uvw, depth);
//      return czm_private_shadowVisibility(visibility, nDotL, normalShadingSmooth, darkness);
//  }
//  vec4 getPositionEC(){
//      return czm_windowToEyeCoordinates(gl_FragCoord);
//  }
//  vec3 getNormalEC(){
//      return vec3(1.);
//  }
//  vec4 toEye(in vec2 uv,in float depth){
//      vec2 xy=vec2((uv.x*2.-1.),(uv.y*2.-1.));
//      vec4 posInCamera=czm_inverseProjection*vec4(xy,depth,1.);
//      posInCamera=posInCamera/posInCamera.w;
//      return posInCamera;
//  }
//  vec3 pointProjectOnPlane(in vec3 planeNormal,in vec3 planeOrigin,in vec3 point){
//      vec3 v01=point-planeOrigin;
//      float d=dot(planeNormal,v01);
//      return(point-planeNormal*d);
//  }
//  float getDepth(in vec4 depth){
//      float z_window=czm_unpackDepth(depth);
//      z_window=czm_reverseLogDepth(z_window);
//      float n_range=czm_depthRange.near;
//      float f_range=czm_depthRange.far;
//      return(2.*z_window-n_range-f_range)/(f_range-n_range);
//  }
//  float shadow(in vec4 positionEC){
//      vec3 normalEC=getNormalEC();
//      zx_shadowParameters shadowParameters;
//      shadowParameters.texelStepSize=shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.xy;
//      shadowParameters.depthBias=shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.z;
//      shadowParameters.normalShadingSmooth=shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.w;
//      shadowParameters.darkness=shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness.w;
//      vec3 directionEC=positionEC.xyz-shadowMap_lightPositionEC.xyz;
//      float distance=length(directionEC);
//      directionEC=normalize(directionEC);
//      float radius=shadowMap_lightPositionEC.w;
//      if(distance>radius)
//      {
//          return 2.0;
//      }
//      vec3 directionWC=czm_inverseViewRotation*directionEC;
//      shadowParameters.depth=distance/radius-0.0003;
//      shadowParameters.nDotL=clamp(dot(normalEC,-directionEC),0.,1.);
//      shadowParameters.texCoords=directionWC;
//      float visibility=czm_shadowVisibility(shadowMap_textureCube,shadowParameters);
//      return visibility;
//  }
//  bool visible(in vec4 result)
//  {
//      result.x/=result.w;
//      result.y/=result.w;
//      result.z/=result.w;
//      return result.x>=-1.&&result.x<=1.
//      &&result.y>=-1.&&result.y<=1.
//      &&result.z>=-1.&&result.z<=1.;
//  }
//  void main(){
//      // 釉色 = 结构二维(颜色纹理, 纹理坐标)
//      gl_FragColor = texture2D(colorTexture, v_textureCoordinates);
//      // 深度 = 获取深度(结构二维(深度纹理, 纹理坐标))
//      float depth = getDepth(texture2D(depthTexture, v_textureCoordinates));
//      // 视角 = (纹理坐标, 深度)
//      vec4 viewPos = toEye(v_textureCoordinates, depth);
//      // 世界坐标
//      vec4 wordPos = czm_inverseView * viewPos;
//      // 虚拟相机中坐标
//      vec4 vcPos = camera_view_matrix * wordPos;
//      float near = .001 * helsing_viewDistance;
//      float dis = length(vcPos.xyz);
//      if(dis > near && dis < helsing_viewDistance){
//          // 透视投影
//          vec4 posInEye = camera_projection_matrix * vcPos;
//          // 可视区颜色
//          // vec4 helsing_visibleAreaColor=vec4(0.,1.,0.,.5);
//          // vec4 helsing_invisibleAreaColor=vec4(1.,0.,0.,.5);
//          if(visible(posInEye)){
//              float vis = shadow(viewPos);
//              if(vis > 0.3){
//                  gl_FragColor = mix(gl_FragColor,helsing_visibleAreaColor,.5);
//              } else{
//                  gl_FragColor = mix(gl_FragColor,helsing_invisibleAreaColor,.5);
//              }
//          }
//      }
//  }`;
//         const postStage = new Cesium.PostProcessStage({
//             fragmentShader: fs,
//             uniforms: {
//                 shadowMap_textureCube: () => {
//                     this.shadowMap.update(Reflect.get(this.viewer.scene, "_frameState"));
//                     return Reflect.get(this.shadowMap, "_shadowMapTexture");
//                 },
//                 shadowMap_matrix: () => {
//                     this.shadowMap.update(Reflect.get(this.viewer.scene, "_frameState"));
//                     return Reflect.get(this.shadowMap, "_shadowMapMatrix");
//                 },
//                 shadowMap_lightPositionEC: () => {
//                     this.shadowMap.update(Reflect.get(this.viewer.scene, "_frameState"));
//                     return Reflect.get(this.shadowMap, "_lightPositionEC");
//                 },
//                 shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness: () => {
//                     this.shadowMap.update(Reflect.get(this.viewer.scene, "_frameState"));
//                     const bias = this.shadowMap._pointBias;
//                     return Cesium.Cartesian4.fromElements(
//                         bias.normalOffsetScale,
//                         this.shadowMap._distance,
//                         this.shadowMap.maximumDistance,
//                         0.0,
//                         new Cesium.Cartesian4()
//                     );
//                 },
//                 shadowMap_texelSizeDepthBiasAndNormalShadingSmooth: () => {
//                     this.shadowMap.update(Reflect.get(this.viewer.scene, "_frameState"));
//                     const bias = this.shadowMap._pointBias;
//                     const scratchTexelStepSize = new Cesium.Cartesian2();
//                     const texelStepSize = scratchTexelStepSize;
//                     texelStepSize.x = 1.0 / this.shadowMap._textureSize.x;
//                     texelStepSize.y = 1.0 / this.shadowMap._textureSize.y;
//
//                     return Cesium.Cartesian4.fromElements(
//                         texelStepSize.x,
//                         texelStepSize.y,
//                         bias.depthBias,
//                         bias.normalShadingSmooth,
//                         new Cesium.Cartesian4()
//                     );
//                 }，
//             camera_projection_matrix: this.lightCamera.frustum.projectionMatrix,
//                 camera_view_matrix
//     :
//         this.lightCamera.viewMatrix,
//             helsing_viewDistance
//     :
//         () => {
//             return this.viewDistance;
//         },
//             helsing_visibleAreaColor
//     :
//         this.visibleAreaColor,
//             helsing_invisibleAreaColor
//     :
//         this.invisibleAreaColor,
//     }
//     })
//         ;
//         this.postStage = this.viewer.scene.postProcessStages.add(postStage);
//     }
//
//
//     createLightCamera(): Cesium.Camera {
//         //光源相机
//         const lightCamera = new Cesium.Camera(CMap.getInstance().viewer.scene);
//         lightCamera.position = this.viewPosition;
//
//         //相机，
//         lightCamera.frustum.near = this.viewDistance * 0.001;
//         lightCamera.frustum.far = this.viewDistance;
//
//         const hr = Cesium.Math.toRadians(this.horizontalAngle);
//         const vr = Cesium.Math.toRadians(this.verticalAngle);
//         const aspectRadio =
//             (this.viewDistance * Math.tan(hr / 2) * 2) / (this.viewDistance * Math.tan(vr / 2) * 2);
//
//         if (lightCamera.frustum instanceof PerspectiveFrustum) {
//             lightCamera.frustum.aspectRatio = aspectRadio;
//             if (hr > vr) {
//                 lightCamera.frustum.fov = hr;
//             } else {
//                 lightCamera.frustum.fov = vr;
//             }
//         }
//         lightCamera.setView({
//             destination: this.viewPosition,
//             orientation: this.viewOrientation
//         })
//         return lightCamera;
//     }
//
//     createShadowMap() {
//         // @ts-ignore
//         const shadowMap = new Cesium.ShadowMap({
//             context: CMap.getInstance().viewer.scene,
//             lightCamera: this.lightCamera,
//             enabled: this.enable,
//             isPointLight: true,
//             pointLightRadius: this.viewDistance,
//             cascadesEnabled: false,
//             size: this.size,
//             softShadows: this.softShadows,
//             normalOffset: false,
//             fromLightSource: false
//         });
//         CMap.getInstance().viewer.scene.shadowMap = shadowMap;
//         return shadowMap;
//     }
// }
//
// export default ViewShed;
