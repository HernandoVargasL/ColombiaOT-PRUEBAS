var layerBusqueda;
var typeFieldBusqueda;
var resultadosResaltados;
var layerResultados;
var resultadoBusqueda = [];
var tabActive = "atributos-tab";
var sketchGraphicsLayer, sketch;
var fileUpload;

function gotoBusqueda() {
  currentScreen = "busqueda";
  reporteUso("Abrir Busqueda");
  toggleMenu("small");
  minAll();
  fetch("./herramientas/busquedaAvanzada/index.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("panelBusqueda").innerHTML = data;

      $("#panelBusqueda").draggable({
        handle: ".panel-mover",
        containment: "#mapViewDiv",
      });

      $("#collapseBusqueda").on("shown.bs.collapse", (event) => {
        var windowPosition = $("#panelBusqueda").position();
        var parentPosition = $("#mapViewDiv").position();
        var windowHeight = $("#panelBusqueda").outerHeight();
        var parentHeight = $("#mapViewDiv").height();
        var parentWidth = $("#mapViewDiv").width();
        if (Math.abs(windowPosition.left) + window.Width > parentWidth) {
          $("#panelBusqueda").offset({ left: parentPosition.left });
        }
        if (windowPosition.top + windowHeight > parentHeight) {
          $("#panelBusqueda").css("top", parentHeight - windowHeight);
        }
      });
      $("#capaBusquedaAtributos option:not(:first)").remove();
      window.viewMap.map.layers.forEach((layer) => {
        $("#capaBusquedaAtributos").append(
          $("<option>", {
            value: layer.id,
          }).text(layer.title)
        );
        $("#capaBusquedaGeometria").append(
          $("<option>", {
            value: layer.id,
          }).text(layer.title)
        );
      });
      $("#panelBusqueda").show();
      $("[data-bs-toggle='tooltip']").tooltip();
      $('[data-bs-toggle="tooltip"]').click(function () {
        $('[data-bs-toggle="tooltip"]').tooltip("hide");
      });
      const tabsButtons = document.querySelectorAll(
        'button[data-bs-toggle="tab"]'
      );
      tabsButtons.forEach((tab) => {
        tab.addEventListener("shown.bs.tab", (event) => {
         
          tabActive = event.target.id;
          if(tabActive === "geometria-tab"){
            
          }
           limpiarBusqueda();
        });
      });

      require([
        "esri/widgets/Sketch/SketchViewModel",
        "esri/layers/GraphicsLayer",
      ], (SketchViewModel, GraphicsLayer) => {
        sketchGraphicsLayer = new GraphicsLayer();
        sketchGraphicsLayer.listMode = "hide";
        sketchGraphicsLayer.legendEnabled = false;
        window.viewMap.map.add(sketchGraphicsLayer);
        sketch = new SketchViewModel({
          view: window.viewMap,
          layer: sketchGraphicsLayer,
        });
       
        sketch.on("create", async (event) => {
          if (event.state === "complete") {
            enableBusquedaGeometria();
          }
        });
      });

    })
    .catch((error) => console.error("Error al cargar el contenido: ", error));
}

function closeBusqueda() {
  $("#panelBusqueda").hide();
  limpiarBusqueda();
}

function enableBusqueda() {
  $("#btnLimpiarBusqueda").prop("disabled", false);
  if ($("#capaBusquedaAtributos").val()) {
    if (
      window.viewMap.map.findLayerById($("#capaBusquedaAtributos").val()) !=
      layerBusqueda
    ) {
      layerBusqueda = window.viewMap.map.findLayerById(
        $("#capaBusquedaAtributos").val()
      );
      window.viewMap.goTo(layerBusqueda.fullExtent);
      $("#campoBusqueda option:not(:first)").remove();
      layerBusqueda.fields.forEach((field) => {
        if (field.type !== "geometry") {
          $("#campoBusqueda").append(
            $("<option>", {
              value: field.name,
            }).text(field.alias)
          );
        }
      });
    }
  }

  if ($("#campoBusqueda").val()) {
    let fieldSelected = layerBusqueda.fields.find(
      (field) => field.name === $("#campoBusqueda").val()
    );
    if (fieldSelected.type === "string") {
      typeFieldBusqueda = "string";
      $("#valueBuscar").prop("type", "text");
      $('#operadorBusqueda option[value=">"]').prop("disabled", true);
      $('#operadorBusqueda option[value=">="]').prop("disabled", true);
      $('#operadorBusqueda option[value="<"]').prop("disabled", true);
      $('#operadorBusqueda option[value="<="]').prop("disabled", true);
      $('#operadorBusqueda option[value="empieza"]').prop("disabled", false);
      $('#operadorBusqueda option[value="termina"]').prop("disabled", false);
      $('#operadorBusqueda option[value="contiene"]').prop("disabled", false);
      $('#operadorBusqueda option[value="noContiene"]').prop("disabled", false);
    } else {
      if (
        fieldSelected.type == "double" ||
        fieldSelected.type.includes("integer") ||
        fieldSelected.type == "long"
      ) {
        typeFieldBusqueda = "number";
        $("#valueBuscar").prop("type", "number");
        $('#operadorBusqueda option[value=">"]').prop("disabled", false);
        $('#operadorBusqueda option[value=">="]').prop("disabled", false);
        $('#operadorBusqueda option[value="<"]').prop("disabled", false);
        $('#operadorBusqueda option[value="<="]').prop("disabled", false);
        $('#operadorBusqueda option[value="empieza"]').prop("disabled", true);
        $('#operadorBusqueda option[value="termina"]').prop("disabled", true);
        $('#operadorBusqueda option[value="contiene"]').prop("disabled", true);
        $('#operadorBusqueda option[value="noContiene"]').prop(
          "disabled",
          true
        );
      }
    }
  }

  if (
    $("#capaBusquedaAtributos").val() &&
    $("#campoBusqueda").val() &&
    $("#valueBuscar").val()
  ) {
    $("#btnBuscar").prop("disabled", false);
    $("#onBuscar").text("Buscar");
    $("#btnBuscar").removeClass("btn-success");
    $("#btnBuscar").addClass("btn-primary");
  } else {
    $("#btnBuscar").prop("disabled", true);
  }
}

function enableBusquedaGeometria() {
  $("#btnLimpiarBusqueda").prop("disabled", false);
  if (
    $("#capaBusquedaGeometria").val() ||
    $("#checkAllLayers").is(":checked")
  ) {
    $("#btnBuscar").prop("disabled", false);
    $("#onBuscar").text("Buscar");
    $("#btnBuscar").removeClass("btn-success");
    $("#btnBuscar").addClass("btn-primary");
  } else {
    $("#btnBuscar").prop("disabled", true);
  }
}

async function createBusqueda() {
  $("#onBuscando").show();
  $("#onBuscar").hide();
  let resultadosEncontrados = [];
  switch (tabActive) {
    case "atributos-tab":
      resultadosEncontrados = await buscarPorAtributos();
      if (resultadosEncontrados.length) {
        resultadosEncontrados[0].fieldShow = $("#campoBusqueda").val();
        switch ($("#opcionesResultados").val()) {
          case "new":
            if (resultadoBusqueda.length) {
              resultadoBusqueda.forEach((resultado) => {
                resultado.highlight.remove();
              });
            }
            resultadosEncontrados[0].highlight = await resaltarFeatures(
              resultadosEncontrados[0].features
            );
            resultadoBusqueda = resultadosEncontrados;
            break;

          case "add":
            await agregarResultado(resultadosEncontrados);
            break;

          case "remove":
            await removerResultado(resultadosEncontrados);
            break;
        }
        listarResultados(resultadoBusqueda);
        $("#onBuscando").hide();
        $("#onBuscar").show();
        $("#noResultados").hide();
        $("#btnDownloadBusqueda").prop("disabled", false);
        $("#btnCargarResultados").prop("disabled", false);
        $("#btnCargarResultados").removeClass("btn-success");
        $("#btnCargarResultados").addClass("btn-primary");
        $("#btnCargarResultados").text("Cargar al mapa");
      }else{
         $("#noResultados").show();
         $("#onBuscando").hide();
        $("#onBuscar").show();
      }
      break;

    case "geometria-tab":
      resultadosEncontrados = await buscarPorGeometria(await createGeometryQuery());
      if (resultadosEncontrados.length) {
        switch ($("#opcionesResultadosGeometria").val()) {
          case "new":
            if (resultadoBusqueda.length) {
              resultadoBusqueda.forEach(async (resultado) => {
                resultado.highlight.remove();
              });
            }
            resultadoBusqueda = resultadosEncontrados;
            resultadoBusqueda.forEach(async (resultado) => {
              resultado.highlight = await resaltarFeatures(resultado.features);
            });
            break;

          case "add":
            await agregarResultado(resultadosEncontrados);
            break;

          case "remove":
            await removerResultado(resultadosEncontrados);
            break;
        }
        listarResultados(resultadoBusqueda);
        $("#onBuscando").hide();
        $("#onBuscar").show();
        $("#noResultados").hide();
        $("#btnDownloadBusqueda").prop("disabled", false);
        $("#btnCargarResultados").prop("disabled", false);
        $("#btnCargarResultados").removeClass("btn-success");
        $("#btnCargarResultados").addClass("btn-primary");
        $("#btnCargarResultados").text("Cargar al mapa");
      }else{
         $("#noResultados").show();
         $("#onBuscando").hide();
        $("#onBuscar").show();
      }
      break;
      
  }
}

function createGeometryQuery() {
  return new Promise(async (resolve) => {
    let geometriaQuery;
  switch ($("#opcionesBusquedaGeometria").val()) {
    case "dibujar":
      require(["esri/geometry/geometryEngine"], (geometryEngine) => {
        const geometries = sketchGraphicsLayer.graphics.map(function (graphic) {
          return graphic.geometry;
        });
        geometriaQuery = geometryEngine.union(geometries.toArray());
        resolve(geometriaQuery);
      }); 
      break;
      case "extension":
        geometriaQuery = window.viewMap.extent;
        resolve(geometriaQuery);
        break;
        case "entidad":
          const data = $("#searchEntidad").select2("data")[0];
          
          let urlLayer, fieldLayer;
          if (data.type === "DEPTO") {
           
            urlLayer = "https://mapas2.igac.gov.co/server/rest/services/carto/departamentos/MapServer/0/";
            fieldLayer = "DeCodigo";
          }else{
            if(data.type === "MUNI"){
            urlLayer = "https://mapas2.igac.gov.co/server/rest/services/carto/municipios/MapServer/0/";
            fieldLayer = "MpCodigo";
            }
  }
            require(["esri/layers/FeatureLayer"], function(FeatureLayer){
              const fl = new FeatureLayer({
                url: urlLayer
              });   
              let query = fl.createQuery();
              query.where = `${fieldLayer} = '${data.id}'`;  
              query.returnGeometry = true;  
              fl.queryFeatures(query).then(function(response){
                geometriaQuery = response.features[0].geometry;
                resolve(geometriaQuery);
              });
            });
          break;
          case "cargar":
            const fileRead = await fileUpload[0].arrayBuffer();
            const fileDecode = new TextDecoder().decode(fileRead);
            let geometries = [];
           require(["esri/geometry/Polygon", "esri/geometry/geometryEngineAsync"], (Polygon, geometryEngineAsync) => { 
              const geojson = JSON.parse(fileDecode);
              const geometriesGeoJson = geojson.geometries ? geojson.geometries : geojson.features.map((feature) => feature.geometry); 
              geometriesGeoJson.forEach(geometry => {
                const polygon = new Polygon({
                  rings: geometry.coordinates,
                  spatialReference: { wkid: 4326 }
                });
                geometries.push(polygon);
              });
              
              const geometriaUnion = geometryEngineAsync.union(geometries);
              geometriaUnion.then((geometriasUnidas) => {
              geometriaQuery = geometriasUnidas;
              resolve(geometriaQuery);
                          });
             });
            break;
  }
  });
  

}

function listarResultados(resultados) {
  $("#divResultados").show();
  $("#listaResultados").empty();
  $("#listaResultados").addClass("accordion");
  $("#totalResultados").text(
    resultados.reduce((total, resultado) => {
      return total + resultado.features.length;
    }, 0)
  );
  resultados.forEach((resultado) => {
    const fieldDisplay = resultado.features[0].layer.fields.find(function (
      field
    ) {
      return field.name === resultado.features[0].layer.displayField;
    });
 
        const fieldShow = resultado.fieldShow? resultado.features[0].layer.fields.find(function (
      field
    ) {
      return field.name === resultado.fieldShow;
    }) : null;
    
  
    $("#listaResultados").append(
      ` <div class="accordion-item">
          <h2 class="accordion-header" style="display: flex;">
           
     <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse_${resultado.features[0].layer.id}" aria-expanded="false" aria-controls="collapse_${resultado.features[0].layer.id}">
              ${resultado.features[0].layer.title}  &nbsp; <span class="badge text-bg-secondary">${resultado.features.length}</span>
            </button>
            <div id="actions_${resultado.features[0].layer.id}" class="divActionsLayer"></div>
          </h2>
          <div id="collapse_${resultado.features[0].layer.id}" class="accordion-collapse collapse" data-bs-parent="#listaResultados">
            <div class="accordion-body">
             <ol class="list-group" id="lista_${resultado.features[0].layer.id}">
          </ol>
            </div>
          </div>
        </div>`
    );
    let fieldShowInfo;
   
    resultado.features.forEach((feature) => {
       if (fieldShow) {
      fieldShowInfo = `  ${fieldShow?.alias}: ${
          feature.attributes[fieldShow?.name]
        }   
          <br> `;
    }else{
      fieldShowInfo = '';
    }
      $(`#lista_${feature.layer.id}`).append(
        `<li class="list-group-item d-flex justify-content-between align-items-start">
            ${fieldShowInfo}
        ${fieldDisplay.alias}: ${
          feature.attributes[feature.layer.displayField]
        }
          </li>`
      );
    });
    var divActionsLayer = $(`#actions_${resultado.features[0].layer.id}`);
    divActionsLayer.addClass("btn-toolbar");
    divActionsLayer.addClass("divActions");
    const downloadResultadosLayer = $(
      `<div class="btn-group">
                    <button 
                        class="btnDownloadLayer bi bi-download dropdown-toggle" data-bs-toggle="dropdown"></button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="#"
                                onclick="downloadLayer('xlsx', layerResultados)">XLSX</a>
                        </li>
                        <li><a class="dropdown-item" href="#"
                                onclick="downloadLayer('csv', layerResultados)">CSV</a></li>
                        <li><a class="dropdown-item" href="#"
                                onclick="downloadLayer('geojson', layerResultados)">GeoJSON</a></li>
                    </ul>
                </div>`
    );

     downloadResultadosLayer.click(() => {
    crearCapaResultados([resultado]);
    });
  
 const cargarResultadosLayer = $("<button>", {
      class: "btnCargarLayer bi bi-plus-circle"
    });
   cargarResultadosLayer.click(() => {
    cargarCapaResultado([resultado]);
    });

    cargarResultadosLayer.tooltip({
      title: 'Cargar resultados al mapa',
      placement: 'top' 
  });

  downloadResultadosLayer.tooltip({
    title: 'Descargar resultados',
    placement: 'top' 
});
downloadResultadosLayer.click(function () {
  downloadResultadosLayer.tooltip("hide");
});
    
     divActionsLayer.append(cargarResultadosLayer);
     divActionsLayer.append(downloadResultadosLayer);
  });
  $("#divBusqueda").scrollTop($("#divBusqueda").prop("scrollHeight"));
}

function limpiarBusqueda() {
  $("#capaBusquedaAtributos")[0].selectedIndex = 0;
  $("#opcionesResultados")[0].selectedIndex = 0;
  $("#opcionesResultados")[0].selectedIndex = 0;
  $("#campoBusqueda")[0].selectedIndex = 0;
  $("#operadorBusqueda")[0].selectedIndex = 0;
  $("#valueBuscar").val("");
  $("#btnBuscar").prop("disabled", true);
  $("#btnDownloadBusqueda").prop("disabled", true);
  $("#listaResultados").empty();
  $("#divResultados").hide();

  if (resultadoBusqueda.length) {
    resultadoBusqueda.forEach((resultado) => {
      resultado.highlight.remove();
    });
  }

  if (layerResultados) {
    layerResultados = null;
  }
  if (resultadoBusqueda) {
    resultadoBusqueda = [];
  }

  if (sketchGraphicsLayer) {
    sketchGraphicsLayer.removeAll();
  }
}

function crearCapaResultados(resultadosCapa) {
  require(["esri/layers/FeatureLayer", "esri/Graphic"], (
    FeatureLayer,
    Graphic
  ) => {
    const titleLayer = resultadosCapa[0].features[0].layer.title
    let fieldsCapa = resultadosCapa.map((resultado) => {
      return resultado.features[0].layer.fields;
    });
    fieldsCapa = [].concat(...fieldsCapa);
    fieldsCapa.forEach((field) => {
      field.domain = null;
      field.nullable = true;
    });
    let featuresCapa = resultadosCapa.map((resultado) => {
      return resultado.features;
    });
    featuresCapa = [].concat(...featuresCapa);
    featuresCapa.forEach((feature, index) => {
      feature.attributes.OBJECTID = index + 1;
    });
    let tiposVistos = {};
    fieldsCapa = fieldsCapa.filter((field) => {
      if (field.type === "oid") {
        if (!tiposVistos["oid"]) {
          tiposVistos["oid"] = true;
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    });
    
    let graphics = featuresCapa.map(function (feature) {
      return new Graphic({
        attributes: feature.attributes,
        geometry: feature.geometry,
      });
    });
    layerResultados = new FeatureLayer({
      source: graphics,
      fields: fieldsCapa.filter((field) => field.type !== "geometry"),
      title: "Búsqueda: " + titleLayer,
      spatialReference: {
        wkid: 4218,
      },
    });
  });
}

function crearGeometriaBusqueda(value) {
  sketch.create(value);
}

function buscarPorAtributos() {
  return new Promise((resolve, reject) => {
    let query = layerBusqueda.createQuery();
    let whereBusqueda;
    if (typeFieldBusqueda === "string") {
      switch ($("#operadorBusqueda").val()) {
        case "empieza":
          whereBusqueda =
            '"' +
            $("#campoBusqueda").val() +
            '" LIKE' +
            " '" +
            $("#valueBuscar").val() +
            "%'";
          break;

        case "termina":
          whereBusqueda =
            '"' +
            $("#campoBusqueda").val() +
            '" LIKE' +
            " '%" +
            $("#valueBuscar").val() +
            "'";
          break;

        case "contiene":
          whereBusqueda =
            '"' +
            $("#campoBusqueda").val() +
            '" LIKE' +
            " '%" +
            $("#valueBuscar").val() +
            "%'";
          break;

        case "noContiene":
          whereBusqueda =
            '"' +
            $("#campoBusqueda").val() +
            '" NOT LIKE' +
            " '%" +
            $("#valueBuscar").val() +
            "%'";
          break;

        default:
          whereBusqueda =
            '"' +
            $("#campoBusqueda").val() +
            '" ' +
            $("#operadorBusqueda").val() +
            "'" +
            $("#valueBuscar").val() +
            "'";
          break;
      }
    } else {
      whereBusqueda =
        '"' +
        $("#campoBusqueda").val() +
        '" ' +
        $("#operadorBusqueda").val() +
        " " +
        $("#valueBuscar").val();
    }
    query.where = whereBusqueda;
    query.outFields = ["*"];
    layerBusqueda
      .queryFeatures(query)
      .then(async function (response) {
        if (response.features.length) {
          resolve([
            {
              layerId: response.features[0].layer.id,
              features: response.features,
            },
          ]);
        } else {
          resolve([]);
        }
      })
      .catch((error) => {
        console.error(
          "Se encontró un error al intentar hacer la consulta sobre esta capa: ",
          error
        );
      });
  });
}

function buscarPorGeometria(geometria) {

  return new Promise((resolve) => {
      const querys = [];
      const resultQuerys = [];
      if ($("#checkAllLayers").is(":checked")) {
        window.viewMap.map.layers.forEach((layer) => {
          if (layer.legendEnabled && layer.listMode === "show") {
            const query = layer.queryFeatures({
                geometry: geometria,
                spatialRelationship: "intersects",
                returnGeometry: true,
                returnQueryGeometry: false,
                outFields: ["*"],
              })
              .then((result) => {
                if (result.features.length > 0) {
                  resultQuerys.push({
                    layerId: result.features[0].layer.id,
                    features: result.features,
                  });
                }
              });
            querys.push(query);
          }
        });
        Promise.all(querys)
          .then(() => {
            resolve(resultQuerys);
          })
          .catch((error) => {
            console.error(
              "Ocurrió un error al generar las consultas en todas las capas:",
              error
            );
          });
      } else {
        layerBusqueda = window.viewMap.map.findLayerById(
          $("#capaBusquedaGeometria").val()
        );
        layerBusqueda
          .queryFeatures({
            geometry: geometria,
            spatialRelationship: "intersects",
            returnGeometry: true,
            returnQueryGeometry: false,
            outFields: ["*"],
          })
          .then((result) => {
            if (result.features.length > 0) {
              resultQuerys.push({
                layerId: result.features[0].layer.id,
                features: result.features,
              }); 
            }
             resolve(resultQuerys);
          });
      }
  });
}

function resaltarFeatures(features) {
  return new Promise((resolve) => {
    window.viewMap.whenLayerView(features[0].layer).then((layerView) => {
      resolve(layerView.highlight(features));
    });
  });
}

function agregarResultado(resultado) {
  return new Promise((resolve) => {
    resultado.forEach(async (resultadoNuevo) => {
      let existingObjIndex = resultadoBusqueda.findIndex(
        (resultadoExistente) =>
          resultadoExistente.layerId === resultadoNuevo.layerId
      );
      if (existingObjIndex !== -1) {
        let existingGeometries =  resultadoBusqueda[existingObjIndex].features.map((feature) =>  JSON.stringify(feature.geometry.toJSON()));
        let featuresToAdd =  resultadoNuevo.features.filter((newFeature) => {
          return !existingGeometries.includes( JSON.stringify(newFeature.geometry.toJSON())); 
        });
  if (featuresToAdd.length > 0) {
          resultadoBusqueda[existingObjIndex].features =
            resultadoBusqueda[existingObjIndex].features.concat(featuresToAdd);
          resultadoBusqueda[existingObjIndex].highlight.remove();
          resultadoBusqueda[existingObjIndex].highlight =
            await resaltarFeatures(
              resultadoBusqueda[existingObjIndex].features
            );
        }

        resolve();
      } else {
        resultadoBusqueda.push({
          layerId: resultadoNuevo.layerId,
          features: resultadoNuevo.features,
          highlight: await resaltarFeatures(resultadoNuevo.features),
        });
        resolve();
      }
    });
  });
}

function removerResultado(resultado) {
  return new Promise((resolve) => {
    resultado.forEach(async (resultadoNuevo) => {
      let existingObjIndex = resultadoBusqueda.findIndex(
        (resultadoExistente) =>
          resultadoExistente.layerId === resultadoNuevo.layerId
      ); if (existingObjIndex !== -1) {
        let geometriesToRemove = resultadoNuevo.features.map(
          (feature) => JSON.stringify(feature.geometry.toJSON())
        );
         resultadoBusqueda[existingObjIndex].features = await resultadoBusqueda[existingObjIndex].features.filter((feature) => {
           return !geometriesToRemove.includes( JSON.stringify(feature.geometry.toJSON()));
         });
         resultadoBusqueda[existingObjIndex].highlight.remove();
         resultadoBusqueda[existingObjIndex].highlight = await resaltarFeatures(
           resultadoBusqueda[existingObjIndex].features
         );
        resolve();
      }
      resolve();
    });
  });
}

function cargarCapaResultado(resultado){
  crearCapaResultados(resultado);
  window.viewMap.map.add(layerResultados);
  if (resultado.length) {
    resultado.forEach((resultado) => {
      resultado.highlight.remove();
    });
  }
  window.viewMap.whenLayerView(layerResultados).then((layerView) => {
    if (sketchGraphicsLayer) {
      window.viewMap.map.remove(sketchGraphicsLayer);
      sketchGraphicsLayer = null;
    }
       $("#btnCargarResultados").removeClass("btn-primary");
  $("#btnCargarResultados").addClass("btn-success");
  $("#btnCargarResultados").text("Capa Cargada");
   $("#btnCargarResultados").prop("disabled", true);
    });
 
}

function descargarResultadosLayer(resultadoLayer){
  crearCapaResultados(resultadoLayer);
  
}

function changeTipoGeometria(tipo){
  switch (tipo) {
    case "dibujar":
      $("#dibujarGeometria").show();
       $("#entidadTerritorial").hide();
       $("#cargarGeometria").hide();
      break;
  
    case "extension":
      $("#dibujarGeometria").hide();
      $("#entidadTerritorial").hide();
      $("#cargarGeometria").hide();
      enableBusquedaGeometria();
      break;
      case "entidad":
      $("#entidadTerritorial").show();
      getEntidadesTerritoriales();
      $("#dibujarGeometria").hide();
       $("#cargarGeometria").hide();
      break;

      case "cargar":
        $("#cargarGeometria").show();
        $("#dibujarGeometria").hide();
       $("#entidadTerritorial").hide();
      break;
  }
}

function getEntidadesTerritoriales(){
  $("#searchEntidad").select2({
    data: cacheUnidadesFiltro,
    multiple: false,
    placeholder: "Ej: Colombia",
    query: function (query) {
        if ((query.term == null) || (query.term == "")) {
            query.callback({ results: cacheUnidadesFiltro });
        } else {
            var results = [];
            for (var i = 0; i < cacheUnidadesFiltro.length; i++) {
                if (limpiarTexto(cacheUnidadesFiltro[i].text).indexOf(limpiarTexto(query.term)) != -1) {
                    if (cacheUnidadesFiltro[i].type == "MUNI") {
                        results.push({
                            type: cacheUnidadesFiltro[i].type,
                            id: cacheUnidadesFiltro[i].id,
                            text: cacheUnidadesFiltro[i].text + ", " + getDeptoByMuni(cacheUnidadesFiltro[i].id).text
                        });
                    }
                    if (cacheUnidadesFiltro[i].type == "DEPTO") {
                        results.push({
                            type: cacheUnidadesFiltro[i].type,
                            id: cacheUnidadesFiltro[i].id,
                            text: cacheUnidadesFiltro[i].text
                        });
                    }
                    if (cacheUnidadesFiltro[i].type == "PAIS") {
                        results.push({
                            type: cacheUnidadesFiltro[i].type,
                            id: cacheUnidadesFiltro[i].id,
                            text: cacheUnidadesFiltro[i].text
                        });
                    }
                }
            }
            query.callback({ results: results });
        }
    },
    templateResult: function (data) {
        if (!data.type) {
            return data.text;
        }
        return $("<span class='" + data.type + "'>" + data.text + "</span>");
    }
});
}

function fileSelectedGeometria(file) {
  fileUpload = file;
  $("#nameFileGeometria").val(file[0].name);
  enableBusquedaGeometria();
}