let map;

let mapstyleAnyways = 'mapbox://styles/mapbox/streets-v11';
let tokenAnyways = 'pk.eyJ1IjoiZGFuaWVsbGV0ZXJyYXMiLCJhIjoiY2pqeWJheGxhMGwxODNxbW1sb2UzMGo0aiJ9.Y5HiKm7qjB1vrX7NGTOofA';

let mapstyleMargot = 'mapbox://styles/mverbs/cjy6ztopn10dx1cpfxw5y0wz1';
let tokenMargot = 'pk.eyJ1IjoibXZlcmJzIiwiYSI6ImNqeTZ6c215MjBsdmozY21zMzEyNnZhNGcifQ.sRED4F6Fh59-wz90S0st4Q';

let mapstyleGulsen = "mapbox://styles/gugul/cjy77yl1713rg1cn0wiwq2ong";
// draft:  mapbox://styles/gugul/cjy77yl1713rg1cn0wiwq2ong/draft
let tokenGulsen = "pk.eyJ1IjoiZ3VndWwiLCJhIjoiY2p4cDVqZXZvMGN6ejNjcm5zdjF6OWR1dSJ9._vc_H7CbewiDCHWYvD4CdQ";
// pk.eyJ1IjoiZ3VndWwiLCJhIjoiY2p4cDVqZXZvMGN6ejNjcm5zdjF6OWR1dSJ9._vc_H7CbewiDCHWYvD4CdQ

/**
 * create map object and display the map. Center it on the given coordinates.
 * add the train tiles as a layer. Execute mapOnClick(), getCurrentLocatin() and showLocationsOnMap().
 * @param  {number[]} coords the coordinates you want to load the map to.
 */
function loadMap(coords) { //long, lat
    mapboxgl.accessToken = tokenGulsen;
    map = new mapboxgl.Map({
        container: 'map',
        style: mapstyleGulsen,
        center: coords,
        zoom: 9,
        attributionControl: false
    }).addControl(new mapboxgl.AttributionControl({
        compact: true,
        customAttribution: "<a href='https://best.osoc.be/attribution'>BEST geocoder</a>"
    }));

    map.on('load', function () {

        //getCurrentLocation(centerToCurrentLocation);
        showLocationsOnMap();

        map.addLayer({
            "id": "railway",
            "type": "line",
            "source": {
                "type": "vector",
                "tiles": ["https://openhopper.be/assets/tiles/{z}/{x}/{y}.pbf"],
                "minzoom": 6,
                "maxzoom": 14
            },
            "source-layer": "transportation",
            "layout": {
                "line-cap": "round",
                "line-join": "round"
            },
            "paint": {
                "line-opacity": 0.4,
                "line-color": "rgb(118,119,144)",
                "line-width": 1
            }
        }, 'waterway-label');

        let attribution = $('.mapboxgl-ctrl-bottom-right');
        $(".pageHeader").append(attribution.html());
        attribution.html('');
    });

    mapOnClick();

}

/**
 * center the map to the given coordinates
 * @param  {number[]} position the coordinates you want to center the map to.
 */
function centerToCurrentLocation(position) {
    if (position != null) {
        var lat = position.coords.latitude;
        var long = position.coords.longitude;

        map.setCenter([long, lat]);
    }
}

var labelLayer = "road-label-large";

/**
 * clear all the routes on the map
 */
function clearRoutes() {
    for (let i in availableProfiles) {
        profile = availableProfiles[i];
        if (map.getLayer(profile)) {
            map.removeLayer(profile);
        }
        if (map.getLayer(profile + '-transfer-points')) {
            map.removeLayer(profile + '-transfer-points');
        }
        if (map.getLayer(profile + "-casing")) {
            map.removeLayer(profile + "-casing");
        }
        if (map.getSource(profile + "-source")) {
            map.removeSource(profile + "-source");
        }
        if (map.getSource(profile + "-points-source")) {
            map.removeSource(profile + "-points-source");
        }
    }
}

let routeOpacityAltnerative = 0.5;
let routeOpacityMain = 1;
let routeLineWidthAlternative = 4;
let routeLineWidthMain = 6;

/**
 * display the route we get back from itinero on different layers on the map
 * @param  {profile} profile the profile we want to display the route for
 * @param  {boolean} isSelected if the profile is selected 
 * @param  {journey} journey the journey we want to desiplay
 */
function displayRoute(profile, isSelected, journey) {
    var routeColor = "blue"; //profileConfig.routecolor.color;

    let routeStops = [];

    let featureObjects = [];
    let pointObjects = [];

    let allSegments = journey.segments;

    let numTrains = 0;
    for (let k = 0; k < allSegments.length; k++) {
        let coords = [];
        if (allSegments[k].coordinates === null) {
            coords = [
                [allSegments[k].arrival.location.lon, allSegments[k].arrival.location.lat],
                [allSegments[k].departure.location.lon, allSegments[k].departure.location.lat]
            ];
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
                color = "#004696";
            } else {
                color = "#0B3463";
            }
        } else {
            color = "#28A987";
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
                /*"profile": "bicycle",
                "distance": "1.391604",
                "time": "0.333985",*/
                "cyclecolour": color //k % 2 === 0 ? "#0000FF" : "#bf0003" //switch between green and blue lines for now
            }
        };
        featureObjects.push(featureObject);

        let pointObject = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": coords[0]
            },
            "properties": {
                "cyclecolour": color
            }
        };
        pointObjects.push(pointObject);
        pointObject = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": coords[coords.length - 1]
            },
            "properties": {
                "cyclecolour": color
            }
        };
        pointObjects.push(pointObject);

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
        calculatedRoute.setData({
            type: 'FeatureCollection',
            features: route
        });
    } else {
        // Add a new layer
        map.addSource(profile + "-source", {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: featureObjects
            }
        });

        map.addSource(profile + "-points-source", {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: pointObjects
            }
        });

        var opacity = routeOpacityAltnerative;
        var width = routeLineWidthAlternative;

        if (isSelected) {
            width = routeLineWidthMain;
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
                'line-color': { // always use the colors of the cycling network
                    type: 'identity',
                    property: 'cyclecolour'
                },
                'line-width': width,
                'line-opacity': opacity
            },
            layout: {
                'line-cap': 'round',
                'line-join': 'round'
            }
        }, labelLayer);

        //Draw circles on the stations
        map.addLayer({
            'id': profile + '-transfer-points',
            'type': 'circle',
            'source': profile + "-points-source",
            paint: {
                'circle-color': '#fff',
                /*{
                    type: 'identity',
                    property: 'cyclecolour'
                },*/
                "circle-radius": width,
                "circle-stroke-width": 4,
                "circle-stroke-color": {
                    type: 'identity',
                    property: 'cyclecolour'
                },
                "circle-opacity": opacity,
                "circle-stroke-opacity": opacity
            }
        });

        //Fix layer order
        showProfileRoute(selectedProfile);
    }
}


/**
 * grey out the alternative routes and highlight the selected profile route.
 * @param  {profile} profile
 */
function showProfileRoute(profile) {
    availableProfiles.forEach(function (profile) {
        if (map.getLayer(profile)) {
            //map.setLayoutProperty(profile, 'visibility', 'none');
            map.setPaintProperty(profile, 'line-opacity', routeOpacityAltnerative);
            map.setPaintProperty(profile + '-casing', 'line-opacity', routeOpacityAltnerative);
            map.setPaintProperty(profile, 'line-width', routeLineWidthAlternative);
            map.setPaintProperty(profile + '-casing', 'line-width', routeLineWidthAlternative * 1.5);
            map.setPaintProperty(profile + "-transfer-points", "circle-color", {
                type: 'identity',
                property: 'cyclecolour'
            });
            map.setPaintProperty(profile + "-transfer-points", 'circle-radius', routeLineWidthAlternative);
            map.setPaintProperty(profile + "-transfer-points", 'circle-stroke-opacity', routeOpacityAltnerative);
            map.setPaintProperty(profile + "-transfer-points", 'circle-opacity', routeOpacityAltnerative);
        }
    });

    if (map.getLayer(selectedProfile)) {
        //map.setLayoutProperty(selectedProfile, 'visibility', 'visible');
        map.setPaintProperty(selectedProfile, 'line-opacity', routeOpacityMain);
        map.setPaintProperty(selectedProfile + '-casing', 'line-opacity', routeOpacityMain);
        map.setPaintProperty(profile, 'line-width', routeLineWidthMain);
        map.setPaintProperty(profile + '-casing', 'line-width', routeLineWidthMain * 1.5);
        map.setPaintProperty(profile + "-transfer-points", "circle-color", "#fff");
        map.setPaintProperty(profile + "-transfer-points", 'circle-radius', routeLineWidthMain);
        map.setPaintProperty(profile + "-transfer-points", 'circle-stroke-opacity', routeOpacityMain);
        map.setPaintProperty(profile + "-transfer-points", 'circle-opacity', routeOpacityMain);

        //Fix z-order of custom layers
        for (key in availableProfiles) {
            if (availableProfiles[key] !== profile && map.getLayer(availableProfiles[key])) {
                map.moveLayer(availableProfiles[key] + '-casing', profile + '-casing');
                map.moveLayer(availableProfiles[key], profile);
                map.moveLayer(availableProfiles[key] + '-transfer-points', profile + '-transfer-points');
            }
        }
    }
}

/**
 * create markers for each location. If the locations is cleared, delete the marker.
 */
function showLocationsOnMap() {
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
        setCurrentUrl({
            loc1: state.location1,
            loc2: state.location2
        });
    } else if (state.location1) {
        setCurrentUrl({
            loc1: state.location1
        });
    } else if (state.location2) {
        setCurrentUrl({
            loc2: state.location2
        });
    } else {
        setCurrentUrl({});
    }
    if (state.location1 && state.location2) {
        zoomToEdge(state.location1, state.location2);
    }
}

/**
 * function that is not used in this version of the application
 */
function processInputOnMap() {
    //Remove markers if they exist
    if (state.location1Marker) {
        state.location1Marker.remove();
    }
    if (state.location2Marker) {
        state.location2Marker.remove();
    }
    //Add new markers if there is a location for them
    if (state.location1) {
        state.location1Marker = createMarker(state.location1, "A");
        if (!state.location2) {
            map.jumpTo({
                center: state.location1,
                zoom: 15
            });
        }
    }
    if (state.location2) {
        state.location2Marker = createMarker(state.location2, "B");
        if (!state.location1) {
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

/**
 * center the map to given location
 * @param  {number[]} arg1 origin coordinates
 * @param  {number[]} arg2 destination coordinates
 */
function zoomToEdge(origin, destination) {
    let bounds = new mapboxgl.LngLatBounds();
    bounds.extend(origin);
    bounds.extend(destination);

    if ($(window).width() < 992) {

        map.fitBounds(bounds, {
            padding: {
                top: 80,
                right: 20,
                bottom: document.getElementById('inputCard').offsetHeight + 20,
                left: 20
            }
        });

    } else if ($(window).width() > 992) {

        map.fitBounds(bounds, {
            padding: {
                top: $(".pageHeader").height() + 50,
                right: 20,
                bottom: 20,
                left: $(".detailViewSummary").width() + 60
            }
        });
    }
}

/**
 * when map is clicked set locations to the clicked position. Reverse geocode the coordinates and put them in the input field
 */
function mapOnClick() {
    map.on('click', function (e) {
        var bbox = [
            [e.point.x - 5, e.point.y - 5],
            [e.point.x + 5, e.point.y + 5]
        ];
        var features = map.queryRenderedFeatures(
            bbox, {
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

let fallbackCounterReverse = 0;

/**
 * Use to Best geocoder the reverse the coordinates to place names. If Best geocoder fails, use MapBox geocoder
 */
function reverseGeocode(location, callback) {
    let lng = location[0];
    let lat = location[1];
    if (fallbackCounterReverse <= 4) {
        $.ajax({
            dataType: "json",
            url: `https://best.osoc.be/v1/reverse?point.lat=${lat}&point.lon=${lng}`,
            success: function (data) {
                if (data.features && data.features[0] && data.features[0].properties) {
                    //Get region
                    let region;
                    if (data.features[0].properties) {
                        region = data.features[0].properties.localadmin;
                        if (!region) {
                            region = data.features[0].properties.locality;
                        }
                        if (!region) {
                            region = data.features[0].properties.county;
                        }
                        if (!region) {
                            region = data.features[0].properties.region;
                        }
                    }
                    callback(data.features[0].properties.name + (region ? (", " + region) : ""));
                } else {
                    fallbackCounterReverse++;
                    console.warn("BEST reverse geocode did not return useful results. Falling back to MapBox now.");
                    mapBoxReverseGeoCode(location, callback);
                }
            },
            error: function (error) {
                fallbackCounterReverse++;
                console.warn("BEST reverse geocode failed:", error, "\nFalling back to MapBox");
                mapBoxReverseGeoCode(location, callback);
            }
        });
    } else {
        mapBoxReverseGeoCode(location, callback);
    }
}

/**
 * MapBox reverse geocoder
 */
function mapBoxReverseGeoCode(location, callback) {
    let lng = location[0];
    let lat = location[1];
    $.ajax({
        dataType: "json",
        url: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?limit=1&access_token=${mapboxAccessCode}`,
        success: function (data) {
            callback(data.features[0].text + ", " + data.features[0].place_name);
        },
        error: function (error) {
            if (fallbackCounterReverse > 0) {
                fallbackCounterReverse--;
            }
            console.warn("MapBox reverse geocode failed:", error);
            callback("[Geen adres gevonden voor deze locatie]");
        }
    });
}

/**
 * create a marker at the given location with the given label. Add the marker to the map.
 * @param  {number[]} loc the location to create the marker
 * @param  {String} label label to give the marker, such as A or B
 * @return {marker}      the created marker
 */
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