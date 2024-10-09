function gotoLegend(){
    currentScreen = "legend";
    reporteUso("Abrir Leyenda");
    toggleMenu("small");
    minAll();

    $("#panelLeyenda").show();

    fetch("./herramientas/leyenda/index.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("panelLeyenda").innerHTML = data;
      
      $("#panelLeyenda").draggable({
        handle: ".panel-mover",
        containment: "#mapViewDiv",
      });
      $("#collapseLegend").on("shown.bs.collapse", (event) => {
        var windowPosition = $("#panelLeyenda").position();
        var parentPosition = $("#mapViewDiv").position();
        var windowHeight = $("#panelLeyenda").outerHeight();
        var parentHeight = $("#mapViewDiv").height();
        var windowWidth = $("#panelLeyenda").outerWidth();
        var parentWidth = $("#mapViewDiv").width();
        if (Math.abs(windowPosition.left) + windowWidth > parentWidth) {
          $("#panelLeyenda").offset({ left: parentPosition.left });
        }

        if (windowPosition.top + windowHeight > parentHeight) {
          $("#panelLeyenda").css("top", parentHeight - windowHeight);
        }
      });
      addLegend();
    });
    
}

function closeLegend() {
    $("#panelLeyenda").hide();
}

function addLegend(){
    require(["esri/widgets/Legend"], (Legend) => {
        let legend = new Legend({
            view: window.viewMap,
            container: "legendDiv"
          });
     });
}