import React, {useRef} from 'react';
import './App.css';
import {useEffect} from "react";
import * as Cesium from 'cesium';
import CMap from "@/cmap/CMap";
import Toolbar from "@/cmap/component/toolbox/Toolbar";
import 'cesium/Build/Cesium/Widgets/widgets.css';


function App() {

  const viewer = useRef<Cesium.Viewer>();

  useEffect(() => {

    // 贴地雷达
    // const radar = new StickRadar({viewer: cmap.getInstance().viewer});
    // radar.createRadar({lat: 36.089227, lng: -112.121947});
    CMap.getInstance().viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(-112.121947, 36.089227, 6000)
    })


    const position = {
      "longitude": 1.9950016584252148,
      "latitude": 0.39113428210022094,
      "height": 259.1793780976834
    }
    // 创建飞机
    CMap.getInstance().viewer.entities.add({
      position: Cesium.Cartesian3.fromRadians(position.longitude, position.latitude, 500),
      // position: new Cesium.Cartesian3(.39095356048471813,1.994911236396836,1000),
      model: {
        uri: 'Cesium_Air.glb',
        runAnimations: true,
        clampAnimations: false
      }
    });
    CMap.getInstance().viewer.zoomTo(CMap.getInstance().viewer.entities);


    // CMap.getInstance().viewer.screenSpaceEventHandler
    //     .setInputAction((event: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
    //         // let ray = CMap.getInstance().viewer.camera.getPickRay(event.position);
    //         // if (ray instanceof Cesium.Ray) {
    //         //     let position = CMap.getInstance().viewer.scene.globe.pick(ray, CMap.getInstance().viewer.scene);
    //         //     console.log(position);
    //         // }
    //         let position = CMap.getInstance().viewer.scene.pickPosition(event.position);
    //         let cartographic = Cesium.Cartographic.fromCartesian(position);
    //
    //         // console.log(cartographic)
    //     }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    viewer.current = CMap.getInstance().viewer;
  }, [])


  return (
      <div id='cesiumContainer' style={{
        height: '100%'
      }}>
        <Toolbar />
      </div>
  );
}

export default App;
