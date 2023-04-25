import React, {useCallback, useEffect, useRef, useState} from "react";
import * as Cesium from 'cesium';
import CMap from "@/cmap/CMap";
import ViewAreaAnalysis from "@/cmap/feature/ViewAreaAnalysis";
import ViewAreaAnalysisImplByIntersect from "@/cmap/feature/ViewAreaAnalysisImplInterset";
import styles from './toolbar.module.css';

// type ViewAnalysis = {
//     viewer: Cesium.Viewer
// }

const ViewAnalysis = () => {

    const active = useRef(false);

    const step = useRef(0);

    const positionStart = useRef<Cesium.Cartesian3>();

    const positionEnd = useRef<Cesium.Cartesian3>();

    const currentEntity = useRef<Cesium.Entity>();

    const viewerRef = useRef<Cesium.Viewer>();

    const viewAnalysisFeature = useRef<ViewAreaAnalysis>();

    useEffect(()=>{
        // if (active.current) {
        //
        // }else {
        //
        // }
    },[active])


    //开始绘制
    const createHandlerLeftClick = useCallback(() => {
        const handler = new Cesium.ScreenSpaceEventHandler();
        handler.setInputAction((event: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
            // setStep(step + 1);
            // console.log(active.current,step.current)
            if (active.current) {
                step.current = step.current + 1;
                if (step.current === 1) {
                    positionStart.current = CMap.getInstance().viewer.scene.pickPosition(event.position);
                    currentEntity.current = createEntity();
                } else if (step.current === 2) {
                    finish();
                    // const positionsFixed = (currentEntity.current?.polyline?.positions?.getValue(CMap.getInstance().viewer.clock.currentTime) as [Cesium.Cartesian3]);
                    // if (currentEntity.current && currentEntity.current?.polyline) {
                    //     currentEntity.current.polyline.positions = new Cesium.ConstantProperty(positionsFixed);
                    // }
                    // step.current = 0;
                    // active.current = false;
                    // console.log("结束绘制")
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

        return handler;
    }, [])

    const finish = () => {
        //删除entity
        if (currentEntity.current instanceof Cesium.Entity) {
            viewerRef.current?.entities.remove(currentEntity.current);
            currentEntity.current = undefined;
        }

        // 重置绘制步骤以及激活状态
        step.current = 0;
        active.current = false

        // 绘制可视域分析图
        if (positionStart.current && positionEnd.current) {
            viewAnalysisFeature.current?.analysis(positionStart.current, positionEnd.current);
        }

    }

    const createHandlerMouseMove = useCallback(() => {
        const handler = new Cesium.ScreenSpaceEventHandler();
        handler.setInputAction((event: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
            if (active.current) {
                positionEnd.current = CMap.getInstance().viewer.scene.pickPosition(event.endPosition);
                // console.log(positionStart,positionEnd)
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

        return handler;
    }, [])

    const createEntity = () => {


        return CMap.getInstance().viewer.entities.add({
            polyline: {
                width: 2,
                material: Cesium.Color.GREEN,
                positions: new Cesium.CallbackProperty(() => {
                    if (!positionStart.current) {
                        return;
                    }
                    const position1 = positionStart.current?.clone(new Cesium.Cartesian3());
                    const position2 = positionEnd.current?.clone() || position1;

                    return [
                        position1,
                        position2
                    ]
                }, false),
                // depthFailMaterial: Cesium.Color.RED
            }
        });
    };

    useEffect(() => {

        createHandlerLeftClick();
        createHandlerMouseMove();

        viewerRef.current = CMap.getInstance().viewer;
        viewAnalysisFeature.current = new ViewAreaAnalysisImplByIntersect({
            viewer: viewerRef.current,
            angle: 120
        });

    }, [])

    const handleClick = () => { // 鼠标点击事件
        active.current = true;
        // createHandlerLeftClick();
        // createHandlerMouseMove();
    }

    return <button
        className={`cesium-toolbar-button cesium-button ${styles['toolbar-button']}`}
        type={"button"}
        title={"通视分析"}
        onClick={handleClick}
    >
        <svg className="cesium-svgPath-svg" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
             width="200" height="200">
            <path
                d="M999.722667 449.024C886.912 324.864 699.733333 193.621333 512 196.266667 324.266667 193.578667 137.088 324.906667 24.234667 449.024a94.336 94.336 0 0 0 0 125.781333C135.722667 697.642667 320.298667 827.733333 505.130667 827.733333h13.141333c185.472 0 369.962667-130.090667 481.578667-252.970666a94.293333 94.293333 0 0 0-0.128-125.738667zM315.733333 512a196.266667 196.266667 0 1 1 196.266667 196.266667A196.266667 196.266667 0 0 1 315.733333 512z"
                fill="#ffffff"></path>
            <path
                d="M512 512m-85.333333 0a85.333333 85.333333 0 1 0 170.666666 0 85.333333 85.333333 0 1 0-170.666666 0Z"
                fill="#ffffff"></path>
        </svg>
    </button>
}

export default ViewAnalysis;
