var HC_WEIGH_SCALE = HC_WEIGH_SCALE || {};

/**
 * Global variables for HC weighing scale
 */
HC_WEIGH_SCALE.variables = {
	pluDigits: null,
	selectedItemCode: null,
	selectedItemDesc: null,
	selectedItemPrice: 0,
	weightInput: null,
	minimumWeight: 15.0
	//priceLength: 6
};

HC_WEIGH_SCALE.service = {
	/**
	 * Prompts the pop-up dialog where the cashier can search product by plu.
	 */
    promptWeighingScaleEnterPluDialog: function() {
    	$("#hcWeighScaleSearchItem-dialog").dialog("open");
    },

    /**
     * Prompts the pop-up dialog where the cashier can enter the weight.
     */
    promptWeighingScaleEnterKgDialog: function() {
    	$("#hcWeighScaleEnterKg-dialog").dialog("open");
    },

    /**
     * Renders the result when searching for product in the specified container.
     * @param container - html element where the result will be rendered.
     * @param productList - list of products to be rendered.
     * @return String - html representation of result.
     */
    renderResult: function(container, productList) {
    	container.html("");
    	var returnHtml = "";

    	$.each(productList, function(i, item) {
    		if (i%2 == 0) {
				returnHtml += '<tr class="lightgray">';
			} else {
				returnHtml += '<tr>';
			}

			returnHtml += '<td><div style="width: 80px; text-align: center;"><input type="radio" name="wsProduct" value="'+ item.ean13Code + '" id="ti_' + item.ean13Code 
						+ '" style="width: 80px;" data-productName="'+ item.description +'" data-price="'+ item.currentPrice +'" /></div></td>';
			returnHtml += '<td><div style="width: 250px;">'+ item.description + '</div></td>';
			returnHtml += '<td><div style="width: 150px; text-align: center;">' + item.ean13Code + '</div></td>';
			returnHtml += '<td><div style="width: 150px; text-align: center;">' + numberWithCommas(item.currentPrice) + '</div></td>'; 
			returnHtml += '</tr>';
    	});

    	container.html(returnHtml);
    	return returnHtml;
    },

    /**
     * Sets the corresponding global variable with the item selected.
     */
    saveSelectedItem: function() {
    	$("#wsProductName").text(HC_WEIGH_SCALE.variables.selectedItemDesc);
    },

    /**
     * Function to execute after the weight has been entered.
     */
    processWeightInput: function() {
    	var newBarCode = this.generateNewBarCode(HC_WEIGH_SCALE.variables.selectedItemCode, HC_WEIGH_SCALE.variables.selectedItemPrice);
    	var prodObj = findItem(newBarCode);
    	
    	if (prodObj) {
    		itemQty = HC_WEIGH_SCALE.variables.weightInput;
    		prodObj.quantity = HC_WEIGH_SCALE.variables.weightInput;
    		prodObj.weight = HC_WEIGH_SCALE.variables.weightInput;
    		addItem(prodObj);
    	}

    	$("#hcWeighScaleEnterKg-dialog").dialog("close");
    	Hypercash.service.autoTagCustomerAsNonMember();
    },

    /**
     * Applies all post process to do before item will be printed in screen.
     * @param orderItem - item where the post process will be applied.
     */
    applyPostProcess: function(orderItem) {},

    /**
     * Generates a new barcode for fresh goods.
     * Replaces the sequence with the computed price.
     * @param origEan13Code - original barcode of the fresh good.
     * @param price - computed price that will be placed in the barcode.
     * @return String - newly generated barcode.
     */
    generateNewBarCode: function(origEan13Code, price) {
    	/*var newBarCode = null;
    	var paddedPrice = HC_WEIGH_SCALE.util.addPadding(price, "0", true, HC_WEIGH_SCALE.variables.priceLength);

    	if (paddedPrice.length == HC_WEIGH_SCALE.variables.priceLength) {
    		newBarCode = origEan13Code.substring(0, 6) + paddedPrice + origEan13Code.substring(origEan13Code.length - 1, origEan13Code.length);
    	}*/
    	var valToAppend = Math.floor(price);

    	if (getConfigValue("FRESH_GOODS_SCAN_MODE") == 2) {
    		valToAppend = HC_WEIGH_SCALE.variables.weightInput * 1000;
		valToAppend = valToAppend.toString().leftPad("0", 6);
    	}

    	var newBarCode = origEan13Code.substring(0, 6) + valToAppend + origEan13Code.substring(origEan13Code.length - 1, origEan13Code.length);

    	uilog("DBUG","~~~~~newBarCode: ", newBarCode);

    	return newBarCode;
    }
};

HC_WEIGH_SCALE.util = {
	/**
	 * Validates the entered plu.
	 * @return boolean - true if plu passed the validation(s); else, false.
	 */
	isPluInputValid: function() {
		if (HC_WEIGH_SCALE.variables.pluDigits.length == 0) {
			$("#hcWeighScaleEnterPluErrorSpan").html(getMsgValue("ws_error_no_plu_input"));
			return false;
		} else if (HC_WEIGH_SCALE.variables.pluDigits.length < 6) {
			$("#hcWeighScaleEnterPluErrorSpan").html(getMsgValue("ws_error_invalid_plu"));
			return false;
		}

		return true;
	},

	/**
     * Checks if the user has selected an item before proceeding to next step.
     * @return boolean - true if there is a selected item; else, false.
     */
	hasSelectedItem: function() {
		var $selectedItem = $("input[name=wsProduct]:checked");
    	HC_WEIGH_SCALE.variables.selectedItemCode = $selectedItem.val();
    	HC_WEIGH_SCALE.variables.selectedItemDesc = $selectedItem.attr("data-productName");
    	HC_WEIGH_SCALE.variables.selectedItemPrice = $selectedItem.attr("data-price");
    	
		if (!HC_WEIGH_SCALE.variables.selectedItemCode) {
			$("#hcWeighScaleEnterPluErrorSpan").html(getMsgValue("ws_error_no_selected_item"));
			return false;	
		} else {
			return true;
		}
	},

	/**
     * Validates the weight entered.
     * @return boolean - true if weight passed the validation(s); else, false.
     */
	isWeightInputValid: function() {
		uilog("DBUG","execute isWeightInputValid");

		if (!HC_WEIGH_SCALE.variables.weightInput) {
			$("#hcWeighScaleEnterKgErrorSpan").html(getMsgValue("ws_error_no_weight_input"));
			return false;
		} else if (HC_WEIGH_SCALE.variables.weightInput == 0) {
			$("#hcWeighScaleEnterKgErrorSpan").html(getMsgValue("ws_error_zero_weight"));
			return false;
		} else if (HC_WEIGH_SCALE.variables.weightInput < HC_WEIGH_SCALE.variables.minimumWeight) {
			$("#hcWeighScaleEnterKgErrorSpan").html(getMsgValue("ws_error_minimum_weight").format(HC_WEIGH_SCALE.variables.minimumWeight));
			return false;
		} else {
			return true;
		}
	},

	/**
     * Clears the result table when searching for product by plu.
     */
	clearSearchResult: function() {
		$("#hcWeighScaleSelectItemTable > tbody").html(""); //empty tbody
		$("#hcWeighScaleSelectItemTable").hide(); //hide table
	},

	/**
     * Clears the html element that contains the error msg if there is any.
     */
	clearErrorMsg: function() {
		$("#hcWeighScaleEnterPluErrorSpan").html("");
		$("#hcWeighScaleEnterKgErrorSpan").html("");
	},

	/**
     * Returns the plu input pop-up dialog to its default state.
     */
	resetPluInputDialog: function() {
		$("#wsPlu").val("");
		this.clearErrorMsg();
		this.clearSearchResult();
	},

	/**
     * Returns the weight input pop-up dialog to its default state.
     */
	resetWeightInputDialog: function() {
		$("#wsKilogram").val("");
		this.clearErrorMsg();
	},

	/**
     * Resets the global variables for HC weighing scale to its default values.
     */
	resetVariables: function() {
		HC_WEIGH_SCALE.variables.pluDigits = null;
		HC_WEIGH_SCALE.variables.selectedItemCode = null;
		HC_WEIGH_SCALE.variables.selectedItemDesc = null;
		HC_WEIGH_SCALE.variables.selectedItemPrice = 0;
		HC_WEIGH_SCALE.variables.weightInput = null;
	},

	/*
	 * Pads the base text with the specified character to use
	 * in the beginning / end to reach the desired max length.
	 * @param baseText - base text to start with.
	 * @param charToPad - character to be used as padding (should only be single char).
	 * @param atBeginning - if true, will add the padding in the beginning of base text; else, in the end.
	 * @param maxLength - max length to reach (baseText + padding).
	 * @return String - padded base text.
	 */
	addPadding: function(baseText, charToPad, atBeginning, maxLength) {
		var noOfPadding = maxLength - baseText.length;
		var totalPadding = "";

		if (noOfPadding > 0) {
			for (var i = 0; i < noOfPadding; i++) {
				totalPadding += charToPad;
			}
		}

		if (atBeginning) {
			baseText = totalPadding + baseText;
		} else {
			baseText = baseText + totalPadding;
		}

		return baseText;
	}
};

$("#wsPlu").change(function() {
	HC_WEIGH_SCALE.util.clearSearchResult();
	HC_WEIGH_SCALE.variables.pluDigits = $("#wsPlu").val();

	if (HC_WEIGH_SCALE.util.isPluInputValid()) {
		HC_WEIGH_SCALE.util.clearErrorMsg();

		Hypercash.ajax.getProductsByBarcodeStartingWith(HC_WEIGH_SCALE.variables.pluDigits, function(data) {
			if (data) {
				HC_WEIGH_SCALE.service.renderResult($("#hcWeighScaleSelectItemTable > tbody"), data);

				$("#hcWeighScaleSelectItemTable").show();
			} else {
				$("#hcWeighScaleEnterPluErrorSpan").html(getMsgValue("ws_no_search_result"));
			}			
		});
	}
});

$("#wsPlu").keyboard({
	display: numberDisplay2,
    layout: 'custom',
    maxLength : 6,
    customLayout: customNumberLayout2
});

$("#wsKilogram").keyboard({
	display: numberDisplay2,
    layout: 'custom',
    customLayout: customNumberLayout3,
    change : function(e, keyboard, el) {
        var val = keyboard.$preview.val().match(/(\d+)(\.\d{0,3})?/);
        
        if (val) {
            keyboard.$preview
                .val(val.slice(1).join(''))
                .caret( keyboard.lastCaret.start, keyboard.lastCaret.end );
        }
    }
});

//dialogs
$("#hcWeighScaleSearchItem-dialog").dialog({
	width : 685,
	height : 350,
	resizable : false,
	draggable : false,
	modal : true,
	autoOpen : false,
	closeOnEscape : false,
	open: function(event, ui) {
		HC_WEIGH_SCALE.util.resetPluInputDialog();
		HC_WEIGH_SCALE.util.resetVariables();
	},
	close: function(event, ui) {
		HC_WEIGH_SCALE.util.resetPluInputDialog();
	},
	buttons : {
		Enter : function() {
			if (HC_WEIGH_SCALE.util.hasSelectedItem()) {
				HC_WEIGH_SCALE.util.clearErrorMsg();
				HC_WEIGH_SCALE.service.saveSelectedItem();
				$("#hcWeighScaleSearchItem-dialog").dialog("close");
				HC_WEIGH_SCALE.service.promptWeighingScaleEnterKgDialog();
			}
		},
		Clear : function() {
			HC_WEIGH_SCALE.util.resetPluInputDialog();
		}
	}
});

$("#hcWeighScaleEnterKg-dialog").dialog({
	width : 375,
	height : 250,
	resizable : false,
	draggable : false,
	modal : true,
	autoOpen : false,
	closeOnEscape : false,
	open: function(event, ui) {
		HC_WEIGH_SCALE.util.resetWeightInputDialog();
	},
	close: function(event, ui) {
		HC_WEIGH_SCALE.util.resetWeightInputDialog();
	},
	buttons : {
		Enter : function() {
			HC_WEIGH_SCALE.variables.weightInput = $("#wsKilogram").val();

			if (HC_WEIGH_SCALE.util.isWeightInputValid()) {
				HC_WEIGH_SCALE.variables.weightInput = parseFloat(HC_WEIGH_SCALE.variables.weightInput);
				HC_WEIGH_SCALE.util.clearErrorMsg();
				HC_WEIGH_SCALE.service.processWeightInput();
			}
		},
		Clear : function() {
			$("#wsKilogram").val(""); //clear weight input field
		}
	}
});
