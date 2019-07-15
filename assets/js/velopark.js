class Parking {
    constructor(name, latitude, longitude){
        this.name = name;
        this.coordinates = [longitude, latitude];
    }
}

class ParkingRepository{
    constructor(){
        this.parkings = [];
    }
}

class Station {
    constructor(name, location){
        this.name = name;
        this.location = location;
        this.parkings;
    }

    getParkings(){
        this.parkings = checkForNearParkings(this.location.lat,this.location.lon);
    }
}

class StationRepository{
    constructor(journeyName){
        this.journeyName = journeyName;
        this.stations = {firstStation : undefined, lastStation : undefined};
    }
}

let parkingRepo = new ParkingRepository();



function getVeloParkData(){
    $.getJSON("https://velopark.ilabt.imec.be/data/catalog", function (data) {
        let counter = 0;
        let errorCounter = 0;
        for (const key in data["dcat:dataset"]["dcat:distribution"]) {
            if (data["dcat:dataset"]["dcat:distribution"].hasOwnProperty(key)) {
                const element = data["dcat:dataset"]["dcat:distribution"][key]
                let parkingUrl = element['@id']
                $.getJSON(parkingUrl, function (p) {
                    counter++
                    let name = p.name[0][`@value`];
                    let latitude = p[`@graph`][0].geo[0].latitude;
                    let longitude = p[`@graph`][0].geo[0].longitude;
                    let parking = new Parking(name, latitude, longitude)
                    parkingRepo.parkings.push(parking)
                    if (counter === data["dcat:dataset"]["dcat:distribution"].length - 1) {
                        console.log("Adding parkings to map now.", counter, "total; ", errorCounter, "failed.");
                        getFirstAndLastStation(dummyJourney)
                        stationRepository.stations.firstStation.getParkings();
                        stationRepository.stations.lastStation.getParkings();
                        console.log(stationRepository)
                        checkForFacilities();
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

function getFirstAndLastStation(journey){
    //first station
    //incase starting at station
    if (journey.journeys[0].segments[0].departure.location.id.includes('irail') && journey.journeys[0].segments[0].arrival.location.id.includes('irail')) {
        let station = new Station(journey.journeys[0].segments[0].departure.location.name, {lat : journey.journeys[0].segments[0].departure.location.lat, lon : journey.journeys[0].segments[0].departure.location.lon})
        stationRepository.stations.firstStation = station;
    }else{//incase starting at OSM point
        if (journey.journeys[0].segments[0].arrival.location.id.includes('irail')) {
            let station = new Station(journey.journeys[0].segments[0].arrival.location.name, {lat : journey.journeys[0].segments[0].arrival.location.lat, lon : journey.journeys[0].segments[0].arrival.location.lon})
            stationRepository.stations.firstStation = station;
        }
    }
    
    //last station 
    //incase ending at station
    if (journey.journeys[0].segments[journey.journeys[0].segments.length-1].departure.location.id.includes('irail') && journey.journeys[0].segments[journey.journeys[0].segments.length-1].arrival.location.id.includes('irail')) {
        let station = new Station(journey.journeys[0].segments[journey.journeys[0].segments.length-1].arrival.location.name, {lat : journey.journeys[0].segments[journey.journeys[0].segments.length-1].arrival.location.lat, lon : journey.journeys[0].segments[journey.journeys[0].segments.length-1].arrival.location.lon})
        stationRepository.stations.lastStation = station
    }else{//incase ending at OSM point
        let station = new Station(journey.journeys[0].segments[journey.journeys[0].segments.length-1].departure.location.name, {lat : journey.journeys[0].segments[journey.journeys[0].segments.length-1].departure.location.lat, lon : journey.journeys[0].segments[journey.journeys[0].segments.length-1].departure.location.lon})
        stationRepository.stations.lastStation = station
    }
}

function checkForNearParkings(latStation, lonStation){
    let parkingsInRange = [];
    parkingRepo.parkings.forEach(p => {
        let dist = distance(p.coordinates[1],p.coordinates[0],latStation, lonStation)
        if (dist<=0.5) {
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
	}
	else {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
        dist = dist * 1.609344;
		return dist;
	}
}

function testParkings(){
    console.log('test')
    parkingsInRange = checkForNearParkings(50.85966280479139,4.360842704772949)
    console.log(parkingsInRange)
}



//!DUMMYDATA
let stationRepository = new StationRepository('testJourney')

let dummyJourney = {
    "journeys":[
       {
          "segments":[
             {
                "departure":{
                   "location":{
                      "lat":50.860952,
                      "lon":4.3562279999999873,
                      "id":"https://www.openstreetmap.org/#map=19/50.860952/4.35622799999999",
                      "name":null,
                      "translatedNames":{
 
                      }
                   },
                   "time":"2019-07-15T10:50:00Z",
                   "plannedTime":"2019-07-15T10:50:00Z",
                   "delay":0
                },
                "arrival":{
                   "location":{
                      "lat":50.859662804791391,
                      "lon":4.3608427047729492,
                      "id":"http://irail.be/stations/NMBS/008812005",
                      "name":"Brussel-Noord/Bruxelles-Nord",
                      "translatedNames":{
                         "en":"Brussels-North",
                         "fr":"Bruxelles-Nord",
                         "nl":"Brussel-Noord"
                      }
                   },
                   "time":"2019-07-15T10:58:15Z",
                   "plannedTime":"2019-07-15T10:58:15Z",
                   "delay":0
                },
                "allStops":null,
                "vehicle":null,
                "headsign":null,
                "generator":"crowsflight&maxDistance=500&speed=1.4",
                "coordinates":null
             },
             {
                "departure":{
                   "location":{
                      "lat":50.859662804791391,
                      "lon":4.3608427047729492,
                      "id":"http://irail.be/stations/NMBS/008812005",
                      "name":"Brussel-Noord/Bruxelles-Nord",
                      "translatedNames":{
                         "en":"Brussels-North",
                         "fr":"Bruxelles-Nord",
                         "nl":"Brussel-Noord"
                      }
                   },
                   "time":"2019-07-15T11:07:00Z",
                   "plannedTime":"2019-07-15T11:07:00Z",
                   "delay":0
                },
                "arrival":{
                   "location":{
                      "lat":50.891928211188059,
                      "lon":4.0718239545822144,
                      "id":"http://irail.be/stations/NMBS/008895802",
                      "name":"Denderleeuw",
                      "translatedNames":{
 
                      }
                   },
                   "time":"2019-07-15T11:37:00Z",
                   "plannedTime":"2019-07-15T11:37:00Z",
                   "delay":0
                },
                "allStops":[
                   {
                      "location":{
                         "lat":50.859662804791391,
                         "lon":4.3608427047729492,
                         "id":"http://irail.be/stations/NMBS/008812005",
                         "name":"Brussel-Noord/Bruxelles-Nord",
                         "translatedNames":{
                            "en":"Brussels-North",
                            "fr":"Bruxelles-Nord",
                            "nl":"Brussel-Noord"
                         }
                      },
                      "time":"2019-07-15T11:07:00Z",
                      "plannedTime":"2019-07-15T11:07:00Z",
                      "delay":0
                   },
                   {
                      "location":{
                         "lat":50.84565900474999,
                         "lon":4.3567979335784912,
                         "id":"http://irail.be/stations/NMBS/008813003",
                         "name":"Brussel-Centraal/Bruxelles-Central",
                         "translatedNames":{
                            "en":"Brussels-Central",
                            "fr":"Bruxelles-Central",
                            "nl":"Brussel-Centraal"
                         }
                      },
                      "time":"2019-07-15T11:11:00Z",
                      "plannedTime":"2019-07-15T11:11:00Z",
                      "delay":0
                   },
                   {
                      "location":{
                         "lat":50.841126502743954,
                         "lon":4.3478608131408691,
                         "id":"http://irail.be/stations/NMBS/008813037",
                         "name":"Brussel-Kapellekerk/Bruxelles-Chapelle",
                         "translatedNames":{
                            "en":"Brussels-Chapelle/Brussels-Kapellekerk",
                            "fr":"Bruxelles-Chapelle",
                            "nl":"Brussel-Kapellekerk"
                         }
                      },
                      "time":"2019-07-15T11:14:00Z",
                      "plannedTime":"2019-07-15T11:14:00Z",
                      "delay":0
                   },
                   {
                      "location":{
                         "lat":50.835709857969931,
                         "lon":4.3365311622619629,
                         "id":"http://irail.be/stations/NMBS/008814001",
                         "name":"Brussel-Zuid/Bruxelles-Midi",
                         "translatedNames":{
                            "en":"Brussels-South/Brussels-Midi",
                            "fr":"Bruxelles-Midi",
                            "nl":"Brussel-Zuid"
                         }
                      },
                      "time":"2019-07-15T11:16:00Z",
                      "plannedTime":"2019-07-15T11:16:00Z",
                      "delay":0
                   },
                   {
                      "location":{
                         "lat":50.8825302779421,
                         "lon":4.0952825546264648,
                         "id":"http://irail.be/stations/NMBS/008895836",
                         "name":"Liedekerke",
                         "translatedNames":{
 
                         }
                      },
                      "time":"2019-07-15T11:32:00Z",
                      "plannedTime":"2019-07-15T11:32:00Z",
                      "delay":0
                   },
                   {
                      "location":{
                         "lat":50.891928211188059,
                         "lon":4.0718239545822144,
                         "id":"http://irail.be/stations/NMBS/008895802",
                         "name":"Denderleeuw",
                         "translatedNames":{
 
                         }
                      },
                      "time":"2019-07-15T11:37:00Z",
                      "plannedTime":"2019-07-15T11:37:00Z",
                      "delay":0
                   }
                ],
                "vehicle":"http://irail.be/vehicle/IC2234/20190715",
                "headsign":"Gand-Saint-Pierre",
                "generator":null,
                "coordinates":[
                   {
                      "lat":50.859662804791391,
                      "lon":4.3608427047729492
                   },
                   {
                      "lat":50.84565900474999,
                      "lon":4.3567979335784912
                   },
                   {
                      "lat":50.841126502743954,
                      "lon":4.3478608131408691
                   },
                   {
                      "lat":50.835709857969931,
                      "lon":4.3365311622619629
                   },
                   {
                      "lat":50.8825302779421,
                      "lon":4.0952825546264648
                   },
                   {
                      "lat":50.891928211188059,
                      "lon":4.0718239545822144
                   }
                ]
             },
             {
                "departure":{
                   "location":{
                      "lat":50.891928211188059,
                      "lon":4.0718239545822144,
                      "id":"http://irail.be/stations/NMBS/008895802",
                      "name":"Denderleeuw",
                      "translatedNames":{
 
                      }
                   },
                   "time":"2019-07-15T11:37:00Z",
                   "plannedTime":"2019-07-15T11:37:00Z",
                   "delay":0
                },
                "arrival":{
                   "location":{
                      "lat":50.892144,
                      "lon":4.0717950000000087,
                      "id":"https://www.openstreetmap.org/#map=19/50.892144/4.07179500000001",
                      "name":null,
                      "translatedNames":{
 
                      }
                   },
                   "time":"2019-07-15T11:37:33Z",
                   "plannedTime":"2019-07-15T11:37:33Z",
                   "delay":0
                },
                "allStops":null,
                "vehicle":null,
                "headsign":null,
                "generator":"crowsflight&maxDistance=500&speed=1.4",
                "coordinates":null
             }
          ],
          "departure":{
             "location":{
                "lat":50.860952,
                "lon":4.3562279999999873,
                "id":"https://www.openstreetmap.org/#map=19/50.860952/4.35622799999999",
                "name":null,
                "translatedNames":{
 
                }
             },
             "time":"2019-07-15T10:50:00Z",
             "plannedTime":"2019-07-15T10:50:00Z",
             "delay":0
          },
          "arrival":{
             "location":{
                "lat":50.892144,
                "lon":4.0717950000000087,
                "id":"https://www.openstreetmap.org/#map=19/50.892144/4.07179500000001",
                "name":null,
                "translatedNames":{
 
                }
             },
             "time":"2019-07-15T11:37:33Z",
             "plannedTime":"2019-07-15T11:37:33Z",
             "delay":0
          },
          "travelTime":2853,
          "vehiclesTaken":1
       }
    ],
    "queryStarted":"2019-07-15T11:06:44.774491+00:00",
    "queryDone":"2019-07-15T11:06:44.8163785+00:00",
    "runningTime":41,
    "earliestDeparture":"2019-07-15T10:50:00Z",
    "latestArrival":"2019-07-15T11:37:33Z"
 }