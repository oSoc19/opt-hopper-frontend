let map;

function loadMap(coords){ //long, lat
    mapboxgl.accessToken = 'pk.eyJ1IjoiZGFuaWVsbGV0ZXJyYXMiLCJhIjoiY2pqeWJheGxhMGwxODNxbW1sb2UzMGo0aiJ9.Y5HiKm7qjB1vrX7NGTOofA';
    map = new mapboxgl.Map({
    container: 'map', 
    style: 'mapbox://styles/mapbox/streets-v11', 
    center: coords,
    zoom: 9 
    });
}


