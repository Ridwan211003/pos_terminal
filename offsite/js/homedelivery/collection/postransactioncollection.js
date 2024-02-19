Homedelivery.PosTransactionCollection = Backbone.Collection.extend({
	model : Homedelivery.PosTransaction,
	url : function(){
		return url.getPosTransactions + '?' + $.param(this.searchParams);
	}
});
