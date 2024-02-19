Homedelivery.HdDeliveryTypeInfo = Backbone.Epoxy.Model.extend({
	defaults: {
		deliveryType : ''
	}, 
	
	computeds : {
		formComplete : {
			deps : [ "deliveryType"],
			get : function(deliveryType) {
				if( !!deliveryType ){
					this.set('complete', true);
				} else {
					this.set('complete', false);
				}
			}
		}
	},
	
	toParams : function(){
		var returnParams = $.extend({}, this.toJSON());
		delete returnParams.complete;
		return returnParams;
	}
});