

// Utils

function getCurrentLocation(centerToCurrentLocation){
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(centerToCurrentLocation);
    } else {
        centerToCurrentLocation(null);
    }
}

$(function(){
    //load map with standard coords
    loadMap([4.3558571,50.860088]);
});