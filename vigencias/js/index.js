var currentEstado = "init";

$(document).ready(function () {
    //$("[data-toggle='popover']").popover();
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
            currentUser.getIdToken().then(function (accessToken) {
                currentAccessToken = accessToken;
                $.ajax({
                    url: web_service + "/validate?token=" + currentAccessToken + "&t=" + (new Date()).getTime(),
                    type: 'GET',
                    dataType: 'json',
                    success: function (data) {
                        if (data.status) {
                            var first = "";
                            if (data.permisos.indexOf("CARGUE_DOCUMENTOS") != -1) {
                                if (first == "") {
                                    first = "#menuDocumentos";
                                }
                                $("#menuDocumentos").show();
                                $("#optionCargue").show();
                            }
                            if (data.permisos.indexOf("CARGUE_RECURSOS") != -1) {
                                if (first == "") {
                                    first = "#menuRecursos";
                                }
                                $("#menuRecursos").show();
                                $("#optionCargue").show();
                            }
                            if (data.permisos.indexOf("CARGUE_POT") != -1) {
                                if (first == "") {
                                    first = "#menuPot";
                                }
                                $("#menuPot").show();
                                $("#optionCargue").show();
                            }
                            $(first).addClass("active");

                            $("#panelSearch").show();
                            $("#mapViewDiv").show();

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
                                    console.error(err);
                                }
                            });

                        } else {
                            $.confirm({
                                title: "Cargue",
                                content: "El usuario no tiene permisos para esta funcionalidad",
                                buttons: {
                                    Ok: function () {
                                        window.location.href = "/";
                                    }
                                }
                            });
                        }
                    },
                    error: function (xhr, status, error) {
                        $.confirm({
                            title: "Cargue",
                            content: "El usuario no tiene permisos para esta funcionalidad",
                            buttons: {
                                Ok: function () {
                                    window.location.href = "/";
                                }
                            }
                        });
                    }
                });
            });
        } else {
            currentUser = null;
            currentFuncionalidades = [];
            $("#optionCargue").hide();
            $("#logoutContainer").hide();
            $("#loginContainer").show();
            $("#userName,#userName2").html("Iniciar sesion");
            $("#userPhoto,#userPhoto2").attr("src", "/images/iconos/User.png");
            gotoLogin();
        }
    }, function (error) {
        console.log(error);
    });
    firebase_ui = new firebaseui.auth.AuthUI(firebase.auth());
    signIn();
    $('[data-toggle="tooltip"]').tooltip();
    $.fn.DataTable.ext.pager.numbers_length = 10;
});

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