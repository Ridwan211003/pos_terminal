var url = {
	transactionById : webContextPath + '/postransaction/homedelivery/gettransaction/',
	getPosTransactions : webContextPath + '/postransaction/homedelivery/getentries/',
	posTxItemById : webContextPath + "/postxitem/getpxitem/",
	posTxItemsByTransactionId : webContextPath + "/postxitem/homedelivery/getpxitems/",
	createCustomerOrder : webContextPath + "/hdtransaction/create/",
	getProvinces : webContextPath + "/homedelivery/hddistance/province/",
	getCitiesByProvince : webContextPath + "/homedelivery/hddistance/city/",
	getAreasByCity : webContextPath + "/homedelivery/hddistance/area/",
	getSubareasByArea : webContextPath + "/homedelivery/hddistance/subarea/",
	getPostalCodeAndProduct : webContextPath + "/homedelivery/hddistance/postalcodeproduct/",
	getSearchOrders : webContextPath + "/hdtransaction/find/",
	updateSearchOrder : webContextPath + "/hdtransaction/updatestatus/", 
	hdTransactionById : webContextPath + "/hdtransaction/",
	completeDeliveryOrder : webContextPath + "/hdtransaction/updatestatus/complete/",
	cancelDeliveryOrder : webContextPath + "/hdtransaction/updatestatus/cancel/",
	authUser : webContextPath + "/user/authUser/",
	getHDTimeSlot : webContextPath + "/hdtimeslot/getHDTimeSlotsForDatePicker/", 
	rescheduleDelivery : webContextPath + "/hdtransaction/reschedule/",
	previewOpDelivReport : webContextPath + "/hdoperationdeliveryreport/previewReport",
	getHDOperators : webContextPath + "/hdoperationdeliveryreport/getHDOperators",
	getDeliveryType : webContextPath + "/hddeliveryinfo/deliveryType",
	getACTimeSlot : webContextPath + "/hdacinstallationtimeslot/getACTimeslotsForDatePicker/",
	getCustomerInfo : webContextPath + "/hddeliveryinfo/deliveryCustomerInformation"
};

var ajax = {
	request: function (options) {
        var response;
        $.ajax({
            url: options.url,
            type: options.type == undefined ? 'GET' : options.type,
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
        return response;
    },

    createHdTransaction : function(params, callback, errorCallback){
    	$('#loading').show();
    	$('#overlay').show();
    	uilog("DBUG","ajax#createHdTransaction");
    	this.request({
    		'url' : url.createCustomerOrder, 
    		type : 'POST', 
    		data : JSON.stringify(params),
    		success : function(data){
    			if(callback) callback(data);
	    	}, 
	    	error : function(data){
	    		if(errorCallback) errorCallback(data);
	    	}
    	});
    },
    
    getProvinces : function(container, callback){
    	this.request({
    		'url' : url.getProvinces,
    		async : false,
    		success : function(data) {
    			if(callback) callback(container, data);
    		}
    	});
    },
    
    getCitiesByProvince : function(container, province, callback){
    	this.request({
    		'url' : url.getCitiesByProvince + province + '/',
    		async : false,
    		success : function(data) {
    			if(callback) callback(container, data);
    		}
    	});
    },
    
    getAreaByProviceAndCity : function(container, options, callback){
    	this.request({
    		'url' : url.getAreasByCity + options.province + '/' + options.city + '/',
    		async : false,
    		success : function(data) {
    			if(callback) callback(container, data);
    		}
    	});
    },
    
    getSubAreaByProvinceAndCityAndArea : function(container, options, callback){
    	this.request({
    		'url' : url.getSubareasByArea + options.province + '/' + options.city + '/' + options.area + '/',
    		async : false,
    		success : function(data) {
    			if(callback) callback(container, data);
    		}
    	});
    },
    
    getPostalCodeAndProduct : function(options, callback){
    	this.request({
    		'url' : url.getPostalCodeAndProduct + options.province + '/' + options.city + '/' + options.area + '/' + options.subArea + '/',
    		success : function(data){
    			if(callback) callback(data);
    		}
    	});
    },
    
    updateOrderStatusComplete : function(options, callback, errorCallback) {
    	this.request({
    		'url' : url.completeDeliveryOrder,
    		data : JSON.stringify($.extend(options, { userName : loggedInUsername, userId : loggedInUserId })),
    		type : 'POST',
    		success : function(data){
    			if(callback) callback(data);
    		}, 
    		error : function(xhr, status, error) {
    			if(errorCallback) errorCallback(xhr, status, error);
    		}
    	});
    },
    
    updateOrderStatusCancel : function(options, callback, errorCallback) {
    	this.request({
    		'url' : url.cancelDeliveryOrder,
    		data : JSON.stringify($.extend(options, { userName : loggedInUsername, userId : loggedInUserId })),
    		type : 'POST',
    		success : function(data){
    			if(callback) callback(data);
    		}, 
    		error : function(xhr, status, error) {
    			if(errorCallback) errorCallback(xhr, status, error);
    		}
    	});
    },
    
    authUser : function(options, callback, errorCallback) {
    	this.request({
    		'url' : url.authUser,
	    	data : JSON.stringify(options),
	    	type : 'POST',
	    	success : function(data){
	    		if(callback) callback(data);
	    	}, 
	    	error : function(data){
	    		if(errorCallback) errorCallback(data);
	    	}
    	});
    },
    
    getHDTimeSlot : function(callback) {
    	this.request({
    		'url' : url.getHDTimeSlot,
            async: false,
	    	success : function(data){
	    		if(callback) callback(data);
	    	}
    	});
    },
    
    rescheduleDelivery : function(id, rescheduleDate, callback){
    	this.request({
    		'url' : url.rescheduleDelivery,
    		type : 'POST',
    		data : JSON.stringify({ rescheduleDate : rescheduleDate , id : id}),
    		success : function(data) {
    			if(callback) callback(data, rescheduleDate);
    		}
    	});
    },
    
    previewOpDelivReport : function(options, callback){
    	this.request({
    		'url' : url.previewOpDelivReport,
	    	data : JSON.stringify(options),
	    	type : 'POST',
	    	success : function(data) {
    			if(callback) callback(data);
    		}
    	});
    },
    
    getHDOperators : function(container, callback){
    	this.request({
    		'url' : url.getHDOperators,
	    	data : JSON.stringify(container),
	    	type : 'POST',
	    	success : function(data) {
    			if(callback) callback(container, data);
    		}
    	});
    },
    
    getDeliveryType : function(container, callback){
    	this.request({
    		'url' : url.getDeliveryType,
    		success : function(data) {
    			if(callback) callback(container, data);
    		}
    	});
    },
    
    getACTimeSlot : function(callback) {
    	this.request({
    		'url' : url.getACTimeSlot,
            async: false,
	    	success : function(data){
	    		if(callback) callback(data);
	    	}
    	});
    },
    
    getCustomerInfo : function(transNum, callback) {
    	this.request({
    		'url' : url.getCustomerInfo,
    		data : {'transNum' : transNum},
    		type: 'POST',
    		dataType:'json',
            async: false,
	    	success : function(data){
	    		if(callback) callback(data);
	    	},
	    	error : function() {
	    		uilog('DBUG','no customer data for that transaction number.');
	    	}
    	});
    }
};