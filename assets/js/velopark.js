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

class StationRepository {
    constructor(journeyName) {
        this.journeyName = journeyName;
        this.stations = {
            firstStation: undefined,
            lastStation: undefined
        };
    }
}

let parkingRepo = new ParkingRepository();

function displayVeloParkData() {
    for (const key in myStations) {
        if (myStations.hasOwnProperty(key)) {
            if (myStations[key].parkings.length) {
                console.log(myStations[key].name + ' has a parking')
                //TODO ADD ICONS TO ACTIVE PROFILE
            }  
        }
    }


    /*
    if (myStations[journey.segments[i].arrival.location.id].parkings.length > 0) {
        var parkingImg = document.createElement("img");
        parkingImg.classList.add("facilityIcon")
        parkingImg.src = 'assets/img/icons/Parking_icon.svg'
        $(`.itineraryStop[stationid="${journey.segments[i].arrival.location.id}"]`).append(parkingImg)

        let parkingHasPump = false;
        myStations[journey.segments[i].arrival.location.id].parkings.forEach(parking => {
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
            BicyclePumpImg.src = 'assets/img/icons/pump-air.svg'
            $(`.itineraryStop[stationid="${journey.segments[i].arrival.location.id}"]`).append(BicyclePumpImg)
        }
    }*/
}

function displayParkingAvailable(){
    for (const key in myStations) {
        if (myStations.hasOwnProperty(key)) {
            if (myStations[key].parkings.length) {
                
            }  
        }
    }
}

function clearStations(){
    if (!$.isEmptyObject(myStations)) {
        console.log(myStations)
        for (var prop in myStations) { 
            if (myStations.hasOwnProperty(prop)) {
                 delete myStations[prop]; 
                } 
            }  
    }
}


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
                        /*let name = p.name[0][`@value`];
                        let latitude = p[`@graph`][0].geo[0].latitude;
                        let longitude = p[`@graph`][0].geo[0].longitude;*/
                        let parking = p;
                        parkingRepo.parkings.push(parking)
                        if (counter === data["dcat:dataset"]["dcat:distribution"].length - 1) {
                            console.log("Adding parkings to map now.", counter, "total; ", errorCounter, "failed.");
                            console.log(parkingRepo)
                            processParkings()
                            //checkForFacilities();
                            //processArray(parkingRepo._parkings)
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
        for (const key in stations  ) {
            if (stations.hasOwnProperty(key)) {
                myStations[key].parkings = checkForNearParkings(stations[key].location.lat, stations[key].location.lon);    
            }
        }
    }
}

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

function testParkings() {
    console.log('test')
    parkingsInRange = checkForNearParkings(50.85966280479139, 4.360842704772949)
    console.log(parkingsInRange)
}



//!DUMMYDATA
let stationRepository = new StationRepository('testJourney')

let dummyJourney = {
    "journeys": [{
        "segments": [{
                "departure": {
                    "location": {
                        "lat": 50.860952,
                        "lon": 4.3562279999999873,
                        "id": "https://www.openstreetmap.org/#map=19/50.860952/4.35622799999999",
                        "name": null,
                        "translatedNames": {

                        }
                    },
                    "time": "2019-07-15T10:50:00Z",
                    "plannedTime": "2019-07-15T10:50:00Z",
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
                    "time": "2019-07-15T10:58:15Z",
                    "plannedTime": "2019-07-15T10:58:15Z",
                    "delay": 0
                },
                "allStops": null,
                "vehicle": null,
                "headsign": null,
                "generator": "crowsflight&maxDistance=500&speed=1.4",
                "coordinates": null
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
                    "time": "2019-07-15T11:07:00Z",
                    "plannedTime": "2019-07-15T11:07:00Z",
                    "delay": 0
                },
                "arrival": {
                    "location": {
                        "lat": 50.891928211188059,
                        "lon": 4.0718239545822144,
                        "id": "http://irail.be/stations/NMBS/008895802",
                        "name": "Denderleeuw",
                        "translatedNames": {

                        }
                    },
                    "time": "2019-07-15T11:37:00Z",
                    "plannedTime": "2019-07-15T11:37:00Z",
                    "delay": 0
                },
                "allStops": [{
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
                        "time": "2019-07-15T11:07:00Z",
                        "plannedTime": "2019-07-15T11:07:00Z",
                        "delay": 0
                    },
                    {
                        "location": {
                            "lat": 50.84565900474999,
                            "lon": 4.3567979335784912,
                            "id": "http://irail.be/stations/NMBS/008813003",
                            "name": "Brussel-Centraal/Bruxelles-Central",
                            "translatedNames": {
                                "en": "Brussels-Central",
                                "fr": "Bruxelles-Central",
                                "nl": "Brussel-Centraal"
                            }
                        },
                        "time": "2019-07-15T11:11:00Z",
                        "plannedTime": "2019-07-15T11:11:00Z",
                        "delay": 0
                    },
                    {
                        "location": {
                            "lat": 50.841126502743954,
                            "lon": 4.3478608131408691,
                            "id": "http://irail.be/stations/NMBS/008813037",
                            "name": "Brussel-Kapellekerk/Bruxelles-Chapelle",
                            "translatedNames": {
                                "en": "Brussels-Chapelle/Brussels-Kapellekerk",
                                "fr": "Bruxelles-Chapelle",
                                "nl": "Brussel-Kapellekerk"
                            }
                        },
                        "time": "2019-07-15T11:14:00Z",
                        "plannedTime": "2019-07-15T11:14:00Z",
                        "delay": 0
                    },
                    {
                        "location": {
                            "lat": 50.835709857969931,
                            "lon": 4.3365311622619629,
                            "id": "http://irail.be/stations/NMBS/008814001",
                            "name": "Brussel-Zuid/Bruxelles-Midi",
                            "translatedNames": {
                                "en": "Brussels-South/Brussels-Midi",
                                "fr": "Bruxelles-Midi",
                                "nl": "Brussel-Zuid"
                            }
                        },
                        "time": "2019-07-15T11:16:00Z",
                        "plannedTime": "2019-07-15T11:16:00Z",
                        "delay": 0
                    },
                    {
                        "location": {
                            "lat": 50.8825302779421,
                            "lon": 4.0952825546264648,
                            "id": "http://irail.be/stations/NMBS/008895836",
                            "name": "Liedekerke",
                            "translatedNames": {

                            }
                        },
                        "time": "2019-07-15T11:32:00Z",
                        "plannedTime": "2019-07-15T11:32:00Z",
                        "delay": 0
                    },
                    {
                        "location": {
                            "lat": 50.891928211188059,
                            "lon": 4.0718239545822144,
                            "id": "http://irail.be/stations/NMBS/008895802",
                            "name": "Denderleeuw",
                            "translatedNames": {

                            }
                        },
                        "time": "2019-07-15T11:37:00Z",
                        "plannedTime": "2019-07-15T11:37:00Z",
                        "delay": 0
                    }
                ],
                "vehicle": "http://irail.be/vehicle/IC2234/20190715",
                "headsign": "Gand-Saint-Pierre",
                "generator": null,
                "coordinates": [{
                        "lat": 50.859662804791391,
                        "lon": 4.3608427047729492
                    },
                    {
                        "lat": 50.84565900474999,
                        "lon": 4.3567979335784912
                    },
                    {
                        "lat": 50.841126502743954,
                        "lon": 4.3478608131408691
                    },
                    {
                        "lat": 50.835709857969931,
                        "lon": 4.3365311622619629
                    },
                    {
                        "lat": 50.8825302779421,
                        "lon": 4.0952825546264648
                    },
                    {
                        "lat": 50.891928211188059,
                        "lon": 4.0718239545822144
                    }
                ]
            },
            {
                "departure": {
                    "location": {
                        "lat": 50.891928211188059,
                        "lon": 4.0718239545822144,
                        "id": "http://irail.be/stations/NMBS/008895802",
                        "name": "Denderleeuw",
                        "translatedNames": {

                        }
                    },
                    "time": "2019-07-15T11:37:00Z",
                    "plannedTime": "2019-07-15T11:37:00Z",
                    "delay": 0
                },
                "arrival": {
                    "location": {
                        "lat": 50.892144,
                        "lon": 4.0717950000000087,
                        "id": "https://www.openstreetmap.org/#map=19/50.892144/4.07179500000001",
                        "name": null,
                        "translatedNames": {

                        }
                    },
                    "time": "2019-07-15T11:37:33Z",
                    "plannedTime": "2019-07-15T11:37:33Z",
                    "delay": 0
                },
                "allStops": null,
                "vehicle": null,
                "headsign": null,
                "generator": "crowsflight&maxDistance=500&speed=1.4",
                "coordinates": null
            }
        ],
        "departure": {
            "location": {
                "lat": 50.860952,
                "lon": 4.3562279999999873,
                "id": "https://www.openstreetmap.org/#map=19/50.860952/4.35622799999999",
                "name": null,
                "translatedNames": {

                }
            },
            "time": "2019-07-15T10:50:00Z",
            "plannedTime": "2019-07-15T10:50:00Z",
            "delay": 0
        },
        "arrival": {
            "location": {
                "lat": 50.892144,
                "lon": 4.0717950000000087,
                "id": "https://www.openstreetmap.org/#map=19/50.892144/4.07179500000001",
                "name": null,
                "translatedNames": {

                }
            },
            "time": "2019-07-15T11:37:33Z",
            "plannedTime": "2019-07-15T11:37:33Z",
            "delay": 0
        },
        "travelTime": 2853,
        "vehiclesTaken": 1
    }],
    "queryStarted": "2019-07-15T11:06:44.774491+00:00",
    "queryDone": "2019-07-15T11:06:44.8163785+00:00",
    "runningTime": 41,
    "earliestDeparture": "2019-07-15T10:50:00Z",
    "latestArrival": "2019-07-15T11:37:33Z"
}