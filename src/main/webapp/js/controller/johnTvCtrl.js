angular.module("johnTv").controller("johnTvCtrl", function($scope, $http) {
      $scope.series = [];
      $scope.profile = [];
      $scope.watchList = [];
      $scope.search = [];
      $scope.logged = false;
      $scope.usuario;

        $scope.register = function() {
          let name = prompt("Name:", "Your Name")
          let emailR = prompt("Email:", "youremail@email.com");
          let password = prompt("Password:", "***********");
          let usuarioSigned = {"nome": name, "email": emailR, "senha": password};
          let promise = $http.post("/usuario/", usuarioSigned).then(function(response) {
            if (response.data === "") {
              alert("Email already signed up.");
            } else {
              $scope.usuario = response.data;
              $scope.logged = true;
            }
          }, function error (error) {
            console.log(error);
          });
        };

        $scope.login = function() {
          let emailLog = prompt("Email:", "email@email.com");
          let passwordLog = prompt("Password:", "***********");
          let usuarioLog = {nome: "", email: emailLog, senha: passwordLog};
          let promise = $http.post("/usuario/login/", usuarioLog).then(function(response) {
          $scope.usuario = response.data;
          $scope.logged = true;
          $scope.loadSeries();
          }, function error (error) {
            alert("Error");
            console.log(error);
          });
        };

        $scope.logout = function() {
          if (confirm("Do you really want to logout?")) {
            $scope.usuario = undefined;
            $scope.watchList = [];
            $scope.profile = [];
            $scope.series = [];
            $scope.logged = false;
          }
        };

        $scope.loadSeries = function () {
          console.log($scope.usuario.id);
          let promise = $http.get("/usuario/" + $scope.usuario.id + "/series/").then(function (response) {
            $scope.series = response.data;
            $scope.loadProfileAndWatchlist();
          }, function error (error) {
            console.log(error);
          });
        };

        $scope.loadProfileAndWatchlist = function() {
          for (let i = 0; i < $scope.series.length; i++) {
            if($scope.series[i].noPerfil === true) {
              $scope.loadProfile($scope.series[i]);
            } else {
              $scope.loadWatchlist($scope.series[i].imdbID);
            }
          }
        };

        $scope.loadProfile = function(serie) {
          let promise = $http.get("https://omdbapi.com/?i=" + serie.imdbID + "&plot=full&apikey=93330d3c").then(function(response) {
            serieLoad = response.data;
            serieLoad.myRate = serie.myRate;
            serieLoad.lastSeen = serie.lastSeen;
            $scope.profile.push(serieLoad);
          }).catch(function(error){
            console.log(error);
          });
        };

        $scope.loadWatchlist = function(imdbID) {
          let promise = $http.get("https://omdbapi.com/?i=" + imdbID + "&plot=full&apikey=93330d3c").then(function(response) {
            serieLoad = response.data;
            $scope.watchList.push(serieLoad);
          }).catch(function(error){
            console.log(error);
          });
        };

        $scope.addProfile = function(serie) {
          if($scope.logged === false) {
            alert("Log in to your account first!");
            return;
          }
          if ($scope.contains($scope.profile, serie)) {
            alert(serie.Title + " already in profile!")
          } else {
            let promise = $http.get("https://omdbapi.com/?i=" + serie.imdbID + "&plot=full&apikey=93330d3c").then(function(response) {
              serie = response.data;
              serie.myRate = "-"
              serie.lastSeen = "-"
              $scope.profile.push(serie);
              $scope.addToDataBase(serie, true);
            }).catch(function(error){
              console.log(error);
            });
          }
        };

        $scope.addWatchlist = function (serie) {
          if($scope.logged === false) {
            alert("Log in to your account first!");
            return;
          }
          if ($scope.contains($scope.watchList, serie)) {
            alert(serie.Title + " already in watchList!")
          } else if ($scope.contains($scope.profile, serie)) {
            alert(serie.Title + " already in profile!")
          } else {
            $scope.watchList.push(serie);
            $scope.addToDataBase(serie, false);
          }
        };

        $scope.addToDataBase = function (serie, noPerfil) {
          let serieAddPerfil = {"imdbID": serie.imdbID, "myRate": "-", "lastSeen": "-", "usuarioID": $scope.usuario.id, "noPerfil": noPerfil};
          let promise = $http.post("/serie/", serieAddPerfil).then(function(response) {
            $scope.series.push(response.data);
          }, function error (error) {
            console.log(error);
          });
        };

        $scope.removeProfile = function (serie) {
          if(confirm("Do you really want to remove " + '"' + serie.Title + '"' +" from your profile?") === true) {
            let index = $scope.profile.indexOf(serie);
            let id = $scope.getIdByImdbID(serie);
            $scope.removeFromDataBase(id);
            $scope.profile.splice(index, 1);
          }
        };

        $scope.removeFromDataBase = function(id) {
          let promise = $http.delete("/serie/" + id).then(function(response) {
            return response.data;
          }, function error (error) {
            console.log(error);
          });
        };

        $scope.getIdByImdbID = function(serie) {
          for(let i = 0; i < $scope.series.length; i++) {
            if ($scope.series[i].imdbID === serie.imdbID) {
              return $scope.series[i].id;
            }
          }
        };
         
	  	  $scope.searchSeries = function(serieName){
        	$http.get('https://omdbapi.com/?s=' + serieName +'&type=series&apikey=93330d3c')
        	.then(function (response) {
        			
        		if(response.data.Response == "False"){
        			let message = "Series not Found!";
          	 		alert(message);
        		}
           		$scope.search = response.data.Search;

           }

           )
        };

        $scope.contains = function (array, serie) {
        for (let i = 0; i < array.length; i++) {
          if(array[i].imdbID === serie.imdbID) {
            return true;
        }
         }
        return false;
       };

      $scope.getInfoForModal = function (serie){
       $scope.serieModal = angular.copy(serie);
     }
	 });