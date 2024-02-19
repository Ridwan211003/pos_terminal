var HOTSPICE_MODULE = HOTSPICE_MODULE || {};

/**
 * Hot Spice-related global variables.
 */
HOTSPICE_MODULE.variables = {
	page: 1,
	maxResult: 24,
	tableNumber: null,
	onCategoryMode: true, //true if in Categories pop-up; else, false if in Items pop-up
	currentCategory: "",
	titleCategory: "Hot Spice Categories"
};

HOTSPICE_MODULE.service = {
	/**
	 * Resets Hot Spice-related global variables to their default values.
	 */
	resetTransactionVariables: function() {
		HOTSPICE_MODULE.variables.tableNumber = null;
		HOTSPICE_MODULE.variables.onCategoryMode = true;
		HOTSPICE_MODULE.variables.currentCategory = "";
		HOTSPICE_MODULE.variables.page = 1;
	},

	/**
	 * Checks if the list of order items contains at least one (1) Hot Spice item.
	 * @param summarizedOrderItems - list of valid order items excluding the voided ones.
	 * @return boolean - returns true if has at least one (1) Hot Spice item; else. false.
	 */
	hasHotSpiceItems: function(summarizedOrderItems) {
		var hasItem = false;

		if (summarizedOrderItems) {
			summarizedOrderItems.forEach(function(item) {
				if (item.isHotSpiceItem) {
					hasItem = true;
					return;
				}
			});
		}

		return hasItem;
	}
};

HOTSPICE_MODULE.print = {
	/**
	 * Prints the supplied table number in actual receipt.
	 * @param tableNumber - table number supplied in Hot Spice dialog.
	 * @return PrintBlock - object representation for table number.
	 */
	printTableNumberInReceipt: function(tableNumber) {
		return new PrintBlock(RECEIPT_POS_JUSTIFIED, 
							  setLineSummaryItem(getMsgValue('hotspice_label_receipt_table_number'), tableNumber));
	},

	/**
	 * Prints the supplied table number in cashier screen.
	 * @param tableNumber - table number supplied in Hot Spice dialog.
	 */
	printTableNumberInScreen: function(tableNumber) {
		if (tableNumber) {
			var isOneLine = true; 
			$("#scannedItemsDiv").append(payInfoSummaryLine(isOneLine, getMsgValue('hotspice_label_receipt_table_number'), tableNumber));
		}
	}
}

$("#hotSpiceTableNumber-dialog").dialog({
	width : 375,
	height : 250,
	resizable : false,
	draggable : false,
	modal : true,
	autoOpen : false,
	closeOnEscape : false,
	dialogClass : "no-close",
	open : function(event, ui) {
		$("#hsTableNumberLbl").html(getMsgValue("hotspice_label_table_number"));
	},
	buttons : {
		Cancel : function() {
			if (saleTx && saleTx.orderItems && !HOTSPICE_MODULE.service.hasHotSpiceItems(saleTx.orderItems)) {
				HOTSPICE_MODULE.service.resetTransactionVariables();
			}

			$(this).dialog("close");
		},
		OK : function() {
			HOTSPICE_MODULE.variables.tableNumber = $("#hsTableNumber").val().trim();

			if (!HOTSPICE_MODULE.variables.tableNumber || HOTSPICE_MODULE.variables.tableNumber == "") {
				//$("#hsTableNumberError").html(getMsgValue("hotspice_error_no_table_number"));
			} else {
				$(this).dialog("close");
				$("#hotSpice-dialog").dialog("open");
			}
		}
	}
});

$("#hotSpiceTableNumber-dialog").on("dialogclose", function(event, ui) {
	$("#hsTableNumber").val(""); //clear input text
	$("#hsTableNumberError").html(""); //clear error message
});

$("#hotSpice-dialog").dialog({
	width : 680,
	height: 460,
	resizable : false,
	draggable : false,
	modal : true,
	autoOpen : false,
	closeOnEscape : false
});

$("#hotSpice-dialog").on("dialogopen", function(event, ui) {
	if (HOTSPICE_MODULE.variables.onCategoryMode) {
		$("#hotSpice-dialog").dialog("option", "title", HOTSPICE_MODULE.variables.titleCategory);
		$("#hsChangeTableNumber").html(getMsgValue("hotspice_label_btn_change_table"));
		displayHotSpiceCategories();
	} else {
		$("#hotSpice-dialog").dialog("option", "title", HOTSPICE_MODULE.variables.currentCategory);
		displayHotSpiceItems();
	}
});

$("#hotSpice-dialog").on("dialogclose", function(event, ui) {
	// initialize to default value
	HOTSPICE_MODULE.variables.page = 1;
	HOTSPICE_MODULE.variables.onCategoryMode = true;
	$('#hotspiceTableDiv').hide();
});

$("#hsItemPreviousBtn").click(function() {
	HOTSPICE_MODULE.variables.page -= 1;
	displayHotSpiceItems();
});

$("#hsItemNextBtn").click(function() {
	HOTSPICE_MODULE.variables.page += 1;
	displayHotSpiceItems();
});

$("#hsCancelBtn").click(function() {
	$("#hotSpice-dialog").dialog("close");
});

$("#hsTableNumber").keyboard({
	display: numberDisplay1,
    layout: 'custom',
    customLayout: customNumberLayout1
});

$("#hsChangeTableNumber").click(function() {
	//HOTSPICE_MODULE.variables.onCategoryMode = true;
	$("#hotSpice-dialog").dialog("close"); 
	$("#hsTableNumber").val(HOTSPICE_MODULE.variables.tableNumber);
	$("#hotSpiceTableNumber-dialog").dialog("open");
	HOTSPICE_MODULE.variables.page = 1;
});

$("#hsChangeCategories").click(function() {
	HOTSPICE_MODULE.variables.onCategoryMode = true;
	HOTSPICE_MODULE.variables.page = 1;
	$("#hotSpice-dialog").dialog("option", "title", HOTSPICE_MODULE.variables.titleCategory);
	displayHotSpiceCategories();
});

/**
 * Displays list of Hot Spice categories that are declared in back office.
 */
function displayHotSpiceCategories() {
	$("#hsItemNavPanelDiv").hide();
	$("#hsCategoryNavPanelDiv").show();
	$("#hotspiceItemTable").find("*").off(); //unbind events of child elements

	var obj = HOTSPICE_AJAX.getHotSpiceInfoWithPagination(HOTSPICE_AJAX.url.hotSpiceCategories, 
														 {	page: HOTSPICE_MODULE.variables.page, 
															pageSize: HOTSPICE_MODULE.variables.maxResult
														 });

	displayHotSpiceInformation(obj, function() {
		

		var cntr = 0;

		$("#hotspiceItemTable tr").each(function() {
			$(this).find("td").each(function() {
				var hsObj = obj.hotspiceArr[cntr++]
				if (hsObj) {
					// need to unbind/remove first the click event to avoid duplicate event call.
					$(this).find("div div")
						   .off("click")
						   .text(hsObj)
						   .css("text-transform", "uppercase")
						   .css("word-wrap", "break-word")
						   .on("click", function() {
						HOTSPICE_MODULE.variables.currentCategory = hsObj;
						HOTSPICE_MODULE.variables.onCategoryMode = false; //change to false if category has been selected already
						HOTSPICE_MODULE.variables.page = 1;

						$("#hotSpice-dialog").dialog("option", "title", HOTSPICE_MODULE.variables.currentCategory);
						displayHotSpiceItems();
					});
				} else {
					$(this).find("div div").text("N/A");
				}
			});
		});
	});
}

/**
 * Displays the Hot Spice items under the selected category.
 */
function displayHotSpiceItems() {
	$("#hsCategoryNavPanelDiv").hide();
	$("#hsItemNavPanelDiv").show();
	$("#hotspiceItemTable").find("*").off(); //unbind events of child elements

	var obj = HOTSPICE_AJAX.getHotSpiceInfoWithPagination(HOTSPICE_AJAX.url.hotSpiceItems, 
														 {	category: HOTSPICE_MODULE.variables.currentCategory, 
															page: HOTSPICE_MODULE.variables.page, 
															pageSize: HOTSPICE_MODULE.variables.maxResult
														 });
	
	displayHotSpiceInformation(obj, function() {
		var cntr = 0;

		$("#hotspiceItemTable tr").each(function() {
			$(this).find("td").each(function() {
				var hsObj = obj.hotspiceArr[cntr++]
				if (hsObj) {
					// need to unbind/remove first the click event to avoid duplicate event call.
					$(this).find("div div")
						   .text(hsObj.buttonName)
						   .css("text-transform", "uppercase")
						   .css("word-wrap", "break-word")
						   .on("click", function() {
						if (toggleVoid) {
							processVoidItemScan(hsObj.ean13Code);
						} else {
							addHotspiceItem(hsObj.ean13Code);
						}
						
						HOTSPICE_MODULE.variables.onCategoryMode = true; //change to true if item has been selected already
						HOTSPICE_MODULE.variables.page = 1;

						$("#hotSpice-dialog").dialog("close"); //comment this if multiple hot spice items can be selected
					});
				} else {
					$(this).find("div div").text("N/A");
				}
			});
		});
	});
}

/**
 * Displays paginated Hot Spice items.
 * @param obj - contains Hot Spice-related data.
 * @param fnDisplayInfo - function that displays the data.
 */
function displayHotSpiceInformation(obj, fnDisplayInfo) {
	fnDisplayInfo();
	
	if (obj.hasPrevious) {
		$(".hsPreviousBtn").prop("disabled",false);
	} else {
		$(".hsPreviousBtn").prop("disabled",true);
	}
	
	if (obj.hasNext) {
		$(".hsNextBtn").prop("disabled",false);
	} else {
		$(".hsNextBtn").prop("disabled",true);
	}

	$("#hotspiceTableDiv").show();
}

/**
 * Adds selected Hot Spice item in the list of order items.
 * @param barcode - product barcode.
 */
function addHotspiceItem(barcode) {
	var prodObj = findItem(barcode);
	
	if (prodObj) {
		prodObj.isHotSpiceItem = true;
		addItem(prodObj);
	}
}
