class Parking {
    constructor(naam, latitude, longitude){
        this.naam = naam;
        this.coordinates = [longitude, latitude];
    }
}

class ParkingRepository{
    constructor(){
        this.parkings = [];
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
                        testParkings()
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

