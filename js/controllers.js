var kspToolsControllers = angular.module('kspToolsControllers', []);

kspToolsControllers.controller('HeaderCtrl', function($scope, $location) {
    $scope.isActive = function(path) {
        return path === $location.path();
    };
});

kspToolsControllers.controller('OrbitDarknessTimeCtrl', function ($scope) {
    $scope.orbitingBody = 'kerbin';
    $scope.apoapsis = '';
    $scope.periapsis = '';
    $scope.timeDarknessManual = '';
    $scope.energyUse = '';
    $scope.apoapsisUnits = 'km';
    $scope.periapsisUnits = 'km';
    $scope.errors = {};

    $scope.calculateDarknessTime = function() {
        if (!validateDarknessTime()) {
            $scope.timeDarkness = 0;
            return;
        }

        var body = bodies[$scope.orbitingBody],
            ap = convertAltitude($scope.apoapsis, $scope.apoapsisUnits, 'm'),
            pe = convertAltitude($scope.periapsis, $scope.periapsisUnits, 'm'),
            orbit = new Orbit(body, ap, pe);

        $scope.timeDarkness = Math.round(orbit.darknessTime);
        $scope.timeDarknessManual = $scope.timeDarkness;
    };

    $scope.calculateEnergyStorage = function() {
        if (!validateEnergyStorage()) {
            $scope.energyStorage = 0;
            return;
        }

        var energyUse = parseFloat($scope.energyUse),
            timeDarknessManual = parseFloat($scope.timeDarknessManual);

        $scope.energyStorage = Math.round(energyUse * timeDarknessManual);
    };

    function validateEnergyStorage() {
        var valid = true;
        if ($scope.energyUse === "") {
            $scope.errors.energyUse = "Please enter the amount of energy used per second.";
            valid = false;
        } else if (!isPositiveNumber($scope.energyUse)) {
            $scope.errors.energyUse = "Please enter a valid number greater than or equal to 0.";
            valid = false;
        } else {
            $scope.errors.energyUse = "";
        }

        if ($scope.timeDarknessManual === "") {
            $scope.errors.timeDarknessManual = "Please enter the nuumber of seconds spent in darkness.";
            valid = false;
        } else if (!isPositiveNumber($scope.timeDarknessManual)) {
            $scope.errors.timeDarknessManual = "Please enter a valid number greater than or equal to 0.";
            valid = false;
        } else {
            $scope.errors.timeDarknessManual = "";
        }

        return valid;
    }

    function validateDarknessTime() {
        var valid = true;
        if ($scope.apoapsis === "") {
            $scope.errors.apoapsis = "Please enter an apoapsis.";
            valid = false;
        } else if (!isPositiveNumber($scope.apoapsis)) {
            $scope.errors.apoapsis = "Please enter a valid number greater than or equal to 0.";
            valid = false;
        } else {
            $scope.errors.apoapsis = "";
        }

        if ($scope.periapsis === "") {
            $scope.errors.periapsis = "Please enter a periapsis.";
            valid = false;
        } else if (!isPositiveNumber($scope.periapsis)) {
            $scope.errors.periapsis = "Please enter a valid number greater than or equal to 0.";
            valid = false;
        } else {
            $scope.errors.periapsis = "";
        }

        if (valid) {
            var pe = convertAltitude($scope.periapsis, $scope.periapsisUnits, 'm'),
                ap = convertAltitude($scope.apoapsis, $scope.apoapsisUnits, 'm');

            if (pe > ap) { 
                $scope.errors.periapsis = "Please enter a periapsis that is less than or equal to the apoapsis.";
                valid = false;
            }
        }

        return valid;
    }
});

kspToolsControllers.controller('OrbitInfoCtrl', function ($scope) {
    $scope.orbitingBody = 'kerbin';
    $scope.mode = 'ap+pe';
    $scope.apoapsis = '';
    $scope.periapsis = '';
    $scope.apoapsisUnits = 'km';
    $scope.periapsisUnits = 'km';
    $scope.period = '';
    $scope.semiMajorAxis = '';
    $scope.semiMinorAxis = '';
    $scope.eccentricity = '';
    $scope.apoapsisVelocity = '';
    $scope.periapsisVelocity = '';
    $scope.apoapsisCalc = '';
    $scope.periapsisCalc = '';
    $scope.periodCalc = '';
    $scope.periodHumanized = '';
    $scope.errors = {};

    $scope.calculate = function() {
        if (!validate()) {
            $scope.timeDarkness = 0;
            return;
        }

        var body = bodies[$scope.orbitingBody], orbit, ap, pe, period;

        if ($scope.mode === 'ap+pe') {
            ap = convertAltitude($scope.apoapsis, $scope.apoapsisUnits, 'm');
            pe = convertAltitude($scope.periapsis, $scope.periapsisUnits, 'm');
            orbit = new Orbit(body, ap, pe);
        } else if ($scope.mode === 'ap+period') {
            ap = convertAltitude($scope.apoapsis, $scope.apoapsisUnits, 'm');
            period = parseFloat($scope.period);
            orbit = Orbit.fromApAndPeriod(body, ap, $scope.period);
        } else if ($scope.mode === 'pe+period') {
            pe = convertAltitude($scope.periapsis, $scope.periapsisUnits, 'm');
            period = parseFloat($scope.period);
            orbit = Orbit.fromPeAndPeriod(body, pe, $scope.period);
        }

        if ($scope.mode === 'pe+period') {
            $scope.apoapsisCalc = Math.round(convertAltitude(orbit.apoapsis, 'm', $scope.periapsisUnits) * 1000) / 1000;
        } else {
            $scope.apoapsisCalc = '';
        }

        if ($scope.mode === 'ap+period') {
            $scope.periapsisCalc = Math.round(convertAltitude(orbit.periapsis, 'm', $scope.apoapsisUnits) * 1000) / 1000;
        } else {
            $scope.periapsisCalc = '';
        }
        $scope.semiMajorAxis = Math.round(orbit.semiMajorAxis);
        $scope.semiMinorAxis = Math.round(orbit.semiMinorAxis);
        $scope.eccentricity = Math.round(orbit.eccentricity * 1000) / 1000;
        $scope.apoapsisVelocity = Math.round(orbit.apoapsisVelocity * 10) / 10;
        $scope.periapsisVelocity = Math.round(orbit.periapsisVelocity * 10) / 10;
        if ($scope.mode === 'ap+pe') {
            $scope.periodCalc = Math.round(orbit.period * 1000) / 1000;
            $scope.periodHumanized = humanizeSeconds(orbit.period);
        } else {
            $scope.periodCalc = '';
            $scope.periodHumanized = '';
        }
    };

    $scope.reset = function () {
        $scope.semiMajorAxis = '';
        $scope.semiMinorAxis = '';
        $scope.eccentricity = '';
        $scope.apoapsisVelocity = '';
        $scope.periapsisVelocity = '';
        $scope.apoapsisCalc = '';
        $scope.periapsisCalc = '';
        $scope.periodCalc = '';
        $scope.periodHumanized = '';
    };

    function validate() {
        var valid = true;
        if ($scope.mode === "ap+pe" || $scope.mode === "ap+period") {
            if ($scope.apoapsis === "") {
                $scope.errors.apoapsis = "Please enter an apoapsis.";
                valid = false;
            } else if (!isPositiveNumber($scope.apoapsis)) {
                $scope.errors.apoapsis = "Please enter a valid number greater than or equal to 0.";
                valid = false;
            } else {
                $scope.errors.apoapsis = "";
            }
        }

        if ($scope.mode === "ap+pe" || $scope.mode === "pe+period") {
            if ($scope.periapsis === "") {
                $scope.errors.periapsis = "Please enter a periapsis.";
                valid = false;
            } else if (!isPositiveNumber($scope.periapsis)) {
                $scope.errors.periapsis = "Please enter a valid number greater than or equal to 0.";
                valid = false;
            } else {
                $scope.errors.periapsis = "";
            }
        }

        if ($scope.mode === "ap+pe" && valid) {
            var pe = convertAltitude($scope.periapsis, $scope.periapsisUnits, 'm'),
                ap = convertAltitude($scope.apoapsis, $scope.apoapsisUnits, 'm');

            if (pe > ap) { 
                $scope.errors.periapsis = "Please enter a periapsis that is less than or equal to the apoapsis.";
                valid = false;
            }
        }

        if ($scope.mode === "pe+period" || $scope.mode === "ap+period") {
            if ($scope.period === "") {
                $scope.errors.period = "Please enter an orbital period.";
                valid = false;
            } else if (!isPositiveNumber($scope.period)) {
                $scope.errors.period = "Please enter a valid number greater than or equal to 0.";
                valid = false;
            } else {
                $scope.errors.period = "";
            }
        }

        return valid;
    }
});

kspToolsControllers.controller('SatelliteCtrl', function ($scope) {
    $scope.orbitingBody = 'kerbin';
    $scope.apoapsis = '';
    $scope.periapsis = '';
    $scope.apoapsisUnits = 'km';
    $scope.periapsisUnits = 'km';
    $scope.satellites = '';
    $scope.periapsisCalc = '';
    $scope.periodCalc = '';
    $scope.periodHumanized = '';
    $scope.errors = {};

    $scope.calculate = function() {
        if (!validate()) {
            return;
        }

        var body = bodies[$scope.orbitingBody],
            ap = convertAltitude($scope.apoapsis, $scope.apoapsisUnits, 'm'),
            pe = convertAltitude($scope.periapsis, $scope.periapsisUnits, 'm'),
            orbit = new Orbit(body, ap, pe),
            desiredPeriod = (orbit.period * ($scope.satellites - 1)) / $scope.satellites,
            parkingOrbit = Orbit.fromApAndPeriod(body, ap, desiredPeriod);

        console.log(parkingOrbit);
        console.log(desiredPeriod);

        $scope.periapsisCalc = Math.round(convertAltitude(parkingOrbit.periapsis, 'm', $scope.apoapsisUnits) * 1000) / 1000;
        $scope.periodCalc = Math.round(parkingOrbit.period * 1000) / 1000;
        $scope.periodHumanized = humanizeSeconds(parkingOrbit.period);
    };

    function validate() {
        var valid = true;
        if ($scope.apoapsis === "") {
            $scope.errors.apoapsis = "Please enter an apoapsis.";
            valid = false;
        } else if (!isPositiveNumber($scope.apoapsis)) {
            $scope.errors.apoapsis = "Please enter a valid number greater than or equal to 0.";
            valid = false;
        } else {
            $scope.errors.apoapsis = "";
        }

        if ($scope.periapsis === "") {
            $scope.errors.periapsis = "Please enter a periapsis.";
            valid = false;
        } else if (!isPositiveNumber($scope.periapsis)) {
            $scope.errors.periapsis = "Please enter a valid number greater than or equal to 0.";
            valid = false;
        } else {
            $scope.errors.periapsis = "";
        }

        if ($scope.satellites === "") {
            $scope.errors.satellites = "Please enter the number of satellites.";
            valid = false;
        } else if (!isPositiveNumber($scope.satellites) || $scope.satellites < 1) {
            $scope.errors.satellites = "Please enter a valid number greater than or equal to 1.";
            valid = false;
        } else {
            $scope.errors.satellites = "";
        }

        if (valid) {
            var pe = convertAltitude($scope.periapsis, $scope.periapsisUnits, 'm'),
                ap = convertAltitude($scope.apoapsis, $scope.apoapsisUnits, 'm');

            if (pe > ap) { 
                $scope.errors.periapsis = "Please enter a periapsis that is less than or equal to the apoapsis.";
                valid = false;
            }
        }

        return valid;
    }
});

kspToolsControllers.controller('LifeSupportCtrl', function ($scope) {
    var configs = {
        "stock" : {
            foodConsumptionRate : 1.6927083333e-05,
            waterConsumptionRate : 1.1188078704e-05,
            oxygenConsumptionRate : 0.001713537562385,
            co2ProductionRate : 0.00148012889876,
            wasteProductionRate : 1.539351852e-06,
            wasteWaterProductionRate : 1.4247685185e-05,
            baseEnergyConsumption : 0.02125,
            energyConsumptionPerCrew : 0.014166666666667
        },
        "realism-overhaul" : {
            foodConsumptionRate : 3.47222E-05,
            waterConsumptionRate : 1.96759E-05,
            oxygenConsumptionRate : 0.00729167,
            co2ProductionRate : 0.00625,
            wasteProductionRate : 1.73611E-05,
            wasteWaterProductionRate : 3.125E-05,
            baseEnergyConsumption : 0.2,
            energyConsumptionPerCrew : 0.05
        }
    };

    $scope.config = 'stock';
    $scope.durationDays = 0;
    $scope.durationHours = 0;
    $scope.durationMinutes = 0;
    $scope.durationSeconds = 0;
    $scope.crewCount = 1;
    $scope.food = '';
    $scope.water = '';
    $scope.oxygen = '';
    $scope.waste = '';
    $scope.wasteWater = '';
    $scope.co2 = '';
    $scope.energy = '';

    $scope.calculate = function() {
        var config = configs[$scope.config],
            duration = (parseFloat($scope.durationDays) * 21600) + (parseFloat($scope.durationHours) * 3600) +
                       (parseFloat($scope.durationMinutes) * 60) + parseFloat($scope.durationSeconds),
            exactEnergy = config.baseEnergyConsumption + (config.energyConsumptionPerCrew * $scope.crewCount);

        $scope.food = Math.round(config.foodConsumptionRate * duration * $scope.crewCount * 1000) / 1000;
        $scope.water = Math.round(config.waterConsumptionRate * duration * $scope.crewCount * 1000) / 1000;
        $scope.oxygen = Math.round(config.oxygenConsumptionRate * duration * $scope.crewCount * 10) / 10;
        $scope.waste = Math.round(config.wasteProductionRate * duration * $scope.crewCount * 1000) / 1000;
        $scope.wasteWater = Math.round(config.wasteWaterProductionRate * duration * $scope.crewCount * 1000) / 1000;
        $scope.co2 = Math.round(config.co2ProductionRate * duration * $scope.crewCount * 10) / 10;
        $scope.energy = Math.round(exactEnergy * 100) / 100;
        $scope.totalEnergy = Math.round(exactEnergy * duration);
    };

    function validate() {
        if ($scope.crewCount === "") {
            $scope.errors.crewCount = "Please enter an crew count.";
            valid = false;
        } else if (!isPositiveNumber($scope.crewCount) || $scope.crewCount < 1) {
            $scope.errors.crewCount = "Please enter a valid number greater than or equal to 1.";
            valid = false;
        } else {
            $scope.errors.crewCount = "";
        }

        $scope.errors.duration = [];
        if (!isPositiveNumber($scope.durationDays)) {
            $scope.errors.duration.push("Please enter days component greater than or equal to 0.");
            valid = false;
        }

        if (!isPositiveNumber($scope.durationHours)) {
            $scope.errors.duration.push("Please enter hours component greater than or equal to 0.");
            valid = false;
        }

        if (!isPositiveNumber($scope.durationMinutes)) {
            $scope.errors.duration.push("Please enter minutes component greater than or equal to 0.");
            valid = false;
        }

        if (!isPositiveNumber($scope.durationSeconds)) {
            $scope.errors.duration.push("Please enter seconds component greater than or equal to 0.");
            valid = false;
        }

        if (!$scope.errors.duration && $scope.durationDays === '0' && $scope.durationHours === '0' 
            && $scope.durationMinutes === '0' && $scope.durationSeconds === '0') {
            $scope.errors.duration.push("Please enter a duration greater then 0.");
            valid = false;
        }

        return $valid;
    }
});

function humanizeSeconds(seconds) {
    var days = 0,
        hours = 0,
        minutes = 0;

    if (seconds > 60) {
        minutes = Math.floor(seconds / 60);
        seconds = Math.round((seconds % 60) * 1000) / 1000;
    }

    if (minutes > 60) {
        hours = Math.floor(minutes / 60);
        minutes = minutes % 60;
    }

    // todo - custom day length
    if (hours > 6) {
        days = Math.floor(hours / 6);
        hours = hours % 6;
    }

    var humanizedText = seconds + "s";
    if (minutes > 0 || hours > 0 || days > 0) {
        humanizedText = minutes + "m " + humanizedText;
    }

    if (hours > 0 || days > 0) {
        humanizedText = hours + "h " + humanizedText;
    }

    if (days > 0 ){
        humanizedText = days + "d " + humanizedText;
    }

    return humanizedText;
}