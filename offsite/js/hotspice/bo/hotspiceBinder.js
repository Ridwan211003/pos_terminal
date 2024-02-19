$(document).on("submit", "#uploadHotSpiceItemsForm", function() {
	var fileName = $("#hotSpiceItemsFile").val();

	if (HOTSPICE_CONFIG.util.isFileInputValid(fileName)) {
		$("#hotSpiceConfigError").html(""); //clear error msg
		return true;
	} else {
		$("#hotSpiceConfigError").html("Invalid file!");
		return false;
	}
});

$(function() {
	$("#updateHotSpiceItemBtn").click(function() {
		HOTSPICE_CONFIG.util.clearHotSpiceFields();

		if (HOTSPICE_CONFIG.util.validateHotSpiceFields()) {
			$("#hotSpiceForm").submit();
		}
		
		return false;
	});

	$("#configTabBackBtn").click(function() {
		window.location.href = webContextPath + "/admin/configTabs?uiTab=6";
	});
});


