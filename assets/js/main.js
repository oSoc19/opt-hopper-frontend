
//load map with standard coords
loadMap([4.3558571,50.860088])

getCurrentLocation();


function getCurrentLocation(){
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(centerToCurrentLocation);
    } else {
        alert('It seems like Geolocation, which is required for this page, is not enabled in your browser. Please use a browser which supports it.');
    }
}

function centerToCurrentLocation(position) {
    var lat = position.coords.latitude;
    var long = position.coords.longitude;

    map.setCenter([long,lat])
}
