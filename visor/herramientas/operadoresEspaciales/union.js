var layerUnion;
var layerUnion1, layerUnion2;
 var fieldsLayerUnion;
 var featuresSelected1 = [], featuresSelected2 = [];
 var eventClick1, eventClick2;
 var unitedFeatures = [], unitedGraphics = [];

  function enableAplicarUnion(){
  if ($("#capa1Union").val()) {
    $("#capa2Union").prop('disabled', false);
    
    if(window.viewMap.map.findLayerById($("#capa1Union").val()) != layerUnion1){
      layerUnion1 = window.viewMap.map.findLayerById($("#capa1Union").val());
      $("#capa2Union option:not(:first)").remove();
      window.viewMap.map.layers.forEach((layer) => {
        if(layer.geometryType === layerUnion1.geometryType){
           $("#capa2Union").append(
        $("<option>", {
          value: layer.id,
        }).text(layer.title)
      );
        }
      });
    window.viewMap.goTo(layerUnion1.fullExtent);
    selectGeometriasUnion1();
    }
    
  }
  if ($("#capa2Union").val()) {
     if(window.viewMap.map.findLayerById($("#capa2Union").val()) != layerUnion2){
        layerUnion2 = window.viewMap.map.findLayerById($("#capa2Union").val());
    window.viewMap.goTo(layerUnion2.fullExtent);
    selectGeometriasUnion2();
     }
  
  }
    if ($("#capa1Union").val() && $("#capa2Union").val()) {
      $("#msgUnion").hide();
      $("#btnAplicarUnion").prop('disabled', false);
      $("#onAplicarUnion").text("Aplicar");
      setProgressBar(0);
      $("#btnAplicarUnion").removeClass("btn-success");
      $("#btnAplicarUnion").addClass("btn-primary");
    } else {
      $("#btnAplicarUnion").prop('disabled', true);
    }
  }
  
  function createUnion() {
    unitedFeatures = [];
 $("#loadingAplicarUnion").show();
    $("#onAplicarUnion").hide();
    const featuresUnion1 = featuresSelected1.map((feature1) => feature1.feature);
    const featuresUnion2 = featuresSelected2.map((feature2) => feature2.feature);
    setProgressBar(15);
    uniteFeatures(featuresUnion1, featuresUnion2);
}

  function uniteFeatures(features1, features2){
  
require(["esri/Graphic"], (Graphic) => {
    unitedFeatures = features1.concat(features2);
    setProgressBar(25);
    unitedGraphics = unitedFeatures.map((feature) => {
     return new Graphic({
        geometry: feature.geometry,
       attributes: feature.attributes
      });
    }); 
    setProgressBar(80);
    fieldsLayerUnion = features1[0].layer.fields.concat(features2[0].layer.fields);
      loadlayerUnion();
    });
  }

  function loadlayerUnion() {
    console.log("Cargando la capa resultante");
    require(["esri/layers/FeatureLayer"], (FeatureLayer) => { 
layerUnion = new FeatureLayer({
       title: "Capa Unión",
      renderer: {
        type: "simple",
        symbol: {
          type: "simple-fill",
          color: [0, 0, 0, 0],
          style: "solid",
          outline: {
            color: "red",
            width: 1
          }
        }
      }
    });
    layerUnion.fields = fieldsLayerUnion.filter(field => field.type !== "geometry"); 
      layerUnion.source = unitedGraphics;
        viewMap.map.add(layerUnion);
        viewMap.whenLayerView(layerUnion).then(function (layerView) {
          $("#loadingAplicarUnion").hide();
          $("#onAplicarUnion").show();
          $("#btnDownloadUnion").prop('disabled', false);
          $("#btnAplicarUnion").removeClass("btn-primary");
          $("#btnAplicarUnion").addClass("btn-success");
          $("#onAplicarUnion").text("Capa cargada");
          setProgressBar(100);
          $("#btnAplicarUnion").prop('disabled', true);
          $("#infoSelectGeometriasUnion1").hide();
          $("#infoSelectGeometriasUnion2").hide();
          viewMap.goTo(layerUnion.fullExtent);


          if (featuresSelected1.length) {
            featuresSelected1.forEach(featureSelect => {
              featureSelect.highlight.remove();
            });
            featuresSelected1 = [];
            eventClick1.remove();
          }
           if (featuresSelected2.length) {
            featuresSelected2.forEach(featureSelect => {
              featureSelect.highlight.remove();
            });
            featuresSelected2 = [];
            eventClick2.remove();
          }
  
        });
    });

    
  }
  
  function limpiarUnion() {
    $("#capa1Union")[0].selectedIndex = 0;
    $("#capa2Union")[0].selectedIndex = 0;
    $("#infoSelectGeometriasUnion1").hide();
    $("#infoSelectGeometriasUnion2").hide();
    $("#btnAplicarUnion").prop('disabled', true);
    $("#ifSelectUnion1").prop("checked", false);
     $("#ifSelectUnion2").prop("checked", false);
    $("#infoSelectGeometrias").hide();
    $("#btnDownloadUnion").prop('disabled', true);
     if (featuresSelected1.length) {
      featuresSelected1.forEach(element => {
        element.highlight.remove();
      });
      featuresSelected1 = [];
      eventClick1.remove();
    } 
    if (featuresSelected2.length) {
      featuresSelected2.forEach(element => {
        element.highlight.remove();
      });
      featuresSelected2 = [];
      eventClick2.remove();
    } 
  
  }

  function selectGeometriasUnion1(){
    if(eventClick2){
      eventClick2.remove();
    }
      $("#infoSelectGeometriasUnion1").show();
      $("#infoSelectGeometriasUnion1").text("Seleccione las geometrías a unir de la capa 1 con un clic");
      let layerView1;
      window.viewMap.whenLayerView(layerUnion1).then((layerView) => layerView1 = layerView);
      eventClick1 = window.viewMap.on("click", (event) => {

        var clickPoint1 = window.viewMap.toMap({ x: event.x, y: event.y });

    var query = layerUnion1.createQuery();
    query.geometry = clickPoint1;
    query.spatialRelationship = "intersects"; 
    layerUnion1.queryFeatures(query)
      .then(function(result) {
        if (result.features.length > 0) {
var geometry = result.features[0].geometry;
          var elementDuplicate = featuresSelected1.find(element => JSON.stringify(element.feature.geometry.toJSON()) === JSON.stringify(geometry.toJSON()));
            if (!elementDuplicate) {
              featuresSelected1.push(
                {
                  feature: result.features[0],
                  highlight: layerView1.highlight(result.features[0])
                }
              );
            } else {
              elementDuplicate.highlight.remove();
              featuresSelected1 = featuresSelected1.filter(element => element !== elementDuplicate);
  
            }
            $("#infoSelectGeometriasUnion1").text(`${featuresSelected1.length} geometrías seleccionadas`);
        }
      });
      });
  }

  function selectGeometriasUnion2(){
    if(eventClick1){
      eventClick1.remove();
    }
    
      $("#infoSelectGeometriasUnion2").show();
      $("#infoSelectGeometriasUnion2").text("Seleccione las geometrías a unir de la capa 2 con un clic");

      let layerView2;
      window.viewMap.whenLayerView(layerUnion2).then((layerView) => layerView2 = layerView);
      eventClick2 = window.viewMap.on("click", (event) => {
         var clickPoint2 = window.viewMap.toMap({ x: event.x, y: event.y });

    var query = layerUnion2.createQuery();
    query.geometry = clickPoint2;
    query.spatialRelationship = "intersects"; 
    layerUnion2.queryFeatures(query)
      .then(function(result) {
        if (result.features.length > 0) {
var geometry = result.features[0].geometry;
          var elementDuplicate = featuresSelected2.find(element => JSON.stringify(element.feature.geometry.toJSON()) === JSON.stringify(geometry.toJSON()));
            if (!elementDuplicate) {
              featuresSelected2.push(
                {
                  feature: result.features[0],
                  highlight: layerView2.highlight(result.features[0])
                }
              );
            } else {
              elementDuplicate.highlight.remove();
              featuresSelected2 = featuresSelected2.filter(element => element !== elementDuplicate);
  
            }
            $("#infoSelectGeometriasUnion2").text(`${featuresSelected2.length} geometrías seleccionadas`);
        }
      });
      });
  }
