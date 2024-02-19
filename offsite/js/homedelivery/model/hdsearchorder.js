Homedelivery.SearchOrder = Backbone.Epoxy.Model.extend({
	defaults : {
		searchOrderDate : '',
		searchOrderNumber : '',
		searchOrderName : '',
		searchOrderAddress : ''
	},
	
	validate: function(){
		return !!this.get('searchOrderDate') || !!this.get('searchOrderNumber') || !!this.get('searchOrderName') || !!this.get('searchOrderAddress'); 
	}
});


Homedelivery.HdSearchOrderResult = Backbone.Epoxy.Model.extend({
	idAttribute : 'searchOrderNumber',
	
	clear : function(){
		this.destroy();
		if(this.hdTransaction){
			this.hdTransaction.destroy();
		}
		this.view.remove();
	}
});

Homedelivery.HdSearchOrderResultCollection = Backbone.Collection.extend({
	model : Homedelivery.HdSearchOrderResult,
	searchOrderModel : undefined,
	
	setSearchOrderModel : function(searchOrder){
		this.searchOrderModel = searchOrder;
	},

	url : function(){
		return url.getSearchOrders + '?' + $.param(this.searchOrderModel.toJSON());
	}
	
});
