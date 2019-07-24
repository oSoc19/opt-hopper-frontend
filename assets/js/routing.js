const availableProfiles = ["default", "bike", "ebike", /*"speedy"*/, "pedestrian"];

var profileConfigs = {
    "default": {
        backendName: "pedestrian",
        routingProfile: "&walksGeneratorDescription=crowsflight%26maxDistance%3D15000%26speed%3D1.4",
        routecolor: {
            backend: true,
            color: "#5a0449"
        }
    },
    "bike": {
        backendName: "bicycle",
        routingProfile: "&inBetweenOsmProfile=crowsflight&" +
            "inBetweenSearchDistance=0&" +
            "firstMileOsmProfile=bicycle&" +
            "firstMileSearchDistance=10000&" +
            "lastMileOsmProfile=pedestrian&" +
            "lastMileSearchDistance=10000",
        routecolor: {
            backend: true,
            color: "#315a33"
        }
    },
    "ebike": {
        backendName: "ebike",
        routingProfile: "&inBetweenOsmProfile=crowsflight&" +
            "inBetweenSearchDistance=0&" +
            "firstMileOsmProfile=ebike&" +
            "firstMileSearchDistance=20000&" +
            "lastMileOsmProfile=pedestrian&" +
            "lastMileSearchDistance=10000",
        routecolor: {
            backend: true,
            color: "#2D495A"
        }
    },
    "speedy": {
        backendName: "speedPedelec",
        routingProfile: "&inBetweenOsmProfile=crowsflight&" +
            "inBetweenSearchDistance=0&" +
            "firstMileOsmProfile=speedPedelec&" +
            "firstMileSearchDistance=20000&" +
            "lastMileOsmProfile=pedestrian&" +
            "lastMileSearchDistance=10000",
        routecolor: {
            backend: true,
            color: "#6c6615"
        }
    },
    "pedestrian": {
        backendName: "pedestrian",
        routingProfile: "&inBetweenOsmProfile=crowsflight&" +
            "inBetweenSearchDistance=0&" +
            "firstMileOsmProfile=pedestrian&" +
            "firstMileSearchDistance=5000&" +
            "lastMileOsmProfile=pedestrian&" +
            "lastMileSearchDistance=10000",
        routecolor: {
            backend: true,
            color: "#315a33"
        }
    }
};

let selectedProfile = "ebike";


/**
 * calculate all the routes and fill the inineraries 
 */
function calculateAllRoutes() {
    //TODO: Show loading icon

    receivedItineraries = {};
    clearAllItineraries();
    clearRoutes();
    //TODO: Remove routes from map
    clearStations()

    $(".loaderContainer").show();
    $(".errorContainer").hide();

    let isDeparture = true;
    let inputData = getInputFromCard();
    if (!inputData.from || !inputData.to) {
        console.warn("Trying to calculate routes while departure or arrival are not set");
        return;
    }
    const originS = swapArrayValues(inputData.from).join("%2F");
    const destinationS = swapArrayValues(inputData.to).join("%2F");

    for (let key in availableProfiles) {
        const dateParam = (isDeparture ? "&departure=" : "&arrival=") + encodeURIComponent(new Date(inputData.date).toISOString());
        // get the routing profile.
        const profile = availableProfiles[key];
        const routingProfile = profileConfigs[profile].routingProfile;

        //*
        const url = `https://routing.anyways.eu/transitapi/journey?from=https%3A%2F%2Fwww.openstreetmap.org%2F%23map%3D19%2F${originS}&to=https%3A%2F%2Fwww.openstreetmap.org%2F%23map%3D19%2F${destinationS}${dateParam}${routingProfile}&multipleOptions=true`;
        /*/
        const url = `http://localhost:5000/journey?from=https%3A%2F%2Fwww.openstreetmap.org%2F%23map%3D19%2F${originS}&to=https%3A%2F%2Fwww.openstreetmap.org%2F%23map%3D19%2F${destinationS}${dateParam}${routingProfile}&multipleOptions=true`;
        //*/

        $.ajax({
            url: url,
            success: function (data) {
                receivedItineraries[profile] = {};
                receivedItineraries[profile].data = data;
                receivedItineraries[profile].from = inputData.fromName;
                receivedItineraries[profile].to = inputData.toName;
                receivedItineraries[profile].journey = filterItineraries(data.journeys);

                if (data.journeys && receivedItineraries[profile].journey) {
                    getStations(receivedItineraries[profile].journey);
                    displayRoute(profile, profile === selectedProfile, receivedItineraries[profile].journey);
                    fillItinerary(profile, profile === selectedProfile, inputData.fromName, inputData.toName, receivedItineraries[profile].journey);
                } else {
                    console.warn("Got journeys: null from Itinero with profile", profile);
                    $(`.tab[profile=${profile}] .loaderContainer`).hide();
                    $(`.tab[profile=${profile}] .errorContainer`).show();
                }
            },
            error: function (error) {
                console.error("Routing request failed.", error);
                $(`.tab[profile=${profile}] .loaderContainer`).hide();
                $(`.tab[profile=${profile}] .errorContainer`).show();
            }
        });
    }

    $(".inputCard").addClass("mobileHidden");
    $(".tabsContainer, .detailViewContainer").removeClass("mobileHidden");
    $("#clearRouteButton").removeClass("mobileHidden");
}

/**
 * change the visibilty of certen elements and execute clearRoutes()
 */
function clearRoute() {
    $(".inputCard").removeClass("mobileHidden");
    $(".tabsContainer, .detailViewContainer").addClass("mobileHidden");
    $("#clearRouteButton").addClass("mobileHidden");
    $(".loaderContainer").hide();
    $(".errorContainer").hide();
    clearRoutes();
}

/**
 * filter the multiple journeys we get back from Itinero to the best journey
 * @param  {journeys} journeys the journey you want to filter
 */
function filterItineraries(journeys) {
    if (!journeys) {
        return null;
    }
    let smallestScore = Number.MAX_VALUE;
    let smallestJourney = null;

    for (key in journeys) {
        let score = journeys[key].travelTime * journeys[key].vehiclesTaken / (journeys[key].vehiclesTaken + 1);
        if (score < smallestScore) {
            smallestScore = score;
            smallestJourney = journeys[key];
        }
    }

    return smallestJourney;
}