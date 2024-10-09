function gotoOperadores() {
  currentScreen = "operadores";
  reporteUso("Abrir Operadores");
  toggleMenu("small");
  minAll();
  fetch("./herramientas/operadoresEspaciales/index.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("panelOperadores").innerHTML = data;
      $("#selectOperadoresOp").on("change", changeOperador);
      $("#panelOperadores").draggable({
        handle: ".panel-mover",
        containment: "#mapViewDiv",
      });
      $("#collapseOperadores").on("shown.bs.collapse", (event) => {
        var windowPosition = $("#panelOperadores").position();
        var parentPosition = $("#mapViewDiv").position();
        var windowHeight = $("#panelOperadores").outerHeight();
        var parentHeight = $("#mapViewDiv").height();
        var windowWidth = $("#panelOperadores").outerWidth();
        var parentWidth = $("#mapViewDiv").width();
        if (Math.abs(windowPosition.left) + windowWidth > parentWidth) {
          $("#panelOperadores").offset({ left: parentPosition.left });
        }
        if (windowPosition.top + windowHeight > parentHeight) {
          $("#panelOperadores").css("top", parentHeight - windowHeight);
        }
      });
    })
    .catch((error) => console.error("Error al cargar el contenido: ", error));
  $("#joinDiv").hide();
  $("#panelOperadores").show();

}

function closeOperadores() {
  $("#panelOperadores").hide();
}

function changeOperador() {
  $("#divProgressBar").show();
  switch ($("#selectOperadoresOp").val()) {
    case "join":
      $("#contentOperador").children().hide();
      $("#joinDiv").show();
      $("#capaDestino option:not(:first)").remove();
      window.viewMap.map.layers.forEach((layer) => {
        $("#capaDestino").append(
          $("<option>", {
            value: layer.id,
          }).text(layer.title)
        );
      });
      $("#capaDestino").append(
        $("<option>", {
          value: "local",
        }).text("Cargar un archivo local")
      );
      break;

    case "buffer":
      $("#contentOperador").children().hide();
      $("#bufferDiv").show();
      $("#capaBuffer option:not(:first)").remove();
      window.viewMap.map.layers.forEach((layer) => {
        $("#capaBuffer").append(
          $("<option>", {
            value: layer.id,
          }).text(layer.title)
        );
      });
      break;

case "intersect":   
   $("#contentOperador").children().hide();
      $("#intersectDiv").show();
      $("#capa1Intersect option:not(:first)").remove();
      window.viewMap.map.layers.forEach((layer) => {
        $("#capa1Intersect").append(
          $("<option>", {
            value: layer.id,
          }).text(layer.title)
        );
      $("#capa2Intersect").append(
          $("<option>", {
            value: layer.id,
          }).text(layer.title)
        );
      
      });
      break;

      case "union":   
   $("#contentOperador").children().hide();
      $("#unionDiv").show();
      $("#capa1Union option:not(:first)").remove();
      window.viewMap.map.layers.forEach((layer) => {
        $("#capa1Union").append(
          $("<option>", {
            value: layer.id,
          }).text(layer.title)
        );
      });
      break;
  }
}


function setProgressBar(percent) {
  percent = Math.round(percent);
  $("#progressOperator").css("width", percent + "%");
  $("#progressOperator").text(percent + "%");
  $("#progressOperator").attr("aria-valuenow", percent);
}

function getProgressBar() {
return Number($("#progressOperator").attr("aria-valuenow"));
}






