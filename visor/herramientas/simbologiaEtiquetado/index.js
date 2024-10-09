var colorPickers = [];
var colorPickersCategorias = [];
var layerTarget;
var rendererBefore;
var categoriasValues;
var clasesValues;
var colorInicioClases, colorFinClases, colorInicioPuntosCalor, colorFinPuntosCalor;

function goToSimbologia(layer) {
  fetch("./herramientas/simbologiaEtiquetado/index.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("contentSimbologia").innerHTML = data;
      $("#panelSimbologiaTitle").text(
        "Simbología y Etiquetado: " + layer.value.title
      );

      $("#simbologia-tab").tooltip({
        title: "Simbología",
        placement: "top",
      });
      $("#etiquetado-tab").tooltip({
        title: "Etiquetado",
        placement: "top",
      });
      switch (layer.value.layer.geometryType) {
        case "polygon":
          $("#simbologiaSimplePoligono").show();
          createColorPickers([
            "color-relleno",
            "color-contorno",
            "color-fuente",
            "color-halo",
          ]);
          break;

        case "point":
        case "multipoint":
          createColorPickers(["color-punto", "color-fuente", "color-halo"]);
          $("#simbologiaSimplePunto").show();
          layer.value.layer.fields.forEach((field) => {
            if (
              field.type !== "geometry" &&
              (field.type == "double" ||
                field.type.includes("integer") ||
                field.type == "long")
            ) {
              $("#campoPeso").append(
                $("<option>", {
                  value: field.name,
                }).text(field.alias)
              );
            }
          });
          break;

        case "polyline":
          createColorPickers(["color-linea", "color-fuente", "color-halo"]);
          $("#simbologiaSimpleLinea").show();
          break;
      }
      layer.value.layer.fields.forEach((field) => {
        if (
          field.type !== "geometry" &&
          (field.type == "double" ||
            field.type.includes("integer") ||
            field.type == "long")
        ) {
          $("#campoClases").append(
            $("<option>", {
              value: field.name,
            }).text(field.alias)
          );
        }
      });

      layer.value.layer.fields.forEach((field) => {
        if (field.type !== "geometry") {
          $("#campoCategoria").append(
            $("<option>", {
              value: field.name,
            }).text(field.alias)
          );
        }
      });
      layer.value.layer.fields.forEach((field) => {
        if (field.type !== "geometry") {
          $("#campoEtiquetas").append(
            $("<option>", {
              value: field.name,
            }).text(field.alias)
          );
        }
      });
      createColorRamps();
    });

  layerTarget = layer.value.layer;
  rendererBefore = layer.value.layer.renderer;
}

function createColorPickers(pickersContainers) {
  pickersContainers.forEach((pickr, index) => {
    colorPickers.push(
      Pickr.create({
        el: `#${pickr}`,
        theme: "nano",
        components: {
          preview: true,
          opacity: true,
          hue: true,
          interaction: {
            input: true,
            save: true,
          },
        },
        i18n: {
          "btn:save": "Seleccionar",
        },
      }).on("save", () => {
        colorPickers[index].hide();
      })
    );
  });
}

async function aplicarEstilo() {
  $("#errorClasificacion").hide();
  const activeTabSimbologia = document.querySelector(
    "#tabsSimbologia .nav-link.active"
  );
  const activeTabSimbologiaId = activeTabSimbologia
    ? activeTabSimbologia.getAttribute("id")
    : "Ninguna";
  const activeTabMain = document.querySelector("#mainTabs .nav-link.active");
  const activeTabMainId = activeTabMain
    ? activeTabMain.getAttribute("id")
    : "Ninguna";

  switch (activeTabMainId) {
    case "simbologia-tab":
      switch (layerTarget.geometryType) {
        case "polygon":
          switch (activeTabSimbologiaId) {
            case "simple-tab":
              layerTarget.renderer = {
                type: "simple",
                symbol: {
                  type: "simple-fill",
                  color: colorPickers[0].getColor().toRGBA(),
                  style: $("#rellenoSimplePoligono").val(),
                  outline: {
                    style: $("#contornoSimplePoligono").val(),
                    width: $("#grosorContornoPoligono").val(),
                    color: colorPickers[1].getColor().toRGBA(),
                  },
                },
              };
              break;

            case "clases-tab":
              await clasificarDatos($("#metodoClases").val());
              const colorsBreaks = getColorsRamp(
                colorInicioClases.getColor().toHEXA().toString(),
                colorFinClases.getColor().toHEXA().toString(),
                $("#numeroClases").val()
              );
              const classBreakInfos = clasesValues
                .slice(0, -1)
                .map((breakValue, index) => {
                  return {
                    minValue: clasesValues[index],
                    maxValue: clasesValues[index + 1],
                    symbol: {
                      type: "simple-fill",
                      color: colorsBreaks[index],
                    },
                    label: `${clasesValues[index].toFixed(3)} - ${clasesValues[
                      index + 1
                    ].toFixed(3)}`,
                  };
                });
              layerTarget.renderer = {
                type: "class-breaks",
                field: $("#campoClases").val(),
                classBreakInfos: classBreakInfos,
              };

              break;

            case "categoria-tab":
              const categorias = [];
              categoriasValues.forEach((category, index) => {
                categorias[index] = {
                  name: category,
                  color: colorPickersCategorias[index].getColor().toRGBA(),
                };
              });
              layerTarget.renderer = {
                type: "unique-value",
                field: $("#campoCategoria").val(),
                defaultSymbol: {
                  type: "simple-fill",
                  color: colorPickersCategorias[categoriasValues.length]
                    .getColor()
                    .toRGBA(),
                  outline: { color: "black", width: 1 },
                },
                uniqueValueInfos: [
                  ...categorias.map((value) => ({
                    value: value.name,
                    symbol: {
                      type: "simple-fill",
                      color: value.color,
                      outline: { color: "black", width: 1 },
                    },
                  })),
                ],
              };
              break;
          }
          break;

        case "point":
          case "multipoint":
          switch (activeTabSimbologiaId) {
            case "simple-tab":
              if ($("#enablePuntoscalor").is(":checked")) {
                require(["esri/smartMapping/renderers/heatmap"], (
                  heatmapRendererCreator
                ) => {
                  let heatmapParams = {
                    layer: layerTarget,
                    view: window.viewMap,
                    field: $("#campoPeso").val(),
                    radius: $("#radioPuntosCalor").val(),
                  };

                  heatmapRendererCreator
                    .createRenderer(heatmapParams)
                    .then(function (response) {
                      const colorsStops = getColorsRamp(
                        colorInicioPuntosCalor.getColor().toHEXA().toString(),
                        colorFinPuntosCalor.getColor().toHEXA().toString(),
                        response.renderer.colorStops.length
                      );
                      response.renderer.colorStops.forEach(
                        (colorStop, index) => {
                          if (colorStop.color.a != 0) {
                            colorStop.color = colorsStops[index];
                          }
                        }
                      );
                      layerTarget.renderer = response.renderer;
                    });
                });
              } else {
                layerTarget.renderer = {
                  type: "simple",
                  symbol: {
                    type: "simple-marker",
                    size: $("#tamanoPunto").val(),
                    color: colorPickers[0].getColor().toRGBA(),
                    style: $("#estiloSimplePunto").val(),
                    outline: {
                      color: colorPickers[0].getColor().toRGBA(),
                    },
                  },
                };
              }

              break;

            case "clases-tab":
              try {
                await clasificarDatos($("#metodoClases").val());
                 const colorsBreaks = getColorsRamp(
                colorInicioClases.getColor().toHEXA().toString(),
                colorFinClases.getColor().toHEXA().toString(),
                $("#numeroClases").val()
              );

              const classBreakInfos = clasesValues.slice(0, -1).map((breakValue, index) => {
                  return {
                    minValue: clasesValues[index],
                    maxValue: clasesValues[index + 1],
                    symbol: {
                      type: "simple-marker",
                      color: colorsBreaks[index],
                    },
                    label: `${clasesValues[index].toFixed(3)} - ${clasesValues[
                      index + 1
                    ].toFixed(3)}`,
                  };
                });
              layerTarget.renderer = {
                type: "class-breaks",
                field: $("#campoClases").val(),
                classBreakInfos: classBreakInfos,
              };
             } catch (error) {
              //  console.error("Se produjo un error haciendo la clasificación (Arriba): ", error);
             }
             
             
              break;

            case "categoria-tab":
              const categorias = [];
              categoriasValues.forEach((category, index) => {
                categorias[index] = {
                  name: category,
                  color: colorPickersCategorias[index].getColor().toRGBA(),
                };
              });
              layerTarget.renderer = {
                type: "unique-value",
                field: $("#campoCategoria").val(),
                defaultSymbol: {
                  type: "simple-marker",
                  color: colorPickersCategorias[categoriasValues.length]
                    .getColor()
                    .toRGBA(),
                  size: 5,
                },
                uniqueValueInfos: [
                  ...categorias.map((value) => ({
                    value: value.name,
                    symbol: {
                      type: "simple-marker",
                      color: value.color,
                      size: 3,
                    },
                  })),
                ],
              };
              break;
          }
          break;

        case "polyline":
          switch (activeTabSimbologiaId) {
            case "simple-tab":
              layerTarget.renderer = {
                type: "simple",
                symbol: {
                  type: "simple-line",
                  color: colorPickers[0].getColor().toRGBA(),
                  style: $("#estiloSimpleLinea").val(),
                  width: $("#grosorLinea").val(),
                },
              };
              break;

            case "clases-tab":
              await clasificarDatos($("#metodoClases").val());
              const colorsBreaks = getColorsRamp(
                colorInicio.getColor().toHEXA().toString(),
                colorFin.getColor().toHEXA().toString(),
                $("#numeroClases").val()
              );
              const classBreakInfos = clasesValues
                .slice(0, -1)
                .map((breakValue, index) => {
                  return {
                    minValue: clasesValues[index],
                    maxValue: clasesValues[index + 1],
                    symbol: {
                      type: "simple-line",
                      color: colorsBreaks[index],
                    },
                    label: `${clasesValues[index].toFixed(3)} - ${clasesValues[
                      index + 1
                    ].toFixed(3)}`,
                  };
                });
              layerTarget.renderer = {
                type: "class-breaks",
                field: $("#campoClases").val(),
                classBreakInfos: classBreakInfos,
              };
              break;

            case "categoria-tab":
              const categorias = [];
              categoriasValues.forEach((category, index) => {
                categorias[index] = {
                  name: category,
                  color: colorPickersCategorias[index].getColor().toRGBA(),
                };
              });
              layerTarget.renderer = {
                type: "unique-value",
                field: $("#campoCategoria").val(),
                defaultSymbol: {
                  type: "simple-line",
                  color: colorPickersCategorias[categoriasValues.length]
                    .getColor()
                    .toRGBA(),
                  width: 1.5,
                },
                uniqueValueInfos: [
                  ...categorias.map((value) => ({
                    value: value.name,
                    symbol: {
                      type: "simple-line",
                      color: value.color,
                      width: 1.5,
                    },
                  })),
                ],
              };
              break;
          }
          break;
      }
      window.viewMap.goTo(layerTarget.fullExtent);
      break;

    case "etiquetado-tab":
      const labelClass = {
        symbol: {
          type: "text",
          color: colorPickers[colorPickers.length - 2].getColor().toRGBA(),
          haloColor: colorPickers[colorPickers.length - 1].getColor().toRGBA(),
          haloSize: $("#haloEtiquetas").val(),
          font: {
            family: $("#fuenteEtiquetas").val(),
            size: $("#tamanoFuente").val(),
          },
        },
        labelExpressionInfo: {
          expression: "$feature." + $("#campoEtiquetas").val(),
        },
      };
      switch ($("#estiloEtiquetas").val()) {
        case "normal":
          labelClass.symbol.font.style = "normal";
          labelClass.symbol.font.weight = "normal";
          break;
        case "bold":
          labelClass.symbol.font.style = "normal";
          labelClass.symbol.font.weight = "bold";
          break;
        case "italic":
          labelClass.symbol.font.style = "italic";
          labelClass.symbol.font.weight = "normal";
          break;
        case "bold-italic":
          labelClass.symbol.font.style = "italic";
          labelClass.symbol.font.weight = "bold";
          break;
      }
      layerTarget.labelingInfo = [labelClass];
      break;
  }
}

function updateValueGrosor(element) {
  $(`#${element.id}Label`).text(
    `${$(`#${element.id}Label`).text().split(":")[0]}: ${$(
      `#${element.id}`
    ).val()}`
  );
}

function restablecerEstilo() {
  $("#divCategorias").hide();
  $("#campoCategoria")[0].selectedIndex = 0;
  $("#metodoClases")[0].selectedIndex = 0;
  $("#campoClases")[0].selectedIndex = 0;
  $("#campoClases")[0].selectedIndex = 0;
  $("#numeroClases").val(6);
  $("#grosorLinea").val(10);
  $("#tamanoPunto").val(10);
  $("#tamanoLinea").val(10);
  $("#grosorContornoPoligono").val(10);
  $("#estiloSimpleLinea")[0].selectedIndex = 0;
  $("#estiloSimplePunto")[0].selectedIndex = 0;
  $("#contornoSimplePoligono")[0].selectedIndex = 0;
  $("#rellenoSimplePoligono")[0].selectedIndex = 0;
  if (document.getElementById("numeroClases")) {
    updateValueGrosor(document.getElementById("numeroClases"));
  }
  if (document.getElementById("grosorLinea")) {
    updateValueGrosor(document.getElementById("grosorLinea"));
  }
  if (document.getElementById("tamanoPunto")) {
    updateValueGrosor(document.getElementById("tamanoPunto"));
  }
  if (document.getElementById("tamanoLinea")) {
    updateValueGrosor(document.getElementById("tamanoLinea"));
  }
  if (document.getElementById("grosorContornoPoligono")) {
    updateValueGrosor(document.getElementById("grosorContornoPoligono"));
  }
}

async function createCategorias() {
  const campo = $("#campoCategoria").val();
  $("#divCategorias").show();
  $("#divCategorias").empty();
  colorPickersCategorias = [];
  const query = layerTarget.createQuery();
  query.outFields = [campo];
  query.returnGeometry = false;
  query.returnDistinctValues = true;
  const results = await layerTarget.queryFeatures(query);
  const uniqueValues = results.features.map(
    (feature) => feature.attributes[campo]
  );
  if (uniqueValues.length > 5) {
    categoriasValues = uniqueValues.slice(0, 5);
  } else {
    categoriasValues = uniqueValues;
  }

  categoriasValues.forEach((category, index) => {
    $("#divCategorias").append(
      ` <div class="categoriaItem">
<div id="color-categoria${index}" class="colorpicker"></div>
         <label class="form-check-label" for="color-categoria${index}" id="label-categoria${index}">${category}</label>
             
        </div>
                   `
    );
    colorPickersCategorias.push(
      Pickr.create({
        el: `#color-categoria${index}`,
        theme: "nano",
        default: getRandomColor(),
        components: {
          preview: true,
          opacity: true,
          hue: true,
          interaction: {
            input: true,
            save: true,
          },
        },
        i18n: {
          "btn:save": "Seleccionar",
        },
      }).on("save", () => {
        colorPickersCategorias[index].hide();
      })
    );
  });
  $("#divCategorias").append(
    ` <div class="categoriaItem"><div id="color-otros" class="colorpicker"></div>
         <label class="form-check-label" for="color-otros" id="label-otros">Otros</label>
           </div>              `
  );
  colorPickersCategorias.push(
    Pickr.create({
      el: `#color-otros`,
      theme: "nano",
      default: getRandomColor(),
      components: {
        preview: true,
        opacity: true,
        hue: true,
        interaction: {
          input: true,
          save: true,
        },
      },
      i18n: {
        "btn:save": "Seleccionar",
      },
    }).on("save", () => {
      colorPickersCategorias[categoriasValues.length].hide();
    })
  );
  colorPickersCategorias[categoriasValues.length].setColor(getRandomColor());
}

function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

async function clasificarDatos(metodo) {
  const campo = $("#campoClases").val();
  const numeroClases = $("#numeroClases").val();
  const query = layerTarget.createQuery();
  query.outFields = [campo];
  query.returnGeometry = false;
  const results = await layerTarget.queryFeatures(query);
  const values = results.features.map((feature) => feature.attributes[campo]);
  const cleanedValues = values.filter((value) => value != null);
  const stats = new geostats(cleanedValues);
  switch (metodo) {
    case "cuantiles":
      try {
         clasesValues = stats.getClassQuantile(numeroClases);
      } catch (error) {
        console.error("Se produjo un error haciendo la clasificación: ", error);
        $("#errorClasificacion").show();
      }
      break;
    case "intervalosGeometricos":
      try {
        clasesValues = stats.getClassGeometricProgression(numeroClases);
     } catch (error) {
       console.error("Se produjo un error haciendo la clasificación: ", error);
       $("#errorClasificacion").show();
     }
      break;
    case "intervalosIguales":
      try {
       clasesValues = stats.getClassEqInterval(numeroClases);
     } catch (error) {
       console.error("Se produjo un error haciendo la clasificación: ", error);
       $("#errorClasificacion").show();
     }
      break;
    case "limitesNaturales":
      try {
        clasesValues = stats.getClassJenks(numeroClases);
     } catch (error) {
       console.error("Se produjo un error haciendo la clasificación: ", error);
       $("#errorClasificacion").show();
     }
      break;
  }
}

function createColorRamps() {
  colorInicioClases = Pickr.create({
    el: `#colorInicioRampa`,
    theme: "nano",
    default: getRandomColor(),
    components: {
      preview: true,
      opacity: false,
      hue: true,
      interaction: {
        input: true,
        save: true,
      },
    },
    i18n: {
      "btn:save": "Seleccionar",
    },
  }).on("save", () => {
    colorInicioClases.hide();
    updateRampacolor(
      "clases",
      colorInicioClases.getColor().toHEXA().toString(),
      colorFinClases.getColor().toHEXA().toString()
    );
  });

  colorFinClases = Pickr.create({
    el: `#colorFinRampa`,
    theme: "nano",
    default: getRandomColor(),
    components: {
      preview: true,
      opacity: false,
      hue: true,
      interaction: {
        input: true,
        save: true,
      },
    },
    i18n: {
      "btn:save": "Seleccionar",
    },
  }).on("save", () => {
    colorFinClases.hide();
    updateRampacolor(
      "clases",
      colorInicioClases.getColor().toHEXA().toString(),
      colorFinClases.getColor().toHEXA().toString()
    );
  });

  colorFinClases.on("init", (instance) => {
    updateRampacolor(
      "clases",
      colorInicioClases.getColor().toHEXA().toString(),
      colorFinClases.getColor().toHEXA().toString()
    );
  });

  if (layerTarget.geometryType === "point" || layerTarget.geometryType === "multipoint") {
    colorInicioPuntosCalor = Pickr.create({
      el: `#colorInicioRampaPuntosCalor`,
      theme: "nano",
      default: getRandomColor(),
      components: {
        preview: true,
        opacity: false,
        hue: true,
        interaction: {
          input: true,
          save: true,
        },
      },
      i18n: {
        "btn:save": "Seleccionar",
      },
    }).on("save", () => {
      colorInicioPuntosCalor.hide();
      updateRampacolor(
        "puntosCalor",
        colorInicioPuntosCalor.getColor().toHEXA().toString(),
        colorFinPuntosCalor.getColor().toHEXA().toString()
      );
    });

    colorFinPuntosCalor = Pickr.create({
      el: `#colorFinRampaPuntosCalor`,
      theme: "nano",
      default: getRandomColor(),
      components: {
        preview: true,
        opacity: false,
        hue: true,
        interaction: {
          input: true,
          save: true,
        },
      },
      i18n: {
        "btn:save": "Seleccionar",
      },
    }).on("save", () => {
      colorFinPuntosCalor.hide();
      updateRampacolor(
        "puntosCalor",
        colorInicioPuntosCalor.getColor().toHEXA().toString(),
        colorFinPuntosCalor.getColor().toHEXA().toString()
      );
    });

    colorFinPuntosCalor.on("init", (instance) => {
      updateRampacolor(
        "puntosCalor",
        colorInicioPuntosCalor.getColor().toHEXA().toString(),
        colorFinPuntosCalor.getColor().toHEXA().toString()
      );
    });
  }
}

function updateRampacolor(type, colorStart, colorEnd) {
  let rampContainer, gradient;
  switch (type) {
    case "clases":
      rampContainer = document.getElementById("rampaColor");
      rampContainer.innerHTML = "";
      gradient = `linear-gradient(to right, ${colorStart}, ${colorEnd})`;
      rampContainer.style.background = gradient;
      break;

    case "puntosCalor":
      rampContainer = document.getElementById("rampaPuntosCalor");
      rampContainer.innerHTML = "";
      gradient = `linear-gradient(to right, ${colorStart}, ${colorEnd})`;
      rampContainer.style.background = gradient;
      break;
  }
}

function getColorsRamp(startColor, endColor, numColors) {
  let colors = [];
  for (let i = 0; i < numColors; i++) {
    let factor = i / (numColors - 1);
    colors.push(interpolateColor(startColor, endColor, factor));
  }
  return colors;
}

function hexToRgb(hex) {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

function interpolateColor(color1, color2, factor) {
  let [r1, g1, b1] = hexToRgb(color1);
  let [r2, g2, b2] = hexToRgb(color2);

  let r = Math.round(r1 + factor * (r2 - r1));
  let g = Math.round(g1 + factor * (g2 - g1));
  let b = Math.round(b1 + factor * (b2 - b1));

  return rgbToHex(r, g, b);
}

function tooglePuntosCalor() {
  if ($("#enablePuntoscalor").is(":checked")) {
    $("#puntosCalor").show();
  } else {
    $("#puntosCalor").hide();
  }
}
