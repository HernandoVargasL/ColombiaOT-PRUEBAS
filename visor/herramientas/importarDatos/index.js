function gotoImportar() {
  currentScreen = "importar";
  reporteUso("Abrir Importar");
  toggleMenu("small");
  minAll();
  fetch("./herramientas/importarDatos/index.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("panelImportar").innerHTML = data;

      const popoverTriggerList = document.querySelectorAll(
        '[data-bs-toggle="popover"]'
      );
      const popoverList = [...popoverTriggerList].map(
        (popoverTriggerEl) => new bootstrap.Popover(popoverTriggerEl)
      );

      $("#panelImportar").draggable({
        handle: ".panel-mover",
        containment: "#mapViewDiv",
      });

      $("#collapseImportar").on("shown.bs.collapse", (event) => {
        var windowPosition = $("#panelImportar").position();
        var parentPosition = $("#mapViewDiv").position();
        var windowHeight = $("#panelImportar").outerHeight();
        var parentHeight = $("#mapViewDiv").height();
        var windowWidth = $("#panelImportar").outerWidth();
        var parentWidth = $("#mapViewDiv").width();
        if (Math.abs(windowPosition.left) + windowWidth > parentWidth) {
          $("#panelImportar").offset({ left: parentPosition.left });
        }

        if (windowPosition.top + windowHeight > parentHeight) {
          $("#panelImportar").css("top", parentHeight - windowHeight);
        }
      });
    })
    .catch((error) => console.error("Error al cargar el contenido: ", error));
  $("#panelImportar").show();
}

function closeImportar() {
  $("#panelImportar").hide();
}

function changeFuenteDatos() {
  switch ($("#otherServicesType").val()) {
    case "file":
      $("#otherServicesFromUrl2").hide();
      $("#otherServicesFromFile").show();
      $("#otherServicesFromUrl").hide();
      $("#otherServicesFromFileFormat").show();

      break;

    case "url":
      $("#otherServicesFromUrl2").show();
      $("#otherServicesFromFile").hide();
      $("#otherServicesFromUrl").show();
      $("#otherServicesFromFileFormat").hide();
      break;
  }
}

function loadService(){
  
  var serviceName = ($("#otherServicesName").val() == "" ? "Servicio Importado" : $("#otherServicesName").val());
  if ($("#otherServicesType").val() == "url") {
    showLoading("Cargando el servicio", "loading", "gold", false);
    require(["esri/layers/FeatureLayer", "esri/layers/MapImageLayer", "esri/layers/ImageryLayer", "esri/layers/GeoJSONLayer", "esri/layers/WMSLayer", "esri/geometry/Extent"], (FeatureLayer, MapImageLayer, ImageryLayer, GeoJSONLayer, WMSLayer, Extent) => { 
       var _url = $("#otherServicesUrl").val();
    if (checkURL(_url.trim(), true)) {
      switch ($("#otherServicesUrlType").val()) {
        case "Arcgis FeatureLayer":
          var tlayer = new FeatureLayer({
            url: _url.trim(),
            title: serviceName,
            outFields: ["*"]
        });
        window.viewMap.map.add(tlayer);
        tlayer.on("layerview-create-error", function(event) {
         showLoading("No se pudo cargar la capa de informaci&oacute;n", null, "red", true);
        });

        tlayer.when(() => {
           showLoading("Servicio cargado exitosamente", "ok", "green", true);
          const initialExtent = Extent.fromJSON(tlayer.sourceJSON.initialExtent);
          console.log("Se cargo: ", tlayer, "con extent: ", initialExtent);
           window.viewMap.goTo(tlayer.fullExtent);
        });

          break;

        case  "Arcgis MapServer":
            var tlayer = new MapImageLayer({
              url: _url.trim(),
              title: serviceName,
              id: serviceName
          });
          window.viewMap.map.add(tlayer);
          tlayer.on("layerview-create-error", function(event) {
           showLoading("No se pudo cargar la capa de informaci&oacute;n", null, "red", true);
          });
          tlayer.when(() => {
            showLoading("Servicio cargado exitosamente", "ok", "green", true);
           const initialExtent = Extent.fromJSON(tlayer.sourceJSON.initialExtent);
            window.viewMap.goTo(initialExtent);
         });
 
            break;

            case  "Arcgis ImageServer":
              var tlayer =  new ImageryLayer({
                url: _url.trim(),
                title: serviceName,
  
                format: "jpgpng"
            });
            window.viewMap.map.add(tlayer);
            tlayer.on("layerview-create-error", function(event) {
             showLoading("No se pudo cargar la capa de informaci&oacute;n", null, "red", true);
            });
            tlayer.when(() => {
              showLoading("Servicio cargado exitosamente", "ok", "green", true);
             const initialExtent = Extent.fromJSON(tlayer.sourceJSON.initialExtent);
              window.viewMap.goTo(initialExtent);
           });
   
              break;
      
              case  "GEOJSON":
                var tlayer =  new GeoJSONLayer({
                  url: _url.trim(),
                  title: serviceName,
                  id: serviceName
              });
                  window.viewMap.map.add(tlayer);
                  tlayer.on("layerview-create-error", function(event) {
                   showLoading("No se pudo cargar la capa de informaci&oacute;n", null, "red", true);
                  });
                  tlayer.when(() => {
                    showLoading("Servicio cargado exitosamente", "ok", "green", true);
                   const initialExtent = Extent.fromJSON(tlayer.sourceJSON.initialExtent);
                    window.viewMap.goTo(initialExtent);
                 });
         
                break;
      
                case  "WMS":
                  var tlayer =  new WMSLayer({
                    url: _url.trim(),
                    title: serviceName,
      
                    featureInfoFormat: "application/json",
                    name: serviceName,
                    title: serviceName
                });
                window.viewMap.map.add(tlayer);
                  tlayer.on("layerview-create-error", function(event) {
                   showLoading("No se pudo cargar la capa de informaci&oacute;n", null, "red", true);
                  });
                  tlayer.when(() => {
                    showLoading("Servicio cargado exitosamente", "ok", "green", true);
                   const initialExtent = Extent.fromJSON(tlayer.sourceJSON.initialExtent);
                    window.viewMap.goTo(initialExtent);
                 });
         
                  break;
      
              }
    } else {
        showLoading("Por favor, verifica la dirección ingresada", null, "red", true);
    }
     });

   
}else{
  if ($("#otherServicesType").val() == "file") {
    showLoading("Cargando archivo", "loading", "gold", false);
    var formData = new FormData($("#otherServicesFileData")[0]);
    switch ($("#otherServicesFromFileFormat2").val()) {
      case "kml":
      

      var file = document.getElementById("fileUpload").files[0];
      if (file) {

          var reader = new FileReader();
          reader.readAsText(file, "UTF-8");

          reader.onload = function (evt) {
              var formData2 = new FormData();
              formData2.append("kmlString", encodeURIComponent(evt.target.result));
              formData2.append("model", "simple");
              formData2.append("folders", "");
              formData2.append("outSR", JSON.stringify({
                  "wkid": 4326
              }));

              $.ajax({
                  url: "https://utility.arcgis.com/sharing/kml",
                  type: 'POST',
                  data: formData2,
                  dataType: 'json',
                  success: function (data) {
                    console.log(data)
                      closeLoading();
                      var datosKML = data.featureCollection.layers[0];

                      if (datosKML.featureSet.features.length > 0) {
                          var tipoKML = datosKML.layerDefinition.geometryType;

                          if (tipoKML == 'esriGeometryPolygon') {
                              tipoKML = ' - Pol�gono'
                          } else if (tipoKML == 'esriGeometryPolyline') {
                              tipoKML = ' - L�nea'
                          } else if (tipoKML == 'esriGeometryPoint') {
                              tipoKML = ' - Punto'
                          }
                          addLayerToMap(data.featureCollection, serviceName);
                      }
                  },
                  error: function (_data) {
                      closeLoading();
                      showLoading("No se pudo convertir el archivo para cargar", null, "red", true);
                  },
                  cache: false,
                  contentType: false,
                  processData: false
              });

          }
          reader.onerror = function (_evt) {
              closeLoading();
              showLoading("No se pudo convertir el archivo para cargar", null, "red", true);
          }
      }
        break;
    
      case "shapefile":
          case "gpx":
            case "geojson":
              var name = $("#file").val().split(".");
              name = name[0].replace("c:\\fakepath\\", "");
  
              formData.append("filetype", $("#otherServicesFromFileFormat2").val());
              formData.append("publishParameters", JSON.stringify({
                  "name": name,
                  "targetSR": map.spatialReference,
                  "maxRecordCount": 1000,
                  "enforceInputFileSizeLimit": true,
                  "enforceOutputJsonSizeLimit": true,
                  "generalize": true,
                  "maxAllowableOffset": 10.58335450004386,
                  "reducePrecision": true,
                  "numberOfDigitsAfterDecimal": 0
              }));
              formData.append("f", "json");
  
              $.ajax({
                  url: "https://www.arcgis.com/sharing/rest/content/features/generate", //https://mapas2.igac.gov.co/portal/sharing/rest/content/features/generate
                  type: 'POST',
                  data: formData,
                  success: function (data) {
                      closeLoading();
                      if (data.hasOwnProperty("error")) {
                          showLoading("Ocurrio un error cargando el archivo. No puede contener mas de 4000 registros ni superar los 2Mb", null, "red", true);
                          console.log("Ocurrio un error cargando el archivo: ", data.error.message);
                          return;
                      }
                      addLayerToMap(data.featureCollection, serviceName);
                  },
                  error: function (_data) {
                      closeLoading();
                      showLoading("No se pudo convertir el archivo para cargar", null, "red", true);
                  },
                  cache: false,
                  contentType: false,
                  processData: false
              });
        break;
    
        case "csv":

        formData.append("filetype", $("#otherServicesFromFileFormat2").val());
        formData.append("analyzeParameters", JSON.stringify({
            locationType: "coordinates",
            enableGlobalGeocoding: false,
            sourceLocale: "es",
            geocodeServiceUrl: "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer",
            sourceCountry: "world",
            sourceCountryHint: "CO"
        }));
        formData.append("f", "json");

        $.ajax({
            url: "https://www.arcgis.com/sharing/rest/content/features/analyze", //https://mapas2.igac.gov.co/portal/sharing/rest/content/features/analyze
            type: 'POST',
            data: formData,
            dataType: 'json',
            success: function (data) {
                var formData = new FormData($("#otherServicesFileData")[0]);
                formData.append("filetype", $("#otherServicesFromFileFormat2").val());
                formData.append("publishParameters", JSON.stringify(data.publishParameters));
                formData.append("f", "json");

                $.ajax({
                    url: "https://www.arcgis.com/sharing/rest/content/features/generate",
                    type: 'POST',
                    data: formData,
                    success: function (data) {
                        closeLoading();
                        addLayerToMap(data.featureCollection, serviceName);
                    },
                    error: function (_data) {
                        closeLoading();
                        showLoading("No se pudo convertir el archivo para cargar", null, "red", true);
                    },
                    cache: false,
                    contentType: false,
                    processData: false
                });
            },
            error: function (_data) {
                closeLoading();
                showLoading("No se pudo convertir el archivo para cargar", null, "red", true);
            },
            cache: false,
            contentType: false,
            processData: false
        });
        break;
      }
  }
}
}

function checkURL(url, mostrarAlerta) {
  var pattern = /^(https?:\/\/)([\w\d\-_]+\.)+[a-z]{2,}(:\d+)?(\/[\w\d\-_#\.\/]*)?(\?[;&a-z\_\d%\.=]*)?(#[\w\d_\-]*)?$/i;
  if (pattern.test(url)) {
      return true;
  } else {
      if (mostrarAlerta) {
          showLoading("La URL ingresada no es valida", null, "red", true);
      }
      return false;
  }

}

function changeExtensionFile(){
switch ($("#otherServicesFromFileFormat2").val()) {
  case "shapefile":
    $('#fileUpload').attr('accept', '.zip');
    break;
    case "csv":
      $('#fileUpload').attr('accept', '.csv');
      break;
      case "geojson":
        $('#fileUpload').attr('accept', '.geojson, .json');
        break;
        case "kml":
          $('#fileUpload').attr('accept', '.kml');
          break;
          case "gpx":
          $('#fileUpload').attr('accept', '.gpx');
          break;
}

}

function addLayerToMap(featureCollection, titleLayer) {
  require([
    "esri/Graphic",
    "esri/layers/FeatureLayer",
    "esri/layers/support/Field",
  ], (Graphic, FeatureLayer, Field) => {
    let sourceGraphics = [];
    const layers = featureCollection.layers.map((layer) => {
      const graphics = layer.featureSet.features.map((feature) => {
        return Graphic.fromJSON(feature);
      });
      sourceGraphics = sourceGraphics.concat(graphics);
      const featureLayer = new FeatureLayer({
        objectIdField: "FID",
        source: graphics,
        title: titleLayer,
        fields: layer.layerDefinition.fields.map((field) => {
          return Field.fromJSON(field);
        }),
      });
      return featureLayer;
    });
    window.viewMap.map.addMany(layers);
    layers[0].on("layerview-create-error", function(event) {
      showLoading("No se pudo cargar la capa de informaci&oacute;n", null, "red", true);
     });
     layers[0].on("layerview-create", function(event){
       showLoading("Servicio cargado exitosamente", "ok", "green", true);
     });

    window.viewMap.goTo(sourceGraphics).catch((error) => {
      if (error.name != "AbortError") {
        console.error(error);
      }
    });
  });
}

function enableAgregarServicio(){
  if($("#otherServicesType").val() === "url"){
     const input1 = $('#otherServicesName').val().trim();
     const input2 = $('#otherServicesUrl').val().trim();
     $('#agregarButton').prop('disabled', input1 === '' || input2 === '');
  }else{
     const input1 = $('#otherServicesName').val().trim();
     const input2 = $('#fileUpload').val().trim();
     $('#agregarButton').prop('disabled', input1 === '' || input2 === '');
  }
 
}