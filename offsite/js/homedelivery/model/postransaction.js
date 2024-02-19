var Homedelivery = {};

Homedelivery.PosTransaction = Backbone.Model.extend({
	urlRoot : url.transactionById,
	idAttribute  : "transactionId",
	initialize : function(){
		this.posTxItems = new Homedelivery.PosTxItemCollection();
		this.posTxItems.url = url.posTxItemsByTransactionId + this.id;
	}
});