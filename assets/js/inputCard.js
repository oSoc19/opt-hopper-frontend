let state = {
    location1: undefined,
    location1Name: undefined,
    location1Marker: undefined,

    location2: undefined,
    location2Name: undefined,
    location2Marker: undefined,
}

/**
 * gather the input from the card and create an object. return this object
 * @return {input}      input object containing: from, to, fromName, toName and date
 */
function getInputFromCard() {
    let input = {
        from: undefined,
        to: undefined,
        fromName: undefined,
        toName: undefined,
        date: undefined
    }

    input.from = state.location1;
    input.to = state.location2;

    input.fromName = $('#fromInput').val();
    input.toName = $('#toInput').val();

    var date = $('#dateInput').val(),
        time = $('#timeInput').val()

    if (date.includes('-')) {
        date = date.split('-').join('/')
    }

    input.date = new Date(date + " " + time)

    return input;
}

let fallbackCounter = 0;

/**
 * Use 'Best' geocoder. If it fails use MapBox geocoder.
 * Generate typeahead for input and show the typeahead. We are using the bootstrap the bootstrap3-typeahead
 */
function initInputGeocoders() {
    $('.geocoder-input').typeahead({
        source: function (query, callback) {
            if (fallbackCounter <= 4) {
                $.ajax({
                    dataType: "json",
                    url: `https://best.osoc.be/v1/autocomplete?text=${query}`,
                    success: function (data) {
                        var resArray = [];
                        for (let feature in data.features) {
                            //Get region
                            let region;
                            if (data.features[feature].properties) {
                                region = data.features[feature].properties.localadmin
                                if (!region) {
                                    region = data.features[feature].properties.locality;
                                }
                                if (!region) {
                                    region = data.features[feature].properties.county;
                                }
                                if (!region) {
                                    region = data.features[feature].properties.region;
                                }
                            }
                            resArray.push({
                                name: data.features[feature].properties.name + (region ? (", " + region) : ""),
                                loc: data.features[feature].geometry.coordinates
                            });
                            callback(resArray);
                        }
                    },
                    error: function (error) {
                        console.warn("Best geocoding failed:", error, "\nTemporary falling back to mapbox geocoder.");
                        //Fallback to MapBox Geocoder
                        fallbackCounter++;
                        if (fallbackCounter > 4) {
                            console.warn("Stop using best geocoder. Falling back to Mapbox for this session.");
                        }
                        mapBoxGeoCode(query, callback);
                    }
                });
            } else {
                //Best has failed too many times, just use mapbox geocoder now
                mapBoxGeoCode(query, callback);
            }
        },
        matcher: function (s) {
            return true;
        },
        afterSelect: function (activeItem) {
            var id = this.$element.attr('id');
            if (id === "fromInput") {
                state.location1 = activeItem.loc;
                state.location1Name = activeItem.name
            } else if (id === "toInput") {
                state.location2 = activeItem.loc;
                state.location2Name = activeItem.name
            } else {
                console.warn("FIELD NOT FOUND!");
            }

            processInputOnMap();
            clearAllItineraries();
            clearRoute();
        },
        minLength: 3,
        delay: 300,
        sorter: function (texts) {
            return texts;
        }
    });
}

/**
 * use mapbox geocoder
 */
function mapBoxGeoCode(query, callback) {
    $.ajax({
        dataType: "json",
        url: `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${mapboxAccessCode}&country=be`,
        success: function (data) {
            var resArray = [];
            for (var feature in data.features) {
                //Get place from context in response
                let context = data.features[feature].context;
                let place = "";
                let i = 0;
                while (!place && i < context.length) {
                    if (context[i].id.includes("place")) {
                        place = context[i].text;
                    }
                    i++;
                }
                resArray.push({
                    name: data.features[feature].text + ", " + place,
                    loc: data.features[feature].center
                });
            }
            callback(resArray);
        },
        error: function (error) {
            console.warn("Mapbox geocoding request failed:", error);
            //If mapbox also fails, you probably have connection issues
            if (fallbackCounter > 0) {
                fallbackCounter--;
            }
        }
    });
}

/**
 * detect when the user is entering something in the FROM input field. If empty run clearAllItineraries(), clearRoute() and showLocationsOnMap()
 * @param  {element} el the from input field
 */
function fromFieldInputDetected(el) {
    if (state.location1 && state.location1Name !== el.value) {
        state.location1 = null;
        clearAllItineraries();
        clearRoute();
        showLocationsOnMap();
    }
    if (!el.value || el.value === "") {
        $("#clearInputFieldFromButton").hide();
    } else {
        $("#clearInputFieldFromButton").show();
    }
}

/**
 * detect when the user is entering something in the TO input field. If empty run clearAllItineraries(), clearRoute() and showLocationsOnMap()
 * @param  {element} el the to input field
 */
function toFieldInputDetected(el) {
    if (state.location2 && state.location2Name !== el.value) {
        state.location2 = null;
        clearAllItineraries();
        clearRoute();
        showLocationsOnMap();
    }
    if (!el.value || el.value === "") {
        $("#clearInputFieldToButton").hide();
    } else {
        $("#clearInputFieldToButton").show();
    }
}

/**
 * clear the from input field
 */
function clearInputFieldFrom() {
    $("#fromInput").val("");
    fromFieldInputDetected(document.getElementById("fromInput"));
}

/**
 * clear the to input field
 */
function clearInputFieldTo() {
    $("#toInput").val("");
    toFieldInputDetected(document.getElementById("toInput"));
}


initInputGeocoders();