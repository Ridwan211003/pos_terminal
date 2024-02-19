Homedelivery.Page1OdrDialogView = Backbone.Epoxy.View.extend({

	initialize : function() {
		_(this).bindAll('render', 'openDialog', 'previewPrint','openPrintPreviewDialog', 'addHDOperatorOptions','formComplete', 
				'initOdrDateFrom', 'clearOdrDateFromButton', 'initOdrDateTo');

		this.model = new Homedelivery.HdOdrParams();
		this.model.on('change:isComplete', this.formComplete, this);
		var source = $('#OperationalDeliveryReportDialogTemplate').html();
		var template = Handlebars.compile(source);
		this.$el.append(template(this.model.toJSON()));
		this.$el.dialog(hdSettings.odrDialogSettings);
		this.odrDateFromDatePicker = this.initOdrDateFrom();
		this.odrDateToDatePicker = this.initOdrDateTo();
		ajax.getHDOperators(".odrOperatorId", this.addHDOperatorOptions);
	},
	
	events : {
		'click .clearOdrDateFromButton' : 'clearOdrDateFromButton'
	},
	
	bindings : {
		// OperatorId selector and error message
		'select.odrOperatorId' : 'value:odrOperatorId, events:["onchange"]',
		'span.invalid.odrOperatorId' : 'toggle:not(odrOperatorId)',
		
		// odrDateFrom value setter and error validation
		'input.odrDateFrom' : 'value:odrDateFrom, events:["change"]',
		'label.odrDateFromDisplay' : 'text:odrDateFrom',
		'label.odrDateFromError' : 'toggle:not(odrDateFrom)',
//		'.odrDateToWrapper' : 'toggle:(odrDateFrom)',
		'.clearOdrDateFromButton': 'toggle:(odrDateFrom)',

		// odrDateTo value setter and error validation message
		'input.odrDateTo' : 'value:odrDateTo, events:["change"]',
		'label.odrDateToDisplay' : 'text:odrDateTo',
		'label.odrDateToError' : 'toggle:not(odrDateTo)',
			
	},

	render : function() {
		return this.$el;
	},
	
	initOdrDateFrom : function(){
		var view = this;
		return this.$('input.odrDateFrom').datetimepicker($.extend({}, hdSettings.ordParamsDelivDatePicker, {
			onSelectTime : function(currentDateTime, elem){
				var now = new Date();
				if(now.getDate() == currentDateTime.getDate()){
					view.odrDateToDatePicker.datetimepicker({
						minTime: currentDateTime.dateFormat('H:i'),
						minDate: 0
					});
				} else {
					view.odrDateToDatePicker.datetimepicker({
						minTime: '0:00'
					});
				}
				elem.trigger('change');
			},
			onSelectDate : function(currentDateTime, elem){
				$('.operationalDelivDialog div.xdsoft_current').removeClass('xdsoft_current');
				var now = new Date();
				if(now.getDate() == currentDateTime.getDate()){
					view.odrDateToDatePicker.datetimepicker({
						minTime: now.dateFormat('H:i'),
						minDate: 0
					});
				} else {
					var adjustment = Date.daysBetween( currentDateTime, now );
					adjustment = adjustment < 10 ? '0' + adjustment : adjustment ; 
					view.odrDateToDatePicker.datetimepicker({
						minDate: '-1970/01/' + adjustment,
						maxDate: 0,
						minTime: '0:00'
					});
				}
				view.odrDateToDatePicker.attr('value', currentDateTime.dateFormat('d/m/Y H:i'));
				view.odrDateToDatePicker.datetimepicker('reset');
				view.model.set('odrDateTo', '');
				elem.trigger('selectDateFrom');
			}
		})).on('selectDateFrom', function(){
			$('.operationalDelivDialog div.xdsoft_current').removeClass('xdsoft_current');
		});
	},
	
	initOdrDateTo : function(){
		return this.$('input.odrDateTo').datetimepicker(hdSettings.ordParamsDelivDatePicker);
	},
	
	clearOdrDateFromButton : function(){
		this.model.set('odrDateFrom', '');
		this.model.set('odrDateTo', '');
	},
	
	addHDOperatorOptions: function(container, data){
		this.$('.operationalDelivDialog .xdsoft_timepicker').width(58);
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
	
	openDialog : function(parentView){
		this.model.reset();
		$('.ui-dialog-buttonpane button:contains("Print Report")').button().toggle(false);
		this.$el.data('model', this.model).data('view', this).data('parent', parentView).dialog('open');
	},
	
	previewPrint: function(){
		$('.ui-dialog-buttonpane button:contains("Print Report")').button().hide();
		ajax.previewOpDelivReport($.extend({}, this.model.toJSON(),{ posSessionId : posSessionId}), this.openPrintPreviewDialog);
	},
	
	openPrintPreviewDialog: function(data){
		var printView = new Homedelivery.ODPrintPreview().render(data);
		$(printView).printArea(hdSettings.printPreviewHDODReportSettings);
		this.remove();
	},
	
	formComplete : function(model, value){
		$('.ui-dialog-buttonpane button:contains("Print Report")').button().toggle(this.model.get('isComplete'));
	}
	
});