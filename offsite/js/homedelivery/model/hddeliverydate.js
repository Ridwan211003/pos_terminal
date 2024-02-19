Homedelivery.HdDeliveryDate = Backbone.Epoxy.Model.extend({
	initialize : function(){
	},
	
	defaults : {
		originalDeliveryDate : '',
		deliveryDate : '',
		complete : false
	},
	
	computeds: {
		formComplete : {
			deps : ["deliveryDate"],
			get : function(deliveryDate) {
				this.set('complete', !!deliveryDate);
			}
		},
		deliveryDateValid : {
			deps : ['originalDeliveryDate', 'deliveryDate'],
			get : function(originalDeliveryDate, deliveryDate){
				if(!deliveryDate){
					return '*';
				} else {
					if(!!originalDeliveryDate){
						if(originalDeliveryDate.dateFormat('d/m/Y H:i') === deliveryDate){
							this.set('complete', false);
							return ' must not be the same as original Delivery Date';
						} else {
							return ''; 
						}
					}  else {
						return '';
					}
				}
			}
		}
	},

});