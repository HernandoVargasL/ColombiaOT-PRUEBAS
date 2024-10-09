var featuresSelected = [];
var eventClick;
var layerBufferDestiny;

function selectGeometriasBuffer() {
  if ($("#ifSeleccionados").is(":checked")) {
    $("#infoSelectGeometrias").text(
      "Seleccione las entidades que desea con un clic"
    );
    $("#infoSelectGeometrias").show();
    layerBufferDestiny = window.viewMap.map.findLayerById(
      $("#capaBuffer").val()
    );
    layerBufferDestiny.outFields = ["*"];
    const opts = {
      include: layerBufferDestiny,
    };
    let layerViewDestiny;
    window.viewMap
      .whenLayerView(layerBufferDestiny)
      .then((layerView) => (layerViewDestiny = layerView));
    eventClick = window.viewMap.on("click", (event) => {
      window.viewMap.hitTest(event, opts).then((response) => {
        if (response.results.length) {
          var elementDuplicate = featuresSelected.find(
            (element) =>
              JSON.stringify(element.feature.graphic.geometry.toJSON()) ===
              JSON.stringify(response.results[0].graphic.geometry.toJSON())
          );
          if (!elementDuplicate) {
            featuresSelected.push({
              feature: response.results[0],
              highlight: layerViewDestiny.highlight(
                response.results[0].graphic
              ),
            });
          } else {
            elementDuplicate.highlight.remove();
            featuresSelected = featuresSelected.filter(
              (element) => element !== elementDuplicate
            );
          }
          $("#infoSelectGeometrias").text(
            `${featuresSelected.length} geometrías seleccionadas`
          );
        }
      });
    });
  } else {
    $("#infoSelectGeometrias").hide();

    featuresSelected.forEach((featureSelect) => {
      featureSelect.highlight.remove();
    });
    featuresSelected = [];
    eventClick.remove();
  }
}

function enableAplicarBuffer() {
  if ($("#capaBuffer").val()) {
    $("#ifSeleccionados").prop("disabled", false);
  }
  if (
    $("#capaBuffer").val() &&
    $("#unidades").val() &&
    $("#distanciaInput").val()
  ) {
    $("#btnAplicarBuffer").prop("disabled", false);
    $("#onAplicarBuffer").text("Aplicar");
    $("#btnAplicarBuffer").removeClass("btn-success");
    $("#btnAplicarBuffer").addClass("btn-primary");
  } else {
    $("#btnAplicarBuffer").prop("disabled", true);
  }
}

function createBuffer() {
  $("#loadingAplicarBuffer").show();
  $("#onAplicarBuffer").hide();
  require([
    "esri/geometry/geometryEngine",
    "esri/core/reactiveUtils","esri/rest/support/ProjectParameters",
    "esri/rest/geometryService", "esri/rest/support/BufferParameters"
  ], (
    geometryEngine,
    reactiveUtils,
ProjectParameters, geometryService, BufferParameters
  ) => {
    layerBufferDestiny = window.viewMap.map.findLayerById(
      $("#capaBuffer").val()
    );
    if ($("#ifSeleccionados").is(":checked")) {
      const bufferFeatures = featuresSelected.map((element) => {
        const geometry = element.feature.graphic.geometry;
        const bufferGeometry = geometryEngine.buffer(
          geometry,
          $("#distanciaInput").val(),
          $("#unidades").val()
        );
        if (bufferGeometry) {
          bufferGeometry.attributes = element.feature.graphic.attributes;
        }
        return bufferGeometry;
      });
      loadLayerBuffer(bufferFeatures);
    } else {
      const urlServiceGeometry = "https://pruebassig.igac.gov.co/server/rest/services/Utilities/Geometry/GeometryServer";

      layerBufferDestiny.queryFeatures().then((result) => {
        const geometriesLayer = result.features.map((feature) => {
          const geometry = feature.geometry;
          geometry.attributes = feature.attributes;
          return geometry;
        });
        
          const params = new BufferParameters({
            distances: [$("#distanciaInput").val()],
            unit: $("#unidades").val(),
            geodesic: true,
            bufferSpatialReference: {
              wkid: 3116
              },
            outSpatialReference: {
              wkid: 3116
              },
            geometries: geometriesLayer
          });
          geometryService.buffer(urlServiceGeometry, params).then(function(results){
           console.log(results)
          }).catch((error)=> {
console.error("Ocurrio un error haciendo el buffer de las geometrias: ", error);
          });
          
      });
    }
  });
}

function loadLayerBuffer(geometriesBuffer) {
  require(["esri/layers/FeatureLayer", "esri/Graphic"], (
    FeatureLayer,
    Graphic
  ) => {
    const graphicsLayer = [];
    layerBuffer = new FeatureLayer({
      title: "Capa Buffer",
      renderer: {
        type: "simple",
        symbol: {
          type: "simple-fill",
          color: [0, 0, 0, 0],
          style: "solid",
          outline: {
            color: "red",
            width: 1,
          },
        },
      },
      spatialReference: {
        wkid: 4218,
      },
    });
    layerBuffer.fields = layerBufferDestiny.fields.filter(
      (field) => field.type !== "geometry"
    );
    console.log("Se hizo el buffer: ", geometriesBuffer.length);
    geometriesBuffer.forEach((bufferGeometry) => {
      if(bufferGeometry){
        const bufferGraphic = new Graphic({
        geometry: bufferGeometry,
        attributes: bufferGeometry.attributes,
      });
      graphicsLayer.push(bufferGraphic);
      }
      
    });
    layerBuffer.source = graphicsLayer;
    viewMap.map.add(layerBuffer);
    viewMap.whenLayerView(layerBuffer).then(function (layerView) {
      $("#loadingAplicarBuffer").hide();
      $("#onAplicarBuffer").show();
      $("#btnDownloadBuffer").prop("disabled", false);
      $("#btnAplicarBuffer").removeClass("btn-primary");
      $("#btnAplicarBuffer").addClass("btn-success");
      $("#onAplicarBuffer").text("Capa cargada");
      $("#btnAplicarBuffer").prop("disabled", true);
      $("#ifSeleccionados").prop("checked", false);
      $("#infoSelectGeometrias").hide();
      if (featuresSelected.length) {
        featuresSelected.forEach((element) => {
          element.highlight.remove();
        });
        featuresSelected = [];

        eventClick.remove();
      }
    });
  });
}

function limpiarBuffer() {
  $("#capaBuffer")[0].selectedIndex = 0;
  $("#unidades")[0].selectedIndex = 0;
  $("#distanciaInput").val("");
  $("#btnAplicarBuffer").prop("disabled", true);
  $("#ifSeleccionados").prop("checked", false);
  $("#infoSelectGeometrias").hide();
  $("#btnDownloadBuffer").prop("disabled", true);
  if (featuresSelected.length) {
    featuresSelected.forEach((element) => {
      element.highlight.remove();
    });
    featuresSelected = [];
    eventClick.remove();
  }
}
