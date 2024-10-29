var map;
var viewMap;
var esri;

var homeBtn;
var overviewMap;
var scalebar;
var legend;
var basemap_gallery;
var printer;
var default_extent;
var homeBtn;
var locateBtn;
var zoomBtn;
var resizeCenter;
var loading;

var coordsLayer;
var pointMarker;

var popup;
var hoverHandle;
var updateHandle;

var defaultAlertTimer = 3000;

var currentUser;
var currentAccessToken;
var firebase_ui;
var currentBasemap;
var currentScreen;
var currentEstado = "init";
var currentSearch = "all";
var firstExpand = true;
var firstParameters = true;
var firstSearch = true;

var cacheUnidadesFiltro = [];
var activeLayers = [];
var currentServicio;

var areaLayer;
var geojsonLayer;
var modoSearch = "entidad";

var editTool;
var drawTool2;
var editTool2;
var activeTool;

var print_service = "https://mapas.igac.gov.co/server/rest/services/otros/serviciodeimpresion/GPServer/Export%20Web%20Map";

var web_service = "https://serviciosgeovisor.igac.gov.co:8080/Geovisor";
var web_service_proxy = "https://serviciosgeovisor.igac.gov.co:8080/Geovisor";

var tableSearchBni;
var tableSearchBni2;

var searchCurrent = null;
var cacheUnidades = [];
var cacheEntidades = [];

var currentImagenInicial;
var extentInicial;

var searchImagenSymbol;
var searchImagenActiveSymbol;
var searchCoberturaSymbol;

var currentImagen;

var currentOperacionGeo1;
var currentOperacionGeo2;
var operadoresLayer;

$(document).ready(function () {
   
    initMap();
    toggleMenu(currentEstado);
    var config = {
        apiKey: "AIzaSyCLSp_Qbaohj8owxrpZxvrmxUSkVw0ukig",
        authDomain: "geovisor-igac.firebaseapp.com"
    };
    firebase.initializeApp(config);
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            currentUser = user;
            $("#loginContainer").hide();
            $("#logoutContainer").show();
            $("#userName,#userName2").html(user.displayName);
            if (user.photoURL != null) {
                if (user.photoURL != "") {
                    $("#userPhoto,#userPhoto2").attr("src", user.photoURL);
                } else {
                    $("#userPhoto,#userPhoto2").attr("src", "/images/iconos/User.png");
                }
            } else {
                $("#userPhoto,#userPhoto2").attr("src", "/images/iconos/User.png");
            }
            currentUser.getIdToken().then(function (accessToken) {
                currentAccessToken = accessToken;
                var params = "";
                $.ajax({
                    url: web_service + "/config?cmd=config_imagenes&t=" + (new Date()).getTime() + params,
                    type: 'POST',
                    success: function (data) {
                        if (data.status) {
                            initData(data);
                            $("#panelSearch").show();
                            toggleMenu("small");
                        }
                    },
                    timeout: 20000,
                    error: function (err) {
                        console.error(err);
                    }
                });
            });
        } else {
            currentUser = null;
            currentFuncionalidades = [];
            $("#logoutContainer").hide();
            $("#loginContainer").show();
            $("#userName,#userName2").html("Iniciar sesion");
            $("#userPhoto,#userPhoto2").attr("src", "/images/iconos/User.png");
            gotoLogin();
        }
    }, function (error) {
        console.log(error);
    });
    firebase_ui = new firebaseui.auth.AuthUI(firebase.auth());
    $('[data-toggle="tooltip"]').tooltip();
    $.fn.DataTable.ext.pager.numbers_length = 5;
});

function defaultUserPhoto() {
    $("#userPhoto,#userPhoto2").attr("src", "/images/iconos/User.png");
}

function signIn() {
    $("#logoutContainer").hide();
    $("#loginContainer").show();

    var uiConfig = {
        callbacks: {
            signInSuccess: function (_currentUser, _credential, _redirectUrl) {
                closeLogin();
                return false;
            }
        },
        signInOptions: [{
            provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            scopes: [
                'https://www.googleapis.com/auth/plus.login'
            ],
            customParameters: {
                prompt: 'select_account'
            }
        },
        {
            provider: firebase.auth.FacebookAuthProvider.PROVIDER_ID,
            scopes: [
                'public_profile',
                'email'
            ],
            customParameters: {
                auth_type: 'reauthenticate'
            }
            },
            {
                provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
                requireDisplayName: true
            },
            'apple.com',
            'microsoft.com',
            'yahoo.com',
        ],
        credentialHelper: firebaseui.auth.CredentialHelper.NONE,
        signInFlow: "popup"
    };

    firebase_ui.start('#authContainer', uiConfig);
}

function signOut() {
    firebase.auth().signOut();
    $("#logoutContainer").hide();
    $("#loginContainer").show();
    currentUser = null;
    currentFuncionalidades = [];
    closeLogin();
}

function validate() {

}

function toggleMain(tipo) {
    modoSearch = tipo;
    $("#searchHeaderEntidad,#searchHeaderArea,#searchHeaderGeoJSON").removeClass("active");
    $("#searchHeaderEntidadDiv,#searchHeaderAreaDiv,#searchHeaderGeoJSONDiv").hide();    
    if (tipo == "entidad") {
        $("#searchHeaderEntidad").addClass("active");
        $("#searchHeaderEntidadDiv").show();        
        areaLayer.setVisibility(false);
        fileLayer.setVisibility(false);
    }
    if (tipo == "area") {
        $("#searchHeaderArea").addClass("active");
        $("#searchHeaderAreaDiv").show();
        areaLayer.setVisibility(true);
        fileLayer.setVisibility(false);
    }
    if (tipo == "geojson") {
        $("#searchHeaderGeoJSON").addClass("active");
        $("#searchHeaderGeoJSONDiv").show();
        areaLayer.setVisibility(false);
        fileLayer.setVisibility(true);
    }
}

function minAllMain() {
    $("#panelSearch").hide();
    $("#headingSearch").hide();
    $("#mainHeading li").removeClass("active");
    closeSearch();
}

function minAll() {
    $("#panelLogin").hide();
    $("#panelInfo").hide();
    $("#panelLayers").hide();
    $("#panelCoordenadas").hide();
    $("#panelImprimir").hide();
    closeLayers();
    closeCoordenadas();
    closeDibujar();
    toggleTools(false);
    toggleInfoTools(false);
}

function toggleTools(param) {
    if (param == null) {
        if ($("#toolsDiv").is(":visible")) {
            param = false;
        } else {
            param = true;
        }
    }
    if (param) {
        minAll();
        $("#toolsDiv").show();
        $("#toolBtn").css("background-image", "url(/images/iconos/Tool_Close.png)");
        reporteUso("Abrir herramientas");
    } else {
        $("#toolsDiv").hide();
        $("#toolBtn").css("background-image", "url(/images/iconos/Tool.png)");
    }
    $("#toolBtn").tooltip('hide');
}

function toggleInfoTools(param) {
    if (param == null) {
        if ($("#infoToolDiv").is(":visible")) {
            param = false;
        } else {
            param = true;
        }
    }
    if (param) {
        minAll();
        $("#infoToolDiv").show();
        $("#infoToolBtn").css("background-image", "url(/images/iconos/Tool_Close.png)");
    } else {
        $("#infoToolDiv").hide();
        $("#infoToolBtn").css("background-image", "url(/images/iconos/informacion_adicional.png)");
    }
    $("#infoToolBtn").tooltip('hide');
}

function toggleFiltros(param) {
    if (param == null) {
        if ($("#searchBody").is(":visible")) {
            param = "small";
        } else {
            param = "large"
        }
    }
    if (param == "small") {
        $("#panelSearchToggle").html("<img src='/images/iconos/Open_01.png' alt='Minimizar' style='width: 10px; height: 10px;' />");
        $("#searchBody").hide();
    }
    if (param == "large") {
        $("#panelSearchToggle").html("<img src='/images/iconos/Close_01.png' alt='Minimizar' style='width: 10px; height: 2px;' />");
        $("#searchBody").show();
    }
}

function toggleMenu(param) {
    if (param == null) {
        if ($("#mainDiv").hasClass("main-small")) {
            param = "large";
        } else {
            param = "small";
        }
    }
    if (param == "large") {
        if ($(window).width() <= 768) {
            param = "small";
        } else {
            $("#mainDiv").removeClass("main-small");
            $("#mainDiv").addClass("main-large");
            $("#mapViewDiv,#tableViewDiv").removeClass("main-small-map");
            $("#mapViewDiv,#tableViewDiv").addClass("main-large-map");
            $("#headingSearch img").attr("src", "/images/iconos/Back_02.png");
            $(".item-heading").removeClass("small-heading");
            $(".item-heading").addClass("large-heading");
            $("#menuItem").removeClass("small-heading");
            $("#menuItem").addClass("large-heading");
            toggleFiltros(param);
        }
    }
    if (param == "small") {
        $("#mainDiv").removeClass("main-large");
        $("#mainDiv").addClass("main-small");
        $("#mapViewDiv,#tableViewDiv").removeClass("main-large-map");
        $("#mapViewDiv,#tableViewDiv").addClass("main-small-map");
        $("#headingSearch img").attr("src", "/images/iconos/Forward_02.png");
        $(".item-heading").removeClass("large-heading");
        $(".item-heading").addClass("small-heading");
        $("#menuItem").removeClass("large-heading");
        $("#menuItem").addClass("small-heading");
        toggleFiltros(param);
    }
    if (param == "init") {
        $("#mainDiv").removeClass("main-large");
        $("#mainDiv").addClass("main-small");
        $("#mapViewDiv,#tableViewDiv").removeClass("main-large-map");
        $("#mapViewDiv,#tableViewDiv").addClass("main-small-map");
        $("#headingSearch img").attr("src", "/images/iconos/Forward_02.png");
        $(".item-heading").removeClass("large-heading");
        $(".item-heading").addClass("small-heading");
        $("#menuItem").removeClass("large-heading");
        $("#menuItem").addClass("small-heading");
        param = "small";
    }
    currentEstado = param;
    if (map != null) {
        //map.reposition();
       // map.resize();
    }
}

function gotoLogin() {
    minAll();
    if (currentUser == null) {
        signIn();
    } else {
        $("#loginContainer").hide();
        $("#logoutContainer").show();
    }
    $("#panelLogin").show();
}

function closeLogin() {
    $("#panelLogin").hide();
}

function hideAllSearch() {
    $("#mainDiv").animate({ scrollTop: 0 });
    $(".panelSearchFiltro").hide();
}

function centrarImagen() {
    /* if (searchGraphicsLayerDetalle.graphics.length > 0) {
        map.setExtent(esri.graphicsUtils.graphicsExtent(searchGraphicsLayerDetalle.graphics).expand(4));
    } */
}

function centrarImagenes() {
   /*  if (firstSearch) {
        firstSearch = false;
        return;
    }
    if (searchGraphicsLayer.visible) {
        if (searchGraphicsLayer.graphics.length > 0) {
            map.setExtent(esri.graphicsUtils.graphicsExtent(searchGraphicsLayer.graphics).expand(4));
        }
    } */
}

function gotoSearchUnidad(id) {
    $("#searchFiltro").val(id);
    $("#searchFiltro").trigger("change");
}



//Se mostraran las coordenadas del cursor en viewCursorCoordinates(), revisar, confirmar y BORRAR
/* function updateCoordenada(evt) {
    try {
        var to = sistemasCoordenadas[$("#querySearchConsultaFormat").val()].proj;
        var from = sistemasCoordenadas["EPSG:3857"].proj;
        var reprojectedCoordsNew = proj4(from, to, [evt.mapPoint.x, evt.mapPoint.y]);
        var coordTextX;
        var coordTextY;
        var labelLatitud = sistemasCoordenadas[$("#querySearchConsultaFormat").val()].labLat;
        var labelLongitud = sistemasCoordenadas[$("#querySearchConsultaFormat").val()].labLng;
        if ($("#querySearchConsultaFormat").val() == "EPSG:4326") {
            coordTextY = reprojectedCoordsNew[1].toFixed(6);
            coordTextX = reprojectedCoordsNew[0].toFixed(6);
        }
        if ($("#querySearchConsultaFormat").val() == "EPSG:4686") {
            coordTextY = reprojectedCoordsNew[1].toFixed(6);
            coordTextX = reprojectedCoordsNew[0].toFixed(6);
        }
        if ($("#querySearchConsultaFormat").val() == "EPSG:3857") {
            coordTextY = parseFloat(evt.mapPoint.y.toFixed(4)).toLocaleString('es');
            coordTextX = parseFloat(evt.mapPoint.x.toFixed(4)).toLocaleString('es');
        }
        if ($("#querySearchConsultaFormat").val() == "EPSG:9377") {
            coordTextY = reprojectedCoordsNew[1].toFixed(6);
            coordTextX = reprojectedCoordsNew[0].toFixed(6);
        }
        if (($("#querySearchConsultaFormat").val() == "EPSG:3114") ||
            ($("#querySearchConsultaFormat").val() == "EPSG:3115") ||
            ($("#querySearchConsultaFormat").val() == "EPSG:3116") ||
            ($("#querySearchConsultaFormat").val() == "EPSG:3117") ||
            ($("#querySearchConsultaFormat").val() == "EPSG:3118")) {
            coordTextY = parseFloat(reprojectedCoordsNew[1].toFixed(4)).toLocaleString('es');
            coordTextX = parseFloat(reprojectedCoordsNew[0].toFixed(4)).toLocaleString('es');
        }
        if (($("#querySearchConsultaFormat").val() == "EPSG:32617") ||
            ($("#querySearchConsultaFormat").val() == "EPSG:32618") ||
            ($("#querySearchConsultaFormat").val() == "EPSG:32619") ||
            ($("#querySearchConsultaFormat").val() == "EPSG:32717") ||
            ($("#querySearchConsultaFormat").val() == "EPSG:32718") ||
            ($("#querySearchConsultaFormat").val() == "EPSG:32719")) {
            coordTextY = parseFloat(reprojectedCoordsNew[1].toFixed(4)).toLocaleString('es');
            coordTextX = parseFloat(reprojectedCoordsNew[0].toFixed(4)).toLocaleString('es');
        }
        $("#resultadoConsultaCoordenadasY").html(labelLongitud + ":&nbsp;" + coordTextX);
        $("#resultadoConsultaCoordenadasX").html(labelLatitud + ":&nbsp;" + coordTextY);

        var labelLatitudSM;
        if (labelLatitud == "Norte (m)") {
            labelLatitudSM = "N: ";
        }
        if (labelLatitud == "Latitud (N)") {
            labelLatitudSM = "N: ";
        }
        var labelLongitudSM;
        if (labelLongitud == "Este (m)") {
            labelLongitudSM = "E: ";
        }
        if (labelLongitud == "Longitud (W)") {
            labelLongitudSM = "W: ";
        }
        $("#coordinatesDiv").html(labelLatitudSM + coordTextY + ", " + labelLongitudSM + coordTextX + " (" + $("#querySearchConsultaFormat").val() + ")");
    } catch (err) {

    }
} */

function gotoCoordenadas() {
    currentScreen = "coordenadas";
    reporteUso("Abrir coordenadas");
    toggleMenu("small");
    minAll();
    $("#panelCoordenadas").show();
}

function buscarCoordenada() {
    /* coordsLayer.clear();
    map.infoWindow.hide();

    try {
        var strLatitud = replaceAll(replaceAll(replaceAll($("#querySearchCoordinateLatitud").val(), ", ", " "), ",", "."), "  ", " ").trim();
        var strLongitud = replaceAll(replaceAll(replaceAll($("#querySearchCoordinateLongitud").val(), ", ", " "), ",", "."), "  ", " ").trim();

        if (strLatitud != "" && strLongitud != "") {
            var lat = parseFloat(strLatitud);
            var lng = parseFloat(strLongitud);

            var to = sistemasCoordenadas["EPSG:4326"].proj;
            var from = sistemasCoordenadas[$("#querySearchCoordinateFormat").val()].proj;
            var reprojectedCoordsNew = proj4(from, to, [lng, lat]);

            lat = reprojectedCoordsNew[1];
            lng = reprojectedCoordsNew[0];

            var pst = esri.webMercatorUtils.geographicToWebMercator(new esri.Point({
                x: lng,
                y: lat,
                spatialReference: {
                    wkid: 4686
                }
            }));
            coordsLayer.add(new esri.Graphic(pst, pointMarker, {
                "Latitud": lat,
                "Longitud": lng,
                "Coordenadas": $("#querySearchCoordinateFormat :selected").text()
            }));
            map.centerAndZoom(esri.graphicsUtils.graphicsExtent(coordsLayer.graphics).getCenter(), 14);
        }

    } catch (err) {

    } */
}


function closeCoordenadas() {
    if (coordsLayer != null) {
        coordsLayer.clear();
    }
    $("#panelCoordenadas").hide();
}


function gotoDibujar() {
    currentScreen = "dibujar";
    reporteUso("Abrir dibujo y medición");
    toggleMenu("small");
    minAll();
    $("#panelDibujar").show();
    toggleDibujoPunto();
}

function closeDibujar() {
    if (map != null) {
        //map.enableMapNavigation();
        if (drawTool != null) {
            drawTool.deactivate();
        }
        if (editTool != null) {
            editTool.deactivate();
        }
    }
    $("#panelDibujar").hide();
}






function gotoImprimir() {
    currentScreen = "imprimir";
    reporteUso("Abrir imprimir");
    toggleMenu("small");
    minAll();
    $("#panelImprimir").show();
}

function closeImprimir() {
    $("#panelImprimir").hide();
}

function printMap() {
    showLoading("Preparando impresi&oacute;n", "loading", "gold", false);
    printer.printMap({
        layout: $("#selectPrintTemplate").val(),
        format: $("#selectPrintFormat").val(),
        preserveScale: false,
        layoutOptions: {
            scalebarUnit: "Kilometers",
            titleText: $("#printTitle").val()
        },
        exportOptions: {
            width: $(window).width(),
            height: $(window).height(),
            dpi: $("#selectPrintDPI").val()
        }
    });
}









function reporteUso(funcionalidad, parametro) {
    /*
    if (parametro == null) {
        try {
            gtag('event', funcionalidad, {
                'send_to': 'G-7RHX7BC8DP',
                'event_category': funcionalidad
            });
        } catch (err) {
            console.log(err);
        }
        return;
    }
    var value = null;
    if (parametro.unidad != null) {
        value = parametro.unidad;
    }
    if (parametro.tematica != null) {
        value = parametro.tematica;
    }
    if (parametro.estacion != null) {
        value = parametro.estacion;
    }
    if (parametro.imagen != null) {
        value = parametro.imagen;
    }
    if (parametro.carto != null) {
        value = parametro.carto;
    }
    if (parametro.servicio != null) {
        value = parametro.servicio;
    }
    if (parametro.plancha != null) {
        value = parametro.plancha;
    }

    try {
        gtag('event', funcionalidad, {
            'send_to': 'G-7RHX7BC8DP',
            'event_category': funcionalidad,
            'event_action': parametro.action,
            'event_label': value,
        });
    } catch (err) {

    }
    */
}

function closeLoading() {
    $("#alertList").hide();
}

function showLoading(text, imagen, color, autohide) {
    $("#alertContent").html(text);
    if (imagen == null) {
        $("#alertContentLeft").hide();
    } else {
        if (imagen == "loading") {
            $("#alertContentLeft img").attr("src", "/images/iconos/clock-face-three-oclock_1f552.png");
        }
        if (imagen == "ok") {
            $("#alertContentLeft img").attr("src", "/images/iconos/thumbs-up-sign_1f44d.png");
        }
        if (imagen == "error") {
            $("#alertContentLeft img").attr("src", "/images/iconos/smiling-face-with-smiling-eyes-and-hand-covering-mouth_1f92d.png");
        }
        $("#alertContentLeft").show();
    }
    $("#alertHeader").css("background-color", color);
    if (autohide) {
        setTimeout(function () { closeLoading(); }, defaultAlertTimer);
    }
    $("#alertList").show();
}

function checkURL(url, mostrarAlerta) {
    var pattern = new RegExp("((http|https)(:\/\/))?([a-zA-Z0-9]+[.]{1}){2}[a-zA-z0-9]+(\/{1}[a-zA-Z0-9]+)*\/?", "i");
    if (pattern.test(url)) {
        return true;
    } else {
        if (mostrarAlerta) {
            showLoading("La URL ingresada no es valida", null, "red", true);
        }
        return false;
    }
}

var origenNacional;

 function initMap() {
     require([
        "esri/Map",
        "esri/views/MapView",
        "esri/geometry/Extent",
        "esri/Basemap",
        "esri/layers/VectorTileLayer",
        "esri/intl",
        "esri/geometry/SpatialReference",
      ], (Map, MapView, Extent, Basemap, VectorTileLayer, intl, SpatialReference) => {
        intl.setLocale("es");

        origenNacional = new SpatialReference({
wkid: 9377,
latestWkid: 9377,
wkt: 'PROJCS["MAGNA-SIRGAS / Origen-Nacional",GEOGCS["MAGNA-SIRGAS",DATUM["Marco_Geocentrico_Nacional_de_Referencia",SPHEROID["GRS 1980",6378137,298.257222101,AUTHORITY["EPSG","7019"]],TOWGS84[0,0,0,0,0,0,0],AUTHORITY["EPSG","6686"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4686"]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",4.0],PARAMETER["central_meridian",-73.0],PARAMETER["scale_factor",0.9992],PARAMETER["false_easting",5000000],PARAMETER["false_northing",2000000],UNIT["metre",1,AUTHORITY["EPSG","9001"]],AUTHORITY["EPSG","9377"]]'
});

        default_extent = new Extent({
            xmin: -86.25559680664145, 
            ymin: -4.496767298712775, 
            xmax: -62.239483525397816, 
            ymax: 14.437589074108095,
        spatialReference: {
            wkid: 4326
        }
        });

        map = new Map({
           basemap: new Basemap({
            baseLayers: [
              new VectorTileLayer({
                url: "https://tiles.arcgis.com/tiles/RVvWzU3lgJISqdke/arcgis/rest/services/Mapa_base_topografico/VectorTileServer",
              }),
            ],
            title: "Mapa Topográfico Colombia",
            id: 'igac',
          }), 
        });
        viewMap = new MapView({
          container: "mapViewDiv",
          map: map,
          constraints: {
            maxZoom: 19,
            minZoom: 4,
          },
          extent: default_extent,
          
        });
viewMap.ui.remove(["zoom", "attribution"]);
        createNavigationButtons();
        viewCursorCoordinates();
      });
}

function createNavigationButtons(){
    viewMap.ui.add("locateButton", "manual");
    viewMap.ui.add("homeButton", "manual");
    viewMap.ui.add("zoomBox", "manual");
    viewMap.ui.add("scaleBar", "manual");
    viewMap.ui.add("attributionIGAC", "manual");
    viewMap.ui.add("coordinatesDiv", "manual");
    require([
    "esri/widgets/Locate", "esri/widgets/Home", "esri/widgets/Zoom", "esri/widgets/ScaleBar", "esri/widgets/Attribution"], (Locate, Home, Zoom, ScaleBar, Attribution) => {
        
        locateBtn = new Locate({
        view: viewMap,
        scale: 25000,
        });

        homeBtn = new Home({
        view: viewMap,
        viewpoint: viewMap.viewpoint
        });

        zoomBtn = new Zoom({
        view: viewMap,
        });

        let scaleBar = new ScaleBar({
            view: viewMap,
            unit: "metric",
            container: "scaleBar"
          });

        let attribution = new Attribution({
            view: viewMap,
            container: "attributionIGAC"
        });
        
    });

    
}

function viewCursorCoordinates(){

    viewMap.on("pointer-move", function(event) {
        var screenPoint = {
            x: event.x,
            y: event.y
        };
    
        var mapPoint = viewMap.toMap(screenPoint);
        proj4.defs("ESRI:102100","+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs +type=crs");
        proj4.defs("EPSG:9377", "+proj=tmerc +lat_0=4.0 +lon_0=-73.0 +k=0.9992 +x_0=5000000 +y_0=2000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
        var source = new proj4.Proj('ESRI:102100');
        var dest = new proj4.Proj('EPSG:9377');
        var coordinatesOrigenNacional = proj4.transform(source, dest, [mapPoint.x, mapPoint.y]);
        $("#coordinatesDiv").html("N: " + coordinatesOrigenNacional.y.toFixed(6) + ", E: " + coordinatesOrigenNacional.x.toFixed(6) + " (EPSG:9377)");
          });
        
   
}

function initData(data) {
    cacheUnidades = data.UNIDAD;
    cacheMosaicos = data.MOSAICOS;
    cacheTematicas = data.TEMATICA;
    cacheEntidades = data.ENTIDAD;
    cacheUnidadesFiltro = data.UNIDAD;

    // for (var i = 0; i < cacheUnidadesFiltro.length; i++) {
    //     if (cacheUnidadesFiltro[i].type == "DEPTO") {
    //         cacheUnidadesFiltro[i].disabled = true;
    //     }
    // }

    $("#searchFiltro").select2({
        data: cacheUnidadesFiltro,
        multiple: false,
        placeholder: "Ej: Colombia",
        query: function (query) {
            if ((query.term == null) || (query.term == "")) {
                query.callback({ results: cacheUnidadesFiltro });
            } else {
                var results = [];
                for (var i = 0; i < cacheUnidadesFiltro.length; i++) {
                    if (limpiarTexto(cacheUnidadesFiltro[i].text).indexOf(limpiarTexto(query.term)) != -1) {
                        if (cacheUnidadesFiltro[i].type == "MUNI") {
                            results.push({
                                type: cacheUnidadesFiltro[i].type,
                                id: cacheUnidadesFiltro[i].id,
                                text: cacheUnidadesFiltro[i].text + ", " + getDeptoByMuni(cacheUnidadesFiltro[i].id).text
                            });
                        }
                        if (cacheUnidadesFiltro[i].type == "DEPTO") {
                            results.push({
                                type: cacheUnidadesFiltro[i].type,
                                id: cacheUnidadesFiltro[i].id,
                                text: cacheUnidadesFiltro[i].text,
                                disabled: true
                            });
                        }
                        if (cacheUnidadesFiltro[i].type == "PAIS") {
                            results.push({
                                type: cacheUnidadesFiltro[i].type,
                                id: cacheUnidadesFiltro[i].id,
                                text: cacheUnidadesFiltro[i].text
                            });
                        }
                    }
                }
                query.callback({ results: results });
            }
        },
        templateResult: function (data) {
            if (!data.type) {
                return data.text;
            }
            return $("<span class='" + data.type + "'>" + data.text + "</span>");
        }
    });
    $("#searchFiltro").val(null);
    $("#searchFiltro").trigger("change");
    $("#searchFiltro").on("change", function (e) {

        var data = $("#searchFiltro").select2("data")[0];
        /* if (data.type == "MUNI") {
            $("#limpiarBtn").show();
            var params = {};
            params.tipo = data.type;
            params.codigo = data.id;
            $.ajax({
                url: web_service + "/unidad?cmd=query_codigo",
                data: params,
                type: 'POST',
                success: function (data) {
                    if (data.status) {
                        searchCurrent = esri.jsonUtilsGeometry.fromJson(Terraformer.ArcGIS.convert(new Terraformer.Primitive(JSON.parse(data.SHAPE))));
                        updateInicio();
                    } else {
                        showLoading("Ha ocurrido un error, consultando la unidad selecccionada.", null, "red", true);
                        $("#panelSearchNivel1").hide();
                        $("#searchBar").hide();
                        $("#searchBarTab").hide();
                    }
                },
                error: function (_data) {
                    showLoading("Ha ocurrido un error, consultando la unidad selecccionada.", null, "red", true);
                    $("#panelSearchNivel1").hide();
                    $("#searchBar").hide();
                    $("#searchBarTab").hide();
                }
            });
        }
        if (data.type == "DEPTO") {
            $("#limpiarBtn").show();
            var params = {};
            params.tipo = data.type;
            params.codigo = data.id;
            $.ajax({
                url: web_service + "/unidad?cmd=query_codigo",
                data: params,
                type: 'POST',
                success: function (data) {
                    if (data.status) {
                        searchCurrent = esri.jsonUtilsGeometry.fromJson(Terraformer.ArcGIS.convert(new Terraformer.Primitive(JSON.parse(data.SHAPE))));
                        updateInicio();
                    } else {
                        showLoading("Ha ocurrido un error, consultando la unidad selecccionada.", null, "red", true);
                        $("#panelSearchNivel1").hide();
                        $("#searchBar").hide();
                        $("#searchBarTab").hide();
                    }
                },
                error: function (_data) {
                    showLoading("Ha ocurrido un error, consultando la unidad selecccionada.", null, "red", true);
                    $("#panelSearchNivel1").hide();
                    $("#searchBar").hide();
                    $("#searchBarTab").hide();
                }
            });
        }
        if (data.type == "PAIS") {
            $("#limpiarBtn").show();
            searchCurrent = esri.Polygon.fromExtent(default_extent);
            updateInicio();
        } */

    });

    $("#searchImagenesFechaInicial").datepicker({
        format: "dd/mm/yyyy",
        language: "es",
        orientation: "bottom"
    });
    $("#searchImagenesFechaFinal").datepicker({
        format: "dd/mm/yyyy",
        language: "es",
        orientation: "bottom"
    });
    
    if (getParameterByName("u") != null) {
        var unidad = getUnidadById(getParameterByName("u"));
        currentCaracterizacion = data.UNIDAD_INICIAL;
        firstExpand = false;
        $("#panelSearchResultados").show();
        $("#headingSearch").show();
        toggleMenu("large");        
        $("#searchFiltro").val(getParameterByName("u"));
        $("#searchFiltro").trigger("change");
    }
    if ((getParameterByName("u") == null) && (getParameterByName("a") == null)) {
        $("#searchFiltro").val(0);
        $("#searchFiltro").trigger("change");
    }

}

//Esta funcion esta en desuso, eliminar una vez se reemplacen sus funciones adyacentes
/* function setupMap() {
    popup = new esri.Popup({
        titleInBody: true,
        popupWindow: true
    }, esri.domConstruct.create("div"));    
   
    default_extent = new esri.Extent({
        xmin: -86.25559680664145, ymin: -4.496767298712775, xmax: -62.239483525397816, ymax: 14.437589074108095,
        spatialReference: {
            wkid: 4326
        }
    });

    var extent_param = getParameterByName("e");
    var extent_value = esri.webMercatorUtils.geographicToWebMercator(default_extent);
    if (extent_param != null) {
        try {
            extent_value = esri.webMercatorUtils.geographicToWebMercator(new esri.Extent({
                xmin: parseFloat(extent_param.split(',')[0]),
                ymin: parseFloat(extent_param.split(',')[1]),
                xmax: parseFloat(extent_param.split(',')[2]),
                ymax: parseFloat(extent_param.split(',')[3]),
                spatialReference: {
                    wkid: parseInt(extent_param.split(',')[4])
                }
            }));
            extentInicial = extent_value;
        } catch (err) {

        }
        map = new esri.Map("mapViewDiv", {
            basemap: currentBasemap,
            sliderPosition: "bottom-right",
            extent: extent_value,
            infoWindow: popup,
            maxZoom: 19,
            minZoom: 4,
            showLabels: true
        });
    } else {
        map = new esri.Map("mapViewDiv", {
            basemap: currentBasemap,
            sliderPosition: "bottom-right",
            center: default_extent.getCenter(),
            infoWindow: popup,
            maxZoom: 19,
            minZoom: 4,
            showLabels: true
        });
        map.setZoom(5);
    }

    map.on("load", function () {
    });
    map.on("click", function (event) {
        if (event.graphic != null) {
            if (event.graphic.getLayer() != dibujoLayer) {
                editTool.deactivate();
            }
        } else {
            if (editTool.getCurrentState().graphic != null) {
                editTool.deactivate();
            }
        }
    });
    map.on("resize", function () {
        resizeCenter = map.extent.getCenter();
        setTimeout(function () {
            map.centerAt(resizeCenter);
        }, 100);
    });

    map.on("extent-change", function () {
        $("#panelLayersZoom").html(" - Zoom: " + map.getZoom());
    });
    map.on("click", function (event) {

    });

    overviewMap = new esri.OverviewMap({
        map: map,
        visible: false,
        attachTo: "bottom-left",
        height: 200,
        width: 200
    });
    overviewMap.startup();

 

    legend = new esri.Legend({
        map: map,
        autoUpdate: false,
    }, "legendDiv");

    // basemap 

    $("#selectBasemapPanel").on("change", function (e) {
        currentBasemap = e.target.options[e.target.selectedIndex].value;
        map.setBasemap(currentBasemap);
    });
    map.on("basemap-change", function (evt) {

        if (overviewMap.visible) {
            overviewMap.destroy();
            overviewMap = new esri.OverviewMap({
                map: map,
                visible: false,
                attachTo: "bottom-right"
            });
            overviewMap.startup();
            overviewMap.show();
        } else {
            overviewMap.destroy();
            overviewMap = new esri.OverviewMap({
                map: map,
                visible: false,
                attachTo: "bottom-right"
            });
            overviewMap.startup();
        }
    });

    map.on("extent-change", function (evt) {
    });

    map.on("zoom-end", function (evt) {
    });


    // Coordenadas 
    hoverHandle = map.on("mouse-move", function (evt) {
        updateCoordenada(evt);
    });
    var infoTemplate = new esri.InfoTemplate();
    coordsLayer = new esri.GraphicsLayer({
        infoTemplate: infoTemplate
    });
    pointMarker = new esri.PictureMarkerSymbol("/images/map-marker.png", 32, 32);
    map.addLayer(coordsLayer);

    $("#querySearchCoordinateFormat").on("change", function (e) {
        $("#querySearchCoordinateLatitudLabel").html(sistemasCoordenadas[$("#querySearchCoordinateFormat").val()].labLat);
        $("#querySearchCoordinateLongitudLabel").html(sistemasCoordenadas[$("#querySearchCoordinateFormat").val()].labLng);
        $("#querySearchCoordinateLatitud").attr("placeholder", sistemasCoordenadas[$("#querySearchCoordinateFormat").val()].labelLat);
        $("#querySearchCoordinateLongitud").attr("placeholder", sistemasCoordenadas[$("#querySearchCoordinateFormat").val()].labelLng);
    });

    // Operadores 
    operadoresLayer = new esri.GraphicsLayer({
        id: "Operadores",
        infoTemplate: new esri.InfoTemplate({ title: "Operadores" })
    });
    map.addLayer(operadoresLayer);
     $("#selectOperadoresOp").on("change", function (e) {
        console.log("cambio: ", $("#selectOperadoresOp").val());
        cleanOperadores();
        if ($("#selectOperadoresOp").val() == "buffer") {
            $("#operadores1Div").show();
            $("#operadoresBufferDiv").show();
            $("#operadores2Div").hide();
        }
        if (($("#selectOperadoresOp").val() == "union") || ($("#selectOperadoresOp").val() == "intersect")) {
            $("#operadores1Div").hide();
            $("#operadoresBufferDiv").hide();
            $("#operadores2Div").show();
        }
    }); 

    // Imprimir 
    printer = esri.Print({
        map: map,
        url: print_service
    }, "printDiv");
    printer.on("print-complete", function (evt) {
        closeLoading();
        var link = document.createElement("a");
        link.download = "PMB-Impresion." + $("#selectPrintFormat").val();
        link.href = evt.result.url;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
    printer.on("error", function (_evt) {
        showLoading("No se pudo imprimir el mapa", null, "red", true);
    });
    printer.startup();


    /* Leyenda 
    legend = new esri.Legend({
        map: map,
        autoUpdate: false
    }, "leyendaDiv");
    legend.startup();

    var params = "";
    if (getParameterByName("u") != null) {
        params = params + "&unidad=" + getParameterByName("u");
    }

    /* Area/GeoJSON 
    areaLayer = new esri.GraphicsLayer({
        id: "Area"
    });
    areaLayer.setVisibility(false);
    areaLayer.on("click", function (evt) {
        if (evt.graphic != null) {
            editTool.activate(esri.Edit.MOVE | esri.Edit.EDIT_VERTICES | esri.Edit.SCALE | esri.Edit.ROTATE, evt.graphic, {
                allowAddVertices: true,
                allowDeleteVertices: true,
                uniformScaling: true
            });
        }
    });
    $("html").keyup(function (e) {
        if (e.keyCode == 46) {
            if (editTool.getCurrentState().graphic != null) {
                if (modoSearch == "area") {
                    areaLayer.remove(editTool.getCurrentState().graphic);
                    editTool.deactivate();
                }
            }
        }
    });
    drawTool2 = new esri.Draw(map);
    drawTool2.on("draw-end", function (evt) {
        map.enableMapNavigation();
        drawTool2.deactivate();

        var cLineDef = esri.Color.fromArray([255, 0, 0, 1.0]);
        var cFillDef = esri.Color.fromArray([255, 0, 0, 0.5]);
        var symbol = new esri.SimpleFillSymbol(esri.SimpleLineSymbol.STYLE_SOLID,
            new esri.SimpleLineSymbol(esri.SimpleLineSymbol.STYLE_SOLID, cLineDef, 2),
            cFillDef);

        var g = new esri.Graphic(evt.geometry, symbol);
        areaLayer.clear();
        areaLayer.add(g);
        map.setExtent(esri.graphicsUtils.graphicsExtent(areaLayer.graphics).expand(2));
        editTool2.deactivate();
    });
    drawTool2.deactivate();
    editTool2 = new esri.Edit(map, {
        textSymbolEditorHolder: "txtSymbolEditorHolder"
    });
    editTool2.on("activate", function (evt) {
        var cLineDef = esri.Color.fromArray([255, 0, 0, 1.0]);
        var cFillDef = esri.Color.fromArray([255, 0, 0, 0.5]);
        if (editTool2.getCurrentState().graphic.symbol.type == "simplefillsymbol") {
            editTool2.getCurrentState().graphic.setSymbol(new esri.SimpleFillSymbol(esri.SimpleLineSymbol.STYLE_SOLID,
                new esri.SimpleLineSymbol(esri.SimpleLineSymbol.STYLE_SOLID, cLineDef, 2),
                cFillDef));
        }
    });
    editTool2.deactivate();
    map.addLayer(areaLayer);
    fileLayer = new esri.GraphicsLayer({
        id: "File"
    });
    fileLayer.setVisibility(false);
    map.addLayer(fileLayer);

    $("#file").change(function (e) {
        var files = $('#file')[0].files;
        for (var i = 0; i < files.length; i++) {
            var reader = new FileReader();
            reader.onload = function (e) {
                var dataJSON = Terraformer.ArcGIS.fromGeoJSON(JSON.parse(e.target.result));
                var cLineDef = esri.Color.fromArray([255, 0, 0, 1.0]);
                var cFillDef = esri.Color.fromArray([255, 0, 0, 0.5]);
                var symbol = new esri.SimpleFillSymbol(esri.SimpleLineSymbol.STYLE_SOLID,
                    new esri.SimpleLineSymbol(esri.SimpleLineSymbol.STYLE_SOLID, cLineDef, 2),
                    cFillDef);

                for (var i = 0; i < dataJSON.length; i++) {
                    var _geometry = esri.webMercatorUtils.geographicToWebMercator(esri.jsonUtilsGeometry.fromJson(dataJSON[i].geometry));
                    var g = new esri.Graphic(_geometry, symbol);
                    fileLayer.add(g);
                }
                map.setExtent(esri.graphicsUtils.graphicsExtent(fileLayer.graphics).expand(2));
            };
            reader.readAsText(files[i]);
        }
    });

    /* Dibujar 
    dibujoLayer = new esri.GraphicsLayer({
        id: "Dibujo",
        infoTemplate: null
    });
    map.addLayer(dibujoLayer);
    dibujoLayer.on("click", function (evt) {
        if ($("#panelDibujar").is(":visible")) {
            if (evt.graphic != null) {
                editTool.activate(esri.Edit.MOVE | esri.Edit.EDIT_VERTICES | esri.Edit.SCALE | esri.Edit.ROTATE, evt.graphic, {
                    allowAddVertices: true,
                    allowDeleteVertices: true,
                    uniformScaling: true
                });
            } else {
                if (editToolState) {
                    editTool.deactivate();
                    $("#drawEdit").hide();
                }
            }
        }
    });
    drawTool = new esri.Draw(map);
    drawTool.on("draw-end", function (evt) {
        map.enableMapNavigation();
        drawTool.deactivate();

        var symbol = null;

        var cLine = esri.Color.fromString($("#drawOptLineColorInput").val()).toRgba();
        var cFill = esri.Color.fromString($("#drawOptFillColorInput").val()).toRgba();

        var cLineDef = esri.Color.fromArray(cLine);
        var cFillDef = esri.Color.fromArray(cFill);

        if (activeTool == "text") {
            symbol = new esri.TextSymbol($("#drawText").val(), new esri.Font("100%"), cFillDef);
        }
        if (activeTool == "point" || activeTool == "multipoint") {
            symbol = pointMarker;
        }
        if (activeTool == "line" || activeTool == "polyline" || activeTool == "freehandpolyline") {
            symbol = new esri.SimpleLineSymbol(esri.SimpleLineSymbol.STYLE_SOLID, cLineDef, 2);
        }
        if (symbol == null) {
            symbol = new esri.SimpleFillSymbol(esri.SimpleLineSymbol.STYLE_SOLID,
                new esri.SimpleLineSymbol(esri.SimpleLineSymbol.STYLE_SOLID, cLineDef, 2),
                cFillDef);
        }

        var g = new esri.Graphic(evt.geometry, symbol);
        dibujoLayer.add(g);
        editTool.activate(esri.Edit.MOVE | esri.Edit.EDIT_VERTICES | esri.Edit.SCALE | esri.Edit.ROTATE, g, {
            allowAddVertices: true,
            allowDeleteVertices: true,
            uniformScaling: true
        });
        updateDibujoList();
    });
    drawTool.deactivate();
    editTool = new esri.Edit(map, {
        textSymbolEditorHolder: "txtSymbolEditorHolder"
    });
    editTool.on("activate", function (evt) {
        $("#drawEdit").show();
        $("#drawIntro").hide();
        $("#drawOptsFill").hide();
        $("#drawOptsText").hide();
        $("#drawOptsLine").hide();

        updateLock = true;
        if (evt.graphic.symbol.type == "textsymbol") {
            $("#drawOptsText").show();
            $("#drawText").val(evt.graphic.symbol.text);
            $("#drawOptsFill").show();
            $("#drawOptFillColor").colorpicker("setValue", evt.graphic.symbol.color.toString());
        }
        if (evt.graphic.symbol.type == "simplelinesymbol") {
            $("#drawOptsLine").show();
            $("#drawOptLineColor").colorpicker("setValue", evt.graphic.symbol.color.toString());
        }
        if (evt.graphic.symbol.type == "simplefillsymbol") {
            try {
                $("#drawOptsFill").show();
                $("#drawOptFillColor").colorpicker("setValue", evt.graphic.symbol.color.toString());
                $("#drawOptsLine").show();
                $("#drawOptLineColor").colorpicker("setValue", evt.graphic.symbol.outline.color.toString());
            } catch (err) { }
        }
        updateLock = false;
        updateEditGraphic();
        updateEditMeasure(evt.graphic);
    });
    editTool.on("graphic-move", function (evt) {
        updateEditMeasure(evt.graphic);
    });
    editTool.on("graphic-move-stop", function (evt) {
        updateEditMeasure(evt.graphic);
    });
    editTool.on("rotate", function (evt) {
        updateEditMeasure(evt.graphic);
    });
    editTool.on("rotate-stop", function (evt) {
        updateEditMeasure(evt.graphic);
    });
    editTool.on("scale", function (evt) {
        updateEditMeasure(evt.graphic);
    });
    editTool.on("scale-stop", function (evt) {
        updateEditMeasure(evt.graphic);
    });
    editTool.on("vertex-add", function (evt) {
        updateEditMeasure(evt.graphic);
    });
    editTool.on("vertex-delete", function (evt) {
        updateEditMeasure(evt.graphic);
    });
    editTool.on("vertex-move", function (evt) {
        updateEditMeasure(evt.graphic);
    });
    editTool.on("vertex-move-stop", function (evt) {
        updateEditMeasure(evt.graphic);
    });
    editTool.on("deactivate", function (_evt) {
        $("#drawEdit").hide();
    });
    editTool.deactivate();

    $("#drawOptLineColor").colorpicker({}).on('changeColor', function (e) {
        $("#drawOptLineColorInput").val(e.color);
        $("#drawOptLineColor").css("color", e.color);
        if ((editTool.getCurrentState().tool != 0) && (!updateLock)) {
            updateEditGraphic();
        }
    });
    $("#drawOptFillColor").colorpicker({}).on('changeColor', function (e) {
        $("#drawOptFillColorInput").val(e.color);
        $("#drawOptFillColor").css("color", e.color);
        if ((editTool.getCurrentState().tool != 0) && (!updateLock)) {
            updateEditGraphic();
        }
    });

    $("#drawText").on("change keyup paste", function (_e) {
        if (editTool.getCurrentState().tool != 0) {
            updateEditGraphic();
        }
    });
    $("#measureAreaUnit").on("change", function (_e) {
        updateEditMeasure();
    });
    $("#measureLengthUnit").on("change", function (_e) {
        updateEditMeasure();
    });

    new esri.Moveable("panelLayers", { handle: "headingLeyenda" });
    new esri.Moveable("panelLeyenda", { handle: "headingLeyenda" });
    new esri.Moveable("panelImprimir", { handle: "headingImprimir" });
    new esri.Moveable("panelLogin", { handle: "headingLogin" });

} */

function modoDibujo2(tool) {
    editTool2.deactivate();
    map.disableMapNavigation();
    drawTool2.activate(tool);
}

function limpiarMain() {
    if (modoSearch == "entidad") {
        $("#searchFiltro").val(0);
        $("#searchFiltro").trigger("change");
    }
    if (modoSearch == "area") {
        areaLayer.clear();
    }
    if (modoSearch == "geojson") {
        fileLayer.clear();
    }
    map.setExtent(default_extent);
}

function updateInicio() {
    if (firstExpand) {
        $("#panelSearchResultados").show();
        $("#headingSearch").show();
        toggleMenu("large");
        if (extentInicial == null) {
            if (searchCurrent != null) {
                if ($("#searchFiltro").select2("data")[0].type == "PAIS") {
                    map.setExtent(default_extent);
                } else {
                    map.setExtent(searchCurrent.getExtent().expand(1.5));
                }
            }
        }
        extentInicial = null;
        firstExpand = false;
    } else {
        if (extentInicial == null) {
            if (searchCurrent != null) {
                if ($("#searchFiltro").select2("data")[0].type == "PAIS") {
                    map.setExtent(default_extent);
                } else {
                    map.setExtent(searchCurrent.getExtent().expand(1.5));
                }
            }
        }
        extentInicial = null;
    }
}

function gotoInfo() {
    currentScreen = "Info";
    reporteUso("Abrir información");
    minAll();
    $("#panelInfo").show();
}

function closeInfo() {
    $("#panelInfo").hide();
}

//MOVER A UN ARCHIVO AFUERA sistemasCoordenadas y spanishdataTable
var sistemasCoordenadas = {
    "EPSG:9377": {
        "proj": '+proj=tmerc +lat_0=4.0 +lon_0=-73.0 +k=0.9992 +x_0=5000000 +y_0=2000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
        "wkt": 'PROJCS["MAGNA-SIRGAS / CTM12",GEOGCS["MAGNA-SIRGAS",DATUM["Marco_Geocentrico_Nacional_de_Referencia",SPHEROID["GRS 1980",6378137,298.257222101,AUTHORITY["EPSG","7019"]],TOWGS84[0,0,0,0,0,0,0],AUTHORITY["EPSG","6686"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4686"]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",4.0],PARAMETER["central_meridian",-73.0],PARAMETER["scale_factor",0.9992],PARAMETER["false_easting",5000000],PARAMETER["false_northing",2000000],UNIT["metre",1,AUTHORITY["EPSG","9001"]],AUTHORITY["EPSG","38820"]]',
        "labLat": "Norte (m)",
        "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:4326": {
        "proj": '+proj=longlat +datum=WGS84 +no_defs',
        "wkid": 4326,
        "labLat": "Latitud (N)",
        "labLng": "Longitud (W)",
        "labelLat": "4.668730",
        "labelLng": "-74.100403"
    },
    "EPSG:3857": {
        "proj": '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs',
        "wkid": 3857,
        "labLat": "Norte (m)",
        "labLng": "Este (m)",
        "labelLat": "517000",
        "labelLng": "-8230000"
    },
    "EPSG:4686": {
        "proj": '+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs',
        "wkid": 4686,
        "labLat": "Norte (N)",
        "labLng": "Este (W)",
        "labelLat": "4.668730",
        "labelLng": "-74.100403"
    },
    "EPSG:21894": {
        "proj": '+proj=tmerc +lat_0=4.59904722222222 +lon_0=-68.0809166666667 +k=1 +x_0=1000000 +y_0=1000000 +ellps=intl +towgs84=221.899,274.136,-397.554,-2.80844591036278,0.44850858891268,2.81017234679107,-2.199943 +units=m +no_defs',
        "labLat": "Norte (m)",
        "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:21896": {
        "proj": '+proj=tmerc +lat_0=4.59904722222222 +lon_0=-77.0809166666667 +k=1 +x_0=1000000 +y_0=1000000 +ellps=intl +towgs84=307,304,-318,0,0,0,0 +units=m +no_defs',
        "labLat": "Norte (m)",
        "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:21897": {
        "proj": '+proj=tmerc +lat_0=4.59904722222222 +lon_0=-74.0809166666667 +k=1 +x_0=1000000 +y_0=1000000 +ellps=intl +towgs84=307,304,-318,0,0,0,0 +units=m +no_defs',
        "labLat": "Norte (m)",
        "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:21898": {
        "proj": '+proj=tmerc +lat_0=4.59904722222222 +lon_0=-71.0809166666667 +k=1 +x_0=1000000 +y_0=1000000 +ellps=intl +towgs84=307,304,-318,0,0,0,0 +units=m +no_defs',
        "labLat": "Norte (m)",
        "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:21899": {
        "proj": '+proj=tmerc +lat_0=4.59904722222222 +lon_0=-68.0809166666667 +k=1 +x_0=1000000 +y_0=1000000 +ellps=intl +towgs84=221.899,274.136,-397.554,-2.80844591036278,0.44850858891268,2.81017234679107,-2.199943 +units=m +no_defs',
        "labLat": "Norte (m)",
        "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:3114": {
        "proj": '+proj=tmerc +lat_0=4.59620041666667 +lon_0=-80.0775079166667 +k=1 +x_0=1000000 +y_0=1000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
        "wkid": 3114,
        "labLat": "Norte (m)",
        "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:3115": {
        "proj": '+proj=tmerc +lat_0=4.59620041666667 +lon_0=-77.0775079166667 +k=1 +x_0=1000000 +y_0=1000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
        "wkid": 3115,
        "labLat": "Norte (m)",
        "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:3116": {
        "proj": '+proj=tmerc +lat_0=4.59620041666667 +lon_0=-74.0775079166667 +k=1 +x_0=1000000 +y_0=1000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
        "wkid": 3116,
        "labLat": "Norte (m)",
        "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:3117": {
        "proj": '+proj=tmerc +lat_0=4.59620041666667 +lon_0=-71.0775079166667 +k=1 +x_0=1000000 +y_0=1000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
        "wkid": 3117,
        "labLat": "Norte (m)",
        "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:3118": {
        "proj": '+proj=tmerc +lat_0=4.59620041666667 +lon_0=-68.0775079166667 +k=1 +x_0=1000000 +y_0=1000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
        "wkid": 3118,
        "labLat": "Norte (m)",
        "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:32617": {
        "proj": '+proj=utm +zone=17 +datum=WGS84 +units=m +no_defs',
        "wkid": 32617,
        "labLat": "Norte (m)",
        "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:32618": {
        "proj": '+proj=utm +zone=18 +datum=WGS84 +units=m +no_defs',
        "wkid": 32618,
        "labLat": "Norte (m)",
        "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:32619": {
        "proj": '+proj=utm +zone=19 +datum=WGS84 +units=m +no_defs',
        "wkid": 32619,
        "labLat": "Norte (m)",
        "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:32717": {
        "proj": '+proj=utm +zone=17 +south +datum=WGS84 +units=m +no_defs',
        "wkid": 32717,
        "labLat": "Norte (m)",
        "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:32718": {
        "proj": '+proj=utm +zone=18 +south +datum=WGS84 +units=m +no_defs',
        "wkid": 32718,
        "labLat": "Norte (m)",
        "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:32719": {
        "proj": '+proj=utm +zone=19 +south +datum=WGS84 +units=m +no_defs',
        "wkid": 32719,
        "labLat": "Norte (m)",
        "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6244": {
        "wkid": 102769, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6245": {
        "wkid": 102790, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6246": {
        "wkid": 102770, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6247": {
        "wkid": 102771, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6248": {
        "wkid": 102793, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6249": {
        "wkid": 102796, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6250": {
        "wkid": 102772, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6251": {
        "wkid": 102788, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6252": {
        "wkid": 102775, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6253": {
        "wkid": 102795, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6254": {
        "wkid": 102781, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6255": {
        "wkid": 102767, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6256": {
        "wkid": 102774, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6257": {
        "wkid": 102768, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6258": {
        "wkid": 102797, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6259": {
        "wkid": 102789, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6260": {
        "wkid": 102780, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6261": {
        "wkid": 102783, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6262": {
        "wkid": 102787, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6263": {
        "wkid": 102791, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6264": {
        "wkid": 102777, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6265": {
        "wkid": 102798, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6266": {
        "wkid": 102779, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6267": {
        "wkid": 102784, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6268": {
        "wkid": 102792, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6269": {
        "wkid": 102782, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6270": {
        "wkid": 102785, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6271": {
        "wkid": 102794, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6272": {
        "wkid": 102773, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6273": {
        "wkid": 102778, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6274": {
        "wkid": 102786, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    },
    "EPSG:6275": {
        "wkid": 102776, "labLat": "Norte (m)", "labLng": "Este (m)",
        "labelLat": "1000000.000",
        "labelLng": "996000.000"
    }
}

var spanishDataTable = {
    "sProcessing": "Procesando...",
    "sLengthMenu": "_MENU_",
    "sZeroRecords": "No se encontraron resultados",
    "sEmptyTable": "Ningún dato disponible en esta tabla",
    "sInfo": "_START_ - _END_ de _TOTAL_ resultados",
    "sInfoEmpty": "No hay resultados",
    "sInfoFiltered": "(filtrado de un total de _MAX_ registros)",
    "sInfoPostFix": "",
    "sSearch": "Buscar:",
    "sUrl": "",
    "sInfoThousands": ",",
    "sLoadingRecords": "Cargando...",
    "oPaginate": {
        "sFirst": "Primero",
        "sLast": "Último",
        "sNext": "Siguiente",
        "sPrevious": "Anterior"
    },
    "oAria": {
        "sSortAscending": ": Activar para ordenar la columna de manera ascendente",
        "sSortDescending": ": Activar para ordenar la columna de manera descendente"
    }
}

function limpiarTexto(str) {
    return accentFold(str.toLowerCase());
}

function accentFold(inStr) {
    return inStr.replace(
        /([àáâãäå])|([çčć])|([èéêë])|([ìíîï])|([ñ])|([òóôõöø])|([ß])|([ùúûü])|([ÿ])|([æ])/g,
        function (str, a, c, e, i, n, o, s, u, y, ae) {
            if (a) return 'a';
            if (c) return 'c';
            if (e) return 'e';
            if (i) return 'i';
            if (n) return 'n';
            if (o) return 'o';
            if (s) return 's';
            if (u) return 'u';
            if (y) return 'y';
            if (ae) return 'ae';
        }
    );
}

function getDeptoByMuni(id) {
    for (var i = 0; i < cacheUnidades.length; i++) {
        if (cacheUnidades[i].type == "DEPTO") {
            if (id.startsWith(cacheUnidades[i].id)) {
                return cacheUnidades[i];
            }
        }
    }
    return null;
}

function getUnidadById(id) {
    for (var i = 0; i < cacheUnidades.length; i++) {
        if (cacheUnidades[i].id == id) {
            return cacheUnidades[i];
        }
    }
}

function getEntidadById(id) {
    for (var i = 0; i < cacheEntidades.length; i++) {
        if (cacheEntidades[i].id == id) {
            return cacheEntidades[i];
        }
    }
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return null;
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}