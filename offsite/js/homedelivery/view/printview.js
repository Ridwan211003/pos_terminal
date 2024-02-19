Homedelivery.PrintView = Backbone.View.extend({
	className : 'deliveryNote',
	
	initialize : function(){
		this.model.on('destroy', this.tearDown, this);
	},
	
	render : function(){
		var source = $('#DeliveryNoteTemplate').html();
		var template = Handlebars.compile(source);
		this.$el.append(template(this.model.toJSON()));
		return this.$el;
	}, 
	
	tearDown : function(){
		uilog('DBUG','Homedelivery.Printview#tearDown');
		this.remove();
	}
});