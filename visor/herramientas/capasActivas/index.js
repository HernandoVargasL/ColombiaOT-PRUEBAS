var layerList;

function gotoLayers() {
  currentScreen = "layers";
  reporteUso("Abrir mapa base y capas");
  toggleMenu("small");
  minAll();
  $("#selectBasemapPanel").val(currentBasemap);
  $("#panelLayers").show();
  fetch("./herramientas/capasActivas/index.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("panelLayers").innerHTML = data;
      const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
      const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl))
      $("#selectBasemapPanel").on("change", changeMapaBase);
      $("#selectBasemapPanel").val(window.viewMap.map.basemap.id);
      $("#panelLayers").draggable({
        handle: ".panel-mover",
        containment: "#mapViewDiv",
      });
      $("#collapseLayers").on("shown.bs.collapse", (event) => {
        var windowPosition = $("#panelLayers").position();
        var parentPosition = $("#mapViewDiv").position();
        var windowHeight = $("#panelLayers").outerHeight();
        var parentHeight = $("#mapViewDiv").height();
        var windowWidth = $("#panelLayers").outerWidth();
        var parentWidth = $("#mapViewDiv").width();
        if (Math.abs(windowPosition.left) + windowWidth > parentWidth) {
          $("#panelLayers").offset({ left: parentPosition.left });
        }
        if (windowPosition.top + windowHeight > parentHeight) {
          $("#panelLayers").css("top", parentHeight - windowHeight);
        }
      });
      listLayers();
    })
    .catch((error) => console.error("Error al cargar el contenido: ", error));
}

function closeLayers() {
  $("#panelLayers").hide();
}

function changeMapaBase() {
  require([
    "esri/Basemap",
    "esri/layers/TileLayer",
    "esri/layers/VectorTileLayer",
  ], (Basemap, TileLayer, VectorTileLayer) => {
    var newBasemap;
    switch ($("#selectBasemapPanel").val()) {
      case "igac":
        newBasemap = new Basemap({
          baseLayers: [
            new VectorTileLayer({
              url: "https://tiles.arcgis.com/tiles/RVvWzU3lgJISqdke/arcgis/rest/services/Mapa_base_topografico/VectorTileServer",
            }),
          ],
          title: "Mapa Topográfico Colombia",
          id: "igac",
        });
        window.viewMap.map.basemap = newBasemap;
        break;

      case "igachibrido":
        newBasemap = new Basemap({
          baseLayers: [
            new TileLayer({
              url: "https://tiles.arcgis.com/tiles/RVvWzU3lgJISqdke/arcgis/rest/services/Mapa_Hibrido/MapServer",
            }),
          ],
          title: "Mapa Híbrido Colombia",
          id: "igachibrido",
        });
        window.viewMap.map.basemap = newBasemap;
        break;

      case "igacsatelital":
        newBasemap = new Basemap({
          baseLayers: [
            new TileLayer({
              url: "https://tiles.arcgis.com/tiles/RVvWzU3lgJISqdke/arcgis/rest/services/Mapa_Satelital/MapServer",
            }),
          ],
          title: "Mapa Satelital Colombia",
          id: "igacsatelital",
        });
        window.viewMap.map.basemap = newBasemap;
        break;

      case "igacfisico":
        newBasemap = new Basemap({
          baseLayers: [
            new TileLayer({
              url: "https://tiles.arcgis.com/tiles/RVvWzU3lgJISqdke/arcgis/rest/services/Mapa_Fisico_Relieve/MapServer",
            }),
          ],
          title: "Mapa Físico Colombia",
          id: "igacfisico",
        });
        window.viewMap.map.basemap = newBasemap;
        break;

      case "igacterreno":
        newBasemap = new Basemap({
          baseLayers: [
            new TileLayer({
              url: "https://tiles.arcgis.com/tiles/RVvWzU3lgJISqdke/arcgis/rest/services/MapaBaseTerreno/MapServer",
            }),
          ],
          title: "Mapa Terreno Colombia",
          id: "igacterreno",
        });
        window.viewMap.map.basemap = newBasemap;
        break;
    }
  });
}

function listLayers() {
  require([
    "esri/widgets/LayerList",
    "esri/widgets/Legend"
  ], (LayerList, Legend) => {

    //Se cargaran capas a manera de prueba

    // cargarCapa("https://mapas2.igac.gov.co/server/rest/services/geodesia/redactiva/MapServer/0");
    cargarCapa("https://mapas2.igac.gov.co/server/rest/services/carto/carto10000montelibano23466/MapServer/13");
     cargarCapa("https://mapas2.igac.gov.co/server/rest/services/carto/departamentos/MapServer/0");
      // cargarCapa("https://serviciosgis.catastrobogota.gov.co/arcgis/rest/services/gestionpublica/obraspublicas/MapServer/0");
       cargarCapa("https://mapas2.igac.gov.co/server/rest/services/carto/construcciones/MapServer/0");
// cargarCapa("https://mapas2.igac.gov.co/server/rest/services/carto/pruebainterseccion/MapServer/20");
// cargarCapa("https://mapas2.igac.gov.co/server/rest/services/carto/pruebainterseccion/MapServer/18");
// cargarCapa("https://mapas2.igac.gov.co/server/rest/services/carto/pruebainterseccion/MapServer/13");



   layerlist = new LayerList({
      view: window.viewMap,
    });

    layerlist.when(
      () => {
        if (layerlist.operationalItems.length > 0) {
          $("#noLayers").hide();
          layerlist.operationalItems.forEach((layer) => {
            var listLayers = $("#listLayers");
            var titleLayer = layer.title.split("-");
            var itemLayer = $("<li>");
            var divInfoLayer = $("<div>", {
              id: "info" + layer.uid,
              class: "divInfoLayer",
            });
            var divTitle = $("<div>").text(titleLayer[0]);
            divInfoLayer.append(divTitle);
            divTitle.addClass("divTitle");
            itemLayer.value = layer;
            itemLayer.addClass("list-group-item");
            itemLayer.addClass("list-group-item-custom");
            itemLayer.append(divInfoLayer);
            listLayers.append(itemLayer);
            $("[data-bs-toggle='tooltip']").tooltip();
            $('[data-bs-toggle="tooltip"]').click(function () {
              $('[data-bs-toggle="tooltip"]').tooltip("hide");
            });
            itemLayer.append($("#info" + layer.uid));

            var idLegend = "legend" + layer.uid;
            var legendDiv = $("<div>", {
              class: "collapse",
              id: idLegend,
            });

            legendDiv.addClass("legendLayer");
            itemLayer.append(legendDiv);
            const legend = new Legend({
              view: window.viewMap,
              layerInfos: [
                {
                  layer: layer.layer,
                },
              ],
              container: idLegend,
            });

            createActionsLayer(itemLayer);
          });
        }
      },
      function (error) {
        console.log(
          "Se ha producido un error al intentar listar las capas: ",
          error
        );
      }
    );
  });
}

function createActionsLayer(layer) {
  var divActions = $("<div>");
  divActions.addClass("btn-toolbar");
  divActions.addClass("divActions");
  var toggleVisible = $("<button>", {
    class: "btnVisible",
    "data-bs-toggle": "tooltip",
    "data-bs-title": "Desactivar Capa",
  });
  toggleVisible.click(() => {
    layer.value.visible = layer.value.visible ? false : true;
    toggleVisible.toggleClass("btnNoVisible");
    toggleVisible.attr(
      "data-bs-title",
      toggleVisible.attr("data-bs-title") === "Desactivar Capa"
        ? "Activar Capa"
        : "Desactivar Capa"
    );
  });

  var quitLayer = $("<button>", {
    class: "btnQuit",
    "data-bs-toggle": "tooltip",
    "data-bs-title": "Eliminar Capa",
  });
  quitLayer.click(() => {
    window.viewMap.map.remove(layer.value.layer).when(() => {
      quitLayer.tooltip("hide");
      if (layerlist.operationalItems.length < 1) {
        $("#noLayers").show();
      }
    });
    layer.remove();
  });

  var zoomLayer = $("<button>", {
    class: "btnZoom",
    "data-bs-toggle": "tooltip",
    "data-bs-title": "Centrar Capa",
  });
  zoomLayer.click(() => {
    window.viewMap.goTo(layer.value.layer.fullExtent);
  });

  var tableLayer = $("<button>", {
    class: "btnTable",
    "data-bs-toggle": "tooltip",
    "data-bs-title": "Tabla de Atributos",
  });
  tableLayer.click(() => {
    require(["esri/widgets/FeatureTable"], (FeatureTable) => {
      if (!$("#divTable").length) {
         const divTable = $("<div>", {
        id: "divTable",
        class: "divTable",
      });

      const barTitleTable = $(
        `<div class="panel-heading-f" style="display: flex;justify-content: space-between;">
        <span class="panel-label" id="panelOperadoresTitle">Tabla de Atributos</span>
                <span class="panel-close" onclick="closeTableAttributes();"><span class="esri-icon esri-icon-close"
                aria-hidden="false"></span></span>
        </div>
`
      );
      const tableContent = $("<div>", {
        id: "divTableContent"
      });

      divTable.append(barTitleTable);
       divTable.append(tableContent);
      $("#mapViewDiv").append(divTable);
      $("#mapViewDiv").addClass("addTable");
      }else{
         $("#divTableContent").empty();
        $("#divTable").show();
      }
     
      const featureTable = new FeatureTable({
        view: window.viewMap,
        layer: layer.value.layer,
        container: "divTableContent",
      });
    });
  });

  console.log(layer.value.layer);
  //Agregar funcion para comprobar si se puede o no acceder a la tabla de atributos, si no se puede ver inhabilitar el boton

  var simbologyLayer = $("<button>", {
    class: "btnSymbology",
    "aria-expanded": "false",
    "aria-controls": "simbologiaDiv"
  });

  simbologyLayer.tooltip({
    title: 'Simbología y Etiquetado',
    placement: 'top' 
});
  simbologyLayer.click(() => {
    goToSimbologia(layer);
    $('#simbologiaDiv').collapse('show');
    simbologyLayer.tooltip("hide");
  });

  var legendLayer = $("<button>", {
    class: "btnLegend",
    "data-bs-toggle": "tooltip",
    "data-bs-title": "Ver Leyenda",
    "data-bs-toggle": "collapse",
    "data-bs-target": "#legend" + layer.value.uid,
    "aria-expanded": "false",
    "aria-controls": "legendCollapse",
  });

  divActions.append(toggleVisible);
  divActions.append(quitLayer);
  divActions.append(zoomLayer);
  divActions.append(tableLayer);
  divActions.append(simbologyLayer);
  divActions.append(legendLayer);
  $("#info" + layer.value.uid).append(divActions);
}

function closeTableAttributes(){
  $("#divTable").hide();
}