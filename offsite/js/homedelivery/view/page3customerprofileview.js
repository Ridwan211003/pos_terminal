Homedelivery.Page3CustomerProfileView = Backbone.Epoxy.View.extend({
	tagName : 'table',
	className : 'p3table',

	//This will initialize the HdCustomerProfile Model
	initialize : function() {
		_(this).bindAll('complete', 'render', 'renderCustomerInfo', 'renderReceiverInfo');
		var source = $('#CustomerProfileTemplate').html();
		var template = Handlebars.compile(source);
		this.$el.append(template({}));
		this.model = new Homedelivery.HdCustomerProfile();
		this.model.view = this;
		this.model.on('change:complete', this.complete, this);
	},

	bindings : {
		".contactNumber" : "value:contactNumber,events:['keyup']",
		".firstName" : "value:firstName,events:['keyup']",
		".lastName" : "value:lastName,events:['keyup']",
		".emailAddress" : "value:email,events:['keyup']",
		
		"input[value=Male]" : "checked:gender",
		"input[value=Female]" : "checked:gender",
		
		"span.invalid.contact_number" : "text:validContactNumber",
		"span.invalid.first_name" : "text:validFirstName",
		"span.invalid.last_name" : "text:validLastName",
		"span.invalid.email_add" : "text:validEmail",
		"span.invalid.gender" : "toggle:not(gender)",
	},
	
	render : function() {
		return this.$el;
	},
	
	complete : function(model){
		this.trigger('complete');
	},
	
	//This function will get the values from the textfields associated with customer profile
	//and assign it to its corresponding variables
	renderCustomerInfo : function(data) {
		if (data.customerProfile != null) {
			var firstName = data.customerProfile.firstName;
			var lastName = data.customerProfile.lastName;
			var contactNumber = data.customerProfile.contactNumber;
			var email = data.customerProfile.email;
			var gender = data.customerProfile.gender;
			
			this.model.set("firstName", firstName);
			this.model.set("lastName", lastName);
			this.model.set("contactNumber", contactNumber);
			this.model.set("email", email);
			this.model.set("gender", gender);
		}
	},
	
	//This function will get the values from the textfields associated with receiver profile
	//and assign it to its corresponding variables.
	renderReceiverInfo : function(data) {
		if (data.receiverProfile != null) {
			var firstName = data.receiverProfile.firstName;
			var lastName = data.receiverProfile.lastName;
			var contactNumber = data.receiverProfile.contactNumber;
			var email = data.receiverProfile.email;
			var gender = data.receiverProfile.gender;
			
			this.model.set("firstName", firstName);
			this.model.set("lastName", lastName);
			this.model.set("contactNumber", contactNumber);
			this.model.set("email", email);
			this.model.set("gender", gender);
		}
	},

	clear : function(){
		this.model.set(Homedelivery.HdCustomerProfile.prototype.defaults);
	}
 });