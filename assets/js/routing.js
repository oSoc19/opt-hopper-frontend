
const availableProfiles = [/*"bike",*/ "ebike"/*, "speedy"*/];

var profileConfigs = {
    "pedestrian": {
        backendName: "pedestrian",
        routecolor: {
            backend: true,
            color: "#5a0449"
        }
    },
    "bike": {
        backendName: "bicycle",
        routecolor: {
            backend: true,
            color: "#315a33"
        }
    },
    "ebike": {
        backendName: "ebike",
        routecolor: {
            backend: true,
            color: "#2D495A"
        }
    },
    "speedy": {
        backendName: "speedPedelec",
        routecolor: {
            backend: true,
            color: "#6c6615"
        }
    }
};

let selectedProfile = "ebike";


function calculateAllRoutes(){
    //TODO: Show loading icon

    let isDeparture = true;
    let inputData = getInputFromCard();
    const originS = swapArrayValues(inputData.from).join("%2F");
    const destinationS = swapArrayValues(inputData.to).join("%2F");
    console.log(inputData);

    for(let key in availableProfiles) {
        // get the routing profile.
        var profileConfig = profileConfigs[availableProfiles[key]];
        let profile_url = profileConfig.backendName;
        const prof = (profile_url === "" ? "" : `&profile=${profile_url}`);
        const dateParam = (isDeparture ? "&departure=" : "&arrival=") + encodeURIComponent(new Date(inputData.date).toISOString());
        //const routingProfile = '&walksGeneratorDescription=' + encodeURIComponent('firstLastMile&default=osm&maxDistance=1000&profile=pedestrian&firstMile=osm&maxDistance=1000&profile=pedestrian&lastMile=osm&maxDistance=1000&profile=pedestrian');
        //const routingProfile = '&walksGeneratorDescription=' + encodeURIComponent('osm&maxDistance=500&profile=pedestrian');
        const routingProfile = "&inBetweenOsmProfile=pedestrian&" +
            "inBetweenSearchDistance=500&" +
            "firstMileOsmProfile=ebike&" +
            "firstMileSearchDistance=30000&" +
            "lastMileOsmProfile=pedestrian&" +
            "lastMileSearchDistance=10000";

        const url = `https://routing.anyways.eu/transitapi/journey?from=https%3A%2F%2Fwww.openstreetmap.org%2F%23map%3D19%2F${originS}&to=https%3A%2F%2Fwww.openstreetmap.org%2F%23map%3D19%2F${destinationS}${dateParam}${routingProfile}`;//${prof}`;
        const profile = availableProfiles[key];

        $.ajax({
            url: url,
            success: function (data) {
                console.log(data);
                displayRoute(profile, true, data.journeys[0]);
                fillItinerary(profile, inputData.fromName, inputData.toName, data.journeys[0]);
            },
            error: function (error) {
                console.error("Routing request failed.", error);
            }
        });
    }

    //TODO: hide loading icon
    $(".inputCard").hide();
    $(".tabsContainer, .detailViewContainer").show();
}

function clearRoute(){
    $(".inputCard").show();
    $(".tabsContainer, .detailViewContainer").hide();
}