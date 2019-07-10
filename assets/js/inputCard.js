let state = {
    location1: undefined,
    location1Name: undefined,
    location1Marker: undefined,

    location2: undefined,
    location2Name: undefined,
    location2Marker: undefined,
}

function getInputFromCard(){
    $(".inputCard").hide();
    $(".tabsContainer, .detailViewContainer").show();

    let input = {from: undefined, to: undefined,fromName: undefined, toName: undefined, date: undefined}

    input.from = state.location1;
    input.to = state.location2;

    input.fromName = state.location1Name;
    input.toName = state.location2Name;
    
    var date = $('#dateInput').val(),
    time = $('#timeInput').val()

    input.date = new Date(date + " " + time)
    
    console.log(input)
    return input;
}

function initInputGeocoders() {
    $('.geocoder-input').typeahead({
        source: function (query, callback) {
            $.getJSON(`https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${mapboxAccessCode}&proximity=50.861%2C4.356&country=BE&bbox=3.9784240723%2C50.6485897217%2C4.7282409668%2C51.0552073386&limit=5`/*`https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${mapboxAccessCode}&proximity=50.861%2C4.356&country=BE&bbox=3.9784240723%2C50.6485897217%2C4.7282409668%2C51.0552073386&limit=5`*/,
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
        }
    });
}

function toFieldInputDetected(el) {
    if (!el.value || el.value === "") {
        $("#clearInputFieldToButton").hide();
        state.location2 = undefined;

    } else {
        $("#clearInputFieldToButton").show();
    }
}

function fromFieldInputDetected(el) {
    if (!el.value || el.value === "") {
        $("#clearInputFieldFromButton").hide();
        state.location1 = undefined;

    } else {
        $("#clearInputFieldFromButton").show();
    }
}

function clearInputFieldTo() {
    $("#toInput").val("");
    state.location2 = undefined;

    toFieldInputDetected(document.getElementById("toInput"));
}

function clearInputFieldFrom() {
    $("#fromInput").val("");
    state.location1 = undefined;

    fromFieldInputDetected(document.getElementById("fromInput"));
}

initInputGeocoders();