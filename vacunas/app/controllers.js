/**
 * List Controller
 * @version v0.2.2 - 2015-04-23 * @link http://csluni.org
 * @author Eisson Alipio <eisson.alipio@gmail.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
(function(){
  'use strict';

  angular
  .module('Controllers', [])

  .filter('estadoFilter', function(){
  return function(id){
    var estados = ['Inactivo', 'Activo'];
      return estados[id];
    };
  })

  .filter('negativo', function(){
  return function(id){
    var valor= id*(-1);

      return valor;
    };
  })

  .filter('documento', function(){
    return function(input){
      var documento = ["", "DNI", "CUI"];
      return documento[input];
    };
  })
    .filter('filterNoData', function(){
    return function(input){
      if(input == null){
        var retorno = "No data";
      }
      else{
        var retorno = input;
      }
      return retorno;
    };
  })
 .filter('filterNutrientes', function(){
    return function(input){
      if(input==0){
        var retorno = "No administrado";
      }
      else if(input==1){
        var retorno = "Administrado";
      }
      
      return retorno;
    };
  })
  
 .filter('filterFecha', function(){
    return function(input){
      if(input<12){
        var retorno = input.toString()+" meses";
      }
      else{
        var years = Math.floor(input/12);
        var resto = input%12;
        if(resto==0){
          if(years==1){
            var retorno = years.toString()+" año";}
            else{
          var retorno = years.toString()+" años";}
        }
        else{
          if(years==1){
            var retorno = years.toString()+" año y "+resto.toString()+" meses";}
            else{
          var retorno = years.toString()+" años  y "+resto.toString()+" meses";}
        }
      }

      return retorno;
    };
  })
  .filter('sexoFilter', function(){
    return function(input){
      var sexo = "Masculino";
      if(input == "F"){
        sexo = "Femenino";
      }
      return sexo;
    };
  })

  .controller('TabsController',['$scope', '$route','$http', function($scope, $route, $http){
    console.log($route.current);
     $scope.$route = $route;
  }])

  .controller('VacunasController',['$scope', '$http', '$route', function ($scope, $http, $route) {
    //
  }])
  .controller('ConsultarController',['$scope', '$http', '$route', function ($scope, $http, $route) {
    $route.current.activetab ? $scope.$route = $route : null

    $scope.nino = {tipo:3, numero:1000999595};
    $scope.buscarNino = function(nino){
      delete $scope.nino_error;
      delete $scope.nino_ws;
      $http.get('../api/wsByNumero.php?numero='+ nino.numero ).success(function(data) {

//{"success":{"NuCnv":"1000999595","UbiDomMad":"250302","Sexo":"F","Peso":"2680","FecNac":"20151201","LugNac":"01","UbiNac":"250302","AtePor":"02","TipPar":"01","ConPar":"01","DurEmb":"39","Fin":"02"}}

            $scope.nino_ws = data.success;
            console.log($scope.nino_ws);
            var year = $scope.nino_ws.FecNac.substr(0,4);
            var month = $scope.nino_ws.FecNac.substr(4,2);
            var day = $scope.nino_ws.FecNac.substr(6,2);
            $scope.nino_ws.FecNac = year+"-"+month+"-"+day;
            //$scope.nino_ws.FecNac = day + "-"+month+"-"+year;
            console.log($scope.nino_ws);
            //$scope.getVacunas();
        }).error(function(data) { Materialize.toast('Error, ocurrio un problema consultando el webservice.', 3000);});
    };
  }])
  .controller('VacunarNinoController',['$scope', '$http', '$route', function ($scope, $http, $route) {
    $scope.nino = {tipo:3, numero:1000999595};
    $http.post ('api/getCentros.php').success(function(data) { $scope.Centros = data; });
    $scope.getVacunas=function() {
      $http({method:'POST',url: 'api/getVacunas.php', data: $.param({data:$scope.nino_ws}),headers : { 'Content-Type': 'application/x-www-form-urlencoded' }}).success(function(response) {
        $scope.vacunas = response;
      });
    };

    $scope.buscarNino = function(nino){
      $scope.ninoActual=nino["numero"];
      delete $scope.nino_error;
      delete $scope.nino_ws;
      $http.get('../api/wsByNumero.php?numero='+ nino.numero ).success(function(data) {
        if(data.success) {
            $scope.nino_ws = data.success;
            console.log($scope.nino_ws);
            var year = $scope.nino_ws.FecNac.substr(0,4);
            var month = $scope.nino_ws.FecNac.substr(4,2);
            var day = $scope.nino_ws.FecNac.substr(6,2);
            $scope.nino_ws.FecNac = year+"-"+month+"-"+day;
            $scope.getVacunas();
          } else { Materialize.toast(data.error, 4000); }
        });
    };

    $scope.realizarRegistro = function(nene){
      console.log(nene);
      $http({method:'POST',url: 'api/realizar-registro.php', data: $.param({data:nene}),headers : { 'Content-Type': 'application/x-www-form-urlencoded' }}).success(function(response) { });
    };

    $scope.crear_vacuna = function(dosis, vacuna){
      var d = new Date();
      $scope.nuevaVacuna ={};
      $('ul.tabs').tabs('select_tab', 'crear-vacuna');
      $scope.nuevaVacuna.dosis = dosis;
      $scope.nuevaVacuna.vacuna = vacuna;
      $scope.nuevaVacuna.dosis.fecha_vacunacion=d;
      $scope.nuevaVacuna.dosis.id_nino=$scope.nino_ws.NuCnv;
    };

    $scope.saveVacuna = function(){
      if($scope.nuevaVacuna.dosis.centro_salud){
        $http({method:'POST',url: 'api/crear_vacuna.php', data: $scope.nuevaVacuna.dosis, headers : { 'Content-Type': 'application/x-www-form-urlencoded' }}).success(function(response) {
          //
        });
        $scope.buscarNino($scope.nino);
        $('ul.tabs').tabs('select_tab', 'tabla-vacunacion');
      }else{Materialize.toast('Error, Ingrese el centro de salud.', 3000);}
    };
      $scope.mostraradicional = function(){
        var d = new Date();
        $scope.adicional={};
        $('ul.tabs').tabs('select_tab', 'info-adicional');
        $scope.adicional.id_nino=$scope.nino_ws.NuCnv;
        $scope.adicional.fecha_medicion = d;
    };
      $scope.cancel = function(){
      $('ul.tabs').tabs('select_tab', 'tabla-vacunacion');
    };
 $scope.verInfoAdicional = function(){
      $('ul.tabs').tabs('select_tab', 'ver-info-adicional');
       $('html,body').animate({
                scrollTop: $("#vistaInfo").offset().top
                }, 1000);
    $http.post ('../api/getInfoAdicional.php', { NuCnv: $scope.ninoActual })
          .success(function(data) {
                  $scope.InfoAdicional = data;
                  console.log(data);
              })
          .error(function(data) {
                  console.log('Error: ' + data);
          });

    };
      $scope.tablaVacunacion=function() {

   $('ul.tabs').tabs('select_tab', 'tabla-vacunacion');
     $('html,body').animate({
                scrollTop: $("#vistaInfo").offset().top
                }, 1000);
    };

      $scope.saveadicional = function(adicional) {
       $http.post('api/addAdicional.php', { datos:adicional } ).success(function(data) { $('ul.tabs').tabs('select_tab', 'tabla-vacunacion'); });
     };
  }])
  .controller('InfoAdicionalController',['$scope', '$route','$http', function($scope, $route, $http){  }])
  .controller('logoutController',['$scope', '$route','$http', function($scope, $route, $http) {$scope.salir = function(){ $http.post('api/logout.php').success(function(data) { }).error(function(data) { }); };  }]);

})();