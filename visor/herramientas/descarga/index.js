function downloadLayer(formato, layer) {
    var queryJoin = layer.createQuery();
    queryJoin.outFields = ["*"]; 
    
    switch (formato) {
      case 'xlsx':
        layer.queryFeatures(queryJoin).then((result) => {
          const dataJoin = result.features.map(function (featureJoin) {
            return featureJoin.attributes;
          });
           const xlsxDownload = XLSX.utils.book_new();
           const sheet = XLSX.utils.json_to_sheet(dataJoin);
           XLSX.utils.book_append_sheet(xlsxDownload, sheet, 'Datos Exportados');
           XLSX.writeFile(xlsxDownload, 'Datos_Exportados.xlsx');
        });
        break;
  
        case 'csv':
        layer.queryFeatures(queryJoin).then((result) => {
          const dataJoin = result.features.map(function (featureJoin) {
            return featureJoin.attributes;
          });
           const xlsxDownload = XLSX.utils.book_new();
           const sheet = XLSX.utils.json_to_sheet(dataJoin);
           XLSX.utils.book_append_sheet(xlsxDownload, sheet, 'Datos Exportados');
           XLSX.writeFile(xlsxDownload, 'Datos_Exportados.csv', {bookType: "csv"});
        });
       
        break;
  
        case 'geojson':
      
        var geoJSON = {
          type: 'FeatureCollection',
          features: []
      };
      let geometry;
      layer.queryFeatures(queryJoin).then(function (results) {
          results.features.forEach(function (feature) {
              var geometryJSON = feature.geometry.toJSON();
              let typeGeometry = feature.geometry.type;
              switch (typeGeometry) {
                case "point":
                 geometry = {
                type: "Point",
                coordinates: [geometryJSON.x , geometryJSON.y]
              }
                break;
  case "polyline":
 geometry = {
                type: "LineString",
                coordinates: geometryJSON.paths[0]
              }
  break;
   case "polygon":
 geometry = {
                type: "Polygon",
                coordinates: geometryJSON.rings
              }
              console.log(geometry);
   break;
              }
             
              var properties = feature.attributes;
              var featureJSON = {
                  type: 'Feature',
                  geometry: geometry,
                  properties: properties
              };
              geoJSON.features.push(featureJSON);
          });
          var stringGeoJSON = JSON.stringify(geoJSON);
       const download = document.createElement('a');
  download.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(stringGeoJSON));
  download.setAttribute('download', 'Datos Exportados.json');
  download.style.display = 'none';
  document.body.appendChild(download);
  download.click();
  document.body.removeChild(download);
      });         
        break;
    }
  }