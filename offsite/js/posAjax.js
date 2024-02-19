var POSS = POSS || {};

POSS.Ajax = function(){};
POSS.Ajax.prototype.request = function(options){
	var response;
	$.ajax({
		url: options.url,
		type: options.type == undefined? 'GET' : options.type,
		cache: false,
		dataType: options.dataType == undefined ? 'json' : options.dataType,
		data: options.data,
		contentType: options.contentType == undefined ? 'application/json' : options.contentType,
        async: options.async == false ? false : true,
        success: function (data) {
            response = data;
            if (options.success) options.success(data);
        },
		error: function (xhr, status, error) {
			uilog("DBUG", xhr);
			uilog("DBUG", status);
			uilog("DBUG", error);
			if (options.error) options.error({errorCode : xhr.status , status : status, error: error});
		},
        complete: function () {
            if (options.complete) options.complete();
        }
	});
};

POSS.Ajax.prototype.requestGET = function(options){
	$.ajax({
		url			: options.url,
		type		: 'GET',
		async		: options.async == false ? false : true,
		timeout		: options.timeout == undefined ? 60000 : options.timeout,
		contentType	: options.contentType == undefined ? 'application/json' : options.contentType,
        success		: function (data) {
            			if (options.success) options.success(data);
        			},
		error		: function (xhr, status, error) {
						if (options.error) options.error({errorCode : xhr.status , status : status, error: error});
					},
        complete	: function () {
            			if (options.complete) options.complete();
        			}
	});
};

POSS.Ajax.prototype.requestPOST = function(options){
	$.ajax({
		url: options.url,
		type: 'POST',
		async: options.async == false ? false : true,
		timeout		: options.timeout == undefined ? 60000 : options.timeout,
		contentType: options.contentType == undefined ? 'application/json' : options.contentType,
		dataType: options.dataType == undefined ? 'json' : options.dataType,
		data: options.data,
        success: function (data) {
            if (options.success) options.success(data);
        },
		error: function (xhr, status, error) {
			if (options.error) options.error({errorCode : xhr.status , status : status, error: error});
		},
        complete: function () {
            if (options.complete) options.complete();
        }
	});
};