let departureHasParking;
let arrivalHasParking;

function checkForFacilities() {
    if (stationRepository.stations.firstStation.parkings.length > 0 || stationRepository.stations.lastStation.parkings.length > 0) {
        console.log('Parking Here!')
        //TODO ADD PARKING ICON TO FACILITIES
    }
}