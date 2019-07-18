let map;

let mapstyleAnyways = 'mapbox://styles/mapbox/streets-v11';
let tokenAnyways = 'pk.eyJ1IjoiZGFuaWVsbGV0ZXJyYXMiLCJhIjoiY2pqeWJheGxhMGwxODNxbW1sb2UzMGo0aiJ9.Y5HiKm7qjB1vrX7NGTOofA';

let mapstyleMargot = 'mapbox://styles/mverbs/cjy6ztopn10dx1cpfxw5y0wz1';
let tokenMargot = 'pk.eyJ1IjoibXZlcmJzIiwiYSI6ImNqeTZ6c215MjBsdmozY21zMzEyNnZhNGcifQ.sRED4F6Fh59-wz90S0st4Q';

let mapstyleGulsen = "mapbox://styles/gugul/cjy77yl1713rg1cn0wiwq2ong";
// draft:  mapbox://styles/gugul/cjy77yl1713rg1cn0wiwq2ong/draft
let tokenGulsen = "pk.eyJ1IjoiZ3VndWwiLCJhIjoiY2p4cDVqZXZvMGN6ejNjcm5zdjF6OWR1dSJ9._vc_H7CbewiDCHWYvD4CdQ";
// pk.eyJ1IjoiZ3VndWwiLCJhIjoiY2p4cDVqZXZvMGN6ejNjcm5zdjF6OWR1dSJ9._vc_H7CbewiDCHWYvD4CdQ

function loadMap(coords) { //long, lat
    mapboxgl.accessToken = tokenGulsen;
    map = new mapboxgl.Map({
        container: 'map',
        style: mapstyleGulsen,
        center: coords,
        zoom: 9
    });

    mapOnClick()

    getCurrentLocation(centerToCurrentLocation);
    showLocationsOnMap()
}

function centerToCurrentLocation(position) {
    if (position != null) {
        var lat = position.coords.latitude;
        var long = position.coords.longitude;

        map.setCenter([long, lat]);
    }
}

var labelLayer = "road-label-large";

function clearRoutes(){
    for (let i in availableProfiles) {
        profile = availableProfiles[i];
        if (map.getLayer(profile)) {
            map.removeLayer(profile);
        }
        if (map.getLayer(profile + "-casing")) {
            map.removeLayer(profile + "-casing");
        }
        if (map.getSource(profile + "-source")) {
            map.removeSource(profile + "-source");
        }
    }
}

let routeOpacityAltnerative = 0.5;
let routeOpacityMain = 1;
let routeLineWidthAlternative = 4;
let routeLineWidthmain = 6;

function displayRoute(profile, isSelected, journey) {
    var routeColor = "blue";//profileConfig.routecolor.color;

    let routeStops = [];

    let featureObjects = [];

    let allSegments = journey.segments;

    let numTrains = 0;
    for (let k = 0; k < allSegments.length; k++) {
        let coords = [];
        if (allSegments[k].coordinates === null) {
            coords = [[allSegments[k].arrival.location.lon, allSegments[k].arrival.location.lat], [allSegments[k].departure.location.lon, allSegments[k].departure.location.lat]];
        } else {
            for (let i in allSegments[k].coordinates) {
                coords.push([allSegments[k].coordinates[i].lon, allSegments[k].coordinates[i].lat]);
            }
        }

        let isTrain = false;
        if (allSegments[k].vehicle && allSegments[k].vehicle.indexOf("irail") >= 0) {
            numTrains++;
            isTrain = true;
        }

        let color;
        if (isTrain) {
            if (numTrains % 2 === 0) {
                color = "#bf0003";
            } else {
                color = "#C71585";
            }
        } else {
            color = "#0000FF";
        }

        let featureObject = {
            "type": "Feature",
            "name": "ShapeMeta",
            "geometry": {
                "type": "LineString",
                "coordinates": coords
            },
            "properties": {
                "highway": "footway",
                "profile": "bicycle",
                "distance": "1.391604",
                "time": "0.333985",
                "cyclecolour": color //k % 2 === 0 ? "#0000FF" : "#bf0003" //switch between green and blue lines for now
            }
        };
        featureObjects.push(featureObject);
    }
    

    let route = featureObjects;
    for (let i in route) {
        if (route[i].name === "Stop") {
            routeStops.push(route[i]);
        }
        if (route[i].properties.cyclecolour === undefined) {
            route[i].properties.cyclecolour = routeColor;
        } else if (route[i].properties.cyclecolour.length !== 7) {
            if (route[i].properties.cyclecolour.length > 7) {
                route[i].properties.cyclecolour = route[i].properties.cyclecolour.substring(0, 7);
            } else {
                route[i].properties.cyclecolour = routeColor;
            }
        }
    }

    // Check if profile already exists
    const calculatedRoute = map.getSource(profile + "-source");
    if (calculatedRoute) {
        // Just set the data
        calculatedRoute.setData({type: 'FeatureCollection', features: route});
    } else {
        // Add a new layer
        map.addSource(profile + "-source", {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: featureObjects
            }
        });

        var opacity = routeOpacityAltnerative;
        var width = routeLineWidthAlternative;

        if (isSelected) {
            width = routeLineWidthmain;
            opacity = routeOpacityMain;
        }
        // create the outline of the route
        map.addLayer({
            id: profile + '-casing',
            type: 'line',
            source: profile + "-source",
            paint: {
                'line-color': "#FFFFFF",
                'line-width': width * 1.5,
                'line-opacity': opacity
            },
            layout: {
                'line-cap': 'round',
                'line-join': 'round'
            }
        }, labelLayer);
        // create the actual colored line using the colors coming from the API.
        map.addLayer({
            id: profile,
            type: 'line',
            source: profile + "-source",
            paint: {
                'line-color':
                    {   // always use the colors of the cycling network
                        type: 'identity',
                        property: 'cyclecolour'
                    }
                ,
                'line-width': width,
                'line-opacity': opacity
            },
            layout: {
                'line-cap': 'round',
                'line-join': 'round'
            }
        }, labelLayer);
    }
}



function showProfileRoute(profile){
    availableProfiles.forEach(function (profile) {
        if (map.getLayer(profile)) {
            //map.setLayoutProperty(profile, 'visibility', 'none');
            map.setPaintProperty(profile, 'line-opacity', routeOpacityAltnerative);
            map.setPaintProperty(profile + '-casing', 'line-opacity', routeOpacityAltnerative);
            map.setPaintProperty(profile, 'line-width', routeLineWidthAlternative);
            map.setPaintProperty(profile + '-casing', 'line-width', routeLineWidthAlternative * 1.5);
        }
    });

    if (map.getLayer(selectedProfile)) {
        //map.setLayoutProperty(selectedProfile, 'visibility', 'visible');
        map.setPaintProperty(selectedProfile, 'line-opacity', routeOpacityMain);
        map.setPaintProperty(selectedProfile + '-casing', 'line-opacity', routeOpacityMain);
        map.setPaintProperty(profile, 'line-width', routeLineWidthmain);
        map.setPaintProperty(profile + '-casing', 'line-width', routeLineWidthmain * 1.5);
    }
}

function showLocationsOnMap() {
    console.log(state.location1Marker)
    console.log(state.location2Marker)
    if (state.location1Marker) {
        state.location1Marker.remove();
    }
    if (state.location1) {
        state.location1Marker = createMarker(state.location1, 'A');
    }
    if (state.location2Marker) {
        state.location2Marker.remove();
    }
    if (state.location2) {
        state.location2Marker = createMarker(state.location2, 'B');
    }
    if (state.location1 && state.location2) {
        setCurrentUrl({loc1: state.location1, loc2: state.location2});
    } else if (state.location1) {
        setCurrentUrl({loc1: state.location1});
    } else if (state.location2) {
        setCurrentUrl({loc2: state.location2});
    } else {
        setCurrentUrl({});
    }
}

function processInputOnMap(){
    //Remove markers if they exist
    if(state.location1Marker){
        state.location1Marker.remove();
    }
    if(state.location2Marker){
        state.location2Marker.remove();
    }
    //Add new markers if there is a location for them
    if(state.location1){
        state.location1Marker = createMarker(state.location1, "A");
        if(!state.location2){
            map.jumpTo({
                center: state.location1,
                zoom: 15
            });
        }
    }
    if(state.location2){
        state.location2Marker = createMarker(state.location2, "B");
        if(!state.location1){
            map.jumpTo({
                center: state.location2,
                zoom: 15
            });
        }
    }
    //If both locations are given, zoom map to include both locations
    if (state.location1 && state.location2) {
        zoomToEdge(state.location1, state.location2);
    }
}

function zoomToEdge(origin, destination) {
    let bounds = new mapboxgl.LngLatBounds();
    bounds.extend(origin);
    bounds.extend(destination);
    map.fitBounds(bounds, {
        padding: {
            top: 20,
            right: 20,
            bottom: document.getElementById('inputCard').offsetHeight + 20,
            left: 20
            }
        });
}
/*
function removeMarker(markerId){
    var element = document.getElementById(markerId);
    element.parentNode.removeChild(element);
}*/

function mapOnClick(){
    map.on('click', function (e) {
    var bbox = [[e.point.x - 5, e.point.y - 5], [e.point.x + 5, e.point.y + 5]];
    var features = map.queryRenderedFeatures(
        bbox,
        {
            //options (none)
        }
    );

        var lngLatArray = [e.lngLat.lng, e.lngLat.lat];
        if (!state.location1) {
            state.location1 = lngLatArray;
            reverseGeocode(state.location1, function (address) {
                $("#fromInput").val(address);
                state.location1Name = address;
            });
            $("#clearInputFieldFromButton").show();
        } else {
            state.location2 = lngLatArray;
            reverseGeocode(state.location2, function (address) {
                $("#toInput").val(address);
                state.location2Name = address
            });
            $("#clearInputFieldToButton").show();
        }
        clearAllItineraries();
        clearRoute();
        showLocationsOnMap();
});
}

function reverseGeocode(location, callback) {
    var lng = location[0];
    var lat = location[1];
    $.getJSON(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?limit=1&access_token=${mapboxAccessCode}`, function (data) {
        callback(data.features[0].text + " (" + data.features[0].place_name + ")");
    });
}

function createMarker(loc, label) {

    // create a HTML element for each feature
    var el = document.createElement('div');
    el.innerHTML = label;
    el.className = 'marker';
    el.id = 'marker' + label;

    // make a marker for each feature and add to the map
    return new mapboxgl.Marker({
        element: el,
        draggable: false,
        offset: [0, -20]
    })
        .setLngLat(loc)
        .addTo(map);
}

//dummydata
let dummy = {
    "journeys": [{
        "segments": [{
            "departure": {
                "location": {
                    "lat": 51.106725000000012,
                    "lon": 3.9860099999999932,
                    "id": "https://www.openstreetmap.org/#map=19/51.106725/3.98600999999999",
                    "name": null,
                    "translatedNames": {}
                }, "time": "2019-07-10T07:54:24Z", "plannedTime": "2019-07-10T07:54:24Z", "delay": 0
            },
            "arrival": {
                "location": {
                    "lat": 51.108065398886716,
                    "lon": 3.98779034614563,
                    "id": "http://irail.be/stations/NMBS/008894201",
                    "name": "Lokeren",
                    "translatedNames": {}
                }, "time": "2019-07-10T07:58:24Z", "plannedTime": "2019-07-10T07:58:24Z", "delay": 0
            },
            "allStops": null,
            "vehicle": null,
            "headsign": null,
            "generator": "osm&maxDistance=500&profile=pedestrian",
            "coordinates": [{"lat": 51.106726237066887, "lon": 3.9860107777420493}, {
                "lat": 51.106814842446212,
                "lon": 3.9857003348214284
            }, {"lat": 51.106814842446212, "lon": 3.9857003348214284}, {
                "lat": 51.106845165446792,
                "lon": 3.9855930202609891
            }, {"lat": 51.106845165446792, "lon": 3.9855930202609891}, {
                "lat": 51.106821580890788,
                "lon": 3.9855339972527473
            }, {"lat": 51.106821580890788, "lon": 3.9855339972527473}, {
                "lat": 51.106797996334784,
                "lon": 3.9854749742445055
            }, {"lat": 51.106797996334784, "lon": 3.9854749742445055}, {
                "lat": 51.10677441177878,
                "lon": 3.9854159512362637
            }, {"lat": 51.10677441177878, "lon": 3.9854159512362637}, {
                "lat": 51.1067514,
                "lon": 3.9853716
            }, {"lat": 51.1067212, "lon": 3.9853475}, {"lat": 51.1066838, "lon": 3.9853315}, {
                "lat": 51.106642,
                "lon": 3.9853338
            }, {"lat": 51.1066075, "lon": 3.9853567}, {"lat": 51.1065794, "lon": 3.9854071}, {
                "lat": 51.1065564,
                "lon": 3.9854759
            }, {"lat": 51.1065456, "lon": 3.9855664}, {
                "lat": 51.106545304663307,
                "lon": 3.9856842376373627
            }, {"lat": 51.106545304663307, "lon": 3.9856842376373627}, {
                "lat": 51.106639642887323,
                "lon": 3.98589350103022
            }, {"lat": 51.106639642887323, "lon": 3.98589350103022}, {
                "lat": 51.106663227443327,
                "lon": 3.9859471583104398
            }, {"lat": 51.106663227443327, "lon": 3.9859471583104398}, {
                "lat": 51.106686811999332,
                "lon": 3.9860008155906592
            }, {"lat": 51.106686811999332, "lon": 3.9860008155906592}, {
                "lat": 51.10671376577762,
                "lon": 3.9860544728708791
            }, {"lat": 51.10671376577762, "lon": 3.9860544728708791}, {
                "lat": 51.106737350333624,
                "lon": 3.986108130151099
            }, {"lat": 51.106737350333624, "lon": 3.986108130151099}, {
                "lat": 51.106760934889628,
                "lon": 3.9861671531593408
            }, {"lat": 51.106760934889628, "lon": 3.9861671531593408}, {
                "lat": 51.106784519445632,
                "lon": 3.9862208104395602
            }, {"lat": 51.106784519445632, "lon": 3.9862208104395602}, {
                "lat": 51.106811473223928,
                "lon": 3.98627446771978
            }, {"lat": 51.106811473223928, "lon": 3.98627446771978}, {
                "lat": 51.106835057779932,
                "lon": 3.986328125
            }, {"lat": 51.106835057779932, "lon": 3.986328125}, {
                "lat": 51.10690244222566,
                "lon": 3.9864783653846154
            }, {"lat": 51.10690244222566, "lon": 3.9864783653846154}, {
                "lat": 51.107000149671961,
                "lon": 3.9866929945054945
            }, {"lat": 51.107000149671961, "lon": 3.9866929945054945}, {
                "lat": 51.1070319,
                "lon": 3.9867742
            }, {"lat": 51.107067534117689, "lon": 3.9868486006181318}, {
                "lat": 51.107067534117689,
                "lon": 3.9868486006181318
            }, {"lat": 51.1071159, "lon": 3.9869762}, {
                "lat": 51.107151764674853,
                "lon": 3.9870578640109891
            }, {"lat": 51.107151764674853, "lon": 3.9870578640109891}, {
                "lat": 51.1076335634618,
                "lon": 3.9882061298076925
            }, {"lat": 51.1076335634618, "lon": 3.9882061298076925}, {
                "lat": 51.107741378574964,
                "lon": 3.9884744162087911
            }, {"lat": 51.107741378574964, "lon": 3.9884744162087911}, {
                "lat": 51.107825609132121,
                "lon": 3.9887051425137363
            }, {"lat": 51.107825609132121, "lon": 3.9887051425137363}, {
                "lat": 51.107973854912721,
                "lon": 3.9885656335851647
            }, {"lat": 51.107973854912721, "lon": 3.9885656335851647}, {
                "lat": 51.108101885359609,
                "lon": 3.9884314903846154
            }, {"lat": 51.108101885359609, "lon": 3.9884314903846154}, {
                "lat": 51.1082728,
                "lon": 3.9882057
            }, {"lat": 51.108418592254523, "lon": 3.9879271119505493}, {
                "lat": 51.108418592254523,
                "lon": 3.9879271119505493
            }, {"lat": 51.1082971, "lon": 3.9880518}, {
                "lat": 51.108172639027622,
                "lon": 3.9881578382554945
            }, {"lat": 51.108172639027622, "lon": 3.9881578382554945}, {
                "lat": 51.108063548044107,
                "lon": 3.988140342599455
            }]
        }, {
            "departure": {
                "location": {
                    "lat": 51.108065398886716,
                    "lon": 3.98779034614563,
                    "id": "http://irail.be/stations/NMBS/008894201",
                    "name": "Lokeren",
                    "translatedNames": {}
                }, "time": "2019-07-10T08:46:00Z", "plannedTime": "2019-07-10T08:46:00Z", "delay": 0
            },
            "arrival": {
                "location": {
                    "lat": 51.035898584218231,
                    "lon": 3.7106698751449585,
                    "id": "http://irail.be/stations/NMBS/008892007",
                    "name": "Gent-Sint-Pieters",
                    "translatedNames": {"en": "Ghent-Sint-Pieters", "fr": "Gand-Saint-Pierre"}
                }, "time": "2019-07-10T09:07:00Z", "plannedTime": "2019-07-10T09:07:00Z", "delay": 0
            },
            "allStops": [{
                "location": {
                    "lat": 51.108065398886716,
                    "lon": 3.98779034614563,
                    "id": "http://irail.be/stations/NMBS/008894201",
                    "name": "Lokeren",
                    "translatedNames": {}
                }, "time": "2019-07-10T08:46:00Z", "plannedTime": "2019-07-10T08:46:00Z", "delay": 0
            }, {
                "location": {
                    "lat": 51.0563671057799,
                    "lon": 3.7405872344970703,
                    "id": "http://irail.be/stations/NMBS/008893120",
                    "name": "Gent-Dampoort",
                    "translatedNames": {"en": "Ghent-Dampoort", "fr": "Gand-Dampoort"}
                }, "time": "2019-07-10T08:58:00Z", "plannedTime": "2019-07-10T08:58:00Z", "delay": 0
            }, {
                "location": {
                    "lat": 51.03864792788621,
                    "lon": 3.75632107257843,
                    "id": "http://irail.be/stations/NMBS/008893179",
                    "name": "Gentbrugge",
                    "translatedNames": {}
                }, "time": "2019-07-10T09:02:00Z", "plannedTime": "2019-07-10T09:02:00Z", "delay": 0
            }, {
                "location": {
                    "lat": 51.035898584218231,
                    "lon": 3.7106698751449585,
                    "id": "http://irail.be/stations/NMBS/008892007",
                    "name": "Gent-Sint-Pieters",
                    "translatedNames": {"en": "Ghent-Sint-Pieters", "fr": "Gand-Saint-Pierre"}
                }, "time": "2019-07-10T09:07:00Z", "plannedTime": "2019-07-10T09:07:00Z", "delay": 0
            }],
            "vehicle": "http://irail.be/vehicle/IC1831/20190710",
            "headsign": "Ostende",
            "generator": null,
            "coordinates": [{"lat": 51.108065398886716, "lon": 3.98779034614563}, {
                "lat": 51.0563671057799,
                "lon": 3.7405872344970703
            }, {"lat": 51.03864792788621, "lon": 3.75632107257843}, {
                "lat": 51.035898584218231,
                "lon": 3.7106698751449585
            }]
        }, {
            "departure": {
                "location": {
                    "lat": 51.035898584218231,
                    "lon": 3.7106698751449585,
                    "id": "http://irail.be/stations/NMBS/008892007",
                    "name": "Gent-Sint-Pieters",
                    "translatedNames": {"en": "Ghent-Sint-Pieters", "fr": "Gand-Saint-Pierre"}
                }, "time": "2019-07-10T09:07:00Z", "plannedTime": "2019-07-10T09:07:00Z", "delay": 0
            },
            "arrival": {
                "location": {
                    "lat": 51.035008000000005,
                    "lon": 3.7083149999999989,
                    "id": "https://www.openstreetmap.org/#map=19/51.035008/3.708315",
                    "name": null,
                    "translatedNames": {}
                }, "time": "2019-07-10T09:10:58Z", "plannedTime": "2019-07-10T09:10:58Z", "delay": 0
            },
            "allStops": null,
            "vehicle": null,
            "headsign": null,
            "generator": "osm&maxDistance=500&profile=pedestrian",
            "coordinates": [{"lat": 51.035880853340721, "lon": 3.7107049754577077}, {
                "lat": 51.035367484759192,
                "lon": 3.71042239010989
            }, {"lat": 51.035367484759192, "lon": 3.71042239010989}, {
                "lat": 51.035225766191765,
                "lon": 3.7103472699175826
            }, {"lat": 51.035225766191765, "lon": 3.7103472699175826}, {
                "lat": 51.035063802114706,
                "lon": 3.7102560525412089
            }, {"lat": 51.035063802114706, "lon": 3.7102560525412089}, {
                "lat": 51.0349431,
                "lon": 3.7101151
            }, {"lat": 51.034868095521595, "lon": 3.7100736177884617}, {
                "lat": 51.034868095521595,
                "lon": 3.7100736177884617
            }, {"lat": 51.034878218276411, "lon": 3.7100306919642856}, {
                "lat": 51.034878218276411,
                "lon": 3.7100306919642856
            }, {"lat": 51.034891715282832, "lon": 3.7099609375}, {
                "lat": 51.034891715282832,
                "lon": 3.7099609375
            }, {"lat": 51.034908586540858, "lon": 3.7098911830357144}, {
                "lat": 51.034908586540858,
                "lon": 3.7098911830357144
            }, {"lat": 51.034922083547279, "lon": 3.7098267942994507}, {
                "lat": 51.034922083547279,
                "lon": 3.7098267942994507
            }, {"lat": 51.034938954805305, "lon": 3.7097570398351647}, {
                "lat": 51.034938954805305,
                "lon": 3.7097570398351647
            }, {"lat": 51.034949077560121, "lon": 3.7096980168269229}, {
                "lat": 51.034949077560121,
                "lon": 3.7096980168269229
            }, {"lat": 51.034992942830996, "lon": 3.7095102163461537}, {
                "lat": 51.034992942830996,
                "lon": 3.7095102163461537
            }, {"lat": 51.035030059598654, "lon": 3.7093438787774726}, {
                "lat": 51.035030059598654,
                "lon": 3.7093438787774726
            }, {"lat": 51.034653, "lon": 3.7091384}, {"lat": 51.0346397, "lon": 3.7089519}, {
                "lat": 51.0346847,
                "lon": 3.7086935
            }, {"lat": 51.034688, "lon": 3.7084925}, {
                "lat": 51.034655517670458,
                "lon": 3.7083297561813189
            }, {"lat": 51.034655517670458, "lon": 3.7083297561813189}, {
                "lat": 51.0346389,
                "lon": 3.7082127
            }, {"lat": 51.034628523657616, "lon": 3.7081258585164836}, {
                "lat": 51.034628523657616,
                "lon": 3.7081258585164836
            }, {"lat": 51.034662266173669, "lon": 3.7081365899725274}, {
                "lat": 51.034662266173669,
                "lon": 3.7081365899725274
            }, {"lat": 51.034706131444537, "lon": 3.7082117101648353}, {
                "lat": 51.034706131444537,
                "lon": 3.7082117101648353
            }, {"lat": 51.034735, "lon": 3.708239}, {"lat": 51.0347615, "lon": 3.7082591}, {
                "lat": 51.034788,
                "lon": 3.7082758
            }, {"lat": 51.034838708273369, "lon": 3.7082957068210067}]
        }],
        "departure": {
            "location": {
                "lat": 51.106725000000012,
                "lon": 3.9860099999999932,
                "id": "https://www.openstreetmap.org/#map=19/51.106725/3.98600999999999",
                "name": null,
                "translatedNames": {}
            }, "time": "2019-07-10T07:54:24Z", "plannedTime": "2019-07-10T07:54:24Z", "delay": 0
        },
        "arrival": {
            "location": {
                "lat": 51.035008000000005,
                "lon": 3.7083149999999989,
                "id": "https://www.openstreetmap.org/#map=19/51.035008/3.708315",
                "name": null,
                "translatedNames": {}
            }, "time": "2019-07-10T09:10:58Z", "plannedTime": "2019-07-10T09:10:58Z", "delay": 0
        },
        "travelTime": 4594,
        "vehiclesTaken": 1
    }],
    "queryStarted": "2019-07-10T09:01:03.1022377+00:00",
    "queryDone": "2019-07-10T09:01:08.0043844+00:00",
    "runningTime": 4902,
    "earliestDeparture": "2019-07-10T07:54:24Z",
    "latestArrival": "2019-07-10T09:10:58Z"
};

let dummy2 = {
    "journeys": [{
        "segments": [{
            "departure": {
                "location": {
                    "lat": 51.03470200000001,
                    "lon": 3.7081330000000037,
                    "id": "https://www.openstreetmap.org/#map=19/51.034702/3.708133",
                    "name": null,
                    "translatedNames": {}
                }, "time": "2019-07-10T09:41:49Z", "plannedTime": "2019-07-10T09:41:49Z", "delay": 0
            },
            "arrival": {
                "location": {
                    "lat": 51.035898584218231,
                    "lon": 3.7106698751449585,
                    "id": "http://irail.be/stations/NMBS/008892007",
                    "name": "Gent-Sint-Pieters",
                    "translatedNames": {"en": "Ghent-Sint-Pieters", "fr": "Gand-Saint-Pierre"}
                }, "time": "2019-07-10T09:48:27Z", "plannedTime": "2019-07-10T09:48:27Z", "delay": 0
            },
            "allStops": null,
            "vehicle": null,
            "headsign": null,
            "generator": "osm&maxDistance=500&profile=pedestrian",
            "coordinates": [{"lat": 51.035021651471439, "lon": 3.7082903388620383}, {
                "lat": 51.0350598,
                "lon": 3.7082996
            }, {"lat": 51.0351177, "lon": 3.7082956}, {
                "lat": 51.03515828115966,
                "lon": 3.7082814646291209
            }, {"lat": 51.03515828115966, "lon": 3.7082814646291209}, {
                "lat": 51.0351697,
                "lon": 3.7082739
            }, {"lat": 51.0351852751725, "lon": 3.7082600017170328}, {
                "lat": 51.0351852751725,
                "lon": 3.7082600017170328
            }, {"lat": 51.03522914044337, "lon": 3.7082331730769229}, {
                "lat": 51.03522914044337,
                "lon": 3.7082331730769229
            }, {"lat": 51.0352606, "lon": 3.7081862}, {"lat": 51.0352903, "lon": 3.7081293}, {
                "lat": 51.035320245236711,
                "lon": 3.708056104052198
            }, {"lat": 51.035320245236711, "lon": 3.708056104052198}, {
                "lat": 51.0353491,
                "lon": 3.7079856
            }, {"lat": 51.0353857, "lon": 3.7078995}, {"lat": 51.0354215, "lon": 3.7078462}, {
                "lat": 51.035465338055744,
                "lon": 3.7077931833791209
            }, {"lat": 51.035465338055744, "lon": 3.7077931833791209}, {
                "lat": 51.035499080571796,
                "lon": 3.7077663547390109
            }, {"lat": 51.035499080571796, "lon": 3.7077663547390109}, {
                "lat": 51.0355317,
                "lon": 3.707748
            }, {"lat": 51.0355603, "lon": 3.7077386}, {"lat": 51.0355978, "lon": 3.7077374}, {
                "lat": 51.0356403,
                "lon": 3.707751
            }, {"lat": 51.036477613537357, "lon": 3.7081902472527473}, {
                "lat": 51.036477613537357,
                "lon": 3.7081902472527473
            }, {"lat": 51.036494484795384, "lon": 3.7081956129807692}, {
                "lat": 51.036494484795384,
                "lon": 3.7081956129807692
            }, {"lat": 51.0364888, "lon": 3.7082228}, {"lat": 51.036361, "lon": 3.7091002}, {
                "lat": 51.036248164428187,
                "lon": 3.7096121651785716
            }, {"lat": 51.036248164428187, "lon": 3.7096121651785716}, {
                "lat": 51.03626503568622,
                "lon": 3.7096228966346154
            }, {"lat": 51.03626503568622, "lon": 3.7096228966346154}, {
                "lat": 51.036244790176582,
                "lon": 3.7097302111950547
            }, {"lat": 51.036244790176582, "lon": 3.7097302111950547}, {
                "lat": 51.0364427,
                "lon": 3.7098439
            }, {"lat": 51.036433748266482, "lon": 3.7098911830357144}, {
                "lat": 51.036433748266482,
                "lon": 3.7098911830357144
            }, {"lat": 51.036393257247219, "lon": 3.7098697201236264}, {
                "lat": 51.036393257247219,
                "lon": 3.7098697201236264
            }, {"lat": 51.0362549129314, "lon": 3.7097945999313189}, {
                "lat": 51.0362549129314,
                "lon": 3.7097945999313189
            }, {"lat": 51.0362504, "lon": 3.7098154}, {
                "lat": 51.036187427899293,
                "lon": 3.7101058121565935
            }, {"lat": 51.036187427899293, "lon": 3.7101058121565935}, {
                "lat": 51.036038960828655,
                "lon": 3.7107979910714284
            }, {"lat": 51.036038960828655, "lon": 3.7107979910714284}, {
                "lat": 51.035981598551366,
                "lon": 3.7107604309752746
            }, {"lat": 51.035981598551366, "lon": 3.7107604309752746}, {
                "lat": 51.035880853340721,
                "lon": 3.7107049754577077
            }]
        }, {
            "departure": {
                "location": {
                    "lat": 51.035898584218231,
                    "lon": 3.7106698751449585,
                    "id": "http://irail.be/stations/NMBS/008892007",
                    "name": "Gent-Sint-Pieters",
                    "translatedNames": {"en": "Ghent-Sint-Pieters", "fr": "Gand-Saint-Pierre"}
                }, "time": "2019-07-10T09:53:00Z", "plannedTime": "2019-07-10T09:53:00Z", "delay": 0
            },
            "arrival": {
                "location": {
                    "lat": 51.171472683544586,
                    "lon": 4.1429615020751953,
                    "id": "http://irail.be/stations/NMBS/008894508",
                    "name": "Sint-Niklaas",
                    "translatedNames": {"fr": "Saint-Nicolas"}
                }, "time": "2019-07-10T10:24:00Z", "plannedTime": "2019-07-10T10:24:00Z", "delay": 0
            },
            "allStops": [{
                "location": {
                    "lat": 51.035898584218231,
                    "lon": 3.7106698751449585,
                    "id": "http://irail.be/stations/NMBS/008892007",
                    "name": "Gent-Sint-Pieters",
                    "translatedNames": {"en": "Ghent-Sint-Pieters", "fr": "Gand-Saint-Pierre"}
                }, "time": "2019-07-10T09:53:00Z", "plannedTime": "2019-07-10T09:53:00Z", "delay": 0
            }, {
                "location": {
                    "lat": 51.0563671057799,
                    "lon": 3.7405872344970703,
                    "id": "http://irail.be/stations/NMBS/008893120",
                    "name": "Gent-Dampoort",
                    "translatedNames": {"en": "Ghent-Dampoort", "fr": "Gand-Dampoort"}
                }, "time": "2019-07-10T10:01:00Z", "plannedTime": "2019-07-10T10:01:00Z", "delay": 0
            }, {
                "location": {
                    "lat": 51.087528920579011,
                    "lon": 3.8793808221817017,
                    "id": "http://irail.be/stations/NMBS/008894151",
                    "name": "Beervelde",
                    "translatedNames": {}
                }, "time": "2019-07-10T10:10:00Z", "plannedTime": "2019-07-10T10:10:00Z", "delay": 0
            }, {
                "location": {
                    "lat": 51.108065398886716,
                    "lon": 3.98779034614563,
                    "id": "http://irail.be/stations/NMBS/008894201",
                    "name": "Lokeren",
                    "translatedNames": {}
                }, "time": "2019-07-10T10:14:00Z", "plannedTime": "2019-07-10T10:14:00Z", "delay": 0
            }, {
                "location": {
                    "lat": 51.143399564195853,
                    "lon": 4.06893789768219,
                    "id": "http://irail.be/stations/NMBS/008894425",
                    "name": "Sinaai",
                    "translatedNames": {}
                }, "time": "2019-07-10T10:20:00Z", "plannedTime": "2019-07-10T10:20:00Z", "delay": 0
            }, {
                "location": {
                    "lat": 51.150995236161464,
                    "lon": 4.0886038541793823,
                    "id": "http://irail.be/stations/NMBS/008894433",
                    "name": "Belsele",
                    "translatedNames": {}
                }, "time": "2019-07-10T10:21:00Z", "plannedTime": "2019-07-10T10:21:00Z", "delay": 0
            }, {
                "location": {
                    "lat": 51.171472683544586,
                    "lon": 4.1429615020751953,
                    "id": "http://irail.be/stations/NMBS/008894508",
                    "name": "Sint-Niklaas",
                    "translatedNames": {"fr": "Saint-Nicolas"}
                }, "time": "2019-07-10T10:24:00Z", "plannedTime": "2019-07-10T10:24:00Z", "delay": 0
            }],
            "vehicle": "http://irail.be/vehicle/IC1811/20190710",
            "headsign": "Anvers-Central",
            "generator": null,
            "coordinates": [{"lat": 51.035898584218231, "lon": 3.7106698751449585}, {
                "lat": 51.0563671057799,
                "lon": 3.7405872344970703
            }, {"lat": 51.087528920579011, "lon": 3.8793808221817017}, {
                "lat": 51.108065398886716,
                "lon": 3.98779034614563
            }, {"lat": 51.143399564195853, "lon": 4.06893789768219}, {
                "lat": 51.150995236161464,
                "lon": 4.0886038541793823
            }, {"lat": 51.171472683544586, "lon": 4.1429615020751953}]
        }, {
            "departure": {
                "location": {
                    "lat": 51.171472683544586,
                    "lon": 4.1429615020751953,
                    "id": "http://irail.be/stations/NMBS/008894508",
                    "name": "Sint-Niklaas",
                    "translatedNames": {"fr": "Saint-Nicolas"}
                }, "time": "2019-07-10T10:42:00Z", "plannedTime": "2019-07-10T10:42:00Z", "delay": 0
            },
            "arrival": {
                "location": {
                    "lat": 51.099226718015316,
                    "lon": 4.2405241727828979,
                    "id": "http://irail.be/stations/NMBS/008822772",
                    "name": "Bornem",
                    "translatedNames": {}
                }, "time": "2019-07-10T10:54:00Z", "plannedTime": "2019-07-10T10:54:00Z", "delay": 0
            },
            "allStops": [{
                "location": {
                    "lat": 51.171472683544586,
                    "lon": 4.1429615020751953,
                    "id": "http://irail.be/stations/NMBS/008894508",
                    "name": "Sint-Niklaas",
                    "translatedNames": {"fr": "Saint-Nicolas"}
                }, "time": "2019-07-10T10:42:00Z", "plannedTime": "2019-07-10T10:42:00Z", "delay": 0
            }, {
                "location": {
                    "lat": 51.099226718015316,
                    "lon": 4.2405241727828979,
                    "id": "http://irail.be/stations/NMBS/008822772",
                    "name": "Bornem",
                    "translatedNames": {}
                }, "time": "2019-07-10T10:54:00Z", "plannedTime": "2019-07-10T10:54:00Z", "delay": 0
            }],
            "vehicle": "http://irail.be/vehicle/L2783/20190710",
            "headsign": "Louvain",
            "generator": null,
            "coordinates": [{"lat": 51.171472683544586, "lon": 4.1429615020751953}, {
                "lat": 51.099226718015316,
                "lon": 4.2405241727828979
            }]
        }, {
            "departure": {
                "location": {
                    "lat": 51.099226718015316,
                    "lon": 4.2405241727828979,
                    "id": "http://irail.be/stations/NMBS/008822772",
                    "name": "Bornem",
                    "translatedNames": {}
                }, "time": "2019-07-10T10:54:00Z", "plannedTime": "2019-07-10T10:54:00Z", "delay": 0
            },
            "arrival": {
                "location": {
                    "lat": 51.099000999999987,
                    "lon": 4.240304000000009,
                    "id": "https://www.openstreetmap.org/#map=19/51.099001/4.24030400000001",
                    "name": null,
                    "translatedNames": {}
                }, "time": "2019-07-10T10:56:05Z", "plannedTime": "2019-07-10T10:56:05Z", "delay": 0
            },
            "allStops": null,
            "vehicle": null,
            "headsign": null,
            "generator": "osm&maxDistance=500&profile=pedestrian",
            "coordinates": [{"lat": 51.099188468605639, "lon": 4.2404984145053559}, {
                "lat": 51.099308215192188,
                "lon": 4.2403148609203294
            }, {"lat": 51.099308215192188, "lon": 4.2403148609203294}, {
                "lat": 51.099540691529945,
                "lon": 4.2399875515109891
            }, {"lat": 51.099540691529945, "lon": 4.2399875515109891}, {
                "lat": 51.099591229864238,
                "lon": 4.2399177970467035
            }, {"lat": 51.099591229864238, "lon": 4.2399177970467035}, {
                "lat": 51.099648506643106,
                "lon": 4.239842676854396
            }, {"lat": 51.099648506643106, "lon": 4.239842676854396}, {
                "lat": 51.0996433,
                "lon": 4.239692
            }, {"lat": 51.099641768198538, "lon": 4.2395368303571432}, {
                "lat": 51.099641768198538,
                "lon": 4.2395368303571432
            }, {"lat": 51.0994766763065, "lon": 4.2396173162774726}, {
                "lat": 51.0994766763065,
                "lon": 4.2396173162774726
            }, {"lat": 51.099235566336652, "lon": 4.2399870384395415}]
        }],
        "departure": {
            "location": {
                "lat": 51.03470200000001,
                "lon": 3.7081330000000037,
                "id": "https://www.openstreetmap.org/#map=19/51.034702/3.708133",
                "name": null,
                "translatedNames": {}
            }, "time": "2019-07-10T09:41:49Z", "plannedTime": "2019-07-10T09:41:49Z", "delay": 0
        },
        "arrival": {
            "location": {
                "lat": 51.099000999999987,
                "lon": 4.240304000000009,
                "id": "https://www.openstreetmap.org/#map=19/51.099001/4.24030400000001",
                "name": null,
                "translatedNames": {}
            }, "time": "2019-07-10T10:56:05Z", "plannedTime": "2019-07-10T10:56:05Z", "delay": 0
        },
        "travelTime": 4456,
        "vehiclesTaken": 2
    }],
    "queryStarted": "2019-07-10T09:41:50.4671951+00:00",
    "queryDone": "2019-07-10T09:41:55.4158594+00:00",
    "runningTime": 4948,
    "earliestDeparture": "2019-07-10T09:41:49Z",
    "latestArrival": "2019-07-10T10:56:05Z"
};