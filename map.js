const key = "zzxX7xOQAnrYtGAa2zGfhQ09i9jLzv9f"
var from;
var to;
const apiUrl = "http://www.mapquestapi.com/directions/v2/route?key=" + key;

// pings the api by calling multiple subfunctions
function pingAPI() {
	getLocations();
	a = $.ajax({
		url: apiUrl + "&from=" + from + "&to=" + to,
		method: "GET"
	}).done(function(data) {
		displayResults(data)
		postToDatabase(data);
	}).fail(function(error) {
		console.log("error", error.statusText);
	});
}

// pings api to get location data
function getLocations() {
	// get the address objects
	//replace all spaces with %20 (solution found here: https://stackoverflow.com/questions/12141251)
	from = encodeURIComponent($("#from").val());
	to = encodeURIComponent($("#to").val());
	
	const locUrl = "http://www.mapquestapi.com/geocoding/v1/address?key=" + key + "&location=";
	var from_coords;
	var to_coords;

	// get from data
	a_from = $.ajax({
		url: locUrl + from + "&thumbMaps=false",
		method: "GET"
	}).done(function(data) {
		// data object dies after this block, so we stringify it
		from_coords = JSON.stringify(data.results[0].locations[0].latLng);
	}).fail(function(data) {
		console.log("error", error.statusText);
	});
	
	//get to data
	a_to = $.ajax({
		url: locUrl + to + "&thumbMaps=false",
		method: "GET"
	}).done(function(data) {
		// data object dies after this block, so we stringify it
		to_coords = JSON.stringify(data.results[0].locations[0].latLng);
	}).fail(function(data) {
		console.log("error", error.statusText);
	});
	
	// have to give the ajax calls time to work through so that we don't end up with empty objects
	//https://stackoverflow.com/questions/1687332
	setTimeout(function(){getElevationMap(from_coords, to_coords)}, 500);
}

// get the elevation map and put it into the page
function getElevationMap(from_coords, to_coords) {
	// console.log(from_coords, to_coords);
	json_from = JSON.parse(from_coords);
	json_to = JSON.parse(to_coords);
	const elevationUrl = "http://open.mapquestapi.com/elevation/v1/chart?key=" + key + "&shapeFormat=raw&width=400&height=300&latLngCollection=";
	// fetch api; https://stackoverflow.com/questions/47001306
	const fetchUrl = elevationUrl + json_from.lat + "," + json_from.lng + "," + json_to.lat + "," + json_to.lng;
	fetch(fetchUrl).then(res=>{return res.blob()})
			  .then(blob=>{
					var img = URL.createObjectURL(blob);
					document.getElementById('mapElevation').setAttribute('src', img);
	})
}

function displayResults(data) {
	$('#directions').html(''); // clear out past stuff
	for (var i = 0; i < data.route.legs[0].maneuvers.length-1; i++) {
		var cur = data.route.legs[0].maneuvers[i];
		// console.log(cur);
		// append this direction with its own row split by two columns
		$('#directions').append('<div class="row">' + 
							    '<div class="col-md-4"><img src=' + cur.mapUrl + '></div>' +
							    '<div class="col-md-8">' +
							    'Distance: ' + cur.distance + 'km<br>' +
								'Time: ' + cur.formattedTime + '<br>' +
								cur.narrative + '<br>' +
							    '</div>' +
							    '</div>'); 
	}
	
	// fencepost for the last one bc it doesnt have a photo
	var cur = data.route.legs[0].maneuvers[data.route.legs[0].maneuvers.length-1]; // last one
	$('#directions').append('<br><div class="row">' + 
							    '<div class="col-md-12">' +
								'<h6>Arrived</h6>' +
								cur.narrative + '<br>' +'</div>' +
							    '</div>'); 
}

function postToDatabase(directions) {
	const dbUrl = "http://maldonbd.aws.csi.miamioh.edu/final.php?method=setLookup";
	var numMan = encodeURIComponent(directions.route.legs[0].maneuvers.length);
	var json = {"obj":JSON.stringify(directions)}; // encode JSON for post
	b = $.ajax({
		url: dbUrl + "&start=" + from + "&end=" + to + "&numMan=" + 
		     numMan,
		method: "POST",
		data:json
	}).done(function(data) {
		console.log(data)
		console.log("success");
	}).fail(function(error) {
		console.log("error", error.statusText);
	});
}
