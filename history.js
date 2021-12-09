const key = "zzxX7xOQAnrYtGAa2zGfhQ09i9jLzv9f"
var cachedData = [];

function fillTable() {
	const dbUrl = "http://maldonbd.aws.csi.miamioh.edu/final.php?method=getLookup";
	date = encodeURIComponent($("#date").val()); 
	n = encodeURIComponent($("#numResults").val());
	// console.log(date, n);
	a = $.ajax({
		url: dbUrl + "&date=" + date + "&n=" + n,
		method: "GET"
	}).done(function(data) {
		displayResults(data);
	}).fail(function(error) {
		console.log("error", error.statusText);
	});
}

function displayResults(data) {
	cachedData = []; // clear out old data
	$('#mapHistoryResult').html(""); // clear out old data
	
	for (var i = 0; i < data.result.length; i++) {
		cachedData[i] = data.result[i];
		$('#mapHistoryResult').append("<tr class='click' onclick='displayDirections(" + i + ")'><td>" 
		                                + data.result[i].date + "</td><td>" + data.result[i].start + "</td><td>" 
										+ data.result[i].end + "</td><td>" + data.result[i].numMan + "</td></tr>");
	}
}


// all of this code is essentially the same as it is in map.js
function displayDirections(i) {
	getLocations(i);
	data = JSON.parse(cachedData[i].obj); 
	console.log(data);
	$('#directions').html(''); // clear out past stuff
	for (var i = 0; i < data.route.legs[0].maneuvers.length-1; i++) {
		var cur = data.route.legs[0].maneuvers[i];
		// console.log(cur);
		// append this direction with its own row split by two columns
		$('#directions').append('<div class="row">' + 
							    '<div class="col-md-8"><img src=' + cur.mapUrl + '></div>' +
							    '<div class="col-md-4">' +
							    'Distance: ' + cur.distance + 'km<br>' +
								'Time: ' + cur.formattedTime + '<br>' +
								cur.narrative + '<br>' +
							    '</div>' +
							    '</div>' + '<br><br>'); 
	}
	
	// fencepost for the last one bc it doesnt have a photo
	var cur = data.route.legs[0].maneuvers[data.route.legs[0].maneuvers.length-1]; // last one
	$('#directions').append('<br><div class="row">' + 
							    '<div class="col-md-12">' +
								'<h6>Arrived</h6>' +
								cur.narrative + '<br>' +'</div>' +
							    '</div><br>'); 
}

// pings api to get location data
function getLocations(i) {
	// get the address objects
	//replace all spaces with %20 (solution found here: https://stackoverflow.com/questions/12141251)
	from = encodeURIComponent(cachedData[i].start);
	to = encodeURIComponent(cachedData[i].end);
	console.log(from, to);
	
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
	setTimeout(function(){getElevationMap(from_coords, to_coords)}, 2000);
}

// get the elevation map and put it into the page
function getElevationMap(from_coords, to_coords) {
	// console.log(from_coords, to_coords);
	json_from = JSON.parse(from_coords);
	json_to = JSON.parse(to_coords);
	console.log(json_from, json_to)
	const elevationUrl = "http://open.mapquestapi.com/elevation/v1/chart?key=" + key + "&shapeFormat=raw&width=400&height=300&latLngCollection=";
	// fetch api; https://stackoverflow.com/questions/47001306
	const fetchUrl = elevationUrl + json_from.lat + "," + json_from.lng + "," + json_to.lat + "," + json_to.lng;
	fetch(fetchUrl).then(res=>{return res.blob()})
			  .then(blob=>{
					var img = URL.createObjectURL(blob);
					document.getElementById('mapElevation').setAttribute('src', img);
	})
}