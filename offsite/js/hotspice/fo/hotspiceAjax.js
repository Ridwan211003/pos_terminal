var HOTSPICE_AJAX = HOTSPICE_AJAX || {};

HOTSPICE_AJAX = {
	/**
	 * URLs for hot spice-related web services.
	 */
	url: {
		hotSpiceCategories: proxyUrl + "/getHotSpiceCategoriesWithPagination",
		hotSpiceItems: proxyUrl + "/getHotSpiceItemsWithPagination"
	},
	
	/**
	 * Displays paginated Hot Spice items.
	 * @param url - proxy URL to access list of Hot Spice items.
	 * @param data - data needed for pagination.
	 * @return Object - list of Hot Spice items to be displayed.
	 */
	getHotSpiceInfoWithPagination: function(url, data) {
		return JSON.parse($.ajax({
			url : url,
			type : "GET",
			async : false,
			data : data,
			dataType : "json",
			error : function(jqXHR, status, error) {
				showMsgDialog('Error: ' + error, "error");
			},
		}).responseText);
	}
}