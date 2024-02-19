Homedelivery.AddedTransactionCollection = Backbone.Collection.extend({
	model : Homedelivery.PosTransaction,
	getTransactionAmount : function() {
		return this.reduce(function(memo, value){ 
			return memo + value.get("totalAmountPaid");
		}, 0);
	},
	getAddedIds : function(){
		return _.pluck(this.toJSON(), 'transactionId');
	}
});