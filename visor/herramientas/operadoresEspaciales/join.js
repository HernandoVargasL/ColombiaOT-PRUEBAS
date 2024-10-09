var layerJoin;
var validateJoin;
var targetLayer;

function capaSelectedJoin() {

    if ($("#capaDestino").val() === "local") {
      $("#loadLocalFile").show();
    } else {
      enableValidateJoin();
      const capaSelected = window.viewMap.map.findLayerById($("#capaDestino").val());
      $("#loadLocalFile").hide();
      $("#campoDestino option:not(:first)").remove();
      capaSelected.fields.forEach((field) => {
        $("#campoDestino").append(
          $("<option>", {
            value: field.name,
          }).text(field.alias)
        );
      });
    }
  }
  
  async function fileSelectedJoin(file) {
    enableValidateJoin();
    $("#nameFile").val(file[0].name);
    var fileRead = await file[0].arrayBuffer();
    var workbook = XLSX.read(fileRead, { cellStyles: true });
    window.workbook = workbook;
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    $("#campoDestino option:not(:first)").remove();
    for (const key in worksheet) {
      if (key[1] == "1" && !key[2]) {
        $("#campoDestino").append(
          $("<option>", {
            value: worksheet[key].v,
          }).text(worksheet[key].v)
        );
      }
    }
  }

function createJoin() {
    $("#onAplicar").hide();
    $("#loadingAplicar").show();
  
    require(["esri/layers/FeatureLayer", "esri/geometry/SpatialReference"], (FeatureLayer, SpatialReference) => {
      var spatialReferenceJoin = new SpatialReference({
        wkid: 4218
      });
      var fieldJoin = $("#capaObjetivo").val() === "1" ? "MpCodigo" : "DeCodigo";
      var queryTarget = targetLayer.createQuery();
      queryTarget.outFields = ["*"];
      queryTarget.returnGeometry = true;
      if ($("#capaDestino").val() === "local") {
        const worksheet = window.workbook.Sheets[window.workbook.SheetNames[0]];
        let rowObject = XLSX.utils.sheet_to_row_object_array(worksheet);
        targetLayer.queryFeatures(queryTarget).then((resultTarget) => {
          var joinFields = resultTarget.fields;
          for (const key in worksheet) {
            if (key[1] == "1" && !key[2] && worksheet[key + 1]) {
              var fieldType = typeof worksheet[key + 1].v === "number" ? "double" : typeof worksheet[key + 1].v;
              joinFields.push(
                {
                  name: worksheet[key].v,
                  type: fieldType
                }
              )
            }
          }
          var joinResult = resultTarget.features.map(function (featureTarget) {
            var featureMatch = rowObject.find(function (featureDest) {
              return (
                featureTarget.attributes[fieldJoin] ===
                featureDest[$("#campoDestino").val()]
              );
            });
            if (featureMatch) {
              const joinAttributes = Object.assign({}, featureTarget.attributes, featureMatch);
              return {
                geometry: featureTarget.geometry,
                attributes: joinAttributes,
              };
            }
          });
          layerJoin = new FeatureLayer({
            source: [],
            objectIdField: "OBJECTID",
            fields: joinFields,
            title: "Capa Unida",
            spatialReference: window.origenNacional
          });
          joinResult.forEach(feature => {
  
            if (feature) {
              layerJoin.source.add(feature);
            }
  
          });
          loadLayerJoin();
  
        });
      } else {
        var layerDestino = window.viewMap.map.findLayerById(
          $("#capaDestino").val()
        );
  
        var queryDest = layerDestino.createQuery();
        queryDest.outFields = ["*"];
        queryDest.returnGeometry = false;
        targetLayer.queryFeatures(queryTarget).then((resultTarget) => {
          layerDestino.queryFeatures(queryDest).then((resultDestino) => {
            var joinFields = resultTarget.fields.concat(resultDestino.fields);
            joinFields = Array.from(new Map(joinFields.map(obj => [obj.name, obj])).values());
            var joinResult = resultTarget.features.map(function (featureTarget) {
              var featureMatch = resultDestino.features.find(function (
                featureDest
              ) {
                return (
                  featureTarget.attributes[fieldJoin] ===
                  featureDest.attributes[$("#campoDestino").val()]
                );
              });
              if (featureMatch) {
                const joinAttributes = Object.assign({}, featureTarget.attributes, featureMatch.attributes);
                return {
                  geometry: featureTarget.geometry,
                  attributes: joinAttributes,
                };
              }
            });
            layerJoin = new FeatureLayer({
              source: [],
              objectIdField: "OBJECTID",
              fields: joinFields,
              title: "Capa Unida",
              spatialReference: spatialReferenceJoin
            });
            joinResult.forEach(feature => {
              if (feature) {
                layerJoin.source.add(feature);
              }
            });
            loadLayerJoin();
          });
        });
      }
    });
  
    function loadLayerJoin() {
      window.viewMap.map.add(layerJoin);
      viewMap.whenLayerView(layerJoin)
        .then(function (layerView) {
          $("#loadingAplicar").hide();
          $("#btnAplicar").removeClass("btn-primary");
          $("#btnAplicar").addClass("btn-success");
          $("#onAplicar").show();
          $("#onAplicar").text("Capa cargada");
          $("#btnDownload").prop('disabled', false);
          $("#btnAplicar").prop('disabled', true);
          $("#btnValidate").prop('disabled', true);
          $("#msgValidacion").hide();
          $("#btnReporte").show();
        })
        .catch(function (error) {
          console.log("Se presento un error agregando la capa al mapa: ", error)
        });
    }
  }
  
  function validateJoin() {
    $("#onValidate").hide();
    $("#loadingValidate").show();
    require(["esri/layers/FeatureLayer"], (FeatureLayer) => {
      targetLayer = new FeatureLayer({
        url:
          "https://mapas2.igac.gov.co/server/rest/services/carto/" + $("#capaObjetivo").val() + "/MapServer" ,
        title: "Capa Objetivo Join",
      });
  
      var fieldJoin = $("#capaObjetivo").val() === "1" ? "MpCodigo" : "DeCodigo";
      var queryTarget = targetLayer.createQuery();
      queryTarget.outFields = [fieldJoin];
      queryTarget.returnGeometry = false;
      var countJoin = 0;
      if ($("#capaDestino").val() === "local") {
        const worksheet = window.workbook.Sheets[window.workbook.SheetNames[0]];
        let rowObject = XLSX.utils.sheet_to_row_object_array(worksheet);
        targetLayer.queryFeatures(queryTarget).then((resultTarget) => {
          for (let feature1 of resultTarget.features) {
            const valorCampo1 = feature1.attributes[fieldJoin];
            for (let feature2 of rowObject) {
  
              const valorCampo2 = feature2[$("#campoDestino").val()];
              if (valorCampo1 === valorCampo2) {
                countJoin++;
                break;
              }
            }
          }
  
          if (countJoin > 0) {
            $("#btnAplicar").prop('disabled', false);
            $("#onValidate").show();
            $("#onValidate").text("Validación Exitosa");
            $("#onAplicar").text("Aplicar");
            $("#loadingValidate").hide();
            $("#msgValidacion").show();
            $("#msgValidacion").removeClass("alert-danger");
            $("#msgValidacion").addClass("alert-success");
            $("#btnValidate").removeClass("btn-primary");
            $("#btnValidate").removeClass("btn-danger");
            $("#btnValidate").addClass("btn-success");
            var nameLayerTarget = $("#capaObjetivo").val() === "1" ? "Municipios" : "Departamentos";
            $("#msgValidacion").text(countJoin + " de " + resultTarget.features.length + " registros coincidentes al unir " + $("#campoDestino").val() + " de la tabla seleccionada con " + fieldJoin + " de la capa de " + nameLayerTarget);
          } else {
            $("#onValidate").show();
            $("#onValidate").text("Validación Fallida");
            $("#btnAplicar").prop('disabled', true);
            $("#loadingValidate").hide();
            $("#msgValidacion").show();
            $("#msgValidacion").removeClass("alert-success");
            $("#msgValidacion").addClass("alert-danger");
            $("#btnValidate").removeClass("btn-primary");
            $("#btnValidate").removeClass("btn-success");
            $("#btnValidate").addClass("btn-danger");
            var nameLayerTarget = $("#capaObjetivo").val() === "1" ? "Municipios" : "Departamentos";
            $("#msgValidacion").text(countJoin + " de " + resultTarget.features.length + " registros coincidentes al unir " + $("#campoDestino").val() + " de la tabla seleccionada con " + fieldJoin + " de la capa de " + nameLayerTarget);
  
          }
  
  
  
  
        });
      } else {
        var layerDestino = window.viewMap.map.findLayerById(
          $("#capaDestino").val()
        );
  
        var queryDest = layerDestino.createQuery();
        queryDest.outFields = [$("#campoDestino").val()];
        queryDest.returnGeometry = false;
        targetLayer.queryFeatures(queryTarget).then((resultTarget) => {
          layerDestino.queryFeatures(queryDest).then((resultDestino) => {
            for (let feature1 of resultTarget.features) {
              const valorCampo1 = feature1.attributes[fieldJoin];
              for (let feature2 of resultDestino.features) {
                const valorCampo2 = feature2.attributes[$("#campoDestino").val()];
                if (valorCampo1 === valorCampo2) {
                  countJoin++;
                  break;
                }
              }
  
            }
            if (countJoin > 0) {
              $("#btnAplicar").prop('disabled', false);
              $("#onValidate").show();
              $("#onValidate").text("Validación Exitosa");
              $("#loadingValidate").hide();
              $("msgValidacion").addClass("alert-success");
              $("#btnValidate").removeClass("btn-primary");
              $("#btnValidate").removeClass("btn-danger");
              $("#btnValidate").addClass("btn-success");
              $("#msgValidacion").removeClass("alert-primary");
              $("#msgValidacion").removeClass("alert-danger");
              $("#msgValidacion").addClass("alert-success");
              $("#msgValidacion").show();
  
              var nameLayerTarget = $("#capaObjetivo").val() === "1" ? "Municipios" : "Departamentos";
              $("#msgValidacion").text(countJoin + " de " + resultTarget.features.length + " registros coincidentes al unir " + $("#campoDestino").val() + " de la tabla seleccionada con " + fieldJoin + " de la capa de " + nameLayerTarget);
            } else {
              $("#btnAplicar").prop('disabled', true);
              $("#onValidate").show();
              $("#onValidate").text("Validación Fallida");
              $("#loadingValidate").hide();
              $("#msgValidacion").show();
              $("#btnValidate").removeClass("btn-primary");
              $("#btnValidate").removeClass("btn-success");
              $("#btnValidate").addClass("btn-danger");
              $("#msgValidacion").removeClass("alert-primary");
              $("#msgValidacion").removeClass("alert-success");
              $("#msgValidacion").addClass("alert-danger");
              var nameLayerTarget = $("#capaObjetivo").val() === "1" ? "Municipios" : "Departamentos";
              $("#msgValidacion").text(countJoin + " de " + resultTarget.features.length + " registros coincidentes al unir " + $("#campoDestino").val() + " de la tabla seleccionada con " + fieldJoin + " de la capa de " + nameLayerTarget);
            }
          });
        });
      }
  
  
    });
  }
  
  function enableValidateJoin() {
    if ($("#onValidate").text() == "Validación Exitosa" || $("#onValidate").text() == "Validación Fallida") {
      $("#btnValidate").removeClass("btn-danger");
      $("#btnValidate").removeClass("btn-success");
      $("#btnValidate").addClass("btn-primary");
      $("#btnAplicar").removeClass("btn-danger");
      $("#btnAplicar").removeClass("btn-success");
      $("#btnAplicar").addClass("btn-primary");
      $("#onValidate").text("Validar Unión");
      $("#onAplicar").text("Aplicar");
      $("#btnAplicar").prop('disabled', true);
    }
    if ($("#capaObjetivo").val() && $("#capaDestino").val() && $("#campoDestino").val()) {
      $("#btnValidate").prop('disabled', false);
    } else {
      $("#btnValidate").prop('disabled', true);
    }
  }
  
  function limpiarJoin() {
    $("#capaObjetivo")[0].selectedIndex = 0;
    $("#capaDestino")[0].selectedIndex = 0;
    $("#campoDestino")[0].selectedIndex = 0;
    $("#loadLocalFile").hide();
    $("#fileSelector").val("");
    $("#campoDestino option:not(:first)").remove();
    $("#nameFile").val("Formatos: .dbf, .csv, .xlsx, .ods");
    $("#btnValidate").prop('disabled', true);
    $("#btnAplicar").prop('disabled', true);
    $("#btnDownload").prop('disabled', true);
    $("#onValidate").show();
    $("#onValidate").text("Validar Unión");
    $("#onAplicar").text("Aplicar");
    $("#loadingValidate").hide();
    $("#onAplicar").show();
    $("#loadingAplicar").hide();
    $("#msgValidacion").hide();
    $("#btnValidate").removeClass("btn-success");
    $("#btnValidate").removeClass("btn-danger");
    $("#btnValidate").addClass("btn-primary");
    $("#btnAplicar").removeClass("btn-success");
    $("#btnAplicar").removeClass("btn-danger");
    $("#btnAplicar").addClass("btn-primary");
    layerJoin = null;
  
  }