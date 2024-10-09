function cargarCapa(urlCapa) {
    require(["esri/layers/FeatureLayer", "esri/rest/geometryService", "esri/rest/support/ProjectParameters"], (FeatureLayer, geometryService, ProjectParameters) => { 
        var featureLayer = new FeatureLayer({
            url: urlCapa
          });
          // const urlServiceGeometry = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/Geometry/GeometryServer";
          window.viewMap.map.add(featureLayer);
    /*       window.viewMap.whenLayerView(featureLayer)
          .then(function(layerView) {
            var layerSpatialReference = layerView.layer.spatialReference;
            if (!layerSpatialReference.equals(window.origenNacional)) {
              var query = featureLayer.createQuery();
              featureLayer.queryFeatures(query).then(function(response) {
                var geometriesLayer = response.features.map(function(feature) {
                  return feature.geometry;
                });
                  var projectParameters = new ProjectParameters({
                    geometries: geometriesLayer,
                outSpatialReference: window.origenNacional
              });
                 geometryService.project(urlServiceGeometry, projectParameters)
                .then(function(projectedGeometries) {
                   response.features.forEach(function(feature, index) {
          feature.geometry = projectedGeometries[index];
        });
       featureLayer.spatialReference = window.origenNacional;
        
                })
                .catch(function(error) {
                  console.error("Error al proyectar la capa:", error);
                });

                
              }).catch(function(error) {
                console.error("Error al consultar features:", error);
              });


           
            }
          })
          .catch(function(error) {
            console.error("Error al crear el layerview de la capa:", error);
          }); */
          
          
        });
}