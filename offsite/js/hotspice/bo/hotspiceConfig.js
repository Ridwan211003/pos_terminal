var HOTSPICE_CONFIG = HOTSPICE_CONFIG || {};

/**
 * Hot Spice-related global variables.
 */
HOTSPICE_CONFIG.validFormats = ["csv"];

HOTSPICE_CONFIG.ui = {
	/**
	 * Shows if the Hot Spice entry is valid or not.
	 * @param data
	 * @param type
	 * @param full - representation of HotSpizzeDTO.
	 * @return String - returns "Y" if item is valid; else, "N".
	 */
	renderValidValue : function(data, type, full) {
		uilog("DBUG","data: %s | type: %s | full: %s", data, type, full);

		return full.valid ? "Y" : "N";
	}
}

HOTSPICE_CONFIG.service = {
	/**
	 * Shows available actions that the user can do.
	 * @param data
	 * @param type
	 * @param full - representation of HotSpizzeDTO.
	 * @return String - html representation of actions.
	 */
	renderAdminActions: function(data, type, full) {
		return "<a href='updateHotSpiceItem?id="+full.id+"' id='"+full.id+"-button' name='"+full.id+"'>UPDATE</a>" +
			   "  |  <a href='' id='"+full.id+"-button' name='"+full.id+"' onclick='HOTSPICE_CONFIG.service.confirmHotSpiceItemDelete(\""+full.id+"\");return false;'>DELETE</a>"
	},

	/**
	 * Shows a dialog to confirm deletion of Hot Spice item. Function is also supplied once the user confirms the action.
	 * @param id - Hot Spice id.
	 * @return boolean - returns static boolean false to stop click propagation.
	 */
	confirmHotSpiceItemDelete: function(id) {
		showConfirmDialog("Do you want to delete this item?", "Delete", function() {
			$.ajax({
		        url : webContextPath + "/admin/deleteHotSpiceItem",
		        type : "GET",
		        //contentType : "application/json; charset=utf-8",
		        async : false,
		        data : {
		        	"id": id
		        },
		        success : function(res) {
					if (res) {
						showMsgDialog("Successfully deleted!", "info");

						var current_index = $("#configTabs").tabs("option","active");
						$("#configTabs").tabs("load", current_index);
						//$("#hotspiceConfigTable").dataTable().fnReloadAjax();
					} else {
						showMsgDialog("Unsuccessful deletion. Error was encountered.", "error");
					}
				},
		        error : function(jqXHR, status, error) {
		        	showMsgDialog("Error: " + error, "error");
		        }
	    	});
		});

		return false;
	}
};

HOTSPICE_CONFIG.util = {
	/**
	 * Validates if the file type to be uploaded is included in the allowed file extension(s).
	 * @param fileName - complete name of file to be uploaded.
	 * @return boolean - returns true if it has passed the validation; else, false.
	 */
	isFileFormatValid: function(fileName) {
		var ext = fileName.substring(fileName.indexOf(".") + 1);

		for (var i = 0; i < HOTSPICE_CONFIG.validFormats.length; i++) {
			if (ext == HOTSPICE_CONFIG.validFormats[i]) {
				return true;
			}
		}

		return false;
	},

	/**
	 * Validates the file to be uploaded. Should not be empty and should be of correct file type.
	 * @param fileName - complete name of the file to be uploaded.
	 * @return boolean - returns true if it has passed the validation; else, false.
	 */
	isFileInputValid: function(fileName) {
		return (fileName 							//should not be undefined
				&& fileName.trim() != "" 			//should not be empty string
				&& this.isFileFormatValid(fileName));	//should have valid file ext
	},

	/**
	 * Clears Hot Spice-related fields.
	 */
	clearHotSpiceFields: function() {
		$("#hsCategory_error").html("");
		$("#hsSequence_error").html("");
		$("#hsButtonName_error").html("");
		$("#hsCode_error").html("");
	},

	/**
	 * Validates values supplied in all of the fields.
	 */
	validateHotSpiceFields: function() {
		var valid = true;
		var cat = $("#hsCategory").val().trim();
		var seq = $("#hsSequence").val().trim();
		var desc = $("#hsDescription").val().trim();
		var btn = $("#hsButtonName").val().trim();
		var eCode = $("#hsCode").val().trim();

		if (cat == "") {
			$("#hsCategory_error").html("Category is required.");
			valid = false;
		}

		if (seq == "") {
			$("#hsSequence_error").html("Sequence is required.");
			valid = false;
		} else if (isNaN(seq) || seq < 1) {
			$("#hsSequence_error").html("Sequence must be a valid number greater than 0.");
			valid = false;
		}

		if (btn == "") {
			$("#hsButtonName_error").html("Button name is required.");
			valid = false;
		}

		/*if (desc == "") {
			$("#hsDescription_error").html("Description is required.");
			valid = false;
		} */

		if (eCode == "") {
			$("#hsCode_error").html("Product code is required.");
			valid = false;
		} else if (eCode != "") {
			if (!this.findProductByEan13code(eCode)) {
				$("#hsCode_error").html("Product code not found.");
				valid = false;
			}
		}

		return valid;
	},

	/**
	 * Checks if the product is in the Product database table.
	 * @param barCode - product ean13code.
	 * @return boolean - returns true if product can be found; else, false.
	 */
	findProductByEan13code: function(barCode) {
		var proceed = false;

		$.ajax({
			url : webContextPath + "/product/getProductByBarcode/" + barCode,
			type : "GET",
			async : false,
			dataType : "json",
			success : function(data, status) {
				if (!jQuery.isEmptyObject(data) && !data.error) {
					proceed = true;
				}
			},
			error : function(jqXHR, status, error) {
				uilog('DBUG','Error: ' + error + "\nError Response: " + jqXHR.responseText);
			}
		});

		return proceed;
	}
};
