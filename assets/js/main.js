
// Utils

function setCurrentUrl(params) {
    currentUrl = window.location.href;
    currentUrl = currentUrl.split('?')[0] + '?';
    for (var i in params) {
        currentUrl += i + '=' + params[i] + "&";
    }
    window.history.pushState("object or string", "Title", currentUrl);
}

function getCurrentLocation(centerToCurrentLocation){
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(centerToCurrentLocation);
    } else {
        centerToCurrentLocation(null);
    }
}

function loadCurrentTime(){

    document.querySelector("#dateInput").valueAsDate = new Date();
    let today = new Date();
    var time = getHours(today.getHours()) + ":" + getMinutes(today.getMinutes())
    document.getElementById("timeInput").value = time;

}

function getHours(hours){
    if (hours < 10) {
        return `0${hours}`
    }else{
        return hours
    }
}

function getMinutes(minutes){
    if (minutes < 10) {
        return `0${minutes}`
    }else{
        return minutes
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


    //load input with current date & time
    loadCurrentTime()

    let tabs = $(".tab");
    tabs.on("click", function(){
        let profile = $(this).attr("profile");
        activateProfile(profile);
        showProfileRoute(profile);
    });

    for (let i = 0; i < tabs.length; i++) {
        if(!availableProfiles.includes(tabs[i].getAttribute("profile"))){
            tabs[i].style.display = "none"
        }
    }

    setTimeout(function(){ 
        getVeloParkData();
    }, 3000);
    
});
