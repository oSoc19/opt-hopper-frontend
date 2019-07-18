
const availableProfiles = ["default", "bike", "ebike", "speedy"];

var profileConfigs = {
    "default": {
        backendName: "pedestrian",
        routingProfile: "&walksGeneratorDescription=crowsflight%26maxDistance%3D20000%26speed%3D1.4",
        routecolor: {
            backend: true,
            color: "#5a0449"
        }
    },
    "bike": {
        backendName: "bicycle",
        routingProfile: "&inBetweenOsmProfile=crowsflight&" +
            "inBetweenSearchDistance=500&" +
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
        routingProfile: "&inBetweenOsmProfile=crowsflight&" +
            "inBetweenSearchDistance=500&" +
            "firstMileOsmProfile=pedestrian&" +
            "firstMileSearchDistance=50000&" +
            "lastMileOsmProfile=pedestrian&" +
            "lastMileSearchDistance=10000",
        routecolor: {
            backend: true,
            color: "#6c6615"
        }
    }
};

let selectedProfile = "ebike";


function calculateAllRoutes(){
    //TODO: Show loading icon

    receivedItineraries = {};
    clearAllItineraries();
    clearRoutes();
    //TODO: Remove routes from map

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

        // const host = `https://routing.anyways.eu/transitapi`; /*/
        const host = `http://localhost:5000`; //*/
        const url = host+ `/journey?from=https%3A%2F%2Fwww.openstreetmap.org%2F%23map%3D19%2F${originS}&to=https%3A%2F%2Fwww.openstreetmap.org%2F%23map%3D19%2F${destinationS}${dateParam}${routingProfile}`;

        $.ajax({
            url: url,
            success: function (data) {
                //console.log(data);
                //console.log(profile);
                receivedItineraries[profile] = {};
                receivedItineraries[profile].data = data;
                receivedItineraries[profile].from = inputData.fromName;
                receivedItineraries[profile].to = inputData.toName;
                if(data.journeys) {
                    displayRoute(profile, profile === selectedProfile, data.journeys[0]);
                    fillItinerary(profile, profile === selectedProfile, inputData.fromName, inputData.toName, data.journeys[0]);
                } else {
                    console.warn("Got journeys: null from Itinero with profile", profile);
                }
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
    clearRoutes();
}
