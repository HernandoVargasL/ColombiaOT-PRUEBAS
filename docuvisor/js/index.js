﻿
var currentUser;
var firebase_ui;
var currentScreen;
var currentEstado = "init";
var currentSearch = "all";
var firstExpand = true;
var firstParameters = true;
var tableDocumentos;
var cacheDocumentos;
var cacheResumen;
var cacheResumenTags;
var currentDocumento;
var currentEtapa;
var defaultAlertTimer = 3000;
var firstOpen = true;

var searchFormaCache = [];
var searchTipoCache = [];
var searchComponenteCache = [];
var searchDimensionCache = [];
var searchFechaCache = [];
var searchTagsCache = [];
var searchCategoriaCache = [];

//var web_service = "http://localhost:8080/Geovisor_IGAC";
var web_service = "https://serviciosgeovisor.igac.gov.co:8080/Geovisor";
//var web_service = "http://172.19.3.37:8080/Geovisor";
var web_service_proxy = "https://serviciosgeovisor.igac.gov.co:8080/Geovisor";

var fase_data = [
    {
        id: 0,
        text: "Alistamento",
        descripcion: "Aquí, nos preparamos para un empezar un nuevo ciclo de POT. Una etapa no reglamentaria, pero muy necesaria en la que el municipio analiza la factibilidad técnica, institucional, financiera y de los procesos participativos que se van a necesitar para la elaboración del plan. También, este es un momento para para tener claros los recursos, las fuentes y las actividades que se deberán llevar a cabo. El alistamiento es la oportunidad más importante para que los líderes planteen los temas estratégicos y prioritarios para la proyección espacial del territorio en función de lo que el municipio tiene para ofrecer.",
        color: "#F1A5A7"
    },
    {
        id: 1,
        text: "Diagnóstico",
        descripcion: "En esta etapa, el municipio debe conocer a fondo el estado actual del territorio en materia de ordenamiento. Esta será la “foto” en el tiempo, que se confrontará con el estado deseado que se planteará en la formulación. Su diferencia, será determinante para el éxito del Plan. Por eso es tan vital hacer un diagnóstico minucioso, pues entre más fiel éste sea al territorio, menor será la brecha con el estado deseado y permitirá formular adecuadamente un plan real que responda a las necesidades de sus habitantes y la vocación de su territorio.",
        color: "#874F43"
    },
    {
        id: 2,
        text: "Formulación",
        descripcion: "Esta es la etapa que materializa las conclusiones del diagnóstico y convierte el análisis en un plan viable de acción. La formulación, es el momento crucial en el que se trazan las estrategias de ejecución para transformar el territorio en un espacio que responda a las necesidades de las personas que lo habitan y de los diferentes ecosistemas que lo componen. Y, como todos los habitantes somos parte de las dinámicas que le dan vocación al espacio, en esta etapa se vuelve necesario y obligatorio desarrollar actividades de participación y concertación ciudadana acerca de las decisiones que se proponen para desarrollar el municipio en el POT.",
        color: "#57A1BF"
    },
    {
        id: 3,
        text: "Implementación",
        descripcion: "¡Manos a la obra! Es la etapa en donde se pone en marcha el Plan de Ordenamiento Territorial - POT aprobado y se especifica la ejecución puntual de los objetivos trazados en la etapa de formulación. Es importante aclarar que esta puesta en marcha se hace para las vigencias, de corto, mediano y largo plazo. Es un momento en el que también es necesario desarrollar instrumentos específicos de gestión según lo que se ha propuesto y así mismo, sus medios de financiación.",
        color: "#F4A833"
    },
    {
        id: 4,
        text: "Evaluación y Seguimiento ",
        descripcion: "Esta etapa se hace en paralelo con la implementación específica de los planes y proyectos que se llevan a cabo para ejecutar el POT. Es un proceso iterativo y constante durante la vigencia del mismo y se debe buscar el apoyo del Consejo Consultativo de Ordenamiento Territorial para su supervisión, en los casos en donde exista dentro del municipio.",
        color: "#6BDBB7"
    }
];
var color_defecto_tags = "#CF394B;#E64459;#F3AA42;#F8C354;#42874F;#6BD279;#3D99DE;#55BFF2;#8E398D;#B15BDB";
var color_defecto = [{ "color1": "#6BD279", "color2": "#42874F", "tags": "#478A53;#4A9157;#4F995C;#53A060;#57A864;#5CAF69;#60B76D;#64BE71;#69C575;#6DCD7A" },
{ "color1": "#6BDBB7", "color2": "#6BD279", "tags": "#6ED07F;#6FD286;#6FD38C;#6FD491;#6FD597;#6FD69D;#6FD7A2;#6FD8A8;#6FD9AE;#70DAB5" },
{ "color1": "#3595E0", "color2": "#6BDBB7", "tags": "#3E9ADA;#43A0D8;#48A7D4;#4DADD0;#54B5CA;#57BBC8;#5CC3C4;#61C9BF;#68CFBD;#6CD6B9" },
{ "color1": "#58CCFB", "color2": "#3595E0", "tags": "#3D99DE;#409EE1;#44A4E3;#47A9E6;#4BAFE9;#4EB5EC;#51BAF0;#55BFF2;#58C5F5;#5CCAF8" },
{ "color1": "#B64FDD", "color2": "#58CCFB", "tags": "#B15BDB;#A766DE;#9E72E1;#957EE5;#8C8AE7;#8396EA;#7BA2ED;#73ADEF;#6BB9F3;#62C7F7" },
{ "color1": "#B64FDD", "color2": "#8D338A", "tags": "#8E398D;#923B95;#973E9D;#9B42A6;#9E45AD;#A246B5;#A74ABE;#AB4DC5;#AF51CE;#B354D6" },
{ "color1": "#EE8F90", "color2": "#E06AC2", "tags": "#DF6FBE;#E073BA;#E275B4;#E379AF;#E47DAB;#E67FA7;#E783A1;#E8879F;#EA8A98;#EB8E94" },
{ "color1": "#9B2B38", "color2": "#F1A5A7", "tags": "#9D3240;#A63E4C;#AF4B55;#B6565F;#BF636B;#C86F76;#D07A80;#DA868D;#E29397;#EA9EA2" },
{ "color1": "#E94258", "color2": "#9B2B38", "tags": "#9D2E3C;#A4303F;#AC3342;#B43545;#BC3748;#C43A4B;#CC3C50;#D33E52;#DB4055;#E24359" },
{ "color1": "#EA4B33", "color2": "#E94258", "tags": "#E64459;#E64555;#E74653;#E7474F;#E7484B;#E74848;#E74845;#E74A42;#E74B3E;#E74C3C" },
{ "color1": "#F4A833", "color2": "#EA4B33", "tags": "#E9513B;#EA5A3B;#EB623B;#EC6C3D;#ED753D;#EE7F3D;#EF883E;#EF903F;#F09940;#F1A240" },
{ "color1": "#FEE561", "color2": "#F4A833", "tags": "#F3AA42;#F4B147;#F4B74B;#F7BD4F;#F8C354;#F9C957;#F9CE5B;#FBD561;#FCDB65;#FCE168" },
{ "color1": "#2A2421", "color2": "#534741", "tags": "#2C2623;#312A26;#342D29;#38302C;#3C342E;#413733;#453B36;#493E39;#4D423D;#51453F" },
{ "color1": "#C7B299", "color2": "#998675", "tags": "#9B8878;#9F8D7C;#A6917F;#AA9583;#AE9A86;#B09E8A;#B7A38E;#B9A791;#BFAC95;#C3AF98" },
{ "color1": "#999999", "color2": "#C3AF98", "tags": "#C5AE96;#C0AC96;#BAA997;#B7A797;#B2A597;#AEA398;#A9A198;#A59F98;#A09C99;#9B9A99" },
{ "color1": "#808080", "color2": "#999999", "tags": "#818181;#848484;#868686;#898989;#8B8B8B;#8E8E8E;#909090;#939393;#959595;#989898" },
];

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
        url: web_service + "/config?cmd=config_sigot&t=" + (new Date()).getTime() + params,
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
            updateRows();
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
        updateRows();
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
        updateRows();
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

function hideAllSearch() {
    $("#mainDiv").animate({ scrollTop: 0 });
    $(".panelSearchFiltro").hide();
    $("#panelSearchNivelFase").hide();
    $("#panelSearchNivel1").hide();
}

function backSearchMain() {
    currentEtapa = null;
    hideAllSearch();
    $("#panelSearchNivel1").show();
    updateDocumentos();
}

function searchMain() {
    hideAllSearch();
    $("#panelSearchNivel1").show();
    updateCaracterizacion();
}

function updateCaracterizacion() {

    $("#panelSearchCaracterizacion").hide();
    if ($("#searchFiltro").select2("data")[0].type == "PAIS") {
        $("#panelSearchCaracterizacionTitulo").html("Colombia");
    };
    if (($("#searchFiltro").select2("data")[0].type == "DEPTO") || ($("#searchFiltro").select2("data")[0].type == "MUNI")) {
        $("#panelSearchCaracterizacionTitulo").html($("#searchFiltro").select2("data")[0].text);
    }
    $("#panelSearchCaracterizacion").show();
    $("#panelSearchCaracterizacionCreacion").hide();
    $("#panelSearchCaracterizacionCreacionActo").html("");
    $("#panelSearchCaracterizacionTable").html("");

    var params = {};
    params.tipo = $("#searchFiltro").select2("data")[0].type;
    params.id = $("#searchFiltro").val();

    $.ajax({
        url: web_service + "/unidad?cmd=query&t=" + (new Date()).getTime(),
        data: params,
        type: 'POST',
        success: function (data) {
            if (data.status) {
                currentCaracterizacion = data;
                var strHTML;

                strHTML = "";
                if (($("#searchFiltro").select2("data")[0].type == "MUNI")) {
                    var depto = getDeptoByMuni($("#searchFiltro").val());
                    strHTML = "<b class='departamento'>Departamento:</b>&nbsp;<a href='#' onclick='gotoSearchUnidad(\"" + depto.id + "\");return false;'>" + depto.text + "</a><br/>";
                }
                $("#panelSearchCaracterizacionTable").append(strHTML);

                if (($("#searchFiltro").select2("data")[0].type == "MUNI")) {
                    var nombre = currentCaracterizacion.NOMBRE.substr(0, currentCaracterizacion.NOMBRE.lastIndexOf(", "));
                    $("#panelSearchCaracterizacionTitulo").html(nombre);
                }

                strHTML = "";
                /*
                if (currentCaracterizacion.CAPITAL != null) {
                    strHTML = strHTML + "<b>Capital:</b>&nbsp;<a href='#' onclick='gotoSearchUnidad(\"" + currentCaracterizacion.CAPITAL + "\");return false;'>" + getUnidadById(data.CAPITAL).text + "</a><br/>";
                }
                */
                strHTML = strHTML + "<hr style='border-top: 1px solid lightgray;'/>";
                if (currentCaracterizacion.CODIGO != null) {
                    strHTML = strHTML + "<b>C&oacute;digo DANE:</b>&nbsp;" + currentCaracterizacion.CODIGO + "<br/>";
                }
                if (currentCaracterizacion.AREA_TOTAL != null) {
                    strHTML = strHTML + "<b>&Aacute;rea (km2):</b>&nbsp;" + currentCaracterizacion.AREA_TOTAL + "<br/>";
                }
                if (currentCaracterizacion.ALTITUD != null) {
                    strHTML = strHTML + "<b>Altitud (msnm):&nbsp;</b>" + currentCaracterizacion.ALTITUD + "<br/>";
                }
                if (currentCaracterizacion.POBLACION != null) {
                    strHTML = strHTML + "<b>Poblaci&oacute;n (hab):&nbsp;</b>" + currentCaracterizacion.POBLACION + "<br/>";
                }
                /*
                if (currentCaracterizacion.CATALOGO != null) {
                    strHTML = strHTML + "<b>Cat&aacute;logo:</b>&nbsp;<a href='" + currentCaracterizacion.CATALOGO + "' target='_blank'>Ver</a><br/>";
                }
                */
                $("#panelSearchCaracterizacionTable").append(strHTML);

                strHTML = "";
                if (currentCaracterizacion.CATEGORIA_POT != null) {
                    strHTML = strHTML + "<b class='first-b'>Categor&iacute;a:&nbsp;</b>" + currentCaracterizacion.CATEGORIA_POT + "<br/>";
                }
                if (currentCaracterizacion.TIPO_POT != null) {
                    strHTML = strHTML + "<b>Tipo:&nbsp;</b>" + currentCaracterizacion.TIPO_POT + "<br/>";
                }
                if (currentCaracterizacion.FECHA_REVISION_POT != null) {
                    strHTML = strHTML + "<b>Fecha de &uacute;ltima revisi&oacute;n:&nbsp;</b>" + currentCaracterizacion.FECHA_REVISION_POT + "<br/>";
                }
                strHTML = strHTML + "<button class='btn btn-primary boton-panel-search' onclick='gotoCeM(\"" + currentCaracterizacion.CODIGO + "\"); return false;'>Ver en Colombia en Mapas</button><br/>";
                $("#panelSearchCaracterizacionPOTTable").html(strHTML);
                if (strHTML.length > 0) {
                    $("#panelSearchCaracterizacionPOTContainer").show();
                } else {
                    $("#panelSearchCaracterizacionPOTContainer").hide();
                }
            }
        },
        error: function (_data) {

        }
    });
}

function gotoCeM(codigo) {
    if (codigo == null) {
        window.open("https://www.colombiaenmapas.gov.co/?u=0&t=30", "_blank");
    } else {
        window.open("https://www.colombiaenmapas.gov.co/?u=" + codigo + "&t=30", "_blank");
    }
}

function updateResumen() {
    $("#panelSearchFase0").hide();
    $("#panelSearchFase0KPI").html("");
    $("#panelSearchFase1").hide();
    $("#panelSearchFase1KPI").html("");
    $("#panelSearchFase2").hide();
    $("#panelSearchFase2KPI").html("");
    $("#panelSearchFase3").hide();
    $("#panelSearchFase3KPI").html("");
    $("#panelSearchFase4").hide();
    $("#panelSearchFase4KPI").html("");

    var params = {};
    if ($("#searchFiltro").select2("data")[0].type != "PAIS") {
        params.codigo = $("#searchFiltro").select2("data")[0].id;
    }
    if (currentEtapa != null) {
        params.etapa = currentEtapa.text;
    }
    if ($("#searchFiltroFormaRepresentacion").val() != null) {
        params.representacion = $("#searchFiltroFormaRepresentacion").val().join(";");
    }
    if ($("#searchFiltroTipo").val() != null) {
        params.tipo = $("#searchFiltroTipo").val().join(";");
    }
    if ($("#searchFiltroCategoria").val() != null) {
        params.categoria = $("#searchFiltroCategoria").val().join(";");
    }
    if ($("#searchFiltroTags").val() != null) {
        params.tags = $("#searchFiltroTags").val().join(";");
    }
    if ($("#searchFiltroDimension").val() != null) {
        params.dimension = $("#searchFiltroDimension").val().join(";");
    }
    if ($("#searchFiltroComponente").val() != null) {
        params.componente = $("#searchFiltroComponente").val().join(";");
    }
    if ($("#searchFiltroFecha").val() != null) {
        params.year = $("#searchFiltroFecha").val().join(";");
    }
    $.ajax({
        url: web_service + "/documentos?cmd=query_resumen&t=" + (new Date()).getTime(),
        data: params,
        type: 'POST',
        success: function (data) {
            if (data.status) {
                cacheResumen = data.resumen;
                cacheResumenTags = data.resumenTags;

                for (var j = 0; j < 5; j++) {
                    var kpiDocumentos = 0;
                    var kpiMapas = 0;
                    var kpiFecha = null;
                    $("#panelSearchFase" + j + "KPI").html("");
                    $("#panelSearchFase" + j).hide();
                    for (var i = 0; i < cacheResumen.length; i++) {
                        if (cacheResumen[i].ETAPA != null) {
                            var cPos = getEtapaPosicion(cacheResumen[i].ETAPA);
                            if (cPos == j) {
                                if (cacheResumen[i].FORMA_REPRESENTACION == "Documento") {
                                    kpiDocumentos = kpiDocumentos + cacheResumen[i].count;
                                }
                                if (cacheResumen[i].FORMA_REPRESENTACION == "Mapa") {
                                    kpiMapas = kpiMapas + cacheResumen[i].count;
                                }
                                if (cacheResumen[i].FECHA_ACTUALIZACION != null) {
                                    if (kpiFecha == null) {
                                        kpiFecha = moment(cacheResumen[i].FECHA_ACTUALIZACION);
                                    } else {
                                        if (moment(cacheResumen[i].FECHA_ACTUALIZACION).diff(kpiFecha) < 0) {
                                            kpiFecha = moment(cacheResumen[i].FECHA_ACTUALIZACION);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (kpiDocumentos > 0) {
                        $("#panelSearchFase" + j + "KPI").append("Documentos: <a href='#' onclick='$(\"#searchFiltroFormaRepresentacion\").val(\"Documento\"); $(\"#searchFiltroFormaRepresentacion\").trigger(\"change\"); return false;'>" + kpiDocumentos + "</a><br/>");
                        $("#panelSearchFase" + j).show();
                    }
                    if (kpiMapas > 0) {
                        $("#panelSearchFase" + j + "KPI").append("Mapas: <a href='#' onclick='$(\"#searchFiltroFormaRepresentacion\").val(\"Mapa\"); $(\"#searchFiltroFormaRepresentacion\").trigger(\"change\"); return false;'>" + kpiMapas + "</a><br/>");
                        $("#panelSearchFase" + j).show();
                    }

                    if (kpiFecha != null) {
                        $("#panelSearchFase" + j + "Tags").append("&Uacute;ltima actualizaci&oacute;n: " + kpiFecha.format("DD/MM/YYYY"));
                        $("#panelSearchFase" + j + "Tags").show();
                    } else {
                        $("#panelSearchFase" + j + "Tags").hide();
                    }
                    /*
                    var strHTML = "";
                    var cTags = 0;
                    for (var i = 0; i < cacheResumenTags.length; i++) {
                        if (cacheResumenTags[i].ETAPA != null) {
                            var cPos = getEtapaPosicion(cacheResumenTags[i].ETAPA);
                            if (cPos == j) {
                                if (cTags <= 5) {
                                    strHTML = strHTML + "<span class='label' style='background-color:" + getColorByTag(cacheResumenTags[i].TAG) + ";'>" + cacheResumenTags[i].TAG + "</span>";
                                    cTags = cTags + 1;
                                }
                            }
                        }
                    }
                    if (cTags > 0) {
                        $("#panelSearchFase" + j + "Tags").html(strHTML);
                        $("#panelSearchFase" + j + "Tags").show();
                    }
                    */
                }
            }
        },
        error: function (_data) {

        }
    });
}

function updateDocumentos() {
    if (tableDocumentos == null) {
        tableDocumentos = $("#tableDocumentos").DataTable({
            dom: '<"top"<"clear">>rt<"bottom"pil<"clear">>',
            lengthMenu: [[12, 24, 48, 96], ["Mostrar 10 registros", "Mostrar 20 registros", "Mostrar 50 registros", "Mostrar 100 registros"]],
            language: spanishDataTable,
            processing: true,
            serverSide: true,
            ajax: {
                url: web_service + "/documentos",
                deferLoading: 0,
                data: function (d) {
                    d.cmd = "query";
                    if (($("#searchFiltro").select2("data")[0].type == "DEPTO") || ($("#searchFiltro").select2("data")[0].type == "MUNI")) {
                        d.codigo = $("#searchFiltro").val();
                    }
                    if (currentEtapa != null) {
                        d.etapa = currentEtapa.text;
                    }
                    if ($("#searchFiltroFormaRepresentacion").val() != null) {
                        d.representacion = $("#searchFiltroFormaRepresentacion").val().join(";");
                    }
                    if ($("#searchFiltroTipo").val() != null) {
                        d.tipo = $("#searchFiltroTipo").val().join(";");
                    }
                    if ($("#searchFiltroCategoria").val() != null) {
                        d.categoria = $("#searchFiltroCategoria").val().join(";");
                    }
                    if ($("#searchFiltroTags").val() != null) {
                        d.tags = $("#searchFiltroTags").val().join(";");
                    }
                    if ($("#searchFiltroDimension").val() != null) {
                        d.dimension = $("#searchFiltroDimension").val().join(";");
                    }
                    if ($("#searchFiltroComponente").val() != null) {
                        d.componente = $("#searchFiltroComponente").val().join(";");
                    }
                    if ($("#searchFiltroFecha").val() != null) {
                        d.year = $("#searchFiltroFecha").val().join(";");
                    }
                },
                dataSrc: function (dataRow) {
                    cacheDocumentos = dataRow.documentos;
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
                backDetalleDocumento();
                updateRows();
            },
            columns: [
                {
                    data: "ID_DOCUMENTO",
                    orderable: false,
                    render: function (data, type, row, meta) {
                        return row.ID_DOCUMENTO;
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
        tableDocumentos.ajax.reload();
    }
}

function updateRows() {
    if (tableDocumentos == null) {
        return;
    }
    var api = tableDocumentos;
    $("#docViewDiv").html("");
    $("#docViewCount").html(api.page.info().recordsTotal + " resultados");

    var dataRow = api.rows({ page: 'current' }).data();
    var strHTML = "";
    strHTML = strHTML + "<div class='row'>";

    for (var i = 0; i < dataRow.length; i++) {
        if ($("#mainDiv").hasClass("main-small")) {
            strHTML = strHTML + "<div class='col-md-4 doc-item' style='margin-bottom: 20px;'>";
        } else {
            strHTML = strHTML + "<div class='col-md-6 doc-item' style='margin-bottom: 20px;'>";
        }

        var rPos = parseInt(Math.random() * 4);
        if (dataRow[i].FORMA_REPRESENTACION == "Mapa") {
            strHTML = strHTML + "<div id='card-main-" + dataRow[i].ID_DOCUMENTO + "' class='media media-resultados2' style='background-image: url(/images/SIGOT/BG-Mapa.png);background-size: 150px 150px;'>";
        } else {
            strHTML = strHTML + "<div id='card-main-" + dataRow[i].ID_DOCUMENTO + "' class='media media-resultados2' style=''>";
            //background-image: url(/images/sigot/Decoracion" + "0" + rPos + ".png);
        }

        if (dataRow[i].ETAPA != null) {
            var cPos = getEtapaPosicion(dataRow[i].ETAPA);
            strHTML = strHTML + "<div class='title-card-resultados'>";
            strHTML = strHTML + "<img src='/images/SIGOT/Fase" + cPos + ".png' class='panel-resultados2-thumb1' />";
            strHTML = strHTML + "Etapa " + cPos;
            strHTML = strHTML + "</div>";
        }

        strHTML = strHTML + "<div class='media-body'>";
        strHTML = strHTML + "<div class='panel panel-default panel-resultados'>";
        strHTML = strHTML + "<div class='panel-body'>";

        strHTML = strHTML + "<div class='title-recursos'>" + "<div class='panel-resultados-titulo2'>" + dataRow[i].NOMBRE + "</div>" + "</div>";
        strHTML = strHTML + "<hr/>"
        strHTML = strHTML + "<div class='panel-resultados-descripcion2'>";
        if ($("#searchFiltro").val() != dataRow[i].CODIGO) {
            var muni = getUnidadById(dataRow[i].CODIGO);
            var depto = getDeptoByMuni(dataRow[i].CODIGO);
            strHTML = strHTML + "<p style='font-style: italic;'>" + muni.text + ", " + depto.text + "</p>";
        }
        strHTML = strHTML + "<strong class='title-inner'>" + dataRow[i].FORMA_REPRESENTACION + "</strong>";

        strHTML = strHTML + "<ul style='margin-left: 10px; margin-top: 15px; padding-left: 5px;'>"
        strHTML = strHTML + "<li><strong class='title'>Tipo:&nbsp;</strong><a href='#' onclick='filtroTipoDocumento(\"" + dataRow[i].TIPO_DOCUMENTO + "\");'>" + dataRow[i].TIPO_DOCUMENTO + "</a></li>";
        if (dataRow[i].DIMENSION != null) {
            strHTML = strHTML + "<li><strong class='title'>Dimensi&oacute;n:&nbsp;</strong><a href='#' onclick='filtroDimension(\"" + dataRow[i].DIMENSION + "\");'>" + dataRow[i].DIMENSION + "</a></li>";

        }
        if (dataRow[i].COMPONENTE != null) {
            strHTML = strHTML + "<li><strong class='title'>Componente:&nbsp;</strong><a href='#' onclick='filtroComponente(\"" + dataRow[i].COMPONENTE + "\");'>" + dataRow[i].COMPONENTE + "</a></li>";
        }
        if (dataRow[i].CATEGORIA_TEMATICA != null) {
            strHTML = strHTML + "<li><strong class='title'>Categor&iacute;a tem&aacute;tica:&nbsp;</strong><a href='#' onclick='filtroCategoria(\"" + dataRow[i].CATEGORIA_TEMATICA + "\");'>" + dataRow[i].CATEGORIA_TEMATICA + "</a></li>";
        }
        if (dataRow[i].FECHA_PUBLICACION != null) {
            strHTML = strHTML + "<li class='title2'><strong>Publicado:&nbsp;</strong>" + moment(dataRow[i].FECHA_PUBLICACION).format("DD-MM-YYYY") + "</li>";
        }

        strHTML = strHTML + "</ul>"

        strHTML = strHTML + "</div>";
        strHTML = strHTML + "<br>";
        strHTML = strHTML + "<table class='contenedor-botones-cta'>";
        strHTML = strHTML + "<tbody>";
        strHTML = strHTML + "<tr class='content-botones-cta'>";
        if (dataRow[i].FORMATO == ".pdf") {
            strHTML = strHTML + "<td class='botones-cta'>";
            strHTML = strHTML + "<button class='btn btn-default' onclick='verDocumento(" + dataRow[i].ID_DOCUMENTO + "); return false;'>Ver</button>";
            strHTML = strHTML + "</td>";
        } else {
            strHTML = strHTML + "<td class='botones-cta'>";
            strHTML = strHTML + "<button class='btn btn-default' onclick='downloadDocumento(" + dataRow[i].ID_DOCUMENTO + "); return false;'>Descargar</button>";
            strHTML = strHTML + "</td>";
        }
        strHTML = strHTML + "<td class='botones-cta'>";
        strHTML = strHTML + "<button class='btn btn-default' onclick='gotoDetalleDocumento(" + dataRow[i].ID_DOCUMENTO + "); return false;'>Detalles</button>";
        strHTML = strHTML + "</td>";
        strHTML = strHTML + "</tr>";
        strHTML = strHTML + "</tbody>";
        strHTML = strHTML + " </table>";

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

        if ($("#mainDiv").hasClass("main-small")) {
            if (((i + 1) % 3) == 0) {
                strHTML = strHTML + "</div>";
                strHTML = strHTML + "<div class='row'>";
            }
        } else {
            if (((i + 1) % 2) == 0) {
                strHTML = strHTML + "</div>";
                strHTML = strHTML + "<div class='row'>";
            }
        }

    }

    strHTML = strHTML + "</div>";
    $("#docViewDiv").append(strHTML);

}

function verDocumento(id) {
    if (currentUser == null) {
        showLoading("Para ver archivos, debes iniciar la sesi&oacute;n", null, "red", true);
        gotoLogin();
        return;
    }
    currentDocumento = id;
    showLoading("Descargando archivo", "loading", "gold", false);
    currentUser.getIdToken().then(function (currentAccessToken) {
        $.ajax({
            url: web_service + "/descargas?cmd=request&tipo=documento&id=" + currentDocumento + "&token=" + currentAccessToken,
            success: function (data) {
                if (data.status) {
                    closeLoading();
                    var link = document.createElement('a');
                    link.href = web_service + "/descargas?cmd=download&token=" + data.token;
                    link.target = '_blank';
                    link.click();
                } else {
                    showLoading("El archivo no se encuentra disponible para descarga", null, "red", true);
                }
            },
            error: function (_data) {
                showLoading("El archivo no se encuentra disponible para descarga", null, "red", true);
            }
        });
    }).catch(function (_error) {
        showLoading("El archivo no se encuentra disponible para descarga", null, "red", true);
    });
}

function downloadDocumento(id) {
    if (currentUser == null) {
        showLoading("Para generar descargar archivos, debes iniciar la sesi&oacute;n", null, "red", true);
        gotoLogin();
        return;
    }
    currentDocumento = id;
    showLoading("Descargando archivo", "loading", "gold", false);
    currentUser.getIdToken().then(function (currentAccessToken) {
        $.ajax({
            url: web_service + "/descargas?cmd=request&tipo=documento&id=" + currentDocumento + "&token=" + currentAccessToken,
            success: function (data) {
                if (data.status) {
                    closeLoading();
                    var link = document.createElement('a');
                    link.href = web_service + "/descargas?cmd=download&token=" + data.token;
                    link.target = '_self';
                    link.click();
                } else {
                    showLoading("El archivo no se encuentra disponible para descarga", null, "red", true);
                }
            },
            error: function (_data) {
                showLoading("El archivo no se encuentra disponible para descarga", null, "red", true);
            }
        });
    }).catch(function (_error) {
        showLoading("El archivo no se encuentra disponible para descarga", null, "red", true);
    });
}

function gotoDetalleDocumento(id) {
    $("#docViewCount").hide();
    $("#docViewDiv").hide();
    $("#docViewDivFooter").hide();
    $("#docViewDivSingle").show();
    currentDocumento = id;
    for (var i = 0; i < cacheDocumentos.length; i++) {
        if (cacheDocumentos[i].ID_DOCUMENTO == currentDocumento) {
            $("#cardDetailNombre").html(cacheDocumentos[i].NOMBRE);
            $("#cardDetailTipo").html(cacheDocumentos[i].FORMA_REPRESENTACION);
            var cPos = getEtapaPosicion(cacheDocumentos[i].ETAPA);
            $("#cardDetailEtapaImg").attr("src", "/images/SIGOT/Fase" + cPos + ".png");
            var strHTML = "";
            strHTML = strHTML + "<strong class='title'>Tipo:&nbsp;</strong>" + cacheDocumentos[i].TIPO_DOCUMENTO + "<br/>";
            strHTML = strHTML + "<strong class='title2'>Publicado:&nbsp;</strong>" + cacheDocumentos[i].FECHA_PUBLICACION + "<br/>";
            if (cacheDocumentos[i].CATEGORIA_TEMATICA != null) {
                strHTML = strHTML + "<strong>Categor&iacute;a tem&aacute;tica:&nbsp;</strong>" + cacheDocumentos[i].CATEGORIA_TEMATICA + "<br/>";

            }
            if (cacheDocumentos[i].DIMENSION != null) {
                strHTML = strHTML + "<strong class='title'>Dimension:&nbsp;</strong>" + cacheDocumentos[i].DIMENSION + "<br/>";

            }
            if (cacheDocumentos[i].COMPONENTE != null) {
                strHTML = strHTML + "<strong class='title'>Componente:&nbsp;</strong>" + cacheDocumentos[i].COMPONENTE + "<br/>";
            }
            if (cacheDocumentos[i].FORMATO != null) {
                strHTML = strHTML + "<strong class='title'>Formato:&nbsp;</strong>" + cacheDocumentos[i].FORMATO + "<br/>";
            }
            if (cacheDocumentos[i].FILE_SIZE != null) {
                strHTML = strHTML + "<strong class='title'>Tama&ntilde;o:&nbsp;</strong>" + cacheDocumentos[i].FILE_SIZE + "<br/>";
            }
            if (cacheDocumentos[i].IDIOMA != null) {
                strHTML = strHTML + "<strong class='title'>Lenguaje:&nbsp;</strong>" + cacheDocumentos[i].IDIOMA + "<br/>";
            }
            if (cacheDocumentos[i].ETAPA != null) {
                strHTML = strHTML + "<strong class='title'>Etapa:&nbsp;</strong>" + cacheDocumentos[i].ETAPA + "<br/>";
            }
            strHTML = strHTML + "<br/>";
            $("#cardDetailDescripcion").html(strHTML);
            strHTML = "";
            if (cacheDocumentos[i].PALABRAS_CLAVE != null) {
                strHTML = strHTML + "<strong>Etiquetas:&nbsp;</strong><br/>";
                strHTML = strHTML + "<div class='panel-resultados-tags3'>";
                var tagsT = JSON.parse(cacheDocumentos[i].PALABRAS_CLAVE);
                for (var j = 0; j < tagsT.length; j++) {
                    strHTML = strHTML + "<span class='label'  style='background-color:" + getColorByTag(tagsT[j]) + ";'>" + tagsT[j] + "</span>";
                }
                strHTML = strHTML + "</div>";
            }
            if (cacheDocumentos[i].RESUMEN != null) {
                strHTML = strHTML + "<strong>Resumen:&nbsp;</strong><br/>" + cacheDocumentos[i].RESUMEN + "<br/>";
            }
            if (cacheDocumentos[i].RESPONSABLE != null) {
                strHTML = strHTML + "<strong>Fuente:&nbsp;</strong><br/>" + cacheDocumentos[i].RESPONSABLE + "<br/>";
            }
            strHTML = strHTML + "<br/>";
            strHTML = strHTML + "<br/>";
            strHTML = strHTML + "<table style='width: 100%;'>";
            strHTML = strHTML + "<tbody>";
            strHTML = strHTML + "<tr>";
            if (cacheDocumentos[i].FORMATO == ".pdf") {
                strHTML = strHTML + "<td style='width: 100%;'>";
                strHTML = strHTML + "<button class='btn btn-default' style='width: 100%;margin-right: 10px;' onclick='verDocumento(" + cacheDocumentos[i].ID_DOCUMENTO + "); return false;'>Ver</button>";
                strHTML = strHTML + "</td>";
            } else {
                strHTML = strHTML + "<td style='width: 100%;'>";
                strHTML = strHTML + "<button class='btn btn-default' style='width: 100%;margin-right: 10px;' onclick='downloadDocumento(" + cacheDocumentos[i].ID_DOCUMENTO + "); return false;'>Descargar</button>";
                strHTML = strHTML + "</td>";
            }
            strHTML = strHTML + "</tr>";
            strHTML = strHTML + "</tbody>";
            strHTML = strHTML + " </table>";
            strHTML = strHTML + "<br/>";
            $("#cardDetailDescripcion2").html(strHTML);
        }
    }
}

function backDetalleDocumento() {
    $("#docViewCount").show();
    $("#docViewDiv").show();
    $("#docViewDivFooter").show();
    $("#docViewDivSingle").hide();
}

function gotoSearchFase(id) {
    hideAllSearch();
    currentEtapa = fase_data[id];
    $("#searchFaseTitle").html(currentEtapa.text);
    $("#searchFaseDescripcion").html(currentEtapa.descripcion);
    $("#searchFaseHeader").css("background", "linear-gradient(90deg, " + currentEtapa.color + " 0%, " + currentEtapa.color + " 100%)");
    $("#searchFaseHeaderTxt").html("Etapa " + (currentEtapa.id));
    $("#searchFaseHeaderImg").css("background", "url(/images/SIGOT/Fase" + currentEtapa.id + ".png)");
    $("#panelSearchNivelFase").show();
    $("#panelSearchDocumentos").hide();
    $("#panelSearchMapas").hide();
    $("#panelSearchModelos").hide();
    $("#panelSearchTablas").hide();
    $("#panelSearchDocumentosKPI").html("");
    $("#panelSearchMapasKPI").html("");
    $("#panelSearchModelosKPI").html("");
    $("#panelSearchTablasKPI").html("");
    for (var i = 0; i < cacheResumen.length; i++) {
        if (cacheResumen[i].ETAPA != null) {
            if (cacheResumen[i].ETAPA == currentEtapa.text) {
                if (cacheResumen[i].FORMA_REPRESENTACION == "Documento") {
                    $("#panelSearchDocumentosKPI").append(cacheResumen[i].TIPO_DOCUMENTO + ": <a href='#' onclick='$(\"#searchFiltroTipo\").val(\"" + cacheResumen[i].TIPO_DOCUMENTO + "\"); $(\"#searchFiltroTipo\").trigger(\"change\"); return false;return false;'>" + cacheResumen[i].count + "</a><br/>");
                    $("#panelSearchDocumentos").show();
                }
                if (cacheResumen[i].FORMA_REPRESENTACION == "Mapa") {
                    $("#panelSearchMapasKPI").append(cacheResumen[i].TIPO_DOCUMENTO + ": <a href='#' onclick='$(\"#searchFiltroTipo\").val(\"" + cacheResumen[i].TIPO_DOCUMENTO + "\"); $(\"#searchFiltroTipo\").trigger(\"change\"); return false;return false;'>" + cacheResumen[i].count + "</a><br/>");
                    $("#panelSearchMapas").show();
                }
                /*
                if (cacheResumen[i].FORMA_REPRESENTACION == "Tabla digital") {
                    $("#panelSearchModelosKPI").append("Elementos: " + cacheResumen[i].count + "<br/>");
                    $("#panelSearchModelos").show();
                }
                if (cacheResumen[i].FORMA_REPRESENTACION == "Modelo digital") {
                    $("#panelSearchTablasKPI").append("Elementos: " + cacheResumen[i].count + "<br/>");
                    $("#panelSearchTablas").show();
                }
                */
            }
        }
    }
    $("#panelSearchDocumentosTags").html("");
    $("#panelSearchMapasTags").html("");
    var cTagsDoc = 0;
    var cTagsMap = 0;
    for (var i = 0; i < cacheResumenTags.length; i++) {
        if (cacheResumenTags[i].ETAPA != null) {
            if (cacheResumenTags[i].ETAPA == currentEtapa.text) {
                if (cacheResumenTags[i].FORMA_REPRESENTACION == "Documento") {
                    if (cTagsDoc < 8) {
                        cTagsDoc = cTagsDoc + 1;
                        $("#panelSearchDocumentosTags").append("<span class='label' style='background-color:" + getColorByTag(cacheResumenTags[i].TAG) + ";'>" + cacheResumenTags[i].TAG + "</span>");
                        $("#panelSearchDocumentosTags").show();
                    }
                }
                if (cacheResumenTags[i].FORMA_REPRESENTACION == "Mapa") {
                    if (cTagsMap < 8) {
                        cTagsMap = cTagsMap + 1;
                        $("#panelSearchMapasTags").append("<span class='label' style='background-color:" + getColorByTag(cacheResumenTags[i].TAG) + ";'>" + cacheResumenTags[i].TAG + "</span>");
                        $("#panelSearchMapasTags").show();
                    }
                }
                /*
                if (cacheResumen[i].FORMA_REPRESENTACION == "Tabla digital") {
                    $("#panelSearchModelosKPI").append("Elementos: " + cacheResumen[i].count + "<br/>");
                    $("#panelSearchModelos").show();
                }
                if (cacheResumen[i].FORMA_REPRESENTACION == "Modelo digital") {
                    $("#panelSearchTablasKPI").append("Elementos: " + cacheResumen[i].count + "<br/>");
                    $("#panelSearchTablas").show();
                }
                */
            }
        }

    }
    updateDocumentos();
}

function updateCaracterizacionLoad() {

    $("#panelSearchCaracterizacion").hide();
    if ($("#searchFiltro").select2("data")[0].type == "PAIS") {
        $("#panelSearchCaracterizacionTitulo").html("Colombia");
    };
    if (($("#searchFiltro").select2("data")[0].type == "DEPTO") || ($("#searchFiltro").select2("data")[0].type == "MUNI")) {
        $("#panelSearchCaracterizacionTitulo").html($("#searchFiltro").select2("data")[0].text);
    }
    $("#panelSearchCaracterizacion").show();
    $("#panelSearchCaracterizacionCreacion").hide();
    $("#panelSearchCaracterizacionCreacionActo").html("");
    $("#panelSearchCaracterizacionTable").html("");

    var params = {};
    params.tipo = $("#searchFiltro").select2("data")[0].type;
    params.id = $("#searchFiltro").val();

    $.ajax({
        url: web_service + "/unidad?cmd=query&t=" + (new Date()).getTime(),
        data: params,
        type: 'POST',
        success: function (data) {
            if (data.status) {
                currentCaracterizacion = data;
                var strHTML;

                strHTML = "";
                if (($("#searchFiltro").select2("data")[0].type == "MUNI")) {
                    var depto = getDeptoByMuni($("#searchFiltro").val());
                    strHTML = "<b>Departamento:</b>&nbsp;<a href='#' onclick='gotoSearchUnidad(\"" + depto.id + "\");return false;'>" + depto.text + "</a><br/>";
                }
                $("#panelSearchCaracterizacionTable").append(strHTML);

                if (($("#searchFiltro").select2("data")[0].type == "MUNI")) {
                    var nombre = currentCaracterizacion.NOMBRE.substr(0, currentCaracterizacion.NOMBRE.lastIndexOf(", "));
                    $("#panelSearchCaracterizacionTitulo").html(nombre);
                }

                strHTML = "";
                if (currentCaracterizacion.CAPITAL != null) {
                    strHTML = strHTML + "<b>Capital:</b>&nbsp;<a href='#' onclick='gotoSearchUnidad(\"" + currentCaracterizacion.CAPITAL + "\");return false;'>" + getUnidadById(data.CAPITAL).text + "</a><br/>";
                }
                if (currentCaracterizacion.CODIGO != null) {
                    strHTML = strHTML + "<b>C&oacute;digo DANE:</b>&nbsp;" + currentCaracterizacion.CODIGO + "<br/>";
                }
                if (currentCaracterizacion.AREA_TOTAL != null) {
                    strHTML = strHTML + "<b>&Aacute;rea (km2):</b>&nbsp;" + currentCaracterizacion.AREA_TOTAL + "<br/>";
                }
                if (currentCaracterizacion.ALTITUD != null) {
                    strHTML = strHTML + "<b>Altitud (msnm):&nbsp;</b>" + currentCaracterizacion.ALTITUD + "<br/>";
                }
                if (currentCaracterizacion.POBLACION != null) {
                    strHTML = strHTML + "<b>Poblaci&oacute;n (hab):&nbsp;</b>" + currentCaracterizacion.POBLACION + "<br/>";
                }
                if (currentCaracterizacion.CATALOGO != null) {
                    strHTML = strHTML + "<b>Cat&aacute;logo:</b>&nbsp;<a href='" + currentCaracterizacion.CATALOGO + "' target='_blank'>Ver</a><br/>";
                }
                if ((currentCaracterizacion.PDF_CREACION) || (currentCaracterizacion.PDF_CARACTERIZACION)) {
                    strHTML = strHTML + "<hr style='border-top: 1px solid lightgray;margin-top: 10px;margin-bottom: 5px;' />";
                }
                if ((currentCaracterizacion.PDF_CREACION) && (currentCaracterizacion.PDF_CARACTERIZACION)) {
                    strHTML = strHTML + "<button class='btn btn-primary' style='width: 45%;padding: 2px;' onclick='downloadActoCreacion(); return false;'>Acto de creaci&oacute;n</button>&nbsp;";
                    strHTML = strHTML + "<button class='btn btn-primary' style='width: 50%;padding: 2px;' onclick='downloadCaracterizacion(); return false;'>Caracterizaci&oacute;n territorial</button><br/>";
                } else {
                    if (currentCaracterizacion.PDF_CREACION) {
                        strHTML = strHTML + "<button class='btn btn-primary' style='width: 100%;padding: 2px;' onclick='downloadActoCreacion(); return false;'>Acto de creaci&oacute;n</button><br/>";
                    }
                    if (currentCaracterizacion.PDF_CARACTERIZACION) {
                        strHTML = strHTML + "<button class='btn btn-primary' style='width: 100%;padding: 2px;' onclick='downloadCaracterizacion(); return false;'>Caracterizaci&oacute;n territorial</button><br/>";
                    }
                }
                $("#panelSearchCaracterizacionTable").append(strHTML);

                strHTML = "";
                if (currentCaracterizacion.CATEGORIA_POT != null) {
                    strHTML = strHTML + "<b>Categor&iacute;a:&nbsp;</b>" + currentCaracterizacion.CATEGORIA_POT + "<br/>";
                }
                if (currentCaracterizacion.TIPO_POT != null) {
                    strHTML = strHTML + "<b>Tipo:&nbsp;</b>" + currentCaracterizacion.TIPO_POT + "<br/>";
                }
                if (currentCaracterizacion.FECHA_REVISION_POT != null) {
                    strHTML = strHTML + "<b>Fecha de &uacute;ltima revisi&oacute;n:&nbsp;</b>" + currentCaracterizacion.FECHA_REVISION_POT + "<br/>";
                }
                $("#panelSearchCaracterizacionPOTTable").html(strHTML);
                if (strHTML.length > 0) {
                    $("#panelSearchCaracterizacionPOTContainer").show();
                } else {
                    $("#panelSearchCaracterizacionPOTContainer").hide();
                }
            }
        },
        error: function (_data) {


        }
    });
}

function filterMapas() {
    $("#searchFiltroFormaRepresentacion").val(null);
    $("#searchFiltroFormaRepresentacion").empty();
    var newOption = new Option("Mapa", "Mapa", false, false);
    $('#searchFiltroFormaRepresentacion').append(newOption).trigger('change');
    var selectedValues = new Array();
    selectedValues[0] = "Mapa";
    $("#searchFiltroFormaRepresentacion").select2('val', selectedValues);
}

function filterDocumentos() {
    $("#searchFiltroFormaRepresentacion").val(null);
    $("#searchFiltroFormaRepresentacion").empty();
    var newOption = new Option("Documento", "Documento", false, false);
    $('#searchFiltroFormaRepresentacion').append(newOption).trigger('change');
    var selectedValues = new Array();
    selectedValues[0] = "Documento";
    $("#searchFiltroFormaRepresentacion").select2('val', selectedValues);
}

function filtroTipoDocumento(value) {
    $("#searchFiltroTipo").val(null);
    $("#searchFiltroTipo").empty();
    var newOption = new Option(value, value, false, false);
    $('#searchFiltroTipo').append(newOption).trigger('change');
    var selectedValues = new Array();
    selectedValues[0] = value;
    $("#searchFiltroTipo").select2('val', selectedValues);
}

function filtroCategoria(value) {
    $("#searchFiltroCategoria").val(null);
    $("#searchFiltroCategoria").empty();
    var newOption = new Option(value, value, false, false);
    $('#searchFiltroCategoria').append(newOption).trigger('change');
    var selectedValues = new Array();
    selectedValues[0] = value;
    $("#searchFiltroCategoria").select2('val', selectedValues);
}

function filtroDimension(value) {
    $("#searchFiltroDimension").val(null);
    $("#searchFiltroDimension").empty();
    var newOption = new Option(value, value, false, false);
    $('#searchFiltroDimension').append(newOption).trigger('change');
    var selectedValues = new Array();
    selectedValues[0] = value;
    $("#searchFiltroDimension").select2('val', selectedValues);
}

function filtroComponente(value) {
    $("#searchFiltroComponente").val(null);
    $("#searchFiltroComponente").empty();
    var newOption = new Option(value, value, false, false);
    $('#searchFiltroComponente').append(newOption).trigger('change');
    var selectedValues = new Array();
    selectedValues[0] = value;
    $("#searchFiltroComponente").select2('val', selectedValues);
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
        if (firstOpen) {
            firstOpen = false;
            $("#searchBody p").show();
            $("#docViewDiv").show();
            $("#mapViewDiv").show();
            $("#instruccionesDiv").hide();
        }
        reporteUso("Selección unidad", { unidad: $("#searchFiltro").val() + " - " + $("#searchFiltro").select2("data")[0].text });

        var data = $("#searchFiltro").select2("data")[0];
        if (data.type == "MUNI") {
            var params = {};
            params.tipo = data.type;
            params.codigo = data.id;
            $.ajax({
                url: web_service + "/unidad?cmd=query_codigo",
                data: params,
                type: 'POST',
                success: function (data) {
                    if (data.status) {
                        updateInicio();
                    } else {
                        showLoading("Ha ocurrido un error, consultando la unidad selecccionada.", null, "red", true);
                        $("#panelSearchNivel1").hide();
                    }
                },
                error: function (_data) {
                    showLoading("Ha ocurrido un error, consultando la unidad selecccionada.", null, "red", true);
                    $("#panelSearchNivel1").hide();
                }
            });
        }
        if (data.type == "DEPTO") {
            var params = {};
            params.tipo = data.type;
            params.codigo = data.id;
            $.ajax({
                url: web_service + "/unidad?cmd=query_codigo",
                data: params,
                type: 'POST',
                success: function (data) {
                    if (data.status) {
                        updateInicio();
                    } else {
                        showLoading("Ha ocurrido un error, consultando la unidad selecccionada.", null, "red", true);
                        $("#panelSearchNivel1").hide();
                    }
                },
                error: function (_data) {
                    showLoading("Ha ocurrido un error, consultando la unidad selecccionada.", null, "red", true);
                    $("#panelSearchNivel1").hide();
                }
            });
        }
        if (data.type == "PAIS") {
            updateInicio();
        }

    });

    var dataForma = [];
    if (getParameterByName("forma") != null) {
        dataForma = getParameterByName("forma").split(";");
        for (var i = 0; i < dataForma.length; i++) {
            dataForma[i] = { id: dataForma[i], text: dataForma[i] };
        }
    }
    $("#searchFiltroFormaRepresentacion").select2({
        data: data.FORMA_REPRESENTACION,
        multiple: true,
        placeholder: "Ej: Documento, Cartografía"
    });
    $("#searchFiltroFormaRepresentacion").on("change", function (e) {
        tableDocumentos.ajax.reload();
        updateResumen();
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
        tableDocumentos.ajax.reload();
        updateResumen();
        $(".class-tag").each(function (index, value) {
            $(value).parent().css("border-color", getColorByTag($(value).attr("item-tag")));
            $(value).parent().find(".select2-selection__choice__remove").css("color", "white");
            $(value).css("color", getColorByTag($(value).attr("item-tag")));
        });
    });

    var dataFecha = [];
    if (getParameterByName("fecha") != null) {
        dataFecha = getParameterByName("fecha").split(";");
        for (var i = 0; i < dataFecha.length; i++) {
            dataFecha[i] = { id: dataFecha[i], text: dataFecha[i] };
        }
    }
    $("#searchFiltroFecha").select2({
        data: dataFecha,
        query: function (query) {
            var key = $("#searchFiltro").val();
            if (searchFechaCache[key] != null) {
                query.callback({ results: searchFechaCache[key].FECHA });
            } else {
                var params = {};
                params.cmd = "query";
                if (($("#searchFiltro").select2("data")[0].type == "DEPTO") || ($("#searchFiltro").select2("data")[0].type == "MUNI")) {
                    params.codigo = $("#searchFiltro").val();
                }
                $.ajax({
                    url: web_service + "/documentos?cmd=filtro_annio",
                    data: params,
                    type: 'POST',
                    success: function (data) {
                        searchFechaCache[key] = data;
                        query.callback({ results: data.FECHA });
                    }
                });
            }
        },
        multiple: true,
        placeholder: "Ej: 2019, 2018"
    });
    $("#searchFiltroFecha").on("change", function (e) {
        tableDocumentos.ajax.reload();
        updateResumen();
    });

    var dataTipo = [];
    if (getParameterByName("tipo") != null) {
        dataTipo = getParameterByName("tipo").split(";");
        for (var i = 0; i < dataTipo.length; i++) {
            dataTipo[i] = { id: dataTipo[i], text: dataTipo[i] };
        }
    }
    $("#searchFiltroTipo").select2({
        data: data.TIPO_DOCUMENTO,
        multiple: true,
        placeholder: "Ej: Técnico, Normativo, Dato"
    });
    $("#searchFiltroTipo").on("change", function (e) {
        tableDocumentos.ajax.reload();
        updateResumen();
    });

    var dataCategoria = [];
    if (getParameterByName("categoria") != null) {
        dataCategoria = getParameterByName("categoria").split(";");
        for (var i = 0; i < dataCategoria.length; i++) {
            dataCategoria[i] = { id: dataCategoria[i], text: dataCategoria[i] };
        }
    }
    $("#searchFiltroCategoria").select2({
        data: data.CATEGORIAS,
        multiple: true,
        placeholder: "Ej: Economía, Mapas e imágenes"
    });
    $("#searchFiltroCategoria").on("change", function (e) {
        tableDocumentos.ajax.reload();
        updateResumen();
    });

    var dataComponente = [];
    if (getParameterByName("Componente") != null) {
        dataComponente = getParameterByName("Componente").split(";");
        for (var i = 0; i < dataComponente.length; i++) {
            dataComponente[i] = { id: dataComponente[i], text: dataComponente[i] };
        }
    }
    $("#searchFiltroComponente").select2({
        data: data.COMPONENTE,
        multiple: true,
        placeholder: "Ej: Urbano, Rural, General"
    });
    $("#searchFiltroComponente").on("change", function (e) {
        tableDocumentos.ajax.reload();
        updateResumen();
    });

    var dataDimension = [];
    if (getParameterByName("Dimension") != null) {
        dataDimension = getParameterByName("Dimension").split(";");
        for (var i = 0; i < dataDimension.length; i++) {
            dataDimension[i] = { id: dataDimension[i], text: dataDimension[i] };
        }
    }
    $("#searchFiltroDimension").select2({
        data: data.DIMENSION,
        multiple: true,
        placeholder: "Ej: Ambiental, Funcional"
    });
    $("#searchFiltroDimension").on("change", function (e) {
        tableDocumentos.ajax.reload();
        updateResumen();
    });

    $("#panelSearch").show();

    if (getParameterByName("u") != null) {
        var unidad = getUnidadById(getParameterByName("u"));
        currentCaracterizacion = data.UNIDAD_INICIAL;
        firstExpand = false;
        $("#panelSearchResultados").show();
        $("#headingSearch").show();
        toggleMenu("large");
        $("#searchFiltro").val(getParameterByName("u"));
        $("#searchFiltro").trigger("change");
    }


}

function updateInicio() {
    if (firstExpand) {
        $("#panelSearchResultados").show();
        $("#headingSearch").show();
        toggleMenu("large");
    }
    searchMain();
    updateResumen();
    updateDocumentos();
}

function getSorted(selector, attrName) {
    return $($(selector).toArray().sort(function (a, b) {
        var aVal = a.getAttribute(attrName),
            bVal = b.getAttribute(attrName);
        return (aVal > bVal) ? 1 : -1;
    }));
}

function getEtapaPosicion(id) {
    if (id.trim() == "Alistamento") {
        return 0;
    }
    if (id.trim() == "Diagnóstico") {
        return 1;
    }
    if (id.trim() == "Formulación") {
        return 2;
    }
    if (id.trim() == "Implementación") {
        return 3;
    }
    if (id.trim() == "Evaluación y Seguimiento") {
        return 4;
    }
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

