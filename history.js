function fetch() {
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
	// clear out old data
	$('#mapHistoryResult').html("");
	for (var i = 0; i < data.result.length; i++) {
		$('#mapHistoryResult').append("<tr><td>" + data.result[i].date + "</td><td>" + data.result[i].start + 
								   "</td><td>" + data.result[i].end + "</td><td>" + data.result[i].numMan + "</td></tr>");
	}
}