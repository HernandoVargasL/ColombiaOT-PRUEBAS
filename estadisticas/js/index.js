var map;
var view;

var dptosLayer;
var mpiosLayer;

var chartDptos;
var chartMpios;

var chartDptosLoad = false;
var chartMpiosLoad = false;
var filterDptos = "00";

var dptoSelect = document.getElementById('filterDptos');

require([
    "esri/config",
    "esri/Map",
    "esri/views/MapView",
    "esri/Basemap",
    "esri/layers/MapImageLayer",
    "esri/layers/VectorTileLayer",
    "esri/layers/FeatureLayer",
    "esri/geometry/Extent",
    "esri/widgets/Home",
    "esri/widgets/FeatureTable",
    "esri/widgets/LayerList",
    "esri/widgets/Popup",
    "esri/core/reactiveUtils"],
    function (esriConfig, Map, MapView, Basemap, MapImageLayer, VectorTileLayer, FeatureLayer, Extent, Home, FeatureTable, LayerList, Popup, reactiveUtils) {

        // esriConfig.apiKey = "YOUR_API_KEY";

        const urlVectorTile = "https://tiles.arcgis.com/tiles/RVvWzU3lgJISqdke/arcgis/rest/services/Mapa_base_topografico/VectorTileServer/resources/styles/root.json";
        const urlLabels = "https://vgv.unidadvictimas.gov.co/server/rest/services/Divipola/Basemap/MapServer";
        const urlLimites = "https://mapas.igac.gov.co/server/rest/services/limites/limites/MapServer/0";
        const urlLayerDptos = "https://services1.arcgis.com/TKicqUbcJlrAatRF/ArcGIS/rest/services/Departamento/FeatureServer/0";
        const urlTableDptos = "https://services1.arcgis.com/TKicqUbcJlrAatRF/ArcGIS/rest/services/Colombia_OT/FeatureServer/7";
        const urlLayerMpios = "https://services1.arcgis.com/TKicqUbcJlrAatRF/ArcGIS/rest/services/Municipio/FeatureServer/0";
        const urlTableMpios = "https://services1.arcgis.com/TKicqUbcJlrAatRF/ArcGIS/rest/services/Colombia_OT/FeatureServer/8";

        const initialExtent = new Extent({
            xmin: -9288843.546729086,
            ymin: -517346.53258545103,
            xmax: -6427041.207732849,
            ymax: 1439441.3915145406,
            spatialReference: {
                wkid: 102100,
                latestWkid: 3857
            }
        });

        const defaultSym = {
            type: "simple-fill",
            outline: {
                color: [250, 250, 250, 0.2],
                width: "1.5px"
            }
        };

        const colorPorVencer = "#fc9220";
        const colorSinPOT = "#fff";
        const colorVencido = "#ed5050";
        const colorVigente = "#a6c736";
        const colorAreaNoMpio = "#aaa";

        const vencidoSym = {
            ...defaultSym,
            color: colorVencido
        };
        const vigenteSym = {
            ...defaultSym,
            color: colorVigente
        };
        const porVencerSym = {
            ...defaultSym,
            color: colorPorVencer
        };
        const porSinPOTSym = {
            ...defaultSym,
            color: colorSinPOT
        };
        const porAreaNoMpioSym = {
            ...defaultSym,
            color: colorAreaNoMpio
        };
        const otherSym = {
            ...defaultSym,
            color: "#000"
        };

        const estadisticasRenderer = {
            type: "unique-value",
            legendOptions: {
                title: "Estadísticas"
            },
            defaultSymbol: otherSym,
            defaultLabel: "Sin información",
            field: "ESTADO",

            uniqueValueInfos: [
                {
                    value: "VENCIDO",
                    symbol: vencidoSym,
                    label: "Vencido"
                },
                {
                    value: "VIGENTE",
                    symbol: vigenteSym,
                    label: "Vigente"
                },
                {
                    value: "POR VENCER",
                    symbol: porVencerSym,
                    label: "Por vencer"
                },
                {
                    value: "SIN POTs",
                    symbol: porSinPOTSym,
                    label: "Sin POT"
                },
                {
                    value: "ÁREA NO MUNICIPALIZADA",
                    symbol: porAreaNoMpioSym,
                    label: "Área no municipalizada"
                }
            ]
        };

        const templateDptos = {
            title: "{ESTADO} en {DEPARTAMEN}",
        };
        const templateMpios = {
            title: "{ESTADO} en {MUNICIPIO}, {DEPARTAMEN}",
        };

        let basemap = new Basemap({
            baseLayers: [
                new VectorTileLayer({
                    url: urlVectorTile
                })
            ],
            referenceLayers: [
                new MapImageLayer({
                    url: urlLabels
                })
            ],
            title: "basemap",
            id: "basemap"
        });

        map = new Map({
            basemap: basemap
        });

        view = new MapView({
            map: map,
            extent: initialExtent,
            navigation: {
                gamepad: {
                    enabled: false
                },
                browserTouchPanEnabled: false,
                momentumEnabled: false,
                mouseWheelZoomEnabled: false
            },
            container: "viewDiv",
            popup: new Popup({
                dockEnabled: true,
                dockOptions: {
                    // Disables the dock button from the popup
                    buttonEnabled: false,
                    // Ignore the default sizes that trigger responsive docking
                    breakpoint: false,
                    position: "top-center"
                },
                visibleElements: {
                    closeButton: true
                }
            }),
        });

        let homeButton = new Home({
            view: view
        });

        view.when(() => {
            const layerList = new LayerList({
                view: view,
                selectionEnabled: true
            });

            // Add widget to the top right corner of the view
            view.ui.add(layerList, "bottom-left");
        });

        view.ui.add(homeButton, "top-left");

        dptosLayer = new FeatureLayer({
            url: urlLayerDptos,
            id: "dptosLayer",
            renderer: estadisticasRenderer,
            popupTemplate: templateDptos,
            maxScale: 3000000,
            outFields: ["*"]
        });

        let limitesLayer = new FeatureLayer({
            url: urlLimites,
            minScale: 7500000,
            outFields: ["*"]
        });

        mpiosLayer = new FeatureLayer({
            url: urlLayerMpios,
            id: "mpiosLayer",
            renderer: estadisticasRenderer,
            popupTemplate: templateMpios,
            // minScale: 3000000,
            outFields: ["*"]
        });

        map.add(dptosLayer);
        map.add(mpiosLayer);
        map.add(limitesLayer);

        const dptosTable = new FeatureLayer({
            url: urlTableDptos,
            outFields: ["DEPARTAMENTO", "VIGENTE", "POR_VENCER", "VENCIDO"]
        });

        view.whenLayerView(dptosLayer).then((layerView) => {
            reactiveUtils.when(
                () => !layerView.updating,
                () => {
                    if (!chartDptosLoad) {
                        queryLayerViewStats(layerView).then(function (newData) {
                            updateChartDptos(newData);
                            console.log(newData);
                        });
                        chartDptosLoad = true;
                        
                        layerView.queryFeatures().then(function(results){                            
                            const dptoArray = [];
                            results.features.forEach(element => {
                                dptoArray.push({
                                    nombre: element.attributes.DEPARTAMEN,
                                    valor: element.attributes.DPTO_CCDGO
                                })
                            });

                            dptoArray.sort((a, b) => {
                                return a.nombre == b.nombre ? 0 : a.nombre < b.nombre ? -1 : 1;
                            })

                            dptoArray.forEach(element => {
                                const option = document.createElement("option");
                                option.text = element.nombre;
                                option.value = element.valor;
                                dptoSelect.appendChild(option);                                
                            });
                            
                            const option = document.createElement("option");
                            option.text = "Todos los departamentos";
                            option.value = "00";                            
                            dptoSelect.prepend(option)
                            dptoSelect.value = "00";

                        });
                    }
                }
            );
        });

        view.whenLayerView(mpiosLayer).then((layerView) => {
            reactiveUtils.when(
                () => !layerView.updating,
                () => {

                    if (!chartMpiosLoad) {
                        queryLayerViewStats(layerView).then(function (newData) {
                            updateChartMpios(newData);
                            console.log(newData);
                        });
                        chartMpiosLoad = true;
                    }
                }
            );
        });

        view.on("pointer-move", function (event) {
            view.hitTest(event).then(function (response) {
                if (response.results.length) {
                    var arrGraphic = response.results.filter(function (result) {
                        return result.graphic.layer === dptosLayer || result.graphic.layer === mpiosLayer;
                    });

                    if (arrGraphic.length > 0) {
                        graphic = arrGraphic[0].graphic;

                        if (view.popup.features)

                            view.popup.open({
                                location: graphic.geometry.centroid,
                                features: [graphic]
                            });
                    }
                    // else {
                    //     view.popup.close();
                    // }

                } else {
                    view.popup.close();
                }
            });
        });


        dptoSelect.addEventListener('change', function() {
            console.log('You selected: ', this.value);
            filterDptos = this.value;
            const layerView = view.layerViews.filter((item) => {
                return item.layer.id == "mpiosLayer"
            }).items[0];
            console.log(layerView.layer.id);
            queryLayerViewStats(layerView).then(function (newData) {
                updateChartMpios(newData);
                console.log(newData);
            });
          });

        const featureTable = new FeatureTable({
            view: view, // Required for feature highlight to work
            layer: dptosTable,
            visibleElements: {
                // Autocast to VisibleElements
                menuItems: {
                    clearSelection: true,
                    refreshData: true,
                    toggleColumns: true,
                    selectedRecordsShowAllToggle: true,
                    selectedRecordsShowSelectedToggle: true,
                    zoomToSelection: true
                }
            },
            tableTemplate: {
                // Autocast to TableTemplate
                columnTemplates: [
                    // Takes an array of FieldColumnTemplate and GroupColumnTemplate
                    {
                        // Autocast to FieldColumnTemplate.
                        type: "field",
                        fieldName: "DEPARTAMENTO_",
                        label: "Departamento",
                        direction: "asc"
                    },
                    {
                        type: "field",
                        fieldName: "VIGENTE",
                        label: "Vigente"
                    },
                    {
                        type: "field",
                        fieldName: "POR_VENCER",
                        label: "Por vencer"
                    },
                    {
                        type: "field",
                        fieldName: "VENCIDO",
                        label: "Vencidos"
                    },
                    {
                        type: "field",
                        fieldName: "ESTADO",
                        label: "Estado del departamento"
                    }
                ]
            },
            container: document.getElementById("tableDiv")
        });

        function queryLayerViewStats(layerView) {
            let statisticts = [{
                onStatisticField: "ESTADO",
                outStatisticFieldName: "TOTAL",
                statisticType: "count"
            }]

            const query = layerView.layer.createQuery();
            query.outStatistics = statisticts;
            query.groupByFieldsForStatistics = "ESTADO";
            query.orderByFields = "ESTADO";

            if (filterDptos != "00") {
                query.where = "DPTO_CCDGO = '" + filterDptos + "'";
            }

            console.log(layerView.layer.id);

            return layerView.queryFeatures(query).then(function (response) {
                let resultados = [], total = 0, titulos = [];
                response.features.forEach(element => {
                    titulos.push(element.attributes.ESTADO);
                    resultados.push(element.attributes.TOTAL);
                    total += element.attributes.TOTAL;
                });

                return {
                    total: total,
                    keys: titulos,
                    values: resultados
                };

                return resultados;
            })
        }

        let totalCountDptos, totalCountMpios;

        function updateChartDptos(response) {
            totalCountDptos = response.total;
            const title = numberWithCommas(totalCountDptos) + " departamentos";

            const ctx = document.getElementById('dptosChart');
            Chart.defaults.color = '#fff';

            if (!chartDptos) {
                chartDptos = new Chart(ctx, {
                    type: "doughnut",
                    data: {
                        labels: response.keys,
                        datasets: [
                            {
                                label: "Cantidad",
                                backgroundColor: [
                                    colorPorVencer,
                                    colorVencido,
                                    colorVigente,
                                ],
                                borderColor: "rgb(255, 255, 255)",
                                borderWidth: 1,
                                data: response.values
                            }
                        ]
                    },
                    options: {
                        responsive: false,
                        cutoutPercentage: 35,
                        legend: {
                            position: "bottom"
                        },
                        title: {
                            display: true,
                            text: title
                        },
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    label: function (context) {
                                        const value = context.parsed;
                                        const percentage =
                                            totalCountDptos > 0
                                                ? Math.round((context.parsed / totalCountDptos) * 100)
                                                : 0;
                                        return numberWithCommas(value) + " (" + percentage + "%)";
                                    }
                                }
                            },
                        }
                    }
                });
            } else {
                chartDptos.options.title.text = title;
                chartDptos.data.datasets[0].data = response.values;
                chartDptos.update();
            }
        }

        function updateChartMpios(response) {
            totalCountMpios = response.total;
            const title = numberWithCommas(totalCountMpios) + " municipios";

            const ctx = document.getElementById('mpiosChart');
            Chart.defaults.color = '#fff';

            if (!chartMpios) {
                chartMpios = new Chart(ctx, {
                    type: "doughnut",
                    data: {
                        labels: response.keys,
                        datasets: [
                            {
                                label: "Cantidad",
                                backgroundColor: [
                                    colorPorVencer,
                                    colorSinPOT,
                                    colorVencido,
                                    colorVigente,
                                    colorAreaNoMpio,
                                ],
                                borderColor: "rgb(255, 255, 255)",
                                borderWidth: 1,
                                data: response.values
                            }
                        ]
                    },
                    options: {
                        responsive: false,
                        cutoutPercentage: 35,
                        legend: {
                            position: "bottom"
                        },
                        title: {
                            display: true,
                            text: title
                        },
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    label: function (context) {
                                        const value = context.parsed;
                                        const percentage =
                                            totalCountMpios > 0
                                                ? Math.round((context.parsed / totalCountMpios) * 100)
                                                : 0;
                                        return numberWithCommas(value) + " (" + percentage + "%)";
                                    }
                                }
                            },
                        }
                    }
                });
            } else {
                chartMpios.options.title.text = title;
                chartMpios.data.datasets[0].data = response.values;
                chartMpios.update();
            }
        }

        function numberWithCommas(value) {
            value = value || 0;
            return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
    });