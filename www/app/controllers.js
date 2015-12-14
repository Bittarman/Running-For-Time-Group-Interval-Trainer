app = angular.module('interval-timer', ['ngTouch']);
//db = window.sqlitePlugin.openDatabase({name: "RFT"});

app.filter('timeify', [function () {
    return function (seconds) {
        if (!seconds) {
            return new Date(1970, 0, 1);
        }
        return new Date(1970, 0, 1).setMilliseconds(seconds);
    };
}]);

app.controller('app', ['$scope', function ($scope) {
    $scope.editing = true;
    $scope.complete = false;

    $scope.groups = {
        "Group 1": [
            //{name: "Matt Warr", time: "00:00", splits: [], lastSplit: 0},
        ]
    };

    $scope.begin = function () {
        $scope.$broadcast('ready', 'ready');
        $scope.editing = false;
    };

    $scope.reset = function () {
        if (confirm ('Are you sure?')) {
            $scope.$broadcast('reset', 'reset');
            for (var i in $scope.groups) {
                delete $scope.groups[i];
            }
            $scope.groups = {};
            $scope.editing = true;
        }
    };

    $scope.finish = function () {
        $scope.$broadcast('complete', 'complete');
        $scope.complete = true;
    };

}]);

app.controller('group', ['$scope', '$timeout', function ($scope, $timeout) {
    $scope.editing = true;
    $scope.running = false;
    $scope.runTime = 0;
    $scope.startTime = 0;
    $scope.resting = false;
    $scope.newRunner = "";

    var interval = 50;

    $scope.$on ('complete', function() {
        if ($scope.running) {
            $scope.stop();
        }
        if ($scope.resting) {
            clearInterval($scope._$restInterval);

        }
        $scope.resting = false;

    });

    $scope.$on('ready', function () {
        $scope.editing = false;
    });

    $scope.$on('reset', function () {
        $scope.editing = true;
        $scope.running = false;
        $scope.runTime = 0;
        $scope.startTime = 0;
        $scope.resting = false;
        $scope.newRunner = "";
    });

    $scope.remove = function ($group) {
        if (confirm('Are you sure?')) {
            delete $scope.$parent.groups[$group];
        }
    };


    $scope.$on('runner-split', function () {
        var running = false;
        for (r in $scope.runners) {
            running = running || $scope.runners[r].running;
        }
        if (!running) {
            $scope.stop();
            $scope.rest();
        }
    });

    var now = function () {
        return (new Date()).getTime();
    };

    $scope.start = function () {
        $scope.editing = false;
        $scope.running = true;
        $scope.resting = false;
        $scope.startTime = now();
        $scope._$interval = setInterval(function () {
            $timeout(function () {
                $scope.runTime = $scope.elapsed();
            });
        }, interval);
        var start = now();
        for (var r in $scope.runners) {
            $scope.runners[r].splitStart = start;
            $scope.runners[r].running = true;
            $scope.$broadcast ('start');
        }
    };

    $scope.elapsed = function () {
        return (now() - $scope.startTime);
    };

    $scope.stop = function () {
        if ($scope._$interval) {
            clearInterval($scope._$interval);
            delete $scope._$interval;
        }
        $scope.running = false;
        $scope.runTime = $scope.elapsed();
    };

    $scope.rest = function () {
        $scope.restStartTime = now();
        $scope.resting = true;
        $scope._$restInterval = setInterval(function () {
            $timeout(function () {
                $scope.restTime = (now() - $scope.restStartTime);

            });
        }, interval);
    };


    $scope.edit = function () {
        $scope.editing = !$scope.editing;
    };

    $scope.AddRunner = function () {
        if ($scope.newRunner.length > 0) {
            $scope.runners.push ({name: $scope.newRunner, time: "00:00", splits: [], lastSplit: 0});
            $scope.newRunner = "";
        }
    };

}]);

app.controller('runner', ['$scope', '$timeout', function ($scope, $timeout) {
    $group = $scope.$parent;
    $scope.statusClass = 'bg-success';

    var now = function () {
        return (new Date()).getTime();
    };

    $scope.$on('complete', function () {
        $scope.statusClass = 'bg-success';
    });

    $scope.$on('start', function () {
        $scope.statusClass = 'bg-warning';
    });

    $scope.$on('reset', function () {
        $scope.statusClass = 'bg-success';
    });

    $scope.split = function () {
        if ($scope.runner.running) {
            var diff = (now() - $scope.runner.splitStart);
            $scope.runner.splits.push(diff);
            $scope.runner.lastSplit = diff;
            $scope.runner.running = false;
            $scope.statusClass = 'bg-success';
            $scope.$emit('runner-split');
        }
    };
}]);

app.controller('add-group', ['$scope', '$timeout', function ($scope, $timeout) {
    $scope.name = '';
    $scope.add = function () {
        if ($scope.name.length > 0) {
            $timeout(function () {
                $scope.$parent.groups[$scope.name] = [];
            });
        }
    };
}]);
