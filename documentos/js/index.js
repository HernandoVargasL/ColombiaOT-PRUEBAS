var cacheResumen2;
var cacheResumenTags2;

var tableRecursos;

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
        minimumResultsForSearch: Infinity,
        placeholder: "Selecciona una o varias"        
    });
    $("#filterTematica").val(null);
    $("#filterTematica").trigger("change");
    $("#filterTematica").on("change", function (e) {
        updateRecursos();
    });

    $("#filterSubTematica").select2({
        data: data.TAGS2,
        multiple: true,
        allowClear: true,
        placeholder: "Selecciona una o varias",
        templateSelection: function (data) {
            return $("<span class='class-tag' style='background-color: #"+data.color+"; padding: 4px 5px 0px 5px;' item-tag='" + data.text + "'>" + data.text + "</span>");
        }
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

    $("#searchKeyword").on("keyup change", function (e) {
        updateRecursos();
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

    // $("#limpiarBtn").hide();

    updateRecursos();
}

function updateRecursos(){
    if (tableRecursos == null) {
        tableRecursos = $("#tableRecursos").DataTable({
            dom: '<"top"<"clear">>rt<"bottom"pil<"clear">>',
            lengthMenu: [[8, 16, 32, 64], ["Mostrar 6 registros", "Mostrar 12 registros", "Mostrar 24 registros", "Mostrar 48 registros", "Mostrar 96 registros"]],
            language: spanishDataTable,
            processing: true,
            serverSide: true,
            ajax: {
                url: web_service + "/servicios",
                deferLoading: 0,
                data: function (d) {
                    d.cmd = "query";
                    d.tematica = 30
                    d.subtematica = 3007
                    // d.codigo = "0";                    
                    if ($("#searchKeyword").val() != null) {
                        d.search["value"] = $("#searchKeyword").val();
                    }
                    if ($("#filterYear").val() != null) {
                        d.year = $("#filterYear").val();
                    }
                },
                dataSrc: function (dataRow) {
                    cacheRecursos = dataRow.servicios;
                    var resultado = [];
                    for (var i = 0; i < dataRow.servicios.length; i++) {
                        resultado.push(dataRow.servicios[i]);
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
                    data: "ID_SERVICIO",
                    orderable: false,
                    render: function (data, type, row, meta) {
                        return row.ID_SERVICIO;
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
                    data: "FECHA",
                    orderable: true,
                    render: function (data, type, row, meta) {
                        if (row.FECHA == null) {
                            return "";
                        }
                        return row.FECHA;
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

        strHTML = strHTML + "<div id='card-main-" + dataRow[i].ID_SERVICIO + "' class='media media-resultados2'>";
        
        strHTML = strHTML + "<div class='media-body panel-resultados-header' style='background-color: #6445E1;'>";

        strHTML = strHTML + "<span class='label'>Caracterización territorial<span class='label'>" + "›" + "</span>" + "</span>";

        strHTML = strHTML + "</div>";

        strHTML = strHTML + "<div class='media-body panel-resultados-header-img' style='background-color: #532D96; background-image: url(./images/recursos/servicios.png);'>";

        strHTML = strHTML + "</div>";

        strHTML = strHTML + "<div class='media-body'>";
        strHTML = strHTML + "<div class='panel panel-default panel-resultados'>";
        strHTML = strHTML + "<div class='panel-body'>";

        strHTML = strHTML + "<div class='title-recursos'>" + "<div class='panel-resultados-titulo2'>" + dataRow[i].NOMBRE + "</div>" + "</div>";
        strHTML = strHTML + "<hr/>"
        strHTML = strHTML + "<div class='panel-resultados-descripcion2'>";
        if (dataRow[i].RESUMEN != null) {
            strHTML = strHTML + "<p>" + dataRow[i].RESUMEN + "</p>";
        }

        if (dataRow[i].FECHA != null) {
            strHTML = strHTML + "<strong>Fecha:&nbsp;</strong>" + moment(dataRow[i].FECHA).format("DD-MM-YYYY");
        }
        if (dataRow[i].LICENCIA != null) {
            strHTML = strHTML + "</br><strong>Licencia:&nbsp;</strong>" + dataRow[i].LICENCIA;
        }

        strHTML = strHTML + "</div>";
        strHTML = strHTML + "<br>";
        var nbotones = dataRow[i].ADJUNTOS.length;

        if (nbotones > 0) {            
            strHTML = strHTML + "<table style='width: 100%;'>";
            strHTML = strHTML + "<tbody>";
            strHTML = strHTML + "<tr>";

            strHTML = strHTML + "<td style='width: 100%;'>";
            strHTML = strHTML + "<button class='btn btn-default' style='width: 100%;margin-right: 10px;' onclick='window.open(\"https://www.colombiaenmapas.gov.co/?u=0&t=3007&servicio=" + dataRow[i].ID_SERVICIO + "\", \"_blank\"); return false;'>Ver m&aacute;s</button>";
            strHTML = strHTML + "</td>";
            
            strHTML = strHTML + "</tr>";
            strHTML = strHTML + "</tbody>";
            strHTML = strHTML + " </table>";
        }

        strHTML = strHTML + "</div>";
        strHTML = strHTML + "</div>";
        strHTML = strHTML + "</div>";

        strHTML = strHTML + "<div class='media-body panel-resultados-tags2'>";
        if (dataRow[i].PALABRAS_CLAVE != null) {
            var tagsT = dataRow[i].PALABRAS_CLAVE.replaceAll("; ", ";").split(";");
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