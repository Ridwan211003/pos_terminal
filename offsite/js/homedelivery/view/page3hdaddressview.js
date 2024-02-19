Homedelivery.Page3HdAddressView = Backbone.Epoxy.View.extend({
	tagName : 'table',
	className : 'p3table addressTable',
	
	initialize : function(){
		_(this).bindAll('render', 'renderProvinces', 'addOptions', 'disableSelections', 'emptySelection', 'changeCity', 'changeArea', 'complete', 'clear', 'updatePostalCode', 'renderCustomerAddress', 'renderDeliveryAddress');
		this.model = new Homedelivery.HdAddress();
		var source = $('#HdAddressTemplate').html();
		var template = Handlebars.compile(source);
		this.$el.append(template({}));
		
		this.model.on('change:province', this.changeProvince, this);
		this.model.on('change:city', this.changeCity, this);
		this.model.on('change:area', this.changeArea, this);
		this.model.on('change:subArea', this.changeSubArea, this);
		this.model.on('change:postalCode', this.changePostalCode, this);
		this.model.on('change:complete', this.complete, this);
	},
	
	bindings : {
		'.address' : 'value:address, events:["keyup", "onchange"]',
		'.remarks' : 'value:remarks,events:["keyup", "onchange"]',
		'.postalCode' : 'text:postalCode,events:["keyup"]',
		'select.province' : 'value:province,events:["onchange"]',
		'select.city' : 'value:city,events:["onchange"]',
		'select.area' : 'value:area,events:["onchange"]',
		'select.subArea' : 'value:subArea,events:["onchange"]',
		// validation messages
		'span.invalid.address' : 'toggle:not(address)',
		'span.invalid.postal_code' : 'toggle:not(postalCode)',
		'span.invalid.province' : 'toggle:not(province)',
		'span.invalid.city' : 'toggle:not(city)',
		'span.invalid.area' : 'toggle:not(area)',
		'span.invalid.subArea' : 'toggle:not(subArea)',
		'span.invalid.address' : 'toggle:not(address)',
	},
	
	render : function(){
		this.renderProvinces();
		return this.$el;
	},

	renderCustomerAddress : function(data) {
		if(data.homeAddress != null) {
			var address = data.homeAddress.address;
			var province = data.homeAddress.province;
			var city = data.homeAddress.city;
			var area = data.homeAddress.area;
			var subArea = data.homeAddress.subArea;
			var postalCode = data.homeAddress.postalCode;
			
			this.model.set("address", address);
			this.model.set("province", province);
			this.model.set("city", city);
			this.model.set("area", area);
			this.model.set("subArea", subArea);
			this.model.set("postalCode", postalCode);
		}
	},
	
	renderDeliveryAddress : function(data) {
		if(data.deliveryAddress != null) {
			var address = data.deliveryAddress.address;
			var province = data.deliveryAddress.province;
			var city = data.deliveryAddress.city;
			var area = data.deliveryAddress.area;
			var subArea = data.deliveryAddress.subArea;
			var postalCode = data.deliveryAddress.postalCode;
			
			this.model.set("address", address);
			this.model.set("province", province);
			this.model.set("city", city);
			this.model.set("area", area);
			this.model.set("subArea", subArea);
			this.model.set("postalCode", postalCode);
		}
	},
	
	renderProvinces : function(){
		
		this.disableSelections();
		ajax.getProvinces(".province", this.addOptions);
	},
	
	addOptions : function(container, data){
		var view = this;
		dropdownContainer = 'select' + container; 
		view.$(dropdownContainer).find('option').remove().end().append('<option value="">---</option>');
		$.each(data, function (i, item) {
		    view.$(dropdownContainer ).append($('<option>', { 
		        value: item,
		        text : item
		    }));
		});
		this.$(dropdownContainer).prop('disabled', false);
	},
	
	disableSelections : function(){
		this.emptySelection(".city");
		this.emptySelection(".area");
		this.emptySelection(".subArea");
	},
	
	emptySelection : function(container){
		this.$('select' + container).find('option').remove().end().append('<option value="">---</option>').prop('disabled', 'disabled');
	},
	
	changeProvince : function(model, province){
		this.model.resetProvince();
		if(province){
			ajax.getCitiesByProvince(".city", province, this.addOptions);
		} else {
			this.disableSelections();
		}
	},
	
	changeCity : function(model, city){
		this.model.resetCity();
		if(city){
			ajax.getAreaByProviceAndCity(".area", {
				province : model.get('province'), 
				city : city
			}, this.addOptions);
		} else {
			this.emptySelection(".area");
			this.emptySelection(".subArea");
		}
	},
	
	changeArea : function(model, area){
		this.model.resetArea();
		if(area){
			ajax.getSubAreaByProvinceAndCityAndArea(".subArea",{
				province : model.get('province'),
				city : model.get('city'),
				area : area
			}, this.addOptions);
		} else {
			this.emptySelection(".subArea");
		}
	},
	
	changeSubArea : function(model, subArea){
		this.model.resetSubArea();
		if(subArea){
			ajax.getPostalCodeAndProduct({
				province : model.get('province'),
				city : model.get('city'),
				area : model.get('area'),
				subArea : model.get('subArea')
			}, this.updatePostalCode);
		} else {
			this.emptySelection('.postalCode');
		}
	},
	
	changePostalCode : function(){
		this.trigger('update:postalCode', this.model);
	},
	
	complete : function(model){
		this.trigger('complete');
	},
	
	clear : function(){
		this.model.set(Homedelivery.HdAddress.prototype.defaults);
	},
	
	updatePostalCode : function(data){
		if(!data[0] || !data[0].product){
			this.model.set('postalCode', 'POSTAL CODE NOT FOUND');
		} else {
			this.model.set('postalCode', data[0].hdDistanceItemCode.postalCode);
		}
	}
});


/*Homedelivery.Page3HomeAddressView = Backbone.Epoxy.View.extend({
//	el : '#homeAddressTable',
	tagName : 'table',
	className : 'p3table addressTable',

	initialize : function() {
		_(this).bindAll('render', 'disableSelections', 'changeCity', 'changeArea', 'complete', 'clear', 'updatePostalCode');
		this.model = new Homedelivery.HdHomeAddress(); 
		
		uilog('DBUG','Homedelivery.HdAddressView#initialize');
		this.model.on('change:province', this.changeProvince, this);
		this.model.on('change:city', this.changeCity, this);
		this.model.on('change:area', this.changeArea, this);
		this.model.on('change:subArea', this.changeSubArea, this);
		this.model.on('change:complete', this.complete, this);
	},

	bindings : {
		'#address' : 'value:address,events:["keyup"]',
		'#remarks' : 'value:remarks,events:["keyup"]',
		'#postalCode' : 'value:postalCode,events:["keyup"]',
		'#province' : 'value:province,events:["onchange"]',
		'#city' : 'value:city,events:["onchange"]',
		'#area' : 'value:area,events:["onchange"]',
		'#subArea' : 'value:subArea,events:["onchange"]',
		'#deliveryAddressSame' : 'checked:deliveryAddressSame',
		
		'span.invalid.address' : 'toggle:not(address)',
		'span.invalid.remarks' : 'toggle:not(remarks)',
		'span.invalid.postal_code' : 'toggle:not(postalCode)',
		'span.invalid.province' : 'toggle:not(province)',
		'span.invalid.city' : 'toggle:not(city)',
		'span.invalid.area' : 'toggle:not(area)',
		'span.invalid.subArea' : 'toggle:not(subArea)',
	},
	
	render : function() {
		var view = this;
		this.disableSelections();
		this.renderProvinces();
		return this;
	},
	
	changeProvince : function(model, province){
		this.model.resetProvince();
		if(province){
			ajax.getCitiesByProvince("#city", province, this.addOptions);
		} else {
			this.disableSelections();
		}
	},
	
	changeCity : function(model, city){
		this.model.resetCity();
		if(city){
			ajax.getAreaByProviceAndCity("#area", {
				province : model.get('province'), 
				city : city
			}, this.addOptions);
		} else {
			this.emptySelection("#area");
			this.emptySelection("#subArea");
		}
	},
	
	changeArea : function(model, area){
		this.model.resetArea();
		if(area){
			ajax.getSubAreaByProvinceAndCityAndArea("#subArea",{
				province : model.get('province'),
				city : model.get('city'),
				area : area
			}, this.addOptions);
		} else {
			this.emptySelection("#subArea");
		}
	},
	
	changeSubArea : function(model, subArea){
		this.model.resetSubArea();
		if(subArea){
			ajax.getPostalCodeAndProduct({
				province : model.get('province'),
				city : model.get('city'),
				area : model.get('area'),
				subArea : model.get('subArea')
			}, this.updatePostalCode);
		} else {
			this.emptySelection('#postalCode');
		}
	},
	
	disableSelections : function(){
		this.emptySelection("#city");
		this.emptySelection("#area");
		this.emptySelection("#subArea");
	},
	
	renderProvinces : function(){
		this.disableSelections();
		ajax.getProvinces("#province", this.addOptions);
	},
	
	addOptions : function(container, data){
		var view = this;
		view.$(container).find('option').remove().end().append('<option value="">---</option>');
		$.each(data, function (i, item) {
		    view.$(container).append($('<option>', { 
		        value: item,
		        text : item
		    }));
		});
		this.$(container).prop('disabled', false);
	},
	
	emptySelection : function(container){
		this.$(container).find('option').remove().end().append('<option value="">---</option>').prop('disabled', 'disabled');
	},
	
	complete : function(model){
		uilog("DBUG","page3hdaddressview#complete!");
		this.trigger('complete', model.get('complete'));
	},
	
	clear : function(){
		this.model.set(Homedelivery.HdHomeAddress.prototype.defaults);
	},
	
	updatePostalCode : function(data){
		if(!data[0].product){
			this.trigger('update:productNotFound', this.model);
		} else {
			this.model.set('postalCode', data[0].hdDistanceItemCode.postalCode);
			//this.model.set('product', data.product);
			this.trigger('update:postalCode', data); 
		}
	}
});*/