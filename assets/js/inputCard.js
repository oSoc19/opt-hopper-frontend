let state = {
    location1: undefined,
    location1Name: undefined,
    location1Marker: undefined,

    location2: undefined,
    location2Name: undefined,
    location2Marker: undefined,
}

function getInputFromCard(){
    let input = {from: undefined, to: undefined,fromName: undefined, toName: undefined, date: undefined}

    input.from = state.location1;
    input.to = state.location2;

    input.fromName = state.location1Name;
    input.toName = state.location2Name;
    
    var date = $('#dateInput').val(),
    time = $('#timeInput').val()

    input.date = new Date(date + " " + time)

    return input;
}

function initInputGeocoders() {
    $('.geocoder-input').typeahead({
        source: function (query, callback) {
            $.getJSON(`https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${mapboxAccessCode}&country=be`,
                function (data) {
                    var resArray = [];
                    for (var feature in data.features) {
                        resArray.push({
                            name: data.features[feature].text + " (" + data.features[feature].place_name + ")",
                            loc: data.features[feature].center
                        });
                    }
                    callback(resArray);
                });
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
        }
    });
}

function fromFieldInputDetected(el) {
    if(state.location1 && state.location1Name !== el.value) {
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

function toFieldInputDetected(el) {
    if(state.location2 && state.location2Name !== el.value){
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

function clearInputFieldFrom() {
    $("#fromInput").val("");
    fromFieldInputDetected(document.getElementById("fromInput"));
}

function clearInputFieldTo() {
    $("#toInput").val("");
    toFieldInputDetected(document.getElementById("toInput"));
}


initInputGeocoders();