let receivedItineraries = {};

function activateProfile(profile){
    if(!profile){
        console.error("No valid profile given");
        return;
    }
    if(!receivedItineraries[profile]){
        console.warn("No itinerary for this profile available yet.");
        return;
    }
    if(!receivedItineraries[profile].data || !receivedItineraries[profile].data.journeys[0]){
        console.error("We received an itinerary for this profile, but it doesn't make sense. Sorry.");
        return;
    }
    fillItinerary(profile, true, receivedItineraries[profile].from, receivedItineraries[profile].to, receivedItineraries[profile].data.journeys[0]);
    //TODO: fix map view
}

function fillItinerary(profile, selected, departure, arrival, journey) {

    let minutes = journey.travelTime / 60;
    let hours = Math.floor(minutes / 60);
    minutes = Math.round(minutes - (hours * 60));
    $(".travelTime-" + profile).html( (hours > 0 ? hours + "h " : "") + minutes + "min" );

    if(selected) {
        $(".detailViewSummaryTotalTime").html( (hours > 0 ? hours + "h " : "") + minutes + "min" );
        $(".detailViewSummaryTrains").html(journey.vehiclesTaken);

        //departure
        $(".itineraryStartField").html(departure);

        //segments
        let itineraryConainer = $(".itineraryContentContainer");
        itineraryConainer.html("");
        for (let i = 0; i < journey.segments.length; i++) {
            let depDate = new Date(journey.segments[i].departure.time);
            let arrDate = new Date(journey.segments[i].arrival.time);
            //let seconds = ((arrDate - depDate) / 1000) % 60;
            let minutes = ((arrDate - depDate) / 1000) / 60;
            let hours = Math.floor(minutes / 60);
            minutes = Math.round(minutes - (hours * 60));

            //console.log(hours, ":", minutes);

            let vehicle = journey.segments[i].vehicle;
            if (vehicle && vehicle.indexOf("irail") >= 0) {
                vehicle = "TRAIN";
            } else if (!vehicle) {
                vehicle = "WALK";
            }
            if (i === 0) {
                $(".detailViewSummaryTotalCyclingTime").html((hours > 0 ? `${hours}h ` : "") + `${minutes}min`);
            }

            itineraryConainer.append(`<div class="itineraryVehicle">${vehicle} ` + (hours > 0 ? `${hours}h ` : "") + `${minutes}min</div>`);
            if (i < journey.segments.length - 1) {
                itineraryConainer.append(
                    `<div class="itineraryStop">
                    <svg height="24" width="24">
                      <circle cx="12" cy="12" r="10" stroke="blue" stroke-width="3" fill="blue" />
                    </svg>
                    ${journey.segments[i].arrival.location.name}
                </div>`
                );
            }

        }

        //arrival
        $(".itineraryFinishField").html(arrival);
    }
}

/*fillItinerary("Bosa", "Stationsplein Aalst",
    {
        "segments": [
            {
                "departure": {
                    "location": {
                        "lat": 50.860000000000014,
                        "lon": 4.355649,
                        "id": "https://www.openstreetmap.org/#map=19/50.86/4.355649",
                        "name": null,
                        "translatedNames": {}
                    },
                    "time": "2019-07-04T09:44:44Z",
                    "plannedTime": "2019-07-04T09:44:44Z",
                    "delay": 0
                },
                "arrival": {
                    "location": {
                        "lat": 50.859662804791391,
                        "lon": 4.3608427047729492,
                        "id": "http://irail.be/stations/NMBS/008812005",
                        "name": "Brussel-Noord/Bruxelles-Nord",
                        "translatedNames": {
                            "en": "Brussels-North",
                            "fr": "Bruxelles-Nord",
                            "nl": "Brussel-Noord"
                        }
                    },
                    "time": "2019-07-04T09:53:17Z",
                    "plannedTime": "2019-07-04T09:53:17Z",
                    "delay": 0
                },
                "vehicle": "WALK",
                "headsign": "WALK"
            },
            {
                "departure": {
                    "location": {
                        "lat": 50.859662804791391,
                        "lon": 4.3608427047729492,
                        "id": "http://irail.be/stations/NMBS/008812005",
                        "name": "Brussel-Noord/Bruxelles-Nord",
                        "translatedNames": {
                            "en": "Brussels-North",
                            "fr": "Bruxelles-Nord",
                            "nl": "Brussel-Noord"
                        }
                    },
                    "time": "2019-07-04T10:07:00Z",
                    "plannedTime": "2019-07-04T10:07:00Z",
                    "delay": 0
                },
                "arrival": {
                    "location": {
                        "lat": 50.942816448359707,
                        "lon": 4.039648175239563,
                        "id": "http://irail.be/stations/NMBS/008895000",
                        "name": "Aalst",
                        "translatedNames": {
                            "fr": "Alost"
                        }
                    },
                    "time": "2019-07-04T10:46:00Z",
                    "plannedTime": "2019-07-04T10:46:00Z",
                    "delay": 0
                },
                "vehicle": "http://irail.be/vehicle/IC2233/20190704",
                "headsign": "Gand-Saint-Pierre"
            },
            {
                "departure": {
                    "location": {
                        "lat": 50.942816448359707,
                        "lon": 4.039648175239563,
                        "id": "http://irail.be/stations/NMBS/008895000",
                        "name": "Aalst",
                        "translatedNames": {
                            "fr": "Alost"
                        }
                    },
                    "time": "2019-07-04T10:46:00Z",
                    "plannedTime": "2019-07-04T10:46:00Z",
                    "delay": 0
                },
                "arrival": {
                    "location": {
                        "lat": 50.942544999999996,
                        "lon": 4.0384469999999908,
                        "id": "https://www.openstreetmap.org/#map=19/50.942545/4.03844699999999",
                        "name": null,
                        "translatedNames": {}
                    },
                    "time": "2019-07-04T10:48:05Z",
                    "plannedTime": "2019-07-04T10:48:05Z",
                    "delay": 0
                },
                "vehicle": "WALK",
                "headsign": "WALK"
            }
        ],
        "departure": {
            "location": {
                "lat": 50.860000000000014,
                "lon": 4.355649,
                "id": "https://www.openstreetmap.org/#map=19/50.86/4.355649",
                "name": null,
                "translatedNames": {}
            },
            "time": "2019-07-04T09:44:44Z",
            "plannedTime": "2019-07-04T09:44:44Z",
            "delay": 0
        },
        "arrival": {
            "location": {
                "lat": 50.942544999999996,
                "lon": 4.0384469999999908,
                "id": "https://www.openstreetmap.org/#map=19/50.942545/4.03844699999999",
                "name": null,
                "translatedNames": {}
            },
            "time": "2019-07-04T10:48:05Z",
            "plannedTime": "2019-07-04T10:48:05Z",
            "delay": 0
        },
        "travelTime": 3801,
        "vehiclesTaken": 1
    }
);*/