/**
 * @Author MJ Del Rosario
 * Pre-requisite, the following must be loaded before this:
 * 
 * jquery*.js
 * common.js
 */
var AjaxGlobalHandler = function(){
	
	var logAjaxResponse = function(status, statusText, responseText){
    	uilog("DBUG","Status: %s,\nStatusText: %s, \nResponseText: %s", 
    			status, 
			    statusText,
			    responseText);
	};
	
	var handleErrorByStatus = function(xhr, opts){
		
		var errorResponse = parseJsonData(xhr.responseText) || {
    		message: "error_uncaughtexception_problem_description"
    	}; 
	    switch (xhr.status) {
		    //Server Error Occurred
	        case 500: {
		  	    var noErrorPrompt 		= (   errorResponse.name
		  	    						   && errorResponse.name == "NO_PROMPT");
		  	    var notSupportedOffline = (   errorResponse.name
		  	    						   && errorResponse.name == "NOT_SUPPORTED_OFFLINE");
		    	var msgPropKey = (   notSupportedOffline
		    			          && opts.offlineMsgPropKey
		    			          && getMsgValue(opts.offlineMsgPropKey))
		    			          				? opts.offlineMsgPropKey
		    			        		        : errorResponse.message;	 
		    	if(!noErrorPrompt) {
			        // Take action, referencing xhr.responseText as needed.
			        showMsgDialog(getMsgValue(msgPropKey), "error");
		    	}
		    	logAjaxResponse(xhr.status, 
			    			    xhr.statusText,
			    			    xhr.responseText);
		    	break;
		    }
		    // Unauthorised
		    case 401: {
		    	// >> Process AJAX 401 status response,
		    	// Should display error message, and an option to redirect to login page
		    	//Error: Unauthorized
		    	//Error Response: {"error":{"Error"  :"EXPIRED_SESSION_AJAX_REQUEST", 
		    	//						    "Message":"expire_session_unable_to_proceed_due_to_expired_session"},
		    	//				   "redirectUrl":"/pos-web/login?exp_url=t"}		    	
		    	var redirectUrl = null;
		    	if(    errorResponse.error
		    	   &&  errorResponse.error.name  == "EXPIRED_SESSION_AJAX_REQUEST"
		    	   && (redirectUrl = errorResponse.redirectUrl) != null){
		    		showConfirmDialog(getMsgValue(errorResponse.error.message),
		    						  getMsgValue("expire_session_unable_to_proceed_due_to_expired_session_conf_title"),
		    						  function(){$(location).attr('href', redirectUrl);});
		    	}		
		    	logAjaxResponse(xhr.status, 
			    			    xhr.statusText,
			    			    xhr.responseText);
		    	break;
		    }
		    default : {
		    	logAjaxResponse(xhr.status, 
			    			    xhr.statusText,
			    			    xhr.responseText);
		    }
	    }
	};	
		
	return	{
    initiate: function (options) {
	        $.ajaxSetup({ 
	        	global: false
	        });   
	        $.ajaxPrefilter(function( options, originalOptions, jqXHR ) {
	        	var isFound = false;
	        	var unsupportedURLsArr = parseJsonData(getConfigValue("KEY_UNSUPPORTED_URLS")) || [];
	        	unsupportedURLsArr.some(function(name) {
	        		var unsupportedURL = name.trim();
	        		var hasNoPrompt = (unsupportedURL.indexOf('!') > -1);
	        		unsupportedURL = (hasNoPrompt)? unsupportedURL.substring(1): unsupportedURL;
	        	   	if(options.url.indexOf(unsupportedURL) > -1){
	        	        isFound = true;
	      	      	}					
        	       	// found the url, break
	        	    return isFound;
	        	});
	        	if(isFound || !options.error){
        	        // Setting "global" ajax option to true, to handle the ff in the "ajaxError" globalEvent.
        	   		// 1.) the unsupportedURL prompt 
	        		// 2.) and also handle the ajax request without local error-handling. 
        	   		options["global"] = true;
        	   		if(isFound && !options["enableLocalOnErrorHandler"]/* forced enabling of local error handlers*/){
        	   			options.error = null;
        	   		}
	        	// If has local error event handler
	        	} else if (   options.error){
	        		// Wrapping the local event handler, to check
	        		// if there is a 401 status. Instead of running the
	        		// local AJAX error-event handler -- run handleErrorByStatus Instead.
	        		var localAjaxErrorFn = options.error;
	        		options.error = null;
	        		options.error = function(jqXHR, status, error){
	        			if(jqXHR.status == '401'){
	        				handleErrorByStatus(jqXHR, options); 
	        			} else {
	        				localAjaxErrorFn(jqXHR, status, error);
	        			}
	        		};
	        	}
	        });		        
	        /* Ajax events fire in following order
	         * http://api.jquery.com/Ajax_Events/
	         */
	        $(document).ajaxStart(function () {
	        }).ajaxSend(function (event, xhr, opts) {
	        }).ajaxError(function (event, xhr, opts) {
	        	
	        	handleErrorByStatus(xhr, opts);        	
	        	
	        }).ajaxSuccess(function (event, xhr, opts) {
	        }).ajaxComplete(function (event, xhr, opts) {
	        }).ajaxStop(function () {
	        });
	    }
	};
}();