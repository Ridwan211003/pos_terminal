$("#bananareport-dialog").dialog({
	width : 750,
	height : 580,
	resizable : false,
	draggable : false,
	modal : true,
	autoOpen : false,
	closeOnEscape : false,
	dialogClass : "no-close",
	open : function(event, ui) {},
	buttons : {
		"Cancel": function(event, ui) {
			$(this).dialog("close");
		},
		"Submit": function(event, ui) {
			Banana.service.submitCashierBananaReport();
			$(this).dialog("close");
			
			$('#brMessageSubmitted').html('Banana report was successfully submitted.');
			$("#bananareport-dialog-without-submit").dialog("open");
		}
	}
});

$("#bananareport-dialog-without-submit").dialog({
	width : 400,
	height : 230,
	resizable : false,
	draggable : false,
	modal : true,
	autoOpen : false,
	closeOnEscape : false,
	dialogClass : "no-close",
	open : function(event, ui) {},
	buttons : {
		"Close": function(event, ui) {
			$(this).dialog("close");
		}
	}
});

