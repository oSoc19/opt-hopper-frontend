const myStations = {}

class Parking {
    constructor(name, latitude, longitude) {
        this.name = name;
        this.coordinates = [longitude, latitude];
    }
}

class ParkingRepository {
    constructor() {
        this.parkings = [];
    }
}

class Station {
    constructor(name, location) {
        this.name = name;
        this.location = location;
        this.parkings;
    }
}

let parkingRepo = new ParkingRepository();

/**
 * Add the icons if the velopark data is fetched AFTER there is a route.
 */
function displayVeloParkData() { //
    for (const key in myStations) {
        if (myStations.hasOwnProperty(key)) {
            if (myStations[key].parkings.length) {
                if ($(`.itineraryStop[stationid="${key}"]`)) {
                    var parkingImg = document.createElement("img");
                    parkingImg.classList.add("facilityIcon")
                    parkingImg.src = 'assets/img/icons/parkingIcon.svg'
                    $(`.itineraryStop[stationid="${key}"]`).append(parkingImg)
                }
                let parkingHasPump = false;
                myStations[key].parkings.forEach(parking => {
                    parking[`@graph`].forEach(graph => {
                        if (graph.amenityFeature) {
                            graph.amenityFeature.forEach(feature => {
                                if (feature[`@type`].includes('BicyclePump')) {
                                    parkingHasPump = true;
                                }
                            });
                        }
                    });
                });
                if (parkingHasPump) {
                    var BicyclePumpImg = document.createElement("img");
                    BicyclePumpImg.classList.add("facilityIcon")
                    BicyclePumpImg.src = 'assets/img/icons/pumpIcon.svg'
                    $(`.itineraryStop[stationid="${key}"]`).append(BicyclePumpImg)
                }
            }
        }
    }
}

/**
 * Empty the myParkings object
 */
function clearStations() {
    if (!$.isEmptyObject(myStations)) {
        console.log(myStations)
        for (var prop in myStations) {
            if (myStations.hasOwnProperty(prop)) {
                delete myStations[prop];
            }
        }
    }
}

/**
 * fetch the VeloPark data. After the fetch run processParkings()
 */
function getVeloParkData() {
    $.getJSON("https://velopark.ilabt.imec.be/data/catalog", function (data) {
        let counter = 0;
        let errorCounter = 0;
        for (const key in data["dcat:dataset"]["dcat:distribution"]) {
            if (data["dcat:dataset"]["dcat:distribution"].hasOwnProperty(key)) {
                const element = data["dcat:dataset"]["dcat:distribution"][key]
                let parkingUrl = element['@id']
                $.getJSON(parkingUrl, function (p) {
                        counter++
                        let parking = p;
                        parkingRepo.parkings.push(parking)
                        if (counter === data["dcat:dataset"]["dcat:distribution"].length - 1) {
                            console.log("Adding parkings to map now.", counter, "total; ", errorCounter, "failed.");
                            processParkings()

                        }
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        counter++;
                        console.warn("Fetching parking data failed.", this.url, errorThrown);
                        errorCounter++;
                        if (counter === data["dcat:dataset"]["dcat:distribution"].length - 1) {
                            console.log("Adding parkings to map now.", counter, "total; ", errorCounter, "failed.");
                        }
                    });
            }
        }
    })
}

/**
 * calculate the parkings for each station if the VeloPark data is fetched AFTER there is a route
 */
function processParkings() {
    if (!$.isEmptyObject(myStations)) {
        for (const key in myStations) {
            if (myStations.hasOwnProperty(key)) {
                myStations[key].parkings = checkForNearParkings(myStations[key].location.lat, myStations[key].location.lon);
            }
        }
        displayVeloParkData();
    }
}

/**
 * calculate the stations we pass in our journey and add them to myStations. Duplicate stations will not be added.
 * At the end calculate the parkings for each station if the VeloPark data was fetched BEFORE we got the route.
 * @param  {journey} journey one of the journeys we get from Itinero.
 */
function getStations(journey) {
    let stations = {}

    journey.segments.forEach(segment => {
        if (segment.departure.location.id.includes('irail')) {
            if (!myStations[segment.departure.location.id]) {
                myStations[segment.departure.location.id] = new Station(segment.departure.location.name, {
                    lat: segment.departure.location.lat,
                    lon: segment.departure.location.lon
                });
                stations[segment.departure.location.id] = new Station(segment.departure.location.name, {
                    lat: segment.departure.location.lat,
                    lon: segment.departure.location.lon
                })
            }
        }
        if (!myStations[segment.arrival.location.id]) {
            if (segment.arrival.location.id.includes('irail')) {
                myStations[segment.arrival.location.id] = new Station(segment.arrival.location.name, {
                    lat: segment.arrival.location.lat,
                    lon: segment.arrival.location.lon
                });
                stations[segment.arrival.location.id] = new Station(segment.arrival.location.name, {
                    lat: segment.arrival.location.lat,
                    lon: segment.arrival.location.lon
                })
            }
        }
    })
    if (parkingRepo.parkings.length) {
        for (const key in stations) {
            if (stations.hasOwnProperty(key)) {
                myStations[key].parkings = checkForNearParkings(stations[key].location.lat, stations[key].location.lon);
            }
        }
    }
}

/**
 * get the first station of a journey
 * @param  {journey} journey one of the journeys we get from Itinero.
 */
function getFirstStation(journey) {
    for (let i = 0; i < journey.segments.length; i++) {
        let segment = journey.segments[i];
        if (segment.departure.location.id.includes('irail')) {
            return segment.departure.location.id;
        }
        if (segment.arrival.location.id.includes('irail')) {
            return segment.arrival.location.id;
        }
    }
}

//not used anymore
function getFirstAndLastStation(journey) {
    //first station
    //incase starting at station
    if (journey.journeys[0].segments[0].departure.location.id.includes('irail') && journey.journeys[0].segments[0].arrival.location.id.includes('irail')) {
        let station = new Station(journey.journeys[0].segments[0].departure.location.name, {
            lat: journey.journeys[0].segments[0].departure.location.lat,
            lon: journey.journeys[0].segments[0].departure.location.lon
        })
        stationRepository.stations.firstStation = station;
    } else { //incase starting at OSM point
        if (journey.journeys[0].segments[0].arrival.location.id.includes('irail')) {
            let station = new Station(journey.journeys[0].segments[0].arrival.location.name, {
                lat: journey.journeys[0].segments[0].arrival.location.lat,
                lon: journey.journeys[0].segments[0].arrival.location.lon
            })
            stationRepository.stations.firstStation = station;
        }
    }

    //last station 
    //incase ending at station
    if (journey.journeys[0].segments[journey.journeys[0].segments.length - 1].departure.location.id.includes('irail') && journey.journeys[0].segments[journey.journeys[0].segments.length - 1].arrival.location.id.includes('irail')) {
        let station = new Station(journey.journeys[0].segments[journey.journeys[0].segments.length - 1].arrival.location.name, {
            lat: journey.journeys[0].segments[journey.journeys[0].segments.length - 1].arrival.location.lat,
            lon: journey.journeys[0].segments[journey.journeys[0].segments.length - 1].arrival.location.lon
        })
        stationRepository.stations.lastStation = station
    } else { //incase ending at OSM point
        let station = new Station(journey.journeys[0].segments[journey.journeys[0].segments.length - 1].departure.location.name, {
            lat: journey.journeys[0].segments[journey.journeys[0].segments.length - 1].departure.location.lat,
            lon: journey.journeys[0].segments[journey.journeys[0].segments.length - 1].departure.location.lon
        })
        stationRepository.stations.lastStation = station
    }
}

/**
 * [calculate the parkings that are 500m or less from the given station.
 * @param  {number} latStation the latitude from the station.
 * @param  {number} lonStation the longitude from the station
 * @return {parking[]}     return the parkings in range for the station
 */
function checkForNearParkings(latStation, lonStation) {
    let parkingsInRange = [];
    parkingRepo.parkings.forEach(p => {
        let dist = distance(p[`@graph`][0].geo[0].latitude, p[`@graph`][0].geo[0].longitude, latStation, lonStation)
        if (dist <= 0.5) {
            parkingsInRange.push(p)
        }
    })
    if (parkingsInRange.length === 0) {
        console.log('No parkings in range.')
    }
    return parkingsInRange;
}

/**
 * calculate and return the distance between 2 coordinates in km
 * @param  {number} arg1 latitude of the first coordinates
 * @param  {number} arg2 longitude of the first coordinates
 * @param  {number} arg3 latitude of the second coordinates
 * @param  {number} arg4 longitude of the second coordinates
 * @return {number}      the distance in km
 */
function distance(lat1, lon1, lat2, lon2) {
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    } else {
        var radlat1 = Math.PI * lat1 / 180;
        var radlat2 = Math.PI * lat2 / 180;
        var theta = lon1 - lon2;
        var radtheta = Math.PI * theta / 180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        dist = dist * 1.609344;
        return dist;
    }
}