(function(){
  'use strict';

  angular
    .module('app', [])
})();

(function(){
  'use strict';

  angular
    .module('app')
    .controller('scheduleCtrl', ['$scope', '$interval', 'FB', scheduleCtrl]);

  function scheduleCtrl($scope, $interval, FB) {
    $scope.records = [];
    $scope.announcement = "Loading...";

    var update = function() {
      FB.all('/event')
        .then(function(response) {
          var upcoming = [];
          var events = response.val();
          var curTime = new Date();
          for(var i = 0; i < events.length; i++) {
            var eventStartTime = new Date(events[i].startTime);
            var eventEndTime = new Date(events[i].endTime);

            events[i].ongoing = eventStartTime <= curTime && curTime < eventEndTime;

            if(curTime < eventEndTime) {
              upcoming.push(events[i]);
            }

          }

          $scope.$apply(function() {
            $scope.records = upcoming;
          });
        });

      FB.all('/announcement')
        .then(function(response) {
          var announcement = response.val();
          var ticker = announcement[0].content;

          for(var i = 1; i < announcement.length; i++) {
            ticker = ticker + " | " + announcement[i].content;
          }

          $scope.$apply(function() {
            $scope.announcement = ticker;
          });

          angular.element(document.querySelector('#ticker')).attr('data-marquee', ticker);
        });
    };

    update();

    $interval(update, 10000);
  };

})();


(function(){
  'use strict';

  angular
    .module('app')
    .controller('hardwareCtrl', ['$scope', '$interval', '$timeout', 'FB', hardwareCtrl]);

  function hardwareCtrl($scope, $interval, $timeout, FB) {
    $scope.hardware = [];
    $scope.order = {"hardware": {}};

    var update = function() {
      FB.all('/hardware')
        .then(function(response) {
          var hardware = response.val();
          $scope.$apply(function() {
            $scope.hardware = hardware;
          });
        });
    };

    update();
    $interval(update, 10000);

    var verifyOrder = function(order) {
      return (order["name"] !== undefined)
             && (order["university"] !== undefined)
             && (order["email"] !== undefined)
             && (order["id"] !== undefined)
             && (order["phone"] !== undefined)
             && (!angular.equals(order["hardware"], {}));
    }

    $scope.addItem = function(hardware) {
      var item = hardware.title;
      if($scope.order["hardware"][item] === undefined) {
        $scope.order["hardware"][item] = 0;
      }

      if($scope.order["hardware"][item] < hardware.remaining) {
        $scope.order["hardware"][item]++;
      }
    }

    $scope.removeItem = function(hardware) {
      var item = hardware.title;
      if($scope.order["hardware"][item] !== undefined && $scope.order["hardware"][item] > 0) {
        $scope.order["hardware"][item]--;
      }
    }

   $scope.completeOrder = function() {
     $('#orderFailure').hide();
     $('#orderSuccess').hide();

     if(verifyOrder($scope.order)) {
       $scope.order["timestamp"] = (new Date()).toString();
       FB.write('/bookings/', $scope.order);
       $('#orderSuccess').show();
       $timeout(function(){
         window.location.reload()
       }, 2500);
     } else {
       console.log($scope.order);
       $('#orderFailure').show();
     }
   }
  };

})();

(function(){
  'use strict';
  angular
    .module('app')
    .filter('startFrom', function() {
      return function(input, start) {
        if(input) {
          start = +start;
          return input.slice(start);
        }
        return [];
      }
    });
})();

(function() {
  'use strict';
  angular
    .module('app')
    .factory('FB', FB);

  function FB() {
      // Initialize Firebase
      var config = {
        apiKey: "AIzaSyB67ma05nNyNTfhsXS0FsKuKroMi5MiE68",
        authDomain: "ichack17-508ac.firebaseapp.com",
        databaseURL: "https://ichack17-508ac.firebaseio.com",
        storageBucket: "ichack17-508ac.appspot.com",
        messagingSenderId: "207461313223"
      };

      firebase.initializeApp(config);
      var database = firebase.database();

      var factory = {
            all     : all,
            write   : write,
          };

      return factory;

      function all(endPoint) {
        return database.ref(endPoint).once('value')
      }

      function write(endPoint, object) {
        firebase.database().ref(endPoint + object.name).set(object);
      }
    };
})();
