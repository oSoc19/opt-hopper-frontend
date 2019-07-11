
const availableProfiles = ["bike", "ebike"/*, "speedy"*/];

var profileConfigs = {
    "pedestrian": {
        backendName: "pedestrian",
        routingProfile: "",
        routecolor: {
            backend: true,
            color: "#5a0449"
        }
    },
    "bike": {
        backendName: "bicycle",
        routingProfile: "",
        routecolor: {
            backend: true,
            color: "#315a33"
        }
    },
    "ebike": {
        backendName: "ebike",
        routingProfile: "&inBetweenOsmProfile=pedestrian&" +
            "inBetweenSearchDistance=500&" +
            "firstMileOsmProfile=ebike&" +
            "firstMileSearchDistance=30000&" +
            "lastMileOsmProfile=pedestrian&" +
            "lastMileSearchDistance=10000",
        routecolor: {
            backend: true,
            color: "#2D495A"
        }
    },
    "speedy": {
        backendName: "speedPedelec",
        routingProfile: "",
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
        const dateParam = (isDeparture ? "&departure=" : "&arrival=") + encodeURIComponent(new Date(inputData.date).toISOString());
        // get the routing profile.
        const profile = availableProfiles[key];
        const routingProfile = profileConfigs[profile].routingProfile;

        const url = `https://routing.anyways.eu/transitapi/journey?from=https%3A%2F%2Fwww.openstreetmap.org%2F%23map%3D19%2F${originS}&to=https%3A%2F%2Fwww.openstreetmap.org%2F%23map%3D19%2F${destinationS}${dateParam}${routingProfile}`;

        $.ajax({
            url: url,
            success: function (data) {
                console.log(data);
                displayRoute(profile, profile === selectedProfile, data.journeys[0]);
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