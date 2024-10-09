var layerIntersect;
var layerIntersect1, layerIntersect2;
 var geometriesLayer1, geometriesLayer2;
 var featuresSelected1 = [], featuresSelected2 = [];
 var eventClick1, eventClick2;
 var intersectingGeometries = [];

function enableAplicarIntersect(){
  if ($("#capa1Intersect").val()) {
    layerIntersect1 = window.viewMap.map.findLayerById(
      $("#capa1Intersect").val()
    );
    window.viewMap.goTo(layerIntersect1.fullExtent);
    $("#ifSelectIntersect1").prop('disabled', false);
  }
  if ($("#capa2Intersect").val()) {
    $("#ifSelectIntersect2").prop('disabled', false);
    layerIntersect2 = window.viewMap.map.findLayerById(
      $("#capa2Intersect").val()
    );
    window.viewMap.goTo(layerIntersect2.fullExtent);
    
  }
    if ($("#capa1Intersect").val() && $("#capa2Intersect").val()) {
      $("#msgIntersect").hide();
      $("#btnAplicarIntersect").prop('disabled', false);
      $("#onAplicarIntersect").text("Aplicar");
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

    if ($("#ifSelectIntersect1").is(":checked") || $("#ifSelectIntersect2").is(":checked")) {
      if($("#ifSelectIntersect1").is(":checked") && $("#ifSelectIntersect2").is(":checked")){
        geometriesLayer1 = featuresSelected1.map((feature) => {
          const geometry = feature.feature.graphic.geometry;
          geometry.attributes = feature.feature.graphic.attributes;
          return geometry;
        });
        geometriesLayer2 = featuresSelected2.map((feature) => {
          const geometry = feature.feature.graphic.geometry;
          geometry.attributes = feature.feature.graphic.attributes;
          return geometry;
        });
        intersectGeometries(geometriesLayer1, geometriesLayer2);
      }else{
        if($("#ifSelectIntersect1").is(":checked")){
         
          geometriesLayer1 = featuresSelected1.map((feature) => {
            const geometry = feature.feature.graphic.geometry;
            geometry.attributes = feature.feature.graphic.attributes;
            return geometry;
          });

          require(["esri/core/reactiveUtils"], (reactiveUtils) => { 
            window.viewMap.goTo(layerIntersect2.fullExtent);
            window.viewMap.whenLayerView(layerIntersect2).then(function (layerView) {
            layerIntersect2.outFields = ["*"];
            let layerViewUpdate = reactiveUtils.when(
              () => !layerView.updating,
              () => {
                const geometriesLayerView = layerView
                  .queryFeatures()
                  .then(function (results) {
                    return results.features.map((feature) => {
                      const geometry = feature.geometry;
                      if(geometry){
                        geometry.attributes = feature.attributes;
                      return geometry;
                      }
                      
                    });
                  });
                geometriesLayerView
                  .then((geometries) => {
                    geometriesLayer2 = geometries;
                    intersectGeometries(geometriesLayer1, geometriesLayer2);
                    layerViewUpdate.remove();
                  })
                  .catch((error) => {
                    console.error(
                      "Error al hacer el intersect con el layerview de la capa1: ",
                      error
                    );
                  });
              }
            );
          });
           });

        
        }else{
          if($("#ifSelectIntersect2").is(":checked")){
            geometriesLayer2 = featuresSelected2.map((feature) => {
              const geometry = feature.feature.graphic.geometry;
              geometry.attributes = feature.feature.graphic.attributes;
              return geometry;
            });

          require(["esri/core/reactiveUtils"], (reactiveUtils) => { 
            window.viewMap.goTo(layerIntersect1.fullExtent);
              window.viewMap.whenLayerView(layerIntersect1).then(function (layerView) {
            layerIntersect1.outFields = ["*"];
            let layerViewUpdate = reactiveUtils.when(
              () => !layerView.updating,
              () => {
                const geometriesLayerView = layerView
                  .queryFeatures()
                  .then(function (results) {
                    return results.features.map((feature) => {
                      const geometry = feature.geometry;
                     geometry.attributes = feature.attributes;
                      return geometry;
                    });
                  });
                geometriesLayerView
                  .then((geometries) => {
                    geometriesLayer1 = geometries;
                    intersectGeometries(geometriesLayer1, geometriesLayer2);
                    layerViewUpdate.remove();
                  })
                  .catch((error) => {
                    console.error(
                      "Error al hacer el intersect con el layerview de la capa1: ",
                      error
                    );
                  });
              }
            );
          });
           });
        }
        }
      }

    }else{
 layerIntersect1.outFields = ["*"];
      layerIntersect2.outFields = ["*"];
      window.viewMap.goTo(layerIntersect1.fullExtent).then(() => {
        const layer1Geometries = layerIntersect1.queryFeatures()
        .then((result1) => {
          return result1.features.map(function(feature) {
            const geometry = feature.geometry;
            geometry.attributes = feature.attributes;
            return geometry;
        });
        });
      layer1Geometries.then((geometries1) => {
          console.log("Se obtuvieron las geometrias de la capa1, obteniendo las de la capa 2", geometries1);
          const layer2Geometries = layerIntersect2.queryFeatures()
        .then((result2) => {
          return result2.features.map(function(feature) {
            const geometry = feature.geometry;
            geometry.attributes = feature.attributes;
            return geometry;
        });
        });
      layer2Geometries.then((geometries2) => {
 console.log("Se obtuvieron las geometrias de la capa2, intersecando geometrias", geometries2);
intersectGeometries(geometries1, geometries2);
      }).catch((error) => {
 console.error("Error al obtener las geometrias de la capa 2", error);
      });
        }).catch((error) => {
          console.error("Error al obtener las geometrias de la capa 1", error);
      });
    });
  }
  }

  function intersectGeometries(geometries1, geometries2){
    require(["esri/geometry/geometryEngine", "esri/Graphic", "esri/rest/geometryService"], (geometryEngine, Graphic, geometryService) => {
      var totalProgress = geometries1.length;
     geometries1.forEach(function(geometry1, index) {
       geometries2.forEach(function(geometry2) { 
        try {
  if (geometryEngine.intersects(geometry1, geometry2)) {
    console.log("Se intersecan");
        var geometryIntersect = geometryEngine.intersect(geometry1, geometry2);
        if(geometryIntersect){
         var intersectAttributes = Object.assign({}, geometry1.attributes, geometry2.attributes);
          var intersectGraphic = new Graphic({
             geometry: geometryIntersect,
           attributes: intersectAttributes
           });
       intersectingGeometries.push(intersectGraphic);
       }
     }}catch (error) {
          console.log("Error intersecando las geometrias: ", error);
        }
             
               
         });
         var porcentaje = ((index + 1) / totalProgress) * 100;
         porcentaje = parseInt(porcentaje);
         console.log(`Intersecando geometrias: ${porcentaje}%`);
       });


       if (intersectingGeometries.length) {
         console.log("Se intersecaron: ", intersectingGeometries.length);
        loadlayerIntersect();
       } else {
         $("#msgIntersect").show();
          $("#loadingAplicarIntersect").hide();
         $("#onAplicarIntersect").show();
          $("#onAplicarIntersect").text("Aplicar");
          $("#btnAplicarIntersect").prop('disabled', true);
       }
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
        //console.log(layerIntersect)
        viewMap.whenLayerView(layerIntersect).then(function (layerView) {
          $("#loadingAplicarIntersect").hide();
          $("#onAplicarIntersect").show();
          $("#btnDownloadIntersect").prop('disabled', false);
          $("#btnAplicarIntersect").removeClass("btn-primary");
          $("#btnAplicarIntersect").addClass("btn-success");
          $("#onAplicarIntersect").text("Capa cargada");
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

  function getAttributes(numberLayer, attributesFeature){
    
    switch (numberLayer) {
      case 1:
        return featuresLayer1.features.find(function (featureMatch) {
          return (
            attributesFeature[Object.keys(attributesFeature)[0]] ===
            featureMatch.attributes[Object.keys(attributesFeature)[0]]
          );
        });
        var geometryIntersect = geometryEngine.intersect(geometry1, geometry2);
        //   if(geometryIntersect){
        //    var intersectAttributes = Object.assign({}, geometry1.attributes, geometry2.attributes);
        //     var intersectGraphic = new Graphic({
        //        geometry: geometryIntersect,
        //      attributes: intersectAttributes
        //      });
        //  intersectingGeometries.push(intersectGraphic);
        //  }
    
        case 2:
          return featuresLayer2.features.find(function (featureMatch) {
            return (
              attributesFeature[Object.keys(attributesFeature)[0]] ===
              featureMatch.attributes[Object.keys(attributesFeature)[0]]
            );
          });
    }
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
    if ($("#ifSelectIntersect1").is(":checked")) {
      $("#infoSelectGeometrias1").text("Seleccione las entidades que desea con un clic");
      $("#infoSelectGeometrias1").show();
      layerIntersect1 = window.viewMap.map.findLayerById($("#capa1Intersect").val());
      layerIntersect1.outFields = ["*"];
      const opts1 = {
        include: layerIntersect1
      };
      let layerView1;
      window.viewMap.whenLayerView(layerIntersect1).then((layerView) => layerView1 = layerView);
      eventClick1 = window.viewMap.on("click", (event) => {
        window.viewMap.hitTest(event, opts1).then((response) => {
          if (response.results.length) {
            var elementDuplicate = featuresSelected1.find(element => JSON.stringify(element.feature.graphic.geometry.toJSON()) === JSON.stringify(response.results[0].graphic.geometry.toJSON()));
            if (!elementDuplicate) {
              featuresSelected1.push(
                {
                  feature: response.results[0],
                  highlight: layerView1.highlight(response.results[0].graphic)
                }
              );
            } else {
              elementDuplicate.highlight.remove();
              featuresSelected1 = featuresSelected1.filter(element => element !== elementDuplicate);
  
            }
            $("#infoSelectGeometrias1").text(`${featuresSelected1.length} geometrías seleccionadas`);
  
          }
        });
      });

    }else {
      $("#infoSelectGeometrias1").hide();
      
      featuresSelected1.forEach(featureSelect => {
        featureSelect.highlight.remove();
      });
      featuresSelected1 = [];
      eventClick1.remove();
    }
  }

  function selectGeometriasIntersect2(){
    if(eventClick1){
      eventClick1.remove();
    }
    if ($("#ifSelectIntersect2").is(":checked")) {
      $("#infoSelectGeometrias2").text("Seleccione las entidades que desea con un clic");
      $("#infoSelectGeometrias2").show();
      layerIntersect2 = window.viewMap.map.findLayerById($("#capa2Intersect").val());
      layerIntersect2.outFields = ["*"];
      const opts2 = {
        include: layerIntersect2
      };
      let layerView2;
      window.viewMap.whenLayerView(layerIntersect2).then((layerView) => layerView2 = layerView);
      eventClick2 = window.viewMap.on("click", (event) => {
        window.viewMap.hitTest(event, opts2).then((response) => {
          if (response.results.length) {
            var elementDuplicate = featuresSelected2.find(element => JSON.stringify(element.feature.graphic.geometry.toJSON()) === JSON.stringify(response.results[0].graphic.geometry.toJSON()));
            if (!elementDuplicate) {
              featuresSelected2.push(
                {
                  feature: response.results[0],
                  highlight: layerView2.highlight(response.results[0].graphic)
                }
              );
            } else {
              elementDuplicate.highlight.remove();
              featuresSelected2 = featuresSelected1.filter(element => element !== elementDuplicate);
  
            }
            $("#infoSelectGeometrias2").text(`${featuresSelected2.length} geometrías seleccionadas`);
  
          }
        });
      });

    }else {
      $("#infoSelectGeometrias2").hide();
      
      featuresSelected2.forEach(featureSelect => {
        featureSelect.highlight.remove();
      });
      featuresSelected2 = [];
      eventClick2.remove();
    }
  }

