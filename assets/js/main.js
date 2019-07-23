
// Utils
/**
 * Get the parameters that are encoded in the given url
 * @param url
 */
function getAllUrlParams(url) {
    // get query string from url (optional) or window
    var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

    // we'll store the parameters here
    var obj = {};

    // if query string exists
    if (queryString) {

        // stuff after # is not part of query string, so get rid of it
        queryString = queryString.split('#')[0];

        // split our query string into its component parts
        var arr = queryString.split('&');

        for (var i = 0; i < arr.length; i++) {
            // separate the keys and the values
            var a = arr[i].split('=');

            // in case params look like: list[]=thing1&list[]=thing2
            var paramNum = undefined;
            var paramName = a[0].replace(/\[\d*\]/, function (v) {
                paramNum = v.slice(1, -1);
                return '';
            });

            // set parameter value (use 'true' if empty)
            //var paramValue = a[1];
            let paramValue;
            if (typeof(a[1]) === 'undefined') {
                paramValue = true;
            } else {
                paramValue = a[1].toLowerCase();
                //check if the value is a comma sepperated list
                var b = paramValue.split(',');
                paramValue = typeof(b[1]) === 'undefined' ? b[0] : b;
            }

            // (optional) keep case consistent
            paramName = paramName.toLowerCase();


            // if parameter name already exists
            if (obj[paramName]) {
                // convert value to array (if still string)
                if (typeof obj[paramName] === 'string') {
                    obj[paramName] = [obj[paramName]];
                }
                // if no array index number specified...
                if (typeof paramNum === 'undefined') {
                    // put the value on the end of the array
                    obj[paramName].push(paramValue);
                }
                // if array index number specified...
                else {
                    // put the value at that index number
                    obj[paramName][paramNum] = paramValue;
                }
            }
            // if param name doesn't exist yet, set it
            else {
                obj[paramName] = paramValue;
            }
        }
    }

    return obj;
}

/**
 * Use the current user location as a startpoint.
 */
function useCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position){
            state.location1 = [position.coords.longitude, position.coords.latitude];
            showLocationsOnMap();
            reverseGeocode(state.location1, function (address) {
                $("#fromInput").val(address);
                //fromFieldInputDetected(document.getElementById("fromInput"));
            });
        }, function(error){
            if (error.code === error.PERMISSION_DENIED) {
                console.log("Geolocation permission denied");
                if (typeof(Storage) !== "undefined") {
                    localStorage.setItem("geolocation.permission.denieddate", new Date());
                }
            } else {
                console.warn("Accessing geolocation failed.", error);
            }
        });
        if(typeof(Storage) !== "undefined") {
            localStorage.removeItem("geolocation.permission.denieddate");
        }
    } else {
        console.warn("Geolocation is not supported by this browser.");
    }
}

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

    let urlparams = getAllUrlParams();
    if (urlparams.loc1) {
        state.location1 = urlparams.loc1;
    } else {
        if (typeof(Storage) !== "undefined" && (!localStorage.getItem("geolocation.permission.denieddate") || new Date(localStorage.getItem("geolocation.permission.denieddate")).addDays(7) > new Date())) {
            setTimeout(function () {
                console.log("using current location");
                useCurrentLocation();
                showLocationsOnMap()
                $("#clearInputFieldFromButton").show();
            }, 2000);
        }
    }
    if (urlparams.loc2) {
        state.location2 = urlparams.loc2;
    }
    if (state.location1) {
        reverseGeocode(state.location1, function (address) {
            $("#fromInput").val(address);
        });
        $("#useLocationInputFieldButton").hide();
        $("#clearInputFieldFromButton").show();
    }
    if (state.location2) {
        reverseGeocode(state.location2, function (address) {
            $("#toInput").val(address);
        });
        $("#clearInputFieldToButton").show();
    }
    if (state.location1 || state.location2) {
        showLocationsOnMap();
    }

    setTimeout(function(){ 
        getVeloParkData();
    }, 3000);
    
});
