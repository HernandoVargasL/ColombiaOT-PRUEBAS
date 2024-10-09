var layerIntersect;
var layerIntersect1, layerIntersect2;
 var geometriesLayer1, geometriesLayer2;
 var featuresSelected1 = [], featuresSelected2 = [];
 var eventClick1, eventClick2;
 var intersectingGeometries = [];

function enableAplicarIntersect(){
  if ($("#capa1Intersect").val()) {
    if(window.viewMap.map.findLayerById($("#capa1Intersect").val()) != layerIntersect1){
     layerIntersect1 = window.viewMap.map.findLayerById( $("#capa1Intersect").val());
     $("#infoSelectGeometriasIntersect1").show();
     $("#infoSelectGeometriasIntersect1").text("Seleccione las entidades que desea intersecar de la capa 1 con un clic en el mapa");
    window.viewMap.goTo(layerIntersect1.fullExtent);
   selectGeometriasIntersect1();
    }
  }
  if ($("#capa2Intersect").val()) {
    if(window.viewMap.map.findLayerById($("#capa2Intersect").val()) != layerIntersect2){
 $("#ifSelectIntersect2").prop('disabled', false);
    layerIntersect2 = window.viewMap.map.findLayerById($("#capa2Intersect").val());
    $("#infoSelectGeometriasIntersect2").show();
     $("#infoSelectGeometriasIntersect2").text("Seleccione las entidades que desea intersecar de la capa 2 con un clic en el mapa");
    window.viewMap.goTo(layerIntersect2.fullExtent);
    selectGeometriasIntersect2();
    }
  }
    if ($("#capa1Intersect").val() && $("#capa2Intersect").val()) {
      $("#msgIntersect").hide();
      $("#btnAplicarIntersect").prop('disabled', false);
      $("#onAplicarIntersect").text("Aplicar");
      setProgressBar(0);
      $("#btnAplicarIntersect").removeClass("btn-success");
      $("#btnAplicarIntersect").addClass("btn-primary");
    } else {
      $("#btnAplicarIntersect").prop('disabled', true);
    }
  }
  
  async function createIntersect() {
    intersectingGeometries = [];
 $("#loadingAplicarIntersect").show();
    $("#onAplicarIntersect").hide();

    geometriesLayer1 = featuresSelected1.map((feature1) => {
      const geometry = feature1.feature.geometry;
      geometry.attributes = feature1.feature.attributes;
      return geometry;
    });
    setProgressBar(5);
    geometriesLayer2 = featuresSelected2.map((feature2) => {
      const geometry = feature2.feature.geometry;
      geometry.attributes = feature2.feature.attributes;
      return geometry;
    });
    setProgressBar(15);
    intersectGeometries(geometriesLayer1, geometriesLayer2);    
  }

 function  intersectGeometries (geometries1, geometries2){
require(["esri/geometry/geometryEngineAsync", "esri/Graphic"], (geometryEngineAsync, Graphic) => {
  var countIntersect = 0;
      var totalProgress = geometries1.length;
      $("#msgIntersect").hide();
     geometries1.forEach(function(geometry1, index) {
       geometries2.forEach(async function(geometry2) { 
        console.log(countIntersect, index);
        try {
  if (await geometryEngineAsync.intersects(geometry1, geometry2)) {
countIntersect++;
        var geometryIntersect = await geometryEngineAsync.intersect(geometry1, geometry2);
        if(geometryIntersect){
         var intersectAttributes = Object.assign({}, geometry1.attributes, geometry2.attributes);
          var intersectGraphic = new Graphic({
             geometry: geometryIntersect,
           attributes: intersectAttributes
           });
       intersectingGeometries.push(intersectGraphic);
       setProgressBar(getProgressBar() + (80/totalProgress));
      if(intersectingGeometries.length === countIntersect){
         loadlayerIntersect();
       } 
       }
     }else{
      if((index + 1) === totalProgress && countIntersect === 0){
          $("#msgIntersect").show();
          $("#loadingAplicarIntersect").hide();
         $("#onAplicarIntersect").show();
          $("#onAplicarIntersect").text("Aplicar");
          $("#btnAplicarIntersect").prop('disabled', true);
          setProgressBar(0);
      }
     }   
    }catch (error) {
          console.log("Error intersecando las geometrias: ", error);
        }     
         });
         
       });
       
    });    
  }

  function loadlayerIntersect() {
    console.log("Cargando la capa resultante");
    require(["esri/layers/FeatureLayer"], (FeatureLayer) => { 
layerIntersect = new FeatureLayer({
      title: "Capa Intersección",
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
    var intersectFields = layerIntersect1.fields.concat(layerIntersect2.fields);
      intersectFields =  Array.from(new Map(intersectFields.map(obj => [obj.name, obj])).values());
      layerIntersect.fields = intersectFields.filter(field => field.type !== "geometry");
        layerIntersect.source = intersectingGeometries;
        viewMap.map.add(layerIntersect);
        viewMap.whenLayerView(layerIntersect).then(function (layerView) {
          $("#loadingAplicarIntersect").hide();
          $("#onAplicarIntersect").show();
          $("#btnDownloadIntersect").prop('disabled', false);
          $("#btnAplicarIntersect").removeClass("btn-primary");
          $("#btnAplicarIntersect").addClass("btn-success");
          $("#onAplicarIntersect").text("Capa cargada");
          setProgressBar(100);
          $("#btnAplicarIntersect").prop('disabled', true);
          $("#ifSelectIntersect1").prop("checked", false);
          $("#ifSelectIntersect2").prop("checked", false);
          $("#infoSelectGeometrias1").hide();
          $("#infoSelectGeometrias2").hide();


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
  
  function limpiarIntersect() {
    $("#capa1Intersect")[0].selectedIndex = 0;
    $("#capa2Intersect")[0].selectedIndex = 0;
    $("#btnAplicarIntersect").prop('disabled', true);
    $("#ifSelectIntersect1").prop("checked", false);
     $("#ifSelectIntersect2").prop("checked", false);
    $("#infoSelectGeometrias").hide();
    $("#btnDownloadIntersect").prop('disabled', true);
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

  function selectGeometriasIntersect1(){
    if(eventClick2){
      eventClick2.remove();
    }
      let layerView1;
      window.viewMap.whenLayerView(layerIntersect1).then((layerView) => layerView1 = layerView);
      eventClick1 = window.viewMap.on("click", (event) => {
        var clickPoint1 = window.viewMap.toMap({ x: event.x, y: event.y });
    var query = layerIntersect1.createQuery();
    query.geometry = clickPoint1;
    query.spatialRelationship = "intersects"; 
    layerIntersect1.queryFeatures(query)
      .then(function(result) {
 if (result.features.length) {
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
            $("#infoSelectGeometriasIntersect1").text(`${featuresSelected1.length} geometría${featuresSelected1.length > 1? 's':''} seleccionada${featuresSelected1.length > 1? 's':''}`);
  
          }
      });
      });
  }

  function selectGeometriasIntersect2(){
    if(eventClick1){
      eventClick1.remove();
    }
        let layerView2;
      window.viewMap.whenLayerView(layerIntersect2).then((layerView) => layerView2 = layerView);
      eventClick2 = window.viewMap.on("click", (event) => {
        var clickPoint2 = window.viewMap.toMap({ x: event.x, y: event.y });
        var query = layerIntersect2.createQuery();
        query.geometry = clickPoint2;
        query.spatialRelationship = "intersects"; 
        layerIntersect2.queryFeatures(query)
          .then(function(result) {
          if (result.features.length) {
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
            $("#infoSelectGeometriasIntersect2").text(`${featuresSelected2.length} geometría${featuresSelected2.length > 1? 's':''} seleccionada${featuresSelected2.length > 1? 's':''}`);
  
          }
        });
      });
  }
