var cacheResumen2;
var cacheResumenTags2;

var tableRecursos;
const tipoRecurso = "Cartillas, guias y manuales";

$(document).ready(function(){
    var params = "";
    $.ajax({
        url: web_service + "/config?cmd=config_buscador&t=" + (new Date()).getTime() + params,
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
    $.ajax({
        url: web_service + "/recursos?cmd=query_resumen&t=" + (new Date()).getTime(),
        data: params,
        type: 'POST',
        success: function (data) {
            if (data.status) {
                cacheResumen2 = data.resumen;
                cacheResumenTags2 = data.resumenTags;         
            }
        },
        error: function (err) {
            console.error(err);
        }
    });
})

function initData(data){

    $("#filterTematica").select2({
        data: data.TEMATICAS,
        allowClear: true,
        placeholder: "Selecciona una o varias"        
    });
    $("#filterTematica").val(null);
    $("#filterTematica").trigger("change");
    $("#filterTematica").on("change", function (e) {
        updateRecursos();
    });

    $("#filterSubTematica").select2({
        data: data.TAGS2,
        // multiple: true,
        allowClear: true,
        placeholder: "Selecciona una o varias",
        // templateSelection: function (data) {
        //     // return $("<span class='class-tag' style='background-color: #"+data.color+"; padding: 4px 5px 0px 5px;' item-tag='" + data.text + "'>" + data.text + "</span>");
        //     console.log(cacheTags2);
        //     return $("<span class='class-tag' item-tag='" + data.text + "'>" + data.text + "</span>");
        // }
    });
    $("#filterSubTematica").val(null);
    $("#filterSubTematica").trigger("change");
    $("#filterSubTematica").on("change", function (e) {
        updateRecursos();
    });

    $("#filterCreador").select2({
        data: data.ENTIDADES,
        allowClear: true,
        placeholder: "Selecciona uno"
    });
    $("#filterCreador").val(null);
    $("#filterCreador").trigger("change");
    $("#filterCreador").on("change", function (e) {
        updateRecursos();
    });

    $("#searchKeyword").on("keyup change", function (e) {
        updateRecursos();
    });
    
    $.ajax({
        url: web_service + "/documentos?cmd=filtro_annio&t=" + (new Date()).getTime(),
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            if (data.status) {
                $("#filterYear").select2({
                    data: data.FECHA,
                    allowClear: true,
                    placeholder: "Año"        
                });
                $("#filterYear").val(null);
                $("#filterYear").trigger("change");
                $("#filterYear").on("change", function (e) {
                    updateRecursos();
                });

            } else {
                //
            }
        },
        error: function (xhr, status, error) {
            //
        }
    });

    $("#ordenarResultados").on("change", function (e) {

        let column = $("#ordenarResultados :selected").attr('data-column');
        let order = $("#ordenarResultados").val();

        tableRecursos.column( column + ':visible' )
            .order( order )
            .draw(false);
    });

    updateRecursos();

}

function limpiarMain() {
    $("#filterTematica").val(null);
    $("#filterTematica").trigger("change.select2");

    $("#filterTematica").val(null);
    $("#filterTematica").trigger("change.select2");

    $("#filterSubTematica").val([]);
    $("#filterSubTematica").trigger("change.select2");

    $("#filterCreador").val([]);
    $("#filterCreador").trigger("change.select2");

    $("#filterYear").val(null);
    $("#filterYear").trigger("change.select2");
    
    $("#searchKeyword").val(null);
    $("#searchKeyword").trigger("change.select2");

    updateRecursos();
}

function updateRecursos(){
    if (tableRecursos == null) {
        tableRecursos = $("#tableRecursos").DataTable({
            dom: '<"top"<"clear">>rt<"bottom"pil<"clear">>',
            lengthMenu: [[8, 16, 32, 64], ["Mostrar 6 registros", "Mostrar 12 registros", "Mostrar 24 registros", "Mostrar 48 registros", "Mostrar 96 registros"]],
            language: spanishDataTable,
            "language": {
                "paginate": {
                    "next": "<i class='fas fa-chevron-right'></i>",
                    "previous": "<i class='fas fa-chevron-left'></i>"
                }
              },
            processing: true,
            serverSide: true,
            ajax: {
                url: web_service + "/recursos",
                deferLoading: 0,
                data: function (d) {
                    d.cmd = "query";
                    // d.codigo = "0";
                    d.tipo = tipoRecurso;
                    if ($("#searchKeyword").val() != null) {
                        d.search["value"] = $("#searchKeyword").val();
                    }
                    if ($("#filterTematica").val() != null) {
                        d.tematica = $("#filterTematica").val();
                    }
                    if ($("#filterSubTematica").val() != null) {
                        d.tags2 = $("#filterSubTematica").val();//.join(";");
                    }
                    if ($("#filterCreador").val() != null) {
                        d.entidad = $("#filterCreador").val();
                    }
                    if ($("#filterYear").val() != null) {
                        d.year = $("#filterYear").val();
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
                    orderable: true,
                    render: function (data, type, row, meta) {
                        return row.NOMBRE;
                    }
                },
                {
                    data: "FECHA_PUBLICACION",
                    orderable: true,
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

function updateRows(){
    if (tableRecursos == null) {
        return;
    }
    var api = tableRecursos;
    $("#recursosViewDiv").html("");
    $("#recursosViewCount").html(api.page.info().recordsTotal + " recursos");

    var dataRow = api.rows({ page: 'current' }).data();
    var strHTML = "";

    for (var i = 0; i < dataRow.length; i++) {
        strHTML = strHTML + "<div class='doc-item' style='margin-bottom: 20px;'>";

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
            strHTML = strHTML + "<div class='media-body panel-resultados-header-img' style='background-color: #1E4A93; background-image: url(../images/recursos/aplicaciones.png);'>";
        }
        if (dataRow[i].TIPO_RECURSO == "Cartillas, guias y manuales") {
            strHTML = strHTML + "<div class='media-body panel-resultados-header-img' style='background-color: #038D71; background-image: url(../images/recursos/cartillas.png);'>";
        }
        if (dataRow[i].TIPO_RECURSO == "Datos para el OT") {
            strHTML = strHTML + "<div class='media-body panel-resultados-header-img' style='background-color: #EB6654; background-image: url(../images/recursos/datosOT.png);'>";
        }
        if (dataRow[i].TIPO_RECURSO == "Normatividad") {
            strHTML = strHTML + "<div class='media-body panel-resultados-header-img' style='background-color: #F2A742; background-image: url(../images/recursos/normatividad.png);'>";
        }
        if (dataRow[i].TIPO_RECURSO == "Servicios") {
            strHTML = strHTML + "<div class='media-body panel-resultados-header-img' style='background-color: #532D96; background-image: url(../images/recursos/servicios.png);'>";
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
                strHTML = strHTML + "<span class='label'  style='background-color:" + getColorByTag2(tagsT[j]) + ";'>" + tagsT[j] + "</span>";
            }
        }
        strHTML = strHTML + "</div>";
        strHTML = strHTML + "</div>";
        strHTML = strHTML + "</div>";
    }

    strHTML = strHTML + "</div>";
    strHTML = strHTML + "</div>";

    $("#recursosViewDiv").append(strHTML);
}

function getUnidadById(id) {
    if (id == null) {
        return null;
    }
    for (var i = 0; i < cacheUnidades.length; i++) {
        if (cacheUnidades[i].id == id) {
            return cacheUnidades[i];
        }
    }
}

function changeLenDocs(pages){
    tableRecursos.page.len( pages ).draw();
}

