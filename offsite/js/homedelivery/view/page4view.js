Homedelivery.Page4View = Backbone.View.extend({
	el : "#page4Container",
	
	events : {
		"click #page4HomeBtn " : "page4Home",
		"click #page4Print" : "print"
	},
	
	initialize : function() {
		_(this).bindAll('page4Home', 'print');
		this.$el.show();
	},

	render : function(data) {
		uilog("DBUG","Page4View#render ");
		var source = $('#DeliveryNoteTemplate').html();
		var template = Handlebars.compile(source);
		
		var html = template(data);
		$('#hdTransactionResultContainer').html(html);
		
		if(data.deliveryType == "AC_INSTALLATION") {
			$('#acInstallationNoteLabelTitle').show();
			$('#acDeliveryNote').show();
			$('acDelOrderDate').show();
			$('#normalDeliveryNote').hide();
			$('#deliveryNoteLabelTitle').hide();
			$('#normalDelOrderDate').hide();
		} else {
			$('#deliveryNoteLabelTitle').show();
			$('#normalDeliveryNote').show();
			$('normalDelOrderDate').show();
			$('#acInstallationNoteLabelTitle').hide();
			$('#acDeliveryNote').hide();
			$('#acDelOrderDate').hide();
		}

		this.$el.show();
	},
	
	page4Home : function(){
		mediator.trigger('home', this.$el);
	},
	
	print : function(){
		uilog('DBUG','Page4View#print');
		$('#hdTransactionResultContainer').printArea( hdSettings.printDeliveryNoteSettings );
	}
});