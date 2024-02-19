Homedelivery.HdAddress = Backbone.Epoxy.Model.extend({
	defaults : {
		address : '',
		province : '',
		city : '',
		area : '',
		subArea : '',
		postalCode : '',
		remarks : '',
		complete : false
	},	
	
	computeds : {
		formComplete : {
			deps : [ "address", "province", "city", "area", "subArea", "postalCode"],
			get : function(address, province, city, area, subArea, postalCode) {
				if( !!address && !!province && !!city && !!area && !!subArea && !!postalCode ){
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
	},
	
	resetProvince : function(){
		this.set('city', '');
		this.resetCity();
	},
	
	resetCity : function(){
		this.set('area', '');
		this.resetArea();
	},
	
	resetArea : function(){
		this.set('subArea', '');
	},
	
	resetSubArea : function(){
		this.set('postalCode', '');
	}
});