class Parking {
    constructor(naam, latitude, longitude){
        this._naam = naam;
        this._coordinates = [longitude, latitude];
    }

    get naam(){
        return this._naam;
    }

    get coordinates(){
        return this._coordinates;
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
                        console.log(parkingRepo.parkings)
                        //processArray(parkingRepo._parkings)
                    }
                })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        counter++;
                        console.warn("Fetching parking data failed.", this.url, errorThrown);
                        errorCounter++;
                        if (counter === data["dcat:dataset"]["dcat:distribution"].length - 1) {
                            console.log("Adding parkings to map now.", counter, "total; ", errorCounter, "failed.");
                            //processArray(parkingRepo._parkings)
                        }
                    });
            }
        }
    })
}