
// Utils

function getCurrentLocation(centerToCurrentLocation){
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(centerToCurrentLocation);
    } else {
        centerToCurrentLocation(null);
    }
}

/**
 * Utility method to swap 2 array values (usefull for LatLng <=> LngLat)
 * @param array
 * @returns {Array}
 */
function swapArrayValues(array) {
    var newArray = [];
    newArray[0] = array[1];
    newArray[1] = array[0];
    return newArray;
}

/*function openDetailView(){
    this.scrollTo(0,0);
}*/

const pxCm = 37.795276;
$(function(){
    //load map with standard coords
    loadMap([4.3558571,50.860088]);

    $(".detailViewSummary").on("click", function(){
        window.scrollTo({top: window.innerHeight - 100 - (4*pxCm), behavior: 'smooth'});
    });
});
