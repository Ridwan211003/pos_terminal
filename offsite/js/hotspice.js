var page = 1;
var maxResult = 24;

$("#hotspice-dialog").dialog({
	width : 680,
	height: 460,
	resizable : false,
	draggable : false,
	modal : true,
	autoOpen : false,
	closeOnEscape : false
});

$("#hsPreviousBtn").click(function() {
	page -= 1;
	displayHotspiceItems();
});

$("#hsNextBtn").click(function() {
	page += 1;
	displayHotspiceItems();
});

$("#hsCancelBtn").click(function() {
	$("#hotspice-dialog").dialog("close");
});

$("#hotspice-dialog").on("dialogopen", function(event, ui) {
	displayHotspiceItems();
});

$("#hotspice-dialog").on("dialogclose", function(event, ui) {
	// initialize to default value
	page = 1;
	$('#hotspiceTableDiv').hide();
});

function displayHotspiceItems() {
	var obj = getHotspiceWithPagination(page,maxResult);
	var cntr = 0;
	uilog("DBUG", obj);
	$("#hotspiceItemTable tr").each(function() {
		$(this).find("td").each(function() {
			var hsObj = obj.hotspiceArr[cntr++]
			if (hsObj) {
				// need to unbind/remove first the click event to avoid duplicate event call.
				$(this).find("div div").off("click")
					   .text(hsObj.description)
					   .css("text-transform", "uppercase")
					   .css("word-wrap", "break-word")
					   .on("click", function() {
					addHotspiceItem(hsObj.ean13Code);
					$("#hotspice-dialog").dialog("close");
				});
			} else {
				$(this).find("div div").text("N/A");
			}
		});
	});
	
	if (obj.hasPrevious)
		$("#hsPreviousBtn").prop("disabled",false);
	else
		$("#hsPreviousBtn").prop("disabled",true);
	
	if (obj.hasNext)
		$("#hsNextBtn").prop("disabled",false);
	else
		$("#hsNextBtn").prop("disabled",true);
		
	$("#hotspiceTableDiv").show();
}

function addHotspiceItem(barcode) {
	var prodObj = findItem(barcode);
	
	if (prodObj)
		addItem(prodObj);
}

function getHotspiceWithPagination(page, pageSize) {
	return JSON.parse($.ajax({
		url : proxyUrl + "/getHotspiceWithPagination",
		type : "GET",
		async : false,
		data : {
			page : page,
			pageSize : pageSize
		},
		dataType : "json",
		error : function(jqXHR, status, error) {
			showMsgDialog('Error: ' + error, "error");
		},
	}).responseText);
}
