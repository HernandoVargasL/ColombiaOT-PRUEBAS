var capaSelectedResume;
var chartColors = {
  red: "rgba(255, 99, 132, 0.6)",
  orange: "rgba(255, 159, 64, 0.6)",
  yellow: "rgba(255, 205, 86, 0.6)",
  green: "rgba(75, 192, 192, 0.6)",
  blue: "rgba(54, 162, 235, 0.6)",
  purple: "rgba(153, 102, 255, 0.6)",
  grey: "rgba(201, 203, 207, 0.6)",
};

var estadisticasBasicas = {
  "Campo": "",
  "Conteo": 0,
  "Mínimo": 0,
  "Máximo": 0,
  "Suma": 0,
  "Promedio": 0, 
  "Desviación Estándar": 0,
  "Nulos": 0
};

var cuantificarField;
var campoResumen;

function gotoEstadisticas() {
  currentScreen = "estadisticas";
  reporteUso("Abrir Estadisticas");
  toggleMenu("small");
  minAll();
  fetch("./herramientas/estadisticas/index.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("panelEstadisticas").innerHTML = data;
      window.viewMap.map.layers.forEach((layer) => {
        $("#capaResumenSelect").append(
          $("<option>", {
            value: layer.id,
          }).text(layer.title)
        );
      });
      $("#panelEstadisticas").draggable({
        handle: ".panel-mover",
        containment: "#mapViewDiv",
      });
      $("#collapseEstadisticas").on("shown.bs.collapse", (event) => {
        var windowPosition = $("#panelEstadisticas").position();
        var parentPosition = $("#mapViewDiv").position();
        var windowHeight = $("#panelEstadisticas").outerHeight();
        var parentHeight = $("#mapViewDiv").height();
        var windowWidth = $("#panelEstadisticas").outerWidth();
        var parentWidth = $("#mapViewDiv").width();
        if (Math.abs(windowPosition.left) + windowWidth > parentWidth) {
          $("#panelEstadisticas").offset({ left: parentPosition.left });
        }
        if (windowPosition.top + windowHeight > parentHeight) {
          $("#panelEstadisticas").css("top", parentHeight - windowHeight);
        }
      });
    })
    .catch((error) => console.error("Error al cargar el contenido: ", error));
  $("#panelEstadisticas").show();
 
}

function closeEstadisticas() {
  $("#panelEstadisticas").hide();
}

function capaResumenSelected() {
  enableCreateChart();
  capaSelectedResume = window.viewMap.map.findLayerById(
    $("#capaResumenSelect").val()
  );

  $("#atributoResumen option:not(:first)").remove();
  $("#atributoCuantificar option:not(:first)").remove();
  capaSelectedResume.fields.forEach((field) => {
    $("#atributoResumen").append(
      $("<option>", {
        value: field.name,
      }).text(field.alias)
    );
    if (
      field.type == "double" ||
      field.type.includes("integer") ||
      field.type == "long"
    ) {
      $("#atributoCuantificar").append(
        $("<option>", {
          value: field.name,
        }).text(field.alias)
      );
    }
  });
}

function enableCreateChart() {
  if (
    $("#capaResumenSelect").val() &&
    $("input[name='optionsGrafico']:checked").val() &&
    $("#atributoResumen").val() &&
    $("#atributoCuantificar").val()
  ) {
    $("#btnChart").prop("disabled", false);
  } else {
    $("#btnChart").prop("disabled", true);
  }
}

function calcularEstadisticas() {
  $("#onCalcular").hide();
  $("#loadingCalcular").show();
  
   cuantificarField = $("#atributoCuantificar").val();
   campoResumen = $("#atributoResumen").val();
   estadisticasBasicas.Campo = $("#atributoResumen option:selected").text();
var queryChart = capaSelectedResume.createQuery();
  queryChart.outFields = [campoResumen, cuantificarField];
  queryChart.returnGeometry = false;
const clasesPrincipales = {};
  const otros = { [campoResumen]: "Otros", [cuantificarField]: 0 };
  let nulos = 0;
  capaSelectedResume.queryFeatures(queryChart).then((resultTarget) => {
       resultTarget.features.forEach((feature) => {        
      if (clasesPrincipales[feature.attributes[campoResumen]]) {
        clasesPrincipales[feature.attributes[campoResumen]] +=
          feature.attributes[cuantificarField];
      } else {
        clasesPrincipales[feature.attributes[campoResumen]] =
          feature.attributes[cuantificarField];
      }
      
      if (feature.attributes[campoResumen] === null) {
        nulos++
      }
    });
    
    getEstadisticasBasicas(clasesPrincipales);
const clasesOrdenadas = Object.entries(clasesPrincipales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const resultados = clasesOrdenadas.map((clase) => ({
      [campoResumen]: clase[0],
      [cuantificarField]: clase[1],
    }));
    const cantidadesPrincipales = clasesOrdenadas.map((clase) => clase[1]);

    const cantidadRestante =
      Object.keys(clasesPrincipales).reduce(
        (total, dato) => total + clasesPrincipales[dato],
        0
      ) -
      cantidadesPrincipales.reduce(
        (total, cuantificarField) => total + cuantificarField,
        0
      );
    otros[cuantificarField] = cantidadRestante;
    resultados.push(otros);
    for (let key in resultados) {
      if (parseFloat(resultados[key][campoResumen])) {
          resultados[key][campoResumen] = parseFloat(resultados[key][campoResumen]).toFixed(2);
      }
  }

createChart(resultados);
createTable(nulos);
  });
}

function createChart(data) {
  if ($("#chartCanvas").length) {
    $("#chartCanvas").remove();
    $("#divChart").append(
      $("<canvas>", {
        id: "chartCanvas",
      })
    );
  } else {
    $("#divChart").append(
      $("<canvas>", {
        id: "chartCanvas",
      })
    );
  }
   
      var ctx = document.getElementById("chartCanvas").getContext("2d");
    var myChart = new Chart(ctx, {
      type: $("input[name='optionsGrafico']:checked").val(),
      data: {
        labels: data.map((clase) => clase[campoResumen]),
        datasets: [
          {
            label: $("#atributoCuantificar option:selected").text(),
            data: data.map((clase) => clase[cuantificarField]),
            backgroundColor: Object.values(chartColors),
            hoverOffset: 5,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display:
              $("input[name='optionsGrafico']:checked").val() == "bar"
                ? false
                : true,
            position: "top",
          },
        },
        animation: {
          onComplete: () => {
            $("#loadingCalcular").hide();
            $("#onCalcular").show();
            $("#onCalcular").text("Recalcular");
          },
        },
      },
    });
  
}

function createTable(cantidadNulos){
  var table = document.getElementById("tablaEstadisticas");
  table.innerHTML = "";
  for (var key in estadisticasBasicas) {
    var row = table.insertRow();
    var cellPropiedad = row.insertCell(0);
    var cellValor = row.insertCell(1);
    if (key == "Nulos") {
      cellPropiedad.innerHTML = `${key}: (${cantidadNulos} ${cantidadNulos == 1? 'fila':'filas'})`;
    cellValor.innerHTML = estadisticasBasicas[key];
    }else{
      cellPropiedad.innerHTML = key;
    cellValor.innerHTML = estadisticasBasicas[key];
    }
    
  }



}

function getEstadisticasBasicas(clasesPrincipales){

  let minValue = Infinity;
  let maxValue = -Infinity;
  let minName, maxName;
  let sum = 0;
  let count = 0;
  for (let key in clasesPrincipales) {
      if (typeof clasesPrincipales[key] === 'number') {
        if (key != 'null') {
          
          if (clasesPrincipales[key] < minValue) {
              minValue = clasesPrincipales[key];
              minName = key;
          }
          
          if (clasesPrincipales[key] > maxValue) {
              maxValue = clasesPrincipales[key];
              maxName = key;
          }
          
          sum += clasesPrincipales[key];
          count++;
        }
          
      }
  }
  estadisticasBasicas.Suma = new Intl.NumberFormat(navigator.language).format(sum.toFixed(3));
  estadisticasBasicas.Conteo = count;
  estadisticasBasicas.Máximo = `${new Intl.NumberFormat(navigator.language).format(maxValue.toFixed(3))} (${maxName})`;
  estadisticasBasicas.Mínimo = `${new Intl.NumberFormat(navigator.language).format(minValue.toFixed(3))} (${minName})`;
  let average = sum / count;
  estadisticasBasicas.Promedio = new Intl.NumberFormat(navigator.language).format(average.toFixed(3));
  if (clasesPrincipales.null) {
     estadisticasBasicas.Nulos = new Intl.NumberFormat(navigator.language).format(clasesPrincipales.null.toFixed(3));
  }else{
 estadisticasBasicas.Nulos = 0;
  }
 
  let sumSquaredDiff = 0;
  for (let key in clasesPrincipales) {
      if (typeof clasesPrincipales[key] === 'number') {
          sumSquaredDiff += Math.pow(clasesPrincipales[key] - average, 2);
      }
  }
  let standardDeviation = Math.sqrt(sumSquaredDiff / count);
  estadisticasBasicas["Desviación Estándar"] = new Intl.NumberFormat(navigator.language).format(standardDeviation.toFixed(3));
  
}
