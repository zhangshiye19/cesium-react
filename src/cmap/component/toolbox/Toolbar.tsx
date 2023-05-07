import * as Cesium from 'cesium';
import React, {useEffect, useRef, useState} from "react";
import CMap from "@/cmap/CMap";
import './toolbar.module.css'
import ViewAnalysis from "@/cmap/component/toolbox/ViewAnalysis";
import Home from "@/cmap/component/toolbox/Home";
import styles from './toolbar.module.css';

const Toolbar = () => {

    const [toggled, setToggled] = useState(true);

    const [viewer, setViewer] = useState(CMap.getInstance().viewer);

    // let viewer = useRef<Cesium.Viewer>();

    useEffect(() => {
        // viewer.current = CMap.getInstance().viewer;
    }, [])

    const toggle = () => {
        setToggled(!toggled);
    };


    return <div className={styles['toolbar']}>
        <div className={styles['toggle-container']}
             style={{
                 maxHeight: toggled ? '0' : '500px'
                 // visibility: toggled ? 'hidden' : 'visible'
             }}
        >
            <ViewAnalysis/>
            <Home/>
        </div>

        <button
            className={`cesium-toolbar-button cesium-button ${styles['toolbar-button']} ${toggled ? styles['toggle-button'] : styles['toggle-button-expand']}`}
            // className={['cesium-toolbar-button', 'cesium-button', styles.toolbarButton, toggled ? styles.toggleButton : styles.toggleButtonExpand].join(' ')}
            onClick={toggle}
            title={"ToolBox"}
            type={'button'}
        >
            <svg className="cesium-svgPath-svg"
                 viewBox="0 0 1024 1024" version="1.1"
                 xmlns="http://www.w3.org/2000/svg"
                 width="200"
                 height="200"
            >
                <path
                    d="M493.504 558.144a31.904 31.904 0 0 0 45.28 0l308.352-308.352a31.968 31.968 0 1 0-45.248-45.248l-285.728 285.728-294.176-294.144a31.968 31.968 0 1 0-45.248 45.248l316.768 316.768z"
                    fill="#ffffff"></path>
                <path
                    d="M801.888 460.576l-285.728 285.728-294.144-294.144a31.968 31.968 0 1 0-45.248 45.248l316.768 316.768a31.904 31.904 0 0 0 45.28 0l308.352-308.352a32 32 0 1 0-45.28-45.248z"
                    fill="#ffffff"></path>
            </svg>
        </button>

    </div>
}

export default Toolbar;