import * as Cesium from 'cesium';


export default class CMap {
    private viewer_: Cesium.Viewer;

    private static instance: CMap;

    static getInstance() {
        if (!this.instance) {
            this.instance = new CMap();
        }
        return this.instance;
    }

    constructor() {
        // this.token = 'fbb3d591b56170206085f43c4d83e37d';
        Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4ZWZlNWQ1Ni1jMzY2LTRmODAtYTNhZi0yOGYxMzAwNjZhYTIiLCJpZCI6MTAxNDIxLCJpYXQiOjE2NTc5Mzk5MjJ9.3tNio4pc5M8jcFB_TnVu0yKLy2k8vazv0VSxwgSjRN4';
        this.viewer_ = new Cesium.Viewer('cesiumContainer', {
            animation: false,   // 动画控制控件
            shouldAnimate: true,
            homeButton: true,
            geocoder: true,
            // baseLayerPicker: false,
            timeline: false,
            fullscreenButton: true,
            sceneModePicker: true,
            infoBox: false,
            navigationHelpButton: false,
            navigationInstructionsInitiallyVisible: false,
            selectionIndicator: false,

            // imageryProvider: new Cesium.WebMapTileServiceImageryProvider({
            //     url:
            //         "//192.166.26.10:8080/geoserver/gwc/service/wmts?layer=world_vec&tilematrixset={TileMatrixSet}&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fpng&TileMatrix={TileMatrixSet}:{TileMatrix}&TileCol={TileCol}&TileRow={TileRow}",
            //     layer: "world_img",
            //     style: "",
            //     format: "image/png",
            //     tileMatrixSetID: "EPSG:900913"
            // })
            // bottomContainer: false,
            // creditContainer: '',    // 版权显示
            // terrainProvider: new Cesium.ArcGISTiledElevationTerrainProvider({
            //     url: 'https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer',
            //     token: 'KED1aF_I4UzXOHy3BnhwyBHU4l5oY6rO6walkmHoYqGp4XyIWUd5YZUC1ZrLAzvV40pR6gBXQayh0eFA8m6vPg'
            // }),
            //高德
            // imageryProvider: new Cesium.UrlTemplateImageryProvider({
            //     url: "https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
            //     minimumLevel: 3,
            //     maximumLevel: 18
            // }),

            //ArcGis
            // imageryProvider: new Cesium.ArcGisMapServerImageryProvider({
            //     url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
            // })
            // 无效
            // imageryProvider: {
            //     url: `http://t0.tianditu.gov.cn/img_w/wmts?tk=${this.tk}`,
            //     subdomains: ['0','1','2','3','4','5','6','7'],
            //     layer: 'tdImageLayer',
            //     style: 'default',
            //     format: 'image/jpeg',
            //     tileMatrixSetID: 'tileMatrixSetID',
            //     show: true
            // }
        });
        // 高德注记
        // this.viewer_.imageryLayers.addImageryProvider(new Cesium.UrlTemplateImageryProvider({
        //     url: "http://webst02.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8",
        //     minimumLevel: 3,
        //     maximumLevel: 18
        // }));
        // 高德矢量
        // this.viewer_.imageryLayers.addImageryProvider(new Cesium.UrlTemplateImageryProvider({
        //     url: "http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
        //     minimumLevel: 3,
        //     maximumLevel: 18
        // }))
        // this.viewer_.imageryLayers.addImageryProvider(new Cesium.WebMapTileServiceImageryProvider({
        //     // 影像注记
        //     url: 'http://t{s}.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=' + this.token,
        //     subdomains: this.subdomains,
        //     layer: 'tdtCiaLayer',
        //     style: 'default',
        //     format: 'image/jpeg',
        //     tileMatrixSetID: 'GoogleMapsCompatible',
        //     show: true
        //   }))
        // this.viewer_.imageryLayers.addImageryProvider(new Cesium.WebMapTileServiceImageryProvider({
        //     url: `http://t0.tianditu.gov.cn/cia_w/wmts?tk=${this.tk}`,
        //     subdomains: ['0','1','2','3','4','5','6','7'],
        //     layer: 'tdImageLayer',
        //     style: 'default',
        //     format: 'image/jpeg',
        //     tileMatrixSetID: 'tileMatrixSetID',
        //     show: true
        // }))
        //ArcGIS 街道图
        // this.viewer_.imageryLayers.addImageryProvider(new Cesium.ArcGisMapServerImageryProvider({
        //     url: "http://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer",
        // }))
        //ArcGIS 蓝色图
        // this.viewer_.imageryLayers.addImageryProvider(new Cesium.UrlTemplateImageryProvider({
        //     url: "https://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}",
        // }))
        // 去除底部的ion标记
        (this.viewer_.cesiumWidget.creditContainer as HTMLElement).style.display = "none";
        // UTC时间+8校准
        this.viewer_.clock.currentTime = Cesium.JulianDate.addHours(this.viewer_.clock.currentTime, 8, new Cesium.JulianDate());

        // 地形高度检测
        this.viewer_.scene.globe.depthTestAgainstTerrain = true;
        this.viewer_.terrainShadows = Cesium.ShadowMode.ENABLED;

        // 默认飞回中国
        Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(90,-20,110,90);

        // Cesium 1.107
        Cesium.createWorldTerrainAsync({
            requestWaterMask: true, // 请求水体效果所需要的海岸线数据
            requestVertexNormals: true, // 请求地形照明数据
        }).then(terrainProvider => {
            this.viewer_.terrainProvider = terrainProvider;
        })
    }

    get viewer() {
        return this.viewer_;
    }

    set viewer(viewer_) {
        this.viewer_ = viewer_;
    }
}