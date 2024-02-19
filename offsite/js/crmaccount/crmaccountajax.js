var CRMAccountModule = CRMAccountModule || {};

CRMAccountModule.url = {
	profCustomer : posWebContextPath + "/crmWsConsumer/findMemberById/"
};

CRMAccountModule.Ajax = function(){
	this.findAccountId = function(crmRequestParams, callback, errorCallback, completeCallback){
    	this.request({
    		url : CRMAccountModule.url.profCustomer,
            type : "POST",
            dataType : "json",
            contentType : "application/json",
    		async : false,
    		data : JSON.stringify(crmRequestParams),
    		success : function(customer){
    			if(callback) callback(customer);
    		},
    		error : function(jqXHR, status, error){
    			if(errorCallback) errorCallback(jqXHR, status, error);
    		},
    		complete : function(){
    			if(completeCallback) completeCallback();
    		}
    	});
    };
};

CRMAccountModule.Ajax.prototype = new POSS.Ajax();
CRMAccountModule.ajax = new CRMAccountModule.Ajax();