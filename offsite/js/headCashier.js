// for cashier record page
var dTable_scheduleProfilesTable;
var disabledDatesArray = [];
$(".datepickerForUserLeaves").each(function() {
    $(this).datepicker({dateFormat: 'MM d, yy',
        minDate: 0,
        beforeShowDay: function(date) {
            if(disableDates(date)){
                return [false];
            }
            return [true];
        }
    });
});

$(".timepickerForShiftSchedule").each(function() {
    $(this).timepicker({
        timeFormat: 'hh:mm tt',
        addSliderAccess: true,
        sliderAccessArgs: { touchonly: false }
    });
});

$('.datepickerForDayOffStart, .datepickerForDayOffEnd').datepicker({
    beforeShow: customRange,
    dateFormat: "MM d, yy",
});

function customRange(input) {

    if (input.id == 'datepickerForDayOffEnd') {
        var minDate = new Date($('#datepickerForDayOffStart').val());
        minDate.setDate(minDate.getDate() + 1)
        return {
            minDate: minDate
        };
    }
    return {}

}
// disable dates for leaves already applied
function disableLeaveDates(leaves) {
    $.each(leaves, function (index, obj) {
        disabledDatesArray.push(obj.leaveDate);
    });
}
// check if current leave matches dates from datepicker
function disableDates(date){
    var monthName = $.datepicker.formatDate('MM', date);
    var formattedDate = $.datepicker.formatDate('d', date);
    var date1 = monthName + " " + formattedDate + ", " + date.getFullYear();
    return ($.inArray(date1,disabledDatesArray) > -1);
}

 // for daily workload page
$(".datetimepickerForAddTerminal").each(function() {
    $(this).datetimepicker({
        dateFormat: 'MM d, yy',
        timeFormat: 'hh:mm tt',
        stepMinute: 15,
        controlType: 'select',
        onSelect: function(dateText, inst) {
            $.get('getTerminalCount', { selectedDate: dateText }, function(obj) {
                document.getElementById('terminalCount').value = obj.terminalCount;
                document.getElementById('terminalCountId').value = obj.id;
            });
        }
    });
});

$(".datepickerForViewGraph").each(function() {
    $(this).datepicker({
        dateFormat: 'MM d, yy',
        onSelect: function(selectedDay, inst) {
            renderGraph.getData(selectedDay);
        }
    });
});

var renderGraph = {
    getData: function(date) {
        var dateInput;
        var combine = {};
        var terminalCountPerHourArray = [];
        var terminalCountPerFifteenArray = [];
        var terminalCountPerThirtyArray = [];
        var terminalCountPerFourtyFiveArray = [];
        var terminalScheduleArray = [];
        if (date != null && date.length != 0) {
            dateInput = date;
        }

        $.get('getDataForGraph', { selectedDay : dateInput }, function(objList) {

            $.each(objList.displayTime, function (index, obj) {
                terminalScheduleArray.push(obj);
            });
            $.each(objList.countPerHour, function (index, obj) {
                terminalCountPerHourArray.push(obj);
            });
            $.each(objList.countPerFifteen, function (index, obj) {
                terminalCountPerFifteenArray.push(obj);
            });
            $.each(objList.countPerThirty, function (index, obj) {
                terminalCountPerThirtyArray.push(obj);
            });
            $.each(objList.countPerFourtyFive, function (index, obj) {
                terminalCountPerFourtyFiveArray.push(obj);
            });
            combine = {"countPerHour":terminalCountPerHourArray, 
                    "countPerFifteen":terminalCountPerFifteenArray,
                    "countPerThirty":terminalCountPerThirtyArray,
                    "countPerFourtyFive":terminalCountPerFourtyFiveArray,
                    "sched":terminalScheduleArray};

            renderGraph.drawGraph(combine);

        });
    },

    drawGraph: function(combinedData) {

        // data for every 15 minutes
        var s0 = combinedData.countPerHour;
        var s1 = combinedData.countPerFifteen;
        var s2 = combinedData.countPerThirty;
        var s3 = combinedData.countPerFourtyFive;
        
        // calculate for the max y-axis value
        var maxArrays = [];
        var s0Max = Math.max.apply(Math, s0);
        var s1Max = Math.max.apply(Math, s1);
        var s2Max = Math.max.apply(Math, s2);
        var s3Max = Math.max.apply(Math, s3);
        maxArrays.push(s0Max, s1Max, s2Max, s3Max);
        var maxValue = Math.max.apply(Math, maxArrays);
        var maxYaxis = Math.ceil((maxValue+1)/100)*100;

        // values for the x-axis
        var ticks = combinedData.sched;

        $("#terminalGraph").html('');
        var plot1 = $.jqplot('terminalGraph', [s0, s1, s2, s3], {
            seriesDefaults:{
                renderer:$.jqplot.BarRenderer,
                rendererOptions: {fillToZero: true},
                pointLabels: { show: true, location: 'n', edgeTolerance: -15, hideZeros: true}
            },

            series:[
                {label:'Terminal Count'}
            ],

            axes: {
                xaxis: {
                    renderer: $.jqplot.CategoryAxisRenderer,
                    ticks: ticks,
                    tickOptions: {
                        fontSize: '7pt'
                    }
                },
                yaxis: {
                    show: true,
                    min: 0,
                    max: maxYaxis,
                    pad: 1.05,
                    numberTicks: 11,
                    tickOptions: {
                        formatString: '%d',
                        fontSize: '8pt'
                    }
                }
            }
        });
    }
};

$('#weeksPerCycle').change(function() {
	showWeekCycleConfig(this.value);
});

$('#weeksPerCycle').keyup(function() {
	showWeekCycleConfig(this.value);
});

function showWeekCycleConfig( val ) {
	if (val !== "") {
	    if (val == "0") {
	    	disableAndHideWeekCycles();
            $('#week1').attr('disabled', 'disabled');
	    	$('#week1Row').show('fast');
	    } else {
	        for (var i=1; i <= val; i++) {
	            $('#week' + i).removeAttr('disabled');
	            $('#week' + i + 'Row').show('fast');
	        }
	        var toHide = 6 - val;
	        for (var i=6; i > val; i--) {
	            $('#week'+i+'Row').hide('fast');
	        }
	    }
    }
}

function disableAndHideWeekCycles() {
	$("select[id^='week']").attr('disabled', 'disabled');
	$("tr[id^='week']").hide('fast');
}

function cashierEmploymentStatus(data, type, full) {
    var empStatus = null;
    if (full.cashierDetail != null) {
        if ("SM_CONTRACTUAL" == full.cashierDetail.contractType) {
            return "Fulltime";
        }
        else {
            return "Internship";
        }
    } else {
        return "";
    }
}

function cashierScheduleTime(data, type, full) {
    var shift1time = full.shift1StartTime + "-" + full.shift1EndTime;
    var shift2time = full.shift2StartTime + "-" + full.shift2EndTime;
    return shift1time + "<br>" + shift2time;
}

function cashierParameterAction (data, type, full) {
    var urlView = webContextPath + "/headcashier/viewCashierDetails/"+full.employeeId;
    var urlAdd = webContextPath + "/headcashier/addCashierParameters/"+full.employeeId;
    var actionTxt = "Add";
    var view = '<a href="'+urlView+'" name="'+full.employeeId+'">View</a>';
    var actionArr = [];
    var action = "";
    if (full.cashierDetail != null) {
        actionArr.push(view);
        actionTxt = "Update";
    }
    var add = '<a href="'+urlAdd+'" name="'+full.employeeId+'">'+actionTxt+'</a>';
    actionArr.push(add);
    for (var index in actionArr) {
        if (index != 0) {
            action += "&nbsp;|&nbsp;";
        } 
        action += actionArr[index];
    }
    return action;
}

function scheduleProfileLink(data, type, full) {
    var urlView = webContextPath + "/headcashier/viewScheduleProfile/"+full.id;
    return "<a href='"+urlView+"'>"+full.profileName+"</a>";
}

function scheduleProfileDaysOff(data, type, full) {
    var schedules = full.schedules;
    var i=0;
    var dayoff="";
    for (i=0; i<schedules.length; i++) {
        if (schedules[i].isDayOff) {
            if (dayoff.length) {
                 dayoff += ",";
            }
            dayoff += schedules[i].day;
        }
    }
    return dayoff;
}

function scheduleProfilesAction(data, type, full) {
    var del = "<a href='' onclick='confirmScheduleDeleteProfile(\""+full.id+"\");return false;'>Delete</a>";
    var upURL = webContextPath + "/headcashier/updateScheduleProfile/"+full.id;
    var up = "<a href='" + upURL + "' >Update</a>";
    return up + "&nbsp;&nbsp;|&nbsp;&nbsp;" + del;
}

function confirmScheduleDeleteProfile(id) {
    var title = "Delete Schedule Profile";
    var msg = "Are you sure you want to delete this schedule profile?";
    
    showConfirmDialog(msg,title,function() {
        $.ajax({
            url : webContextPath + "/headcashier/deleteScheduleProfile/" + id,
            type : "GET",
            async: false,
            dataType : "json",
            success : function(res) {
                uilog("DBUG","here");
                if (res.infoMsg) {
                    showInfoMsg(res.infoMsg);
                    if (dTable_scheduleProfilesTable)
                    	dTable_scheduleProfilesTable.fnDraw();
                }
            },
            error : function(jqXHR, status, error) {
                showMsgDialog("Error : " + error,"error");
            }
        });
    });
}

function timeslotActions (data, type, full) {
    var upUrl = webContextPath + '/headcashier/viewTimeslot/' + full.id;
    var up = '<a href="'+upUrl+'" name="update-'+full.id+'">Update</a>';
    var del = '<a name="delete-' + full.id + '" onclick="confirmDeleteTimeslotConfig(\'' + full.id + '\');">Delete</a>';
    return up + '&nbsp;' + del
}

function viewWorkload (data, type, full) {
    var url = webContextPath + '/headcashier/viewWorkloadProfile/' + data;
    return '<a href="'+url+'" name="profile-'+data+'">'+full.profileName+'</a>'
}

function workloadActions (data, type, full) {
    var url = webContextPath + '/headcashier/updateWorkload/' + full.id;
    var up = '<a href="'+url+'" name="up-'+full.id+'"><span>Update</span></a>';
    var del = '<a name="del-' + full.id + '" onclick="confirmDeleteProfile(\'' + full.id + '\');"><span>Delete</span></a>';
    var schedUrl = webContextPath + "/headcashier/viewGenerateScheduleForm/" + full.id;
    var sched = '<a href="'+schedUrl+'" name="sched-'+full.id+'"><span>Generate Schedule</span></a>';
    return sched + "&nbsp;&nbsp;|&nbsp;&nbsp;" + up + "&nbsp;&nbsp;|&nbsp;&nbsp;" + del
}

function budgetActions (data, type, full) {
	return '<a name="delete-' + full.id + '" onclick="confirmDeleteBudget(\'' + full.id + '\');">Delete</a>'
}

function viewBudget (data, type, full) {
    var url = webContextPath + '/headcashier/viewBudgetParam/' + data;
    return '<a href="'+url+'" name="data-'+data+'">'+data+'</a>'
}

$(".datePickerForPregnancyDue").each(function() {
    $(this).datepicker({dateFormat: 'MM d, yy',
        minDate: 0,
        beforeShowDay: function(date) {
            if(disableDates(date)){
                return [false];
            }
            return [true];
        }
    });
});

$(".datePickerForConfigDate").each(function() {
	$(this).datepicker({dateFormat: 'yy-mm-dd',
        minDate: 0,
        beforeShowDay: function(date) {
            if(disableDates(date)){
                return [false];
            }
            return [true];
        }
    });
});

function confirmDeleteProfile( profileId ) {
    var title = "Delete General Parameter";
    var msg = "Are you sure you want to delete this profile?";
    var url = "/headcashier/deleteWorkload/" + profileId;
    
    showConfirmDialog(msg,title,function() {
        $.ajax({
            url : webContextPath + url,
            type : "GET",
            async: false,
            dataType : "json",
            success : function(res) {
                if (res.infoMsg) {
                    showInfoMsg(res.infoMsg);
                    // functions that refresh the list table 
                    var dTable = $("#vWorkloadListTable").dataTable();
                    dTable.fnDraw();
                }
            },
            error : function(jqXHR, status, error) {
            	showMsgDialog("Error : " + error,"error");
            }
        });
    });
}

function confirmDeleteTimeslotConfig( configId ) {
    var title = "Delete Timeslot Configuration";
    var msg = "Are you sure you want to delete this configuration?";
    var url = "/headcashier/deleteTimeslotConfig/" + configId;
    
    showConfirmDialog(msg,title,function() {
        $.ajax({
            url : webContextPath + url,
            type : "GET",
            async: false,
            dataType : "json",
            success : function(res) {
                if (res.infoMsg) {
                    showInfoMsg(res.infoMsg);
                    // functions that refresh the list table 
                    var dTable = $("#vTimeslotListTable").dataTable();
                    dTable.fnDraw();
                }
            },
            error : function(jqXHR, status, error) {
            	showMsgDialog("Error : " + error,"error");
            }
        });
    });
}

function confirmDeleteBudget( id ) {
	var title = "Delete Budget Parameter Group";
	var msg = "Are you sure you want to delete this group?";
	var url = "/headcashier/deleteBudget/" + id;

	showConfirmDialog(msg,title,function() {
	    $.ajax({
	        url : webContextPath + url,
	        type : "GET",
	        async: false,
	        dataType : "json",
	        success : function(res) {
	            if (res.infoMsg) {
	                showInfoMsg(res.infoMsg);
	                // functions that refresh the list table 
	                var dTable = $("#vBudgetListTable").dataTable();
	                dTable.fnDraw();
	            }
	        },
	        error : function(jqXHR, status, error) {
	           showMsgDialog("Error : " + error,"error");
	        }
	    });
	});
}

function changeHourTotal(input, shift, day) {
    var cur = new Date();
    var hour = $( '#shift' + shift + 'StartTimeHrs' + day ).val();
    var min = $( '#shift' + shift + 'StartTimeMins' + day ).val();
    var startDate = new Date( cur.getFullYear(), cur.getMonth(), cur.getDate(), hour, min, 0, 0 )
    hour = $( '#shift' + shift + 'EndTimeHrs' + day ).val();
    min = $( '#shift' + shift + 'EndTimeMins' + day ).val();
    var endDate = new Date( cur.getFullYear(), cur.getMonth(), cur.getDate(), hour, min, 0, 0 )

    var diff = endDate.getTime() - startDate.getTime();
    diff = diff / 1000 / 60 / 60;
    $( '#shift' + shift + 'HourTotal' + day ).val( parseFloat( Math.round(diff * 100) / 100 ).toFixed( 1 ) );
    $( '#tmpShift' + shift + 'HourTotal' + day ).val( parseFloat( Math.round(diff * 100) / 100 ).toFixed( 1 ) );

    var max = $( '#maxShiftHours' ).val();
    var min = $( '#minShiftHours' ).val();
    if ( diff > max ) {
        showError( "Total shift hours for " + day + " shift " + shift
                + " exceeds the maximum shift hours (" + max + ")" );
    } 
    else if ( diff < min ) {
        showError( "Total shift hours for " + day + " shift " + shift
                + " is less that the minimum shift hours (" + min + ")" );
    }
}

function showError(msg) {
    $( "#errDiv" ).html( msg ).stop().css( 'opacity', '1.0' ).show().fadeOut( 10000 );
}

function getWeeklyTimeslotConfig(dateStr, profId) {
	$.ajax({
        url : webContextPath + "/headcashier/getWeeklyTimeslotConfig",
        type : "GET",
        async : true,
        dataType : "json",
        data : {
        	profileId : profId,
        	dateStr : dateStr
        },
        success : function ( data ) {
        	var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    		$.each( days, function( index, day ){
    			$( "#tbody-" + day ).html( "" );
    	    	$( "#tbody-" + day ).append( '<tr id="emptyRow-' + day + '"><td valign="top" colspan="2" class="dataTables_empty">No data available in table</td></tr>' );
    		});
        	if ( data ) {
        		uilog("DBUG", data);
        		$.each(data, function( oKey, oValue ){
            	    uilog("DBUG", "key=" + oKey );
            	    if (oValue) {
            	    	$( "#tbody-" + oKey ).html( "" );
            	    	$( "#emptyRow-" + oKey).hide();
            	    }
            	    $.each(oValue, function( key, value ){
            	        uilog("DBUG", "value=" + value );
            	        $( "#tbody-" + oKey ).append( "<tr><td>" + value.startTimeStr + " - " + value.endTimeStr + "</td><td>" + value.maxOpenTerminal + "</td></tr>" );
            	    });
            	});
        	}
        },
        error : function( jqXHR, status, error ) {
        	showMsgDialog("Error : " + error,"error");
        }
    });
}

function changeCustomerCount( percent ) {
    var targetTotal = 0;
    $("input.prevCount").each(function() {
        var targetId = $(this).attr("id").replace("prev", "target");
        var tconfigId = $(this).attr("id").replace("prev", "tconfig");
        var prevCount = parseInt($(this).attr("value"));
        var targetCount = parseInt(prevCount * ((percent / 100) + 1));
        var terminalCount = parseInt(targetCount / 3);
        targetTotal += targetCount;
        $("#"+targetId).attr("value", targetCount);
        $("#"+tconfigId).attr("value", terminalCount);
    });
    $("#totalCustomerTarget").text( targetTotal);
}

function changeAllTerminalCount( count ) {
	$("input.terminalCount").each(function() {
        $(this).attr("value", count);
    });
}

function getDailyProfileTerminalCount(profId, dateStr, interval) {
	$.ajax({
        url : webContextPath + "/headcashier/getDailyProfileTerminalCount",
        type : "GET",
        async : true,
        dataType : "json",
        data : {
        	profileId : profId,
        	dateStr : dateStr,
        	interval : interval
        },
        success : function ( data ) {
        	if ( data ) {
        		uilog("DEBUG", data);
    			var setAllCountField = true;
        		$.each( data, function( oKey, oValue ) {
        			var count = oValue;
            	    if (count == 0) {
            	    	count = parseInt( $("#target_"+oKey).attr("value") / 3 );
            	    }
	            	$("#tconfig_"+oKey).attr("value", count);
	            	if ( setAllCountField ) {
		                $("#allTerminalCount").attr("value", count);
		                setAllCountField = false;
	            	}
            	});
        	} else {
        		uilog("DBUG", data);
        	}
        },
        error : function( jqXHR, status, error ) {
        	showMsgDialog("Error : " + error,"error");
        }
    });
}

function getYesNoStatus ( bolValue ) {
	if ( bolValue ) {
		return "Y";
	}
	else {
		return "N";
	}
}

function renderWeekEndDayOffStatus ( data, type, full ) {
	return getYesNoStatus ( full.allowWeekEndDayOff );
}

function disableDayoffRow( day ) {
    $('.'+day).attr('disabled', true);
    $('.'+day).attr('value', '');
    $('.total'+day).attr('value', '0.0');
    $('.'+day+'Name').removeClass('text-display').addClass('text-label');
}