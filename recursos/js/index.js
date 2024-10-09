
var currentUser;
var firebase_ui;
var currentScreen;
var currentEstado = "init";
var currentSearch = "all";
var firstExpand = true;
var firstParameters = true;
var tableRecursos;
var cacheRecursos;
var defaultAlertTimer = 3000;
var firstOpen = true;

//var web_service = "http://localhost:8080/Geovisor_IGAC";
var web_service = "https://serviciosgeovisor.igac.gov.co:8080/Geovisor";
//var web_service = "http://172.19.3.37:8080/Geovisor";
var web_service_proxy = "https://serviciosgeovisor.igac.gov.co:8080/Geovisor";

$(document).ready(function () {
    $("[data-toggle='popover']").popover();
    toggleMenu(currentEstado);
    var config = {
        apiKey: "AIzaSyCLSp_Qbaohj8owxrpZxvrmxUSkVw0ukig",
        authDomain: "geovisor-igac.firebaseapp.com"
    };
    firebase.initializeApp(config);
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            currentUser = user;
            $("#loginContainer").hide();
            $("#logoutContainer").show();
            $("#userName,#userName2").html(user.displayName);
            if (user.photoURL != null) {
                if (user.photoURL != "") {
                    $("#userPhoto,#userPhoto2").attr("src", user.photoURL);
                } else {
                    $("#userPhoto,#userPhoto2").attr("src", "/images/iconos/User.png");
                }
            } else {
                $("#userPhoto,#userPhoto2").attr("src", "/images/iconos/User.png");
            }
            validate();
        } else {
            currentUser = null;
            currentFuncionalidades = [];
            $("#logoutContainer").hide();
            $("#loginContainer").show();
            $("#userName,#userName2").html("Iniciar sesion");
            $("#userPhoto,#userPhoto2").attr("src", "/images/iconos/User.png");
        }
    }, function (error) {
        console.log(error);
    });
    firebase_ui = new firebaseui.auth.AuthUI(firebase.auth());
    signIn();
    $('[data-toggle="tooltip"]').tooltip();
    $.fn.DataTable.ext.pager.numbers_length = 10;
    $(".shareLink").tooltip({
        container: "body",
        template: '<div class="tooltipX" role="tooltip"><div class="tooltip-arrowX"></div><div class="tooltip-innerX">Click para copiar el Link</div></div>'
    });
    $(".shareLink").on("shown.bs.tooltip", function () {
        $(".tooltip-arrowX").css("border-right-color", "#3168E4");
        $(".tooltip-innerX").css("background-color", "#3168E4");
        $(".tooltip-innerX").html("Click para copiar el Link");
    });

    var params = "";
    $.ajax({
        url: web_service + "/config?cmd=config_recursos&t=" + (new Date()).getTime() + params,
        type: 'POST',
        success: function (data) {
            if (data.status) {
                initData(data);
            }
        },
        timeout: 20000,
        error: function (err) {

        }
    });
});

function minAllMain() {
    $("#panelSearch").hide();
    $("#headingSearch").hide();
    $("#mainHeading li").removeClass("active");
    closeSearch();
}

function toggleFiltros(param) {
    if (param == null) {
        if ($("#searchBody").is(":visible")) {
            param = "small";
        } else {
            param = "large"
        }
    }
    if (param == "small") {
        $("#panelSearchToggle").html("<img src='/images/iconos/Open_01.png' alt='Minimizar' style='width: 10px; height: 10px;' />");
        $("#searchBody").hide();
    }
    if (param == "large") {
        $("#panelSearchToggle").html("<img src='/images/iconos/Close_01.png' alt='Minimizar' style='width: 10px; height: 2px;' />");
        $("#searchBody").show();
    }
}

function toggleMenu(param) {
    if (param == null) {
        if ($("#mainDiv").hasClass("main-small")) {
            param = "large";
        } else {
            param = "small";
        }
    }
    if (param == "large") {
        if ($(window).width() <= 768) {
            param = "small";
        } else {
            $("#mainDiv").removeClass("main-small");
            $("#mainDiv").addClass("main-large");
            $("#mapViewDiv").removeClass("main-small-map");
            $("#mapViewDiv").addClass("main-large-map");
            $("#headingSearch img").attr("src", "/images/iconos/Back_02.png");
            $(".item-heading").removeClass("small-heading");
            $(".item-heading").addClass("large-heading");
            $("#menuItem").removeClass("small-heading");
            $("#menuItem").addClass("large-heading");
            toggleFiltros(param);
        }
    }
    if (param == "small") {
        $("#mainDiv").removeClass("main-large");
        $("#mainDiv").addClass("main-small");
        $("#mapViewDiv").removeClass("main-large-map");
        $("#mapViewDiv").addClass("main-small-map");
        $("#headingSearch img").attr("src", "/images/iconos/Forward_02.png");
        $(".item-heading").removeClass("large-heading");
        $(".item-heading").addClass("small-heading");
        $("#menuItem").removeClass("large-heading");
        $("#menuItem").addClass("small-heading");
        toggleFiltros(param);
    }
    if (param == "init") {
        $("#mainDiv").removeClass("main-large");
        $("#mainDiv").addClass("main-small");
        $("#mapViewDiv").removeClass("main-large-map");
        $("#mapViewDiv").addClass("main-small-map");
        $("#headingSearch img").attr("src", "/images/iconos/Forward_02.png");
        $(".item-heading").removeClass("large-heading");
        $(".item-heading").addClass("small-heading");
        $("#menuItem").removeClass("large-heading");
        $("#menuItem").addClass("small-heading");
        param = "small";
    }
    currentEstado = param;
}

function updateRecursos() {
    if (tableRecursos == null) {
        tableRecursos = $("#tableRecursos").DataTable({
            dom: '<"top"<"clear">>rt<"bottom"pil<"clear">>',
            lengthMenu: [[12, 24, 48, 96], ["Mostrar 10 registros", "Mostrar 20 registros", "Mostrar 50 registros", "Mostrar 100 registros"]],
            language: spanishDataTable,
            processing: true,
            serverSide: true,
            ajax: {
                url: web_service + "/recursos",
                deferLoading: 0,
                data: function (d) {
                    d.cmd = "query";
                    if ($("#searchFiltro").val() != null) {
                        if (($("#searchFiltro").select2("data")[0].type == "DEPTO") || ($("#searchFiltro").select2("data")[0].type == "MUNI")) {
                            d.codigo = $("#searchFiltro").val();
                        }
                    }
                    if ($("#searchFiltroNivel").val() != null) {
                        d.nivel = $("#searchFiltroNivel").val().join(";");
                    }
                    if ($("#searchFiltroTipo").val() != null) {
                        d.tipo = $("#searchFiltroTipo").val();
                    }
                    if ($("#searchFiltroEntidad").val() != null) {
                        d.entidad = $("#searchFiltroEntidad").val();
                    }
                    if ($("#searchFiltroYear").val() != null) {
                        d.year = $("#searchFiltroYear").val().join(";");
                    }
                    if ($("#searchFiltroTematica").val() != null) {
                        d.tematica = $("#searchFiltroTematica").val();
                    }
                    if ($("#searchFiltroTags").val() != null) {
                        d.tags = $("#searchFiltroTags").val().join(";");
                    }
                },
                dataSrc: function (dataRow) {
                    cacheRecursos = dataRow.documentos;
                    var resultado = [];
                    for (var i = 0; i < dataRow.documentos.length; i++) {
                        resultado.push(dataRow.documentos[i]);
                    }
                    return resultado;
                }
            },
            fnInitComplete: function () {

            },
            drawCallback: function (settings) {
                updateRows();
            },
            columns: [
                {
                    data: "ID_RECURSO",
                    orderable: false,
                    render: function (data, type, row, meta) {
                        return row.ID_RECURSO;
                    }
                },
                {
                    data: "NOMBRE",
                    render: function (data, type, row, meta) {
                        return row.NOMBRE;
                    }
                },
                {
                    data: "FECHA_PUBLICACION",
                    render: function (data, type, row, meta) {
                        if (row.FECHA_PUBLICACION == null) {
                            return "";
                        }
                        return row.FECHA_PUBLICACION;
                    }
                }
            ]
        });
    } else {
        tableRecursos.ajax.reload();
    }
}

function loadDestacados(){
    $.ajax({
        url: web_service + "/recursos?cmd=query&draw=1&order[0][column]=0&order[0][dir]=asc&start=0&length=10&flag_destacado=true&t=" + (new Date()).getTime(),
        type: 'POST',
        success: function (data) {
            if (data.status) {
                var strHTMLIndicadores = "";
                var strHTMLItems = "";
                var paginas = Math.round(data.documentos.length / 2);
                var pos = 0;
                for (var i = 0; i < paginas; i++) {
                    if (i == 0) {
                        strHTMLIndicadores = strHTMLIndicadores + "<li data-target='#carouselRecursos' data-slide-to='" + i + "' class='active'></li>";
                        strHTMLItems = strHTMLItems + "<div class='item active'>";
                    } else {
                        strHTMLIndicadores = strHTMLIndicadores + "<li data-target='#carouselRecursos' data-slide-to='" + i + "'></li>";
                        strHTMLItems = strHTMLItems + "<div class='item'>";
                    }
                    strHTMLItems = strHTMLItems + "<table style='width: 100%;' cellpadding='10'>";
                    strHTMLItems = strHTMLItems + "<tr>";
                    for (var j = 0; j < 2; j++) {
                        if (pos < data.documentos.length) {
                            strHTMLItems = strHTMLItems + "<td style='width: 50%;'>";
                            if (data.documentos[pos].TIPO_RECURSO == "Aplicaciones y herramientas") {
                                strHTMLItems = strHTMLItems + "<div class='carousel-container' style='background-image: url(/images/recursos/aplicaciones_bg.png);'>";
                                strHTMLItems = strHTMLItems + "<img class='image' src='/images/recursos/aplicaciones_icon.svg' style='width: 80px; height: auto;'/>";
                            }
                            if (data.documentos[pos].TIPO_RECURSO == "Cartillas, guias y manuales") {
                                strHTMLItems = strHTMLItems + "<div class='carousel-container' style='background-image: url(/images/recursos/cartillas_bg.png);'>";
                                strHTMLItems = strHTMLItems + "<img class='image' src='/images/recursos/cartillas_icon.svg' style='width: 80px; height: auto;' /><br/>";
                            }
                            if (data.documentos[pos].TIPO_RECURSO == "Datos para el OT") {
                                strHTMLItems = strHTMLItems + "<div class='carousel-container' style='background-image: url(/images/recursos/datosOT_bg.png);'>";
                                strHTMLItems = strHTMLItems + "<img class='image' src='/images/recursos/datosOT_icon.svg' style='width: 80px; height: auto;' /><br/>";
                            }
                            if (data.documentos[pos].TIPO_RECURSO == "Normatividad") {
                                strHTMLItems = strHTMLItems + "<div class='carousel-container' style='background-image: url(/images/recursos/normatividad_bg.png);'>";
                                strHTMLItems = strHTMLItems + "<img class='image' src='/images/recursos/normatividad_icon.svg' style='width: 80px; height: auto;' /><br/>";
                            }
                            if (data.documentos[pos].TIPO_RECURSO == "Servicios") {
                                strHTMLItems = strHTMLItems + "<div class='carousel-container' style='background-image: url(/images/recursos/servicios_bg.png);'>";
                                strHTMLItems = strHTMLItems + "<img class='image' src='/images/recursos/servicios_icon.png' style='width: 80px; height: auto;' /><br/>";
                            }
                            strHTMLItems = strHTMLItems + "<p style='font-size: 19px;'>" + data.documentos[pos].NOMBRE + "</p>";
                            if (data.documentos[pos].URL1 != null) {
                                strHTMLItems = strHTMLItems + "<br/><button class='btn btn-default' style='margin-right: 10px; background: none; color: white;' onclick='window.open(\"" + data.documentos[pos].URL1 + "\", \"_blank\"); return false;'>Ver m&aacute;s</button>";
                            } else {
                                if (data.documentos[pos].URL2 != null) {
                                    strHTMLItems = strHTMLItems + "<br/><button class='btn btn-default' style='margin-right: 10px; background: none; color: white;' onclick='window.open(\"" + data.documentos[pos].URL2 + "\", \"_blank\"); return false;'>Ver en CeM</button>";
                                }
                            }
                            strHTMLItems = strHTMLItems + "</div>";
                            strHTMLItems = strHTMLItems + "</td>";
                        } else {
                            strHTMLItems = strHTMLItems + "<td style='width: 50%;'></td>";
                        }
                        pos++;
                    }
                    strHTMLItems = strHTMLItems + "</tr>";
                    strHTMLItems = strHTMLItems + "</table>";
                    strHTMLItems = strHTMLItems + "</div>";
                }

                $("#carouselRecursosIndicators").html(strHTMLIndicadores);
                $("#carouselRecursosItems").html(strHTMLItems);
                $("#containerDestacados").show();
            } else {
                $("#containerDestacados").hide();
            }
        },
        error: function (_data) {
            $("#containerDestacados").hide();
        }
    });
}

function updateRows() {
    if (tableRecursos == null) {
        return;
    }
    var api = tableRecursos;
    $("#docViewDiv").html("");
    $("#docViewCount").html(api.page.info().recordsTotal + " recursos");

    var dataRow = api.rows({ page: 'current' }).data();
    var strHTML = "";
    strHTML = strHTML + "<div class='row'>";

    for (var i = 0; i < dataRow.length; i++) {
        strHTML = strHTML + "<div class='col-md-4 doc-item' style='margin-bottom: 20px;'>";

        strHTML = strHTML + "<div id='card-main-" + dataRow[i].ID_RECURSO + "' class='media media-resultados2'>";

        if (dataRow[i].TIPO_RECURSO == "Aplicaciones y herramientas") {
            strHTML = strHTML + "<div class='media-body panel-resultados-header' style='background-color: #183F80;'>";
        }
        if (dataRow[i].TIPO_RECURSO == "Cartillas, guias y manuales") {
            strHTML = strHTML + "<div class='media-body panel-resultados-header' style='background-color: #0CB391;'>";
        }
        if (dataRow[i].TIPO_RECURSO == "Datos para el OT") {
            strHTML = strHTML + "<div class='media-body panel-resultados-header' style='background-color: #EB6654;'>";
        }
        if (dataRow[i].TIPO_RECURSO == "Normatividad") {
            strHTML = strHTML + "<div class='media-body panel-resultados-header' style='background-color: #B57D32;'>";
        }
        if (dataRow[i].TIPO_RECURSO == "Servicios") {
            strHTML = strHTML + "<div class='media-body panel-resultados-header' style='background-color: #6445E1;'>";
        }
        strHTML = strHTML + "<span class='label'>" + dataRow[i].TIPO_RECURSO + "<span class='label'>" + "›" + "</span>" + "</span>";
        if ((dataRow[i].FLAG_ACTUALIZADO == "1") || (dataRow[i].FLAG_DESTACADO == "1") || (dataRow[i].FLAG_NUEVO == "1")) {
            strHTML = strHTML + "<div style='float: right;color: white;'>";
            if (dataRow[i].FLAG_ACTUALIZADO == "1") {
                strHTML = strHTML + "<img src='/images/recursos/actualizado.png' style='height: 13px; width: 13px;' />";
            }
            if (dataRow[i].FLAG_DESTACADO == "1") {
                strHTML = strHTML + "<img src='/images/recursos/destacado.png' style='height: 13px; width: 13px;' />";
            }
            if (dataRow[i].FLAG_NUEVO == "1") {
                strHTML = strHTML + "<img src='/images/recursos/nuevo.png' style='height: 13px; width: 13px;' />";
            }

            strHTML = strHTML + "</div>";
        }
        strHTML = strHTML + "</div>";
        if (dataRow[i].TIPO_RECURSO == "Aplicaciones y herramientas") {
            strHTML = strHTML + "<div class='media-body panel-resultados-header-img' style='background-color: #1E4A93; background-image: url(/images/recursos/aplicaciones.png);'>";
        }
        if (dataRow[i].TIPO_RECURSO == "Cartillas, guias y manuales") {
            strHTML = strHTML + "<div class='media-body panel-resultados-header-img' style='background-color: #038D71; background-image: url(/images/recursos/cartillas.png);'>";
        }
        if (dataRow[i].TIPO_RECURSO == "Datos para el OT") {
            strHTML = strHTML + "<div class='media-body panel-resultados-header-img' style='background-color: #EB6654; background-image: url(/images/recursos/datosOT.png);'>";
        }
        if (dataRow[i].TIPO_RECURSO == "Normatividad") {
            strHTML = strHTML + "<div class='media-body panel-resultados-header-img' style='background-color: #F2A742; background-image: url(/images/recursos/normatividad.png);'>";
        }
        if (dataRow[i].TIPO_RECURSO == "Servicios") {
            strHTML = strHTML + "<div class='media-body panel-resultados-header-img' style='background-color: #532D96; background-image: url(/images/recursos/servicios.png);'>";
        }

        strHTML = strHTML + "</div>";

        strHTML = strHTML + "<div class='media-body'>";
        strHTML = strHTML + "<div class='panel panel-default panel-resultados'>";
        strHTML = strHTML + "<div class='panel-body'>";

        strHTML = strHTML + "<div class='title-recursos'>" + "<div class='panel-resultados-titulo2'>" + dataRow[i].NOMBRE + "</div>" + "</div>";
        strHTML = strHTML + "<hr/>"
        strHTML = strHTML + "<div class='panel-resultados-descripcion2'>";
        if (dataRow[i].DESCRIPCION != null) {
            strHTML = strHTML + "<p>" + dataRow[i].DESCRIPCION + "</p>";
        }
        
        strHTML = strHTML + "<strong>Detalle</strong>";
        strHTML = strHTML + "<ul class='list'>"

        if ($("#searchFiltro").val() != dataRow[i].CODIGO) {
            var muni = getUnidadById(dataRow[i].CODIGO);
            var depto = getDeptoByMuni(dataRow[i].CODIGO);
            if ((muni != null) && (depto != null)) {
                strHTML = strHTML + "<li><strong>Unidad:&nbsp;</strong>" + muni.text + ", " + depto.text + "</li>";
            }
        }
        if (dataRow[i].FECHA_PUBLICACION != null) {
            strHTML = strHTML + "<li><strong>Fecha:&nbsp;</strong>" + moment(dataRow[i].FECHA_PUBLICACION).format("DD-MM-YYYY") + "</li>";
        }
        if (dataRow[i].TEMATICA != null) {
            strHTML = strHTML + "<li><strong>Tem&aacute;tica:&nbsp;</strong>" + dataRow[i].TEMATICA + "</li>";
        }
        if (dataRow[i].ENTIDAD != null) {
            strHTML = strHTML + "<li><strong>Creador:&nbsp;</strong>" + dataRow[i].ENTIDAD + "</li>";
        }

        strHTML = strHTML + "</ul>"

        strHTML = strHTML + "</div>";
        strHTML = strHTML + "<br>";
        var nbotones = 0;
        var botonesSize = "";

        if (dataRow[i].URL1 != null) {
            nbotones = nbotones + 1;
        }
        if (dataRow[i].URL2 != null) {
            nbotones = nbotones + 1;
        }
        if (dataRow[i].URL_METADATO != null) {
            nbotones = nbotones + 1;
        }

        if (nbotones > 0) {
            strHTML = strHTML + "<table style='width: 100%;'>";
            strHTML = strHTML + "<tbody>";
            strHTML = strHTML + "<tr>";

            if (nbotones == 1) {
                botonesSize = "100%";
            }
            if (nbotones == 2) {
                botonesSize = "50%";
            }
            if (nbotones == 3) {
                botonesSize = "33%";
            }
            if (dataRow[i].URL1 != null) {
                strHTML = strHTML + "<td style='width: " + botonesSize + ";'>";
                strHTML = strHTML + "<button class='btn btn-default' style='width: 100%;margin-right: 10px;' onclick='window.open(\"" + dataRow[i].URL1 + "\", \"_blank\"); return false;'>Ver m&aacute;s</button>";
                strHTML = strHTML + "</td>";
            }
            if (dataRow[i].URL2 != null) {
                strHTML = strHTML + "<td style='width: " + botonesSize + ";'>";
                strHTML = strHTML + "<button class='btn btn-default' style='width: 100%;margin-right: 10px;' onclick='window.open(\"" + dataRow[i].URL2 + "\", \"_blank\"); return false;'>Ver en CeM</button>";
                strHTML = strHTML + "</td>";
            }
            if (dataRow[i].URL_METADATO != null) {
                strHTML = strHTML + "<td style='width: " + botonesSize + ";'>";
                strHTML = strHTML + "<button class='btn btn-default' style='width: 100%;margin-right: 10px;' onclick='window.open(\"" + dataRow[i].URL_METADATO + "\", \"_blank\"); return false;'>Metadato</button>";
                strHTML = strHTML + "</td>";
            }
            strHTML = strHTML + "</tr>";
            strHTML = strHTML + "</tbody>";
            strHTML = strHTML + " </table>";
        }

        strHTML = strHTML + "</div>";
        strHTML = strHTML + "</div>";
        strHTML = strHTML + "</div>";

        strHTML = strHTML + "<div class='media-body panel-resultados-tags2'>";
        if (dataRow[i].PALABRAS_CLAVE != null) {
            var tagsT = JSON.parse(dataRow[i].PALABRAS_CLAVE);
            for (var j = 0; j < Math.min(tagsT.length, 7); j++) {
                strHTML = strHTML + "<span class='label'  style='background-color:" + getColorByTag(tagsT[j]) + ";'>" + tagsT[j] + "</span>";
            }
        }
        strHTML = strHTML + "</div>";
        strHTML = strHTML + "</div>";
        strHTML = strHTML + "</div>";

        if (((i + 1) % 3) == 0) {
            strHTML = strHTML + "</div>";
            strHTML = strHTML + "<div class='row'>";
        }

    }

    strHTML = strHTML + "</div>";
    $("#docViewDiv").append(strHTML);

}

function hideDestacados() {
    $("#containerDestacados").hide();
}

function gotoSearchUnidad(id) {
    $("#searchFiltro").val(id);
    $("#searchFiltro").trigger("change");
}

function shareLink() {
    var url = encodeURI(getShareUrl());
    Clipboard.copy(url);
    $(".tooltip-arrowX").css("border-right-color", "#6CD47C");
    $(".tooltip-innerX").css("background-color", "#6CD47C");
    $(".tooltip-innerX").html("El Link ha sido copiado");
    reporteUso("Copiar enlace");
}

function updateShareLink() {
    var url = encodeURI(getShareUrl());
    $("#urlShare").val(url);
    qrcode.makeCode(url);
    $("#shareWidget").html("");
    new mShare("#shareWidget", {
        text: false,
        url: url,
        reddit: false,
        googleplus: false
    });
    $("#htmlShare").text("<iframe width='300' height='200' frameborder='0' scrolling='no' allowfullscreen src=\"" + url + "\"></iframe>");
}

function getShareUrl() {
    var url = window.location.origin;
    url = url + window.location.pathname + "?";
    if ($("#searchFiltro").val() != null) {
        url = url + "&u=" + $("#searchFiltro").val();
    }
    return url;
}

function copyShareLink() {
    Clipboard.copy($("#urlShare").val());
}

function reporteUso(funcionalidad, parametro) {
    if (parametro == null) {
        try {
            amplitude.getInstance().logEvent(funcionalidad, null);
        } catch (err) {
            console.log(err);
        }
        try {
            gtag('event', funcionalidad, {
                'send_to': 'UA-177680669-1',
                'event_category': funcionalidad
            });
        } catch (err) {
            console.log(err);
        }
        return;
    }
    try {
        amplitude.getInstance().logEvent(funcionalidad, parametro);
    } catch (err) {

    }
    var value = null;
    if (parametro.unidad != null) {
        value = parametro.unidad;
    }
    try {
        gtag('event', funcionalidad, {
            'send_to': 'UA-177680669-1',
            'event_category': funcionalidad,
            'event_action': parametro.action,
            'event_label': value,
        });
    } catch (err) {

    }
}

function closeLoading() {
    $("#alertList").hide();
}

function showLoading(text, imagen, color, autohide) {
    $("#alertContent").html(text);
    if (imagen == null) {
        $("#alertContentLeft").hide();
    } else {
        if (imagen == "loading") {
            $("#alertContentLeft img").attr("src", "/images/iconos/clock-face-three-oclock_1f552.png");
        }
        if (imagen == "ok") {
            $("#alertContentLeft img").attr("src", "/images/iconos/thumbs-up-sign_1f44d.png");
        }
        if (imagen == "error") {
            $("#alertContentLeft img").attr("src", "/images/iconos/smiling-face-with-smiling-eyes-and-hand-covering-mouth_1f92d.png");
        }
        $("#alertContentLeft").show();
    }
    $("#alertHeader").css("background-color", color);
    if (autohide) {
        setTimeout(function () { closeLoading(); }, defaultAlertTimer);
    }
    $("#alertList").show();
}

function checkURL(url, mostrarAlerta) {
    var pattern = new RegExp("((http|https)(:\/\/))?([a-zA-Z0-9]+[.]{1}){2}[a-zA-z0-9]+(\/{1}[a-zA-Z0-9]+)*\/?", "i");
    if (pattern.test(url)) {
        return true;
    } else {
        if (mostrarAlerta) {
            showLoading("La URL ingresada no es valida", null, "red", true);
        }
        return false;
    }
}

function initData(data) {

    cacheUnidades = data.UNIDAD;
    cacheTags = [];

    var colorPos = 0;
    for (var i = 0; i < data.TAGS.length; i++) {
        if (colorPos == color_tags.length) {
            colorPos = 0;
        }
        cacheTags.push({
            tag: data.TAGS[i].text,
            color: color_tags[colorPos].color
        });
        colorPos = colorPos + 1;
    }

   cacheUnidadesFiltro = data.UNIDAD;
    $("#searchFiltro").select2({
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
                        } else {
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
    $("#searchFiltro").val(null);
    $("#searchFiltro").trigger("change");
    $("#searchFiltro").on("change", function (e) {
        updateRecursos();               
    });

    var dataTags = [];
    if (getParameterByName("tags") != null) {
        dataTags = getParameterByName("tags").split(";");
        for (var i = 0; i < dataTags.length; i++) {
            dataTags[i] = { id: dataTags[i], text: dataTags[i] };
        }
    }
    $("#searchFiltroTags").select2({
        data: data.TAGS,
        multiple: true,
        placeholder: "Ej: ambiental, educación",
        templateSelection: function (data) {
            return $("<span class='class-tag' item-tag='" + data.text + "'>" + data.text + "</span>");
        }
    });
    $("#searchFiltroTags").on("change", function (e) {
        updateRecursos();
        updateTags();
    });
   
    var dataTipo = [];
    if (getParameterByName("tipo") != null) {
        dataTipo = getParameterByName("tipo").split(";");
        for (var i = 0; i < dataTipo.length; i++) {
            dataTipo[i] = { id: dataTipo[i], text: dataTipo[i] };
        }
    }
    $("#searchFiltroTipo").select2({
        data: data.TIPO_RECURSOS,
        multiple: false,
        placeholder: "Ej: Cartillas, guias y manuales"
    });
    $("#searchFiltroTipo").val(null);
    $("#searchFiltroTipo").trigger("change");
    $("#searchFiltroTipo").on("change", function (e) {
        updateRecursos();
    });

    var dataEntidades = [];
    if (getParameterByName("entidad") != null) {
        dataEntidades = getParameterByName("entidad").split(";");
        for (var i = 0; i < dataEntidades.length; i++) {
            dataEntidades[i] = { id: dataEntidades[i], text: dataEntidades[i] };
        }
    }
    $("#searchFiltroEntidad").select2({
        data: data.ENTIDADES,
        multiple: false,
        allowClear: true,
        placeholder: "Ej: Igac"
    });
    $("#searchFiltroEntidad").val(null);
    $("#searchFiltroEntidad").trigger("change");
    $("#searchFiltroEntidad").on("change", function (e) {
        updateRecursos();
    });

    var dataTematicas = [];
    if (getParameterByName("tematica") != null) {
        dataTematicas = getParameterByName("tematica").split(";");
        for (var i = 0; i < dataTematicas.length; i++) {
            dataTematicas[i] = { id: dataTematicas[i], text: dataTematicas[i] };
        }
    }
    $("#searchFiltroTematica").select2({
        data: data.TEMATICAS,
        multiple: false,
        allowClear: true,
        placeholder: "Ej: Cartografía básica"
    });
    $("#searchFiltroTematica").val(null);
    $("#searchFiltroTematica").trigger("change");
    $("#searchFiltroTematica").on("change", function (e) {
        updateRecursos();
    });

    $("#searchFiltroNivel").select2({
        multiple: true,
        placeholder: "Ej: Nivel"
    });
    $("#searchFiltroNivel").val(null);
    $("#searchFiltroNivel").trigger("change");
    $("#searchFiltroNivel").on("change", function (e) {
        updateRecursos();
    });

    $("#searchFiltroYear").select2({
        multiple: true,
        placeholder: "Ej: 2021"
    });
    $("#searchFiltroYear").val(null);
    $("#searchFiltroYear").trigger("change");
    $("#searchFiltroYear").on("change", function (e) {
        updateRecursos();
    });


    $("#panelSearch").show();

    if (getParameterByName("u") != null) {
        currentCaracterizacion = data.UNIDAD_INICIAL;
        firstExpand = false;
        $("#panelSearchResultados").show();
        $("#headingSearch").show();
        toggleMenu("large");
        $("#searchFiltro").val(getParameterByName("u"));
        $("#searchFiltro").trigger("change");
    }
    if (getParameterByName("t") != null) {
        $("#searchFiltroTipo").val(getParameterByName("t"));
        $("#searchFiltroTipo").trigger("change");
    }
    updateRecursos();
    loadDestacados();
}

function updateTags() {
    $(".class-tag").each(function (index, value) {
        $(value).parent().css("background-color", getColorByTag($(value).attr("item-tag")));
        $(value).parent().find(".select2-selection__choice__remove").css("color", "white");
        $(value).css("color", "white");
    });
}

function updateInicio() {
    if (firstExpand) {
        $("#panelSearchResultados").show();
        $("#headingSearch").show();
        toggleMenu("large");
    }
    updateRecursos();
}

function getSorted(selector, attrName) {
    return $($(selector).toArray().sort(function (a, b) {
        var aVal = a.getAttribute(attrName),
            bVal = b.getAttribute(attrName);
        return (aVal > bVal) ? 1 : -1;
    }));
}

function getUnidadById(id) {
    for (var i = 0; i < cacheUnidades.length; i++) {
        if (cacheUnidades[i].id == id) {
            return cacheUnidades[i];
        }
    }
}

function getTematicaById(id) {
    for (var i = 0; i < cacheTematicas.length; i++) {
        if (cacheTematicas[i].id == id) {
            return cacheTematicas[i];
        }
    }
}
