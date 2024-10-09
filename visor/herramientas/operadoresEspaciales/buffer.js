var featuresSelected = [];
var eventClick;
var layerBufferDestiny;
var geometriesBuffer = [];

function selectGeometriasBuffer() {
    let layerViewDestiny;
    window.viewMap.whenLayerView(layerBufferDestiny)
      .then((layerView) => (layerViewDestiny = layerView));
    eventClick = window.viewMap.on("click", (event) => {
      var clickPoint = window.viewMap.toMap({ x: event.x, y: event.y });
      var query = layerBufferDestiny.createQuery();
      query.geometry = clickPoint;
      query.spatialRelationship = "intersects"; 
      layerBufferDestiny.queryFeatures(query)
        .then(function(result) {
 if (result.features.length) {
  var geometry = result.features[0].geometry;
          var elementDuplicate = featuresSelected.find(
            (element) =>
              JSON.stringify(element.feature.geometry.toJSON()) ===
              JSON.stringify(geometry.toJSON())
          );
          if (!elementDuplicate) {
            featuresSelected.push({
              feature: result.features[0],
              highlight: layerViewDestiny.highlight(result.features[0]),
            });
          } else {
            elementDuplicate.highlight.remove();
            featuresSelected = featuresSelected.filter(
              (element) => element !== elementDuplicate
            );
          }
          $("#infoSelectGeometriasBuffer").text(
            `${featuresSelected.length} geometría${featuresSelected.length > 1? 's':''} seleccionada${featuresSelected.length > 1? 's':''}`
          );
        }
        });
    });
}

function enableAplicarBuffer() {
  
  if ($("#capaBuffer").val()) {
    if(window.viewMap.map.findLayerById($("#capaBuffer").val()) != layerBufferDestiny){
      $("#infoSelectGeometriasBuffer").show();
      $("#infoSelectGeometriasBuffer").text("Seleccione las entidades sobre las que desea hacer el buffer con un clic en el mapa");
 layerBufferDestiny = window.viewMap.map.findLayerById($("#capaBuffer").val());
    window.viewMap.goTo(layerBufferDestiny.fullExtent);
     selectGeometriasBuffer();
    }
  }
  if (
    $("#capaBuffer").val() &&
    $("#unidades").val() &&
    $("#distanciaInput").val()
  ) {
    $("#btnAplicarBuffer").prop("disabled", false);
    $("#onAplicarBuffer").text("Aplicar");
    setProgressBar(0);
    $("#btnAplicarBuffer").removeClass("btn-success");
    $("#btnAplicarBuffer").addClass("btn-primary");
  } else {
    $("#btnAplicarBuffer").prop("disabled", true);
  }
}

function createBuffer() {
  $("#loadingAplicarBuffer").show();
  $("#onAplicarBuffer").hide();
  geometriesBuffer = [];
const geometriesSelect = featuresSelected.map((feature) => {
        const geometry = feature.feature.geometry;
        geometry.attributes = feature.feature.attributes
        return geometry
      });
      setProgressBar(10);
      bufferGeometries(geometriesSelect);
}

function bufferGeometries(geometries){
  require(["esri/geometry/geometryEngineAsync"], (geometryEngineAsync) => {
   geometries.forEach(async (geometry, index) => {
    
      let bufferGeometry = geometryEngineAsync.buffer(
          geometry,
          $("#distanciaInput").val(),
          $("#unidades").val()
        );
        bufferGeometry.then((geometryBuffer) => {
 
 setProgressBar(getProgressBar() + (80/geometries.length));

        if (bufferGeometry) {
          geometryBuffer.attributes = geometry.attributes;
          geometriesBuffer.push(geometryBuffer);

          console.log(geometryBuffer, index, geometries.length);
          if(geometriesBuffer.length === geometries.length){
            loadLayerBuffer();
          }
        }
        });
       
    });
    });
}

function loadLayerBuffer() {
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
      setProgressBar(100);
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
