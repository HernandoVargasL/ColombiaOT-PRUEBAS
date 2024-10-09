var dibujoLayer;
var dibujoLayerView;
var currentDibujoMode;
var drawTool;
var currentMeasureGraphic;
var currentEditGraphic;
var highlightGraphic;

function gotoDibujar() {
  currentScreen = "dibujar";
  reporteUso("Abrir dibujo y medición");
  toggleMenu("small");
  minAll();
  fetch("./herramientas/dibujoMedicion/index.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("panelDibujar").innerHTML = data;
      $('#buttonPopover').popover();
      const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
      $("#panelDibujar").draggable({
        handle: ".panel-mover",
        containment: "#mapViewDiv",
      });

      $("#collapseDibujar").on("shown.bs.collapse", (event) => {
        var windowPosition = $("#panelDibujar").position();
        var parentPosition = $("#mapViewDiv").position();
        var windowHeight = $("#panelDibujar").outerHeight();
        var parentHeight = $("#mapViewDiv").height();
        var parentWidth = $("#mapViewDiv").width();
        if (Math.abs(windowPosition.left) + window.Width > parentWidth) {
          $("#panelDibujar").offset({ left: parentPosition.left });
        }
        if (windowPosition.top + windowHeight > parentHeight) {
          $("#panelDibujar").css("top", parentHeight - windowHeight);
        }
      });
      require([
        "esri/widgets/Sketch/SketchViewModel",
        "esri/layers/GraphicsLayer",
      ], (SketchViewModel, GraphicsLayer) => {
        if (
          window.viewMap.map.layers.some(
            (layer) => layer.title === "Capa Graficos"
          )
        ) {
          dibujoLayer = window.viewMap.map.layers.find(function (layer) {
            return layer.title === "Capa Graficos";
          });
        } else {
          dibujoLayer = new GraphicsLayer({
            title: "Capa Graficos",
            spatialReference: {
              wkid: 4326,
            },
          });
          dibujoLayer.listMode = "hide";
          dibujoLayer.legendEnabled = false;
          window.viewMap.map.add(dibujoLayer);
          window.viewMap.whenLayerView(dibujoLayer)
    .then(function(layerView) {
      dibujoLayerView = layerView;
    });
        }
        drawTool = new SketchViewModel({
          view: window.viewMap,
          layer: dibujoLayer,
        });
        drawTool.on("update", (event) => {
          updateEditMeasure(event.graphics[0]);
          if (event.state == "start") {
            if (highlightGraphic) {
              highlightGraphic.remove();
            }
            $("#drawEdit").show();
            currentEditGraphic = event.graphics[0];
            switch (currentEditGraphic.geometry.type) {
              case "polyline":
                toggleDibujoLinea();
                $("#drawOptLineColorInput").val(
                  currentEditGraphic.symbol.color.toString()
                );
                $("#drawOptLineColor").css(
                  "color",
                  currentEditGraphic.symbol.color.toString()
                );
                break;

              case "polygon":
                toggleDibujoPoligono();
                $("#drawOptLineColorInput").val(
                  currentEditGraphic.symbol.outline.color.toString()
                );
                $("#drawOptFillColorInput").val(
                  currentEditGraphic.symbol.color.toString()
                );
                $("#drawOptLineColor").css(
                  "color",
                  $("#drawOptLineColorInput").val()
                );
                $("#drawOptFillColor").css(
                  "color",
                  $("#drawOptFillColorInput").val()
                );
                break;

              case "point":
                toggleDibujoPunto();
                $("#drawOptFillColorInput").val(
                  currentEditGraphic.symbol.color.toString()
                );
                $("#drawOptFillColor").css(
                  "color",
                  currentEditGraphic.symbol.color.toString()
                );
                if (currentEditGraphic.symbol.type === "text") {
                  $("#drawOptsText").show();
                  $("#drawText").val(currentEditGraphic.symbol.text);
                  $("#sizeText").val(currentEditGraphic.symbol.font.size);
                }
                break;
            }
          }
          if (event.state == "complete") {
             $("#drawEdit").hide();
            currentEditGraphic = null;
          }
        });
        drawTool.on("create", async (event) => {
          if (event.state === "complete") {
            switch(event.graphic.geometry.type){
              case "point":
                event.graphic.symbol ={
                  type: "simple-marker",  
                  color: drawTool.pointSymbol.color
                };
                break;
                case "polygon":
                  event.graphic.symbol = {
                    type: "simple-fill", 
                    color:  drawTool.polygonSymbol.color,
                    outline: {  
                      color:  drawTool.polygonSymbol.outline.color
                    }
                  };
                break;
                case "polyline":
                   event.graphic.symbol ={
                    type: "simple-line",  
                    color: drawTool.polylineSymbol.color,
                    width: "3px",

                  };
                break;
            }
            updateDibujoList();
            drawTool.update(event.graphic);
          }
        });
        $("#drawOptLineColor").colorpicker({})
          .on("changeColor", function (e) {
            $("#drawOptLineColorInput").val(e.color);
            $("#drawOptLineColor").css(
              "color",
              $("#drawOptLineColorInput").val()
            );
            updateEditGraphic();
          });
        $("#drawOptFillColor")
          .colorpicker({})
          .on("changeColor", function (e) {
            $("#drawOptFillColorInput").val(e.color);
            $("#drawOptFillColor").css(
              "color",
              $("#drawOptFillColorInput").val()
            );
            updateEditGraphic();
          });
        toggleDibujoPunto();
      });
      $("#panelDibujar").show();
      $("[data-bs-toggle='tooltip']").tooltip();
      $("[data-bs-toggle='popover']").popover();
      $('[data-bs-toggle="tooltip"]').click(function () {
        $('[data-bs-toggle="tooltip"]').tooltip("hide");
      });
    })
    .catch((error) => console.error("Error al cargar el contenido: ", error));
}

function closeDibujar() {
  $("#panelDibujar").hide();
}

function toggleDibujoPunto() {
  currentDibujoMode = "point";
  $("#dibujoPuntoHeader,#dibujoLineaHeader,#dibujoPoligonoHeader").removeClass(
    "active"
  );
  $("#dibujoPuntoHeader").addClass("active");
  $("#drawBar .btn").hide();
  $("#drawPointBtn, #drawTextBtn").show();
  $("#measureDivCoordinatesSystems").show();
  $("#measureDivLengthUnits").hide();
  $("#measureDivAreaUnits").hide();
  $("#drawOptsLine").hide();
  $("#drawOptsFill").show();
  $("#drawOptsText").hide();
  $("#drawCurrentTool").hide();
  updateDibujoList();
}

function toggleDibujoLinea() {
  currentDibujoMode = "polyline";
  $("#dibujoPuntoHeader,#dibujoLineaHeader,#dibujoPoligonoHeader").removeClass(
    "active"
  );
  $("#dibujoLineaHeader").addClass("active");
  $("#drawBar .btn").hide();
  $("#drawPolylineBtn,#drawFreehandPolylineBtn").show();
  $("#drawOptsLine").show();
  $("#drawOptsFill").hide();
  $("#drawOptsText").hide();
  $("#measureDivCoordinatesSystems").hide();
  $("#measureDivLengthUnits").show();
  $("#measureDivAreaUnits").hide();
  $("#drawCurrentTool").hide();
  updateDibujoList();
}

function toggleDibujoPoligono() {
  currentDibujoMode = "polygon";
  $("#dibujoPuntoHeader,#dibujoLineaHeader,#dibujoPoligonoHeader").removeClass(
    "active"
  );
  $("#dibujoPoligonoHeader").addClass("active");
  $("#drawBar .btn").hide();
  $("#drawCircleBtn,#drawPolygonBtn,#drawFreehandPolygonBtn").show();
  $("#drawOptsLine").show();
  $("#drawOptsFill").show();
  $("#measureDivLengthUnits").show();
  $("#measureDivAreaUnits").show();
  $("#measureDivCoordinatesSystems").hide();
  $("#drawOptsText").hide();
  $("#drawCurrentTool").hide();
  updateDibujoList();
}

function updateDibujoList() {
  $("#drawList").html("");
  var pos = 1;
  for (var i = 0; i < dibujoLayer.graphics.length; i++) {
    if (currentDibujoMode == "point") {
     if (dibujoLayer.graphics.items[i].geometry.type == "point") {
         var strHTML;
  strHTML = `<a href="#" class="list-group-item list-group-item-action list-group-item-light item-list-custom"  data-id="${dibujoLayer.graphics.items[i].uid}" onclick='selectDibujo(${dibujoLayer.graphics.items[i].uid})'>Punto ${pos}
                        <div>
                            <span class="btn bi bi-zoom-in" data-bs-toggle="tooltip" data-bs-title="Acercar" onclick='loadDibujo(${i})'></span>
                             <span class="btn bi bi-trash3" data-bs-toggle="tooltip" data-bs-title="Eliminar" onclick='deleteDibujoL(${i})'></span>
                        </div>
                       
                    </a>`;


         $("#drawList").append(strHTML);
         pos++;
      }
    }
    if (currentDibujoMode == "polyline") {
      if (
        dibujoLayer.graphics.items[i].geometry.type == "line" ||
        dibujoLayer.graphics.items[i].geometry.type == "polyline" ||
        dibujoLayer.graphics.items[i].geometry.type == "freehandpolyline"
      ) {
        var strHTML;
  strHTML = `<a href="#" class="list-group-item list-group-item-action list-group-item-light item-list-custom"  data-id="${dibujoLayer.graphics.items[i].uid}" onclick='selectDibujo(${dibujoLayer.graphics.items[i].uid})'>Línea ${pos}
                        <div>
                            <span class="btn bi bi-zoom-in" data-bs-toggle="tooltip" data-bs-title="Acercar" onclick='loadDibujo(${i})'></span>
                             <span class="btn bi bi-trash3" data-bs-toggle="tooltip" data-bs-title="Eliminar" onclick='deleteDibujoL(${i})'></span>
                        </div>
                       
                    </a>`;


         $("#drawList").append(strHTML);
         pos++;
      }
    }
    if (currentDibujoMode == "polygon") {
      if (
        dibujoLayer.graphics.items[i].geometry.type == "triangle" ||
        dibujoLayer.graphics.items[i].geometry.type == "circle" ||
        dibujoLayer.graphics.items[i].geometry.type == "ellipse" ||
        dibujoLayer.graphics.items[i].geometry.type == "polygon" ||
        dibujoLayer.graphics.items[i].geometry.type == "freehandpolygon"
      ) {
        var strHTML;
        strHTML = `<a href="#" class="list-group-item list-group-item-action list-group-item-light item-list-custom"  data-id="${dibujoLayer.graphics.items[i].uid}" onclick='selectDibujo(${dibujoLayer.graphics.items[i].uid})'>Polígono ${pos}
                              <div>
                                  <span class="btn bi bi-zoom-in" data-bs-toggle="tooltip" data-bs-title="Acercar" onclick='loadDibujo(${i})'></span>
                                   <span class="btn bi bi-trash3" data-bs-toggle="tooltip" data-bs-title="Eliminar" onclick='deleteDibujoL(${i})'></span>
                              </div>
                             
                          </a>`;
      
      
               $("#drawList").append(strHTML);
               pos++;
      }
    }
  }
}

async function modoDibujo(tipo, modo, info) {
  drawTool.create(tipo, { mode: modo });

  $("#drawEdit").show();
  $("#drawCurrentTool").show();
  $("#drawCurrentTool").html(info);

  if (info === "Texto") {
    $("#drawOptsFill").show();
    $("#drawOptsText").show();
    $("#drawText").val("Texto");
    let textDraw;
    textDraw = drawTool.on("create", async (event) => {
      if (event.state === "complete") {
        let textSymbol = {
          type: "text",
          color: "black",
          text: $("#drawText").val(),
          font: {
            size: $("#sizeText").val(),
            family: "Josefin Slab",
          },
        };
        event.graphic.symbol = textSymbol;
        textDraw.remove();
      }
    });
  } else {
    $("#drawOptsText").hide();
  }
}

function modoCleanDibujo() {
  $("#drawEdit").hide();
  $("#drawIntro").hide();
  $("#drawClean").show();
  $("#drawCurrentTool").html("");
}

function loadDibujo(pos) {
  window.viewMap.goTo(dibujoLayer.graphics.getItemAt(pos).geometry);
}

function deleteDibujoL(pos) {
  dibujoLayer.remove(dibujoLayer.graphics.items[pos]);
  updateDibujoList();
}

function selectDibujo(pos){
drawTool.cancel();
  if (highlightGraphic) {
    highlightGraphic.remove();
  }
  const graphic = dibujoLayer.graphics.find(g => g.uid === pos);
  highlightGraphic = dibujoLayerView.highlight(graphic);
  updateEditMeasure(graphic);
  $("#drawEdit").show();

}

function cleanDibujo() {
  let graphicsRemove = [];
  dibujoLayer.graphics.forEach((graphic) => {
    if (graphic.geometry.type === currentDibujoMode) {
      graphicsRemove.push(graphic);
    }
  });
  dibujoLayer.removeMany(graphicsRemove);
  updateDibujoList();
}

function exportDibujos() {
  let graphicsExport = [];
  dibujoLayer.graphics.forEach((graphic) => {
    if (graphic.geometry.type === currentDibujoMode) {
      graphicsExport.push(graphic);
    }
  });
  require(["esri/layers/FeatureLayer"], (FeatureLayer) => {
    const layerExport = new FeatureLayer({
      fields: [
        {
          name: "ObjectID",
          alias: "ObjectID",
          type: "oid",
        },
      ],
      objectIdField: "ObjectID",
      geometryType: currentDibujoMode,
      source: graphicsExport,
      spatialReference: { wkid: 4326 },
    });
    downloadLayer("geojson", layerExport);
  });
}

function updateEditMeasure(g) {
  require(["esri/geometry/support/geodesicUtils", "esri/geometry/projection"], (
    geodesicUtils,
    projection
  ) => {
    let typeGeometry;
    if (g != null) {
      currentMeasureGraphic = g;
    }
    if(currentMeasureGraphic){
      typeGeometry = currentMeasureGraphic.geometry.type;
    }
    var strHTML = "";
    var strHTML2 = "";
    if (typeGeometry == "polyline") {
      $("#measureDivAreaUnits").hide();
      $("#measureDivLengthUnits").show();
      $("#measureDivContainer").show();

      try {
        if ($("#measureLengthUnit").val() === "kilometers") {
          strHTML2 =
            strHTML2 +
            "Longitud: " +
            geodesicUtils
              .geodesicLengths(
                [
                  projection.project(currentMeasureGraphic.geometry, {
                    wkid: 4326,
                  }),
                ],
                "kilometers"
              )[0]
              .toFixed(2) +
            " Kilómetros";
        }
        if ($("#measureLengthUnit").val() == "meters") {
          strHTML2 =
            strHTML2 +
            "Longitud: " +
            geodesicUtils
              .geodesicLengths(
                [
                  projection.project(currentMeasureGraphic.geometry, {
                    wkid: 4326,
                  }),
                ],
                "meters"
              )[0]
              .toFixed(2) +
            " Metros";
        }
        if ($("#measureLengthUnit").val() == "feet") {
          strHTML2 =
            strHTML2 +
            "Longitud: " +
            geodesicUtils
              .geodesicLengths(
                [
                  projection.project(currentMeasureGraphic.geometry, {
                    wkid: 4326,
                  }),
                ],
                "feet"
              )[0]
              .toFixed(2) +
            " Pies";
        }
        if ($("#measureLengthUnit").val() == "miles") {
          strHTML2 =
            strHTML2 +
            "Longitud: " +
            geodesicUtils
              .geodesicLengths(
                [
                  projection.project(currentMeasureGraphic.geometry, {
                    wkid: 4326,
                  }),
                ],
                "miles"
              )[0]
              .toFixed(2) +
            " Millas";
        }
        if ($("#measureLengthUnit").val() == "yards") {
          strHTML2 =
            strHTML2 +
            "Longitud: " +
            geodesicUtils
              .geodesicLengths(
                [
                  projection.project(currentMeasureGraphic.geometry, {
                    wkid: 4326,
                  }),
                ],
                "yards"
              )[0]
              .toFixed(2) +
            " Yardas";
        }
      } catch (err) {}
    } else {
      if (typeGeometry == "polygon") {
        $("#measureDivAreaUnits").show();
        $("#measureDivLengthUnits").show();
        $("#measureDivContainer").show();

        try {
          if ($("#measureAreaUnit").val() == "hectares") {
            strHTML =
              strHTML +
              "&Aacute;rea: " +
              geodesicUtils
                .geodesicAreas(
                  [
                    projection.project(currentMeasureGraphic.geometry, {
                      wkid: 4326,
                    }),
                  ],
                  "hectares"
                )[0]
                .toFixed(2) +
              " Hectareas";
          }
          if ($("#measureAreaUnit").val() == "square-kilometers") {
            strHTML =
              strHTML +
              "&Aacute;rea: " +
              geodesicUtils
                .geodesicAreas(
                  [
                    projection.project(currentMeasureGraphic.geometry, {
                      wkid: 4326,
                    }),
                  ],
                  "square-kilometers"
                )[0]
                .toFixed(2) +
              " Kilómetros cuadrados";
          }
          if ($("#measureAreaUnit").val() == "square-meters") {
            strHTML =
              strHTML +
              "&Aacute;rea: " +
              geodesicUtils
                .geodesicAreas(
                  [
                    projection.project(currentMeasureGraphic.geometry, {
                      wkid: 4326,
                    }),
                  ],
                  "square-meters"
                )[0]
                .toFixed(2) +
              " Metros cuadrados";
          }
          if ($("#measureAreaUnit").val() == "square-feet") {
            strHTML =
              strHTML +
              "&Aacute;rea: " +
              geodesicUtils
                .geodesicAreas(
                  [
                    projection.project(currentMeasureGraphic.geometry, {
                      wkid: 4326,
                    }),
                  ],
                  "square-feet"
                )[0]
                .toFixed(2) +
              " Pies cuadrados";
          }
          if ($("#measureAreaUnit").val() == "square-miles") {
            strHTML =
              strHTML +
              "&Aacute;rea: " +
              geodesicUtils
                .geodesicAreas(
                  [
                    projection.project(currentMeasureGraphic.geometry, {
                      wkid: 4326,
                    }),
                  ],
                  "square-miles"
                )[0]
                .toFixed(2) +
              " Millas cuadradas";
          }
          if ($("#measureAreaUnit").val() == "square-yards") {
            strHTML =
              strHTML +
              "&Aacute;rea: " +
              geodesicUtils
                .geodesicAreas(
                  [
                    projection.project(currentMeasureGraphic.geometry, {
                      wkid: 4326,
                    }),
                  ],
                  "square-yards"
                )[0]
                .toFixed(2) +
              " Yardas cuadradas";
          }
        } catch (err) {}
        try {
          if ($("#measureLengthUnit").val() == "kilometers") {
            strHTML2 =
              strHTML2 +
              "Per&iacute;metro: " +
              geodesicUtils
                .geodesicLengths(
                  [
                    projection.project(currentMeasureGraphic.geometry, {
                      wkid: 4326,
                    }),
                  ],
                  "kilometers"
                )[0]
                .toFixed(2) +
              " Kilómetros";
          }
          if ($("#measureLengthUnit").val() == "meters") {
            strHTML2 =
              strHTML2 +
              "Per&iacute;metro: " +
              geodesicUtils
                .geodesicLengths(
                  [
                    projection.project(currentMeasureGraphic.geometry, {
                      wkid: 4326,
                    }),
                  ],
                  "meters"
                )[0]
                .toFixed(2) +
              " Metros";
          }
          if ($("#measureLengthUnit").val() == "feet") {
            strHTML2 =
              strHTML2 +
              "Per&iacute;metro: " +
              geodesicUtils
                .geodesicLengths(
                  [
                    projection.project(currentMeasureGraphic.geometry, {
                      wkid: 4326,
                    }),
                  ],
                  "feet"
                )[0]
                .toFixed(2) +
              " Pies";
          }
          if ($("#measureLengthUnit").val() == "miles") {
            strHTML2 =
              strHTML2 +
              "Per&iacute;metro: " +
              geodesicUtils
                .geodesicLengths(
                  [
                    projection.project(currentMeasureGraphic.geometry, {
                      wkid: 4326,
                    }),
                  ],
                  "miles"
                )[0]
                .toFixed(2) +
              " Millas";
          }
          if ($("#measureLengthUnit").val() == "yards") {
            strHTML2 =
              strHTML2 +
              "Per&iacute;metro: " +
              geodesicUtils
                .geodesicLengths(
                  [
                    projection.project(currentMeasureGraphic.geometry, {
                      wkid: 4326,
                    }),
                  ],
                  "yards"
                )[0]
                .toFixed(2) +
              " Yardas";
          }
        } catch (err) {}
      } else {
        if (typeGeometry == "point") {
          $("#measureDivContainer").show();
          if ($("#systemCoordinates").val() === "wgs84") {
            $("#measureDivCoordinates").html(
              `Longitud: ${currentMeasureGraphic.geometry.longitude.toFixed(
                4
              )} <br> Latitud: ${currentMeasureGraphic.geometry.latitude.toFixed(
                4
              )}`
            );
          } else {
            proj4.defs(
              "ESRI:102100",
              "+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs +type=crs"
            );
            proj4.defs(
              "EPSG:9377",
              "+proj=tmerc +lat_0=4.0 +lon_0=-73.0 +k=0.9992 +x_0=5000000 +y_0=2000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
            );
            var source = new proj4.Proj("ESRI:102100");
            var dest = new proj4.Proj("EPSG:9377");
            var coordinatesOrigenNacional = proj4.transform(source, dest, [
              currentMeasureGraphic.geometry.x,
              currentMeasureGraphic.geometry.y,
            ]);
            $("#measureDivCoordinates").html(
              `Este: ${coordinatesOrigenNacional.x.toFixed(
                6
              )} <br> Norte: ${coordinatesOrigenNacional.y.toFixed(6)}`
            );
          }
        } else {
          $("#measureDivContainer").hide();
        }
      }
    }
    $("#measureDivArea").html(strHTML);
    $("#measureDivLength").html(strHTML2);
  });
}

async function updateEditGraphic() {
  if (currentEditGraphic != null) {
    let symbol = currentEditGraphic.symbol;
    switch (currentEditGraphic.geometry.type) {
      case "polyline":
        symbol.color = $("#drawOptLineColorInput").val();
        currentEditGraphic.symbol = symbol;
        dibujoLayer.add(null);
        break;

      case "polygon":
        symbol.color = $("#drawOptFillColorInput").val();
        symbol.outline.color = $("#drawOptLineColorInput").val();
        currentEditGraphic.symbol = symbol;
        dibujoLayer.add(null);
        break;

      case "point":
        if(currentEditGraphic.symbol.type === "text"){
          currentEditGraphic.symbol.text = $("#drawText").val();
           currentEditGraphic.symbol.font.size = $("#sizeText").val();
        }
        symbol.color = $("#drawOptFillColorInput").val();
        currentEditGraphic.symbol = symbol;
        dibujoLayer.add(null);
        break;
    }
  }
}
