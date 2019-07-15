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
            if (id == "fromInput") {
                state.location1 = activeItem.loc;
                state.location1Name = activeItem.name
            } else if (id == "toInput") {
                state.location2 = activeItem.loc;
                state.location2Name = activeItem.name
            } else {
                console.warn("FIELD NOT FOUND!");
            }

            processInputOnMap()
        }
    });
}

function toFieldInputDetected(el) {
    if (!el.value || el.value === "") {
        $("#clearInputFieldToButton").hide();
        state.location2 = undefined;
        showLocationsOnMap();
    } else {
        $("#clearInputFieldToButton").show();
    }
}

function fromFieldInputDetected(el) {
    if (!el.value || el.value === "") {
        $("#clearInputFieldFromButton").hide();
        state.location1 = undefined;
        showLocationsOnMap();
    } else {
        $("#clearInputFieldFromButton").show();
    }
}

function clearInputFieldFrom() {
    $("#fromInput").val("");
    state.location1 = undefined;
    showLocationsOnMap();
    fromFieldInputDetected(document.getElementById("fromInput"));
}

function clearInputFieldTo() {
    $("#toInput").val("");
    state.location2 = undefined;
    showLocationsOnMap();
    toFieldInputDetected(document.getElementById("toInput"));
}



initInputGeocoders();