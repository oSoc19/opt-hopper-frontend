Bike for Brussels Route Planner

Popular routeplanner apps often do not consider bike-friendly routes and therefore are not optimal to use when cycling in the city. We are building a routeplanning app for bikers that considers cycling infrastructure, road quality and other criteria to provide the best route to get to where you want to go.

The route planner can be found here: https://http://cycling-backend.anyways.eu/


- Profiles

The Cycling Planner offers the user to choose between 4 profiles: Fast, Balanced, Relaxed, Networks.

-- Fast

This profile is the default profile. It considers distance and speed to return the route with the minimum time to destination.

-- Balanced

This profile considers street size/categorization and cycle infrastructure. The following OSM keys are being used: highway=*, cycleway=*, cycleway:left=*, cycleway:right=*. Factors between 0,8 and 1,2 are assigned to every possible key=tag combination. This factor gets multiplied with the standard line weight of the default profile. For example, a big street without bike infrastructure has a high weight and is therefore less likely to be part of a balanced route.

-- Relaxed

This profile considers street size/categorization, cycle infrastructure, surface quality, and parked cars. The following OSM keys are being used: highway=*, cycleway=*, cycleway:left=*, cycleway:right=*, surface=*, parking:lane:both=*. Factors between 0,8 and 1,2 are assigned to every possible key=tag combination. This factor gets multiplied with the standard line weight of the default profile. For example, a street with cobblestones, no bike infrastructure and parallel parked cars on both sides has a very high weight and is therefore less likely to be part of a relaxed route.

-- Networks

This profile heavily prefers streets that are on the diverse Cycle Network. The weight of every line that is part of the network gets divided by 3 and which makes that street highly likely to be part of a given route.


- Feature list

-- Export

The Cycling Route Planner offers exporting routes as .gpx files. These files can be opened with different navigation applications and used for navigation (e.g. Galileo). Moreover, there is a Print function that enables the user to print out the map with the route and turn-by-turn instructions.

-- Languages

The Cycling Route Planner is available in English, French and Dutch.

-- Geolocation

The Cycling Route Planner enables the user to see his current location on the map.




