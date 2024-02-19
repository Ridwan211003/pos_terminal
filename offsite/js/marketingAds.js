$(document).ready(function() {
	
	/*<div id="cus-white-small-ads-single" class="slideshow">
	</div>
	<div id="cus-red-small-ads-single" class="slideshow">			
	</div>*/
	/*<img class="img addsTransition addImage1of3 duration3" id="40027EM1234" src="../images/uploads/employee/100361QE3323"/>
	<img class="img addsTransition addImage2of3 duration3" id="40027EM1233" src="../images/uploads/employee/100368AD3100"/>
	<img class="img addsTransition addImage3of3 duration3" id="40027EM1232" src="../images/uploads/employee/40027B4E0484"/>*/

	$.ajax({
		url : posWebContextPath + "/cashier/getMarketingAds",
		type : "GET",
		async : false,
		dataType : "json",
		success : function(response)
		{
			uilog("DBUG", response);
			var adsArr = response['ads'];
			var termModel = response['model'];
			for(i in adsArr)
			{
				var adsNode = adsArr[i];
				var adsDiv;
				
				switch(i)
				{
				case 'CaRR':
					adsDiv = $('<div id="pos-cashier-regular-reminder' + ((adsNode.length > 1) ? '' : '-single') + '">');
					adsDiv.addClass('slideshow');
					for(j in adsNode)
					{
						var img = $('<img>');
						img.attr({
							'id'	: adsNode[j]['id'],
							'src'	: '../images/uploads/marketing/' + adsNode[j]['id']
						})
						
						if ((adsNode.length > 1) && termModel != 'M2')
							img.addClass('addsTransition addImage' + (parseInt(j) + 1) + 'of' + adsNode.length + ' duration' + adsNode.length);

						img.addClass('img');
						adsDiv.append(img);
					}
					$('#systemMessageDiv > p').html('').append(adsDiv);
					break;
				case 'CaPR':
					adsDiv = $('<div id="pos-cashier-promo-reminder' + ((adsNode.length > 1) ? '' : '-single') + '">');
					adsDiv.addClass('slideshow');
					for(j in adsNode)
					{
						var img = $('<img>');
						img.attr({
							'id'	: adsNode[j]['id'],
							'src'	: '../images/uploads/marketing/' + adsNode[j]['id']
						})
						
						if ((adsNode.length > 1) && termModel != 'M2')
							img.addClass('addsTransition addImage' + (parseInt(j) + 1) + 'of' + adsNode.length + ' duration' + adsNode.length);

						img.addClass('img');
						adsDiv.append(img);
					}
					$('.midbox > p').html('').append(adsDiv);
					break;
				case 'CuRSA':
					adsDiv = $('<div id="cus-red-small-ads' + ((adsNode.length > 1) ? '' : '-single') + '">');
					adsDiv.addClass('slideshow');
					for(j in adsNode)
					{
						var img = $('<img>');
						img.attr({
							'id'	: adsNode[j]['id'],
							'src'	: '../images/uploads/marketing/' + adsNode[j]['id']
						})
						
						if ((adsNode.length > 1) && termModel != 'M2')
							img.addClass('addsTransition addImage' + (parseInt(j) + 1) + 'of' + adsNode.length + ' duration' + adsNode.length);

						img.addClass('img');
						adsDiv.append(img);
					}
					$('.advertisementCustomer.red-ads > p').html('').append(adsDiv);
					break;
				case 'CuWSA':
					adsDiv = $('<div id="cus-white-small-ads' + ((adsNode.length > 1) ? '' : '-single') + '">');
					adsDiv.addClass('slideshow');
					for(j in adsNode)
					{
						var img = $('<img>');
						img.attr({
							'id'	: adsNode[j]['id'],
							'src'	: '../images/uploads/marketing/' + adsNode[j]['id']
						})
						
						if ((adsNode.length > 1) && termModel != 'M2')
							img.addClass('addsTransition addImage' + (parseInt(j) + 1) + 'of' + adsNode.length + ' duration' + adsNode.length);

						img.addClass('img');
						adsDiv.append(img);
					}
					$('.advertisementCustomer.white-ads > p').html('').append(adsDiv);
					break;
				case 'CuRLA':
					adsDiv = $('<div id="cus-red-large-ads' + ((adsNode.length > 1) ? '' : '-single') + '">');
					adsDiv.addClass('slideshow');
					for(j in adsNode)
					{
						var img = $('<img>');
						img.attr({
							'id'	: adsNode[j]['id'],
							'src'	: '../images/uploads/marketing/' + adsNode[j]['id']
						})
						
						if ((adsNode.length > 1) && termModel != 'M2')
							img.addClass('addsTransition addImage' + (parseInt(j) + 1) + 'of' + adsNode.length + ' duration' + adsNode.length);

						img.addClass('img');
						adsDiv.append(img);
					}
					$('.nextCustomerCon.red-ads > p').html('').append(adsDiv);
					break;
				case 'CuWLA':
					adsDiv = $('<div id="cus-white-large-ads' + ((adsNode.length > 1) ? '' : '-single') + '">');
					adsDiv.addClass('slideshow');
					for(j in adsNode)
					{
						var img = $('<img>');
						img.attr({
							'id'	: adsNode[j]['id'],
							'src'	: '../images/uploads/marketing/' + adsNode[j]['id']
						})
						
						if ((adsNode.length > 1) && termModel != 'M2')
							img.addClass('addsTransition addImage' + (parseInt(j) + 1) + 'of' + adsNode.length + ' duration' + adsNode.length);

						img.addClass('img');
						adsDiv.append(img);
					}
					$('.nextCustomerCon.white-ads > p').html('').append(adsDiv);
					break;
				case 'CuCOA':
					adsDiv = $('<div id="cus-cashier-offline-ads' + (adsNode.length > 1) ? '' : '-single' + '">');
					adsDiv.addClass('slideshow');
					for(j in adsNode)
					{
						var img = $('<img>');
						img.attr({
							'id'	: adsNode[j]['id'],
							'src'	: '../images/uploads/marketing/' + adsNode[j]['id']
						})
						
						if ((adsNode.length > 1) && termModel != 'M2')
							img.addClass('addsTransition addImage' + (parseInt(j) + 1) + 'of' + adsNode.length + ' duration' + adsNode.length);

						img.addClass('img');
						adsDiv.append(img);
					}
					$('.offlineCashier.red-ads > p').html('').append(adsDiv);
					break;
				}
				
			}
		}
	});
	
	$('#cus-white-large-ads IMG:first').addClass('active');
	$('#cus-red-large-ads IMG:first').addClass('active');
	$('#cus-white-small-ads IMG:first').addClass('active');
	$('#cus-red-small-ads IMG:first').addClass('active');
	$('#cus-cashier-offline-ads IMG:first').addClass('active');
	$('#pos-cashier-regular-reminder IMG:first').addClass('active');
	$('#pos-cashier-promo-reminder IMG:first').addClass('active');

});

function slideSwitchWhiteLargeAds() {
    var $active = $('#cus-white-large-ads IMG.active');

    if ( $active.length == 0 ) $active = $('#cus-white-large-ads IMG:last');

    var $next =  $active.next().length ? $active.next()
        : $('#cus-white-large-ads IMG:first');

    $active.addClass('last-active');
        
    $next.css({opacity: 0.0})
        .addClass('active')
        .animate({opacity: 1.0}, 2000, function() {
            $active.removeClass('active last-active');
        });
}

function slideSwitchRedLargeAds() {
    var $active = $('#cus-red-large-ads IMG.active');

    if ( $active.length == 0 ) $active = $('#cus-red-large-ads IMG:last');

    var $next =  $active.next().length ? $active.next()
        : $('#cus-red-large-ads IMG:first');

    $active.addClass('last-active');
        
    $next.css({opacity: 0.0})
        .addClass('active')
        .animate({opacity: 1.0}, 2000, function() {
            $active.removeClass('active last-active');
        });
}

function slideSwitchCashierOfflineAds() {
    var $active = $('#cus-cashier-offline-ads IMG.active');

    if ( $active.length == 0 ) $active = $('#cus-cashier-offline-ads IMG:last');

    var $next =  $active.next().length ? $active.next()
        : $('#cus-cashier-offline-ads IMG:first');

    $active.addClass('last-active');
        
    $next.css({opacity: 0.0})
        .addClass('active')
        .animate({opacity: 1.0}, 2000, function() {
            $active.removeClass('active last-active');
        });
}

function slideSwitchWhiteSmallAds() {
    var $active = $('#cus-white-small-ads IMG.active');

    if ( $active.length == 0 ) $active = $('#cus-white-small-ads IMG:last');

    var $next =  $active.next().length ? $active.next()
        : $('#cus-white-small-ads IMG:first');

    $active.addClass('last-active');
        
    $next.css({opacity: 0.0})
        .addClass('active')
        .animate({opacity: 1.0}, 2000, function() {
            $active.removeClass('active last-active');
        });
}

function slideSwitchRedSmallAds() {
    var $active = $('#cus-red-small-ads IMG.active');

    if ( $active.length == 0 ) $active = $('#cus-red-small-ads IMG:last');

    var $next =  $active.next().length ? $active.next()
        : $('#cus-red-small-ads IMG:first');

    $active.addClass('last-active');
        
    $next.css({opacity: 0.0})
        .addClass('active')
        .animate({opacity: 1.0}, 2000, function() {
            $active.removeClass('active last-active');
        });
}



function slideSwitchRegularReminders() {
    var $active = $('#pos-cashier-regular-reminder IMG.active');

    if ( $active.length == 0 ) $active = $('#pos-cashier-regular-reminder IMG:last');

    var $next =  $active.next().length ? $active.next()
        : $('#pos-cashier-regular-reminder IMG:first');

    $active.addClass('last-active');
        
    $next.css({opacity: 0.0})
        .addClass('active')
        .animate({opacity: 1.0}, 2000, function() {
            $active.removeClass('active last-active');
        });
}

function slideSwitchPromoReminders() {
    var $active = $('#pos-cashier-promo-reminder IMG.active');

    if ( $active.length == 0 ) $active = $('#pos-cashier-promo-reminder IMG:last');

    var $next =  $active.next().length ? $active.next()
        : $('#pos-cashier-promo-reminder IMG:first');

    $active.addClass('last-active');
        
    $next.css({opacity: 0.0})
        .addClass('active')
        .animate({opacity: 1.0}, 2000, function() {
            $active.removeClass('active last-active');
        });
}
