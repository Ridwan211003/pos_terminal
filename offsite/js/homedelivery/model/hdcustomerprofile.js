Homedelivery.HdCustomerProfile = Backbone.Epoxy.Model.extend({
	defaults : {
		contactNumber : '',
		firstName : '',
		lastName : '',
		email : '',
		gender : 'Male',
		complete: false
	},
	
	computeds : {
		formComplete : {
			deps : [ "contactNumber", "firstName", "lastName", "email", "gender"],
			get : function(contactNumber,  firstName, lastName, email, gender) {
				if( this.validateContactNumber(contactNumber) && this.validateNames(firstName) && this.validateNames(lastName)
						&& this.validateEmail(email) && !!gender){
					this.set('complete', true);
				} else {
					this.set('complete', false);
				}
			}
		},
		
		validFirstName : {
			deps : ["firstName"],
			get : function(firstName){
				if(!firstName){
					return '*';
				} else {
					if(!this.validateNames(firstName)){
						return "Please enter a valid  first name.";
					}
					else {
						return '';
					}
				}
			}
		},
		
		validLastName : {
			deps : ["lastName"],
			get : function(lastName){
				if(!lastName){
					return '*';
				} else {
					if(!this.validateNames(lastName)){
						return "Please enter a valid last name.";
					}
					else {
						return '';
					}
				}
			}
		},
		
		validEmail : {
			deps : ["email"],
			get : function(email){
				if(!email){
					return '';
				} else {
					if(!this.validateEmail(email)){
						return "Please enter a valid email address.";
					}
					else {
						return '';
					}
				}
			}
		},
		
		validContactNumber : {
			deps : ["contactNumber"],
			get : function(contactNumber){
				if(!contactNumber){
					return '*';
				} else {
					if(!this.validateContactNumber(contactNumber)){
						return "Please enter only digits.";
					}
					else {
						return '';
					}
				}
			}
		}
	},

	toParams : function() {
		var params = {};
		$.extend(params, this.toJSON());
		delete params.complete;
		return params;
	},
	
	validateNames : function(name){
		if(name){
			// name regex
			return /^[\sa-zA-Z]*$/.test(name);
		} else {
			return false;
		}
	},
	
	validateEmail : function(email){
		if(email){
			// email regex
			return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i.test(email);
		} else {
			return true;
		}
	},
	
	validateContactNumber : function(contactNumber){
		if(contactNumber){
			// regex validate number
            return /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(contactNumber);
        } else {
			return false;
		}
	}
});
