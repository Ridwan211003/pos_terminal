var dTable_hypercashSequenceListTable_params = {
		"sAjaxSource" : webContextPath + "/hypercash/hypercashsequence/dataListTable",
		"sPaginationType" : "full_numbers",
		"bServerSide" : true,
		"bProcessing" : true,
		"oLanguage" : {
			"sSearch": "Search Hypercash Sequence:"
		},
		"fnInitComplete" : function(oSettings, json) {
			dTable_hypercashSequenceListTable.fnAdjustColumnSizing(true);
		},
		"aoColumns" : [{
			"mData" : "id",
			"sDefaultContent" : "",
			"bVisible" : true,
			"bSearchable" : true,
			"bSortable" : true
		}, {
			"mData" : "prefix",
			"sDefaultContent" : "",
			"bVisible" : true,
			"bSearchable" : true,
			"bSortable" : true
		}, {
			"mData" : "cycleYear",
			"sDefaultContent" : "",
			"bVisible" : true,
			"bSearchable" : true,
			"bSortable" : true
		}, {
			"mData" : "startValue",
			"sDefaultContent" : "",
			"bVisible" : true,
			"bSearchable" : true,
			"bSortable" : true,
			"mRender" : renderHypercashSequenceRangeValueString
		}, {
			"mData" : "endValue",
			"sDefaultContent" : "",
			"bVisible" : true,
			"bSearchable" : true,
			"bSortable" : true,
			"mRender" : renderHypercashSequenceRangeValueString
		}, {
			"mData" : "currentValue",
			"sDefaultContent" : "",
			"bVisible" : true,
			"bSearchable" : true,
			"bSortable" : true
		}, {
			"mData" : "maxedOut",
			"sDefaultContent" : "",
			"bVisible" : true,
			"bSearchable" : true,
			"bSortable" : true
		}, {
			"mData" : "active",
			"sDefaultContent" : "",
			"bVisible" : true,
			"bSearchable" : true,
			"bSortable" : false
		}, {
			"mData" : "sequenceCode",
			"sDefaultContent" : "",
			"bVisible" : true,
			"bSearchable" : true,
			"bSortable" : true
		}, {
			"mData" : "id",
			"sDefaultContent" : "",
			"bVisible" : true,
			"bSearchable" : true,
			"bSortable" : true,
			"mRender" : renderHypercashSequenceAction
		}]
};

function renderHypercashSequenceAction(data, type, full){
	if(full.maxedOut == true){
		return "";
	}
	
	if(full.active == true){
		return "";
	}
	
	if(full.currentValue == full.startValue){
		var url = webContextPath + "/hypercash/hypercashsequence/update/" + data;
		return "<a href='" + url + "'> Edit </a>";
	}
}

function renderHypercashSequenceRangeValueString(data, type, full){
	var pref = '';
	if(!!full.prefix){
		var pref = "" + full.prefix + "."; 
	}
	
	return pref + "00000000".substring(0, 8 - data.toString().length) + data;
}