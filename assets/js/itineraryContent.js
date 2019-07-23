let receivedItineraries = {};

function activateProfile(profile){
    if(!profile){
        console.error("No valid profile given", profile);
        return;
    }
    if(!availableProfiles.includes(profile)){
        console.error("This profile is not valid (or is disabled).", profile);
        return;
    }
    //At this point we're sure the profile exists and is enabled. Profile is selected, even if there is no valid data to show to the user.
    selectedProfile = profile;
    $(".tab").removeClass("selected");
    $(`.tab[profile=${profile}]`).addClass("selected");

    if(!receivedItineraries[profile] || !receivedItineraries[profile].data || !receivedItineraries[profile].journey){
        console.warn("No itinerary for this profile available yet.", profile);
        clearItinerary(profile, true);
        return;
    }
    if(!receivedItineraries[profile].data || !receivedItineraries[profile].journey){
        console.error("We received an itinerary for this profile (" + profile + "), but it doesn't make sense. Sorry.");
        clearItinerary(profile, true);
        return;
    }
    fillItinerary(profile, true, receivedItineraries[profile].from, receivedItineraries[profile].to, receivedItineraries[profile].journey);
}

let parkingFacilityIconElement = '<img class="facilityIcon" src="assets/img/icons/parkingIcon.svg" alt="P"/>';
let pumpFacilityIconElement = '<img class="facilityIcon" src="assets/img/icons/pumpIcon.svg" alt="P"/>';

let summaryParkingFacilityIconElement = '<img class="summaryFacilityIconElement" src="assets/img/icons/parkingIcon.svg" alt="P"/>';
let summaryPumpFacilityIconElement = '<img class="summaryFacilityIconElement" src="assets/img/icons/pumpIcon.svg" alt="P"/>';

function fillItinerary(profile, selected, departure, arrival, journey) {

    let minutes = journey.travelTime / 60;
    let hours = Math.floor(minutes / 60);
    minutes = Math.round(minutes - (hours * 60));
    $(".travelTime-" + profile).html( (hours > 0 ? hours + "h " : "") + minutes + "min" );
    $(`.tab[profile=${profile}] .loaderContainer`).hide();

    if(selected) {  
        let itineraryConainer = $(".itineraryContentContainer");
        itineraryConainer.html("");
        let detailViewSummaryIcons = $(".detailViewSummaryIcons")
        detailViewSummaryIcons.html("")

        $(".detailViewSummaryTotalTime").html( (hours > 0 ? hours + "h " : "") + minutes + "min" );
        $(".detailViewSummaryTrains").html(journey.vehiclesTaken);

        //adding summaryIcons
        //check if route cointains station parkings 
        firstStation = getFirstStation(journey);

        let firstStationHasParking;
        let firstStationHasPump;
        let detailViewSummaryIconContainer = $(".detailViewSummaryIconContainer")

        if (firstStation && parkingRepo.parkings.length) {
            if (myStations[firstStation].parkings.length > 0) {
                firstStationHasParking = true;

                myStations[firstStation].parkings.forEach(parking =>{
                    parking[`@graph`].forEach(graph => {
                        if (graph.amenityFeature) {
                            graph.amenityFeature.forEach(feature => {
                                if (feature[`@type`].includes('BicyclePump')) {
                                    firstStationHasPump = true;
                                }
                            });
                        }
                    });
                })
            }
        }
        
        detailViewSummaryIcons.append(
            (firstStationHasParking ? summaryParkingFacilityIconElement : '') +
            (firstStationHasPump ? summaryPumpFacilityIconElement : '')
        )
            
        let dottedPrevious = false;
        let dottedNext = false;

        //departure
        let depDate = new Date(journey.segments[0].departure.time);
        let arrDate;
        //$(".itineraryStartFieldTime").html(formatTwoDigits(depDate.getHours())+':'+formatTwoDigits(depDate.getMinutes()));
        //$(".itineraryStartField").html(departure);

        let nextVehicle = journey.segments[0].vehicle;
        if (!nextVehicle || !nextVehicle.indexOf("irail") >= 0) {
            dottedNext = true;
        }

        itineraryConainer.append(
            `<tr>
                <td>
                    ${formatTwoDigits(depDate.getHours())+':'+formatTwoDigits(depDate.getMinutes())}
                </td>
                <td>
                    <svg class="circle" height="13" width="13">
                        <circle cx="7" cy="7" r="5" stroke="white" stroke-width="2" fill="#28A987"></circle>
                    </svg>
                    <svg class="line bottom-line ${ dottedNext ? "dotted" : ""}" width="3">
                        <line x1="1" y1="0" x2="1" y2="200" stroke="white" stroke-width="2px"></line>
                    </svg>
                </td>
                <td>
                    ${departure}
                </td>
            </tr>`
        );

        //segments
        for (let i = 0; i < journey.segments.length; i++) {
            depDate = new Date(journey.segments[i].departure.time);
            arrDate = new Date(journey.segments[i].arrival.time);
            //let seconds = ((arrDate - depDate) / 1000) % 60;
            let minutes = ((arrDate - depDate) / 1000) / 60;
            let hours = Math.floor(minutes / 60);
            minutes = Math.round(minutes - (hours * 60));

            //console.log(hours, ":", minutes);

            let vehicle = journey.segments[i].vehicle;
            dottedPrevious = false;
            dottedNext = false;
            if (vehicle && vehicle.indexOf("irail") >= 0) {
                vehicle = "TRAIN";
            } else if (!vehicle) {
                vehicle = "WALK";
                dottedPrevious = true;
            }
            if (i === 0) {
                $(".detailViewSummaryTotalCyclingTime").html((hours > 0 ? `${hours}h ` : "") + `${minutes}min`);
            }

            itineraryConainer.append(
                `<tr class="itineraryVehicle">
                    <td>
                        
                    </td>
                    <td>
                        <svg class="line top-line ${ dottedPrevious ? "dotted" : ""}" width="3">
                            <line x1="1" y1="0" x2="1" y2="200" stroke="white" stroke-width="2px"></line>
                        </svg>
                        <svg class="line bottom-line ${ dottedPrevious ? "dotted" : ""}" width="3">
                            <line x1="1" y1="0" x2="1" y2="200" stroke="white" stroke-width="2px"></line>
                        </svg>
                    </td>
                    <td>
                        ${vehicle} ` + (hours > 0 ? `${hours}h ` : "") + `${minutes}min
                    </td>
                </tr>`);

            if (i < journey.segments.length - 1) {

                //Determine dotted line or solid line for next segment
                let nextVehicle = journey.segments[i+1].vehicle;
                if (!(nextVehicle && nextVehicle.indexOf("irail") >= 0)) {
                    dottedNext = true;
                }

                let departureTimeFromThisArrivalLocation = new Date(journey.segments[i+1].departure.time);

                let stationId;
                if(journey.segments[i].arrival.location.id.includes('irail')){
                    stationId = journey.segments[i].arrival.location.id;
                }

                let stationHasParking = false;
                let stationHasPump = false;

                if (stationId && parkingRepo.parkings.length) {
                    if (myStations[journey.segments[i].arrival.location.id].parkings.length > 0) {
                        stationHasParking = true;

                        myStations[journey.segments[i].arrival.location.id].parkings.forEach(parking => {
                            parking[`@graph`].forEach(graph => {
                                if (graph.amenityFeature) {
                                    graph.amenityFeature.forEach(feature => {
                                        if (feature[`@type`].includes('BicyclePump')) {
                                            stationHasPump = true;
                                        }
                                    });
                                }
                            });
                        });
                    }
                }

                itineraryConainer.append(
                    `<tr class="itineraryStop"` + (stationId ? `stationid="${journey.segments[i].arrival.location.id}"` : '') + `>
                        <td>
                            ${formatTwoDigits(departureTimeFromThisArrivalLocation.getHours())+':'+formatTwoDigits(departureTimeFromThisArrivalLocation.getMinutes())}
                        </td>
                        <td>
                            <svg class="line top-line ${ dottedPrevious ? "dotted" : ""}" width="3">
                                <line x1="1" y1="0" x2="1" y2="200" stroke="white" stroke-width="2px"></line>
                            </svg>
                            <svg class="circle" height="13" width="13">
                                <circle cx="7" cy="7" r="5" stroke="white" stroke-width="2" fill="#28A987"></circle>
                            </svg>
                            <svg class="line bottom-line ${ dottedNext ? "dotted" : ""}" width="3">
                                <line x1="1" y1="0" x2="1" y2="200" stroke="white" stroke-width="2px"></line>
                            </svg>
                        </td>
                        <td>
                            ${journey.segments[i].arrival.location.name}`+
                            (stationHasParking ? parkingFacilityIconElement : '') +
                            (stationHasPump ? pumpFacilityIconElement : '') +
                        `</td>
                    </tr>`
                );

            }

        }

        //arrival
        //$(".itineraryFinishFieldTime").html(formatTwoDigits(arrDate.getHours())+':'+formatTwoDigits(arrDate.getMinutes()));
        //$(".itineraryFinishField").html(arrival);

        itineraryConainer.append(
            `<tr>
                <td>
                    ${formatTwoDigits(arrDate.getHours())+':'+formatTwoDigits(arrDate.getMinutes())}
                </td>
                <td>
                    <svg class="line top-line ${ dottedPrevious ? "dotted" : ""}" width="3">
                        <line x1="1" y1="0" x2="1" y2="200" stroke="white" stroke-width="2px"></line>
                    </svg>
                    <svg class="circle" height="13" width="13">
                        <circle cx="7" cy="7" r="5" stroke="white" stroke-width="2" fill="#28A987"></circle>
                    </svg>
                </td>
                <td>
                    ${arrival}
                </td>
            </tr>`
        );
    }
}

function formatTwoDigits(n) {
    return n < 10 ? '0' + n : n;
}

function clearAllItineraries(){
    for(i in availableProfiles){
        clearItinerary(availableProfiles[i], availableProfiles[i] == selectedProfile);
    }
}

function clearItinerary(profile, selected) {

    //$(".travelTime-" + profile).html( profile );

    if(selected) {
        $(".detailViewSummaryTotalTime").html( "" );
        $(".detailViewSummaryTrains").html( "" );
        $(".detailViewSummaryTotalCyclingTime").html( "" );
        $(".detailViewSummaryIcons").html( "" )
        

        //departure
        $(".itineraryStartFieldTime").html( "" );
        $(".itineraryStartField").html( "" );

        //segments
        $(".itineraryContentContainer").html( "" );

        //arrival
        $(".itineraryFinishFieldTime").html( "" );
        $(".itineraryFinishField").html( "" );
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