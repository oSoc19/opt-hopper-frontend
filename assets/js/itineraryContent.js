let receivedItineraries = {};

/**
 * activate the profile 
 * @param  {profile} profile the profile you want to activate
 */
function activateProfile(profile) {
    if (!profile) {
        console.error("No valid profile given", profile);
        return;
    }
    if (!availableProfiles.includes(profile)) {
        console.error("This profile is not valid (or is disabled).", profile);
        return;
    }
    //At this point we're sure the profile exists and is enabled. Profile is selected, even if there is no valid data to show to the user.
    selectedProfile = profile;
    $(".tab").removeClass("selected");
    $(`.tab[profile=${profile}]`).addClass("selected");

    if (!receivedItineraries[profile] || !receivedItineraries[profile].data || !receivedItineraries[profile].journey) {
        console.warn("No itinerary for this profile available yet.", profile);
        clearItinerary(profile, true);
        return;
    }
    if (!receivedItineraries[profile].data || !receivedItineraries[profile].journey) {
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


/**
 * display the journey on the screen for the selected profile
 * @param  {profile} profile the profile you want to display
 * @param  {boolean} selected boolean if the profile is selected
 * @param  {String} departure place where we departure from
 * @param  {String} arrival place where we want to arrive
 * @param  {journey} journey the journey we want to display
 */
function fillItinerary(profile, selected, departure, arrival, journey) {

    let minutes = journey.travelTime / 60;
    let hours = Math.floor(minutes / 60);
    minutes = Math.round(minutes - (hours * 60));
    $(".travelTime-" + profile).html((hours > 0 ? hours + "h " : "") + minutes + "min");
    $(`.tab[profile=${profile}] .loaderContainer`).hide();

    if (selected) {
        let itineraryConainer = $(".itineraryContentContainer");
        itineraryConainer.html("");
        let detailViewSummaryIcons = $(".detailViewSummaryIcons")
        detailViewSummaryIcons.html("")

        $(".detailViewSummaryTotalTime").html((hours > 0 ? hours + "h " : "") + minutes + "min");
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

                myStations[firstStation].parkings.forEach(parking => {
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
                let nextVehicle = journey.segments[i + 1].vehicle;
                if (!(nextVehicle && nextVehicle.indexOf("irail") >= 0)) {
                    dottedNext = true;
                }

                let departureTimeFromThisArrivalLocation = new Date(journey.segments[i + 1].departure.time);

                let stationId;
                if (journey.segments[i].arrival.location.id.includes('irail')) {
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
                            ${journey.segments[i].arrival.location.name}` +
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

/**
 * clear all itineraries, will run clearItinerary() for all profiles
 */
function clearAllItineraries() {
    for (i in availableProfiles) {
        clearItinerary(availableProfiles[i], availableProfiles[i] == selectedProfile);

    }

}

/**
 * clear the itinerary
 * @param  {profile} profile the profile you want to clear
 * @param  {boolean} selected boolean if the profile is selected
 */
function clearItinerary(profile, selected) {

    //$(".travelTime-" + profile).html( profile );

    if (selected) {
        $(".detailViewSummaryTotalTime").html("");
        $(".detailViewSummaryTrains").html("");
        $(".detailViewSummaryTotalCyclingTime").html("");
        $(".detailViewSummaryIcons").html("")


        //departure
        $(".itineraryStartFieldTime").html("");
        $(".itineraryStartField").html("");

        //segments
        $(".itineraryContentContainer").html("");

        //arrival
        $(".itineraryFinishFieldTime").html("");
        $(".itineraryFinishField").html("");
    }
}