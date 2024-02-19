var isAuthenticated = false;
var isPreAuthenticated = false;
var barangSubsidi = false;
var isUserBarcodeRequired = false; // set true for now, to be finalized (this step can be removed depending on the client)
var isKeyInAvail = true; // set true for now, to be finalized. (must be configurable)
// will be true if [x] button was clicked.
var isConfirmBtnClicked = false;
var isAuthFormBtnClicked = false;
var isRenewMembershipSelected = false;
var mdrSurchargeGlobal = 0;
var isEftOnlineTxTypeSelected = false;
var lockKeyboard = false;
var intervention = [];
var giftNumber = "";
var donasiCode = "";
var donasiFlag = false;
var donasiRes = "";
var donasiVoidPrice = "";
var checkCancelCmc = false;
var empLoyaltyPointsAvail = false;
var loyEarnPointsSelected = false;
var loyVIPThemeParkSelected = false;
var loyaltyProgram = [];
var InfoSalesNoOrder = [];
var trNumberFlag = false;
var redeemProgram = [];
var dataLoyaltyProg = [];
var trNumberPoint;
var trEventId;
var InfoloyaltyProgram = [];
var unpointProgram = [];
var POS_DIALOGS = POS_DIALOGS || {};
var grabDetailOrder = [];
var grabItemsOrderIsValid = true;
var ovocountCashier;
var ovocounterCashier;
var midnightSalesTimeout;
var salesNoOrder;

POS_DIALOGS.enableCardNoKeyboard = function ($domForCardNoKeyboard) {
    $domForCardNoKeyboard.keyboard({
        display: numberDisplay2,
        layout: 'custom',
        customLayout: customNumberLayout2,
        maxLength: 19,
        change: function (e, keyboard, el) {
            var previewTxt = keyboard.preview;
            var currVal = $(previewTxt).val();
            var txtLen = currVal.length;
            if (txtLen == 5 || txtLen == 10 || txtLen == 15 || txtLen == 20)
                $(previewTxt).val(currVal.substring(0, txtLen - 1) + "-" + currVal.substring(txtLen - 1, txtLen));
        },
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
};

POS_DIALOGS.enableBinNoKeyboard = function ($domForBinNoKeyboard) {
    $domForBinNoKeyboard.keyboard({
        display: numberDisplay2,
        layout: 'custom',
        customLayout: customNumberLayout2,
        maxLength: 6,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
};

/**
 * Function to reset order message dialog's
 * title, buttons, message
 * NOTE: Cannot place this inside open() of jQuery dialog
 */
POS_DIALOGS.resetOrderMessageDialog = function () {
    $("#orderMsgReminder").text('');
    $("#order-message").dialog('option', 'title', '');
    $("#order-message").dialog('option', 'buttons', {});
};

POS_DIALOGS.resetCustomerDataDialog = function () {
    //$("#orderMsgReminder").text('');un	$("#customer-data").dialog('option', 'title', 'CUSTOMER DATA');
    $("#customer-data").dialog('option', 'buttons', {});
};

var numberDisplay1 = {
    'bksp': "back",
    'accept': 'accept'
};
var customNumberLayout1 = {
    'default': [
        '7 8 9 ',
        '4 5 6 ',
        '1 2 3 ',
        '0 {bksp} {accept}'
    ]
};
var numberDisplay2 = {
    'clear': "clear",
    'accept': 'accept'
};
var customNumberLayout2 = {
    'default': [
        '7 8 9 ',
        '4 5 6 ',
        '1 2 3 ',
        '0 {clear} {accept}'
    ]
};
var customNumberLayout3 = {
    'default': [
        '7 8 9',
        '4 5 6',
        '1 2 3',
        '0 . {clear} {accept}'
    ]
};
var completeDisplay = {
    'bksp': "backspace",
    'accept': 'accept',
    'default': 'ABC',
    'meta1': '.?123',
    'meta2': '#+='
};
var customCompleteLayout = {
    'default': [
        'q w e r t y u i o p {bksp}',
        'a s d f g h j k l {accept}',
        '{s} z x c v b n m , . {s}',
        '{meta1} {space} {meta1}'
    ],
    'shift': [
        'Q W E R T Y U I O P {bksp}',
        'A S D F G H J K L {accept}',
        '{s} Z X C V B N M ! ? {s}',
        '{meta1} {space} {meta1}'
    ],
    'meta1': [
        '1 2 3 4 5 6 7 8 9 0 {bksp}',
        '- / : ; ( ) \u20ac & @ {accept}',
        '{meta2} . , ? ! \' " {meta2}',
        '{default} {space} {default}'
    ],
    'meta2': [
        '[ ] { } # % ^ * + = {bksp}',
        '_ \\ | ~ < > $ \u00a3 \u00a5 {accept}',
        '{meta1} . , ? ! \' " {meta1}',
        '{default} {space} {default}'
    ]
};

var addClickHandler = function (kb) {
    isInputFromScanner = false;
    kb.$allKeys.unbind('mousedown.audio').on('mousedown.audio', function () {
        if (typeof kb.inputText == 'undefined') kb.inputText = '';

        if ($(this).text() == 'accept' && kb.inputText != '') {
            uilog('DBUG', 'SCR||VKB||' + kb.inputText);
            kb.inputText = '';
            return;
        }

        kb.inputText += $(this).text() + ',';
    });
};

var addClickHandler2 = function (kb) {
    isInputFromScanner = true;
    kb.$allKeys.unbind('mousedown.audio').on('mousedown.audio', function () {
        if (typeof kb.inputText == 'undefined') kb.inputText = '';

        if ($(this).text() == 'accept' && kb.inputText != '') {
            uilog('DBUG', 'SCR||VKB||' + kb.inputText);
            kb.inputText = '';
            return;
        }

        kb.inputText += $(this).text() + ',';
    });
};

$("#authenticationForm").validate({
    onfocusout: false,
    errorPlacement: function ($error, $element) {
        var name = $element.attr("name");
        $("#error" + name).append($error).fadeOut(7000, function () {
            $("#error" + name).empty();
            $("#error" + name).attr("style", "");
        });
    },
    rules: {
        authFormUsername: {
            required: true
        },
        authFormEmpPin: {
            required: true
        }
    },
    messages: {
        authFormUsername: "(Please fill up this field.)",
        authFormEmpPin: "(Please fill up this field.)"
    }

});

$(document).ready(function () {
    if (typeof i != 'undefined') {
        $("#redeemReward" + i).keyboard({
            display: numberDisplay1,
            layout: 'custom',
            customLayout: customNumberLayout1,
            visible: function (e, keyboard, el) {
                addClickHandler(keyboard);
            }
        });
    }
    POS_DIALOGS.enableCardNoKeyboardLength = function ($domForCardNoKeyboard, $varLength) {
        $domForCardNoKeyboard.keyboard({
            display: numberDisplay2,
            layout: 'custom',
            customLayout: customNumberLayout2,
            maxLength: $varLength,
            change: function (e, keyboard, el) {
                var previewTxt = keyboard.preview;
                var currVal = $(previewTxt).val();
                var txtLen = currVal.length;
                if (txtLen == 5 || txtLen == 10 || txtLen == 15 || txtLen == 20)
                    $(previewTxt).val(currVal.substring(0, txtLen - 1) + "-" + currVal.substring(txtLen - 1, txtLen));
            },
            visible: function (e, keyboard, el) {
                addClickHandler(keyboard);
            }
        });
    };
    $("#eftOfflineCardNoInput6dig").keyboard({
        display: numberDisplay2,
        layout: 'custom',
        customLayout: customNumberLayout2,
        maxLength: 9,
        change: function (e, keyboard, el) {
            var previewTxt = keyboard.preview;
            var currVal = $(previewTxt).val();
            var txtLen = currVal.length;
            if (txtLen == 5 || txtLen == 10 || txtLen == 15 || txtLen == 20)
                $(previewTxt).val(currVal.substring(0, txtLen - 1) + "-" + currVal.substring(txtLen - 1, txtLen));
        },
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    
    //e-MOTOR (DIALOG CLOSE)
    $("#MotorListrik-dialog").on("dialogclose", function (event, ui) {
        $("#MotorListrikSearchMsg").empty();
        $("#MotorListrikNumField").val("");
    });
    

    $("#eftOfflineCardNoInput4dig").keyboard({
        display: numberDisplay2,
        layout: 'custom',
        customLayout: customNumberLayout2,
        maxLength: 2,
        change: function (e, keyboard, el) {
            var previewTxt = keyboard.preview;
            var currVal = $(previewTxt).val();
            var txtLen = currVal.length;
            if (txtLen == 5 || txtLen == 10 || txtLen == 15 || txtLen == 20)
                $(previewTxt).val(currVal.substring(0, txtLen - 1) + "-" + currVal.substring(txtLen - 1, txtLen));
        },
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#eftOnlineWcNoInput6dig").keyboard({
        display: numberDisplay2,
        layout: 'custom',
        customLayout: customNumberLayout2,
        maxLength: 7,
        change: function (e, keyboard, el) {
            var previewTxt = keyboard.preview;
            var currVal = $(previewTxt).val();
            var txtLen = currVal.length;
            if (txtLen == 5 || txtLen == 10 || txtLen == 15 || txtLen == 20)
                $(previewTxt).val(currVal.substring(0, txtLen - 1) + "-" + currVal.substring(txtLen - 1, txtLen));
        },
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#eftOnlineWcNoInput4dig").keyboard({
        display: numberDisplay2,
        layout: 'custom',
        customLayout: customNumberLayout2,
        maxLength: 4,
        change: function (e, keyboard, el) {
            var previewTxt = keyboard.preview;
            var currVal = $(previewTxt).val();
            var txtLen = currVal.length;
            if (txtLen == 5 || txtLen == 10 || txtLen == 15 || txtLen == 20)
                $(previewTxt).val(currVal.substring(0, txtLen - 1) + "-" + currVal.substring(txtLen - 1, txtLen));
        },
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#custName").keyboard({
        display: completeDisplay,
        layout: 'custom',
        customLayout: customCompleteLayout,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#custPhone").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        customLayout: customNumberLayout1,
        maxLength: 15,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#authFormUsername").keyboard({
        display: completeDisplay,
        layout: 'custom',
        customLayout: customCompleteLayout,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#inqSalesNoOrder").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#authFormEmpPin").keyboard({
        display: completeDisplay,
        layout: 'custom',
        customLayout: customCompleteLayout,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#barcodeAuthFormEmpCode").keyboard({
        display: completeDisplay,
        layout: 'custom',
        customLayout: customCompleteLayout,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#newPassword1").keyboard({
        display: completeDisplay,
        layout: 'custom',
        customLayout: customCompleteLayout,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#newPassword2").keyboard({
        display: completeDisplay,
        layout: 'custom',
        customLayout: customCompleteLayout,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#trkPoint").keyboard({
        display: completeDisplay,
        layout: 'custom',
        usePreview: false,
        customLayout: customCompleteLayout,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#trkSales").keyboard({
        display: completeDisplay,
        layout: 'custom',
        customLayout: customCompleteLayout,
        usePreview: false,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#IdvalTrNumber").keyboard({
        //display: completeDisplay,
        display: numberDisplay1,
        layout: 'custom',
        maxLength: 17,
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#unpTrNumber").keyboard({
        //display: completeDisplay,
        display: numberDisplay1,
        layout: 'custom',
        maxLength: 17,
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    // $("#redeemRewardA").keyboard({
    //display: completeDisplay,
    // display: numberDisplay1,
    // layout: 'custom',
    // customLayout: customNumberLayout1,
    // visible: function(e, keyboard, el) 
    // {
    // addClickHandler(keyboard);
    // }
    // });
    // $("#redeemRewardB").keyboard({
    //display: completeDisplay,
    // display: numberDisplay1,
    // layout: 'custom',
    // customLayout: customNumberLayout1,
    // visible: function(e, keyboard, el) 
    // {
    // addClickHandler(keyboard);
    // }
    // });
    $("#priceInput").keyboard({
        //display: numberDisplay1,
        //layout: 'custom',
        //customLayout: customNumberLayout1
        display: numberDisplay2,
        layout: 'custom',
        customLayout: customNumberLayout2,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    // CR RETURN
    $("#returnQty").keyboard({
        display: numberDisplay2,
        layout: 'custom',
        customLayout: customNumberLayout2,
        alwaysOpen: false,
        usePreview: false,
        noFocus: true,
        canceled: function (e, keyboard, el) {
            el.value = '';
        },
        visible: function (e, keyboard, el) {
            $('.ui-keyboard-preview').val('');
            el.value = '';
            addClickHandler(keyboard);
        }
    });
    // DONASI
    $("#subDonate").keyboard({
        display: numberDisplay2,
        layout: 'custom',
        customLayout: customNumberLayout2,
        noFocus: true,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#returnTotalPrice").keyboard({
        display: numberDisplay2,
        layout: 'custom',
        customLayout: customNumberLayout2,
        alwaysOpen: false,
        usePreview: false,
        noFocus: true,
        canceled: function (e, keyboard, el) {
            el.value = '';
        },
        visible: function (e, keyboard, el) {
            $('.ui-keyboard-preview').val('');
            el.value = '';
            addClickHandler(keyboard);
        }
    });

    $("#returnTotalDiscount").keyboard({
        display: numberDisplay2,
        layout: 'custom',
        customLayout: customNumberLayout2,
        alwaysOpen: false,
        usePreview: false,
        noFocus: true,
        /*accepted : function(e,keyboard, el)
        {
                if(el.value == '' || el.value == null) el.value == 0;
                console.log(el.value);
        },*/
        canceled: function (e, keyboard, el) {
            if ($("#returnConfirmation-dialog").data("freshItem")) el.value = '';
        },
        visible: function (e, keyboard, el) {
            if ($("#returnConfirmation-dialog").data("freshItem")) {
                $('.ui-keyboard-preview').val('');
                el.value = '';
            }
            addClickHandler(keyboard);
        }
    });

    $("#returnMegaDiscount").keyboard({
        display: numberDisplay2,
        layout: 'custom',
        customLayout: customNumberLayout2,
        alwaysOpen: false,
        usePreview: false,
        noFocus: true,
        /*accept : function(e,keyboard, el)
        {
                if(el.value == '' || el.value == null) el.value == 0;
                console.log(el.value);
        },*/
        canceled: function (e, keyboard, el) {
            if ($("#returnConfirmation-dialog").data("freshItem")) el.value = '';
        },
        visible: function (e, keyboard, el) {
            if ($("#returnConfirmation-dialog").data("freshItem")) {
                $('.ui-keyboard-preview').val('');
                el.value = '';
            }
            addClickHandler(keyboard);
        }
    });

    // CR RETURN	

    $("#amountDialogConfirmInput").keyboard({
        display: numberDisplay2,
        layout: 'custom',
        customLayout: customNumberLayout2,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        },
        change: function (e, keyboard, el) {
            var previewTxt = keyboard.preview;
            var currVal = $(previewTxt).val();
            var txtLen = currVal.length;
            if (txtLen > 3) {
                $(previewTxt).val(numberWithCommas(currVal.replace(/,/g, '')));
            }
        }
    });

    $("#txnIdDialogConfirmInput").keyboard({
        display: numberDisplay2,
        layout: 'custom',
        customLayout: customNumberLayout2,
        maxLength: 18,
        usePreview: false,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#crmCmdField").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#loyaltyProgField").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        maxLength: 1,
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#inputItem").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#tspcOrder").keyboard({
        display: numberDisplay2,
        layout: 'custom',
        maxLength: 16,
        customLayout: customNumberLayout2,
        usePreview: false,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#valKtpNumber").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        maxLength: 16,
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#valHpNumber").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        maxLength: 16,
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#valOtpCode").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        maxLength: 8,
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#valGenEmailRedeem").keyboard({
        display: completeDisplay,
        layout: 'custom',
        customLayout: customCompleteLayout,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#valGenKtp").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        maxLength: 16,
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#valGenGenTglLahir").keyboard({
        display: numberDisplay2,
        layout: 'custom',
        maxLength: 2,
        customLayout: customNumberLayout2,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#valGenGenBlnLahir").keyboard({
        display: numberDisplay2,
        layout: 'custom',
        maxLength: 2,
        customLayout: customNumberLayout2,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#valGenGenThnLahir").keyboard({
        display: numberDisplay2,
        layout: 'custom',
        maxLength: 4,
        customLayout: customNumberLayout2,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    // $("#valTglLahir").datepicker({
    // dateFormat: 'dd/mm/yy'
    // });
    $("#valTglLahir").keyboard({
        display: numberDisplay2,
        layout: 'custom',
        maxLength: 2,
        customLayout: customNumberLayout2,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#valBlnLahir").keyboard({
        display: numberDisplay2,
        layout: 'custom',
        maxLength: 2,
        customLayout: customNumberLayout2,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#valThnLahir").keyboard({
        display: numberDisplay2,
        layout: 'custom',
        maxLength: 4,
        customLayout: customNumberLayout2,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#valMemberName").keyboard({
        display: completeDisplay,
        layout: 'custom',
        customLayout: customCompleteLayout,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#valAlamat").keyboard({
        display: completeDisplay,
        layout: 'custom',
        customLayout: customCompleteLayout,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#valEmail").keyboard({
        display: completeDisplay,
        layout: 'custom',
        customLayout: customCompleteLayout,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#valRegKtpNumber").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        maxLength: 16,
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#valRegHpNumber").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        maxLength: 16,
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#valRegMemberName").keyboard({
        display: completeDisplay,
        layout: 'custom',
        customLayout: customCompleteLayout,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#valRegEmail").keyboard({
        display: completeDisplay,
        layout: 'custom',
        customLayout: customCompleteLayout,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#redeemOTPConf").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#MotorListrikNumField").keyboard({
        display: completeDisplay,
        layout: 'custom',
        customLayout: customCompleteLayout,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#inqLoyalMemberId").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#inqLoyalPhone").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#unpointLoyalMemberId").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#unpointLoyalPhone").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        maxLength: 16,
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#redeemLoyalMemberId").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#redeemLoyalPhone").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#crmTrIdField").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#topUpCmdField").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#topUpTrIdField").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#topUpPNumField").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#indosmartCmdField").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#indosmartTrIdField").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        usePreview: false,
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#indosmartPNumField").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#mCashCmdField").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#mCashTrIdField").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        usePreview: false,
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#mCashPNumField").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#alterraCmdField").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#alterraTrIdField").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        usePreview: false,
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#alterraPNumField").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#topUpPhoneNumber").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    })

    //SIMPATINDO Keyboard
    $("#simpatindoCmdField").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#simpatindoInquiryField").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#simpatindoBarcodeField").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        customLayout: customNumberLayout1,
        usePreview: false,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#simpatindoIdField").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#simpatindoNoField").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#simpatindoPeriodField").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    //SIMPATINDO Keyboard
    $("#mCashCmdField").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#mCashInquiryField").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#mCashBarcodeField").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        customLayout: customNumberLayout1,
        usePreview: false,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#mCashIdField").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#mCashPeriodField").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#ADAFIdField").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        usePreview: false,
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#stdSalePNumField").keyboard({
        display: numberDisplay2,
        layout: 'custom',
        customLayout: customNumberLayout2,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#indosmartStdSalePNumField").keyboard({
        display: numberDisplay2,
        layout: 'custom',
        customLayout: customNumberLayout2,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#mCashStdSalePNumField").keyboard({
        display: numberDisplay2,
        layout: 'custom',
        customLayout: customNumberLayout2,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#alterraStdSalePNumField").keyboard({
        display: numberDisplay2,
        layout: 'custom',
        customLayout: customNumberLayout2,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#memberCardField").keyboard({
        display: numberDisplay2,
        layout: 'custom',
        customLayout: customNumberLayout2,
        maxLength: 16,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#tenderNewAmountField").keyboard({
        display: numberDisplay2,
        layout: 'custom',
        customLayout: customNumberLayout2,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    // ROUNDING
    $("#tenderNewAmountRoundingField").keyboard({
        display: numberDisplay2,
        layout: 'custom',
        maxLength: 2,
        customLayout: customNumberLayout2,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#tenderNewAmountCouponReturnCmcField").keyboard({
        display: numberDisplay2,
        layout: 'custom',
        customLayout: customNumberLayout2,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    // ROUNDING
    $("#tenderNewAmountCouponReturnCmcRoundingField").keyboard({
        display: numberDisplay2,
        layout: 'custom',
        maxLength: 2,
        customLayout: customNumberLayout2,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    // ROUNDING
    $("#eftOfflineApprovalCodeInput").keyboard({
        display: numberDisplay2,
        layout: 'custom',
        maxLength: 6,
        customLayout: customNumberLayout2,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#alloPaylaterApprovalCodeInput").keyboard({
        display: completeDisplay,
        layout: 'custom',
        customLayout: customCompleteLayout,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#stdCouponReturnField").keyboard({
        display: numberDisplay2,
        layout: 'custom',
        customLayout: customNumberLayout2,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#stdCouponReturnOfflineField").keyboard({
        display: numberDisplay2,
        layout: 'custom',
        customLayout: customNumberLayout2,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#stdCouponReturnAmountField").keyboard({
        display: numberDisplay2,
        layout: 'custom',
        customLayout: customNumberLayout2,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#eftOfflineBankIdInput").keyboard({
        display: numberDisplay2,
        layout: 'custom',
        maxLength: 2,
        customLayout: customNumberLayout2,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#functionNumField").keyboard({
        display: numberDisplay2,
        layout: 'custom',
        customLayout: customNumberLayout2,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#installmentAppNumField").keyboard({
        display: completeDisplay,
        layout: 'custom',
        customLayout: customCompleteLayout,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#giftcardInputField").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        customLayout: customNumberLayout1,
        openOn: null,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#eVoucherGiftCard").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    //mkt voucher
    $("#marketingVoucherField").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        customLayout: customNumberLayout1,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $('#spvInput').click(function () {
        console.log("spvInput : " + lockKeyboard);
        var kb = $('#giftcardInputField').getkeyboard();
        if (!lockKeyboard) {
            console.log("If  lockKeyboard: " + lockKeyboard);
            if (!cashierRole.isCustomerServiceCashier && cashierRole.isSalesCashier) {
                keyboardLock();
            } else {
                kb.reveal();
            }
        } else {
            //console.log("Else lockKeyboard: " + lockKeyboard);
            //if(cashierRole.isCustomerServiceCashier && !cashierRole.isSalesCashier){
            var nextSave = intervention;
            nextSave.amount = parseInt(gcPaymentAmount);
            SUPERVISOR_INTERVENTION.saveInterventionData(saleTx.transactionId, nextSave, nextSave.amount);
            kb.reveal();
            //}
        }
    });

    function keyboardLock() {
        var kb = $('#giftcardInputField').getkeyboard();
        var defer = $.Deferred();
        $("#authentication-form").removeData(AUTH_DATA_KEYS)
            .data('roles', ['ROLE_SUPERVISOR'])
            .data('defer', defer)
            .data('interventionType', CONSTANTS.TX_TYPES.GC_INPUT.name)
            .dialog("open");
        /*
         * JQuery Deffered, used for chaining callbacks
         * @author http://api.jquery.com/jQuery.Deferred/
         */
        defer.promise()
            .done(function (supervisorInterventionData) {
                // temporary save the intervention data
                supervisorInterventionData.amount = parseInt(gcPaymentAmount);
                intervention = supervisorInterventionData;
                uilog('DBUG', "Supervisor Intervention : " + JSON.stringify(supervisorInterventionData));
                SUPERVISOR_INTERVENTION.saveInterventionData(saleTx.transactionId, supervisorInterventionData, supervisorInterventionData.amount);
                kb.reveal();
                lockKeyboard = true;
            });
    }


    $('#spvInputOtp').click(function () {
        if (resendClick >= 3) {
            spvOtp();
        } else {
            alert("Lakukan proses resend OTP terlebih dahulu");
        }
    });

    function spvOtp() {
        var defer = $.Deferred();
        $("#authentication-form").removeData(AUTH_DATA_KEYS)
            .data('roles', ['ROLE_SUPERVISOR'])
            .data('defer', defer)
            .data('interventionType', CONSTANTS.TX_TYPES.SPV_OTP.name)
            .dialog("open");
        defer.promise()
            .done(function (supervisorInterventionData) {
                var type = "get_otpSpv";
                var storeCode = configuration.storeCode;
                var hpNumber = redeemProgram.hpNumber;
                //var progCode = $("#valRedProgName").val();
                var progCode = $('input[name=redEvent]:checked').val();
                servicesOtpCode(type, hpNumber, storeCode, progCode);
                //temporary save the intervention data
                supervisorInterventionData.amount = 0;
                // intervention = supervisorInterventionData;
                uilog('DBUG', "Supervisor Intervention : " + JSON.stringify(supervisorInterventionData));
                SUPERVISOR_INTERVENTION.saveInterventionData(hpNumber, supervisorInterventionData, supervisorInterventionData.amount);
            });
    }
    $("#eleboxOrderIDField").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        customLayout: customNumberLayout1,
        alwaysOpen: false,
        maxLength: 13,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#bpjsAccountNumberField").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        customLayout: customNumberLayout1,
        alwaysOpen: false,
        maxLength: 16,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    $("#bpjsPeriodeField").keyboard({
        display: numberDisplay1,
        layout: 'custom',
        customLayout: customNumberLayout1,
        alwaysOpen: false,
        maxLength: 2,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    // voidDeptStore 2017022
    $("#voidDeptStorePrice").keyboard({
        display: numberDisplay2,
        layout: 'custom',
        customLayout: customNumberLayout2,
        alwaysOpen: false,
        preview: false,
        noFocus: true,
        canceled: function (e, keyboard, el) {
            el.value = '';
        },
        visible: function (e, keyboard, el) {
            $('.ui-keyboard-preview').val('');
            el.value = '';
            addClickHandler(keyboard);
        }
    });
    // voidDeptStore 2017022

    //INDENT SCREEN KEYBOARD
    $("#indentSlip").keyboard({
        display: completeDisplay,
        layout: 'custom',
        usePreview: false,
        customLayout: customCompleteLayout,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#indentSlipInquiry").keyboard({
        display: numberDisplay2,
        layout: 'custom',
        customLayout: customNumberLayout2,
        alwaysOpen: false,
        preview: false,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });
    //INDENT SCREEN KEYBOARD END
    // INDENT 2017-05-18

    $("#reprintInputField").keyboard({
        display: numberDisplay2,
        layout: 'custom',
        customLayout: customNumberLayout2,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#reprintByTxnNumField").keyboard({
        display: numberDisplay2,
        layout: 'custom',
        customLayout: customNumberLayout2,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#balloonGameMemberIdField").keyboard({
        display: numberDisplay2,
        layout: 'custom',
        customLayout: customNumberLayout2,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#transactionIdInput").keyboard({
        display: numberDisplay2,
        layout: 'custom',
        customLayout: customNumberLayout2,
        maxLength: 17,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#traceNumberInput").keyboard({
        display: numberDisplay2,
        layout: 'custom',
        customLayout: customNumberLayout2,
        maxLength: 6,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#billPaymentContractNumInputField").keyboard({
        display: completeDisplay,
        layout: 'custom',
        customLayout: customCompleteLayout,
        visible: function (e, keyboard, el) {
            addClickHandler(keyboard);
        }
    });

    $("#authFormBtn").click(function () {
        $("#authFormMsg").empty();
        var authObj = null;

        var $parentFormDialog = $("#authentication-form");

        var roles = $parentFormDialog.data('roles');

        if ($("#authenticationForm").valid()) {
            authObj = authUser($("#authFormUsername").val(),
                $("#authFormEmpPin").val(),
                "pin",
                roles,
                $parentFormDialog.data("interventionType"),
                $parentFormDialog.data("action"));
            isPreAuthenticated = (authObj &&
                authObj.code === 0);
        }

        if (isPreAuthenticated) {
            // Closing the dialog
            $parentFormDialog.data('supervisorInterventionRes',
                authObj.supervisorInterventionRes)
                .dialog("close");
        } else {
            if (authObj) {
                $("#authFormMsg").html(authObj.msg);
            }
        }
        // CR RETURN
        isAuthFormBtnClicked = isPreAuthenticated;
        // CR RETURN
        // return false, to avoid reloading of page
        return false;
    });

    $("#barcodeAuthFormBtn").click(function () {
        var roles = $("#barcodeAuthentication-form").data('roles');
        var authObj = authUser($("#authFormUsername").val(), $("#authFormEmpPin").val(), "pin", roles);
        isAuthenticated = authObj.success;

        if (authObj.success) {
            $("#barcodeAuthentication-form").dialog("close");
        } else {
            $("#barcodeAuthFormMsg").html(authObj.message);
        }

        // return false, to avoid reloading of page
        return false;
    });

    $("#newPasswordBtn").click(function () {
        var pin1 = $("#newPassword1").val();
        var pin2 = $("#newPassword2").val();
        var $errMsgContainer = $("#firstLogonMsg");
        // Configurations
        var passwordMinLength = getConfigValue('PASSWORD_MINIMUM_LENGTH');
        // Error messages
        var errMsgFieldEmpty = getMsgValue('pos_warning_msg_empty_field');
        var errMsgPwdNotMatched = getMsgValue('pos_warning_msg_pwd_not_matched');
        var errMsgLengthLessThanMin = getMsgValue('pos_warning_msg_pwd_less_than_min_length').format(passwordMinLength);
        var errMsgCaseCombinationRequired = getMsgValue('pos_warning_msg_pwd_case_combination_required');

        if ($("#secondPinDiv").css("display") == "none") {
            if (pin1 == "") {
                $errMsgContainer.html(errMsgFieldEmpty);
            } else if (!/(?=.*[a-z])(?=.*[A-Z])/g.test(pin1)) {
                $errMsgContainer.html(errMsgCaseCombinationRequired);
            } else if (pin1.length < passwordMinLength) {
                $errMsgContainer.html(errMsgLengthLessThanMin);
            } else {
                $errMsgContainer.html("");
                $("#firstPinDiv").hide();
                $("#secondPinDiv").show();
            }
        } else {
            if (pin2 == "") {
                $errMsgContainer.html(errMsgFieldEmpty);
            } else if (!/(?=.*[a-z])(?=.*[A-Z])/g.test(pin2)) {
                $errMsgContainer.html(errMsgCaseCombinationRequired);
            } else if (pin2.length < passwordMinLength) {
                $errMsgContainer.html(errMsgLengthLessThanMin);
            } else {
                if (pin1 == pin2) {
                    var passwordChangeType = $("#firstLogon-dialog").data("passwordChangeType");
                    uilog("DBUG", "passwordChangeType: " + passwordChangeType);
                    var obj = updateUserPassword(pin1, passwordChangeType);
                    if (obj.users == null) {
                        clearPin();
                        $errMsgContainer.html(obj.msg);
                        $("#firstPinDiv").show();
                        $("#secondPinDiv").hide();
                    } else {
                        $("#firstLogon-dialog").dialog("close");
                        showMsgDialog(obj.msg, "info", function () {
                            DrawerModule.openDrawer({ afterLogin: true });
                        });
                    }
                } else {
                    clearPin();
                    $errMsgContainer.html(errMsgPwdNotMatched);
                    $("#firstPinDiv").show();
                    $("#secondPinDiv").hide();
                }
            }
        }
    });
    $("#topUpEnterBtn").click(function () {
        var response = null;
        var sendTopUpReq = false;
        var topUpCmd = null;
        $("#tuMsgSpan").empty();

        if ($("#topUp-dialog").data("saleType").toUpperCase() == CONSTANTS.TX_TYPES.RETURN.name)
            topUpCmd = "4";
        else
            topUpCmd = $("#topUpCmdField").val();

        if ($("#tuCmdDiv").css("display") == "block") {
            if (topUpCmd == "0" || topUpCmd == "1" || topUpCmd == "2" || topUpCmd == "3") {
                if (saleTx && saleTx.orderItems.length) {
                    showMsgDialog("KEY NOT ALLOWED.", "warning");
                } else {
                    if (getConfigValue("IS_ALLOW_CHANGE_TOPUPNO") == 0) {
                        if (topUpCmd == "1") {
                            showMsgDialog("KEY NOT ALLOWED.", "warning");
                            return;
                        }
                    }
                    //IS_ALLOW_RESHOT_TOPUPNO
                    if (getConfigValue("IS_ALLOW_RESHOT_TOPUPNO") == 0) {
                        if (topUpCmd == "2") {
                            showMsgDialog("KEY NOT ALLOWED.", "warning");
                            return;
                        }
                    }
                    $("#tuCmdDiv").hide();
                    if (topUpCmd != "3") $("#tuTxIdDiv").show();
                    else sendTopUpReq = true;
                }
            }
            /*else if (topUpCmd == "3") {
                sendTopUpReq = true;
            }*/
            // else if (topUpCmd == "1") {
            // 	showMsgDialog("KEY NOT ALLOWED.","warning");
            // }
            else {
                $("#tuMsgSpan").html("Invalid code.");
            }
        } else if ($("#tuTxIdDiv").css("display") == "block") {
            var topUpId = $("#topUpTrIdField").val();
            if (topUpId == "") {
                $("#tuMsgSpan").html("Invalid Topup ID.");
            } else {
                if (topUpCmd == "1") {
                    $("#topUpPNumLbl").html(getConfigValue("TOPUP_NEW_NUM_LBL"));
                    $("#tuTxIdDiv").hide();
                    $("#tuPNumDiv").show();
                } else if (topUpCmd == "4") {
                    $("#returnTUReason-dialog").dialog("open");
                } else {
                    sendTopUpReq = true;
                }
            }
        } else if ($("#tuPNumDiv").css("display") == "block") {
            var newPNum = $("#topUpPNumField").val();
            if (newPNum == "" || !(newPNum.length >= Number(getConfigValue("TOPUP_MIN_PHONE_NUM_CHAR")) &&
                newPNum.length <= Number(getConfigValue("TOPUP_MAX_PHONE_NUM_CHAR")))) {
                $("#tuMsgSpan").html("INVALID ENTRY");
            } else {
                sendTopUpReq = true;
            }
        }

        if (sendTopUpReq) {
            var data = new Object();

            if (topUpCmd == "0") {
                data.cmd = "inquiry";
                data.serverTxId = $("#topUpTrIdField").val();
            } else if (topUpCmd == "1") {
                data.cmd = "change";
                data.serverTxId = $("#topUpTrIdField").val();
                data.newPNum = $("#topUpPNumField").val();
            } else if (topUpCmd == "2") {
                data.cmd = "reshot";
                data.serverTxId = $("#topUpTrIdField").val();
            } else if (topUpCmd == "3") {
                data.cmd = "pingtel";
            } else if (topUpCmd == "4") {
                data.cmd = "refund";
                data.serverTxId = $("#topUpTrIdField").val();
            }

            $("#topUp-dialog").dialog("close");

            var topUpTxItem = {
                transactionId: saleTx.transactionId,
                transactionDate: new Date()
            };

            response = TOPUP.sendTopUpRequest(data);

            if (response) {
                var topUpMsg = "";

                if (response.error) {
                    topUpTxItem.scrMessage = response.error;
                    topUpTxItem.resCode = response.resCode;
                    topUpTxItem.serverTrxId = response.serverTrxId;
                    topUpMsg = response.error;
                    showMsgDialog(topUpMsg, "", function () { return false; });
                    return false;
                } else {
                    var topUpItem = TOPUP.convertTopUpResToObj(response);
                    topUpTxItem.transactionType = data.cmd.toUpperCase();
                    topUpTxItem.resCode = topUpItem.resCode;
                    topUpTxItem.phoneNum = topUpItem.phoneNum;
                    topUpTxItem.oldPhoneNum = topUpItem.oldPhoneNum;
                    topUpTxItem.vType = topUpItem.vType;
                    topUpTxItem.serverTrxId = topUpItem.serverTrxId;
                    topUpTxItem.partnerTrxId = topUpItem.partnerTrxId;
                    topUpTxItem.scrMessage = topUpItem.scrMessage;
                    topUpTxItem.resMessage = topUpItem.resMessage;
                    topUpTxItem.serialNum = topUpItem.serialNum;
                    topUpMsg = topUpItem == null ? "Parse error on topup response." : topUpItem.scrMessage;
                }

                if (topUpCmd == "4")
                    topUpTxItem.refTxItemOrder = scannedItemOrder;

                topUpObj.topUpTxItems.push(topUpTxItem);

                if (topUpCmd == "3") {
                    showMsgDialog(topUpMsg, "", function () {
                        saveOrder('COMPLETED',
                            function (data) {
                                if (data && data.error) {
                                    uilog('DBUG', 'FAIL: ' + JSON.stringify(data.error));
                                } else {
                                    if (topUpObj.topUpTxItems.length != 0)
                                        TOPUP.saveTopUpTransaction(topUpObj.topUpTxItems);

                                    var txMsg = "Click OK to start a new transaction.";

                                    showMsgDialog(txMsg, "info", function () {
                                        clearOrder();
                                        createOrder();
                                    });
                                }
                            },
                            function (error) {
                                uilog('DBUG', 'FAIL: ' + JSON.stringify(error));
                            }
                        );
                    });
                } else if (topUpCmd == "4") {
                    showMsgDialog(topUpMsg, "");
                } else {
                    showMsgDialog(topUpMsg, "", function () {

                        var topUpRes = {
                            topUpItem: cloneObject(topUpObj.topUpTxItems.last)
                        };
                        if (topUpObj.topUpTxItems.length != 0) {
                            saleTx.topUpObj = topUpObj.topUpTxItems;
                            console.log(JSON.stringify(saleTx));
                        }
                        saveOrder('COMPLETED',
                            function (data) {
                                if (data && data.error) {
                                    uilog('DBUG', 'FAIL: ' + JSON.stringify(data.error));
                                } else {
                                    printReceipt({
                                        header: setReceiptHeader(saleTx),
                                        topUpInfo: setReceiptTopUpInfo(topUpRes, false, false, true, true, false),
                                        footerSummary: setReceiptFooterSummary(saleTx),
                                        footer: setReceiptFooter(saleTx),
                                        mktInfo: setReceiptMarketingPromoInfo(saleTx),
                                        freeParking: setReceiptFreeParking(saleTx),
                                        isQueued: true
                                    });
                                    renderTopUpInfo(topUpRes, false, false, true, true, false);
                                    console.log('Line 1531 topUpObj.topUpTxItems');
                                    console.log(topUpObj.topUpTxItems);
                                    // if (topUpObj.topUpTxItems.length != 0){
                                    // saleTx.topUpObj = topUpObj;
                                    // console.log(JSON.stringify(saleTx));
                                    // TOPUP.saveTopUpTransaction(saleTx);
                                    // }
                                    var item = topUpObj.topUpTxItems.last;
                                    var txMsg = "Click OK to start a new transaction.";

                                    if (item.transactionType == "INQUIRY") {
                                        var msg = getConfigValue('RECEIPT_TOPUP_PHONE_NO_LBL') + " <em>" + item.phoneNum + "</em><br />";
                                        msg += getConfigValue('RECEIPT_TOPUP_ID_LBL') + " <em>" + item.serverTrxId + "</em><br />";
                                        msg += getConfigValue('RECEIPT_TOPUP_STATUS_CODE_LBL') + " <em>" + item.resCode + "</em><br />";
                                        msg += getConfigValue('RECEIPT_TOPUP_STATUS_LBL') + " <em>" + item.scrMessage + "</em><br />";
                                        msg += "<br />";
                                        txMsg = msg + txMsg;
                                    }

                                    showMsgDialog(txMsg, "info", function () {
                                        clearOrder();
                                        createOrder();
                                    });
                                }
                            },
                            function (error) {
                                uilog('DBUG', 'FAIL: ' + JSON.stringify(error));
                            }
                        );
                    });
                }
            }
        }
    });

    $("#indosmartEnterBtn").click(function () {
        var response = null;
        var sendIndosmartReq = false;
        var indosmartCmd = null;
        $("#indosmartMsgSpan").empty();

        console.log("enter indosmart");

        if ($("#indosmart-dialog").data("saleType").toUpperCase() == CONSTANTS.TX_TYPES.RETURN.name)
            indosmartCmd = "1";
        else
            indosmartCmd = $("#indosmartCmdField").val();

        console.log(indosmartCmd);
        console.log($("#indosmartCmdDiv").css("display"));
        console.log($("#indosmartTxIdDiv").css("display"));
        console.log($("#indosmartPNumDiv").css("display"));

        if ($("#indosmartCmdDiv").css("display") == "block") {
            if (indosmartCmd == "0") {
                if (saleTx && saleTx.orderItems.length) {
                    showMsgDialog("KEY NOT ALLOWED.", "warning");
                } else {
                    $("#indosmartCmdDiv").hide();
                    if (indosmartCmd != "3") $("#indosmartTxIdDiv").show();
                    else sendIndosmartReq = true;
                }
            } else {
                $("#indosmartMsgSpan").html("Invalid code.");
            }
        } else if ($("#indosmartTxIdDiv").css("display") == "block") {
            var indosmartId = $("#indosmartTrIdField").val();
            if (indosmartId == "") {
                $("#indosmartMsgSpan").html("Invalid Indosmart ID.");
            } else {
                if (indosmartCmd == "1") {
                    $("#returnIndosmartReason-dialog").dialog("open");
                } else {
                    sendIndosmartReq = true;
                }
            }
        } else if ($("#indosmartPNumDiv").css("display") == "block") {
            var newPNum = $("#indosmartPNumField").val();
            if (newPNum == "" || !(newPNum.length >= Number(getConfigValue("INDOSMART_MIN_PHONE_NUM_CHAR")) &&
                newPNum.length <= Number(getConfigValue("INDOSMART_MAX_PHONE_NUM_CHAR")))) {
                $("#indosmartMsgSpan").html("INVALID ENTRY");
            } else {
                sendIndosmartReq = true;
            }
        }

        if (sendIndosmartReq) {
            var data = new Object();
            data.indosmartId = $("#indosmartTrIdField").val();
            data.seqIndosmartNum = data.seqIndosmartNum ? data.seqIndosmartNum + 1 : 0;

            response = INDOSMART.sendInquiryRequest(data);
            console.log("Response");
            console.log(response);

            var output = "";

            if (response) {
                if (response.error) {
                    output += "<br />";
                    output += getConfigValue('RECEIPT_INDOSMART_STATUS_LBL') + " <em>" + response.error + "</em><br />";
                    output += getConfigValue('RECEIPT_INDOSMART_STATUS_GENERAL_LBL') + " <em>" + 'GAGAL' + "</em><br />";
                    output += "<br />";
                } else {
                    var indosmartItem = response.data;
                    var message = "";
                    var messageGeneral = "";

                    if (indosmartItem.Message) {
                        message = indosmartItem.Message;
                    } else {
                        if (indosmartItem.faultString) {
                            message = 'INDOSMART SERVER FAULT';
                        } else {
                            message = INDOSMART.getStatusMessage[indosmartItem.ResponseCode];
                        }
                    }

                    if (indosmartItem.ResponseCode) {
                        if (indosmartItem.ResponseCode == '0' || indosmartItem.ResponseCode == '00' ||
                            indosmartItem.ResponseCode == '61' || indosmartItem.ResponseCode == '62') {
                            messageGeneral = "SUKSES";
                        } else {
                            messageGeneral = "GAGAL";
                        }
                    } else {
                        messageGeneral = "GAGAL";
                    }

                    output += "<br />";
                    output += getConfigValue('RECEIPT_INDOSMART_PHONE_NO_LBL') + " <em>" + indosmartItem.RefDestination + "</em><br />";
                    output += getConfigValue('RECEIPT_INDOSMART_ID_LBL') + " <em>" + indosmartItem.RefReferenceNo + "</em><br />";
                    output += getConfigValue('RECEIPT_INDOSMART_STATUS_CODE_LBL') + " <em>" + indosmartItem.ResponseCode + "</em><br />";
                    output += getConfigValue('RECEIPT_INDOSMART_STATUS_LBL') + " <em>" + message + "</em><br />";
                    output += getConfigValue('RECEIPT_INDOSMART_STATUS_GENERAL_LBL') + " <em>" + messageGeneral + "</em><br />";
                    output += "<br />";
                }
                showMsgDialog(output, "");
            } else {
                showMsgDialog('SERVER ERROR.', "error");
            }

            $("#indosmart-dialog").dialog("close");
        }
    });

    $("#mCashEnterBtn").click(function () {
        var response = null;
        var sendMCashReq = false;
        var mCashCmd = null;
        var sku = null;
        $("#mCashMsgSpan").empty();

        console.log("enter mCash");

        if ($("#mCash-dialog").data("saleType").toUpperCase() == CONSTANTS.TX_TYPES.RETURN.name)
            mCashCmd = "2";
        else
            mCashCmd = $("#mCashCmdField").val();

        console.log(mCashCmd);
        console.log($("#mCashCmdDiv").css("display"));
        console.log($("#mCashBarcodeDiv").css("display"));
        console.log($("#mCashTxIdDiv").css("display"));
        console.log($("#mCashPNumDiv").css("display"));

        if ($("#mCashCmdDiv").css("display") == "block") {
            if (mCashCmd == "0" || mCashCmd == "1") {
                if (saleTx && saleTx.orderItems.length) {
                    showMsgDialog("KEY NOT ALLOWED.", "warning");
                } else {
                    $("#mCashCmdDiv").hide();
                    if (mCashCmd != "1") $("#mCashTxIdDiv").show();
                    else if (mCashCmd == "1") $("#mCashBarcodeDiv").show();
                    else sendMCashReq = true;
                }
            } else {
                $("#mCashMsgSpan").html("Invalid code.");
            }
        } else if ($("#mCashTxIdDiv").css("display") == "block") {
            var mCashId = $("#mCashTrIdField").val();
            if (mCashId == "") {
                $("#mCashMsgSpan").html("Invalid MCash ID.");
            } else {
                if (mCashCmd == "2") {
                    $("#returnMCashReason-dialog").dialog("open");
                } else {
                    sendMCashReq = true;
                }
            }
        } else if ($("#mCashPNumDiv").css("display") == "block") {
            var newPNum = $("#mCashPNumField").val();
            if (newPNum == "" || !(newPNum.length >= Number(getConfigValue("MCASH_MIN_PHONE_NUM_CHAR")) &&
                newPNum.length <= Number(getConfigValue("MCASH_MAX_PHONE_NUM_CHAR")))) {
                $("#mCashMsgSpan").html("INVALID ENTRY");
            } else {
                sendMCashReq = true;
            }
        } else if ($("#mCashBarcodeDiv").css("display") == "block") {
            var mCashBarcode = $("#mCashBarcodeField").val();
            if (mCashBarcode == "") {
                $("#mCashMsgSpan").html("Invalid Barcode.");
            } else {
                var item = findItem(mCashBarcode);
                console.log(item);

                if (item) {
                    if (MCASH.isMCashItem(item)) {
                        var sku = item.sku;
                        sendMCashReq = true;
                    } else {
                        showMsgDialog("Invalid MCASH Item.", "error");
                    }
                } else {

                }
            }
        }

        if (sendMCashReq) {
            var data = new Object();

            if (mCashCmd == "0") {
                data.cmd = "inquiry";
                data.serverTxId = $("#mCashTrIdField").val();
                data.seqMCashNum = mCashInquiryCounter++;
            } else if (mCashCmd == "1") {
                data.cmd = "check_product";
                data.vType = sku;
            } else if (mCashCmd == "2") {
                data.cmd = "retur";
                data.serverTxId = $("#mCashTrIdField").val();
            }

            if (mCashCmd == '0') {
                response = MCASH.getMCashData(data.serverTxId);
                console.log(response);
                if (response) {
                    // data.serverTxId = response.store_id + response.pos_id + response.partner_trx_id;
                    data.serverTxId = response.partner_trx_id;
                    data.storeId = response.store_id;
                    data.posId = response.pos_id;
                }
            }

            console.log(data);
            $("#mCash-dialog").dialog("close");

            response = MCASH.sendMCashRequest(data);

            if (mCashCmd != '2') {
                if (response.errmsg) {
                    console.log("err");
                    showMsgDialog(response.errmsg, "");
                } else if (response.result) {
                    console.log("result");
                    if (response.result.resmessage || response.result.scrmessage) {
                        showMsgDialog(response.result.resmessage || response.result.scrmessage, "");
                    } else {
                        showMsgDialog(MCASH.getStatusMessage[response.result.rescode], "");
                    }
                } else {
                    console.log("no result");
                    showMsgDialog(response, "");
                }
            } else {
                console.log("return");
            }

        }
    });

    $("#grabEnterBtn").click(function () {
        var grabTrIdField = $("#grabTrIdField").val();
        var grabTypeDropdown = $("#grabTypeDropdown").val();
        $.ajax({
            type: 'GET',
            url: posWebContextPath + '/cashier/grab/getOrderGrab?orderId=' + grabTrIdField + '&grabType=' + grabTypeDropdown,
            dataType: 'json',
            async: false,
            contentType: "application/json",
            timeout: 30000,
            success: function (response) {
                if (response.status == 'success' && response.data.pos_terminal_status == 'submit') {
                    grabDetailOrder = response.data;
                    grabDetailOrder.detail.items = response.data.detail.items.filter(el => el.quantity > 0);
                    var scanItems = [];
                    var scanLen = saleTx.orderItems.length;
                    for (var i = 0; i < scanLen; i++) {
                        scanItems.push({
                            sku: saleTx.orderItems[i].sku,
                            quantity: saleTx.orderItems[i].quantity,
                            ean13Code: saleTx.orderItems[i].ean13Code,
                            name: saleTx.orderItems[i].name,
                            isFresh: isFreshGoods(saleTx.orderItems[i])
                        });
                    }
                    var gtabItems = [];
                    var grabLen = response.data.detail.items.length;
                    for (var i = 0; i < grabLen; i++) {
                        gtabItems.push({
                            sku: response.data.detail.items[i].id,
                            quantity: response.data.detail.items[i].quantity
                        });
                    }
                    var mrg = mergeItemScanned2(scanItems);
                    // console.log("====mergeItemScanned2");
                    // console.log(mrg);
                    // console.log("====gtabItems");
                    // console.log(gtabItems);
                    var validateOrderGrab = checkValidationGrabOrderSku(mrg, gtabItems);
                    console.log("====validateOrderGrab");
                    console.log(validateOrderGrab);

                    if (validateOrderGrab.length >= 1) {
                        $('#grabCheckoutStatus').text("ITEM ORDER TIDAK VALID");
                        grabItemsOrderIsValid = false;
                        var itemsNotVlid = [];
                        for (var index = 0; index < validateOrderGrab.length; index++) {
                            var objScanItem = findScanItemName(validateOrderGrab[index].sku, scanItems);
                            itemsNotVlid.push(objScanItem.name);
                        }
                        $('#grabLblItemNotVlid').text('Item Not Valid : ' + itemsNotVlid.join(', '));
                        console.log(itemsNotVlid.join(', '));
                    } else {
                        $('#grabCheckoutStatus').text("ITEM VALID");
                        $('#grabLblItemNotVlid').text('');
                        grabItemsOrderIsValid = true;
                    }
                    var grabSubtotal = numberWithCommas(response.data.detail.price.subtotal.toString().replace(/\d{2}$/, '.00'));
                    var grabTax = numberWithCommas(response.data.detail.price.tax.toString().replace(/\d{2}$/, '.00'));
                    var grabDeliveryFee = numberWithCommas(response.data.detail.price.deliveryFee.toString().replace(/\d{2}$/, '.00'));
                    $('#grabLblOrderId').text(response.data.detail.shortOrderNumber);
                    $('#grabLblPayType').text(response.data.detail.paymentType);
                    $('#grabLblSubtotal').text(grabSubtotal);
                    $('#grabLblTax').text(grabTax);
                    $('#grabLblDelFee').text(grabDeliveryFee);

                    var itemsGrab = response.data.detail.items;
                    for (var idxGrab = 0; idxGrab < itemsGrab.length; idxGrab++) {
                        var grabPrice = numberWithCommas(itemsGrab[idxGrab].price.toString().replace(/\d{2}$/, '.00'));
                        $("#grabItemTBody").append("<tr><td>" + itemsGrab[idxGrab].id + "</td><td>" + itemsGrab[idxGrab].name + "</td><td>" + itemsGrab[idxGrab].quantity + "</td><td>" + grabPrice + "</td></tr>")
                    }

                    $("#grab-dialog").dialog("close");
                    $("#grabDetail-dialog").dialog("open");
                    // $('#grabDetail-dialog').dialog("option",{buttons:{}});
                    // var saveDialog = $('#grabDetail-dialog');
                    // saveDialog.dialog("option", "buttons", {});
                } else {
                    showMsgDialog('Order ID Tidak di temukan:', "error");
                }
            },
            error: function () {
                showMsgDialog("Error Order Grab transaction", "warning");
            }
        });

    });

    // ASURANSI
    $("#asuransiEnterBtn").click(function() {
        var response = null;
        var sendMCashReq = false;
        var asuransiCmd = null;
        var sku = null;
        $("#asuransiMsgSpan").empty();

        console.log("enter asuransi");

        if ($("#asuransi-dialog").data("saleType").toUpperCase() == CONSTANTS.TX_TYPES.RETURN.name)
            asuransiCmd = "2";
        else
            asuransiCmd = $("#asuransiCmdField").val();

        console.log(asuransiCmd);
        console.log($("#asuransiCmd").css("display"));
        console.log($("#asuransiBarcode").css("display"));
        console.log($("#asuransiTxId").css("display"));
        console.log($("#asuransiPNum").css("display"));

    });

    $("#alterraEnterBtn").click(function () {
        var response = null;
        var sendAlterraReq = false;
        var alterraCmd = null;
        var sku = null;
        $("#alterraMsgSpan").empty();

        console.log("enter alterra");

        if ($("#alterra-dialog").data("saleType").toUpperCase() == CONSTANTS.TX_TYPES.RETURN.name)
            alterraCmd = "2";
        else
            alterraCmd = $("#alterraCmdField").val();

        if ($("#alterraCmdDiv").css("display") == "block") {
            if (alterraCmd == "0" || alterraCmd == "1") {
                if (saleTx && saleTx.orderItems.length) {
                    showMsgDialog("KEY NOT ALLOWED.", "warning");
                } else {
                    $("#alterraCmdDiv").hide();
                    if (alterraCmd != "1") $("#alterraTxIdDiv").show();
                    else sendAlterraReq = true;
                }
            } else {
                $("#alterraMsgSpan").html("Invalid code.");
            }
        } else if ($("#alterraTxIdDiv").css("display") == "block") {
            var alterraId = $("#alterraTrIdField").val();
            console.log(alterraId);
            if (alterraId == "") {
                $("#alterraMsgSpan").html("Invalid Alterra ID.");
            } else {
                console.log(alterraCmd);
                console.log(alterraCmd == "2");
                if (alterraCmd == "2") {
                    $("#returnAlterraReason-dialog").dialog("open");
                } else {
                    sendAlterraReq = true;
                }
            }
        } else if ($("#alterraPNumDiv").css("display") == "block") {
            var newPNum = $("#alterraPNumField").val();
            if (newPNum == "" || !(newPNum.length >= Number(getConfigValue("ALTERRA_MIN_PHONE_NUM_CHAR")) &&
                newPNum.length <= Number(getConfigValue("ALTERRA_MAX_PHONE_NUM_CHAR")))) {
                $("#alterraMsgSpan").html("INVALID ENTRY");
            } else {
                sendAlterraReq = true;
            }
        }

        if (sendAlterraReq) {
            var data = new Object();

            if (alterraCmd == "0") {
                data.cmd = "inquiry";
                data.transactionId = $("#alterraTrIdField").val();
                data.seqAlterraNum = alterraInquiryCounter++;
            } else if (alterraCmd == "1") {
                data.cmd = "check_deposit";
                data.seqAlterraNum = alterraInquiryCounter++;
            } else if (alterraCmd == "2") {
                data.cmd = "return";
                data.transactionId = $("#alterraTrIdField").val();
            }

            console.log(data);
            $("#alterra-dialog").dialog("close");

            response = ALTERRA.sendAlterraRequest(data);

            if (alterraCmd != '2') {
                if (response.errmsg || response.error) {
                    console.log("err");
                    showMsgDialog(response.errmsg || response.error, "");
                } else if (response.result) {
                    console.log("result");
                    showMsgDialog(response.result.resmessage || response.result.scrmessage, "");
                } else {
                    console.log("no result");
                    showMsgDialog(response, "");
                }
            } else {
                console.log("return");
            }

        }
    });
    
    //LOYALTY PROGRAM
    $("#loyProgEnterBtn").click(function () {
        var loyProgCmd = null;
        $("#crmMsgSpan").empty();
        loyProgCmd = $("#loyaltyProgField").val();

        if ($("#loyaltyProgDiv").css("display") == "block") {
            if (loyProgCmd == "0") {
                var type = "get_event";
                var storeCode = configuration.storeCode;
                getEventServices(type, storeCode);
                $("#crm-dialog").dialog("close");
            } else if (loyProgCmd == "1") {
                $("#inquiryLoyaltyProg-dialog").dialog("open");
                $("#crm-dialog").dialog("close");
            } else if (loyProgCmd == "2") {
                loyEarnPointsSelected = true;
                disableClrFn = false;

                $("#loyaltyProg-dialog").dialog("close");
                $("#loyProgTxIdDiv label").text('ENTER MOBILE NO:');

                console.log("Masuk ke earn Point");

                if (loyEarnPointsSelected == true) {
                    promptSysMsg(getMsgValue('pos_label_input_member_contact'), getMsgValue('pos_label_employee_loyalty_card'));
                } else {
                    promptSysMsg();
                }
            } else if (loyProgCmd == "3") {
                $("#redeemLoyaltyProg-dialog").dialog("open");
                $("#crm-dialog").dialog("close");
            } else if (loyProgCmd == "4") {
                $("#unpointLoyaltyProg-dialog").dialog("open");
                $("#crm-dialog").dialog("close");
            } else if (loyProgCmd == "5") {
                loyVIPThemeParkSelected = true;
                disableClrFn = false;

                $("#loyaltyProg-dialog").dialog("close");
                $("#loyProgTxIdDiv label").text('SCAN VIP TICKET QR CODE:');

                if (loyVIPThemeParkSelected == true) {
                    promptSysMsg(getMsgValue('pos_label_scan_vip_themepark'), getMsgValue('pos_label_vip_themepark'));
                } else {
                    promptSysMsg();
                }
            }
        }

    });

    //SIMPATINDO 
    $("#simpatindoEnterBtn").click(function () {
        $("#simpatindoMsgSpan").empty();
        var simpatindoCmd = $("#simpatindoCmdField").val();
        var valid = true;

        if (simpatindoCmd == '0') {
            $("#simpatindoInquiry-dialog").dialog("open");
        } else if (simpatindoCmd == '1') {
            if (!cashierRole.isCustomerServiceCashier) {
                $("#simpatindoBarcode-dialog").dialog("open");
            } else {
                showKeyNotAllowedMsg();
            }
        } else if (simpatindoCmd == '2') {
            $("#simpatindoTelcoPing-dialog").dialog("open");
        } else {
            $("#simpatindoMsgSpan").html("Invalid Command.");
        }

        if (valid) {
            $("#simpatindo-dialog").dialog("close");
        }
    });

    $("#crmEnterBtn").click(function () {
        var crmCmd = null;
        $("#crmMsgSpan").empty();
        crmCmd = $("#crmCmdField").val();

        if ($("#crmCmdDiv").css("display") == "block") {
            if (crmCmd == "0") {
                crmBalInquirySelected = true;
                if (customerIdForReward) {
                    showConfirmDialog(getMsgValue('pos_warning_change_member_id')
                        .format(customerIdForReward), "warning",
                        function () {
                            showMemberInputOptionDialog();
                            customerIdForReward = null;
                            $("#crmCmdDiv").hide();
                            $("#crmTxIdDiv").show();
                        },
                        function () {
                            var crmResponse = isCustomerValidForReward(customerIdForReward, saleTx);
                            if (crmResponse.status == "ACTIVE") {
                                showPointsInformation(crmResponse, customerIdForReward);
                            } else if (crmResponse.status == "INACTIVE") {
                                showMsgDialog(getMsgValue('pos_label_member_id_is_inactive'), "warning");
                            }
                            //						checkIfMembershipHasExpired(crmResponse, customerIdForReward);
                        });
                } else {
                    showMemberInputOptionDialog();
                    $("#crmCmdDiv").hide();
                    $("#crmTxIdDiv").show();
                }
                isMemberContactSelected = false;
            } else if (crmCmd == "1") {
                crmBalInquirySelected = false
                crmEarnPointsSelected = true;
                toggleEmpCard = true;
                disableClrFn = false;
                crmEnableEmpIdScan = true;

                if (customerIdForReward) {
                    showConfirmDialog(getMsgValue('pos_warning_change_member_id')
                        .format(customerIdForReward), "warning",
                        function () {
                            customerIdForReward = null;
                            $("#crm-dialog").dialog("close");
                            promptSysMsg(getMsgValue('pos_label_input_member_id'), getMsgValue('pos_label_employee_loyalty_card'));
                            showMemberInputOptionDialog();
                        },
                        function () {
                            var crmResponse = isCustomerValidForReward(customerIdForReward, saleTx);
                            checkIfMembershipHasExpired(crmResponse, customerIdForReward);
                            $("#crm-dialog").dialog("close");
                            promptSysMsg(getMsgValue('pos_label_member_id_is_active'), getMsgValue('pos_label_reward_points'));
                            clearInputDisplay();
                            toggleEmpCard = false;
                            availEmpLoyaltyPoints = true;
                            saleTx.customerId = customerIdForReward;
                        });
                } else {
                    showMemberInputOptionDialog();
                    $("#crm-dialog").dialog("close");
                    promptSysMsg(getMsgValue('pos_label_input_member_id'), getMsgValue('pos_label_employee_loyalty_card'));
                }
                isMemberContactSelected = false;
            } else if (crmCmd == "2") {
                crmBalInquirySelected = false
                crmEnableEmpIdScan = true;
                isRenewMembershipSelected = true;
                toggleEmpCard = true;
                disableClrFn = false;

                if (customerIdForReward) {
                    showConfirmDialog(getMsgValue('pos_warning_change_member_id')
                        .format(customerIdForReward), "warning",
                        function () {
                            showMemberInputOptionDialog();
                            customerIdForReward = null;
                            $("#crmCmdDiv").hide();
                            //						$("#crmTxIdDiv").show()
                            $("#crm-dialog").dialog("close");
                            promptSysMsg(getMsgValue('pos_label_input_member_id'), getMsgValue('pos_label_employee_loyalty_card'));

                        },
                        function () {
                            var crmResponse = isCustomerValidForReward(customerIdForReward, saleTx);
                            checkIfMembershipHasExpired(crmResponse, customerIdForReward);
                            $("#crmTxIdDiv").hide();
                            $("#crmCmdDiv").hide();
                            $("#crm-dialog").dialog("close");
                        });
                } else {
                    $("#crm-dialog").dialog("close");
                    showMemberInputOptionDialog();
                    promptSysMsg(getMsgValue('pos_label_input_member_id'), getMsgValue('pos_label_employee_loyalty_card'));
                }
                isMemberContactSelected = false;
            } else {
                $("#crmMsgSpan").html(getMsgValue('pos_label_invalid_code'));
            }
        } else if ($("#crmTxIdDiv").css("display") == "block") {
            var crmID = $("#crmTrIdField").val();
            crmMemberId = $("#crmTrIdField").val();
            if (crmID == "") {
                if (isMemberContactSelected == true) {
                    $("#crmMsgSpan").html(getMsgValue('pos_label_invalid_mobile_no'));
                } else {
                    $("#crmMsgSpan").html(getMsgValue('pos_label_invalid_id'));
                }
            } else {
                var crmResponse = isCustomerValidForReward(crmID, saleTx);
                if (crmResponse.type == 'ERROR') {
                    //$("#crmMsgSpan").html(getMsgValue('pos_label_invalid_id'));
                    //					showMsgDialog(crmResponse.message, "warning");

                    if (crmResponse.messageCode == 'MSGC001' &&
                        isMemberContactSelected == true) {
                        showMsgDialog(getMsgValue('pos_label_no_mobile_no_found') + ' ' + crmID, "warning");
                    } else {
                        showMsgDialog(crmResponse.message, "warning");
                    }
                } else {
                    if (crmBalInquirySelected == true) {
                        if (crmResponse.status == "ACTIVE") {
                            showPointsInformation(crmResponse, crmID);
                        } else if (crmResponse.status == "INACTIVE") {
                            showMsgDialog(getMsgValue('pos_label_member_id_is_inactive'), "warning");
                        }

                        //						crmBalInquirySelected = false;
                    } else {
                        customerIdForReward = crmResponse.accountNumber;
                    }

                    if (isRenewMembershipSelected != true && !crmBalInquirySelected) {
                        if (crmResponse.status == "ACTIVE") {
                            showPointsInformation(crmResponse, crmID);
                        } else if (crmResponse.status == "INACTIVE") {
                            showMsgDialog(getMsgValue('pos_label_member_id_is_inactive'), "warning");
                        }
                    } else if (!crmBalInquirySelected) {
                        checkIfMembershipHasExpired(crmResponse, crmID);
                    }

                }
            }
        }

    });

    //	$("#crmMemberMobileNoBtn").click(function() {
    //		$("#crmEnterMobileNo-dialog").dialog("open");
    //		CustomerPopupScreen.cus_crmEnterMobileNo();
    //	});

    $("#functionResultOKBtn").click(function () {
        clearShortcutFuncDialog();
        $("#functionResultDiv").hide();
        $("#functionSearchDiv").show();
    });

    $("#functionSearchEnterBtn").click(function () {
        var cmdNum = $("#functionNumField").val();

        if (cmdNum)
            executeShortcutFunction(cmdNum);
        else
            $("#functionSearchMsg").html("Invalid Function Number.");
    });

});

function appendPromoInfoDialog(eventRewardsObj, eventEligibleAmount, eventRewardsNo) {
    $('#eventInfo-dialog-content').append($('<div>').addClass('modalMessage').css('text-align', 'center').append($('<span>').css({ 'font-size': '20px', 'color': 'rgb(0,90,171)' }).html(eventRewardsObj.promoHeader)));

    var promoLines = eventRewardsObj.promoLines;
    for (var l in promoLines) {
        var lines = promoLines[l];
        lines = lines.replace(/\{totalAmount\}/g, numberWithCommas(eventEligibleAmount));
        lines = lines.replace(/\{rewardNo\}/g, eventRewardsNo);
        lines = lines.replace(/\{startDate\}/g, $.datepicker.formatDate('dd/mm/yy', new Date(eventRewardsObj.startDate)));
        lines = lines.replace(/\{endDate\}/g, $.datepicker.formatDate('dd/mm/yy', new Date(eventRewardsObj.endDate)));
        $('#eventInfo-dialog-content').append($('<div>').addClass('modalMessage').css('text-align', 'center').append($('<span>').html(lines)));
    }

    $('#eventInfo-dialog-content').append($('<br>'));
}

$("#order-message").on("dialogclose", function (event, ui) {
    if (saleTx.type != CONSTANTS.TX_TYPES.SALE.name || saleTx.status != CONSTANTS.STATUS.COMPLETED) {
        clearOrder();
        createOrder();
        return false;
    }

    $('#eventInfo-dialog-content').html('');
    // INHOUSE VOUCHER 2017-04-13
    if (typeof saleTx.stampCoupon != 'undefined') {
        //		console.log("Event Reward Undefined");
        //		saleTx.stampCoupon[0] = null;
        //		saleTx.stampCoupon[0].eventRewardNo = 0;

        if (saleTx.type == 'SALE' && saleTx.status == 'COMPLETED' &&
            (saleTx.stampCoupon[0] != null && saleTx.stampCoupon[0].eventRewardNo > 0 ||
                saleTx.luckyCustomer && saleTx.luckyCustomer.luckyEventRewardNo > 0 ||
                saleTx.marketingVoucher && saleTx.marketingVoucher.marketingVoucherRewardNo > 0)) {
            $('#eventInfo-dialog-content').html('');
            for (var a = 0; a <= saleTx.stampCoupon.length - 1; a++) {
                if (saleTx.stampCoupon[a] &&
                    typeof saleTx.stampCoupon[a].eventRewardsObj != 'undefined' &&
                    saleTx.stampCoupon[a].eventRewardNo > 0
                ) {
                    appendPromoInfoDialog(saleTx.stampCoupon[a].eventRewardsObj,
                        saleTx.stampCoupon[a].eventTotalAmount,
                        saleTx.stampCoupon[a].eventRewardNo);
                }
            }

            if (saleTx.luckyCustomer &&
                typeof saleTx.luckyCustomer.luckyEventRewardsObj != 'undefined' &&
                saleTx.luckyCustomer.luckyEventRewardNo > 0
            ) {
                appendPromoInfoDialog(saleTx.luckyCustomer.luckyEventRewardsObj,
                    saleTx.luckyCustomer.luckyEventRewardsObj.eventTotalAmount,
                    saleTx.luckyCustomer.luckyEventRewardNo);
            }

            if (saleTx.marketingVoucher &&
                typeof saleTx.marketingVoucher.marketingVoucherObj != 'undefined' &&
                saleTx.marketingVoucher.marketingVoucherRewardNo > 0
            ) {
                appendPromoInfoDialog(saleTx.marketingVoucher.marketingVoucherObj,
                    saleTx.marketingVoucher.marketingVoucherObj.marketingVoucherEligibleAmount,
                    saleTx.marketingVoucher.marketingVoucherRewardNo);
            }

            CustomerPopupScreen.cus_showEventInfo($('#eventInfo-dialog-content').html());
            $('#eventInfo-dialog').dialog('open');
        } else {
            $("#customer-data").dialog("open");
        }
    } else {
        uilog('DBUG', 'saleTx.stampCoupon undefined');
    }
    // INHOUSE VOUCHER 2017-04-13

    clearOrder();
    createOrder();

    $("#trxidTR").hide();
    $("#trxdisplayID").html("");  
});

$("#order-message").on("dialogopen", function (event, ui) {
    var adjustDialogHeight = saleTx.type == CONSTANTS.TX_TYPES.SALE.name &&
        topUpObj &&
        topUpObj.topUpTxItems &&
        topUpObj.topUpTxItems.length;

    if (adjustDialogHeight) {
        $("#order-message").dialog({ height: 350 });
    } else {
        $("#order-message").dialog({ height: 300 });
    }

    setTimeout(function () { $('#order-message').dialog('close'); }, 10000);
});

$("#eventInfo-dialog").on("dialogclose", function (event, ui) {
    CustomerPopupScreen.cus_closeEventInfo();
    $('#customer-data').dialog('open');
});

$("#customer-data").on("dialogclose", function (event, ui) {
    uilog('DBUG', 'Show customer feedback');
    //clearOrder();
    //createOrder();

    renderCustomerFeedbackDialog();
});

$("#customer-data").on("dialogopen", function (event, ui) {
    $('#custName').val('').html('');
    $('#custPhone').val('').html('');
    $("#customer-data").dialog({ width: 400 });
});

/**
 * Dialog to display order summary when transaction is finished.
 */
$("#order-message").dialog({
    modal: true,
    autoOpen: false,
    resizable: false,
    closeOnEscape: false,
    open: function () {
        var isTransactionCancelled = (saleTx.status == CONSTANTS.STATUS.CANCELLED);
        if (!isTransactionCancelled &&
            saleTx.type == CONSTANTS.TX_TYPES.SALE.name) {
            displayOrderMessageChanges(false);
        } else if (saleTx.type == CONSTANTS.TX_TYPES.RETURN.name ||
            saleTx.type == CONSTANTS.TX_TYPES.REFUND.name ||
            saleTx.type == CONSTANTS.TX_TYPES.PICKUP.name ||
            isTransactionCancelled) {
            uilog("DBUG", "-----OPENED order-message");
            //uncomment if these transaction types will have a customer feedback
            //displayOrderMessageChanges(true);
        }
        //show order message
        displayOrderSummary();
        if (saleTx.isVIPThemePark === true) {
            sendVIPRedeemTicket();
        }
    }
});

$("#customer-data").dialog({
    modal: true,
    autoOpen: false,
    resizable: false,
    closeOnEscape: false,
    open: function () {
        uilog('DBUG', 'Customer Data Opened');
        isEnabledAgainEmotor = true;
    }
});

$("#closeCustomerBtn").click(function () {
    $("#customer-data").dialog("close");
    $("#trxidTR").hide();
});

$("#enterCustomerBtn").click(function () {
    customerFeedback.customerName = $('#custName').val();
    customerFeedback.customerPhone = $('#custPhone').val();
    //saveCustomerFeedback();
    $("#customer-data").dialog("close");
});

$("#enterPin-message").on("dialogopen", function (event, ui) {
    $("#enterPin-message").dialog({ height: "auto" });
});

$("#enterPin-message").dialog({
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function () {

    },
    close: function () {
        currentPaymentMediaType = null;
        if (!crmBalInquirySelected) {
            $("div#numPad div#keyTotal").click();
        }
        promptSysMsg();

        if (saleTx.totalChange < 0) {
            PAYMENT_MEDIA.displayPaymentViewAsSystemMessage(saleTx);
        }
    }
});

$("#authentication-form").on("dialogclose", function (event, ui) {
    if (isPreAuthenticated) {
        if (isUserBarcodeRequired) {
            $("#barcodeAuthentication-form").data('roles', ['ROLE_SUPERVISOR'])
                .dialog("open");
        } else {
            triggerPostAuthFunctions($(this));
        }
    } else {
        // set to default value
        disableClrFn = false;
        isPreAuthenticated = false;
        // CR RETURN
        isAuthFormBtnClicked = false;
        // CR RETURN
        var isVoid = toggleVoid;
        if (toggleVoid) {
            toggleFNButton("fnVoid", false);
        } else if (togglePostVoid) {
            togglePostVoid = false;
        } else if (toggleRecallSale) {
            toggleRecallSale = false;
        } else if (forceSignOffFlag) {
            forceSignOffFlag = false;
        } else if (toggleLogout) {
            toggleLogout = false;
        } else if (toggleTempOff) {
            toggleTempOff = false;
        } else if (isTrainingModeOn) {
            isTrainingModeOn = false;
        } else if (toggleTVS) {
            clearTVS();
        } else if (CRMAccountModule.Hypercash.toggleCrmOfflineMode) {
            CRMAccountModule.Hypercash.toggleCrmOfflineMode = false;
        } else if (toggleBankMega) {
            toggleBankMega = false;
        } else if (fn103) {
            fn103 = false;
        }

        // check if the auth form was closed using the x button and not the enter button
        if (!isAuthFormBtnClicked) {
            if (!isVoid) {
                $("div#numPad div#keyClr").triggerHandler('click');
            }
            clearAuthenticationForm();
            toggleReprintReceipt = false;
        }
    }
});

$("#authentication-form").dialog({
    width: 680,
    height: 460,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    open: function (event, ui) {
        clearAuthenticationForm();
        if (toggleLogout || toggleTempOff) {
            isUserBarcodeRequired = false;
            $("#authFormUsername").val(loggedInUsername);
            $("#authFormUsername").attr('disabled', 'disabled');
        }

        if (toggleTempOff) {
            $("#authentication-form").dialog("widget").find(".ui-dialog-titlebar-close").hide();
        } else {
            $("#authentication-form").dialog("widget").find(".ui-dialog-titlebar-close").show();
        }
    }
});

$("#barcodeAuthentication-form").on("dialogclose", function (event, ui) {

    if (isAuthenticated) {
        triggerPostAuthFunctions($("#authentication-form"));
    } else {
        // set to default value
        disableClrFn = false;
        isPreAuthenticated = false;

        if (toggleVoid) {
            toggleFNButton("fnVoid", false);
        } else if (togglePostVoid) {
            togglePostVoid = false;
        } else if (toggleStoreSale) {
            toggleStoreSale = false;
        } else if (toggleRecallSale) {
            toggleRecallSale = false;
        } else if (forceSignOffFlag) {
            forceSignOffFlag = false;
        } else if (trainingMode) {
            isTrainingModeOn = false;
        } else if (toggleTVS) {
            clearTVS();
        }

        // check if the auth form was closed using the x button and not the enter button
        if (!isAuthFormBtnClicked) {
            toggleReprintReceipt = false;
            $("div#numPad div#keyClr").triggerHandler('click');
        }
    }
});

$("#barcodeAuthentication-form").dialog({
    width: 680,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    open: function (event, ui) {
        $("#barcodeAuthFormUsername").val($("#authFormUsername").val());
        if (!isKeyInAvail) {
            $("#barcodeAuthFormEmpCode").attr('disabled', 'disabled');
        }
    }
});

$("#firstLogon-dialog").dialog({
    width: 400,
    height: 250,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        clearPin();
        $("#firstPinDiv").show();
        $("#secondPinDiv").hide();
    }
});

$("#cash-drawer-dialog").on("dialogclose", function (event, ui) {
    clearOrder();
    createOrder();
});
$("#cash-drawer-dialog").dialog({
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close"
});

$("#loading-dialog").dialog({
    hide: "highlight",
    show: "highlight",
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close"
});

// $("#bpLoading-dialog").on("dialogclose", function(event, ui) {
//     $("#bpLoadingDialogMessage").html("");
// });

$("#bpLoading-dialog").dialog({
    hide: "highlight",
    show: "highlight",
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close"
});

$("#eleboxTimeout-dialog").dialog({
    hide: "highlight",
    show: "highlight",
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function () {
        $("#priceConfirmationMsg").empty();
    },
    buttons: {
        OK: function () {
            $("#eleboxTimeout-dialog").dialog("close");
        }
    }
});
$("#emptyInputBpjs-dialog").dialog({
    width: 400,
    height: 200,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function () {
        //
    },
    buttons: {
        OK: function () {
            $("#emptyInputBpjs-dialog").dialog("close");
        }
    }
});

$("#eleboxAcknow-dialog").dialog({
    hide: "highlight",
    show: "highlight",
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function () {
        var elebox = $("#eleboxAcknow-dialog").data("eleboxInfo");
        var orderId = elebox.order.order_id;

        $("#eleboxAcknowId").html(orderId);
    },
    buttons: {
        OK: function () {
            $("#eleboxAcknow-dialog").dialog("close");
            if (saleTx.returnTrx) {
                var status = 'RETURN';
                saleTx.customerInfo = 'RETURN Sukses';
                saleTx.totalAmount = saleTx.totalAmount * -1;
                saleTx.totalAmountPaid = saleTx.totalAmountPaid * -1;
                saleTx.priceUnit = saleTx.priceUnit * -1;
                saleTx.priceSubtotal = saleTx.priceSubtotal * -1;
                saleTx.unitFee = saleTx.unitFee * -1;
            } else {
                var status = 'SUCCESS';
                saleTx.customerInfo = 'Transaksi Sukses';
            }
            saleTx.status = 'SUCCESS';
            saleTx.type = CONSTANTS.TX_TYPES.BILL_PAYMENT.name;
            saleTx.billPaymentItem = {
                transactionDate: saleTx.transactionDate,
                type: saleTx.shortDesc,
                transactionAgentId: ELEBOX.sessionId,
                customerId: saleTx.id,
                paymentPeriod: 0,
                netAmount: parseInt(saleTx.totalAmount) - parseInt(saleTx.unitFee),
                penaltyFee: 0,
                totalAmount: saleTx.totalAmount,
                adminFee: saleTx.unitFee,
                responseCode: "00",
                responseDescription: status,
                referenceCode: saleTx.orderId,
                additionalInfo: "",
                customerName: "",
                customerInfo: saleTx.customerInfo,
                deadlineTime: "",
                itemType: "",
                policyNumber: "",
                status: "SUCCESS",

            }
            saveOrder(CONSTANTS.STATUS.COMPLETED, function (data) {
                if (saleTx.returnTrx) {
                    saleTx.type = CONSTANTS.TX_TYPES.RETURN.name;
                } else {
                    saleTx.type = CONSTANTS.TX_TYPES.ELEBOX.name;
                }
                renderScreenReceiptSummary();
                renderCustomerFeedbackDialog();
                DrawerModule.validateTxnToOpenDrawer();
                renderOrderSummaryDialog();
                saleTx.acknow = "Transaksi sukses";
                saleTx.status = "Acknowledge";
                if (saleTx.type == CONSTANTS.TX_TYPES.ELEBOX.name) {
                    var detailsToPrint = {
                        summary: setReceiptSummary(saleTx),
                        footerSummary: setReceiptFooterSummary(saleTx),
                        footer: setReceiptFooter(saleTx),
                        mktInfo: setReceiptMarketingPromoInfo(saleTx),
                        balloonGame: setReceiptBalloonGame(saleTx),
                        freeParking: setReceiptFreeParking(saleTx),
                        isInstallmentTransaction: isInstallmentTransaction
                    };
                } else {
                    var detailsToPrint = {
                        summary: setReceiptSummary(saleTx),
                        footerSummary: setReceiptFooterSummary(saleTx),
                        footer: setReceiptFooter(saleTx),
                        mktInfo: setReceiptMarketingPromoInfo(saleTx),
                        balloonGame: setReceiptBalloonGame(saleTx),
                        freeParking: setReceiptFreeParking(saleTx),
                        isInstallmentTransaction: isInstallmentTransaction
                    };
                }

                if (!isHcEnabled) {
                    printReceipt(detailsToPrint);
                } else {
                    Hypercash.printer.printTransactionWithHeaderAndBody(detailsToPrint);
                }
            }, function (error) {
                uilog('DBUG', 'FAIL: ' + error);
            });
        }
    }
});

$("#printerStatusDialog").on("dialogclose", function (event, ui) {
    $("#printerStatusDialogMsg").html("");
});
$("#printerStatusDialog").dialog({
    hide: "highlight",
    show: "highlight",
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close"
});

$("#priceConfirmation-dialog").dialog({
    width: 450,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    open: function () {
        $("#priceConfirmationMsg").empty();
    }
});

$("#crm-dialog").on("dialogclose", function (event, ui) {
    $("#crmMsgSpan").empty();
    $("#crmCmdField").val("");
    $("#crmTrIdField").val("");
});


$("#crm-dialog").dialog({
    width: 400,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    open: function (event, ui) {
        $("#crmMsgSpan").empty();
        $("#crmCmdField").val("");
        $("#crmTrIdField").val("");
        $("#crmCmdDiv").show();
        $("#crmTxIdDiv").hide();
    }
});

//LOYALTY PROGRAM
$("#loyaltyProg-dialog").on("dialogclose", function (event, ui) {
    $("#loyaltyProgMsgSpan").empty();
    $("#loyaltyProgField").val("");
    $("#LoyProgTrIdField").val("");
});

//e-MOTOR (ENTER BUTTON)
$("#MotorListrikSearchEnterBtn").click(function () {
    var salesNoOrder = $("#MotorListrikNumField").val().toUpperCase();
    setSalesOrderEbike(salesNoOrder);
    console.log("Ini salesNoOrder : " + salesNoOrder);
    var saveFlag = true;
    var message = "Please fill up this field";
    if (salesNoOrder == '') {
        $("#MotorListrikSearchMsg").html(message);
        saveFlag = false;
    }
    else {
        $("#MotorListrikSearchMsg").html('');
    }

    console.log("Kirim data Sales No Order");
    var type = "transaksi";

    InfoSalesNoOrder = {
        NoSalesOrder: salesNoOrder
    }

    if (saveFlag) {
        MotorListrikServices(InfoSalesNoOrder, type);
        barangSubsidi = true;
    }   
});


$("#loyaltyProg-dialog").dialog({
    width: 400,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    open: function (event, ui) {
        $("#loyaltyProgMsgSpan").empty();
        $("#loyaltyProgField").val("");
        $("#LoyProgTrIdField").val("");
        $("#loyaltyProgDiv").show();
        $("#loyProgTxIdDiv").hide();
    }
});

$("#loyaltyProg-dialog").on("dialogclose", function (event, ui) {
    $("#loyaltyProgField").val('');
});

$("#otpLoyalty-dialog").on("dialogclose", function (event, ui) {
    $("#redeemOTPConf").val('');
});
$("#registerLoyaltyProg-dialog").on("dialogclose", function (event, ui) {
    $("#valProgName").val('');
    $("#invalidBirth").html('');
    $("#valMemberName").val('');
    $("#valTglLahir").val('');
    $("#valBlnLahir").val('');
    $("#valThnLahir").val('');
    $("#valAlamat").val('');
    $("#valKtpNumber").val('');
    $("#valHpNumber").val('');
    $("#valEmail").val('');
    document.getElementById("valGenderF").checked = false;
    document.getElementById("valGenderM").checked = false;
    $("#invalidGender").html('');
    $("#invalidProgName").html('');
    $("#invalidMemberName").html('');
    $("#invalidKtpNumber").html('');
    $("#invalidHpNumber").html('');
});
$("#custInfoLoyalInquiry-dialog").on("dialogclose", function (event, ui) {
    $("#labHasRegister").html('');
});
$("#registerEarnLoyaltyProg-dialog").on("dialogclose", function (event, ui) {
    $("#valRegProgName").val('');
    $("#valRegMemberName").val('');
    $("#valRegKtpNumber").val('');
    $("#valRegHpNumber").val('');
    $("#valRegEmail").val('');
    $("#invalidRegProgName").html('');
    $("#invalidRegMemberName").html('');
    $("#invalidRegKtpNumber").html('');
    $("#invalidRegHpNumber").html('');
});

$("#inquiryLoyaltyProg-dialog").on("dialogclose", function (event, ui) {
    $("#loyaltyProgField").val('');
    $("#inqLoyalDate").val('');
    $("#inqLoyalPhone").val('');
    $("#inqLoyalMemberId").val('');
    $("#invInqPhone").html('');
    $("#invInqRsp").html('');
});
$("#redeemLoyaltyProg-dialog").on("dialogclose", function (event, ui) {
    $("#loyaltyProgField").val('');
    $("#redeemLoyalDate").val('');
    $("#redeemLoyalMemberId").val('');
    $("#redeemLoyalPhone").val('');
    $("#invRedeemPhone").html('');
});

$("#generateRewardLoyalty-dialog").on("dialogclose", function (event, ui) {
    $("#loyaltyProgField").val('');
    $("#invalidRedProgName").val('');
    $("#redeemLoyalMemberId").val('');
    $("#redeemLoyalPhone").val('');
});
$("#unpointLoyaltyProg-dialog").on("dialogclose", function (event, ui) {
    $("#unpointLoyalPhone").val('');
    $("#unpPhone").html('');
});

$("#tstaffId").keyboard({
    display: numberDisplay2,
    layout: 'custom',
    customLayout: customNumberLayout2,
    maxLength: 13,
    usePreview: false,
    visible: function (e, keyboard, el) {
        console.log("posdialog.js 1");
        addClickHandler(keyboard);
    }
});

$("#staffId-dialog").on("dialogclose", function (event, ui) {
    console.log("posdialog.js 2");
    $("#tstaffId").val('');
});

$("#grabTrIdField").keyboard({
    display: completeDisplay,
    layout: 'custom',
    customLayout: customCompleteLayout,
    visible: function (e, keyboard, el) {
        addClickHandler(keyboard);
    }
});

$("#grabId-dialog").on("dialogclose", function (event, ui) {
    console.log("posdialog.js 2");
    $("#tgrabId").val('');
});

$("#specialOrder-dialog").on("dialogclose", function (event, ui) { // RAHMAT SPO
    $("#tspcOrder").val('');
    $("#specOrder").html('');
});

//POP-UP Loyalty Program Features redeemLoyaltyProg-dialog

$("#redeemLoyaltyProg-dialog").dialog({
    width: 450,
    height: 350,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    dialogClass: "no-close",
    closeOnEscape: false,
    open: function (event, ui) {
        var nowDate = (new Date()).toISOString().slice(0, 10);
        console.log("date : " + nowDate);
        $("#redeemLoyalDate").val(nowDate);
        $("#redeemLoyalMemberId").val('');
        $("#redeemLoyalPhone").val('');
    },
    buttons: {
        Back: function () {
            $(this).dialog("close");
        },
        Confirm: function () {
            var date = $("#redeemLoyalDate").val();
            //var memberId = $("#redeemLoyalMemberId").val();
            var phoneNum = $("#redeemLoyalPhone").val();
            var saveFlag = true;
            var message = "Data tidak valid";

            if (phoneNum == '') {
                $("#invRedeemPhone").html(message);
                saveFlag = false;
            } else {
                $("#invRedeemPhone").html('');
            }

            redeemProgram = {
                phoneNum: phoneNum,
                userName: loggedInUsername,
                storeCode: configuration.storeCode,
                storeName: configuration.storeName
            }
            console.log("redeem phoneNum : " + redeemProgram);
            console.log(redeemProgram);
            var type = "inquiry";

            if (saveFlag) {
                loyaltyServicesRedeem(redeemProgram, type);
            }
        }
    }
});
$("#inquiryLoyaltyProg-dialog").dialog({
    width: 450,
    height: 350,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    dialogClass: "no-close",
    closeOnEscape: false,
    open: function (event, ui) {
        var nowDate = (new Date()).toISOString().slice(0, 10);
        console.log("date : " + nowDate);
        $("#inqLoyalDate").val(nowDate);
        //$("#inqLoyalMemberId").val('');
        $("#inqLoyalPhone").val('');
    },
    buttons: {
        Cancel: function () {
            $(this).dialog("close");
        },
        Confirm: function () {
            var date = $("#inqLoyalDate").val();
            //var memberId = $("#inqLoyalMemberId").val();
            var phoneNum = $("#inqLoyalPhone").val();
            console.log("Ini PhoneNum : " + phoneNum);
            var saveFlag = true;
            var message = "Please fill up this field";


            /*if(memberId == '' && phoneNum == ''){
                $("#invInqMemberId").html(message);
                $("#invInqPhone").html(message);
                saveFlag = false;
            } else {
                $("#invInqMemberId").html('');
                $("#invInqPhone").html('');
            }*/

            if (phoneNum == '') {
                $("#invInqPhone").html(message);
                saveFlag = false;
            } else {
                $("#invInqPhone").html('');
            }

            console.log("Kirim data inquiry");
            var type = "inquiry";

            InfoloyaltyProgram = {
                hpNumber: phoneNum
            }
            // var responseRequest = {}
            // responseRequest.rspCode = 999;
            // responseRequest.msg = 'Data tidak terdaftar';
            // console.log(responseRequest);

            //var url = "10.21.9.43:5376/inquiry";

            if (saveFlag) {
                loyaltyServices(InfoloyaltyProgram, type);
            }

        }
    }
});
var messageReg;
$("#custInfoLoyalInquiry-dialog").dialog({
    width: 450,
    height: 600,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    dialogClass: "no-close",
    closeOnEscape: false,
    open: function (event, ui) {
        var nowDate = (new Date()).toISOString().slice(0, 10);
        $("#valInqDate").val(nowDate);
        $("#labInqMemberId").html('Member ID');
        $("#labInqMemberName").html(getMsgValue("member_name_loyalty"));
        $("#labInqGender").html(getMsgValue("member_gender_loyalty"));
        $("#labInqTglLahir").html(getMsgValue("member_tgl_lahir"));
        $("#labInqKtpNumber").html(getMsgValue("ktp_number_loyalty"));
        $("#labInqHpNumber").html(getMsgValue("handphone_number_loyalty"));
        $("#labInqEmail").html(getMsgValue("email_loyalty"));
        console.log("itu" + InfoloyaltyProgram);
        if (InfoloyaltyProgram != null) {
            $("#valInqMemberName").val(InfoloyaltyProgram.memberName);
            if (InfoloyaltyProgram.gender == "F") {
                $("#valInqGender").val("Female");
            } else if (InfoloyaltyProgram.gender == "M") {
                $("#valInqGender").val("Male");
            } else {
                $("#valInqGender").val('');
            }
            $("#valInqTglLahir").val(InfoloyaltyProgram.tglLahir);
            $("#valInqKtpNumber").val(InfoloyaltyProgram.ktpNumber);
            $("#valInqHpNumber").val(InfoloyaltyProgram.hpNumber);
            $("#valInqEmail").val(InfoloyaltyProgram.email);
            $("#valInqProgName").val(InfoloyaltyProgram.programName);
            $("#valInqBeginPoint").val(InfoloyaltyProgram.beginningPoints);
            $("#valInqEarnedPoint").val(InfoloyaltyProgram.earnedPoint);
            $("#valInqBalPoint").val(InfoloyaltyProgram.balancePoint);
            $("#labHasRegister").html(messageReg);
        }
    },
    buttons: {
        CLOSE: function () {
            $(this).dialog("close");
            loyaltyProgram = [];
            InfoloyaltyProgram = [];
        },
        PRINT: function () {
            console.log("masuk ke print");
            printReceipt({
                header: setReceiptHeader(saleTx),
                body: setInfoInquiryLoyalty(InfoloyaltyProgram),
                footer: setReceiptFooterRegLoyalty()
            });
            $("#loyaltyProg-dialog").dialog("close");
            $("#inquiryLoyaltyProg-dialog").dialog("close");
            $("#custInfoLoyalInquiry-dialog").dialog("close");
            $("#registerLoyaltyProg-dialog").dialog("close");
            clearOrder();
            createOrder();
        }
    }
});


$("#unpointLoyaltyProg-dialog").dialog({
    width: 450,
    height: 350,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    dialogClass: "no-close",
    closeOnEscape: false,
    open: function (event, ui) {
        var nowDate = (new Date()).toISOString().slice(0, 10);
        console.log("date : " + nowDate);
        $("#unpointLoyalDate").val(nowDate);
        $("#unpointLoyalMemberId").val('');
        $("#unpointLoyalPhone").val('');
    },
    buttons: {
        Cancel: function () {
            $(this).dialog("close");
        },
        Confirm: function () {
            var date = $("#unpointLoyalDate").val();
            var memberId = $("#unpointLoyalMemberId").val();
            var phoneNum = $("#unpointLoyalPhone").val();
            var saveFlag = true;
            var message = "Please fill up this field";

            unpointProgram = {
                hpNumber: phoneNum,
                storeCode: configuration.storeCode
            }
            if (phoneNum == '') {
                $("#unpPhone").html(message);
                saveFlag = false;
            } else {
                $("#unpPhone").html('');
            }
            if (saveFlag) {
                var defer = $.Deferred();
                $("#authentication-form").removeData(AUTH_DATA_KEYS)
                    .data('roles', ['ROLE_SUPERVISOR'])
                    .data('defer', defer)
                    .data('interventionType', CONSTANTS.TX_TYPES.SPV_EARN.name)
                    .dialog("open");
                defer.promise()
                    .done(function (supervisorInterventionData) {
                        //temporary save the intervention data
                        supervisorInterventionData.amount = 0;
                        uilog('DBUG', "Supervisor Intervention : " + JSON.stringify(supervisorInterventionData));
                        SUPERVISOR_INTERVENTION.saveInterventionData(unpointProgram.hpNumber, supervisorInterventionData, supervisorInterventionData.amount);
                        var type = "inquiry";
                        loyaltyServicesManual(unpointProgram, type);
                    });
            }
        }
    }
});
//Data Dummy

$("#custUnpointLoyalInquiry-dialog").dialog({

    width: 550,
    height: 600,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    dialogClass: "no-close",
    closeOnEscape: false,
    open: function (event, ui) {
        var nowDate = (new Date()).toISOString().slice(0, 10);

        $("#valUnpDate").html(":" + nowDate);
        $("#unpLabTrNumber").html(getMsgValue("tr_number_loyalty"));
        if (unpointProgram != null) {
            //$("#valUnpMemberId").html(" : " + unpointProgram.memberId);
            $("#valUnpMemberName").html(" : " + unpointProgram.memberName);
            $("#valUnpKtpNumber").html(" : " + unpointProgram.ktpNumber);
            $("#valUnpHpNumber").html(" : " + unpointProgram.hpNumber);
            $("#valUnpEmail").html(" : " + unpointProgram.email);

            // $("#valUnpBeginPoint").html(" : " + unpointProgram.beginningPoints);
            // $("#valUnpEarnedPoint").html(" : " + unpointProgram.earnedPoint);
            $("#valUnpBalance").html(" : " + unpointProgram.balancePoint);
        }
    },
    buttons: {
        CLOSE: function () {

            $(this).dialog("close");
            $("#unpTrNumber").val('');
            $("#unpointLoyalPhone").val('');
            var row = $("#unpValTb tbody input").parent().parent();
            row.remove();
            unpClick = unpClick - unpClick;
        },
        SUBMIT: function () {
            console.log("Save Earn Manual");
            var transactionNumberPrint = [];
            var transactionNumberLoy = [];
            var point = 0;
            //var tmp2 = $("#valUnpProgName").val();
            var tmp2 = $('input[name=groupEvent]:checked').val();
            if (!tmp2) {
                $("#invalidUnpProgName").html("Pilih Program Name");
                saveFlag = false;
                return false;
            } else {
                $("#invalidUnpProgName").html('');
            }
            var maxReward = tmp2.split("-");
            var progName = $('input[name=groupEvent]:checked').val();
            console.log("maxReward");
            console.log(maxReward[0]);
            console.log(maxReward[1]);
            for (var i = 1; unpClick >= i; i++) {
                var tmp = parseInt($("#UnpValTrPoint" + i + "").val());
                point = point + tmp;
                if (tmp == 0) {
                    alert("Semua No. Tr Harus memiliki Point");
                    return false;
                } else if (parseInt(maxReward[1]) == 0) {
                    alert("Program ini tidak bisa generate point");
                    return false;
                } else if (tmp > parseInt(maxReward[1])) {
                    alert("Untuk Satu No. Tr , Point Tidak Boleh Melebihi " + maxReward[1]);
                    return false;
                }
            }
            console.log("POint " + point);
            if (point == 0) {
                alert("Semua Tr No. Harus memiliki Point");
            } else {

                for (var i = 1; unpClick >= i; i++) {
                    var temp = $("#UnpValTrNumber" + i + "").val(); //tr number
                    var tmp = $("#UnpValTrPoint" + i + "").val(); //point
                    var tm = $("#UnpValTrEvenId" + i + "").val(); //event (-/progCode)

                    console.log("tmp : " + temp + tmp + tm);
                    if (tm != "-") {
                        if (temp != null && tmp != null && tm != null) {
                            transactionNumberPrint.push(temp + "|" + tmp);
                            transactionNumberLoy.push(temp + "|" + tmp + "|" + tm);
                        }
                    } else {
                        if (temp != null && tmp != null && tm != null) {
                            transactionNumberPrint.push(temp + "|" + tmp);
                            transactionNumberLoy.push(temp + "|" + tmp + "|" + maxReward[0]);
                        }
                    }
                }
                //var programCode = $("#valRedProgName").val();
                var programCode = $('input[name=redEvent]:checked').val();
                var storeCode = configuration.storeCode;
                var storeName = configuration.storeName;
                var userName = loggedInUsername;
                unpointProgram.trNumberPrint = transactionNumberPrint;
                unpointProgram.trNumber = transactionNumberLoy;
                unpointProgram.unpProgName = maxReward[2];

                var type = "earn_manual";
                loyaltyServicesManualSave(unpointProgram, type, maxReward[0], storeCode, storeName, userName);

                printReceipt({
                    header: setReceiptHeader(saleTx),
                    body: setReceiptUnpLoyalty(unpointProgram),
                    footer: setReceiptFooterRegLoyalty()
                });
                $("#loyaltyProg-dialog").dialog("close");
                $("#unpointLoyaltyProg-dialog").dialog("close");


                $("#unpTrNumber").val('');
                var row = $("#unpValTb tbody input").parent().parent();
                row.remove();
                unpClick = unpClick - unpClick;
                clearOrder();
                createOrder();
                $(this).dialog("close");
            }
        }
    }
});

//e-MOTOR (DIALOG)
$("#MotorListrik-dialog").dialog({
    width: 400,
    height: 280,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    open: function (event, ui) {
        $("#MotorListrikResultDiv").hide();
        $("#MotorListrikSearchDiv").show();
        $("#MotorListrikNumField").val();
    }
});


//OTP DIALOG LOYALTY PROGRAM
$("#otpLoyalty-dialog").dialog({
    width: 470,
    height: 220,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    dialogClass: "no-close",
    closeOnEscape: false,
    open: function (event, ui) {
        $("#redeemOTPConf").val('');
    },
    buttons: {
        Cancel: function () {
            $(this).dialog("close");
        },
        LANJUTKAN: function () {
            if ($("#redeemOTPConf").val() != "") {
                $("#generateRewardLoyalty-dialog").dialog("open");
            } else {

            }
        }
    }
});

$("#generateRewardLoyalty-dialog").dialog({
    width: 450,
    height: 600,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    dialogClass: "no-close",
    closeOnEscape: false,
    open: function (event, ui) {
        var nowDate = (new Date()).toISOString().slice(0, 10);
        //var progName = $("#valRedProgName").val();
        var progName = $('input[name=redEvent]:checked').val();
        $("#valGenDate").val(nowDate);
        //$("#labGenMemberId").html('Member ID');

        $("#labGenMemberName").html(getMsgValue("member_name_loyalty"));
        $("#labGenKtpNumber").html(getMsgValue("ktp_number_loyalty"));
        $("#labGenGender").html(getMsgValue("member_gender_loyalty"));
        $("#labGenTglLahir").html(getMsgValue("member_tgl_lahir"));
        $("#labGenHpNumber").html(getMsgValue("handphone_number_loyalty"));
        $("#labGenEmail").html(getMsgValue("email_loyalty"));
        $("#labGenProgName").html(getMsgValue("program_name_loyalty"));
        if (redeemProgram != null) {
            $("#valGenMemberName").val(redeemProgram.memberName);
            if (redeemProgram.gender == "F") {
                $("#valGenGender").val("Female");
            } else if (redeemProgram.gender == "M") {
                $("#valGenGender").val("Male");
            } else {
                $("#valGenGender").val('');
            }
            $("#valGenTglLahir").val(redeemProgram.tglLahir);
            $("#valGenKtpNumber").val(redeemProgram.ktpNumber);
            $("#valGenHpNumber").val(redeemProgram.hpNumber);
            $("#valGenEmail").val(redeemProgram.email);
            $("#valGenBalPoint").val(redeemProgram.balancePoint);
        }

    },
    buttons: {
        Back: function () {
            $(this).dialog("close");
        },
        LANJUTKAN: function () {
            //var progName = $("#valRedProgName").val();
            var saveFlag = true;
            var progName = $('input[name=redEvent]:checked').val();
            if (!progName) {
                $("#invalidRedProgName").html("Pilih Program Name");
                saveFlag = false;
                return false;
            } else {
                $("#invalidRedProgName").html('');
            }
            var hpNumber = $("#valGenHpNumber").val();
            console.log(redeemProgram);
            var type = "pre_redeem";
            var programCode = progName;
            redeemProgram.balancePoint = redeemProgram.balancePoint
            if (saveFlag) {
                loyaltyServicesRedeem(redeemProgram, type, programCode);
                //$("#genRewardsPointInfo-dialog").dialog("open");
            }
        }
    }
});
var gift = [];
var giftStock;
var oriOTPCode;
var emptyGift;
$("#genRewardsPointInfo-dialog").dialog({
    width: 500,
    height: 550,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    dialogClass: "no-close",
    closeOnEscape: false,
    open: function (event, ui) {
        var nowDate = (new Date()).toISOString().slice(0, 10);
        $("#labGenRewProgName").html(getMsgValue("program_name_loyalty"));
        $("#labGenRewBeginPoint").html(getMsgValue("beginning_points_loyalty"));
        $("#labGenKtp").html(getMsgValue("ktp_number_loyalty"));
        $("#labGenOtp").html(getMsgValue("otp_loyalty"));
        $("#labGenGenGender").html(getMsgValue("member_gender_loyalty"));
        $("#labGenGenTglLahir").html(getMsgValue("member_tgl_lahir"));
        $("#labGenEmailRedeem").html(getMsgValue("email_loyalty"));
        $("#labGenRewEarnedPoint").html(getMsgValue("earned_points_loyalty"));
        $("#labGenRewBalPoint").html(getMsgValue("balance_points_loyalty"));
        if (redeemProgram != null) {

            $("#valGenRewBalPoint").html(redeemProgram.balancePoint);
            if (redeemProgram.gender != "") {
                if (redeemProgram.gender == "F") {
                    document.getElementById('valGenGenderF').disabled = true;
                    document.getElementById('valGenGenderF').disabled = true;
                    document.getElementById('valGenGenderF').checked = true;
                } else {
                    document.getElementById('valGenGenderM').disabled = true;
                    document.getElementById('valGenGenderF').disabled = true;
                    document.getElementById('valGenGenderM').checked = true;
                }
            } else {
                document.getElementById('valGenGenderF').disabled = false;
                document.getElementById('valGenGenderM').disabled = false;
                document.getElementById('valGenGenderF').checked = false;
                document.getElementById('valGenGenderM').checked = false;
            }
            if (redeemProgram.ktpNumber != "") {
                $("#valGenKtp").val(redeemProgram.ktpNumber);
                document.getElementById('valGenKtp').disabled = true;
            } else {
                document.getElementById('valGenKtp').disabled = false;
            }
            if (redeemProgram.email != "") {
                $("#valGenEmailRedeem").val(redeemProgram.email);
                document.getElementById('valGenEmailRedeem').disabled = true;
            } else {
                document.getElementById('valGenEmailRedeem').disabled = false;
            }
            if (redeemProgram.tglLahir != "") {
                var redTglLahir = redeemProgram.tglLahir;
                var tmp = redTglLahir.split("-");
                $("#valGenGenTglLahir").val(tmp[0]);
                $("#valGenGenBlnLahir").val(tmp[1]);
                $("#valGenGenThnLahir").val(tmp[2]);
                document.getElementById('valGenGenTglLahir').disabled = true;
                document.getElementById('valGenGenBlnLahir').disabled = true;
                document.getElementById('valGenGenThnLahir').disabled = true;
            } else {
                document.getElementById('valGenGenTglLahir').disabled = false;
                document.getElementById('valGenGenBlnLahir').disabled = false;
                document.getElementById('valGenGenThnLahir').disabled = false;
            }
        }
        $("#redeemRewardTableBody").html('');
        var stockHeader;
        var stockBody;
        // if (giftStock != "0") {
        //     stockHeader = "<td>Stok</td>";
        //     stockBody = $('<td>').html(gift[a].current_stock);
        // }
        var headerReward = "<td>Gift Name</td>" + stockHeader + "<td>Quantity</td>";
        $("#redeemRewardTableHead").html("<tr>" + headerReward + "</tr>");

        for (a in gift) {
            var trb = $('<tr>');
            if (giftStock != "0") {
                stockHeader = "<td>Stok</td>";
                stockBody = $('<td>').html(gift[a].current_stock);
            }
            trb.append($('<td>').html(gift[a].reward_name));
            trb.append(stockBody);
            trb.append($('<td>').append($('<input type="number" style="width:120px;margin-top:0px;margin-bottom:0px" id="redeemReward' + a + '">')));
            $("#redeemRewardTableBody").append(trb);

            $("#redeemReward" + a).keyboard({
                display: numberDisplay1,
                layout: 'custom',
                customLayout: customNumberLayout1,
                visible: function (e, keyboard, el) {
                    addClickHandler(keyboard);
                }
            });
        }

    },
    buttons: {
        Back: function () {
            $(this).dialog("close");
            console.log("Ke Back Redeem");
            console.log(gift);
        },
        SAVE: function () {
            var programRedeemPrint = [];
            var programRedeemPrintGiftName = [];
            var programRedeemPrintGiftQty = [];
            var programRedeemPoint = [];
            var programGiftCodeReqQty = [];
            var redeemPoint = 0;
            var saveFlag = true;
            var message = "Data tidak valid";
            emptyGift = "Tidak Dapat Melakukan Redeem";
            var tmp;
            console.log("gift");

            console.log(a);
            for (i = 0; a >= i; i++) {
                tmp = $("#redeemReward" + i + "").val();
                console.log("tmp");
                console.log(tmp);
                if (tmp != "") {
                    programRedeemPrintGiftName.push(gift[i].reward_name);
                    programRedeemPrintGiftQty.push(tmp);
                    programRedeemPoint.push(parseInt(gift[i].min_point) * parseInt(tmp));
                    programGiftCodeReqQty.push(gift[i].id + "|" + gift[i].min_point + "|" + $("#redeemReward" + i + "").val() + "|" + parseInt(gift[i].min_point) * parseInt(tmp));
                    console.log("for redeem");
                    console.log(i);
                }
            }

            console.log("isi redeemProgram");
            redeemProgram.redeemGiftType = programRedeemPrintGiftName;
            redeemProgram.redeemGiftQty = programRedeemPrintGiftQty;

            console.log("programRedeemPrint.length: " + programRedeemPrintGiftQty.length);
            if (programRedeemPrintGiftName.length == 0 && programRedeemPrintGiftQty == 0) {
                saveFlag = false;
            }
            console.log("saveFlag " + saveFlag);

            if (!saveFlag) {
                console.log("saveFlag false");
                $("#invalidGift").html("Jumlah hadiah harus diisi");
            } else {
                $("#invalidGift").html('');
            }
            for (z = 0; z < programRedeemPoint.length; z++) {
                redeemPoint += programRedeemPoint[z];
            }

            console.log(programRedeemPoint);
            console.log(programGiftCodeReqQty);
            console.log(redeemPoint);
            console.log(redeemProgram);
            //var progName = $("#valRedProgName").val();
            var progName = $('input[name=redEvent]:checked').val();
            var tempOtpCode = $("#valOtpCode").val();
            var tempKtp = $("#valGenKtp").val();
            var tempEmail = $("#valGenEmailRedeem").val();
            var tempGender = $('input[name=genOpt]:checked').val();
            //var tempTglLahir = $("#valGenGenBlnLahir").val() + "/" + $("#valGenGenTglLahir").val() + "/" + $("#valGenGenThnLahir").val();
            var tempTglLahir = $("#valGenGenTglLahir").val() + "/" + $("#valGenGenBlnLahir").val() + "/" + $("#valGenGenThnLahir").val();
            isValidDate = validDate(tempTglLahir);
            if (isValidDate == false) {
                $("#invalidGenTglLahir").html('Invalid date format!');
                saveFlag = false;
            } else {
                $("#invalidGenTglLahir").html('');
            }
            if (tempOtpCode != oriOTPCode || tempOtpCode.lenght < 8) {
                $("#invalidOtp").html("OTP Code tidak valid");
                saveFlag = false;
            } else {
                $("#invalidOtp").html('');
            }
            if (tempKtp == '') {
                $("#invalidKtp").html("No KTP tidak valid");
                saveFlag = false;
            } else {
                $("#invalidKtp").html('');
            }
            if (tempGender == '') {
                $("#invalidGenGender").html(message);
                saveFlag = false;
            } else {
                $("#invalidGenGender").html('');
            }
            if (tempEmail == "") {
                $("#invalidEmailRedeem").html('');
            } else if (!validateEmail(tempEmail)) {
                $("#invalidEmailRedeem").html(tempEmail + " is Not valid ! " + "Example: abc@def.com");
                saveFlag = false;
            } else {
                $("#invalidEmailRedeem").html('');
            }
            var type = "redeem";
            redeemProgram.gender = tempGender;
            redeemProgram.ktpNumber = tempKtp;
            redeemProgram.email = tempEmail;
            redeemProgram.tglLahir = tempTglLahir;
            if (saveFlag) {
                loyaltyServicesRedeem(redeemProgram, type, progName, redeemPoint, programGiftCodeReqQty);
                resendClick = 0;
            }
        }
    }
});

var calculateRemainingItems = function (beginning, current) {
    for (var ean in beginning) {
        if (saleTx.pppRemainingItems === undefined) {
            saleTx.pppRemainingItems = {};

        }
        if (saleTx.pppRemainingItems[ean] === undefined) {
            saleTx.pppRemainingItems[ean] = {};
        }
        if (saleTx.pppRemainingItems[ean]["remainingQty"] === undefined) {
            saleTx.pppRemainingItems[ean]["remainingQty"] = 0;
        }
        if (parseFloat(saleTx.pppRemainingItems[ean]["remainingQty"]) == 0) {
            getSummarizeSaleItems(saleTx).forEach(function (el) {
                if (el.ean13Code === ean) {
                    saleTx.pppRemainingItems[ean]["remainingQty"] = el.quantity;
                }
            });
        }
        if (saleTx.pppRemainingItems[ean]["remainingQty"] !== undefined && parseFloat(saleTx.pppRemainingItems[ean]["remainingQty"]) > 0) {
            if (current[ean]["pointSel"] !== undefined && current[ean]["pointSel"] > 0) {
                saleTx.pppRemainingItems[ean]["remainingQty"] -= current[ean]["qtySel"];
            }
        }
    }
};
$("#pppItemSelection-dialog").dialog({
    width: 600,
    height: 550,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    dialogClass: "no-close",
    closeOnEscape: false,
    open: function (event, ui) {
        $("#btn-pppItemSelection-dialog-ok").button("disable");
        // InfoloyaltyProgram.memberName
        $("#labelMemberName").html(getMsgValue("member_name_loyalty"));
        // InfoloyaltyProgram.hpNumber
        $("#labelHandphoneNumber").html(getMsgValue("handphone_number_loyalty"));
        // InfoloyaltyProgram.email
        $("#labelEmail").html(getMsgValue("email_loyalty"));
        // InfoloyaltyProgram.balancePoint
        $("#labelBalancePoints").html(getMsgValue("balance_points_loyalty"));
        // labelPointsWillBeUsed
        $("#labelPointsWillBeUsed").html(getMsgValue("ppp_points_will_be_used"));
        if (InfoloyaltyProgram != null) {
            // InfoloyaltyProgram.memberName
            $("#valueMemberName").html(InfoloyaltyProgram.memberName);
            // InfoloyaltyProgram.hpNumber
            $("#valueHandphoneNumber").html(InfoloyaltyProgram.hpNumber);
            // InfoloyaltyProgram.email
            $("#valueEmail").html(InfoloyaltyProgram.email);
            // InfoloyaltyProgram.balancePoint
            $("#valueBalancePoints").html(InfoloyaltyProgram.balancePoint);
            // valuePointsWillBeUsed
            $("#valuePointsWillBeUsed").html("0");

            var dataItems = $("#pppItemSelection-dialog").data("items");
            saleTx.pppBeginningItems = dataItems;

            // var table = document.getElementById("pppItemSelectionTable");
            $("#pppItemSelectionTableBody").empty();
            var tableBody = document.getElementById("pppItemSelectionTableBody");
            var index = 0;
            var minQ = 0;
            var maxQ = {};
            var pspByPoint = {};


            function refreshPointsWillBeUsed() {
                var total = 0;
                var selectedPointQuantityBreakDown = {};
                for (var key in dataItems) {
                    // get Points Required Selected
                    var pReq = $("input[name='" + key + "_pR']:checked").val();
                    // get Selected Quantity Amount
                    var sQty = $("#" + key + "_selQuantity").val();

                    // Calculating
                    if (pReq === undefined || pReq === null || pReq === "") {
                        pReq = 0;
                    }

                    if (sQty === undefined || sQty === null || sQty === "") {
                        sQty = 0;
                    }

                    selectedPointQuantityBreakDown[key] = {
                        "pointSel": parseInt(pReq),
                        "qtySel": parseInt(sQty),
                        "basePrice": parseFloat(pspByPoint[key][pReq]),
                        "totalPrice": parseInt(sQty) * parseFloat(pspByPoint[key][pReq])
                    }

                    total += (parseInt(pReq) * parseInt(sQty));

                }
                // Rerender #valuePointsWillBeUsed
                if (total == 0) {
                    $("#valuePointsWillBeUsed").html(total);
                    $("#btn-pppItemSelection-dialog-ok").button("disable");
                } else if (total <= parseInt(InfoloyaltyProgram.balancePoint)) {
                    $("#valuePointsWillBeUsed").html(total);
                    $("#btn-pppItemSelection-dialog-ok").button("enable");
                } else if (total > parseInt(InfoloyaltyProgram.balancePoint)) {
                    $("#valuePointsWillBeUsed").html('<span style="color:red;">' + total + '</span><span style="color:red; font-size: 0.7em;">  (POINT IS NOT ENOUGH)</span>');
                    $("#btn-pppItemSelection-dialog-ok").button("disable");
                }

                saleTx.pppTR = selectedPointQuantityBreakDown;

            }
            for (var key in dataItems) {
                if (dataItems.hasOwnProperty(key)) {

                    var normalPriceOfItems;
                    saleTx.orderItems.forEach(function (el) {
                        if (el["ean13Code"] == key) {
                            normalPriceOfItems = el["priceUnit"];
                        }
                    });
                    var row = tableBody.insertRow(index);
                    // Item Name
                    var cellItemsName = row.insertCell(0);
                    cellItemsName.style = "vertical-align: top";
                    var iN = document.createElement("span");
                    iN.innerHTML = dataItems[key]["shortName"];
                    cellItemsName.appendChild(iN);

                    // Points Required
                    var cellsPointsRequired = row.insertCell(1);
                    cellsPointsRequired.style = "vertical-align: top";
                    dataItems[key]["itemDetails"].forEach(function (val, idx) {
                        var pR = document.createElement("input");
                        pR.type = "radio";
                        pR.name = dataItems[key]["ean13Code"] + "_pR";
                        pR.id = dataItems[key]["ean13Code"] + "_" + val["pointRequired"];
                        pR.value = val["pointRequired"];
                        pR.style = "display: inline-block";

                        var pR2 = document.createElement("label");
                        pR2.for = dataItems[key]["ean13Code"] + "_" + val["pointRequired"];
                        pR2.innerHTML = val["pointRequired"];

                        var pR3 = document.createElement("br");

                        cellsPointsRequired.appendChild(pR);
                        cellsPointsRequired.appendChild(pR2);
                        cellsPointsRequired.appendChild(pR3);
                    });

                    // Selling Price
                    var sellingPrice = row.insertCell(2);
                    sellingPrice.style = "vertical-align: top";
                    var sP = document.createElement("span");
                    sP.innerHTML = 'NORMAL PRICE: \n';
                    sP.style = "display: inline-block";
                    var sPV = document.createElement("span");
                    sPV.innerHTML = 'Rp. ' + numberWithCommas(normalPriceOfItems) + '\n';
                    sPV.style = "display: inline-block";

                    var sP2 = document.createElement("span");
                    sP2.innerHTML = 'PPP PRICE: \n';
                    sP2.style = "display: inline-block";
                    var sP2V = document.createElement("span");
                    sP2V.id = key + "_pPerUnit";
                    sP2V.style = "display: inline-block";

                    var sP3 = document.createElement("span");
                    sP3.innerHTML = 'TOTAL PPP PRICE: \n';
                    sP3.style = "display: inline-block";
                    var sP3V = document.createElement("span");
                    sP3V.id = key + "_pSubtotPerItem";
                    sP3V.style = "display: inline-block";

                    var nl = document.createElement("br");

                    sellingPrice.appendChild(sP);
                    sellingPrice.appendChild(document.createElement("br"));
                    sellingPrice.appendChild(sPV);
                    sellingPrice.appendChild(document.createElement("br"));
                    sellingPrice.appendChild(sP2);
                    sellingPrice.appendChild(document.createElement("br"));
                    sellingPrice.appendChild(sP2V);
                    sellingPrice.appendChild(document.createElement("br"));
                    sellingPrice.appendChild(sP3);
                    sellingPrice.appendChild(document.createElement("br"));
                    sellingPrice.appendChild(sP3V);
                    sellingPrice.appendChild(document.createElement("br"));

                    pspByPoint[dataItems[key]["ean13Code"]] = {};
                    dataItems[key]["itemDetails"].forEach(function (val, idx) {
                        pspByPoint[dataItems[key]["ean13Code"]][val["pointRequired"]] = val["pspByPoint"];
                        $("#" + dataItems[key]["ean13Code"] + "_" + val["pointRequired"]).click(function (e) {

                            // IF We Change The Point Required Radio
                            var ean = e.target.id.split("_")[0];
                            var basePrice = pspByPoint[ean][e.target.id.split("_")[1]];
                            var quantifier = $("#" + ean + "_selQuantity").val();
                            if (quantifier === undefined || quantifier === null || quantifier.trim() === "") {
                                quantifier = 0;
                            };

                            if (basePrice === undefined || basePrice === null || basePrice.trim() === "") {
                                basePrice = 0;
                            };

                            if (parseFloat(quantifier) > parseFloat(maxQ[ean][val["pointRequired"]])) {
                                $("#" + ean + "_selQuantity").val(parseFloat(maxQ[ean][val["pointRequired"]]));
                                quantifier = parseFloat(maxQ[ean][val["pointRequired"]]);
                            }

                            $("#" + ean + "_pPerUnit").text('Rp. ' + numberWithCommas(parseFloat(basePrice)) + '\n');

                            $("#" + ean + "_pSubtotPerItem")
                                .text('Rp. ' + numberWithCommas(parseFloat(basePrice) * parseInt(quantifier)) + '\n');

                            refreshPointsWillBeUsed();
                        });
                    });

                    // Selected Quantity
                    var selectedQuantity = row.insertCell(3);
                    selectedQuantity.style = "vertical-align: top; text-align: center;";
                    var sQ = document.createElement("input");
                    sQ.id = key + "_selQuantity";
                    sQ.style = "display: inline-block; max-width: 50px;";
                    sQ.type = "number";

                    selectedQuantity.appendChild(sQ);

                    $("#" + key + "_selQuantity").keyboard({
                        display: numberDisplay2,
                        layout: 'custom',
                        maxLength: 16,
                        customLayout: customNumberLayout2,
                        usePreview: false,
                        visible: function (e, keyboard, el) {
                            addClickHandler(keyboard);
                        }
                    });

                    if (saleTx.pppRemainingItems === undefined) {
                        getSummarizeSaleItems(saleTx).forEach(function (el) {
                            if (el.ean13Code === key) {
                                maxQ[key] = {};
                                dataItems[key]["itemDetails"].forEach(function (el2) {
                                    if (el2["max_qty"] === undefined || el2["max_qty"] === null) {
                                        el2["max_qty"] = parseFloat(el.quantity);
                                    }
                                    if (parseFloat(el2["max_qty"]) > parseFloat(el.quantity)) {
                                        maxQ[key][el2["pointRequired"]] = el.quantity;
                                    } else if (parseFloat(el2["max_qty"]) <= parseFloat(el.quantity)) {
                                        maxQ[key][el2["pointRequired"]] = parseFloat(el2["max_qty"]);
                                    }

                                });
                                // maxQ[key] = el.quantity;
                            }
                        });
                    }
                    if (saleTx.pppRemainingItems !== undefined) {
                        maxQ[key] = {};
                        var scannedItemsQty;
                        getSummarizeSaleItems(saleTx).forEach(function (el) {
                            if (el.ean13Code === key) {
                                scannedItemsQty = el.quantity;
                            }
                        });
                        var alreadyPaidItemsByPPPQty = parseFloat(scannedItemsQty) - parseFloat(saleTx.pppRemainingItems[key]["remainingQty"]);

                        dataItems[key]["itemDetails"].forEach(function (el) {
                            if (el["max_qty"] === undefined || el["max_qty"] === null) {
                                el["max_qty"] = parseFloat(scannedItemsQty);
                            }
                            var yy = parseFloat(el["max_qty"]) - alreadyPaidItemsByPPPQty;
                            if (yy > 0) {
                                if (yy > parseFloat(saleTx.pppRemainingItems[key]["remainingQty"])) {
                                    maxQ[key][el["pointRequired"]] = parseFloat(saleTx.pppRemainingItems[key]["remainingQty"]);
                                } else if (yy <= parseFloat(saleTx.pppRemainingItems[key]["remainingQty"])) {
                                    maxQ[key][el["pointRequired"]] = yy;
                                }

                            } else if (yy <= 0) {
                                maxQ[key][el["pointRequired"]] = 0;
                            }

                        });
                        // maxQ[key] = saleTx.pppRemainingItems[key]["remainingQty"];
                    }
                    // Disable Showed Items If They Have Other Discount
                    getSummarizeSaleItems(saleTx).forEach(function (el) {
                        if (el.ean13Code === key) {
                            if (el.discBtnApplied === true || parseFloat(el.crmMemberDiscountAmount) > 0 || parseFloat(el.secondLayerDiscountAmount) > 0 || parseFloat(el.discountAmount) > 0) {
                                // Disabling Points Required
                                $('input[name="' + dataItems[key]["ean13Code"] + "_pR" + '"]').prop('disabled', true);
                                // Disabling Selected Quantity
                                $("#" + sQ.id).prop('disabled', true);

                                // Giving Explanation
                                var exp = document.createElement("p");
                                exp.innerHTML = "\nINACTIVE, PROMO Other Than MEGA DISC and PPP Exist.\n";
                                exp.style = "display: block; color: #F7380F; font-size: 0.85em; padding: 0;";
                                cellItemsName.appendChild(exp);
                            }
                        }
                    });

                    // IF We Change The Quantity Input Text
                    $("#" + sQ.id).change(function (e) {
                        e.target.value = parseFloat(e.target.value);
                        var pointR = $("input[name='" + e.target.id.replace(/_selQuantity$/, "") + "_pR']:checked").val();
                        var shouldBeMaxVal = parseFloat(maxQ[e.target.id.replace(/_selQuantity$/, "")][pointR.toString()]);
                        // if (saleTx.pppRemainingItems === undefined) {
                        //     shouldBeMaxVal = parseFloat(maxQ[e.target.id.replace(/_selQuantity$/, "")][pointR.toString()]);
                        // } else if (saleTx.pppRemainingItems !== undefined) {

                        // }

                        if (parseFloat(e.target.value) > shouldBeMaxVal) {
                            e.target.value = shouldBeMaxVal;
                        }
                        if (parseFloat(e.target.value) < minQ) {
                            e.target.value = minQ
                        }


                        var basePrice = pspByPoint[e.target.id.replace(/_selQuantity$/, "")][pointR];
                        var quantifier = e.target.value;
                        if (quantifier === undefined || quantifier === null || quantifier.trim() === "") {
                            quantifier = 0;
                        };

                        if (basePrice === undefined || basePrice === null || basePrice.trim() === "") {
                            basePrice = 0;
                        };

                        $("#" + e.target.id.replace(/_selQuantity$/, "") + "_pSubtotPerItem")
                            .text('Rp. ' + numberWithCommas(parseFloat(basePrice) * parseInt(quantifier)) + '\n');
                        refreshPointsWillBeUsed();
                    });
                    // <input style="display: inline-block; width: 80%;" type="text" id="tspcOrder" class="textBox" autocomplete="off"/>

                    index++;
                }
            }
            // dataItemsKey.forEach(function(el, index) {

            // });
            console.log("Data Items");
            console.log(dataItems);
        }
    },
    buttons: [{
        text: "Cancel",
        click: function () {
            $(this).dialog("close");
        }
    }, {
        text: "OK",
        id: "btn-pppItemSelection-dialog-ok",
        click: function () {

            var pymtMediaTypeName = CONSTANTS.PAYMENT_MEDIA_TYPES.POWER_POINT_PURCHASE.name;
            if (enablePaymentMedia) {
                processNonCmcPayment(function () {

                    var totalPaymentRp = 0;
                    var totalPaymentPt = 0;
                    var ean13 = Object.keys(saleTx.pppTR);
                    for (var x = 0; x < ean13.length; x++) {
                        console.log(JSON.stringify(saleTx.pppTR[ean13[x]]));

                        var quantityPurchased = parseInt(saleTx.pppTR[ean13[x]]["qtySel"]);
                        var i = 0;
                        saleTx.orderItems.forEach(function (el) {


                            if (el["ean13Code"] == key) {
                                i++;
                                if (i <= quantityPurchased) {

                                }
                                normalPriceOfItems = el["priceUnit"];
                            }

                        });
                        // if (saleTx.pppTR.hasOwnProperty[ff]) {
                        // var tt = 0;
                        // if (saleTx.pppTR[el]["totalPrice"] === undefined || saleTx.pppTR[el]["totalPrice"] === null) {
                        // 	tt = 0;
                        // } else {
                        // 	tt = parseFloat(saleTx.pppTR[el]["totalPrice"]);
                        // }
                        // console.log("rahmat");
                        // console.log(saleTx.pppTR[ff]);

                        // saleTx.pppTR[ean13[x]]["pointSel"]
                        // saleTx.pppTR[ean13[x]]["qtySel"]
                        // saleTx.pppTR[ean13[x]]["basePrice"]

                        totalPaymentRp = totalPaymentRp + parseFloat(saleTx.pppTR[ean13[x]]["totalPrice"]);
                        // }
                    };



                    // var payment = parseInt($("#inputDisplay").val());
                    var payment = 0;
                    var ptsUsed = 0;


                    for (var y in saleTx.pppTR) {
                        getSummarizeSaleItems(saleTx).forEach(function (el) {
                            if (el.ean13Code === y) {
                                if (saleTx.pppTR[y]["pointSel"] !== undefined && saleTx.pppTR[y]["pointSel"] > 0) {
                                    payment += (el.priceUnit - saleTx.pppTR[y]["basePrice"]) * saleTx.pppTR[y]["qtySel"];
                                    ptsUsed += (saleTx.pppTR[y]["pointSel"] * saleTx.pppTR[y]["qtySel"]);
                                    // payment += (el.priceUnit - saleTx.pppTR[y]["basePrice"] - (el.crmMemberDiscountAmount / el.quantity)) *  saleTx.pppTR[y]["qtySel"];
                                }
                            }
                        })
                    }

                    var pymtMediaTypeName = CONSTANTS.PAYMENT_MEDIA_TYPES.POWER_POINT_PURCHASE.name;
                    var PPPPayment = function (d) {
                        this.memberID = d.memberID;
                        this.memberName = d.memberName;
                        this.prevPoints = d.prevPoints;
                        this.pppUsedPoints = d.pppUsedPoints;
                        this.trAmt = d.trAmt;
                        this.pItemDetails = d.pItemDetails;
                    };


                    if (PAYMENT_MEDIA.isValidForTriggering(saleTx, pymtMediaTypeName, payment, enablePaymentMedia) && isNoneGiftCardItemInTransaction()) {
                        var PPPDetails = new PPPPayment({
                            memberID: InfoloyaltyProgram.hpNumber,
                            memberName: InfoloyaltyProgram.memberName,
                            prevPoints: InfoloyaltyProgram.balancePoint,
                            pppUsedPoints: ptsUsed,
                            trAmt: payment,
                            pItemDetails: saleTx.pppTR
                        });
                        CASHIER.executePaymentMedia(saleTx, pymtMediaTypeName, payment, { "PPP": PPPDetails });
                        calculateRemainingItems(saleTx.pppBeginningItems, saleTx.pppTR);
                        if (saleTx.pppTotalPoint === null || saleTx.pppTotalPoint === undefined) {
                            saleTx.pppTotalPoint = 0;
                        }
                        saleTx.pppTotalPoint += parseFloat(ptsUsed);

                        if (saleTx.pppTotalAmount === null || saleTx.pppTotalAmount === undefined) {
                            saleTx.pppTotalAmount = 0;
                        }
                        saleTx.pppTotalAmount += parseFloat(payment);
                        $("#pppItemSelection-dialog").dialog("close");
                    }
                }, pymtMediaTypeName);
            }
        }
    }]
});

function validateEmail(tempEmail) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(tempEmail);
}

function validDate(tempTglLahir, isValidDate) {
    var dateformat = /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/;
    var dt = new Date();
    var currentYear = dt.getFullYear();
    // Match the date format through regular expression
    if (tempTglLahir.match(dateformat)) {
        var tmp = tempTglLahir.split("/");
        var dd = parseInt(tmp[0]);
        var mm = parseInt(tmp[1]);
        var yy = parseInt(tmp[2]);
        //alert(dd+"-"+mm+"-"+yy);
        // Create list of days of a month [assume there is no leap year by default]
        var ListofDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (mm == 1 || mm > 2) {
            if (dd > ListofDays[mm - 1]) {
                isValidDate = false;
                return isValidDate;
            }
        }
        if (mm == 2) {
            var lyear = false;
            if ((!(yy % 4) && yy % 100) || !(yy % 400)) {
                lyear = true;
            }
            if ((lyear == false) && (dd >= 29)) {
                isValidDate = false;
                return isValidDate;
            }
            if ((lyear == true) && (dd > 29)) {
                isValidDate = false;
                return isValidDate;
            }
        }
        if (yy < 1900 || yy >= currentYear - 10) {
            isValidDate = false;
            return isValidDate;
        }
    } else {
        isValidDate = false;
        return isValidDate;
    }
    isValidDate = true;
    return isValidDate;
}
$("#registerLoyaltyProg-dialog").dialog({
    width: 500,
    height: 550,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    dialogClass: "no-close",
    closeOnEscape: false,
    open: function (event, ui) {
        $("#labProgName").html(getMsgValue("program_name_loyalty"));
        $("#labMemberName").html(getMsgValue("member_name_loyalty"));
        $("#labAlamat").html(getMsgValue("member_address_loyalty"));
        $("#labGender").html(getMsgValue("member_gender_loyalty"));
        $("#labTglLahir").html(getMsgValue("member_tgl_lahir"));
        $("#labKtpNumber").html(getMsgValue("ktp_number_loyalty"));
        $("#labHpNumber").html(getMsgValue("handphone_number_loyalty"));
        $("#labEmail").html(getMsgValue("email_loyalty"));
    },
    buttons: {
        Back: function () {
            $(this).dialog("close");
        },
        LANJUTKAN: function () {
            //var tmp = $("#valProgName").val();
            var saveFlag = true;
            var tmp = $('input[name=groupEvent]:checked').val();
            if (!tmp) {
                $("#invalidProgName").html("Pilih Program Name");
                saveFlag = false;
                return false;
            } else {
                $("#invalidProgName").html('');
            }
            var code = tmp.split("-");
            var tempProgCode = code[0];
            var tempProgName = code[1];
            var tempMemberName = $("#valMemberName").val();
            var tempGender = $('input[name=genOpt]:checked').val();
            var tempAlamat = $("#valAlamat").val();
            var tempKtpNumber = $("#valKtpNumber").val();
            var tempHpNumber = $("#valHpNumber").val();
            var tempEmail = $("#valEmail").val();
            //var tempTglLahir = $("#valTglLahir").val() + "/" + $("#valBlnLahir").val() + "/" + $("#valThnLahir").val();
            var tempTglLahir = $("#valTglLahir").val() + "/" + $("#valBlnLahir").val() + "/" + $("#valThnLahir").val();

            var isValidDate = false;
            if (tempTglLahir != "//") {
                isValidDate = validDate(tempTglLahir);
                if (isValidDate == false) {
                    $("#invalidBirth").html('Invalid date format!');
                    saveFlag = false;
                } else {
                    $("#invalidBirth").html('');
                }
            } else {
                $("#invalidBirth").html('');
                tempTglLahir = "";
            }
            var message = "Please fill up this field";
            if (tempMemberName == '') {
                $("#invalidMemberName").html(message);
                saveFlag = false;
            } else {
                $("#invalidMemberName").html('');
            }
            if (tempGender == "") {
                $("#invalidGender").html(message);
                saveFlag = false;
            } else {
                $("#invalidGender").html('');
            }
            if (tempKtpNumber == '') {
                $("#invalidKtpNumber").html(message);
                saveFlag = false;
            } else {
                $("#invalidKtpNumber").html('');
            }
            if (tempHpNumber == '') {
                $("#invalidHpNumber").html(message);
                saveFlag = false;
            } else if (tempHpNumber.length < 10) {
                $("#invalidHpNumber").html("Min. 10 digit");
                saveFlag = false;
            } else {
                $("#invalidHpNumber").html('');
            }
            if (tempEmail == "") {
                $("#invalidEmail").html('');
            } else if (!validateEmail(tempEmail)) {
                $("#invalidEmail").html(tempEmail + " is Not valid ! " + "Example: abc@def.com");
                saveFlag = false;
            } else {
                $("#invalidEmail").html('');
            }
            var type = "validate_reg";
            if (saveFlag) {
                loyaltyProgram = {
                    progName: tempProgName,
                    memberName: tempMemberName,
                    ktpNumber: tempKtpNumber,
                    gender: tempGender,
                    tglLahir: tempTglLahir,
                    address: tempAlamat,
                    hpNumber: tempHpNumber,
                    email: tempEmail,
                    userName: loggedInUsername,
                    storeCode: configuration.storeCode,
                    eventId: tempProgCode
                }
                loyaltyServicesHasReg(loyaltyProgram, type);
            }
        }
    }
});
$("#registerEarnLoyaltyProg-dialog").dialog({
    width: 450,
    height: 500,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    dialogClass: "no-close",
    closeOnEscape: false,
    open: function (event, ui) {
        $("#labRegProgName").html(getMsgValue("program_name_loyalty"));
        $("#labRegMemberName").html(getMsgValue("member_name_loyalty"));
        $("#labRegKtpNumber").html(getMsgValue("ktp_number_loyalty"));
        $("#labRegHpNumber").html(getMsgValue("handphone_number_loyalty"));
        $("#labRegEmail").html(getMsgValue("email_loyalty"));
        $("#valRegHpNumber").val(noHpReg);
    },
    buttons: {
        Back: function () {
            $(this).dialog("close");
        },
        SUBMIT: function () {
            // var RegProgName = $("#valRegProgName").val();
            var RegProgName = $('input[name=regEarnEvent]:checked').val();
            var RegMemberName = $("#valRegMemberName").val();
            var RegKtpNumber = $("#valRegKtpNumber").val();
            var RegHpNumber = $("#valRegHpNumber").val();
            var RegEmail = $("#valRegEmail").val();
            var saveFlag = true;
            var message = "Please fill up this field";
            if (RegProgName == '') {
                $("#invalidRegProgName").html(message);
                saveFlag = false;
            } else {
                $("#invalidRegProgName").html('');
            }
            if (RegMemberName == '') {
                $("#invalidRegMemberName").html(message);
                saveFlag = false;
            } else {
                $("#invalidRegMemberName").html('');
            }
            if (RegHpNumber == '') {
                $("#invalidRegHpNumber").html(message);
                saveFlag = false;
            } else if (RegHpNumber.length < 10) {
                $("#invalidRegHpNumber").html("Min. 10 digit");
                saveFlag = false;
            } else {
                $("#invalidRegHpNumber").html('');
            }

            function validateEmail(RegEmail) {
                var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return re.test(RegEmail);
            }
            if (RegEmail == "") {
                if (printTo == "E") {
                    $("#invalidRegEmail").html('Untuk bisa menerima digital receipt, email tidak boleh kosong');
                    saveFlag = false;
                } else {
                    $("#invalidRegEmail").html('');
                }
            } else if (!validateEmail(RegEmail)) {
                $("#invalidRegEmail").html(RegEmail + " is Not valid ! " + "Example: abc@def.com");
                saveFlag = false;
            } else {
                $("#invalidRegEmail").html('');
            }
            var type = "register";
            if (saveFlag) {
                regLoyaltyProgram = {
                    progName: RegProgName,
                    memberName: RegMemberName,
                    ktpNumber: RegKtpNumber,
                    hpNumber: RegHpNumber,
                    email: RegEmail,
                    userName: loggedInUsername,
                    storeCode: configuration.storeCode
                }
                earnRegServices(type, regLoyaltyProgram);
                loyEarnPointsSelected = false;
            }
        }
    }
});

//Adding Transaction Number Loyalty PROGRAM

$("#regTrNumLoyalty-dialog").dialog({
    width: 550,
    height: 500,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    dialogClass: "no-close",
    closeOnEscape: false,
    open: function (event, ui) {
        //Label HTML
        $("#labTempProgName").html(getMsgValue("program_name_loyalty"));
        $("#labTempMemberName").html(getMsgValue("member_name_loyalty"));
        $("#labTempGenderName").html(getMsgValue("member_gender_loyalty"));
        $("#labTempTglLahir").html(getMsgValue("member_tgl_lahir"));
        $("#labTempAddress").html(getMsgValue("member_address_loyalty"));
        $("#labTempKtpNumber").html(getMsgValue("ktp_number_loyalty"));
        $("#labTempHpNumber").html(getMsgValue("handphone_number_loyalty"));
        $("#labTempEmail").html(getMsgValue("email_loyalty"));
        $("#labTrNumber").html(getMsgValue("tr_number_loyalty"));

        //Label Value
        $("#labTProgName").html(" : " + loyaltyProgram.progName);
        $("#labTMemberName").html(" : " + loyaltyProgram.memberName);
        if (loyaltyProgram.gender == "F") {
            $("#labTGenderName").html(" : Female");
        } else if (loyaltyProgram.gender == "M") {
            $("#labTGenderName").html(" : Male");
        } else {
            $("#labTGenderName").html(" : ");
        }
        $("#labTTglLahir").html(" : " + loyaltyProgram.tglLahir);
        $("#labTAddress").html(" : " + loyaltyProgram.address);
        $("#labTKtpNumber").html(" : " + loyaltyProgram.ktpNumber);
        $("#labTHpNumber").html(" : " + loyaltyProgram.hpNumber);
        $("#labTEmail").html(" : " + loyaltyProgram.email);
    },
    buttons: {
        BACK: function () {
            $(this).dialog("close");
            $("#IdvalTrNumber").val('');
            var row = $("#ValTb tbody input").parent().parent();
            row.remove();
            clickNo = clickNo - clickNo;
        },
        SAVE: function () {
            console.log("Save Reg Loyalty");
            var transactionNumberLoyPrint = [];
            var transactionNumberLoy = [];


            for (var i = 1; clickNo >= i; i++) {
                var temp = $("#ValTrNumber" + i + "").val();
                var tmp = $("#ValTrNumberPoint" + i + "").val();
                var tm = $("#ValTrEvenId" + i + "").val();
                if (temp == null && tmp == null && tm == null) {
                    console.log("jika id null");
                } else {
                    transactionNumberLoy.push(temp + "|" + tmp + "|" + tm);
                    transactionNumberLoyPrint.push(temp + "|" + tmp);
                }
            }
            console.log("disini");
            console.log(temp + "|" + tmp + "|" + tm);
            console.log(loyaltyProgram);
            loyaltyProgram.trNumberPrint = transactionNumberLoyPrint;
            loyaltyProgram.trNumber = transactionNumberLoy;
            var type = "register";
            loyaltyRegServices(loyaltyProgram, type);
            console.log("======================masuk sini=================");
            var isitable = $("#loyaltyTableBody").val();
            console.log(isitable);
            $("#IdvalTrNumber").val('');
            var row = $("#ValTb tbody input").parent().parent();
            row.remove();
            clickNo = clickNo - clickNo;
        }
    }
});

function loyaltyServicesProgname(dataBody, type) {
    var data = {
        type: type,
        storeCode: dataBody
    }
    data = JSON.stringify(data);
    $.ajax({
        type: 'POST',
        url: posWebContextPath + '/cashier/loyalty/process',
        async: false,
        contentType: "application/json",
        data: data,
        timeout: 30000,
        success: function (response) {

        },
        error: function () {
            uilog('DBUG', 'call Inquiry');
        }
    });
}


//Allo Top Up 2022-08-12
function inquiryAlloTopup(qrValue) {
    var isHTTPStatusOK = false;
    var reqData = {
        qr_value: qrValue,
        terminal_id: configuration["qrttstid"],
        merchant_id: configuration.properties["QRTTS_MID"],
        type: "inquiry"
    };
    var data = $.ajax({
        url: posWebContextPath + "/cashier/allo/qrtts",
        type: "POST",
        async: false,
        contentType: 'application/json',
        dataType: "json",
        data: JSON.stringify(reqData),
        beforeSend: function() {
            if (!$("#loading-dialog").dialog("isOpen")) {
                $("#loading-dialog").dialog("open");
            }
        },
        success: function (response) {
            console.log("======inquiryAlloTopup=====");
            console.log(response);
            isHTTPStatusOK = true;
            $("#loading-dialog").dialog('close');
        },
        error: function (jqXHR, status, error) {
            console.log('[inquiryAlloTopup] failed to call to api inquiry allo topup');
            $("#loading-dialog").dialog('close');
        },
    }).responseText;

    if (isHTTPStatusOK) return JSON.parse(data);
    else return null;
}


//TOP UP DEVELOPMENT
function reqItemTopup(merhcantType) {
    var isHTTPStatusOK = false;
    var data = $.ajax({
        url: "/reqCategory"+merhcantType+"Topup",
        type: "GET",
        async: false,
        contentType: 'application/json',
        dataType: "json",
        beforeSend: function() {
            if (!$("#loading-dialog").dialog("isOpen")) {
                $("#loading-dialog").dialog("open");
            }
        },
        success: function (data, status) {
            console.log("======reqItemTopup=====");
            console.log(data);
            isHTTPStatusOK = true;
            $("#loading-dialog").dialog('close');
        
            if (isHTTPStatusOK) {
                var response;
                // try {
                //     data = JSON.parse(data);
                // } catch (error) {
                //     console.error("Error parsing JSON:", error);
                // }
        
        
                $("#buttonContainer").empty();
        
                data.sort(function (a, b) {
                    var priceA = parseInt(a.split(",")[5]);
                    var priceB = parseInt(b.split(",")[5]);
                    return priceA - priceB;
                });

                for (var i in data) {
                    var itemTopup = data[i].split(",");
                    var description = itemTopup[3];
                
                    var priceMatch = description.match(/\d{1,3}(?:\.\d{3})*(?:\.\d{1,3})?/); // Match numbers with or without a period as a thousand separator
                    var response = priceMatch ? parseFloat(priceMatch[0].replace(/\./g, '')) : 0; // Remove thousand separators
                
                    var formattedPrice = response.toLocaleString(undefined, {minimumFractionDigits: 3, maximumFractionDigits: 3});
                
                    var button = $('<button>').text(formattedPrice).attr('onClick', 'fbtnAlloTopup(' + response + ')');
                    $("#buttonContainer").append(button);
                }

                // for (var i in data) {
                //     var itemTopup = data[i].split(",");
                //     response = parseInt(itemTopup[5]);

                //     var formattedPrice = response.toLocaleString();

                //     var button = $('<button>').text(formattedPrice).attr('onClick', 'fbtnAlloTopup(' + response + ')');
                //     $("#buttonContainer").append(button);
                // }
            }
        },
        error: function (jqXHR, status, error) {
            console.log('[reqCategoryAlloTopup] failed to call reqCategoryAlloTopup');
            $("#loading-dialog").dialog('close');
        },
    }).responseText;
}

//Allo Top Up 2022-08-12
function reqItemForTopup(amount, topUpType) {
    var isHTTPStatusOK = false;
    var data = $.ajax({
        url: "/reqCategory"+topUpType+"Topup",
        type: "GET",
        async: false,
        contentType: 'application/json',
        dataType: "json",
        beforeSend: function() {
            if (!$("#loading-dialog").dialog("isOpen")) {
                $("#loading-dialog").dialog("open");
            }
        },
        success: function (data, status) {
            console.log("======reqItemForTopup=====");
            console.log(data);
            isHTTPStatusOK = true;
            $("#loading-dialog").dialog('close');
        },
        error: function (jqXHR, status, error) {
            console.log('[reqCategoryAlloTopup] failed to call reqCategoryAlloTopup');
            $("#loading-dialog").dialog('close');
        },
    }).responseText;

    if (isHTTPStatusOK) {
        var response;
        data = JSON.parse(data);
        for (var i in data) {
            var itemTopup = data[i].split(",");
            var description = itemTopup[3];
            var priceMatch = description.match(/\d{1,3}(?:\.\d{3})*(?:\.\d{1,3})?/);
            var response1 = priceMatch ? parseFloat(priceMatch[0].replace(/\./g, '')) : 0;
            if (parseInt(response1) == parseInt(amount)) {
                response = itemTopup;
            }
        }
        return response;
    }
    else return null;
}


// //Allo Top Up 2022-08-12
// function reqItemOVOTopup(amount) {
//     var isHTTPStatusOK = false;
//     var data = $.ajax({
//         url: "/reqCategoryOVOTopup",
//         type: "GET",
//         async: false,
//         contentType: 'application/json',
//         dataType: "json",
//         beforeSend: function() {
//             if (!$("#loading-dialog").dialog("isOpen")) {
//                 $("#loading-dialog").dialog("open");
//             }
//         },
//         success: function (data, status) {
//             console.log("======reqItemOVOTopup=====");
//             console.log(data);
//             isHTTPStatusOK = true;
//             $("#loading-dialog").dialog('close');
//         },
//         error: function (jqXHR, status, error) {
//             console.log('[reqCategoryOVOTopup] failed to call reqCategoryOVOTopup');
//             $("#loading-dialog").dialog('close');
//         },
//     }).responseText;

//     if (isHTTPStatusOK) {
//         var response;
//         data = JSON.parse(data);
//         for (var i in data) {
//             var itemTopup = data[i].split(",");
//             if (parseInt(itemTopup[5]) == parseInt(amount)) {
//                 response = itemTopup;
//             }
//         }
//         return response;
//     }
//     else return null;
// }

//Allo Top Up 2022-08-12
function paymentAlloTopup(keyNo) {
    var isSuccess = false;
    var reqData = {
        key_no: keyNo,
        type: "payment"
    }
    var data = $.ajax({
        type: 'POST',
        url: posWebContextPath + '/cashier/allo/qrtts',
        async: false,
        contentType: "application/json",
        data: JSON.stringify(reqData),
        timeout: 30000,
        beforeSend: function() {
            if (!$("#loading-dialog").dialog("isOpen")) {
                $("#loading-dialog").dialog("open");
            }
        },
        success: function (response) {
            if (response) {
                if (response["rc"] && response["rc"] == "00") {
                    console.log("======paymentAlloTopup=====");
                    console.log(response);
                    isSuccess = true;
                }
                else {
                    uilog('DBUG', 'Payment Allo Topup failed');
                }
            }
            else {
                uilog('DBUG', 'Payment Allo Topup failed');
            }
            $("#loading-dialog").dialog('close');
        },
        error: function () {
            uilog('DBUG', 'Payment Allo Topup failed');
            $("#loading-dialog").dialog('close');
        }
    }).responseText;

    if (isSuccess) return JSON.parse(data);
    else return null;
}

//Allo Top Up 2022-08-30
function checkPaymentAlloTopup(keyNo) {
    var isSuccess = false;
    var reqData = {
        key_no: keyNo,
        type: "status"
    }
    var data = $.ajax({
        type: 'POST',
        url: posWebContextPath + '/cashier/allo/qrtts',
        async: false,
        contentType: "application/json",
        data: JSON.stringify(reqData),
        timeout: 30000,
        beforeSend: function() {
            if (!$("#loading-dialog").dialog("isOpen")) {
                $("#loading-dialog").dialog("open");
            }
        },
        success: function (response) {
            if (response) {
                if (response["rc"] && response["rc"] == "00") {
                    console.log("======checkPaymentAlloTopup=====");
                    console.log(response);
                    isSuccess = true;
                }
                else {
                    uilog('DBUG', 'Status Payment Allo Topup failed');
                }
            }
            else {
                uilog('DBUG', 'Status Payment Allo Topup failed');
            }
            $("#loading-dialog").dialog('close');
        },
        error: function () {
            uilog('DBUG', 'Status Payment Allo Topup failed');
            $("#loading-dialog").dialog('close');
        }
    }).responseText;

    if (isSuccess) return JSON.parse(data);
    else return null;
}

//e-MOTOR (FUNCTION)
function MotorListrikServices(dataBody, type, salesOrder) {
    barangSubsidi = true;
    var data = {
        type: type,
        NoSalesOrder: dataBody.NoSalesOrder
    }
    data = JSON.stringify(data);
    $.ajax({
        type: 'POST',
        url: posWebContextPath + '/cashier/ebike/process',
        async: false,
        contentType: "application/json",
        data: data,
        timeout: 30000,
        success: function (response) {
            console.log("Test Rafi : " + JSON.stringify(response));

            if (response.rspCode != "00") {
                console.log(response.rspCode);
                $("#MotorListrikSearchMsg").html(response.msg);
                saveFlag = false;
            } else {
                var barangSubsidi = true;
                var message = "Barcode tidak sesuai"
                if (InfoSalesNoOrder != null) {
                    var barcodeCheck = response.No_Sales_Order[0].barcode;
                    var subsidiCheck = response.No_Sales_Order[0].subsidi;
                    console.log(subsidiCheck)
                    if (barcodeCheck == lastBarcodeScanned) {
                        if (subsidiCheck === 'Y') {
                            insertSubsidi();
                            $("#MotorListrik-dialog").dialog("close");
                        } else {
                            showMotorNotSubsidiMsg();
                            $("#MotorListrik-dialog").dialog("close");
                        }
                    } else {
                        $("#MotorListrikSearchMsg").html(message);
                    }
                    // insertSubsidi();
                }
                $("#invSalesOrderRsp").html('');
            }
        },
        error: function () {
            uilog('DBUG', 'call Inquiry error');
        }
    });
}

function setSalesOrderEbike(salesNoOrder) {
    SalesOrderEbike = salesNoOrder;
}

function showMotorNotSubsidiMsg() {
    var bukanSubsidi = "Bukan Motor Subsidi";
    showMsgDialog(bukanSubsidi,"alert");
}

//UPDATE STATUS PEMBELIAN E-BIKE
function changeStatus(dataBody, type) {
    var data = {
        type: type,
        NoSalesOrder: dataBody.NoSalesOrder,
        tx: dataBody.transactionId
    }
    console.log(data);
    data = JSON.stringify(data);
    $.ajax({
        type: 'POST',
        url: posWebContextPath + '/cashier/ebike/process',
        async: false,
        contentType: "application/json",
        data: data,
        timeout: 30000,
        success: function (response) {
            console.log("Test Rafi : " + JSON.stringify(response));
        },
        error: function () {
            uilog('DBUG', 'call Inquiry error');
        }
    });
}


function loyaltyServices(dataBody, type, noHp) {
    var data = {
        type: type,
        hpNumber: dataBody.hpNumber
    }
    data = JSON.stringify(data);
    $.ajax({
        type: 'POST',
        url: posWebContextPath + '/cashier/loyalty/process',
        async: false,
        contentType: "application/json",
        data: data,
        timeout: 30000,
        success: function (response) {
            console.log("Test Rafi : " + JSON.stringify(response));
            if (response.rspCode != "00") {
                console.log(response.rspCode);
                $("#invInqRsp").html(response.msg);
                saveFlag = false;
            } else {
                if (InfoloyaltyProgram != null) {
                    InfoloyaltyProgram.memberName = response.memberList[0].cust_full_name;
                    InfoloyaltyProgram.gender = response.memberList[0].gender;
                    InfoloyaltyProgram.tglLahir = response.memberList[0].date_of_birth;
                    InfoloyaltyProgram.ktpNumber = response.memberList[0].id_no;
                    InfoloyaltyProgram.hpNumber = response.memberList[0].phone_no_1;
                    InfoloyaltyProgram.email = response.memberList[0].email;
                    InfoloyaltyProgram.beginningPoints = response.memberList[0].prev_point;
                    InfoloyaltyProgram.earnedPoint = "0";
                    InfoloyaltyProgram.balancePoint = response.memberList[0].current_point;
                }
                $("#invInqRsp").html('');
                $("#custInfoLoyalInquiry-dialog").dialog("open");
            }
            //earnLoyaltyProgram.memberName = response.memberList[0].cust_full_name;
        },
        error: function () {
            uilog('DBUG', 'call Inquiry error');
        }
    });
}

function getEventServices(type, storeCode) {
    var data = {
        type: type,
        storeCode: storeCode
    }
    data = JSON.stringify(data);
    $.ajax({
        type: 'POST',
        url: posWebContextPath + '/cashier/loyalty/process',
        async: false,
        contentType: "application/json",
        data: data,
        timeout: 30000,
        success: function (response) {
            //alert("success" + response);
            console.log("Test Rafi : " + JSON.stringify(response));
            if (response.rspCode == "00") {
                $("#registerLoyaltyProg-dialog").dialog("open");
                var loyaltyProg = response.eventList;
                console.log(loyaltyProg);
                $("#valProgName").html('');
                for (i in loyaltyProg) {
                    var nameProgram = loyaltyProg[i].event_name;
                    var codeProgram = loyaltyProg[i].prog_code;
                    //var selOption = $('<option value="'+codeProgram+"-"+nameProgram+'">').html(nameProgram);
                    var selOption = $('<tr>').append($('<td style="width=90%;">')
                        .append($('<label for="optProg_' + codeProgram + '">' + nameProgram + '</label></td>')))
                        .append($('<td>').append($('<input type="radio" style="width:10%;" id="optProg_' + codeProgram + '" name="groupEvent" value="' + codeProgram + "-" + nameProgram + '" /></td>')))
                        .append($('</tr>'));
                    $("#valProgName").append(selOption);
                }
            } else {
                alert(response.msg);
            }
        },
        error: function () {
            uilog('DBUG', 'call Inquiry error');
        }
    });
}

function getEarnEventServices(type, storeCode) {
    var data = {
        type: type,
        storeCode: storeCode
    }
    data = JSON.stringify(data);
    $.ajax({
        type: 'POST',
        url: posWebContextPath + '/cashier/loyalty/process',
        async: false,
        contentType: "application/json",
        data: data,
        timeout: 30000,
        success: function (response) {
            //alert("success" + response);
            console.log("Test Rafi : " + JSON.stringify(response));
            if (response.rspCode == "00") {
                $("#registerEarnLoyaltyProg-dialog").dialog("open");
                var loyaltyProg = response.eventList;
                $("#valRegProgName").html('');
                for (i in loyaltyProg) {
                    var nameProgram = loyaltyProg[i].event_name;
                    var codeProgram = loyaltyProg[i].prog_code;
                    //var selOption = $('<option value="'+codeProgram+"-"+nameProgram+'">').html(nameProgram);
                    var selOption = $('<tr>').append($('<td style="width=90%;">')
                        .append($('<label for="optProg_' + codeProgram + '">' + nameProgram + '</label></td>')))
                        .append($('<td>').append($('<input type="radio" style="width:10%;" id="optProg_' + codeProgram + '" name="regEarnEvent" value="' + codeProgram + "-" + nameProgram + '" /></td>')))
                        .append($('</tr>'));
                    $("#valRegProgName").append(selOption);
                }
            } else {
                alert(response.msg);
            }
        },
        error: function () {
            uilog('DBUG', 'call Inquiry error');
        }
    });
}

function loyaltyServicesHasReg(dataBody, type) {
    var data = {
        type: type,
        //dataIni : dataBody
        hpNumber: dataBody.hpNumber,
        ktpNumber: dataBody.ktpNumber,
        email: dataBody.email
    }
    data = JSON.stringify(data);
    console.log("data" + data);
    $.ajax({
        type: 'POST',
        url: posWebContextPath + '/cashier/loyalty/process',
        async: false,
        contentType: "application/json",
        data: data,
        timeout: 30000,
        success: function (response) {
            //alert("success" + response);
            console.log("Test Rafi : " + JSON.stringify(response));
            if (response.rspCode != "00") {
                $("#regTrNumLoyalty-dialog").dialog("open");
            } else {
                messageReg = "Data Sudah Terdaftar";
                if (InfoloyaltyProgram != null) {
                    InfoloyaltyProgram.memberName = response.memberList[0].cust_full_name;
                    InfoloyaltyProgram.gender = response.memberList[0].gender;
                    InfoloyaltyProgram.tglLahir = response.memberList[0].date_of_birth;
                    InfoloyaltyProgram.ktpNumber = response.memberList[0].id_no;
                    InfoloyaltyProgram.hpNumber = response.memberList[0].phone_no_1;
                    InfoloyaltyProgram.email = response.memberList[0].email;
                    InfoloyaltyProgram.beginningPoints = response.memberList[0].prev_point;
                    InfoloyaltyProgram.earnedPoint = "0";
                    InfoloyaltyProgram.balancePoint = response.memberList[0].current_point;
                }
                $("#invInqRsp").html('');
                //$("#regTrNumLoyalty-dialog").dialog("close");
                $("#custInfoLoyalInquiry-dialog").dialog("open");
            }
        },
        error: function () {
            uilog('DBUG', 'call Inquiry');
        }
    });
}
var otpMsg;
var resendClick = 0;
$('#resendOtp').click(function () {
    resendClick += 1;
    var type = "get_otp";
    var storeCode = configuration.storeCode;
    var hpNumber = redeemProgram.hpNumber;
    var progCode = $('input[name=redEvent]:checked').val();
    //var progCode = $("#valRedProgName").val();
    servicesOtpCode(type, hpNumber, storeCode, progCode);
    alert(otpMsg);
});

function servicesOtpCode(type, hpNumber, storeCode, progCode) {
    var data = {
        type: type,
        hpNumber: hpNumber,
        storeCode: storeCode,
        progCode: progCode
    }
    data = JSON.stringify(data);
    console.log("post data " + data);
    $.ajax({
        type: 'POST',
        url: posWebContextPath + '/cashier/loyalty/process',
        async: false,
        contentType: "application/json",
        data: data,
        timeout: 30000,
        success: function (response) {
            console.log("Test : " + JSON.stringify(response));
            if (response.rspCode == "00") {
                oriOTPCode = response.otpCode;
                otpMsg = response.msg;
            }
        },
        error: function () {
            uilog('DBUG', 'call otp');
        }
    });
}

function loyaltyServicesRedeem(dataBody, type, programCode, redeemPoint, programGiftCodeReqQty) {
    var data = {
        type: type,
        hpNumber: dataBody.phoneNum,
        storeCode: dataBody.storeCode,
        gender: dataBody.gender,
        tglLahir: dataBody.tglLahir,
        ktpNumber: dataBody.ktpNumber,
        email: dataBody.email,
        userName: dataBody.userName,
        balancePoint: dataBody.balancePoint,
        storeName: dataBody.storeName,
        programCode: programCode,
        redeemPoint: redeemPoint,
        programGiftCodeReqQty: programGiftCodeReqQty
    }
    data = JSON.stringify(data);
    console.log("post data " + data);
    $.ajax({
        type: 'POST',
        url: posWebContextPath + '/cashier/loyalty/process',
        async: false,
        contentType: "application/json",
        data: data,
        timeout: 30000,
        success: function (response) {
            //alert("success" + response);
            console.log("Test : " + JSON.stringify(response));

            if (response.rspCode == "00") {
                if (type == "inquiry") {
                    if (redeemProgram != null) {
                        redeemProgram.memberName = response.memberList[0].cust_full_name;
                        redeemProgram.ktpNumber = response.memberList[0].id_no;
                        redeemProgram.hpNumber = response.memberList[0].phone_no_1;
                        redeemProgram.email = response.memberList[0].email;
                        redeemProgram.beginningPoints = response.memberList[0].prev_point;
                        redeemProgram.earnedPoint = "0";
                        redeemProgram.balancePoint = response.memberList[0].current_point;
                        redeemProgram.gender = response.memberList[0].gender;
                        redeemProgram.tglLahir = response.memberList[0].date_of_birth;
                    }
                    var RedProg = response.eventList;
                    $("#valRedProgName").html('');
                    for (i in RedProg) {
                        var redCodeProgram = RedProg[i].prog_code;
                        var redNameProgram = RedProg[i].event_name;
                        //var selOption = $('<option value="'+redCodeProgram+'">').html(redNameProgram);
                        var selOption = $('<tr>').append($('<td style="width=90%;">')
                            .append($('<label for="optProg_' + redCodeProgram + '">' + redNameProgram + '</label></td>')))
                            .append($('<td>').append($('<input type="radio" style="width:10%;" id="optProg_' + redCodeProgram + '" name="redEvent" value="' + redCodeProgram + '" /></td>')))
                            .append($('</tr>'));
                        $("#valRedProgName").append(selOption);
                    }
                    $("#generateRewardLoyalty-dialog").dialog("open");
                } else if (type == "redeem") {
                    console.log("Redeem Sum");
                    console.log(redeemPoint);
                    redeemProgram.balancePoint = response.memberList[0].current_point;
                    redeemProgram.rdmMsgA = response.rdmHdrMsg1;
                    redeemProgram.rdmMsgB = response.rdmHdrMsg2;
                    redeemProgram.rdmMsg1 = response.rdmMsg1;
                    redeemProgram.rdmMsg2 = response.rdmMsg2;
                    redeemProgram.rdmMsg3 = response.rdmMsg3;
                    redeemProgram.rdmMsg4 = response.rdmMsg4;
                    redeemProgram.rdmMsg5 = response.rdmMsg5;
                    redeemProgram.progName = response.progName;
                    console.log("Ke Print Redeem");
                    printReceipt({
                        header: setReceiptHeader(saleTx),
                        body: setReceiptRedeemLoyalty(redeemProgram),
                        footer: setReceiptFooterRegLoyalty()
                    });
                    clearOrder();
                    createOrder();
                    $("#loyaltyProg-dialog").dialog("close");
                    $("#redeemLoyaltyProg-dialog").dialog("close");
                    $("#generateRewardLoyalty-dialog").dialog("close");
                    $("#genRewardsPointInfo-dialog").dialog("close");
                } else if (type == "pre_redeem") {
                    gift = response.rewardList;
                    giftStock = response.displayStock;
                    oriOTPCode = response.otpCode;
                    $("#invInqRsp").html('');
                    $("#genRewardsPointInfo-dialog").dialog("open");
                } else {
                    $("#invInqRsp").html('');
                    $("#generateRewardLoyalty-dialog").dialog("open");
                }

            } else {
                console.log(response.rspCode);
                $("#invRedeemPhone").html(response.msg);
                saveFlag = false;
                emptyGift = response.msg;
                alert(response.msg);
            }
        },
        error: function () {
            uilog('DBUG', 'call Inquiry Redeem');
        }
    });
}

function loyaltyServiceValidate(dataBody, type, progCode) {
    var data = {
        type: type,
        trNumber: dataBody,
        progCode: progCode
    }
    data = JSON.stringify(data);
    console.log("trnumber data : " + data);
    $.ajax({
        type: 'POST',
        url: posWebContextPath + '/cashier/loyalty/process',
        async: false,
        contentType: "application/json",
        data: data,
        timeout: 30000,
        success: function (response) {
            //alert("success" + response);
            console.log("Test Rafi : " + JSON.stringify(response));
            if (response.rspCode != "00") {
                trNumberPoint = "";
                alert(response.msg);
                trNumberFlag = false;
            } else {
                trNumberFlag = true;
                trNumberPoint = response.trInfo[0].no_reward;
                loyaltyProgram.trNumberPoint = trNumberPoint;
                trEventId = response.trInfo[0].promo_id;
                loyaltyProgram.trEventId = trEventId;
            }
        },
        error: function () {
            uilog('DBUG', 'call Inquiry');
        }
    });
}

function loyaltyServiceValidateManual(dataBody, type, progCode) {
    var data = {
        type: type,
        trNumber: dataBody,
        progCode: progCode
    }
    data = JSON.stringify(data);
    console.log("trnumber data : " + data);
    $.ajax({
        type: 'POST',
        url: posWebContextPath + '/cashier/loyalty/process',
        async: false,
        contentType: "application/json",
        data: data,
        timeout: 6000,
        success: function (response) {
            //alert("success" + response);
            console.log("Test Rafi : " + JSON.stringify(response));
            if (response.rspCode == "999") {
                UnpTrNumberPoint = "0";
                message = "Transaction Number Tidak Ditemukan <br/>Ingin lanjutkan ?";

                console.log("message " + response.msg);
                $("#validate-dialog").dialog("open");
            } else if (response.rspCode == "00") {
                trNumberFlag = true;
                var no = 1;
                unpClick += no;
                unpTrEventId = response.trInfo[0].promo_id;
                UnpTrNumberPoint = response.trInfo[0].no_reward;
                console.log("UnpTr" + unpTrEventId + " " + UnpTrNumberPoint);
            } else {
                alert(response.msg);
            }

        },
        error: function () {
            uilog('DBUG', 'call Inquiry');
            message = "POSS OFFLINE";
            $("#validate-dialog").dialog("open");
        }
    });
}

function loyaltyServicesManual(dataBody, type) {
    var data = {
        type: type,
        hpNumber: dataBody.hpNumber,
        trNumber: dataBody.trNumber,
        storeCode: dataBody.storeCode
    }
    data = JSON.stringify(data);
    $.ajax({
        type: 'POST',
        url: posWebContextPath + '/cashier/loyalty/process',
        async: false,
        contentType: "application/json",
        data: data,
        timeout: 30000,
        success: function (response) {
            //alert("success" + response);
            console.log("Test Rafi : " + JSON.stringify(response));
            if (response.rspCode != "00") {
                console.log(response.rspCode);
                $("#unpPhone").html(response.msg);
                saveFlag = false;
            } else {
                if (unpointProgram != null) {
                    unpointProgram.memberName = response.memberList[0].cust_full_name;
                    unpointProgram.ktpNumber = response.memberList[0].id_no;
                    unpointProgram.hpNumber = response.memberList[0].phone_no_1;
                    unpointProgram.email = response.memberList[0].email;
                    unpointProgram.beginningPoints = response.memberList[0].prev_point;
                    unpointProgram.earnedPoint = "0";
                    unpointProgram.balancePoint = response.memberList[0].current_point;

                    var unpProg = response.eventList;
                    $("#valUnpProgName").html('');
                    for (i in unpProg) {
                        var unpCodeProgram = unpProg[i].prog_code;
                        var unpMaxRewardProgram = unpProg[i].max_reward;
                        var unpnameProgram = unpProg[i].event_name;
                        //var selOption = $('<option value="'+unpCodeProgram+"-"+unpMaxRewardProgram+"-"+unpnameProgram+'">').html(unpnameProgram);
                        var selOption = $('<tr>').append($('<td style="width=90%;">')
                            .append($('<label for="optProg_' + unpCodeProgram + '">' + unpnameProgram + '</label></td>')))
                            .append($('<td>').append($('<input type="radio" style="width:10%;" id="optProg_' + unpCodeProgram + '" name="groupEvent" value="' + unpCodeProgram + "-" + unpMaxRewardProgram + "-" + unpnameProgram + '" /></td>')))
                            .append($('</tr>'));
                        $("#valUnpProgName").append(selOption);
                    }
                }
                $("#unpPhone").html('');
                $("#custUnpointLoyalInquiry-dialog").dialog("open");
            }
        },
        error: function () {
            uilog('DBUG', 'call Inquiry manual');
        }
    });
}

function loyaltyServicesManualSave(dataBody, type, programCode, storeCode, storeName, userName) {
    var data = {
        type: type,
        hpNumber: dataBody.hpNumber,
        trNumber: dataBody.trNumber,
        programCode: programCode,
        storeCode: storeCode,
        storeName: storeName,
        userName: userName
    }
    data = JSON.stringify(data);
    uilog('DBUG', 'call earn manual save : ' + data);
    $.ajax({
        type: 'POST',
        url: posWebContextPath + '/cashier/loyalty/process',
        async: false,
        contentType: "application/json",
        data: data,
        timeout: 30000,
        success: function (response) {
            //alert("success" + response);
            console.log("Test Rafi : " + JSON.stringify(response));
            if (response.rspCode == "00") {
                unpointProgram.balancePoint = response.memberList[0].current_point;
            }
        },
        error: function () {
            uilog('DBUG', 'call earn manual save' + data);
        }
    });
}

function loyaltyRegServices(dataBody, type) {
    var data = {
        type: type,
        //dataIni : dataBody
        progName: dataBody.progName,
        memberName: dataBody.memberName,
        gender: dataBody.gender,
        tglLahir: dataBody.tglLahir,
        address: dataBody.address,
        ktpNumber: dataBody.ktpNumber,
        hpNumber: dataBody.hpNumber,
        email: dataBody.email,
        userName: dataBody.userName,
        storeCode: dataBody.storeCode,
        trNumber: dataBody.trNumber,
        eventId: dataBody.eventId
    }
    data = JSON.stringify(data);
    console.log("Test data : " + data);
    $.ajax({
        type: 'POST',
        url: posWebContextPath + '/cashier/loyalty/process',
        async: false,
        contentType: "application/json",
        data: data,
        timeout: 30000,
        success: function (response) {
            //alert("success" + response);
            console.log("Test Rafi : " + JSON.stringify(response));

            if (response.rspCode != "00") {
                alert(response.msg);
            } else {
                console.log("loyaltyProgram : " + response.memberList);
                console.log(response.memberList);

                var balancePoint = response.memberList[0].current_point;
                console.log("balancePoint : " + balancePoint);

                loyaltyProgram.balancePoint = response.memberList[0].current_point;
                loyaltyProgram.regMsg1 = response.regMsg1;
                loyaltyProgram.regMsg2 = response.regMsg2;
                loyaltyProgram.regMsg3 = response.regMsg3;
                loyaltyProgram.regMsg4 = response.regMsg4;
                loyaltyProgram.regMsg5 = response.regMsg5;
                printReceipt({
                    header: setReceiptHeader(saleTx),
                    body: setReceiptRegLoyalty(loyaltyProgram),
                    footer: setReceiptFooterRegLoyalty()
                });
                clearOrder();
                createOrder();
                $("#regTrNumLoyalty-dialog").dialog("close");
                $("#registerLoyaltyProg-dialog").dialog("close");
                $("#loyaltyProg-dialog").dialog("close");
                $("#unpNotReg-dialog").dialog("close");
                $("#vipNotReg-dialog").dialog("close");
            }
        },
        error: function () {
            uilog('DBUG', 'call Register');
        }
    });
}

function earnRegServices(type, dataBody) {
    var data = {
        type: type,
        progName: dataBody.progName,
        memberName: dataBody.memberName,
        ktpNumber: dataBody.ktpNumber,
        hpNumber: dataBody.hpNumber,
        email: dataBody.email,
        userName: dataBody.userName,
        storeCode: dataBody.storeCode
    }
    data = JSON.stringify(data);
    console.log("Test data : " + data);
    $.ajax({
        type: 'POST',
        url: posWebContextPath + '/cashier/loyalty/process',
        async: false,
        contentType: "application/json",
        data: data,
        timeout: 30000,
        success: function (response) {
            if (response.rspCode == "00") {
                console.log("Test Rafi : " + JSON.stringify(response));
                $("#registerEarnLoyaltyProg-dialog").dialog("close");
                $("#unpNotReg-dialog").dialog("close");
                promptSysMsg(getMsgValue('pos_label_member_id_is_active'), getMsgValue('pos_label_employee_loyalty_card'));
                $("#inputDisplay").val("");
                renderCustomerInfo(response.memberList[0].cust_full_name, response.memberList[0].phone_no_1);
                saleTx.customerId = dataBody.hpNumber;
                saleTx.isLoyalty = true;
                customerIdForReward = dataBody.hpNumber;
                empLoyaltyPointsAvail = true;
                console.log("customer sale tx" + saleTx.customerId);
                InfoloyaltyProgram = {
                    memberName: response.memberList[0].cust_full_name,
                    hpNumber: response.memberList[0].phone_no_1,
                    beginningPoints: response.memberList[0].prev_point,
                    earnedPoint: response.memberList[0].earnedPoint,
                    balancePoint: response.memberList[0].current_point,
                    email: response.memberList[0].email
                }
            } else {
                alert(response.msg);
            }
        },
        error: function () {
            uilog('DBUG', 'call Register Earn');
        }
    });
}
var noHpReg;
$("#unpNotReg-dialog").dialog({
    width: 300,
    height: 250,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    dialogClass: "no-close",
    closeOnEscape: false,
    open: function (event, ui) {
        $("#inputDisplay").val("");
        var message = getMsgValue("pos_label_no_mobile_no_found") + " " + noHpReg;
        $("#unpNotRegNo").html(message);
    },
    buttons: {
        CANCEL: function () {
            promptSysMsg();
            loyEarnPointsSelected = false;
            printTo = "P";
            $(this).dialog("close");
        },
        REGISTER: function () {
            console.log("Masuk unpNotReg");
            //$("#registerLoyaltyProg-dialog").dialog("open");
            var type = "get_event";
            var storeCode = configuration.storeCode;
            // printTo = "P";
            getEarnEventServices(type, storeCode);
        }
    }
});
var vipMemberErr;
$("#vipNotReg-dialog").dialog({
    width: 300,
    height: 250,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    dialogClass: "no-close",
    closeOnEscape: false,
    open: function (event, ui) {
        $("#inputDisplay").val("");
        var message = vipMemberErr;
        $("#vipNotRegNo").html(message);
    },
    buttons: {
        OK: function () {
            promptSysMsg();
            loyVIPThemeParkSelected = false;
            printTo = "P";
            $(this).dialog("close");
        }
    }
});

$("#noPPP-dialog").dialog({
    width: 300,
    height: 200,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    dialogClass: "no-close",
    closeOnEscape: false,
    open: function (event, ui) {
        $("#inputDisplay").val("");
        var message = getMsgValue("pos_label_no_scanned_items_in_pppp");
        $("#noPPPMessage").html(message);
    },
    buttons: {
        OK: function () {
            // loyEarnPointsSelected = false;
            $(this).dialog("close");
        }
    }
});

var message;
$("#validate-dialog").dialog({
    width: 300,
    height: 250,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    dialogClass: "no-close",
    closeOnEscape: false,
    open: function (event, ui) {
        $("#validateRegNo").html(message);
    },
    buttons: {
        CANCEL: function () {
            trNumberFlag = false;
            console.log("trNumberFlag false" + trNumberFlag);
            $(this).dialog("close");
        }
        // ,
        // LANJUTKAN: function() {
        //     var no = 1;
        //     trNumberFlag = true;
        //     console.log("trNumberFlag true" + trNumberFlag);

        //     var tt = $('<tr>');
        //     //var progName = $("#valUnpProgName").val();
        //     var progName = $('input[name=groupEvent]:checked').val();
        //     console.log("unpClick" + unpClick);
        //     console.log("trNumberFlag" + trNumberFlag);
        //     unpClick += no;
        //     tt.append($('<td>').append($('<input id="chk' + unpClick + '" type="checkBox" style="margin-top: -5px !important;">')));
        //     tt.append($('<td>').append($('<input readonly id="UnpValTrNumber' + unpClick + '" value="' + UnpTrNumberVal + '" style="width:160px !important;">')));
        //     tt.append($('<td>').append($('<input id="UnpValTrPoint' + unpClick + '" value="' + UnpTrNumberPoint + '" style="width:70px !important;">')));
        //     tt.append($('<td>').append($('<input type="hidden" id="UnpValTrEvenId' + unpClick + '" value="-" style="width:70px !important;">')));
        //     $("#unpTableBody").append(tt);
        //     $("#unpTrNumber").val('');
        //     $("#UnpValTrPoint" + unpClick).keyboard({
        //         display: numberDisplay1,
        //         layout: 'custom',
        //         customLayout: customNumberLayout1,
        //         visible: function(e, keyboard, el) {
        //             addClickHandler(keyboard);
        //         }
        //     });
        //     trNumberFlag = false;

        //     $("#unpTrNumber").val("");
        //     $(this).dialog("close");

        //     // var type="validate_tr";
        //     // loyaltyServiceValidateManual(type, UnpTrNumberVal);
        // }
    }
});

function earnLoyaltPoint(dataBody) {
    var type = "inquiry";
    var data = {
        type: type,
        hpNumber: dataBody.hpNumber
    }
    data = JSON.stringify(data);
    console.log("Test data : " + data);
    $.ajax({
        type: 'POST',
        url: posWebContextPath + '/cashier/loyalty/process',
        async: false,
        contentType: "application/json",
        data: data,
        timeout: 30000,
        success: function (response) {
            //alert("success" + response);
            console.log("Test : " + JSON.stringify(response));
            if (response.rspCode == "997") {
                noHpReg = dataBody.hpNumber;
                console.log("noHpReg");
                console.log(noHpReg);
                $("#unpNotReg-dialog").dialog("open");
            } else if (response.rspCode == "00") {
                promptSysMsg(getMsgValue('pos_label_member_id_is_active'), getMsgValue('pos_label_employee_loyalty_card'));
                $("#inputDisplay").val("");
                renderCustomerInfo(response.memberList[0].cust_full_name, response.memberList[0].phone_no_1);
                saleTx.customerId = dataBody.hpNumber;
                saleTx.isLoyalty = true;
                customerIdForReward = dataBody.hpNumber;
                empLoyaltyPointsAvail = true;
                profitCodes = response.memberList[0].promo_codes;
                console.log("customer sale tx inq earn / dr : " + saleTx.customerId);

                InfoloyaltyProgram = {
                    memberName: response.memberList[0].cust_full_name,
                    hpNumber: response.memberList[0].phone_no_1,
                    beginningPoints: response.memberList[0].prev_point,
                    earnedPoint: response.memberList[0].earnedPoint,
                    balancePoint: response.memberList[0].current_point,
                    email: response.memberList[0].email
                };
                if (printTo == "E") {
                    if (response.memberList[0].email == "") {
                        $("#custLoyalty_mail_upd-dialog").dialog("open");
                        // printTo = "P";
                    } else {
                        $("#custLoyalty_mail_info-dialog").dialog("open");
                    }
                }
                console.log("test data InfoloyaltyProgram" + InfoloyaltyProgram);
            } else {
                promptSysMsg();
                $("#inputDisplay").val("");
                loyEarnPointsSelected = false;
                alert(response.msg);
            }
        },
        error: function () {
            uilog('DBUG', 'call earnLoyaltPoint');
        }
    });
}

function getVIPTicket(dataBody) {
    var type = "vipticketinquiry";
    var now = new Date();
    var timeStamp = now.getTime() - now.getTimezoneOffset() * 60000;
    timeStamp = (timeStamp - (timeStamp % 1000)) / 1000;
    var hashedVal = $.md5('ITSonsonyo.urbreak!Butyou$aredying' + timeStamp, null, true).toString().toUpperCase();
    var data = {
        url: getConfigValue('VIP_THEMEPARK_INQUIRY'),
        type: type,
        Sign: hashedVal,
        TimeStamp: timeStamp.toString(),
        sbarcode: dataBody.ticketNo.toString()
    };
    data = JSON.stringify(data);
    console.log("Test data : " + data);
    $.ajax({
        type: 'POST',
        url: posWebContextPath + '/cashier/loyalty/process',
        async: false,
        contentType: "application/json",
        data: data,
        timeout: 30000,
        success: function (response) {
            console.log("Test : " + JSON.stringify(response));
            if (response.IsTrue == false) {
                vipMemberErr = response.ResultMsg;
                console.log("vipMemberErr");
                console.log(vipMemberErr);
                $("#vipNotReg-dialog").dialog("open");
            } else if (response.IsTrue == true && response.ResultCode == "200") {
                promptSysMsg(getMsgValue('pos_label_member_id_is_active'), getMsgValue('pos_label_vip_themepark'));
                $("#inputDisplay").val("");
                renderCustomerInfo('VIP Member', response.ResultJson[0].sbarcode);
                saleTx.customerId = response.ResultJson[0].sbarcode; // sbarcode
                saleTx.isVIPThemePark = true;
                customerIdForReward = response.ResultJson[0].sbarcode; // sbarcode
                if (profitCodes === null) {
                    profitCodes = [];
                }
                if (profitCodes.indexOf(getConfigValue("THEME_PARK_PROMO_CODE")) === -1) {
                    profitCodes.push(getConfigValue("THEME_PARK_PROMO_CODE")); // ["M1"] for Testing
                }
                console.log("customer sale tx inq earn / dr : " + saleTx.customerId);
            } else {
                promptSysMsg();
                $("#inputDisplay").val("");
                loyVIPThemeParkSelected = false;
                alert(response.ResultMsg);
            }
        },
        error: function () {
            uilog('DBUG', 'call getVIPTicket');
        }
    });
}

function sendVIPRedeemTicket() {
    var type = "vipticketredeem";
    var sLoginName = "admin";
    var now = new Date();
    var timeStamp = now.getTime() - now.getTimezoneOffset() * 60000;
    timeStamp = (timeStamp - (timeStamp % 1000)) / 1000;
    var hashedVal = $.md5('ITSonsonyo.urbreak!Butyou$aredying' + timeStamp, null, true).toString().toUpperCase();
    var data = {
        url: getConfigValue('VIP_THEMEPARK_REDEEM'),
        type: type,
        Sign: hashedVal,
        TimeStamp: timeStamp.toString(),
        sbarcode: customerIdForReward,
        sLoginName: sLoginName.toString()
    };
    data = JSON.stringify(data);
    console.log("Test data : " + data);
    $.ajax({
        type: 'POST',
        url: posWebContextPath + '/cashier/loyalty/process',
        async: false,
        contentType: "application/json",
        data: data,
        timeout: 30000,
        success: function (response) {
            console.log("Test : " + JSON.stringify(response));
            if (response.IsTrue == false) {
                console.log("VIP Ticket Redeem Failed");
            } else if (response.IsTrue == true && response.ResultCode == "200") {
                console.log("VIP Ticket Redeem Success");
            } else {
                console.log("VIP Ticket Redeem Failedssss");
            }
        },
        error: function () {
            uilog('DBUG', 'call sendVIPRedeemTicket');
        }
    });
}

function earnLoyaltPointAfter(dataBody) {
    var type = "earn";
    var data = {
        userName: loggedInUsername,
        storeName: configuration.storeName,
        storeCode: configuration.storeCode,
        type: type,
        hpNumber: dataBody.hpNumber,
        trNumber: dataBody.trNumber,
        eventPromoId: dataBody.eventPromoId,
        eventPromoPoint: dataBody.eventPromoPoint
    }
    if (dataBody.pppPointRedeem === true) {
        data.pppPointRedeem = true;
    }
    data = JSON.stringify(data);
    console.log("Test data : " + data);
    $.ajax({
        type: 'POST',
        url: posWebContextPath + '/cashier/loyalty/process',
        async: false,
        contentType: "application/json",
        data: data,
        timeout: 30000,
        success: function (response) {
            //alert("success" + response);
            uilog('DBUG', 'earnLoyaltPointAfter : ' + JSON.stringify(response));
            console.log("Test earnLoyaltPointAfter: " + JSON.stringify(response));
            if (response.rspCode == "00") {
                if (JSON.parse(data)["pppPointRedeem"] !== true || JSON.parse(data)["pppPointRedeem"] === undefined) {
                    InfoloyaltyProgram = {
                        memberName: response.memberList[0].cust_full_name,
                        hpNumber: response.memberList[0].phone_no_1,
                        beginningPoints: response.memberList[0].prev_point,
                        earnedPoint: response.earnedPoint,
                        balancePoint: response.memberList[0].current_point,
                        email: response.memberList[0].email
                    }
                } else if (JSON.parse(data)["pppPointRedeem"] === true) {
                    InfoloyaltyProgram.balancePoint = response.memberList[0].current_point;
                }
                console.log("Test InfoloyaltyProgram : " + InfoloyaltyProgram);
                uilog('DBUG', 'earnLoyaltPointAfter  InfoloyaltyProgram: ' + JSON.stringify(InfoloyaltyProgram));
            }
        },
        error: function () {
            uilog('DBUG', 'call earnLoyaltPointAfter');
        }
    });
}
$("#loyalty-member-input-option").dialog({
    width: 400,
    height: 150,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    open: function (event, ui) {
        //
    }
});

$("#crm-member-input-option").dialog({
    width: 400,
    height: 150,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    open: function (event, ui) {
        $("#crmMsgSpan").empty();
        $("#crmCmdField").val("");
        $("#crmTrIdField").val("");
        $("#crmCmdDiv").show();
        $("#crmTxIdDiv").hide();
    }
});

$("#topUp-dialog").on("dialogclose", function (event, ui) {
    $("#tuMsgSpan").empty();
    $("#topUpCmdField").val("");
    $("#topUpTrIdField").val("");
    $("#topUpPNumField").val("");
});

$("#topUp-dialog").dialog({
    width: 400,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    open: function (event, ui) {
        var saleType = $("#topUp-dialog").data("saleType").toUpperCase();

        if (saleType == CONSTANTS.TX_TYPES.SALE.name) {
            $("#tuCmdDiv").show();
            $("#tuTxIdDiv").hide();
            $("#tuPNumDiv").hide();
        } else if (saleType == CONSTANTS.TX_TYPES.RETURN.name || saleType == CONSTANTS.TX_TYPES.REFUND.name) {
            $("#tuCmdDiv").hide();
            $("#tuTxIdDiv").show();
            $("#tuPNumDiv").hide();
        }
    }
});

$("#topUp-phoneNum-dialog").on("dialogclose", function (event, ui) {
    $("#stdSalePNumMsgSpan").empty();
    $("#stdSalePNumField").val("");
});

$("#topUp-phoneNum-dialog").dialog({
    width: 400,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        $("#stdSalePNumMsgSpan").empty();
        $("#stdSalePNumField").val("");
    },
    buttons: {
        Cancel: function () {
            clearInputDisplay();
            $(this).dialog("close");
        },
        OK: function () {
            var phoneNumber = $("#stdSalePNumField").val();
            if (phoneNumber == "" || !(phoneNumber.length >= Number(getConfigValue("TOPUP_MIN_PHONE_NUM_CHAR")) &&
                phoneNumber.length <= Number(getConfigValue("TOPUP_MAX_PHONE_NUM_CHAR")))) {
                $("#stdSalePNumMsgSpan").html("INVALID ENTRY");
            } else {
                $("#stdSalePNumMsgSpan").empty();

                ++scannedItemOrder;

                var prodObj = $(this).data("prodObj");

                var topUpItem = {
                    transactionId: saleTx.transactionId,
                    transactionType: "TOPUP",
                    refTxItemOrder: scannedItemOrder,
                    phoneNum: phoneNumber,
                    vType: prodObj.sku
                };

                // scan transactions start here
                if (!(saleTx.startDate))
                    saleTx.startDate = new Date();
                addScannedItem(prodObj);
                renderProductDetails(prodObj);
                // Item has been added cannot do CLEAR already.
                disableClrFn = true;
                topUpObj.topUpTxItems.push(topUpItem);
                renderScannedItem(saleTx.orderItems.last);
                renderTotal();
                refreshPromotion(false);
                enableCoBrand = false;
                clearInputDisplay();
                printScannedItem();
                $("#btnAddItem").empty();
                $(this).dialog("close");
            }
        }
    }
});

$("#indosmart-dialog").on("dialogclose", function (event, ui) {
    $("#indosmartMsgSpan").empty();
    $("#indosmartCmdField").val("");
    $("#indosmartTrIdField").val("");
    $("#indosmartPNumField").val("");
});

$("#indosmart-dialog").dialog({
    width: 400,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    open: function (event, ui) {
        var saleType = $("#indosmart-dialog").data("saleType").toUpperCase();

        if (saleType == CONSTANTS.TX_TYPES.SALE.name) {
            $("#indosmartCmdDiv").show();
            $("#indosmartTxIdDiv").hide();
            $("#indosmartPNumDiv").hide();
        } else if (saleType == CONSTANTS.TX_TYPES.RETURN.name || saleType == CONSTANTS.TX_TYPES.REFUND.name) {
            $("#indosmartCmdDiv").hide();
            $("#indosmartTxIdDiv").show();
            $("#indosmartPNumDiv").hide();
        }
    }
});

//CHECK PRICE DIALOG
$("#itemCheck-dialog").dialog({
    width: 400,
    height: 350,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        $("#inputItem").off("keypress");
        $("#itemBarcode").empty();
        $("#itemName").empty();
        $("#itemPrice").empty();
        $("#inputItem").val();
        $("#afterPrice").empty();
        $("#inputItem").keypress(function(e) {
            if (e.keyCode === 13) {
                $("#itemCheck-dialog").dialog("widget").find("button:contains('ENTER')").click();
                $("#inputItem").getkeyboard().close();
            }
        });
    },
    buttons: {
        CLOSE: function () {
            $(this).dialog("close");
            $("#inputItem").off("keypress");
            $("#itemBarcode").empty();
            $("#itemName").empty();
            $("#itemName").empty();
            $("#afterPrice").empty();
            $("#afterPrice").val('');
            CustomerPopupScreen.cus_closeCheckPrice();
        },
        ENTER: function () {
            var barcodeItemCheck = $("#inputItem").val();
            if ($("#inputItem").length != "") {
                if (barcodeItemCheck == "") {
                    var noEmpty = "Harap isi barcode!";
                    showMsgDialog(noEmpty, "alert");
                    $("#itemName").empty();
                    $("#itemPrice").empty();
                    $("#itemBarcode").empty();
                    $("#afterPrice").empty();
                    CustomerPopupScreen.cus_clearCheckPrice();
                } else {
                    console.log("Ini barcode : " + barcodeItemCheck);
                    var listItemFind = findItem(barcodeItemCheck);
                    if (listItemFind === null)  {
                        $("#itemName").empty();
                        $("#itemPrice").empty();
                        $("#itemBarcode").empty();
                        $("#afterPrice").empty();
                        $("#inputItem").getkeyboard().close();
                        $("#inputItem").val('');
                    }
                    console.log(listItemFind);
                    itemPromotionLength = listItemFind.promotions.length;
                    itemName = listItemFind.name;
                    itemPrice = listItemFind.currentPrice;
                    itemBarcode = listItemFind.ean13Code;
                    if (itemPromotionLength > 0) {
                        var promotionType = listItemFind.promotions.filter(function(promo) {
                        return promo.promotionType === "1";
                        });
                        // console.log("Filtered promotions: ", promotionType);
                    
                        if (promotionType.length > 0) {
                            promotionType.forEach(function (promo) {
                                if (promo.discountType === "1") {
                                console.log("Kode a: promoSellingPrice = " + promo.promoSellingPrice);
                                afterPrice = promo.promoSellingPrice;
                                } else if (promo.discountType === "2") {
                                    console.log("Kode a:  discount = " + promo.percentDiscount);
                                    discountPrice = promo.percentDiscount * listItemFind.currentPrice / 100;
                                    console.log(discountPrice)
                                    afterPrice = listItemFind.currentPrice - discountPrice;
                                } else if (promo.discountType === "3") {
                                    console.log("Kode a:  amount_off = " + promo.amountOff);
                                    afterPrice = listItemFind.currentPrice - promo.amountOff;
                                }
                            });
                        } else {
                        // Handle case where no promotionType === "1" is found
                        afterPrice = "-";
                        }
                    } else {
                        afterPrice = "-";
                    }
                    // var 
                    console.log(itemName);
                    $("#itemName").text(itemName);
                    $("#itemPrice").text(numberWithCommas(itemPrice));
                    $("#itemBarcode").text(itemBarcode);
                    $("#afterPrice").text(numberWithCommas(afterPrice));
                    $("#inputItem").val('');
                    var itemDetails = {
                        itemName: itemName,
                        itemPrice: numberWithCommas(itemPrice),
                        itemBarcode: itemBarcode,
                        afterPrice: numberWithCommas(afterPrice)
                    };
                    CustomerPopupScreen.cus_showCheckPrice(itemDetails);
                }
            } else {
                var noEmpty = "Harap isi barcode!";
                showMsgDialog(noEmpty, "alert");
                $("#itemName").empty();
                $("#itemPrice").empty();
                $("#itemBarcode").empty();
                $("#afterPrice").empty();
                CustomerPopupScreen.cus_clearCheckPrice();
            } 
        },
    }
});



//Allo Top Up 2022-08-12
$("#alloTopUp-dialog").dialog({
    width: 400,
    height: 250,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    open: function (event, ui) {
        var saleType = $("#alloTopUp-dialog").data("saleType").toUpperCase();

        if (saleType == CONSTANTS.TX_TYPES.SALE.name) {
            $("#alloTopUpCmdDiv").show();
        } else if (saleType == CONSTANTS.TX_TYPES.RETURN.name || saleType == CONSTANTS.TX_TYPES.REFUND.name) {
            $("#alloTopUpCmdDiv").hide();
        }
    },
    buttons: {
        ENTER: function () {
            if (connectionOnline && saleTx.orderItems.length < 1 && !saleTx.qrtts ) {
                var qrttstid = configuration["qrttstid"];
                var qrttsmid = configuration.properties["QRTTS_MID"];
                var qrValue = $("#alloTopUpCmdField").val();
                if(qrttstid && qrttsmid){
                    var resInquiryAlloTopup = inquiryAlloTopup(qrValue);
                    // var resInquiryAlloTopup = {
                    //     "rc": "00",
                    //     "rd": "Success",
                    //     "key_no": "1613403699708",
                    //     "amount": "100000",
                    //     "amount_type": "02",
                    //     "curr_code": "360",
                    //     "beneficiary_nns_code": "93600426", 
                    //     "beneficiary_name": "REZKY PRATOMO", 
                    //     "beneficiary_city": "JAKARTA", 
                    //     "account_no": "0100xxxxxx5311"
                    // }
                    if (resInquiryAlloTopup && resInquiryAlloTopup["rc"] == "00") {
                        var resAlloTopupItem = reqItemAlloTopup(resInquiryAlloTopup["amount"]);
                        if (resAlloTopupItem) {
                            resInquiryAlloTopup["eancode"] = resAlloTopupItem[1];
                            resInquiryAlloTopup["item_name"] = resAlloTopupItem[3];
                            $("#alloTopUpCmdField").val("");
                            $(this).dialog("close");
                            $("#alloTopupConfirmation-dialog").data("resInquiryAlloTopup", resInquiryAlloTopup).dialog("open");
                        }
                        else {
                            $("#alloTopUpCmdField").val("");
                            $(this).dialog("close");
                            showMsgDialog("Product Item Allo Topup Not Found", "warning");
                        }

                    }
                    else {
                        if (resInquiryAlloTopup) {
                            showMsgDialog("Inquiry: " + resInquiryAlloTopup["rc"] + " - " + resInquiryAlloTopup["rd"], "warning");
                            $("#alloTopUpCmdField").val("");
                            $(this).dialog("close");
                        }
                        else {
                            showMsgDialog("Inquiry Allo Topup Failed", "warning");
                            $("#alloTopUpCmdField").val("");
                            $(this).dialog("close");
                        }
                    }
                }else{
                    showMsgDialog("TID/MID Not Found", "warning");
                    $("#alloTopUpCmdField").val("");
                    $(this).dialog("close");
                }
                
            }
            else {
                showKeyNotAllowedMsg();
            }
        }
    }
});

//Allo Top Up 2022-08-12
$("#alloTopupConfirmation-dialog").dialog({
    width: 500,
    height: 400,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        var resInquiryAlloTopup = $("#alloTopupConfirmation-dialog").data("resInquiryAlloTopup");
        displayInquiryAlloTopup(resInquiryAlloTopup);
    },
    buttons: {
        CANCEL: function () {
            $(this).dialog("close");
        },
        "CHECK STATUS": function () {
            var alloTopupKeyNo = $("#alloTopupKeyNo").text();
            var resCheckPaymentAlloTopup = checkPaymentAlloTopup(alloTopupKeyNo);
            // var resCheckPaymentAlloTopup = {
            //     "rc": "00",
            //     "rd": "Success",
            //     "key_no": "1613403699708",
            //     "amount": "1500000",
            //     "curr_code": "360",
            //     "beneficiary_pan": "9360042611522410292", 
            //     "beneficiary_nns_name": "Bank Mega", 
            //     "beneficiary_name": "REZKY PRATOMO", 
            //     "beneficiary_city": "JAKARTA", 
            //     "sender_pan": "9360042610123456789", 
            //     "rrn": "559593525856",
            //     "approval_code": "311604", 
            //     "invoice_number": "22417345392241734539", 
            //     "account_no": "010010020055311", 
            //     "datetime": "2021-02-15 22:42:01"
            // }

            if (resCheckPaymentAlloTopup) {
                if(resCheckPaymentAlloTopup["rc"] == "00"){
                    $("#alloTopUpCheck-dialog").data("resCheckPaymentAlloTopup", resCheckPaymentAlloTopup).dialog("open");
                }else{
                    showMsgDialog("Check Status: " + resCheckPaymentAlloTopup["rc"] + " - " + resCheckPaymentAlloTopup["rd"], "warning");    
                }
                
            }
            else {
                showMsgDialog("Check Status Failed", "warning");
            }
        },
        SUBMIT: function () {
            if (connectionOnline) {
                var alloTopupKeyNo = $("#alloTopupKeyNo").text();
                var alloTopupBarcode = $("#alloTopupBarcode").text();
                var alloTopupCustomerId = $("#alloTopupCustomerId").text();
                var alloTopupAmount = $("#alloTopupAmount").text();
                var alloAccountNo = $("#alloAccountNo").text();

                //proses first 
                var resPaymentAlloTopupSuccess = paymentAlloTopup(alloTopupKeyNo);
                // var resPaymentAlloTopupSuccess = {
                //     "rc": "00",
                //     "rd": "Success",
                //     "key_no": "1613403699708",
                //     "amount": "1500000",
                //     "curr_code": "360",
                //     "beneficiary_pan": "9360042611522410292", 
                //     "beneficiary_nns_name": "Bank Mega", 
                //     "beneficiary_name": "REZKY PRATOMO", 
                //     "beneficiary_city": "JAKARTA", 
                //     "sender_pan": "9360042610123456789", 
                //     "rrn": "559593525856",
                //     "approval_code": "311604", 
                //     "invoice_number": "22417345392241734539", 
                //     "account_no": "010010020055311", 
                //     "datetime": "2021-02-15 22:41:52",
                // }
                if (resPaymentAlloTopupSuccess) {
                    if (resPaymentAlloTopupSuccess["rc"] == "00") {
                        saleTx.customerId = resPaymentAlloTopupSuccess["account_no"];
                        saleTx.qrtts = {
                            keyNo: alloTopupKeyNo,
                            customerId: alloTopupCustomerId,
                            topupAmount: alloTopupAmount,
                            rd: resPaymentAlloTopupSuccess["rd"],
                            accountNumber: resPaymentAlloTopupSuccess["account_no"],
                            approvalCode: resPaymentAlloTopupSuccess["approval_code"],
                            benefitCity: resPaymentAlloTopupSuccess["beneficiary_city"],
                            benefitName: resPaymentAlloTopupSuccess["beneficiary_name"],
                            benefitNnsName: resPaymentAlloTopupSuccess["beneficiary_nns_name"],
                            benefitPan: resPaymentAlloTopupSuccess["beneficiary_pan"],
                            invoiceNumber: resPaymentAlloTopupSuccess["invoice_number"],
                            rrn: resPaymentAlloTopupSuccess["rrn"],
                            senderPan: resPaymentAlloTopupSuccess["sender_pan"],
                            currCode: resPaymentAlloTopupSuccess["curr_code"],
                            transactionType: 'ALLO_TOPUP',
                        };

                        showMsgDialog("Payment Allo Topup Success", "");
                        processSaleScan(alloTopupBarcode);
                        $(this).dialog("close");
                    } else {
                        showMsgDialog("Payment: " + resPaymentAlloTopupSuccess["rc"] + " - " + resPaymentAlloTopupSuccess["rd"], "warning");
                    }
                } else {
                    showMsgDialog("Payment Allo Topup Failed", "warning");
                }
                
            }
            else {
                showKeyNotAllowedMsg();
            }
        }
    }
});

$("#alloTopUpCheck-dialog").dialog({
    width: 400,
    height: 350,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    open: function (event, ui) {
        var resCheckPaymentAlloTopup = $("#alloTopUpCheck-dialog").data("resCheckPaymentAlloTopup");
        displayCheckAlloTopup(resCheckPaymentAlloTopup);
    }
});

$("#indosmart-phoneNum-dialog").on("dialogclose", function (event, ui) {
    $("#indosmartStdSalePNumMsgSpan").empty();
    $("#indosmartStdSalePNumField").val("");
});

$("#indosmart-phoneNum-dialog").dialog({
    width: 400,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        $("#indosmartStdSalePNumMsgSpan").empty();
        $("#indosmartStdSalePNumField").val("");
        
    },
    buttons: {
        Cancel: function () {
            clearInputDisplay();
            $(this).dialog("close");
        },
        OK: function () {
            var phoneNumber = $("#indosmartStdSalePNumField").val();
            console.log(getConfigValue("INDOSMART_MIN_PHONE_NUM_CHAR"));
            console.log(getConfigValue("INDOSMART_MAX_PHONE_NUM_CHAR"));
            if (phoneNumber == "" || !(phoneNumber.length >= 1 &&
                phoneNumber.length <= 32)) {
                $("#indosmartStdSalePNumMsgSpan").html("INVALID ENTRY");
            } else {
                $("#indosmartStdSalePNumMsgSpan").empty();

                ++scannedItemOrder;

                var prodObj = $(this).data("prodObj");

                var indosmartItem = {
                    transactionId: saleTx.transactionId,
                    transactionType: "TOPUP",
                    refTxItemOrder: scannedItemOrder,
                    phoneNum: phoneNumber,
                    vType: prodObj.sku,
                    name: prodObj.description
                };

                // scan transactions start here
                if (!(saleTx.startDate))
                    saleTx.startDate = new Date();
                addScannedItem(prodObj);
                renderProductDetails(prodObj);
                // Item has been added cannot do CLEAR already.
                disableClrFn = true;
                indosmartObj.indosmartTxItems.push(indosmartItem);
                renderScannedItem(saleTx.orderItems.last);
                renderTotal();
                refreshPromotion(false);
                enableCoBrand = false;
                clearInputDisplay();
                printScannedItem();
                $("#btnAddItem").empty();
                $(this).dialog("close");
            }
        }
    }
});

$("#mCash-dialog").on("dialogclose", function (event, ui) {
    $("#mCashMsgSpan").empty();
    $("#mCashCmdField").val("");
    $("#mCashTrIdField").val("");
    $("#mCashBarcodeField").val("");
    $("#mCashPNumField").val("");
});

$("#mCash-dialog").dialog({
    width: 400,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    open: function (event, ui) {
        var saleType = $("#mCash-dialog").data("saleType").toUpperCase();

        if (saleType == CONSTANTS.TX_TYPES.SALE.name) {
            $("#mCashCmdDiv").show();
            $("#mCashBarcodeDiv").hide();
            $("#mCashTxIdDiv").hide();
            $("#mCashPNumDiv").hide();
        } else if (saleType == CONSTANTS.TX_TYPES.RETURN.name || saleType == CONSTANTS.TX_TYPES.REFUND.name) {
            $("#mCashCmdDiv").hide();
            $("#mCashBarcodeDiv").hide();
            $("#mCashTxIdDiv").show();
            $("#mCashPNumDiv").hide();
        }
    }
});

$("#grab-dialog").dialog({
    width: 430,
    height: 360,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        console.log("grabdialog open")

        var market = getConfigValue("MARKETPLACE")
        console.log("MARKETPLACE " + market);
        var market2 = market.split(";");
        $("#grabTypeDropdown").html('');
        for (i in market2) {
            var nameMarket = market2[i];
            var selOption = $('<option>').attr('value', nameMarket).text(nameMarket);
            selOption.css('padding', '10px');
            $("#grabTypeDropdown").append(selOption);
        }

    },
    buttons: {
        Cancel: function () {
            var detailsToPrint = {
                body: setReceiptItems(saleTx),
                summary: setReceiptSummary(saleTx),
                footerSummary: setReceiptFooterSummary(saleTx),
                footer: setReceiptFooter(saleTx)
            };
            printReceipt(detailsToPrint);
            clearOrder();
            createOrder();
            $('#grabItemTBody').empty();
            $(this).dialog("close");
        }
    }
});

$("#grabDetail-dialog").dialog({
    width: 700,
    height: 600,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        if (!grabItemsOrderIsValid) {
            var $widget = $(this).dialog("widget");
            $widget.find(".ui-dialog-buttonpane button:first").hide();
        }

    },
    buttons: {
        OK: function () {
            // for (var index = 0; index < saleTx.orderItems.length; index++) {
            //     var grabItem = findGrabItem(saleTx.orderItems[index].sku, grabDetailOrder.detail.items);
            //     var prcitemgrab = grabItem.price;
            //     var priceSubtotalgrab = grabItem.price * grabItem.quantity;
            //     saleTx.orderItems[index].quantity = grabItem.quantity;
            //     saleTx.orderItems[index].priceUnit = parseInt(prcitemgrab.toString().replace(/\d{2}$/, ''));
            //     saleTx.orderItems[index].priceSubtotal = parseInt(priceSubtotalgrab.toString().replace(/\d{2}$/, ''));
            // }
            //saleTx.totalTaxableAmount = parseInt(saleTx.totalTaxableAmount.toString().replace(/\d{2}$/, ''));
            //saleTx.totalAmount = grabDetailOrder.detail.price.subtotal.toString().replace(/\d{2}$/, '');
            var detailsToPrint = {
                body: setReceiptItems(saleTx),
                summary: setReceiptSummary(saleTx),
                footerSummary: setReceiptFooterSummary(saleTx),
                footer: setReceiptFooter(saleTx)
            };
            var grabTrIdField = $("#grabTrIdField").val();
            var grabTypeDropdown = $("#grabTypeDropdown").val();
            var colors = new PrintBlock(RECEIPT_POS_JUSTIFIED, setWrappedLineSummaryItem('ORDER ID:', grabTrIdField, ""));
            detailsToPrint.summary.splice(3, 0, colors)
            var grabTrIdField = $("#grabTrIdField").val();

            printReceipt(detailsToPrint);
            clearOrder();
            createOrder();
            $('#grabItemTBody').empty();
            $(this).dialog("close");
            updateStatusPosTerminalGrab('checkout', grabTrIdField, grabTypeDropdown)
            $("#grabTrIdField").val("");

        },
        Cancel: function () {

            var detailsToPrint = {
                body: setReceiptItems(saleTx),
                summary: setReceiptSummary(saleTx),
                footerSummary: setReceiptFooterSummary(saleTx),
                footer: setReceiptFooter(saleTx)
            };
            printReceipt(detailsToPrint);
            clearOrder();
            createOrder();
            $('#grabItemTBody').empty();
            $(this).dialog("close");
            grabItemsOrderIsValid = true;
            var $widget = $(this).dialog("widget");
            $widget.find(".ui-dialog-buttonpane button:first").show();

        }
    }
});

function updateStatusPosTerminalGrab(dataStatus, orderId, grabTypeDropdown) {
    var data = {
        posTerminalStatus: dataStatus
    }
    data = JSON.stringify(data);
    $.ajax({
        type: 'POST',
        url: posWebContextPath + '/cashier/grab/putPosTerminalStatus?orderId=' + orderId + '&grabType=' + grabTypeDropdown,
        async: false,
        contentType: "application/json",
        data: data,
        timeout: 30000,
        success: function (response) {
            console.log(response);
        },
        error: function (err) {
            console.log(err);
            uilog('DBUG', 'call Inquiry');
        }
    });
}

$("#mCash-phoneNum-dialog").on("dialogclose", function (event, ui) {
    $("#mCashStdSalePNumMsgSpan").empty();
    $("#mCashStdSalePNumField").val("");
});

$("#mCash-phoneNum-dialog").dialog({
    width: 400,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        $("#mCashStdSalePNumMsgSpan").empty();
        $("#mCashStdSalePNumField").val("");
    },
    buttons: {
        Cancel: function () {
            clearInputDisplay();
            $(this).dialog("close");
        },
        OK: function () {
            var phoneNumber = $("#mCashStdSalePNumField").val();
            if (phoneNumber == "" || !(phoneNumber.length >= 1 &&
                phoneNumber.length <= 32)) {
                $("#mCashStdSalePNumMsgSpan").html("INVALID ENTRY");
            } else {
                $("#mCashStdSalePNumMsgSpan").empty();

                ++scannedItemOrder;

                var prodObj = $(this).data("prodObj");

                var mCashItem = {
                    transactionId: saleTx.transactionId,
                    transactionType: "TOPUP",
                    refTxItemOrder: scannedItemOrder,
                    phoneNum: phoneNumber,
                    hp: phoneNumber,
                    vType: prodObj.sku,
                    // vType: 'TEST10K',
                    name: prodObj.description
                };

                // scan transactions start here
                if (!(saleTx.startDate))
                    saleTx.startDate = new Date();
                addScannedItem(prodObj);
                renderProductDetails(prodObj);
                // Item has been added cannot do CLEAR already.
                disableClrFn = true;
                mCashObj.mCashTxItems.push(mCashItem);
                renderScannedItem(saleTx.orderItems.last);
                renderTotal();
                refreshPromotion(false);
                enableCoBrand = false;
                clearInputDisplay();
                printScannedItem();
                $("#btnAddItem").empty();
                $(this).dialog("close");
            }
        }
    }
});

// ASURANSI
$("#asuransi-dialog").on("dialogclose", function(event, ui) {
    $("#asuransiMsgSpan").empty();
    $("#asuransiCmdField").val("");
    $("input#trxid.textBoxTR").val("");
    $("#asuransiTrIdField").val("");
    $("#asuransiBarcodeField").val("");
    $("#asuransiPNumField").val("");
});

$("#asuransi-dialog").dialog({
    width: 400,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: true,
    open: function(event, ui) {
        var saleType = $("#asuransi-dialog").data("saleType").toUpperCase();

        if (saleType == CONSTANTS.TX_TYPES.SALE.name) {
            $("#asuransiCmd").show();
            $("#asuransiBarcode").hide();
            $("#asuransiTxId").hide();
            $("#asuransiPNum").hide();
        } else if (saleType == CONSTANTS.TX_TYPES.RETURN.name || saleType == CONSTANTS.TX_TYPES.REFUND.name) {
            $("#asuransiCmd").hide();
            $("#asuransiBarcode").hide();
            $("#asuransiTxId").show();
            $("#asuransiPNum").hide();
        }
    }
});

$("#alterra-dialog").on("dialogclose", function (event, ui) {
    $("#alterraMsgSpan").empty();
    $("#alterraCmdField").val("");
    $("#alterraTrIdField").val("");
    $("#alterraBarcodeField").val("");
    $("#alterraPNumField").val("");
});

$("#alterra-dialog").dialog({
    width: 400,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    open: function (event, ui) {
        var saleType = $("#alterra-dialog").data("saleType").toUpperCase();

        if (saleType == CONSTANTS.TX_TYPES.SALE.name) {
            $("#alterraCmdDiv").show();
            $("#alterraBarcodeDiv").hide();
            $("#alterraTxIdDiv").hide();
            $("#alterraPNumDiv").hide();
        } else if (saleType == CONSTANTS.TX_TYPES.RETURN.name || saleType == CONSTANTS.TX_TYPES.REFUND.name) {
            $("#alterraCmdDiv").hide();
            $("#alterraBarcodeDiv").hide();
            $("#alterraTxIdDiv").show();
            $("#alterraPNumDiv").hide();
        }
    }
});

$("#alterra-phoneNum-dialog").on("dialogclose", function (event, ui) {
    $("#alterraStdSalePNumMsgSpan").empty();
    $("#alterraStdSalePNumField").val("");
});

$("#alterra-phoneNum-dialog").dialog({
    width: 400,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        $("#alterraStdSalePNumMsgSpan").empty();
        $("#alterraStdSalePNumField").val("");
    },
    buttons: {
        Cancel: function () {
            clearInputDisplay();
            $(this).dialog("close");
        },
        OK: function () {
            var phoneNumber = $("#alterraStdSalePNumField").val();
            if (phoneNumber == "" || !(phoneNumber.length >= 1 &&
                phoneNumber.length <= 32)) {
                $("#alterraStdSalePNumMsgSpan").html("INVALID ENTRY");
            } else {
                $("#alterraStdSalePNumMsgSpan").empty();

                ++scannedItemOrder;

                var prodObj = $(this).data("prodObj");

                var alterraItem = {
                    transactionId: saleTx.transactionId,
                    transactionType: "TOPUP",
                    refTxItemOrder: scannedItemOrder,
                    phoneNum: phoneNumber,
                    hp: phoneNumber,
                    vType: prodObj.sku,
                    // vType: 'TEST10K',
                    name: prodObj.description
                };

                // scan transactions start here
                if (!(saleTx.startDate))
                    saleTx.startDate = new Date();
                addScannedItem(prodObj);
                renderProductDetails(prodObj);
                // Item has been added cannot do CLEAR already.
                disableClrFn = true;
                alterraObj.alterraTxItems.push(alterraItem);
                renderScannedItem(saleTx.orderItems.last);
                renderTotal();
                refreshPromotion(false);
                enableCoBrand = false;
                clearInputDisplay();
                printScannedItem();
                $("#btnAddItem").empty();
                $(this).dialog("close");
            }
        }
    }
});

/**
 * GiftCard Input Dialog
 */
$("#giftcard-input-dialog").on("dialogclose", function (event, ui) {
    $("#giftcardInputField").val("");
    $("#giftcardStatus").empty();
    clearInputDisplay();
    //	GIFTCARD_MMS.endGCMMSTransaction();
    lockKeyboard = false;
    if (GIFTCARDObject)
        clearGiftCardTransaction();
});
$("#evoucher-input-dialog").on("dialogclose", function (event, ui) {
    $("#eVoucherGiftCard").val("");
    $("#giftcardStatus1").empty();
    clearInputDisplay();
    //	GIFTCARD_MMS.endGCMMSTransaction();

    if (GIFTCARDObject)
        clearGiftCardTransaction();
});

$("#giftcard-input-dialog").dialog({
    width: 400,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        if (isGcMmsActivation || isGcMmsInquiry || isGcMmsRedemption) {
            $("#giftcardInputField").val("");
        }
    },
    buttons: {
        Cancel: function () {
            // DEBUG ROUNDING AMOUNT
            if (saleTx && saleTx.memberDiscReversal && saleTx.memberDiscReversal != 0 && saleTx.roundingAmount) {
                saleTx.totalDiscount += saleTx.roundingAmount;
                saleTx.totalChange += saleTx.roundingAmount;
                // Fix by Rahmat, 2019 Feb 13
                saleTx.totalAmount = saleTx.totalAmount + saleTx.roundingAmount;
            }
            $(this).dialog("close");
        },
        OK: function () {
            $("#giftcardStatus").html("");
            var giftCardNumber = $("#giftcardInputField").val();

            if (giftCardNumber == "") {
                //$("#giftcardInputField").val("");
                $("#giftcardStatus").html(getMsgValue("giftcard_msg_invalid_card_number"));
            } else {
                // (before) if (isGcMmsActivation || isGcMmsRedemption || isGcMmsInquiry) {
                if (GIFTCARD_MMS.isGiftCardMMS) {
                    GIFTCARD_MMS.processGiftCardMMSCardNumber(giftCardNumber);
                    giftNumber = giftCardNumber;
                } else {
                    processGiftCardRequest(giftCardNumber);
                }
            }
        }
    }
});
$("#evoucher-input-dialog").dialog({
    width: 400,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        if (isGcMmsActivation || isGcMmsInquiry || isGcMmsRedemption) {
            $("#eVoucherGiftCard").val("");
        }
    },
    buttons: {
        Cancel: function () {
            // DEBUG ROUNDING AMOUNT
            if (saleTx && saleTx.memberDiscReversal && saleTx.memberDiscReversal != 0 && saleTx.roundingAmount) {
                saleTx.totalDiscount += saleTx.roundingAmount;
                saleTx.totalChange += saleTx.roundingAmount;
            }
            isEVoucherGiftCard = false;
            $(this).dialog("close");
        },
        OK: function () {
            //$("#giftcardStatus").html("");
            var giftCardNumber = $("#eVoucherGiftCard").val();

            if (giftCardNumber == "") {
                //$("#giftcardInputField").val("");
                console.log("inputan kosong");
                $("#giftcardStatus1").html(getMsgValue("giftcard_msg_invalid_card_number"));
            } else {
                //console.log("inputan terisi");
                // (before) if (isGcMmsActivation || isGcMmsRedemption || isGcMmsInquiry) {
                if (GIFTCARD_MMS.isGiftCardMMS) {
                    GIFTCARD_MMS.processGiftCardMMSCardNumber(giftCardNumber);
                    giftNumber = giftCardNumber;
                } else {
                    processGiftCardRequest(giftCardNumber);
                }
            }
        }
    }
});

$("#elebox-receipt-dialog").dialog({
    width: 400,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        $("#eleboxOrderIDField").val("");
    },
    buttons: {
        Cancel: function () {
            $(this).dialog("close");
            $("#invalidNumber").html("");
        },
        OK: function () {
            var customerNumber = $("#eleboxOrderIDField").val();
            var invalid = "";

            if (!isAlphaNumeric($.trim(customerNumber))) {
                $("#emptyInputBpjs-dialog").dialog("open");
            } else {
                //call to bills payment web service

                if (customerNumber.length == 13) {
                    invalid = "";
                    var reqType = ELEBOX.constants.INQUIRY;
                    var data = ELEBOX.generateEleboxRequestParam(customerNumber, reqType);
                    uilog('DBUG', "data customer number" + data);
                    ELEBOX.createRequest(data, reqType);
                    $("#eleboxOrderIDField").val("");
                } else {
                    invalid = "Invalid Number";
                }
            }
            $("#invalidNumber").html(invalid);
        }
    }
});

$("#elebox-status-dialog").dialog({
    width: 430,
    height: 530,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        var elebox = $("#elebox-status-dialog").data("eleboxInfo");
        var orderId = elebox.order.order_id;
        var productname = elebox.order.cart.detail_list.product_name;
        var infoData = elebox.order.cart.detail_list.item_info;
        var status = elebox.order.trx_info;
        if (status == "FAILED") {
            var trx_status = "Transaction Failed";
        } else {
            var trx_status = "Transaction Sudah Dibayar";
        }
        var info = infoData.replace(/-0-/gi, '\n');

        $("#eleboxInfoHeader").html(trx_status);
        $("#eleboxInfoId").html(orderId);
        $("#eleboxProductName").html(productname);
        $("#eleboxInfoDet").html(info);
    },
    buttons: {
        OK: function () {
            var data = $("#elebox-status-dialog").data("eleboxInfo");
            CustomerPopupScreen.cus_EleboxStatusRemove(data);
            $("#elebox-status-dialog").dialog("close");
            $("#elebox-receipt-dialog").dialog("close");
        }
    }
});
$("#eleboxExpired-dialog").dialog({
    width: 430,
    height: 530,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        var elebox = $("#eleboxExpired-dialog").data("eleboxInfo");
        var orderId = elebox.order.order_id;
        $("#eleboxExpiredId").html(orderId);
    },
    buttons: {
        OK: function () {
            $("#eleboxExpired-dialog").dialog("close");
            $("#elebox-receipt-dialog").dialog("close");
        }
    }
});

$("#eleboxFailed-dialog").dialog({
    width: 430,
    height: 530,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        var elebox = $("#eleboxFailed-dialog").data("eleboxInfo");
        var orderId = elebox.order.order_id;
        var infoData = elebox.order.cart.detail_list.item_info;
        var info = infoData.replace(/-0-/gi, '\n');
        ELEBOX.trxId = saleTx.transactionId;
        ELEBOX.storeCd = saleTx.storeCd;
        ELEBOX.posTerminal = configuration.terminalId;
        ELEBOX.userName = loggedInUsername;
        ELEBOX.sessionId = configuration.storeCode + configuration.terminalCode + parseInt(Date.now() / 10000);
        ELEBOX.userId = saleTx.userId;
        $("#eleboxFailedId").html(orderId);
        $("#eleboxFailedInfo").html(info);
    },
    buttons: {
        CANCEL: function () {
            $("#eleboxFailed-dialog").dialog("close");
            $("#elebox-receipt-dialog").dialog("close");
            var data = $("#eleboxFailed-dialog").data("eleboxInfo");
            CustomerPopupScreen.cus_EleboxFailedRemove(data);
        },
        RETURN: function () {
            if (!cashierRole.isCustomerServiceCashier &&
                cashierRole.isSalesCashier) {
                showMsgDialog(getMsgValue("pos_error_msg_return_not_allowed"), "error");
            } else {
                if (!hasScannedItem(saleTx) && !toggleTVS) {
                    uilog('DBUG', "Return Else");
                    var data = $("#eleboxFailed-dialog").data("eleboxInfo");
                    var ee = {
                        elebox: data
                    };
                    var sequence = ee.elebox.order.cart.detail_list.sequence;
                    var productName = ee.elebox.order.cart.detail_list.product_name;
                    var name = ee.elebox.order.cart.detail_list.product_name;
                    var unitPrice = ee.elebox.order.cart.detail_list.unit_price;
                    var id = "";
                    var itemInfoList = ELEBOX.getItemInfoList(data);
                    var renderProduct = {
                        description: id,
                        name: name,
                        shortDesc: productName,
                        currentPrice: unitPrice
                    }
                    renderScannedItem(itemInfoList[0]);
                    renderProductDetails(renderProduct);
                    saleTx = itemInfoList[0];
                    saleTx.type = CONSTANTS.TX_TYPES.RETURN.name;
                    saleTx.payments = [];
                    saleTx.sequence = sequence;
                    saleTx = $.extend(new CASHIER.SaleTx(), saleTx);
                    saleTx.totalAmount = saleTx.priceSubtotal;
                    saveTxn();
                    renderTotal();
                    CustomerPopupScreen.cus_EleboxRemove(data);
                    changeCustomerActiveScreen(CONSTANTS.CUSTOMER_PAGE_SCREEN_TYPES.TRANSACTION);
                    if (!isHcEnabled) {
                        printReceipt({
                            header: setReceiptHeader(saleTx),
                            body: setReceiptItems(saleTx,
                                itemInfoList, { currency: "Rp" })
                        });
                    }
                    $(this).dialog("close");
                    CustomerPopupScreen.cus_EleboxFailedRemove(data);
                    $("#elebox-receipt-dialog").dialog("close");

                } else {
                    showKeyNotAllowedMsg();
                }
            }
        }
    }
});

$("#elebox-receipt-dialog").on("dialogclose", function (event, ui) {
    $("#eleboxOrderIDField").val("");
});

$("#eleboxInfo-dialog").dialog({
    width: 430,
    height: 500,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    dialogClass: "no-close",
    closeOnEscape: false,
    open: function (event, ui) {
        var elebox = $("#eleboxInfo-dialog").data("eleboxInfo");
        var orderId = elebox.order.order_id;
        var customerId = elebox.order.cart.detail_list.customer.customer_id;
        var customerData = "";
        var repCusData = "";
        if (!jQuery.isEmptyObject(elebox.order.cart.detail_list.customer.customer_data)) {
            customerData = elebox.order.cart.detail_list.customer.customer_data;
            repCusData = customerData.replace(/-0-/gi, '\n');
        }

        ELEBOX.trxId = saleTx.transactionId;
        ELEBOX.storeCd = saleTx.storeCd;
        ELEBOX.posTerminal = configuration.terminalId;
        ELEBOX.userName = loggedInUsername;
        ELEBOX.sessionId = configuration.storeCode + configuration.terminalCode + parseInt(Date.now() / 10000);
        ELEBOX.userId = saleTx.userId;

        uilog('DBUG', saleTx.storeCd);
        uilog('DBUG', saleTx.transactionId);
        uilog('DBUG', ELEBOX.userName);
        uilog('DBUG', ELEBOX.posTerminal);
        uilog('DBUG', ELEBOX.sessionId);
        uilog('DBUG', ELEBOX.userId);

        $("#eleboxOrderId").html(orderId);
        $("#eleboxCustomerId").html(customerId);
        $("#eleboxCustomerData").html(repCusData);

    },
    buttons: {
        Cancel: function () {
            var data = $("#eleboxInfo-dialog").data("eleboxInfo");
            CustomerPopupScreen.cus_EleboxRemove(data);
            $(this).dialog("close");
        },
        OK: function () {
            //display to Description
            var data = $("#eleboxInfo-dialog").data("eleboxInfo");
            var ee = {
                elebox: data
            };
            var sequence = ee.elebox.order.cart.detail_list.sequence;
            var productName = ee.elebox.order.cart.detail_list.product_name;
            var name = ee.elebox.order.cart.detail_list.product_name;
            var unitPrice = ee.elebox.order.cart.detail_list.unit_price;
            var id = ee.elebox.order.cart.detail_list.customer.customer_id;
            var itemInfoList = ELEBOX.getItemInfoList(data);
            var renderProduct = {
                description: id,
                name: name,
                shortDesc: productName,
                currentPrice: unitPrice
            }
            renderScannedItem(itemInfoList[0]);
            renderProductDetails(renderProduct);
            saleTx = itemInfoList[0];
            saleTx.type = CONSTANTS.TX_TYPES.ELEBOX.name;
            saleTx.payments = [];
            saleTx.sequence = sequence;
            saleTx = $.extend(new CASHIER.SaleTx(), saleTx);
            saleTx.totalAmount += saleTx.priceSubtotal;
            uilog("DBUG", "eleboxInfo-dialog OK: " + JSON.stringify(saleTx));
            saveTxn();
            renderTotal();
            //getItemInfo(itemInfoList);
            if (!isHcEnabled) {
                printReceipt({
                    header: setReceiptHeader(saleTx),
                    body: setReceiptItems(saleTx,
                        saleTx, { currency: "Rp" })
                });
            }
            CustomerPopupScreen.cus_EleboxRemove(data);
            changeCustomerActiveScreen(CONSTANTS.CUSTOMER_PAGE_SCREEN_TYPES.TRANSACTION);
            $(this).dialog("close");
            $("#elebox-receipt-dialog").dialog("close");
        }
    }
});

$("#bpjs-receipt-dialog").dialog({
    width: 400,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        $("#bpjsAccountNumberField").val("");
        $("bpjsAccountNumberField").attr('disabled', 'disabled');
        var change = $("#bpjsAccountNumberField").change(function () {
            if ($("#bpjsAccountNumberField").length == 16) {
                $("#bpjsPeriodeField").removeAttr('disabled');
            }
        });
    },
    buttons: {
        Cancel: function () {
            $(this).dialog("close");
            $("#bpjsInvalid").html("");
        },
        OK: function () {
            var accountNumber = $("#bpjsAccountNumberField").val();
            var periode = $("#bpjsPeriodeField").val();
            var mobilephone = null;
            var invalid = "";
            if (!isAlphaNumeric($.trim(accountNumber)) && !isAlphaNumeric($.trim(periode))) {
                $("#emptyInputBpjs-dialog").dialog("open");
            } else {
                if (accountNumber.length >= 13) {
                    invalid = "";
                    BPJS.inquiry(accountNumber, periode, mobilephone);
                    $("#bpjsPeriodeField").val("");
                } else {
                    invalid = "Invalid Number";
                }
            }
            $("#bpjsInvalid").html(invalid);
        }
    }
});

$("#bpjs-info-dialog").on("dialogclose", function (event, ui) {
    $("#bpjsAccountNumberField").val("");
    $("#bpjsPeriodeField").val("");
    $("#bpjs-info-dialog").dialog("close");
    var bpjs = $("#bpjs-info-dialog").data("bpjsInfo");
    CustomerPopupScreen.cus_removeBPJSDialog(bpjs);
    changeCustomerActiveScreen(CONSTANTS.CUSTOMER_PAGE_SCREEN_TYPES.TRANSACTION);
});

$("#bpjs-info-dialog").dialog({
    width: 400,
    height: 500,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    open: function (event, ui) {
        var bpjs = $("#bpjs-info-dialog").data("bpjsInfo");
        var responseCode = bpjs.return.responsecode;
        var responseMsg = bpjs.return.responsemsg;
        var response = bpjs.return.chart_table.replace(/\n/gi, '<br>');
        var infoList = response.split("<br>");
        var name = infoList[2].replace(",<br>", "<br>").replace(" ,", "\n\t\t").replace(/,\s*$/, "");
        console.log(infoList);
        BPJS.posTerminal = configuration.terminalId;
        BPJS.userName = loggedInUsername;
        BPJS.sessionId = configuration.storeCode + configuration.terminalCode + parseInt(Date.now() / 10000);
        BPJS.userId = saleTx.userId;

        $("#bpjsResponseCode").html(responseCode);
        $("#bpjsResponseMsg").html(responseMsg);
        $("#bpjsInfoVaKel").html(infoList[0]);
        $("#bpjsInfoVaKepkel").html(infoList[1]);
        $("#bpjsInfoNama").html(name);
        $("#bpjsInfoAnggota").html(infoList[3]);
        $("#bpjsInfoPeriode").html(infoList[4]);
        $("#bpjsInfoPremi").html(infoList[5]);
        $("#bpjsInfoAdmin").html(infoList[6]);
    },
    buttons: {
        /*ADVICE: function() {
            var bpjs = $("#bpjs-info-dialog").data("bpjsInfo");
            var sessionId = bpjs.return.sessionid;
            $("#bpjs-info-dialog").dialog("close");
            BPJS.getAdvice(sessionId);

        },*/
        CANCEL: function () {
            $("#bpjsAccountNumberField").val("");
            $("#bpjsPeriodeField").val("");
            $("#bpjs-info-dialog").dialog("close");
            var bpjs = $("#bpjs-info-dialog").data("bpjsInfo");
            CustomerPopupScreen.cus_removeBPJSDialog(bpjs);
            changeCustomerActiveScreen(CONSTANTS.CUSTOMER_PAGE_SCREEN_TYPES.TRANSACTION);
        },
        LANJUTKAN: function () {
            var bpjs = $("#bpjs-info-dialog").data("bpjsInfo");
            var bpjsItemInfo = BPJS.getItemInfo(bpjs);
            var id = bpjs.return.accountnumber;
            var priceUnit = bpjs.return.totalamount;
            var shortDesc = "BPJS KS";
            var renderProduct = {
                description: id,
                name: shortDesc,
                shortDesc: shortDesc,
                currentPrice: priceUnit
            }
            renderScannedItem(bpjsItemInfo[0]);
            renderProductDetails(renderProduct);
            saleTx = bpjsItemInfo[0];
            saleTx.type = CONSTANTS.TX_TYPES.BPJS.name;
            saleTx.payments = [];
            saleTx.sequence = 1;
            saleTx = $.extend(new CASHIER.SaleTx(), saleTx);
            saleTx.totalAmount += saleTx.priceSubtotal;
            uilog('DBUG', hasScannedItem(saleTx));
            saveTxn();
            renderTotal();
            //getItemInfo(bpjsItemInfo);
            if (!isHcEnabled) {
                printReceipt({
                    header: setReceiptHeader(saleTx),
                    body: setReceiptItems(saleTx,
                        saleTx, { currency: "Rp" })
                });
            }
            CustomerPopupScreen.cus_removeBPJSDialog(bpjs);
            changeCustomerActiveScreen(CONSTANTS.CUSTOMER_PAGE_SCREEN_TYPES.TRANSACTION);
            $("#bpjs-receipt-dialog").dialog("close");
            $("#bpjs-info-dialog").dialog("close");
        }
    }
});

$("#bpjs-advice-dialog").dialog({
    width: 400,
    height: 500,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        var advice = $("#bpjs-advice-dialog").data("adviceInfo");
        var responseCode = advice.return.responsecode;
        var responseMsg = advice.return.responsemsg;
        var account = advice.return.accountnumber;
        var payment_status = advice.return.payment_status;

        $("#adviceResponseCode").html(responseCode);
        $("#adviceResponseMsg").html(responseMsg);
        $("#adviceAccount").html(account);
        $("#advicePayment").html(payment_status);
    },
    buttons: {
        OK: function () {
            var advice = $("#bpjs-advice-dialog").data("adviceInfo");
            CustomerPopupScreen.cus_removeBPJSAdviceDialog(advice);
            $("#bpjs-advice-dialog").dialog("close");
            $("#bpjs-info-dialog").dialog("close");
        }
    }
});

$("#bpjs-payment-dialog").dialog({
    width: 400,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        var bpjs = $("#bpjs-payment-dialog").data("bpjsFail");
        var responseCode = bpjs.return.responsecode;
        var responseMsg = bpjs.return.responsemsg;
        if (responseCode == "0007") {
            var pesan = "Please Contact your Supervisor or Administrator.";
        } else {
            var pesan = "";
        }

        $("#bpjsPayRspCode").html(responseCode);
        $("#bpjsPayRspMsg").html(responseMsg);
        $("#messageBpjs").html(pesan);
    },
    buttons: {
        OK: function () {
            $("#bpjs-payment-dialog").dialog("close");
        }
    }
});

// Changes XML to JSON
function xmlToJson(xml) {

    // Create the return object
    var obj = {};

    if (xml.nodeType == 1) { // element
        // do attributes
        if (xml.attributes.length > 0) {
            obj["@attributes"] = {};
            for (var j = 0; j < xml.attributes.length; j++) {
                var attribute = xml.attributes.item(j);
                obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
            }
        }
    } else if (xml.nodeType == 3) { // text
        obj = xml.nodeValue;
    }

    // do children
    if (xml.hasChildNodes()) {
        for (var i = 0; i < xml.childNodes.length; i++) {
            var item = xml.childNodes.item(i);
            var nodeName = item.nodeName;
            if (typeof (obj[nodeName]) == "undefined") {
                obj[nodeName] = xmlToJson(item);
            } else {
                if (typeof (obj[nodeName].push) == "undefined") {
                    var old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(xmlToJson(item));
            }
        }
    }
    return obj;
};

/**
 * Gift Card Balance Dialog
 */
$("#giftcard-balance-dialog").on("dialogclose", function (event, ui) {
    $("#giftCardBalance").empty();
    clearGiftCardTransaction();
    //	clearOrder();
    //	createOrder();
});

$("#evoucher-balance-dialog").on("dialogclose", function (event, ui) {
    $("#eVoucherBalance").empty();
    $("#evoucher-input-dialog").dialog("close");
    clearGiftCardTransaction();
    //	clearOrder();
    //	createOrder();
});

$("#giftcard-balance-dialog").dialog({
    width: 400,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        var gcBalance = $(this).data("gcBalanceDetails");
        var output = "Card #: " + maskValueWithX(gcBalance.gcNumber, 11, 'LAST') +
            "<br />Card type: " + ((gcBalance.gcTx.cardType) ? gcBalance.gcTx.cardType : "N/A") +
            "<br />Exp. Date: " + ((gcBalance.gcTx.expireDate) ? formatGiftCardDate(gcBalance.gcTx.expireDate) : "N/A");
        output = "<em>" + output + "</em>";
        $("#giftCardBalance").html(output);
    },
    buttons: {
        OK: function () {
            $("#giftcard-balance-dialog").dialog("close");
            //close gift card dialog from customer.
            CustomerPopupScreen.cus_closeGiftCardBalanceDialog();
        }
    }
});
$("#evoucher-balance-dialog").dialog({
    width: 400,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        var gcBalance = $(this).data("gcBalanceDetails");
        var output = "Card #: " + maskValueWithX(gcBalance.gcNumber, 11, 'LAST') +
            "<br />Card type: " + ((gcBalance.gcTx.cardType) ? gcBalance.gcTx.cardType : "N/A") +
            "<br />Exp. Date: " + ((gcBalance.gcTx.expireDate) ? formatGiftCardDate(gcBalance.gcTx.expireDate) : "N/A") +
            "<br />Card Balance: " + numberWithCommas(gcBalance.gcTx.balance);
        output = "<em>" + output + "</em><br />";
        $("#eVoucherBalance").html(output);
    },
    buttons: {
        OK: function () {
            $("#evoucher-balance-dialog").dialog("close");
            //close gift card dialog from customer.
            CustomerPopupScreen.cus_closeGiftCardBalanceDialog();
        }
    }
});

$("#MMSFunctions-dialog").dialog({
    width: 350,
    height: 400,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: true
});

/**
 * Return or Refund only will use this dialog.
 * Validate if price inputed is greater than 0;
 * Validate if price inputed is not a number. - if keyboard is enabled.
 */
var reasonGroup = "";
$("#returnReason-dialog").dialog({
    width: 400,
    height: 450,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        var tmpConfig = getConfigValue("RETURN_REASON");
        var tmp2 = tmpConfig.split(";");

        $("#reason").html('');
        for (i in tmp2) {
            var reasonOption = $('<tr>').append($('<td style="width=90%;">').append($('<label for="optReason_' + tmp2[i] + '">' + tmp2[i] + '</label></td>'))).append($('<td>').append($('<input type="radio" style="width:10%;" id="optReason_' + tmp2[i] + '" name="reasonGroup" value="' + tmp2[i] + '" /></td>'))).append($('</tr>'));
            $("#reason").append(reasonOption)
        }
    },
    buttons: {
        CANCEL: function () {
            $(this).dialog("close");
        },
        OK: function () {
            reasonGroup = $('input[name=reasonGroup]:checked').val();
            if (!reasonGroup) {
                $("#invalidRetReason").html("Pilih Alasan!");
                return false;
            } else {
                $("#invalidRetReason").html('');
                confirmBtn();
                $(this).dialog("close");
            }
        }
    }
});
$("#returnTUReason-dialog").dialog({
    width: 400,
    height: 450,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        var tmpConfig = getConfigValue("RETURN_REASON");
        var tmp2 = tmpConfig.split(";");

        $("#reasonTU").html('');
        for (i in tmp2) {
            var reasonOption = $('<tr>').append($('<td style="width=90%;">').append($('<label for="optReason_' + tmp2[i] + '">' + tmp2[i] + '</label></td>'))).append($('<td>').append($('<input type="radio" style="width:10%;" id="optReason_' + tmp2[i] + '" name="reasonTUGroup" value="' + tmp2[i] + '" /></td>'))).append($('</tr>'));
            $("#reasonTU").append(reasonOption)
        }
    },
    buttons: {
        CANCEL: function () {
            $(this).dialog("close");
        },
        OK: function () {
            reasonGroup = $('input[name=reasonTUGroup]:checked').val();
            if (!reasonGroup) {
                $("#invalidRetTUReason").html("Pilih Alasan!");
                return false;
            } else {
                $("#invalidRetTUReason").html('');
                topUpReason();
                $(this).dialog("close");
            }
        }
    }
});

function topUpReason() {
    var topUpId = $("#topUpTrIdField").val();
    var topUpTxn = TOPUP.findTopUpTransaction(saleTx.baseTransactionId, topUpId);
    if (null === topUpTxn) {
        showMsgDialog(getMsgValue("pos_error_msg_txn_with_topupid_not_found"), "");
    } else if (topUpTxn && 'SUCCESS' === topUpTxn.status) {
        //Cannot return successful topup transaction. See Bug#101333
        showMsgDialog(getMsgValue("pos_error_msg_topup_return_not_allowed"), "");
    } else {
        var prodObj = findItem(topUpTxn.ean13code);
        prodObj.name = prodObj.shortDesc;
        prodObj.rr_reason = reasonGroup;
        //var prodObj = $("#topUp-dialog").data("prodObj");
        // topUpTxn.ean13code
        //topUpItemRefundFlag = true;
        ++scannedItemOrder;
        var topUpItem = {
            transactionId: saleTx.transactionId,
            transactionType: "REFUND",
            refTxItemOrder: scannedItemOrder,
            //phoneNum : phoneNumber,
            vType: prodObj.sku,
            serverTxId: topUpId
        };
        addScannedItem(prodObj);
        // Item has been added cannot do CLEAR.
        disableClrFn = true;
        renderProductDetails(prodObj);
        topUpObj.topUpTxItems.push(topUpItem);
        renderScannedItem(saleTx.orderItems.last);
        renderTotal();
        printScannedItem();
        clearInputDisplay();
        // must set itemQty to 1 (default)
        itemQty = 1;
        sendTopUpReq = false;
        $("#topUp-dialog").dialog("close");
    }
}

$("#returnIndosmartReason-dialog").dialog({
    width: 400,
    height: 450,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        var tmpConfig = getConfigValue("RETURN_REASON");
        var tmp2 = tmpConfig.split(";");

        $("#reasonIndosmart").html('');
        for (i in tmp2) {
            var reasonOption = $('<tr>').append($('<td style="width=90%;">').append($('<label for="optReason_' + tmp2[i] + '">' + tmp2[i] + '</label></td>'))).append($('<td>').append($('<input type="radio" style="width:10%;" id="optReason_' + tmp2[i] + '" name="reasonIndosmartGroup" value="' + tmp2[i] + '" /></td>'))).append($('</tr>'));
            $("#reasonIndosmart").append(reasonOption)
        }
    },
    buttons: {
        CANCEL: function () {
            $(this).dialog("close");
        },
        OK: function () {
            reasonGroup = $('input[name=reasonIndosmartGroup]:checked').val();
            if (!reasonGroup) {
                $("#invalidRetIndosmartReason").html("Pilih Alasan!");
                return false;
            } else {
                $("#invalidRetIndosmartReason").html('');
                indosmartReason();
                $(this).dialog("close");
            }
        }
    }
});

function indosmartReason() {
    var indosmartId = $("#indosmartTrIdField").val();
    var indosmartTxn = INDOSMART.findIndosmartTransaction(saleTx.baseTransactionId, indosmartId);
    console.log(indosmartTxn);

    if (null === indosmartTxn) {
        showMsgDialog(getMsgValue("pos_error_msg_txn_with_indosmartid_not_found"), "");
    } else if (indosmartTxn && 'SUKSES' === indosmartTxn.status) {
        //Cannot return successful topup transaction. See Bug#101333
        showMsgDialog(getMsgValue("pos_error_msg_indosmart_return_not_allowed"), "");
    } else {
        var prodObj = findItem(indosmartTxn.ean13code);
        prodObj.rr_reason = reasonGroup;
        //var prodObj = $("#topUp-dialog").data("prodObj");
        // topUpTxn.ean13code
        //topUpItemRefundFlag = true;
        ++scannedItemOrder;
        var indosmartItem = {
            transactionId: saleTx.transactionId,
            transactionType: "REFUND",
            refTxItemOrder: scannedItemOrder,
            //phoneNum : phoneNumber,
            vType: prodObj.sku,
            serverTxId: indosmartId,
            referenceNo: indosmartId
        };
        addScannedItem(prodObj);
        // Item has been added cannot do CLEAR.
        disableClrFn = true;
        renderProductDetails(prodObj);
        indosmartObj.indosmartTxItems.push(indosmartItem);
        renderScannedItem(saleTx.orderItems.last);
        renderTotal();
        printScannedItem();
        clearInputDisplay();
        // must set itemQty to 1 (default)
        itemQty = 1;
        sendIndosmartReq = false;
        $("#indosmart-dialog").dialog("close");
    }
}

$("#returnMCashReason-dialog").dialog({
    width: 400,
    height: 450,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        var tmpConfig = getConfigValue("RETURN_REASON");
        var tmp2 = tmpConfig.split(";");

        $("#reasonMCash").html('');
        for (i in tmp2) {
            var reasonOption = $('<tr>').append($('<td style="width=90%;">').append($('<label for="optReason_' + tmp2[i] + '">' + tmp2[i] + '</label></td>'))).append($('<td>').append($('<input type="radio" style="width:10%;" id="optReason_' + tmp2[i] + '" name="reasonMCashGroup" value="' + tmp2[i] + '" /></td>'))).append($('</tr>'));
            $("#reasonMCash").append(reasonOption)
        }
    },
    buttons: {
        CANCEL: function () {
            $(this).dialog("close");
        },
        OK: function () {
            reasonGroup = $('input[name=reasonMCashGroup]:checked').val();
            if (!reasonGroup) {
                $("#invalidRetMCashReason").html("Pilih Alasan!");
                return false;
            } else {
                $("#invalidRetMCashReason").html('');
                mCashReason();
                $(this).dialog("close");
            }
        }
    }
});

function mCashReason() {
    var mCashId = $("#mCashTrIdField").val();
    console.log("MCASH ID");
    console.log(mCashId);
    var mCashTxn = MCASH.findMCashTransaction(saleTx.baseTransactionId, mCashId);
    console.log(mCashTxn);

    if (null === mCashTxn) {
        showMsgDialog(getMsgValue("pos_error_msg_txn_with_mcashid_not_found"), "");
    } else if (mCashTxn && 'SUCCESS' === mCashTxn.status) {
        //Cannot return successful topup transaction. See Bug#101333
        showMsgDialog(getMsgValue("pos_error_msg_mcash_return_not_allowed"), "");
    } else {
        var prodObj = findItem(mCashTxn.ean13code);
        prodObj.rr_reason = reasonGroup;
        //var prodObj = $("#topUp-dialog").data("prodObj");
        // topUpTxn.ean13code
        //topUpItemRefundFlag = true;
        ++scannedItemOrder;

        console.log("OBJECT");
        console.log(prodObj);
        var mCashItem = {
            transactionId: saleTx.transactionId,
            transactionType: "RETUR",
            refTxItemOrder: scannedItemOrder,
            vType: prodObj.sku,
            serverTxId: mCashTxn.partner_trx_id,
            storeId: mCashTxn.store_id,
            posId: mCashTxn.pos_id
        };

        addScannedItem(prodObj);
        // Item has been added cannot do CLEAR.
        disableClrFn = true;
        renderProductDetails(prodObj);
        mCashObj.mCashTxItems.push(mCashItem);
        renderScannedItem(saleTx.orderItems.last);
        renderTotal();
        printScannedItem();
        clearInputDisplay();
        // must set itemQty to 1 (default)
        itemQty = 1;
        sendMCashReq = false;
        $("#mCash-dialog").dialog("close");
    }
}

$("#returnAlterraReason-dialog").dialog({
    width: 400,
    height: 450,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        var tmpConfig = getConfigValue("RETURN_REASON");
        var tmp2 = tmpConfig.split(";");

        $("#reasonAlterra").html('');
        for (i in tmp2) {
            var reasonOption = $('<tr>').append($('<td style="width=90%;">').append($('<label for="optReason_' + tmp2[i] + '">' + tmp2[i] + '</label></td>'))).append($('<td>').append($('<input type="radio" style="width:10%;" id="optReason_' + tmp2[i] + '" name="reasonAlterraGroup" value="' + tmp2[i] + '" /></td>'))).append($('</tr>'));
            $("#reasonAlterra").append(reasonOption)
        }
    },
    buttons: {
        CANCEL: function () {
            $(this).dialog("close");
        },
        OK: function () {
            reasonGroup = $('input[name=reasonAlterraGroup]:checked').val();
            if (!reasonGroup) {
                $("#invalidRetAlterraReason").html("Pilih Alasan!");
                return false;
            } else {
                $("#invalidRetAlterraReason").html('');
                alterraReason();
                $(this).dialog("close");
            }
        }
    }
});

function alterraReason() {
    var alterraId = $("#alterraTrIdField").val();
    console.log("ALTERRA ID");
    console.log(alterraId);
    var alterraTxn = ALTERRA.findAlterraTransaction(saleTx.baseTransactionId, alterraId);
    console.log(alterraTxn);

    if (null === alterraTxn) {
        showMsgDialog(getMsgValue("pos_error_msg_txn_with_alterraid_not_found"), "");
    } else if (alterraTxn && 'SUCCESS' === alterraTxn.status) {
        //Cannot return successful topup transaction. See Bug#101333
        showMsgDialog(getMsgValue("pos_error_msg_alterra_return_not_allowed"), "");
    } else {
        var prodObj = findItem(alterraTxn.ean13code);
        prodObj.rr_reason = reasonGroup;
        //var prodObj = $("#topUp-dialog").data("prodObj");
        // topUpTxn.ean13code
        //topUpItemRefundFlag = true;
        ++scannedItemOrder;

        console.log("OBJECT");
        console.log(prodObj);
        var alterraItem = {
            transactionId: saleTx.transactionId,
            transactionType: "RETUR",
            refTxItemOrder: scannedItemOrder,
            vType: prodObj.sku,
            serverTxId: alterraTxn.partner_trx_id,
            storeId: alterraTxn.store_id,
            posId: alterraTxn.pos_id
        };

        addScannedItem(prodObj);
        // Item has been added cannot do CLEAR.
        disableClrFn = true;
        renderProductDetails(prodObj);
        alterraObj.alterraTxItems.push(alterraItem);
        renderScannedItem(saleTx.orderItems.last);
        renderTotal();
        printScannedItem();
        clearInputDisplay();
        // must set itemQty to 1 (default)
        itemQty = 1;
        sendAlterraReq = false;
        $("#alterra-dialog").dialog("close");
    }
}

$("#refundEnter").click(function () {
    // $("#priceConfirmation-dialog").dialog("close");
    $("#refundReason-dialog").dialog("open");
});
$("#refundReason-dialog").dialog({
    width: 400,
    height: 450,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        var tmpConfig = getConfigValue("REFUND_REASON");
        var tmp2 = tmpConfig.split(";");

        $("#refReason").html('');
        for (i in tmp2) {
            var reasonOption = $('<tr>').append($('<td style="width=90%;">').append($('<label for="optRefReason_' + tmp2[i] + '">' + tmp2[i] + '</label></td>'))).append($('<td>').append($('<input type="radio" style="width:10%;" id="optRefReason_' + tmp2[i] + '" name="refReasonGroup" value="' + tmp2[i] + '" /></td>'))).append($('</tr>'));
            $("#refReason").append(reasonOption)
        }
    },
    buttons: {
        CANCEL: function () {
            $(this).dialog("close");
        },
        OK: function () {
            reasonGroup = $('input[name=refReasonGroup]:checked').val();
            if (!reasonGroup) {
                $("#invalidRefReason").html("Pilih Alasan!");
                return false;
            } else {
                $("#invalidRefReason").html('');
                confirmBtn();
                $(this).dialog("close");
            }
        }
    }
});
// CR RETURN
function confirmBtn()
// $("#confirmBtn").click(function()
{
    if ($("#returnQty").val() == '' && saleTx.type == CONSTANTS.TX_TYPES.RETURN.name && getConfigValue("RETURN_FLAG") == "true") {
        showMsgDialog('Please enter quantity input', "warning");
        return false;
    }
    var price;
    var prodObj;
    var itemObj;
    if (getConfigValue("RETURN_FLAG") == "true" && !toggleTVS && saleTx.type == CONSTANTS.TX_TYPES.RETURN.name) {
        price = $("#returnNett").text();
        itemObj = $("#returnConfirmation-dialog").data("prodObj");

        // DEBUG CR RETURN
        if ((!connectionOnline || $("#fnReturnTx").data("isAuthenticated"))) {
            prodObj = $("#returnConfirmation-dialog").data("prodObj");
            //console.log("===ProdObj===");
            //console.log("prodObj");
            prodObj.currentPrice = $("#returnTotalPrice").val();
            //prodObj.priceUnit =  Math.round($("#returnTotalPrice").val()/$("#returnQty").val());
        } else {
            prodObj = $("#return-dialog").data("prodObj");
            //if(prodObj.currentPrice == "" && $("#returnConfirmation-dialog").data("deptItem"))
            //{
            //prodObj = $("#returnConfirmation-dialog").data("prodObj");
            prodObj.currentPrice = parseInt(itemObj.price_unit);
            //if(prodObj.cost == "") prodObj.cost = 0;
            //prodObj.price
            //}
            prodObj.returnItemId = itemObj.id;

        }

        prodObj.discount_amount = parseInt($("#returnTotalDiscount").val());
        prodObj.member_discount_amount = parseInt($("#returnMegaDiscount").val());
        prodObj.rr_reason = reasonGroup;

        itemQty = parseInt($("#returnQty").val());
    } else {
        price = Number($("#priceInput").val());
        prodObj = $("#priceConfirmation-dialog").data("prodObj");

    }

    if (price != null && !isNaN(price))
    //&& price > 0)
    {
        uilog("DBUG", "Proceed to %s Transaction", saleTx.type);
        clearInputDisplay();
        prodObj.rr_reason = reasonGroup;
        var oldPrice = prodObj.currentPrice;

        if (saleTx && (saleTx.type == CONSTANTS.TX_TYPES.REFUND.name || saleTx.type == CONSTANTS.TX_TYPES.RETURN.name)) {
            ++scannedItemOrder;
            //uilog('DEBUG', prodObj);
            //console.log("===ProdObj===");
            //console.log(prodObj);
            addScannedItem(prodObj, oldPrice);
            //uilog('DEBUG', prodObj);

            // Item has been added cannot do CLEAR.
            disableClrFn = true;
            //enter here if RETURN/REFUND.
            updateScannedItem();
            resetPriceConfirmationDialogTexts();
            isConfirmBtnClicked = true;

            if (getConfigValue("RETURN_FLAG") == "true" && !toggleTVS && saleTx.type == CONSTANTS.TX_TYPES.RETURN.name) {
                $("#return-dialog").dialog("close");
                $("#returnConfirmation-dialog").dialog("close");
                itemQty = 1;
            } else {
                $("#priceConfirmation-dialog").dialog("close");
                itemQty = 1;
            }
        } else if (saleTx.type == CONSTANTS.TX_TYPES.SALE.name && toggleTVS) {
            if (isOverrideValueValid(price, oldPrice)) {
                prodObj.currentPrice = price;
                $("#priceConfirmation-dialog").dialog("close");
                if (price == oldPrice) {
                    addSaleItem(prodObj);
                } else {
                    addSaleItem(prodObj, oldPrice);
                    addProductPriceOverrideToMap(prodObj.id, price);
                }
            } else {
                var threshold = getConfigValue('TVS_OVERRIDE_THRESHOLD') + "%";
                $("#priceConfirmationMsg").html("NEW PRICE SHOULD BE WITHIN ALLOWABLE THRESHOLD OF " + threshold);
            }
        } else {
            uilog("DBUG", "saleTx or saleTx.type is null or undefined.");
            $("#priceConfirmation-dialog").dialog("close");
        }
    } else {
        if (saleTx && (saleTx.type == CONSTANTS.TX_TYPES.REFUND.name || saleTx.type == CONSTANTS.TX_TYPES.RETURN.name)) {
            if (getConfigValue("RETURN_FLAG") == "true" && saleTx.type == CONSTANTS.TX_TYPES.RETURN.name) {
                showMsgDialog('Invalid Discount Amount', "warning");
            } else $("#priceConfirmationMsg").html("PRICE SHOULD BE GREATER THAN 0.");
        } else
            $("#priceConfirmationMsg").html("INVALID ENTRY.");
    }
    // });
}
// CR RETURN

$("#eftOnlineChoice-dialog").dialog({
    width: 400,
    height: 200,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        //if there are any function that must be exec on open
    },
    buttons: {
        "Bank Mega": function () {
            $(this).dialog("close");
            $("#eft-processing-dialog").dialog("open");
            //timer temporary only when eft coding is not yet done to simulate the time transacting on the device
            postProcessAfterEFTTimeout();
        },
        "Kartuku/Other Bank": function () {
            //TODO kartuku/Other Bank
            $(this).dialog("close");
        }
    }
});

$("#eft-processing-dialog").on("dialogclose", function (event, ui) {
    $("#eftProcessingMsg").empty();
    clearTimeout(eftProcessingDialogTimeout);
});
/**
 * EFT Online processing dialog
 * Displays this dialog when edc is connecting to bank mega.
 */
$("#eft-processing-dialog").dialog({
    width: 400,
    height: 200,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        EFT.displayEftProcessingMsg();
    },
    buttons: {
        Cancel: function () {
            //#98048
            EFT.checkEftTransactionIfValidToClearData();
            $(this).dialog("close");
        }
    }
});

$("#eft-process-settlement-data-dialog").on("dialogclose", function (event, ui) {
    $("#eftProcessingSettlementDataMsg").empty();
});
$("#eft-process-settlement-data-dialog").dialog({
    width: 400,
    height: 200,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    open: function (event, ui) {
        var message = $(this).data("message");
        $("#eftProcessingSettlementDataMsg").empty();
        $("#eftProcessingSettlementDataMsg").append(message);
    },
    buttons: {
        OK: function () {
            uilog("DBUG", "SAVED SETTLEMENT ALL!!!");
        }
    }
});


$("#eft-settle-by-host-dialog").on("dialogclose", function (event, ui) {
    $("#eftSettleByHostMsg").empty();
    $("#eftSettleByHostError").empty();
});
$("#eft-settle-by-host-dialog").dialog({
    width: 400,
    height: 200,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    open: function (event, ui) {
        $("#eftSettlementProcessingMsg").empty();
        var message = getMsgValue("eft_msg_info_processing_swipe_card");
        if (eftTransactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.VOID.name) {
            message = getMsgValue("eft_msg_info_processing_void_txn");
        } else if (eftTransactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SETTLEMENT_ALL.name) {
            message = getMsgValue("eft_msg_info_processing_settlement_all");
        }
        $("#eftProcessingMsg").append(message);
    },
    buttons: {

    }
});
/*********************************
 * Reprint Dialog
 *********************************/
$("#reprint-dialog").on("dialogclose", function (event, ui) { });
$("#reprint-dialog").dialog({
    width: 350,
    height: 340,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: true,
    open: function (event, ui) { },
    buttons: {}
});
$("#reprintByTxn-dialog").dialog({
    width: 460,
    height: 290,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    close: function (event, ui) {
        clearReprintByTxnDialog();
    }
});
$("div.button-reprint-menu").click(function (eventObj) {
    var targetElement = eventObj.currentTarget;
    var targetElementId = $(targetElement).attr("id");
    var saleTx = $("#reprint-dialog").data("saleTx");
    if (targetElementId == "reprintReceipt") {
        reprintReceiptDetails(saleTx, 0);
    } else if (targetElementId == "reprintEftOnline") {
        if (getConfigValue("EFT_PRINTING_ENABLE") == 'true') {
            reprintReceiptDetails(saleTx, 1);
        } else {
            showMsgDialog(getMsgValue('Printing of eft receipt is disabled'), 'warning');
        }
    } else if (targetElementId == "reprintByTxn") {
        $("#reprintByTxn-dialog").dialog("open");
    }
    if (targetElementId == "reprintReceipt" || targetElementId == "reprintEftOnline") {
        // persist the printReceipt intervention data
        SUPERVISOR_INTERVENTION
            .saveInterventionData(
                saleTx.transactionId,
                SUPERVISOR_INTERVENTION
                    .getTempData(CONSTANTS.TX_TYPES.REPRINT_RECEIPT.name));
        clearOrder();
        createOrder();
    }
    //SHOULD BE NO PROCES AFTER THIS --BAD REFERENCE BY CLASS NAME
    // clearOrder();
    // console.log("*clearOrder@div.button-reprint-menu*");
    // createOrder();
    $('#reprint-dialog').dialog("close");
});
var searchedSalesTx = null;

function clearReprintByTxnDialog() {
    $("#reprintByTxnSearchMsg").empty();
    $("#reprintByTxnNumField").val("");
    $("#reprintByTxnResultDiv").hide();
    searchedSalesTx = null;
}
$("#reprintByTxnSearchEnterBtn").click(function () {
    var txnId = $("#reprintByTxnNumField").val();
    var txn = getTodayTxn(txnId);
    if (txn) {
        $("#reprintByTxnSearchMsg").empty();
        $("#reprintByTxnResultDiv .transactionIdRow").html(txn.transactionId);
        searchedSalesTx = txn;
        $("#reprintByTxnResultDiv").show();
    } else {
        searchedSalesTx = null;
        $("#reprintByTxnResultDiv").hide();
        $("#reprintByTxnSearchMsg").html("Transaction ID not found.");
    }
});
$("#reprintByTxnResultDiv .actionRow a").click(function (e) {
    e.preventDefault();
    if (searchedSalesTx) {
        reprintReceiptDetails(searchedSalesTx, 0);
        // persist the printReceipt intervention data
        SUPERVISOR_INTERVENTION.saveInterventionData(
            searchedSalesTx.transactionId, SUPERVISOR_INTERVENTION
                .getTempData(CONSTANTS.TX_TYPES.REPRINT_RECEIPT.name));
        clearOrder();
        createOrder();
    }
    $("#reprintByTxn-dialog").dialog("close");
});
/*********************************
 * Reprint Dialog
 *********************************/

/*********************************
 * Bank Mega Dialog
 *********************************/
$("#co-brand-menu-dialog").on("dialogclose", function (event, ui) { });
$("#co-brand-menu-dialog").dialog({
    width: 340,
    height: 290,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: true,
    dialogClass: "no-close"
});

$("#bank-mega-co-brand-menu-dialog").on("dialogclose", function (event, ui) { });
$("#bank-mega-co-brand-menu-dialog").dialog({
    width: 340,
    height: 290,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close"
});

$("div.co-brand-menu-selection-class").click(function (eventObj) {
    var targetElement = eventObj.currentTarget;
    var targetElementId = $(targetElement).attr("id");
    /*Co-Brand*/
    if (targetElementId == "coBrandBtn") {
        if (enableCoBrand &&
            saleTx.type != CONSTANTS.TX_TYPES.RETURN.name &&
            saleTx.type != CONSTANTS.TX_TYPES.REFUND.name &&
            !toggleRecallSale) {
            $("#memberPromotion-dialog").dialog("open");
        } else {
            showKeyNotAllowedMsg();
        }
    } /*Zepro*/
    else if (targetElementId == "zeproBtn") {
        eftTransactionType = CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO;
        enableCoBrand = false;
        coBrandDiscountStatus = getConfigValue('COBRAND_DISCOUNT_OFF');
    } /*Regular*/
    else {
        eftTransactionType = CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SALE.name;
    }
    if ($('#co-brand-menu-dialog').dialog("isOpen"))
        $('#co-brand-menu-dialog').dialog("close");
    if ($('#bank-mega-co-brand-menu-dialog').dialog("isOpen"))
        $('#bank-mega-co-brand-menu-dialog').dialog("close");
    promptSysMsg();
});

$("#bank-mega-payment-type-selection-dialog").on("dialogclose", function (event, ui) {
    //If no EFT Online Tx Type was selected, revert mdr surcharge added
    if (!isEftOnlineTxTypeSelected) {
        saleTx.totalMdrSurcharge -= mdrSurchargeGlobal;
        saleTx.totalAmount -= mdrSurchargeGlobal;
    }
});
$("#bank-mega-payment-type-selection-dialog").dialog({
    width: 340,
    height: 400,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: true,
    //dialogClass : "no-close",
    open: function (event, ui) {
        isEftOnlineTxTypeSelected = false;
    }
});
$("div.eft-payment-type-menu-selection").click(function (eventObj) {
    var targetElement = eventObj.currentTarget;
    var targetElementId = $(targetElement).attr("id");
    var payment = $("#bank-mega-payment-type-selection-dialog").data("payment");
    var pymtMediaTypeName = $("#bank-mega-payment-type-selection-dialog").data("pymtMediaTypeName");
    isEftOnlineTxTypeSelected = true;

    if (targetElementId == "oneDipBtn") { /*onedip*/
        eftTransactionType = CONSTANTS.EFT.EFT_TRANSACTION_TYPE.ONE_DIP.name;
        if (PAYMENT_MEDIA.isValidForTriggering(
            saleTx, pymtMediaTypeName, payment, enablePaymentMedia) &&
            isNoneGiftCardItemInTransaction()) {
            eftPaymentProcess(payment);
        }
    } else if (targetElementId == "regularBtn") { /*regularBtn*/
        eftTransactionType = CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SALE.name;
        if (PAYMENT_MEDIA.isValidForTriggering(
            saleTx, pymtMediaTypeName, payment, enablePaymentMedia) &&
            isNoneGiftCardItemInTransaction()) {
            eftPaymentProcess(payment);
        }
    } else if (targetElementId == "megaPayBtn") { /*mega pay*/
        eftTransactionType = CONSTANTS.EFT.INSTALLMENT_TYPE.MEGA_PAY;
        $("#bank-mega-installment-terms-dialog")
            .data("payment", payment)
            .data("pymtMediaTypeName", pymtMediaTypeName)
            .dialog("open");
    }
    $('#bank-mega-payment-type-selection-dialog').dialog("close");
});

/**
 * Co-Brand member code input dialog
 */
$("#memberPromotion-dialog").on("dialogclose", function (event, ui) {
    //feature installment/zepro
    var isPaymentProcessing = $(this).data("isPaymentProcessing");
    if ((coBrandDiscountStatus == getConfigValue("COBRAND_DISCOUNT_ON") ||
        coBrandDiscountStatus == getConfigValue("COBRAND_OFFLINE")) && !isPaymentProcessing) {
        $("#bank-mega-co-brand-menu-dialog").dialog("open");
    }
});
$("#memberPromotionWc-dialog").on("dialogclose", function (event, ui) {
    //feature installment/zepro
    // var isPaymentProcessing = $(this).data("isPaymentProcessing");
    // if ((coBrandDiscountStatus == getConfigValue("COBRAND_DISCOUNT_ON") || 
    // coBrandDiscountStatus == getConfigValue("COBRAND_OFFLINE")) && !isPaymentProcessing){
    // $("#bank-mega-co-brand-menu-dialog").dialog("open");
    // }
    $("#eftOnlineWcNoInput6dig").val('');
    $("#eftOnlineWcNoInput4dig").val('');
});

$("#memberPromotion-dialog").dialog({
    width: 400,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        $("#memberPromoMsg").empty();
        $("#memberCardField").val("");
        //"489087|Mega Credit Card;421407|Mega Debit Card;627891|Mega Syariah Debit Card";
        /*[{"member_grup_name":"Mega Credit Card","co_brand_number":["489087","420191","420192","420194","472670","458785","478487","524261","426211","426208","431226"]},
                            {"member_grup_name":"Mega Debit Card","co_brand_number":["421408","421407","601714"]},
                            {"member_grup_name":"Mega Syariah Debit Card","co_brand_number":["627891"]}];*/
        //var tmp1 = "489087|Mega Credit Card;421407|Mega Debit Card;627891|Mega Syariah Debit Card";
        var tmp1 = getConfigValue("CO_BRAND_LIST");
        var tmp2 = tmp1.split(";");
        console.log(tmp2);

        $("#memberCardOption").html('');
        for (i in tmp2) {
            var tmp3 = tmp2[i].split("|");
            var codeProgram = tmp3[0];
            var nameProgram = tmp3[1];
            var selOption = $('<tr>').append($('<td style="width=90%;">').append($('<label for="optBank_' + codeProgram + '">' + nameProgram + '</label></td>'))).append($('<td>').append($('<input type="radio" style="width:10%;" id="optBank_' + codeProgram + '" name="optGroup" value="' + codeProgram + '" /></td>'))).append($('</tr>'));
            $("#memberCardOption").append(selOption);
        }
    },
    buttons: {
        Cancel: function () {
            $(this).dialog("close");
        },
        OK: function () {
            var cardNumber = $('input[name=optGroup]:checked').val();
            uilog('DBUG', 'cardNumber : ' + cardNumber);
            //var cardNumber = $("#memberCardField").val();
            //var cardNumber = $("#memberCardOption").val();
            var pymtMediaTypeName = $(this).data("pymtMediaTypeName");
            var firstSixOfCard = removeAllDash(cardNumber.substring(0, 6));
            var isCardCoBrand = (saleTx.promotionsMap && isTrxCobrand(firstSixOfCard, saleTx.promotionsMap));
            saleTx.isCardCoBrand = isCardCoBrand;

            // BUG FIX CMC 
            if (pymtMediaTypeName == CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_ONLINE.name) $("#tenderNewAmount-dialog").data("cardNumber", cardNumber);

            if (cardNumber == "" || isNaN(cardNumber) ||
                !(cardNumber.length == 6 || cardNumber.length == 8 || cardNumber.length == 16)) {
                $("#memberPromoMsg").html("INVALID ENTRY");
            } else {
                $("#memberPromoMsg").empty();
                var isPaymentProcessing = $(this).data("isPaymentProcessing");
                var payment = $(this).data("payment");

                if (isPaymentProcessing) {
                    if (cardNumber.length < 16) {
                        $("#memberPromoMsg").html("INVALID ENTRY");
                        return false;
                    }
                    /*if(saleTx.coBrandNumber == cardNumber){
                        if (isCardCoBrand && !isContainAdditionalDiscountPaymentLevelPromo(pymtMediaTypeName, firstSixOfCard))
                                processCoBrandEftOnlinePayment(payment, pymtMediaTypeName);
                        else
                            processNonCmcPayment(function()
                                                     {
                                                        processCoBrandEftOnlinePayment(payment, pymtMediaTypeName);
                                                     }, pymtMediaTypeName);
                    }else{*/
                    //var oldTotalCmcDisc = calculateTotalMemberDiscount();
                    var reversedItems = PROMOTIONS.getReversedCmcItems(memberPromos, maskCardNo(cardNumber));
                    //var clonedOrderItems = cloneObject(saleTx.orderItems);
                    //reverseMemberDiscountAmountPerItem(saleTx.orderItems, reversedItems);
                    //var newTotalCmcDisc = calculateTotalMemberDiscount();
                    //saleTx.memberDiscReversal = oldTotalCmcDisc - newTotalCmcDisc;

                    uilog("DBUG", JSON.stringify(reversedItems));
                    //if(jQuery.isEmptyObject(reversedItems)){
                    // CR ADD DISCOUNT
                    if (isCardCoBrand && !isContainAdditionalDiscountPaymentLevelPromo(pymtMediaTypeName, firstSixOfCard))
                        processCoBrandEftOnlinePayment(payment, pymtMediaTypeName);
                    else
                        processNonCmcPayment(function () {
                            processCoBrandEftOnlinePayment(payment, pymtMediaTypeName);
                        }, pymtMediaTypeName);
                    // CR ADD DISCOUNT
                    /*}else{
                        processNonCmcPayment(function(){processEftOnlinePayment(payment, pymtMediaTypeName)},pymtMediaTypeName, reversedItems);
                    }*/

                    /*if(newTotalCmcDisc && newTotalCmcDisc > 0){
                        uilog("DBUG","still has member discount");
                        saleTx.coBrandNumber = maskCardNo(cardNumber);
                        if(saleTx.memberDiscReversal > 0){
                            uilog("DBUG","still has member discount, with reversal")
                            processNonCmcPayment(function(){processCoBrandEftOnlinePayment(payment, pymtMediaTypeName)},pymtMediaTypeName);
                        }else{
                            uilog("DBUG","still has member discount, no reversal")
                            processCoBrandEftOnlinePayment(payment, pymtMediaTypeName);	
                        }	
                    }else{
                        uilog("DBUG","no member discount")
                        processNonCmcPayment(function(){ processEftOnlinePayment(payment, pymtMediaTypeName)},pymtMediaTypeName);
                    }			*/
                    //}
                } else {
                    saleTx.coBrandNumber = maskCardNo(cardNumber);
                    saleTx.coBrandNumberWithoutMask = cardNumber;
                    var coBrandStatus = determineCoBrandDiscountStatus(saleTx.coBrandNumberWithoutMask);
                    $(this).data('coBrandStatus', coBrandStatus);
                    enableCoBrand = false;
                }
                $(this).dialog("close");
            }
        }
    }
});

$("#memberPromotionWc-dialog").dialog({
    width: 400,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        $("#memberPromoWcMsg").empty();
        $("#eftOnlineWcNoInput6dig").val("");
        $("#eftOnlineWcNoInput4dig").val("");
    },
    buttons: {
        Cancel: function () {
            $(this).dialog("close");
        },
        OK: function () {
            var inputCard6dig = $("#eftOnlineWcNoInput6dig").val();
            var inputCard4dig = $("#eftOnlineWcNoInput4dig").val();
            var cardNumber = inputCard6dig + "xx-xxxx-" + inputCard4dig;
            cardNumber = removeAllDash(cardNumber);
            cardNumber = cardNumber.replace("xxxxxx", "000000");
            var pymtMediaTypeName = $(this).data("pymtMediaTypeName");
            var firstSixOfCard = removeAllDash(cardNumber.substring(0, 6));
            var isCardCoBrand = (saleTx.promotionsMap && isTrxCobrand(firstSixOfCard, saleTx.promotionsMap));

            saleTx.isCardCoBrand = isCardCoBrand;

            uilog("DBUG", "cardNumber : " + cardNumber);
            // BUG FIX CMC 
            if (pymtMediaTypeName == CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_ONLINE.name) $("#tenderNewAmount-dialog").data("cardNumber", cardNumber);

            if (cardNumber == "" || isNaN(cardNumber) ||
                !(cardNumber.length == 6 || cardNumber.length == 8 || cardNumber.length == 16)) {
                console.log("cardNumber lenght 1  : " + cardNumber.length);
                $("#memberPromoWcMsg").html("INVALID ENTRY");
            } else {
                $("#memberPromoWcMsg").empty();
                var isPaymentProcessing = $(this).data("isPaymentProcessing");
                var payment = $(this).data("payment");

                if (isPaymentProcessing) {
                    if (cardNumber.length < 16) {
                        console.log("cardNumber lenght 2 : " + cardNumber.length);
                        $("#memberPromoWcMsg").html("INVALID ENTRY");
                        return false;
                    }
                    /*if(saleTx.coBrandNumber == cardNumber){
                        if (isCardCoBrand && !isContainAdditionalDiscountPaymentLevelPromo(pymtMediaTypeName, firstSixOfCard))
                                processCoBrandEftOnlinePayment(payment, pymtMediaTypeName);
                        else
                            processNonCmcPayment(function()
                                                     {
                                                        processCoBrandEftOnlinePayment(payment, pymtMediaTypeName);
                                                     }, pymtMediaTypeName);
                    }else{*/
                    //var oldTotalCmcDisc = calculateTotalMemberDiscount();
                    var reversedItems = PROMOTIONS.getReversedCmcItems(memberPromos, maskCardNo(cardNumber));
                    //var clonedOrderItems = cloneObject(saleTx.orderItems);
                    //reverseMemberDiscountAmountPerItem(saleTx.orderItems, reversedItems);
                    //var newTotalCmcDisc = calculateTotalMemberDiscount();
                    //saleTx.memberDiscReversal = oldTotalCmcDisc - newTotalCmcDisc;

                    uilog("DBUG", JSON.stringify(reversedItems));
                    //if(jQuery.isEmptyObject(reversedItems)){
                    // CR ADD DISCOUNT
                    if (isCardCoBrand && !isContainAdditionalDiscountPaymentLevelPromo(pymtMediaTypeName, firstSixOfCard))
                        processCoBrandEftOnlinePayment(payment, pymtMediaTypeName);
                    else
                        processNonCmcPayment(function () {
                            processCoBrandEftOnlinePayment(payment, pymtMediaTypeName);
                        }, pymtMediaTypeName);
                    // CR ADD DISCOUNT
                    /*}else{
                        processNonCmcPayment(function(){processEftOnlinePayment(payment, pymtMediaTypeName)},pymtMediaTypeName, reversedItems);
                    }*/

                    /*if(newTotalCmcDisc && newTotalCmcDisc > 0){
                        uilog("DBUG","still has member discount");
                        saleTx.coBrandNumber = maskCardNo(cardNumber);
                        if(saleTx.memberDiscReversal > 0){
                            uilog("DBUG","still has member discount, with reversal")
                            processNonCmcPayment(function(){processCoBrandEftOnlinePayment(payment, pymtMediaTypeName)},pymtMediaTypeName);
                        }else{
                            uilog("DBUG","still has member discount, no reversal")
                            processCoBrandEftOnlinePayment(payment, pymtMediaTypeName);	
                        }	
                    }else{
                        uilog("DBUG","no member discount")
                        processNonCmcPayment(function(){ processEftOnlinePayment(payment, pymtMediaTypeName)},pymtMediaTypeName);
                    }			*/
                    //}
                } else {
                    saleTx.coBrandNumber = maskCardNo(cardNumber);
                    saleTx.coBrandNumberWithoutMask = cardNumber;
                    var coBrandStatus = determineCoBrandDiscountStatus(saleTx.coBrandNumberWithoutMask);
                    $(this).data('coBrandStatus', coBrandStatus);
                    enableCoBrand = false;
                }
                $(this).dialog("close");
            }
        }
    }
});
$("#memberPromotion-dialog").on("dialogclose", function (event, ui) {
    $("#memberPromoMsg").empty();
    $("#memberCardField").val("");
});

$("#freeParking-dialog").dialog({
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close"
});

$("#balloonGamePrompt-dialog").dialog({
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close"
});

$("#eftOnlinePaymentTypeChoice-dialog").dialog({
    width: 400,
    height: 150,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        //if there are any function that must be exec on open
    },
    buttons: {
        "CMC": function () {
            var payment = parseInt($("#inputDisplay").val());
            var pymtMediaTypeName = CONSTANTS.PAYMENT_MEDIA_TYPES.CMC_EFT_ONLINE.name;
            eftType = CONSTANTS.EFT.TYPE.CMC_PAYMENT;

            if (PAYMENT_MEDIA.isValidForTriggering(
                saleTx, pymtMediaTypeName,
                payment, enablePaymentMedia) && isNoneGiftCardItemInTransaction()) {
                eftPaymentProcess();
            }

            $(this).dialog("close");
        },
        "Others": function () {
            if (calculateTotalMemberDiscount() > 0) {
                processNonCmcPayment(eftPaymentProcess);
            } else {
                if (PAYMENT_MEDIA.isValidForTriggering(
                    saleTx, pymtMediaTypeName,
                    payment, enablePaymentMedia) && isNoneGiftCardItemInTransaction()) {
                    eftPaymentProcess();
                }
            }
            $(this).dialog("close");
        }
    }
});

// CR ADD DISCOUNT
$("#tenderNewAmount-dialog").dialog({
    width: 370,
    height: 430,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        clearRounding();
        /*if($("#tenderNewAmount-dialog").data("mediaType") != CONSTANTS.PAYMENT_MEDIA_TYPES.CASH.name
           && $("#tenderNewAmount-dialog").data("mediaType") != CONSTANTS.PAYMENT_MEDIA_TYPES.INSTALLMENT.name)
        {
            $("#tenderNewAmountRoundingField").attr('disabled', 'disabled');
        }
        else $("#tenderNewAmountRoundingField").removeAttr('disabled');*/

        $("#tenderNewAmountMsg").empty();
        $("#tenderNewAmountRoundingField").val('');
        var msg = "";
        var cardNum = (eftDataObj && eftDataObj.cardNum) ? eftDataObj.cardNum : "";
        if ($("#tenderNewAmount-dialog").data("cardNumber")) {
            cardNum = $("#tenderNewAmount-dialog").data("cardNumber");
            //$("#tenderNewAmount-dialog").removeData("cardNumber");
        }
        var firstSixOfCard = cardNum.substring(0, 6);
        var isCardCoBrand = (saleTx.promotionsMap && isTrxCobrand(firstSixOfCard, saleTx.promotionsMap));
        var memDisc = calculateTotalMemberDiscount();
        var reversedItems = $(this).data("reversedItems");
        var clonedSaleTx = cloneObject(saleTx);
        reverseMemberDiscountAmountPerItem(clonedSaleTx.orderItems, reversedItems);
        var amountReversal = calculateTotalMemberDiscount(clonedSaleTx);
        var totalSecondLayer = 0,
            totalSecondLayerWithoutMember = 0,
            saleTotalDiscount = 0;

        for (var i in saleTx.orderItems) {
            if (!saleTx.orderItems[i].isVoided && saleTx.orderItems[i].secondLayerDiscountAmount > 0 && saleTx.orderItems[i].secondLayerDiscountAmountWithoutMember) {
                totalSecondLayer += saleTx.orderItems[i].secondLayerDiscountAmount;
                totalSecondLayerWithoutMember += saleTx.orderItems[i].secondLayerDiscountAmountWithoutMember;
            }
        }

        saleTotalDiscount += (totalSecondLayerWithoutMember - totalSecondLayer);
        uilog('DBUG', 'second layer without member : ' + totalSecondLayerWithoutMember);
        uilog('DBUG', 'second layer : ' + totalSecondLayer);
        uilog('DBUG', 'sale total discount : ' + saleTotalDiscount);

        

        var subtotal = 0;
        console.log("Subtotal : " + parseInt($('#subtotal').text().replace(/\,/g, '')));
        if (eftDataObj && memDisc > 0 && isCardCoBrand && (eftType == CONSTANTS.EFT.TYPE.EDC_BCA ||
            eftType == CONSTANTS.EFT.TYPE.CMC_OFFLINE_PAYMENT) && !($("#tenderNewAmount-dialog").data('isAddDiscPaymentLevel'))) {
            subtotal = parseInt($('#subtotal').text().replace(/\,/g, '')) - saleTotalDiscount;

            msg = getMsgValue('cmc_pay_full_amount_msg').format(numberWithCommas(subtotal));
        } else {
            var reversedDisc;
            if (($("#tenderNewAmount-dialog").data('isAddDiscPaymentLevel') ||
                ($("#tenderNewAmount-dialog").data('additionalDiscountItemLevel') &&
                    $("#tenderNewAmount-dialog").data("mediaType") == CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_ONLINE.name)) &&
                isCardCoBrand) {
                reverseMemberDiscount(false, amountReversal);
                reversedDisc = 0;
                $("#tenderNewAmount-dialog").removeData('isAddDiscPaymentLevel');
            } else {
                reverseMemberDiscount(true, amountReversal);
                reversedDisc = numberWithCommas(saleTx.memberDiscReversal);
                $("#tenderNewAmount-dialog").data('reversedDisc', reversedDisc);
                //processLayerThreePromotions($("#tenderNewAmount-dialog").data('mediaType'), false);

            }
            if (saleTx.eftTransactionType == CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO &&
                typeof saleTx.zeproCardDone == 'undefined' &&
                !saleTx.zeproCardDone) {
                var subtotalZepro = calculateZeproAmount(saleTx);
                $("#tenderNewAmount-dialog").data('subtotalZepro', subtotalZepro);
            }
            //else

            uilog("DBUG", "Payment POS : " + JSON.stringify(saleTx.payments));

            uilog("DBUG", "subtotal : " + parseInt($('#subtotal').text().replace(/\,/g, '')));
            subtotal = parseInt($('#subtotal').text().replace(/\,/g, '')) - saleTotalDiscount;

            uilog("DBUG", "subtotal after discount : " + subtotal);

            if (saleTx.payments) {
                saleTx.payments.forEach(payment => {
                    subtotal -= payment.amountPaid;
                });
            }

            //limit payment media with promotion type 7(pwp)
            // if(saleTx.coBrandNumber && saleTx.coBrandNumber != ""){
            //     var promoItems = saleTx.promotionItems;
            //     var promoMaps = saleTx.promotionsMap;
            //     for (var i in promoItems) {
            //         if (promoItems[i].type == '7') {
            //             subtotal += Math.round(promoItems[i].totalDiscount);
            //             reversedDisc = saleTx.memberDiscReversal  + Math.round(promoItems[i].totalDiscount);
            //             clonedSaleTx.memberDiscReversal = saleTx.memberDiscReversal  + Math.round(promoItems[i].totalDiscount);
            //         }
            //     }
            // }


            uilog("DBUG", "subtotal after payment reduction : " + subtotal);

            clonedSaleTx.memberDiscReversal = saleTx.memberDiscReversal;
            $("#tenderNewAmount-dialog").data('reversedDisc', reversedDisc);
            if (subtotalZepro) {
                msg = 'Jumlah total baru: ' + numberWithCommas(subtotalZepro);
            } else if (reversedDisc <= 0) {
                msg = 'Jumlah total baru: ' + numberWithCommas(subtotal);
            } else {
                msg = getMsgValue('cmc_reversed_disc_msg').format(reversedDisc, numberWithCommas(subtotal));
            }
            if (saleTx.totalAdditionalDiscount && saleTx.totalAdditionalDiscount != 0) msg = msg + '</br>Additional Discount: ' + saleTx.totalAdditionalDiscount;
        }
        $("#tenderNewAmount-dialog").data('reversedDisc', reversedDisc);
        $("#tenderNewAmount-dialog").data('subtotal', subtotal);

        if (SALE_RETURN_COUPON.isUseCouponReturn()) {
            console.log("increase subtotal back to normal");
            subtotal += SALE_RETURN_COUPON.calculateCouponReturn();
            console.log(subtotal);
            $("#tenderNewAmountDetails").data('discountWithoutMember', (saleTx.totalAmount - subtotal));
        } else {
            console.log("not use coupon return");
            $("#tenderNewAmountDetails").data('discountWithoutMember', (saleTx.totalAmount - subtotal));
        }
        $("#tenderNewAmountDetails").html(msg);
        $("#tenderNewAmountInputMsg").text(getMsgValue('cmc_enter_new_amount_msg'));
    },
    buttons: {
        "Cancel": function () {
            reverseMemberDiscount(false);
            eftDataObj = null;

            if (installmentPaymentDetails) installmentPaymentDetails = null;

            var previousAmount = $(this).data("payment");
            $("#inputDisplay").val(previousAmount);

            $("#tenderNewAmount-dialog").removeData("cardNumber");
            $("#tenderNewAmount-dialog").removeData('subtotal');
            $("#tenderNewAmount-dialog").removeData('subtotalZepro');
            removeAdditionalDicount();

            $("#tenderNewAmount-dialog").data("roundingAmount", 0);
            $("div#numPad div#keyTotal").click();
            $(this).dialog("close");

        },
        "Rounding": function () {
            if (saleTx.eftTransactionType == CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO &&
                typeof saleTx.zeproCardDone == 'undefined' &&
                !saleTx.zeproCardDone) {
                showMsgDialog("Rounding is not allowed for Zepro", "Warning");
                return false;
            }
            var roundingInput = $("#tenderNewAmountRoundingField").val();
            var subtotal = parseInt($("#tenderNewAmount-dialog").data('subtotal'));
            if (subtotal % 100 == 0)
                showMsgDialog(getMsgValue("pos_warning_msg_rounding_not_applicable"), "warning");
            else if (roundingInput == "")
                showMsgDialog(getMsgValue("pos_warning_msg_enter_rounding_amount"), "warning");
            else if (subtotal % 100 < roundingInput)
                showMsgDialog(getMsgValue("pos_warning_msg_amount_exceeds_configured_rounding_limit"), "warning");
            else {
                $("#tenderNewAmount-dialog").data("roundingAmount", roundingInput);
                var subtotalWithRounding = parseInt($("#tenderNewAmount-dialog").data('subtotal')) - roundingInput;
                var reversedDisc = $("#tenderNewAmount-dialog").data('reversedDisc');
                var msg;
                if ($("#tenderNewAmount-dialog").data('reversedDisc') <= 0)
                    msg = 'Jumlah total baru: ' + numberWithCommas(subtotalWithRounding) + '</br>Rounding Amount: ' + roundingInput;
                else
                    msg = getMsgValue('cmc_reversed_disc_msg').format(reversedDisc, numberWithCommas(subtotalWithRounding)) + '</br>Rounding Amount: ' + roundingInput;
                if (saleTx.totalAdditionalDiscount && saleTx.totalAdditionalDiscount != 0) msg = msg + '</br>Additional Discount: ' + saleTx.totalAdditionalDiscount;
                $("#tenderNewAmountDetails").html(msg);
            }
            var newPayment = $("#tenderNewAmountRoundingField").val('');
        },
        "Continue": function () {
            checkCancelCmc = true;
            saleTx.isAleardyCancelledCmc = true;
            var newPayment = $("#tenderNewAmountField").val();
            var errorMsg = "";
            if (newPayment == "" || newPayment <= 0) {
                errorMsg = getMsgValue('cmc_input_valid_amount_error_msg');
                $("#tenderNewAmountMsg").empty();
                $("#tenderNewAmountMsg").append(errorMsg);
                return false;
            }
            // DEBUG ROUNDING 20170728
            if ($("#tenderNewAmount-dialog").data("roundingAmount") > 0) {
                var subtotalWithRounding = parseInt($("#tenderNewAmount-dialog").data('subtotal')) - parseInt($("#tenderNewAmount-dialog").data("roundingAmount"));
                $("div#numPad div#keyTotal").click();
                $("#inputDisplay").val($("#tenderNewAmount-dialog").data("roundingAmount"));
                $("div#fnPad div#fnRounding").click();
                if (!toggleRounding) return false;
                else {
                    $("#tenderNewAmount-dialog").data('subtotal', subtotalWithRounding);
                    //$("#tenderNewAmountDetails").data('discountWithoutMember', (saleTx.totalAmount - subtotalWithRounding));
                    $("div#numPad div#keyTotal").click();
                    $("#tenderNewAmount-dialog").data("roundingAmount", 0);
                }
            }
            // DEBUG ROUNDING 20170728
            newPayment = $("#tenderNewAmountField").val();

            for (var i in saleTx.orderItems)
                if (saleTx.orderItems[i].qtyWithSecondLayerDiscount > 0 && saleTx.orderItems[i].secondLayerDiscountAmountWithoutMember)
                    saleTx.orderItems[i].secondLayerDiscountAmount = saleTx.orderItems[i].secondLayerDiscountAmountWithoutMember;

            for (var p in saleTx.promotionItems) {
                if (saleTx.promotionItems[p].totalDiscountWithoutCMC) {
                    saleTx.promotionItems[p].totalDiscount = saleTx.promotionItems[p].totalDiscountWithoutCMC;
                    if (saleTx.promotionItems[p].priceDiscountWithoutMember) saleTx.promotionItems[p].priceUnit = saleTx.promotionItems[p].priceDiscountWithoutMember;
                }
            }

            console.log("Discount without member : " + parseInt($("#tenderNewAmountDetails").data('discountWithoutMember')));
            saleTx.totalDiscount = (parseInt($("#tenderNewAmountDetails").data('discountWithoutMember')) + saleTx.memberDiscReversal + saleTx.voidedDiscount);
            //	console.log("--saleTx.totalDiscount : "+saleTx.totalDiscount);
            var isValidAmount = true;

            var balanceDue = CASHIER.getFinalSubtotalTxAmount(saleTx) - saleTx.totalAmountPaid;
            var cardNum = (eftDataObj && eftDataObj.cardNum) ? eftDataObj.cardNum : "";
            var firstSixOfCard = cardNum.substring(0, 6);
            var isCardCoBrand = (saleTx.coBrandNumber && (firstSixOfCard == saleTx.coBrandNumber.substring(0, 6) || cardNum.substring(0, 8) == saleTx.coBrandNumber.substring(0, 8)));
            var memDisc = calculateTotalMemberDiscount();

            if (saleTx.eftTransactionType == CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO &&
                typeof saleTx.zeproCardDone == 'undefined' &&
                !saleTx.zeproCardDone &&
                newPayment < parseInt($("#tenderNewAmount-dialog").data('subtotalZepro'))) {
                showMsgDialog("Zepro can only be paid with full payment", "Warning");
                return false;
            }
            $("#tenderNewAmount-dialog").removeData('subtotalZepro');

            if (memDisc > 0 && isCardCoBrand && (eftType == CONSTANTS.EFT.TYPE.EDC_BCA ||
                eftType == CONSTANTS.EFT.TYPE.CMC_OFFLINE_PAYMENT)) {
                if (newPayment == "" || newPayment <= 0) {
                    isValidAmount = false;
                    errorMsg = getMsgValue('cmc_input_valid_amount_error_msg');
                } else if (newPayment != balanceDue) {
                    isValidAmount = false;
                    errorMsg = getMsgValue('cmc_must_pay_full_error_msg');
                }
            } else {
                var mediaType = $("#tenderNewAmount-dialog").data("mediaType");
                if (newPayment == "" || newPayment <= 0) {
                    isValidAmount = false;
                    errorMsg = getMsgValue('cmc_input_valid_amount_error_msg');
                } else if (!PAYMENT_MEDIA.isValidForTriggering(saleTx, mediaType, newPayment, enablePaymentMedia) && isNoneGiftCardItemInTransaction()) {
                    isValidAmount = false;
                    errorMsg = getMsgValue('cmc_input_valid_amount_error_msg');
                }
            }

            if (isValidAmount) {
                var mediaType = $("#tenderNewAmount-dialog").data("mediaType");
                $("#inputDisplay").val(newPayment);
                if (mediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.INSTALLMENT.name) {
                    //saleTx.totalAmount = CASHIER.getFinalSubtotalTxAmount(saleTx);
                    if (installmentPaymentDetails) installmentPaymentDetails.amount = parseInt($("#inputDisplay").val());
                    //saleTx.totalAmountPaid = parseInt($("#inputDisplay").val());
                    //saleTx.totalChange = saleTx.totalAmountPaid - CASHIER.getFinalSubtotalTxAmount(saleTx);
                }
                var fnExecAfter = $("#tenderNewAmount-dialog").data("fnExecuteAfter");
                if (mediaType && mediaType == CONSTANTS.PAYMENT_MEDIA_TYPES.EFT_ONLINE.name) {
                    processEftOnlinePayment(newPayment, mediaType);
                } else {

                    fnExecAfter();
                }

                $(this).dialog("close");
            } else {
                $("#tenderNewAmountMsg").empty();
                $("#tenderNewAmountMsg").append(errorMsg);
            }
        }
    }
});
// CR ADD DISCOUNT

$("#tenderNewAmount-dialog").dialog('option', 'title', getMsgValue('cmc_tender_new_amount_title'));

/**************************************
 * EFT Offline Series of Dialogs Start
 **************************************/
$("#eftOfflineCardNoCode-dialog").dialog({
    width: 400,
    height: 260,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        // Enabling cardNo input keyboard
        //POS_DIALOGS.enableCardNoKeyboard($(this).find("#eftOfflineCardNoInput"));

        $("#eftOfflineCardNoErrorSpan").empty();
        $(this).dialog('option', 'buttons', {});
        var cancel = function () { eftOfflineCancel(this); };
        var next = cardNumInputNextProcess;
        var buttons = {
            "Cancel": cancel
        };
        if (eftType == CONSTANTS.EFT.TYPE.DEBIT ||
            eftType == CONSTANTS.EFT.TYPE.EDC_PAYMENT) {
            buttons["Finish"] = next;
        } else {
            buttons["Next"] = next;
        }
        $(this).dialog('option', 'buttons', buttons);
    },
    buttons: {}
});

$("#bin-number-input-eftonline-dialog").dialog({
    width: 400,
    height: 260,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        POS_DIALOGS.enableBinNoKeyboard($(this).find("#binNoInput"));
        $("#binNoInput").val('');
    },
    buttons: {
        "Confirm": function () {
            var binNo = $("#binNoInput").val();
            var errorMessage = "";
            var isInfoValid = true;

            var payment = $(this).data("payment");
            var pymtMediaTypeName = $(this).data("pymtMediaTypeName");

            if (!(binNo.length == 6)) {
                errorMessage += "BIN Number must be 6-digit long<br/>";
                isInfoValid = false;
            }

            if (isInfoValid) {
                //get Mdr Configuration
                mdrConfig = getMdrConfig(binNo);
                mdrSurchargeGlobal = Math.round(payment * (mdrConfig.mdrRate / 100));
                payment += mdrSurchargeGlobal;

                saleTx.totalMdrSurcharge += mdrSurchargeGlobal;
                saleTx.totalAmount += mdrSurchargeGlobal;

                $("#bank-mega-payment-type-selection-dialog")
                    .data("payment", payment)
                    .data("pymtMediaTypeName", pymtMediaTypeName)
                    .dialog("open");
            } else {
                $("#binNoErrorSpan").empty();
                $("#binNoErrorSpan").append(errorMessage);
            }
            $(this).dialog("close");
        },
        "Cancel": function () {
            $(this).dialog("close");
            clearEFT(true);
        }
    }
});

function disableZepro() {
    var tmp3 = $('input[name=optGroup]:checked').val().split("|");
    var codeBank = tmp3[0];
    var nameBank = tmp3[1];

    if (codeBank == "1") {
        document.getElementById('checkedZepro').checked = false;
        document.getElementById('checkedZepro').disabled = true;
    } else {
        document.getElementById('checkedZepro').disabled = false;
    }
}
$("#eftOfflineBankId-dialog").dialog({
    width: 410, //400 original size
    height: 360, //320 original size
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        $("#eftOfflineBankIdErrorSpan").empty();
        // resetSelectedBank();
        // if(eftDataObj.bankId == 1){
        // $("#bankIdBankMega").addClass("bankIdBanksSelected");
        // }else if(eftDataObj.bankId == 2){
        // $("#bankIdCitibank").addClass("bankIdBanksSelected");
        // }else if(eftDataObj.bankId == 3){
        // $("#bankIdBRI").addClass("bankIdBanksSelected");
        // }else if(eftDataObj.bankId == 4){
        // $("#bankIdAmex").addClass("bankIdBanksSelected");
        // }else if(eftDataObj.bankId == 5){
        // $("#bankIdBCA").addClass("bankIdBanksSelected");
        // }
        //var tmp1 = "1|Bank Mega;2|Citibank;3|BRI;4|Amex;5|BCA";

        var tmp1 = getConfigValue("EFT_OFFLINE_BANK_LIST");
        console.log("tmp1 " + tmp1);
        var tmp2 = tmp1.split(";");
        $("#bankOption").html('');
        for (i in tmp2) {
            var tmp3 = tmp2[i].split("|");
            var codeBank = tmp3[0];
            var nameBank = tmp3[1];
            var selOption = $('<tr>').append($('<td style="width:90%">').append($('<label for="optBank_' + tmp2[i] + '">' + nameBank + '</label></td>'))).append($('<td>').append($('<input style="width:10%;" type="radio" id="optBank_' + tmp2[i] + '" name="optGroup" value="' + tmp2[i] + '" onclick="disableZepro();" /></td>'))).append($('</tr>'));
            $("#bankOption").append(selOption)
        }
        console.log("codeBank" + codeBank);
    },
    buttons: {
        "Back": function () {
            if (eftType == CONSTANTS.EFT.TYPE.CMC_OFFLINE_PAYMENT) {
                eftType = CONSTANTS.EFT.TYPE.OFFLINE_PAYMENT;
            }
            $(this).dialog("close");
            $("#eftOfflineCardNoCode-dialog").dialog("open");
        },
        "Next": function () {
            var errorMessage = "";
            var isInfoValid = true;
            var tmp3 = $('input[name=optGroup]:checked').val().split("|");
            var codeBank = tmp3[0];
            var nameBank = tmp3[1];
            eftDataObj.bankId = codeBank;
            eftDataObj.bankName = nameBank;
            console.log("eftDataObj.bankId selected : " + eftDataObj.bankId);
            var cekZep = $("#checkZepro input[type='checkBox']:checked").length;
            if (cekZep) {
                eftTransactionType = CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO;
                eftDataObj.transactionType = eftTransactionType;
            }
            if (eftDataObj.bankId == null || eftDataObj.bankId == "") {
                errorMessage += "Please select bank.<br/>";
                isInfoValid = false;
            }
            if (isInfoValid) {
                console.log("eftTransactionType : " + eftTransactionType)
                uilog("DBUG", "eftDataObj : " + eftDataObj);
                $(this).dialog("close");
                $("#eftOfflineApprovalCodeInput").val(eftDataObj.approvalCode);
                $("#eftOfflineApprovalCode-dialog").data("openerDialog", this).dialog("open");
            } else {
                $("#eftOfflineBankIdErrorSpan").empty();
                $("#eftOfflineBankIdErrorSpan").append(errorMessage);
            }

        },
        "Cancel": function () {
            eftOfflineCancel(this);
        }
    }
});

$("#eftOfflineApprovalCode-dialog").dialog({
    width: 400,
    height: 320,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        $("#eftOfflineApprovalCodeErrorSpan").empty();
    },
    buttons: {
        "Back": function () {
            var approvalCode = $("#eftOfflineApprovalCodeInput").val();
            eftDataObj.approvalCode = approvalCode;

            if (eftType == CONSTANTS.EFT.TYPE.EDC_BCA) {
                $("#eftOfflineCardNoCode-dialog").dialog("open");
            } else {
                $("#eftOfflineBankId-dialog").dialog("open");
            }

            $(this).dialog("close");
        },
        "Finish": function () {
            var approvalCode = $("#eftOfflineApprovalCodeInput").val();
            var errorMessage = "";
            var isInfoValid = true;

            if (approvalCode.length != 6) {
                errorMessage += "Approval code must be 6 digits long<br/>";
                isInfoValid = false;
            }

            if (isInfoValid) {
                eftDataObj.approvalCode = approvalCode;
                $(this).dialog("close");
                saveEftPayment();
            } else {
                $("#eftOfflineApprovalCodeErrorSpan").empty();
                $("#eftOfflineApprovalCodeErrorSpan").append(errorMessage);
            }

        },
        "Cancel": function () {
            eftOfflineCancel(this);
        }
    }
});

$("#alloPaylaterApprovalCode-dialog").dialog({
    width: 400,
    height: 320,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        $("#alloPaylaterApprovalCodeErrorSpan").empty();
    },
    buttons: {
        "Back": function () {
            var approvalCode = $("#alloPaylaterApprovalCodeInput").val();
            eftDataObj.approvalCode = approvalCode;

            if (eftType == CONSTANTS.EFT.TYPE.EDC_BCA) {
                $("#alloPaylaterCardNoCode-dialog").dialog("open");
            } else {
                $("#alloPaylaterBankId-dialog").dialog("open");
            }

            $(this).dialog("close");
        },
        "Finish": function () {

            var approvalCode = $("#alloPaylaterApprovalCodeInput").val();
            var errorMessage = "";
            var isInfoValid = true;

            if (approvalCode.length <= 6) {
                errorMessage += "Approval code must be more than 6 digits<br/>";
                isInfoValid = false;
            }

            if (isInfoValid) {
                eftDataObj = {};
                var pymtMediaTypeName = CONSTANTS.PAYMENT_MEDIA_TYPES.ALLO_PAYMENT.name;
                processNonCmcPayment(function () {
                    var pymtMediaTypeName = CONSTANTS.PAYMENT_MEDIA_TYPES.ALLO_PAYMENT.name;
                    var payment = parseInt($("#inputDisplay").val());
                    var MLCMerchInfo = {};
                    MLCMerchInfo.acntNo = "-";
                    MLCMerchInfo.amount = payment;
                    MLCMerchInfo.approvalCode = approvalCode;
                    MLCMerchInfo.rc = "";
                    MLCMerchInfo.rcDesc = "";
                    MLCMerchInfo.customerName = "";
                    MLCMerchInfo.reffNo = approvalCode;
                    if (PAYMENT_MEDIA.isValidForTriggering(saleTx, pymtMediaTypeName, payment, enablePaymentMedia) && isNoneGiftCardItemInTransaction()) {
                        CASHIER.executePaymentMedia(saleTx, pymtMediaTypeName, payment, { MLCPayment: MLCMerchInfo });
                    }
                }, pymtMediaTypeName);

                $(this).dialog("close");
                //saveEftPayment();
            } else {
                $("#alloPaylaterApprovalCodeErrorSpan").empty();
                $("#alloPaylaterApprovalCodeErrorSpan").append(errorMessage);
            }

        },
        "Cancel": function () {
            eftOfflineCancel(this);
        }
    }
});

$("#bank-mega-input-voided-transaction-dialog").on("dialogclose", function (event, ui) {
    $("#eftOnlineVoidErrorSpan").empty();
    $("#transactionIdInput").val('');
});
$("#bank-mega-input-voided-transaction-dialog").dialog({
    width: 400,
    height: 350,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        $("#eftOnlineVoidErrorSpan").empty();
        $("#transactionIdInput").val('');
    },
    buttons: {
        "Validate": function () {
            var errorMessage = "";
            var isInfoValid = true;
            var transactionId = $("#transactionIdInput").val();

            if (transactionId.length != 17) {
                errorMessage = getMsgValue("pos_warning_msg_short_transaction_id_length");
                isInfoValid = false;
            }

            if (isInfoValid) {
                var voidTxn = getVoidedTransaction(transactionId);
                if (voidTxn) {
                    $("#bank-mega-input-trace-number-dialog")
                        .data("voidTxn", voidTxn)
                        .dialog("open");
                    $(this).dialog("close");
                } else {
                    errorMessage = getMsgValue("pos_warning_msg_void_transaction_not_found");
                    $("#eftOnlineVoidErrorSpan").empty();
                    $("#eftOnlineVoidErrorSpan").html(errorMessage);
                }
            } else {
                $("#eftOnlineVoidErrorSpan").empty();
                $("#eftOnlineVoidErrorSpan").html(errorMessage);
            }
        },
        "Cancel": function () {
            $(this).dialog("close");
            clearEFT(true);
        }
    }
});

$("#bank-mega-input-trace-number-dialog").on("dialogclose", function (event, ui) {
    if ($("#bank-mega-input-trace-number-dialog").data("voidTxn")) {
        $(this).removeData("voidTxn");
    }
    $("#eftTraceNumberErrorSpan").empty();
    $("#traceNumberInput").val('');
});
$("#bank-mega-input-trace-number-dialog").dialog({
    width: 400,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        $("#eftTraceNumberErrorSpan").empty();
        $("#traceNumberInput").val('');
    },
    buttons: {
        "Ok": function () {
            var traceNumber = $("#traceNumberInput").val();
            var isInfoValid = true;
            var errorMessage = "";
            var voidedTxn = $("#bank-mega-input-trace-number-dialog").data("voidTxn");

            if (traceNumber.length != 6) {
                errorMessage += "Trace number must be 6 digits long<br/>";
                isInfoValid = false;
            }

            if (isInfoValid) {
                if (eftTransactionType === CONSTANTS.EFT.EFT_TRANSACTION_TYPE.VOID.name && typeof voidedTxn != 'undefined') {
                    EFT.voidEftTxnWithVoidTxn(traceNumber, voidedTxn);
                } else if (eftTransactionType === CONSTANTS.EFT.EFT_TRANSACTION_TYPE.VOID.name && typeof voidedTxn == 'undefined') {
                    EFT.voidEftTxnWithoutVoidTxn(traceNumber);
                } else if (eftTransactionType === CONSTANTS.EFT.EFT_TRANSACTION_TYPE.RETRIEVE_TXN.name) {
                    EFT.retrieveEftTxn(traceNumber);
                } else {
                    showMsgDialog(getMsgValue("pos_error_msg_eft_transaction_is_not_supported"), "error");
                }
            } else {
                $("#eftTraceNumberErrorSpan").empty();
                $("#eftTraceNumberErrorSpan").append(errorMessage);
            }

        },
        "Cancel": function () {
            if ($("#bank-mega-input-trace-number-dialog").data("voidTxn")) {
                $(this).removeData("voidTxn");
            }
            $(this).dialog("close");
            clearEFT(true);
        }
    }
});

/**
 *  Bank Mega Menu; Bank Mega Button Triggered
 *  Void
 *  Settlement All
 *  Reprint Summary
 *  Reprint All Detail Transaction
 */
$("#bank-mega-other-transaction-type-dialog").on("dialogclose", function (event, ui) { });
$("#bank-mega-other-transaction-type-dialog").dialog({
    width: 340,
    height: 600,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    open: function (event, ui) { }
});
$("div.bank-mega-other-transaction-selection-class").click(function (eventObj) {
    var targetElement = eventObj.currentTarget;
    var targetElementId = $(targetElement).attr("id");
    var hasItemsScanned = hasScannedItem(saleTx);
    /*Void*/
    if (targetElementId == "voidEftBtn" && !hasItemsScanned && connectionOnline) {
        eftType = CONSTANTS.EFT.TYPE.ONLINE_PAYMENT;
        eftTransactionType = CONSTANTS.EFT.EFT_TRANSACTION_TYPE.VOID.name;
        $("#eft-void-transaction-menu").dialog("open");
    } /*Settlement All*/
    else if (targetElementId == "settlementBtn" && !hasItemsScanned && connectionOnline) {
        eftTransactionType = CONSTANTS.EFT.EFT_TRANSACTION_TYPE.SETTLEMENT_ALL.name;
        var eftParams = {
            bank: configuration.banks[CONSTANTS.EFT.BANK.BANK_MEGA.name],
            onlineFlag: CONSTANTS.EFT.STATUS.ONLINE,
            transactionType: eftTransactionType,
            vendor: eftVendor
        };
        EFT.processEFTOnlineTransaction(eftParams);
        $("#eft-processing-dialog").dialog("open");
        $('#bank-mega-other-transaction-type-dialog').dialog("close");
    } /*Reprint Transaction Summary*/
    else if (targetElementId == "reprintEftTxnSummaryBtn" && !hasItemsScanned) {
        eftTransactionType = CONSTANTS.EFT.EFT_TRANSACTION_TYPE.REPRINT_ALL_SUMMARY_TXN.name;
        var eftParams = {
            bank: configuration.banks[CONSTANTS.EFT.BANK.BANK_MEGA.name],
            onlineFlag: CONSTANTS.EFT.STATUS.ONLINE,
            transactionType: eftTransactionType,
            vendor: eftVendor
        };
        EFT.processEFTOnlineTransaction(eftParams);
        $("#eft-processing-dialog").dialog("open");
    } /*Reprint Detail Transaction*/
    else if (targetElementId == "reprintEftDetailTxnBtn" && !hasItemsScanned) {
        eftTransactionType = CONSTANTS.EFT.EFT_TRANSACTION_TYPE.REPRINT_ALL_DETAIL_TXN.name;
        var eftParams = {
            bank: configuration.banks[CONSTANTS.EFT.BANK.BANK_MEGA.name],
            onlineFlag: CONSTANTS.EFT.STATUS.ONLINE,
            transactionType: eftTransactionType,
            vendor: eftVendor
        };
        EFT.processEFTOnlineTransaction(eftParams);
        $("#eft-processing-dialog").dialog("open");
    } /*Reprint Previous Transaction*/
    else if (targetElementId == "retrieveEftTxnBtn") {
        eftType = CONSTANTS.EFT.TYPE.ONLINE_PAYMENT;
        eftTransactionType = CONSTANTS.EFT.EFT_TRANSACTION_TYPE.RETRIEVE_TXN.name;
        $("#eft-retrieve-transaction-dialog").dialog("open");
    }

    //not allowed eft transactions when offline
    if (!connectionOnline && (targetElementId == 'voidEftBtn' ||
        targetElementId == 'settlementBtn')) {
        showMsgDialog(getMsgValue("eft_msg_info_transaction_not_allowed_pos_offline"), "error");
    }

    // eft transaction is not allowed on the ff. w/ scanned items
    if (hasItemsScanned && (
        targetElementId == "reprintEftDetailTxnBtn" ||
        targetElementId == "reprintEftTxnSummaryBtn" ||
        targetElementId == "settlementBtn" ||
        targetElementId == "voidEftBtn")) {
        showMsgDialog(getMsgValue("eft_msg_info_transaction_not_allowed"), "error");
    }

    if ($('#bank-mega-other-transaction-type-dialog').dialog("isOpen"))
        $('#bank-mega-other-transaction-type-dialog').dialog("close");
});


$("#eft-void-transaction-menu").on("dialogclose", function (event, ui) { });
$("#eft-void-transaction-menu").dialog({
    width: 340,
    height: 290,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    open: function (event, ui) { }
});
$("div.eft-void-transaction-menu-selection-class").click(function (eventObj) {
    var targetElement = eventObj.currentTarget;
    var targetElementId = $(targetElement).attr("id");
    /*Void Eft no Existing Transaction*/
    if (targetElementId == "voidEftWithoutTxnBtn" && !hasScannedItem(saleTx)) {
        $("#bank-mega-input-trace-number-dialog").dialog("open");
    } /*Void Eft with Existing Voided Transaction*/
    else if (targetElementId == "voidEftWithTxnBtn" && !hasScannedItem(saleTx)) {
        $("#bank-mega-input-voided-transaction-dialog").dialog("open");
    } else {
        showMsgDialog(getMsgValue("pos_error_msg_eft_transaction_is_not_supported"), "error");
    }

    // eft transaction is not allowed on the ff. w/ scanned items
    if (hasScannedItem(saleTx) && (
        targetElementId == "voidEftWithoutTxnBtn" ||
        targetElementId == "voidEftWithTxnBtn")) {
        showMsgDialog(getMsgValue("eft_msg_info_transaction_not_allowed"), "error");
    }

    if ($('#eft-void-transaction-menu').dialog("isOpen"))
        $('#eft-void-transaction-menu').dialog("close");
});


$("#bank-mega-installment-terms-dialog").on("dialogclose", function (event, ui) { });
$("#bank-mega-installment-terms-dialog").dialog({
    width: 570,
    height: 400,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    open: function (event, ui) { }
});
$("div.eft-transaction-terms").click(function (eventObj) {
    var targetElement = eventObj.currentTarget;
    var targetElementId = $(targetElement).attr("id");
    var payment = $("#bank-mega-installment-terms-dialog").data("payment");
    var pymtMediaTypeName = $("#bank-mega-installment-terms-dialog").data("pymtMediaTypeName");
    var transactionTypeSuffix = "";
    //Installment Terms
    /*3months*/
    if (targetElementId == "threeMonthsBtn") {
        transactionTypeSuffix = "3";
    } /*6months*/
    else if (targetElementId == "sixMonthsBtn") {
        transactionTypeSuffix = "6";
    } /*9months*/
    else if (targetElementId == "nineMonthsBtn") {
        transactionTypeSuffix = "9";
    } /*12months*/
    else if (targetElementId == "twelveMonthsBtn") {
        transactionTypeSuffix = "12";
    } /*18months*/
    else if (targetElementId == "eighteenMonthsBtn") {
        transactionTypeSuffix = "18";
    } /*24months*/
    else if (targetElementId == "twentyFourMonthsBtn") {
        transactionTypeSuffix = "24";
    } /*36months*/
    else if (targetElementId == "thirtySixMonthsBtn") {
        transactionTypeSuffix = "36";
    }

    //Sets the transaction type;
    //Each term is considered a different transaction type.
    if (eftTransactionType.indexOf(CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO) > -1)
        eftTransactionType = CONSTANTS.EFT.INSTALLMENT_TYPE.ZEPRO;

    eftTransactionType = eftTransactionType + transactionTypeSuffix;

    if (PAYMENT_MEDIA.isValidForTriggering(
        saleTx, pymtMediaTypeName,
        payment, enablePaymentMedia) && isNoneGiftCardItemInTransaction()) {
        eftPaymentProcess(payment);
    }
    $("#bank-mega-installment-terms-dialog").dialog("close");
    $("#eft-processing-dialog").dialog("open");
});
/**************************************
 * EFT Offline Series of Dialogs Ends
 **************************************/

/**************************************
 * Installment Start
 **************************************/
$("#installmentAppNum-dialog").dialog({
    width: 400,
    height: 280,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        $("#installmentMsg").empty();
        $("#installmentAppNumField").val("");
    },
    buttons: {
        Cancel: function () {
            $(this).dialog("close");
            refreshInstallment();
            startInstallment();
        },
        OK: function () {
            var appNumber = $("#installmentAppNumField").val();

            if (appNumber == "" || (appNumber && !isAlphaNumeric(appNumber.trim()))) {
                $("#installmentMsg").html("INVALID ENTRY");
            } else {
                $("#installmentMsg").empty();
                //process installment payment
                showApplicationNumConfirmDialog(appNumber);
                $(this).dialog("close");
            }
        }
    }
});

$("#installmentAppNum-dialog").on("dialogclose", function (event, ui) {
    $("#installmentMsg").empty();
    $("#installmentAppNumField").val("");
});

$("#installmentConfirmAppNum-dialog").dialog({
    width: 400,
    height: 200,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        $("#installmentConfirmMsg").empty();

        var appNum = $(this).data("applicationNum");
        $(".modalMessage").text("Confirm Applicaton Number: " + appNum);
    },
    buttons: {
        NO: function () {
            $(this).dialog("close");
            showEnterApplicationNumDialog();
        },
        YES: function () {
            processInstallment($(this).data("applicationNum"));
            $(this).dialog("close");
        }
    }
});

$("#installmentConfirmAppNum-dialog").on("dialogclose", function (event, ui) {
    $("#installmentConfirmMsg").empty();
    $(".modalMessage").empty();
});

$("#installmentConfirmCompany-dialog").dialog({
    width: 400,
    height: 200,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        $("#installmentConfirmCompanyMsg").empty();

        var companyName = $(this).data("companyName");
        var confirmMsg = $(this).data("confirmMsg");
        $(".modalMessage").text(confirmMsg + companyName);
    },
    buttons: {
        NO: function () {
            installmentPaymentDetails = null;
            $(this).dialog("close");
        },
        YES: function () {
            // CR ADD DISCOUNT
            $(this).dialog("close");
            processNonCmcPayment(function () {
                $("#installmentConfirmCompany-dialog").dialog("close");
                showEnterApplicationNumDialog();
            }, $("tenderNewAmount-dialog").data('mediaType'));
            // CR ADD DISCOUNT
        }
    }
});

$("#installmentConfirmCompany-dialog").on("dialogclose", function (event, ui) {
    $("#installmentConfirmCompanyMsg").empty();
    $(".modalMessage").empty();
});



/**************************************
 * Installment End
 **************************************/

/**************************************
 * DEPSTORE/PROFIT BARCODE SELECTION
 **************************************/
$("#barcode-menu-dialog").dialog({
    width: 340,
    height: 290,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false
});

$("#depstore-discount-dialog").dialog({
    width: 545,
    height: 450,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    open: function (event, ui) {
        $('.toggle-depstore-discount').removeClass('toggle-depstore-discount').addClass('depstore-discount');
    },
    buttons: {
        Cancel: function () {
            $('.toggle-depstore-discount').removeClass('toggle-depstore-discount').addClass('depstore-discount');
            $(this).dialog("close");
        },
        OK: function () {
            var idBtn = $('.toggle-depstore-discount').attr('id');
            var orderItemObj = null;
            var discPrice = 0,
                discAmount = 0;

            switch (idBtn) {
                case 'percentManual':
                    break;
                case 'percentAmtOff':
                    break;
                default:
                    $('#deptNettPrice').data('discprice').push(parseInt(idBtn.split('percent')[1]) / 100);
            }

            $('.toggle-depstore-discount').removeClass('toggle-depstore-discount').addClass('depstore-discount');
            calculateDeptStoreNettPrice();
            $(this).data('mode', '').dialog("close");
        }
    }
});

$("#depstoreDiscountField").keyboard({
    display: numberDisplay2,
    layout: 'custom',
    customLayout: customNumberLayout2,
    maxLength: 2,
    visible: function (e, keyboard, el) {
        addClickHandler(keyboard);
    }
});

$("#depstoreAmtOffField").keyboard({
    display: numberDisplay2,
    layout: 'custom',
    customLayout: customNumberLayout2,
    visible: function (e, keyboard, el) {
        addClickHandler(keyboard);
    }
});

$("#depstoreSPGField").keyboard({
    display: numberDisplay2,
    layout: 'custom',
    customLayout: customNumberLayout2,
    maxLength: 13,
    usePreview: false,
    visible: function (e, keyboard, el) {
        addClickHandler(keyboard);
    }
});

$("#depstoreVoucherField").keyboard({
    display: numberDisplay2,
    layout: 'custom',
    customLayout: customNumberLayout2,
    maxLength: 20,
    usePreview: false,
    visible: function (e, keyboard, el) {
        addClickHandler(keyboard);
    }
});

$("#depstoreBarcodeField").keyboard({
    display: numberDisplay2,
    layout: 'custom',
    customLayout: customNumberLayout2,
    maxLength: 13,
    canceled: function (e, keyboard, el) {
        el.value = '';
    },
    visible: function (e, keyboard, el) {
        addClickHandler(keyboard);
    }
});

$("#depstoreClassField").keyboard({
    display: numberDisplay2,
    layout: 'custom',
    customLayout: customNumberLayout2,
    maxLength: 10,
    usePreview: false,
    visible: function (e, keyboard, el) {
        addClickHandler(keyboard);
    }
});

$("input#trxid").keyboard({
    display: numberDisplay1,
    layout: 'custom',
    customLayout: customNumberLayout1,
    maxLength: 17,
    visible: function(e, keyboard, el) {
        addClickHandler(keyboard);
    }
});

$("#depstoreBarcodeField").change(
    function () {
        var priceBarcode = $(this).val();
        if (priceBarcode !== '') {
            var sPrice;
            // DEBUG INPUT RRICE DEPTSTORE
            //if (isInputFromScanner == true) {
            if (priceBarcode.length >= 13) {
                if (configuration.properties['DEPTSTORE_PRICE_PREFIX'].split(',').indexOf(priceBarcode.substring(0, 1)) < 0) {
                    showMsgDialog('Please scan price barcode (prefix ' + configuration.properties['DEPTSTORE_PRICE_PREFIX'] + ')', 'warning');
                    return false;
                }

                sPrice = parseInt(priceBarcode.substring(1, 12));
            } else {
                sPrice = parseInt(priceBarcode);
            }
            //} 
            //else{
            //	sPrice = parseInt(priceBarcode);
            //}
            $('#deptScannedPrice').html(numberWithCommas(sPrice));
            $('#deptNettPrice').data('sprice', sPrice);
            calculateDeptStoreNettPrice();
        } else {
            $('#deptScannedPrice').html('0');
            $('#deptDiscPrice').html('0');
            $('#deptAmtOffPrice').html('0');
            $('#deptVoucherPrice').html('0'); // INHOUSE VOUCHER 2017-04-13
            $('#deptSubtotalPrice').html('0'); // INHOUSE VOUCHER 2017-04-13
            $('#deptNettPrice').data({ 'sprice': 0, 'nprice': 0, 'discprice': [] }).html('0');
        }
    }
);

/* $("#tspcOrder").change(
    function()
    {
        var spoNo = $(this).val();
        if (spoNo !== '') {
            $("#tspcOrder").text(spoNo);
        }
    }
); */

$("#depstore-manual-disc-dialog").dialog({
    width: 400,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        $("#depstoreDiscountField").val('');
        $('.ui-keyboard-preview').val('');
    },
    buttons: {
        Cancel: function () {
            $('.toggle-depstore-discount').removeClass('toggle-depstore-discount').addClass('depstore-discount');
            $(this).dialog("close");
        },
        OK: function () {
            $(this).dialog("close");
            $('#depstore-discount-dialog').dialog("close");
            if ($('#depstoreDiscountField').val() != '') {
                $('#deptNettPrice').data('discprice').push(parseInt($('#depstoreDiscountField').val()) / 100);
                $('.toggle-depstore-discount').removeClass('toggle-depstore-discount').addClass('depstore-discount');
                calculateDeptStoreNettPrice();
            }
        }
    }
});

$("#depstore-amount-off-dialog").dialog({
    width: 400,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        $('#depstoreAmtOffField').val('');
        $('.ui-keyboard-preview').val('');
    },
    buttons: {
        Cancel: function () {
            $('.toggle-depstore-discount').removeClass('toggle-depstore-discount').addClass('depstore-discount');
            $(this).dialog("close");
        },
        OK: function () {
            $(this).dialog("close");
            $('#depstore-discount-dialog').dialog("close");

            if ($('#depstoreAmtOffField').val() != '') {
                if (parseInt($('#depstoreAmtOffField').val()) <= 1) {
                    showMsgDialog('Amount Off must be > 1', 'warning');
                    return false;
                } else if (parseInt($('#deptNettPrice').data('nprice')) < parseInt($('#depstoreAmtOffField').val())) {
                    showMsgDialog('Amount Off cannot be greater than Current Nett Price', 'warning');
                    return false;
                }

                $('#deptNettPrice').data('discprice').push(parseInt($('#depstoreAmtOffField').val()));
                $('.toggle-depstore-discount').removeClass('toggle-depstore-discount').addClass('depstore-discount');
                calculateDeptStoreNettPrice();
            }
        }
    }
});

// INHOUSE VOUCHER 2017-04-13
$("#depstore-voucher-dialog").dialog({
    width: 400,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        $("#depstoreVoucherField").val("");
        if ($("#depstore-voucher-dialog").data('mode') == 'void') {
            $("#voucherMsg").html('Void ' + saleTx.voucherToBeVoided + ' Voucher');
        }
    },
    buttons: {
        Cancel: function () {
            $(this).dialog("close");
        },
        OK: function () {
            var voucherBarcode = $('#depstoreVoucherField').val().trim();
            if (voucherBarcode == '') return false;

            if ($("#depstore-voucher-dialog").data('mode') == 'inquiry') // DEPTSTORE ITEM MODE
            {
                /*var voucherResp = {
                    'rspCode': 200,
                    'msg': 'SUCCESS',
                    'voucherId': voucherBarcode,
                    'voucherAmt': 100000,
                    'expDate': '2016-12-31',
                    'promoId': '1003',
                    'auxInfo': {
                        'status': 'GENERATED',
                    	
                    }
                }; // DUMMY VOUCHER RESP*/
                var voucherResp = callAgent('inquiry', { 'voucherId': voucherBarcode });
                if (voucherResp.rspCode != 200) {
                    showMsgDialog(voucherResp.rspCode + ' - ' + voucherResp.msg, 'warning');
                    return false;
                }

                $('#voucherNumberInfo').text(voucherResp.result.voucherId);
                $('#voucherAmountInfo').text(numberWithCommas(voucherResp.result.voucherAmt));
                $('#voucherExpDateInfo').text(voucherResp.result.expDate);
                $('#voucherStatusInfo').text(voucherResp.result.status);
                $("#voucherInfo-dialog").dialog('open');

                CustomerPopupScreen.cus_showVoucherInfo(voucherResp);

                $(this).dialog("close");
                return false;
            } else if ($("#depstore-voucher-dialog").data('mode') == 'void') // DEPTSTORE ITEM MODE
            {
                /*var voucherResp = {
                    'rspCode': 200,
                    'msg': 'SUCCESS',
                    'voucherId': voucherBarcode,
                    'voucherAmt': 100000,
                    'expDate': '2016-12-31',
                    'promoId': '1003',
                    'auxInfo': {
                        'status': 'GENERATED',
                    	
                    }
                }; // DUMMY VOUCHER RESP*/
                console.log('Invalidating Voucher: ' + voucherBarcode);
                var voucherList = [];
                voucherList.push(voucherBarcode);
                var voucherResp = callAgent('void', { 'trxId': saleTx.baseTransactionId, 'voucherId': voucherBarcode, 'voidAmt': $("#depstore-voucher-dialog").data('voidAmt') });

                if (voucherResp.rspCode != 200) {
                    showMsgDialog(voucherResp.rspCode + ' - ' + voucherResp.msg, 'warning');
                    return false;
                } else {
                    if (saleTx.voucherToBeVoided && saleTx.voucherToBeVoided > 0) {
                        if (!saleTx.voucherVoided) saleTx.voucherVoided = 0;
                        saleTx.voucherVoided++;
                        saleTx.voucherToBeVoided--;
                    }

                    if (saleTx.voucherToBeVoided > 0) showMsgDialog('Voucher #' + voucherBarcode + ' has been voided', 'info');
                    $('#depstoreVoucherField').val('');
                }


                /*printReceipt({
                    body: setVoidVoucher(saleTx, )
                });*/

                // ADD TO MARKETING VOUCHER OBJECT
                var voidConfigVoucher = $("#depstore-voucher-dialog").data('voidConfigVoucher');

                if (!saleTx.marketingVoucher) {
                    saleTx.marketingVoucher = {
                        'marketingVoucherPromoId': voidConfigVoucher.marketingVoucher.id,
                        'eventSponsorProduct': [],
                        'marketingVoucherRewardNo': 0,
                        'marketingVoucherStartDate': voidConfigVoucher.marketingVoucher.startDate,
                        'marketingVoucherEndDate': voidConfigVoucher.marketingVoucher.endDate,
                        'marketingVoucherType': voidConfigVoucher.marketingVoucher.type,
                        'marketingVoucherMaxReward': voidConfigVoucher.marketingVoucher.maxRewards,
                        'marketingVoucherObj': {
                            'voucherList': []
                        }
                    };
                }

                saleTx.marketingVoucher.marketingVoucherObj.voucherList.push(voucherBarcode);
                saleTx.marketingVoucher.marketingVoucherRewardNo++;

                printReceipt({
                    body: setVoucherVoid(saleTx, voucherBarcode)
                });
                if (saleTx.voucherToBeVoided < 1) {
                    $("#voucherMsg").html("");
                    $(this).dialog("close");
                    $("#fnCash").click();
                } else $("#voucherMsg").html("Void " + saleTx.voucherToBeVoided + " Voucher");
                return false;
            }

            console.log(configuration.terminalType);
            if (configuration.terminalType != 'DEPTSTORE') {
                if (enablePaymentMedia && !toggleVoid && !currentPaymentMediaType) {
                    // SEND BARCODE TO GET VOUCHER
                    if (voucherBarcode != '') {
                        console.log(saleTx.orderItems);
                        redeemRes = redeemEventRewards(voucherBarcode, saleTx.orderItems, (typeof saleTx.openDeductAmount == 'undefined' ? [] : saleTx.openDeductAmount), true); // TRUE if voucher as PAYMENT
                        /*if(typeof redeemRes.mvRedeem == 'undefined')
                        {
                            //showMsgDialog('Server Voucher mengalami kegagalan, silakan coba kembali', 'warning');
                            return false;
                        }*/
                        if (redeemRes.mvRedeem.rspCode != 200) {
                            showMsgDialog(redeemRes.mvRedeem.rspCode + ' - ' + redeemRes.mvRedeem.msg, 'warning');
                            return false;
                        }
                        var voucherObj = calculatePaymentVoucher(voucherBarcode, redeemRes);
                        if (!voucherObj) return false;

                        if (typeof saleTx.redeemVoucherList == 'undefined') saleTx.redeemVoucherList = [];
                        saleTx.redeemVoucherList.push(voucherObj);
                    } else {
                        showMsgDialog('Silakan scan barcode VOUCHER', 'warning');
                        return false;
                    }
                } else showKeyNotAllowedMsg();
            } else {
                if ($("#depstore-voucher-dialog").data('mode') == 'group') // DEPTSTORE GROUP MODE
                {
                    var orderItems = saleTx.orderItems;
                    var groupItems = [];
                    var i = orderItems.length - 1;
                    var lastGroup = '';
                    var lastCategoryId = '';

                    for (var i = orderItems.length - 1; i >= 0; i--) {
                        var item = orderItems[i];
                        uilog('DBUG', item);
                        if (item.categoryId == 'MVOUCHER' || item.voucherSingleMode) {
                            if (groupItems.length > 0) break;
                            else continue;
                        }

                        if (lastCategoryId == '') lastCategoryId = item.categoryId;

                        if (lastGroup == '') lastGroup = (item.categoryId == 'DEPTSTORE') ? item.ean13Code.substr(1, 4) : item.sku.substring(0, 2);

                        if (lastCategoryId == item.categoryId &&
                            lastGroup == ((item.categoryId == 'DEPTSTORE') ? item.ean13Code.substr(1, 4) : item.sku.substring(0, 2))) {
                            item.idx = i;
                            groupItems.push(item);
                        }
                    }

                    if (groupItems.length == 0) {
                        showMsgDialog('149 - NOT ENOUGH NON-DISCOUNTED ITEM FOR VOUCHER REDEEM', 'warning');
                        return false;
                    }

                    var redeemRes = redeemEventRewards(voucherBarcode, groupItems, (typeof groupItems.last.openDeductAmount == 'undefined' ? [] : groupItems.last.openDeductAmount), true); // TRUE VOUCHER AS PAYMENT on DEPTSTORE
                    /*if(typeof redeemRes.mvRedeem == 'undefined')
                    {
                        //showMsgDialog('Server Voucher mengalami kegagalan, silakan coba kembali', 'warning');
                        return false;
                    }*/

                    if (redeemRes.mvRedeem.rspCode != 200) {
                        showMsgDialog(redeemRes.mvRedeem.rspCode + ' - ' + redeemRes.mvRedeem.msg, 'warning');
                        return false;
                    }

                    var voucherObj = null;
                    if (redeemRes.mvRedeem.mode == '1') {
                        voucherObj = calculatePaymentVoucher(voucherBarcode, redeemRes);
                        if (!voucherObj) return false;
                    } else {
                        voucherObj = calculateDeptStoreVoucher(voucherBarcode, groupItems, redeemRes);
                        if (!voucherObj) return false;

                        saleTx.totalDiscount += voucherObj.priceUnit;
                        console.log(voucherObj);
                        saleTx.orderItems.push(voucherObj);
                        renderScannedItem(voucherObj);
                        printScannedItem();
                    }
                    voucherObj.voucherNumber = voucherBarcode;

                    if (typeof saleTx.redeemVoucherList == 'undefined') saleTx.redeemVoucherList = [];
                    saleTx.redeemVoucherList.push(voucherObj);
                } else if ($("#depstore-voucher-dialog").data('mode') == 'single') // DEPTSTORE ITEM MODE
                {
                    var orderItems = [];
                    var item = $("#depstore-detail-dialog").data('item');
                    item.priceSubtotal = itemQty * parseInt($('#deptNettPrice').data('nprice'));
                    item.discountAmount = 0;
                    item.memberDiscountAmount = 0;
                    item.crmMemberDiscountAmount = 0;
                    item.discBtnAmount = 0;
                    item.secondLayerDiscountAmount = 0;
                    item.openDeductAmount = $("#depstore-detail-dialog").data('openDeductAmount');
                    orderItems.push(item);

                    var redeemRes = redeemEventRewards(voucherBarcode, orderItems, (typeof orderItems.last.openDeductAmount == 'undefined' ? [] : orderItems.last.openDeductAmount), false); // FALSE VOUCHER AS VOUCHER on DEPTSTORE
                    /*if(typeof redeemRes.mvRedeem == 'undefined')
                    {
                        //showMsgDialog('Server Voucher mengalami kegagalan, silakan coba kembali', 'warning');
                        return false;
                    }*/

                    if (redeemRes.mvRedeem.rspCode != 200) {
                        showMsgDialog(redeemRes.mvRedeem.rspCode + ' - ' + redeemRes.mvRedeem.msg, 'warning');
                        return false;
                    }

                    var voucherObj = calculateDeptStoreVoucher(voucherBarcode, orderItems, redeemRes);
                    if (!voucherObj) return false;
                    voucherObj.voucherNumber = voucherBarcode;

                    $('#deptNettPrice').data('discvoucher').push(voucherObj.priceUnit);
                    $('#deptNettPrice').data('discvoucherbarcode').push(voucherBarcode);
                    /*if (typeof $("#depstore-detail-dialog").data('openDeductAmount') == 'undefined')
                        $("#depstore-detail-dialog").data('openDeductAmount', []);	*/

                    $("#depstore-detail-dialog").data('openDeductAmount', voucherObj.openDeductAmount);

                    calculateDeptStoreNettPrice();

                    if (typeof saleTx.redeemVoucherList == 'undefined') saleTx.redeemVoucherList = [];
                    saleTx.redeemVoucherList.push(voucherObj);
                }

                renderTotal();
            }

            $(this).dialog("close");
        }
    }
});

// MARKETING VOUCHER DIALOG 2021-06-15
$("#marketing-voucher-dialog").dialog({
    width: 400,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        $("#marketingVoucherField").val("");
    },
    buttons: {
        Cancel: function () {
            $(this).dialog("close");
        },
        OK: function () {
            var voucherBarcode = $('#marketingVoucherField').val().trim();
            if (voucherBarcode == '') return false;

            if ($("#marketing-voucher-dialog").data('mode') == 'inquiry') {

                var voucherResp = callAgent('inquiry', { 'voucherId': voucherBarcode });
                if (voucherResp.rspCode != 200) {
                    showMsgDialog(voucherResp.rspCode + ' - ' + voucherResp.msg, 'warning');
                    return false;
                } else {
                    if (voucherResp.result.status != 'GENERATED') {
                        showMsgDialog('VOUCHER HAS BEEN REDEEMED', 'warning');
                        $(this).dialog("close");
                        return false;
                    }

                    $('#mktVoucherNumberConfirmation').text(voucherResp.result.voucherId);
                    $('#mktVoucherAmountConfirmation').text(numberWithCommas(voucherResp.result.voucherAmt));
                    $('#mktVoucherExpDateConfirmation').text(voucherResp.result.expDate);
                    $("#marketing-voucher-confirmation").data('voucherAmt', voucherResp.result.voucherAmt).dialog('open');
                    $(this).dialog("close");
                    return false;
                }

                $(this).dialog("close");
            }

            $(this).dialog("close");
        }
    }
});

//MARKETING VOUCHER CONFIRMATION 2021-06-15
$("#marketing-voucher-confirmation").dialog({
    width: 430,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    dialogClass: "no-close",
    closeOnEscape: false,
    open: function (event, ui) {
        $("#mktVoucherConfirmation").empty();
    },
    buttons: {
        Cancel: function () {
            $(this).dialog("close");
        },
        OK: function () {
            var barcode = $('#mktVoucherNumberConfirmation').text();
            var payment = parseInt($("#marketing-voucher-confirmation").data('voucherAmt'));
            var mediaType = CONSTANTS.PAYMENT_MEDIA_TYPES.COUPON.name;

            processNonCmcPayment(function () {
                var pymtMediaTypeName = CONSTANTS.PAYMENT_MEDIA_TYPES.COUPON.name;

                if (PAYMENT_MEDIA.isValidForTriggering(saleTx, pymtMediaTypeName, payment, enablePaymentMedia) && isNoneGiftCardItemInTransaction()) {
                    redeemRes = redeemMarketingVoucher(barcode);
                    console.log(redeemRes);
                    if (redeemRes.mvRedeem.rspCode != 200) {
                        showMsgDialog(redeemRes.mvRedeem.rspCode + ' - ' + redeemRes.mvRedeem.msg, 'warning');
                        return false;
                    }
                    CASHIER.executePaymentMedia(saleTx, pymtMediaTypeName, payment);
                }
            }, mediaType);

            $(this).dialog("close");
        }
    }
});
//MARKETING VOUCHER

//MARKETING VOUCHER
$("#marketing-voucher-dialog").on("dialogclose", function (event, ui) {
    $("#marketingVoucherField").val("");
});

$("#voucherInfo-dialog").dialog({
    width: 430,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    dialogClass: "no-close",
    closeOnEscape: false,
    open: function (event, ui) {
        $("#voucherInfoMsg").empty();
    },
    buttons: {
        OK: function () {
            $(this).dialog("close");
            CustomerPopupScreen.cus_closeVoucherInfo();
        }
    }
});
// INHOUSE VOUCHER 2017-04-13

$("#eventInfo-dialog").dialog({
    width: 430,
    height: 450,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    dialogClass: "no-close",
    closeOnEscape: false,
    open: function () {
        setTimeout(function () {
            $("#eventInfo-dialog").dialog('close');
            //CustomerPopupScreen.cus_closeEventInfo();
        },
            parseInt(getConfigValue("CUST_FB_TIMEOUT"))
        );
    },
    buttons: {
        OK: function () {
            $(this).dialog("close");
            //CustomerPopupScreen.cus_closeEventInfo();
        }
    }
});

$("#depstore-detail-dialog").dialog({
    width: 600,
    height: 520, // INHOUSE VOUCHER 2017-04-13
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        $("#depstoreDiscountField").val('');
        $("#depstoreBarcodeField").val('');
        $(this).data('openDeductAmount', []); // INHOUSE VOUCHER 2017-04-13
        $('.ui-keyboard-preview').val('');
    },
    buttons: {
        Cancel: function () {
            $(this).dialog("close");
        },
        // INHOUSE VOUCHER 2017-04-13
        Voucher: function () {
            console.log($('#deptNettPrice').data());
            if (parseInt($('#deptNettPrice').data('discprice').length) > 0)
                showMsgDialog('VOUCHER DAN DISCOUNT REGULER TIDAK BISA DIGABUNG', 'warning');
            else {
                if ($('#deptScannedPrice').html() == 0) showMsgDialog('Silakan scan barcode harga', 'warning');
                else $("#depstore-voucher-dialog").data('mode', 'single').dialog("open");
            }
        },
        // INHOUSE VOUCHER 2017-04-13
        Discount: function () {
            if (parseInt($('#deptNettPrice').data('discvoucher')) > 0)
                showMsgDialog('VOUCHER DAN DISCOUNT REGULER TIDAK BISA DIGABUNG', 'warning');
            else {
                if ($('#deptScannedPrice').html() == 0) showMsgDialog('Silakan scan barcode harga', 'warning');
                else $("#depstore-discount-dialog").data('mode', 'deptstore').dialog("open");
            }
        },
        OK: function () {
            if ($('#deptNettPrice').data('sprice') <= 0) {
                showMsgDialog('Please input price barcode', 'warning');
                return false;
            }

            var depstoreDiscountAmount = $("#depstoreDiscountField").val();
            $(this).dialog("close");
            $("#depstore-discount-dialog").dialog("close");

            // PUSH TO THE ITEM ARRAYS
            var itemObj = $("#depstore-detail-dialog").data('item');
            itemObj.currentPrice = $('#deptNettPrice').data('sprice');
            itemObj.discPrice = $('#deptNettPrice').data('discprice');
            itemObj.discAmount = $('#deptNettPrice').data('discamt');
            itemObj.discMarkdown = $('#deptNettPrice').data('discmarkdown');
            itemObj.discVoucher = $('#deptNettPrice').data('discvoucher'); // INHOUSE VOUCHER 2017-04-13
            itemObj.discVoucherBarcode = $('#deptNettPrice').data('discvoucherbarcode'); // INHOUSE VOUCHER 2017-04-13
            itemObj.priceUnit = $('#deptNettPrice').data('nprice');
            itemObj.staffId = $('#depstoreSPGField').val();
            if (itemObj.discVoucher.length > 0) itemObj.voucherSingleMode = true; // INHOUSE VOUCHER 2017-04-13

            /*for(var v in itemObj.discVoucher) // INHOUSE VOUCHER 2017-04-13
            {
                saleTx.totalDiscount += parseInt(itemObj.discVoucher[v]); // INHOUSE VOUCHER 2017-04-13
                itemObj.discountAmount += parseInt(itemObj.discVoucher[v]);
            }*/
            uilog('DBUG', 'OK DEPSTORE');
            uilog('DBUG', itemObj);
            processSaleScanNext(itemObj);
            $('#depstoreBarcodeField, #depstorePriceField').val('');
            $("#barcode-menu-dialog").dialog("close");
        }
    }
});

// INHOUSE VOUCHER 2017-04-13
$("#depstore-detail-dialog").on("dialogopen", function (event, ui) {
    $('#deptScannedPrice').html('0');
    $('#deptDiscPrice').html('0');
    $('#deptAmtOffPrice').html('0');
    $('#deptMarkdownPrice').html('0');
    $('#deptVoucherPrice').html('0');
    $('#deptSubtotalPrice').html('0');
    $('#deptNettPrice').data({ 'nprice': 0, 'discmarkdown': 0, 'discprice': [], 'discamt': [], 'discvoucher': [], 'discvoucherbarcode': [] }).html('0');
    $('#depstoreBarcodeField, #depstorePriceField').val('');
});
// INHOUSE VOUCHER 2017-04-13

$('.depstore-discount-align').click(
    function () {
        $('.toggle-depstore-discount').not(this).removeClass('toggle-depstore-discount').addClass('depstore-discount');
        if (!$(this).hasClass('toggle-depstore-discount')) $(this).removeClass('depstore-discount').addClass('toggle-depstore-discount');
        else $(this).removeClass('toggle-depstore-discount').addClass('depstore-discount');
    }
);

$('#depstoreBarcodeBtn').click(
    function () {
        var prodObj = $(this).data('prodObj');
        if (RETURN_REFUND.return.service.isReturnOrRefundTxn()) {
            processSaleScanNext(prodObj);
            $("#barcode-menu-dialog").dialog("close");
        } else processDeptstoreScan(prodObj, $(this).data('barcode'));
    }
)

$('#deptVoucherDisc').click(
    function () {
        if ($('#deptNettPrice').data('discprice').length > 0)
            showMsgDialog('Discounts have already applied', 'warning');
        else $("#depstore-voucher-dialog").dialog("open");
    }
)

$('#profitBarcodeBtn').click(
    function () {
        var prodObj = $(this).data('prodObj');
        if (RETURN_REFUND.return.service.isReturnOrRefundTxn())
            processSaleScanNext(prodObj);
        else processDeptstoreScan(prodObj, $(this).data('barcode'));
        $("#barcode-menu-dialog").dialog("close");
    }
)

$('#percentManual').click(
    function () {
        $("#depstore-manual-disc-dialog").dialog("open");
    }
)

$('#percentAmtOff').click(
    function () {
        $("#depstore-amount-off-dialog").dialog("open");
    }
)

$('#percentCancel').click(
    function () {
        $("#depstore-discount-dialog").dialog("close");
    }
)

function calculateDeptStoreNettPrice() {
    var sPrice = Math.round($('#deptNettPrice').data('sprice'));
    var subtotalPrice = 0;
    var markdown = $('#deptNettPrice').data('discmarkdown'); // INHOUSE VOUCHER 2017-04-13
    var discArray = $('#deptNettPrice').data('discprice'); // INHOUSE VOUCHER 2017-04-13
    var voucherArray = $('#deptNettPrice').data('discvoucher'); // INHOUSE VOUCHER 2017-04-13
    var discStr = '',
        amtOffStr = '',
        voucherStr = '';
    var discAmtArray = [];

    if (markdown > 0) sPrice -= markdown;

    //FAHMI - CR MAXDISC
    var sPriceInitial = sPrice;
    var sPriceFinal = sPrice;
    for (var f = 0; f < discArray.length; f++) {
        var discAmt = 0;
        if (discArray[f] <= 1) {
            discAmt = Math.round(sPrice * discArray[f]);
        } else {
            discAmt = discArray[f];
        }
        sPriceFinal -= discAmt;
    }

    var maxDisc = deptstoreMaximumDiscount();
    var curDisc = ((sPriceInitial - sPriceFinal) / sPriceInitial) * 100;
    var curDiscIsValid = deptstoreMaximumDiscountValid();
    if (curDisc > maxDisc && !curDiscIsValid) {
        discArray.pop();
        showMsgDialog("Diskon yang anda berikan : " + curDisc.toFixed(2) + "%. Maksimal diskon yang diizinkan : " + maxDisc + "%", "Warning");
    }
    //FAHMI - CR MAXDISC END

    if (discArray.length > 0) {
        for (var i = 0; i < discArray.length; i++) {
            var discAmt = 0;
            if (discArray[i] <= 1) //Jika discount percentage
            {
                discAmt = Math.round(sPrice * discArray[i]);
                discStr += ' + ' + Math.round(discArray[i] * 100) + '%';
            } else //Jika discount dengan nominal amount
            {
                discAmt = discArray[i];
                amtOffStr += ' + ' + numberWithCommas(discArray[i]);
            }

            sPrice -= discAmt;
            discAmtArray.push(discAmt);
            subtotalPrice = Math.round(itemQty * sPrice); // INHOUSE VOUCHER 2017-04-13
        }
    }
    // INHOUSE VOUCHER 2017-04-13
    else if (voucherArray.length > 0) {
        subtotalPrice = Math.round(itemQty * sPrice);
        for (var i = 0; i < voucherArray.length; i++) {
            var voucherAmt = 0;
            voucherAmt = (subtotalPrice < voucherArray[i]) ? subtotalPrice : voucherArray[i];
            voucherStr += ' + ' + numberWithCommas(voucherArray[i]);

            subtotalPrice -= voucherAmt;
            //discAmtArray.push(discAmt);
        }
    } else subtotalPrice = Math.round(itemQty * sPrice);
    // INHOUSE VOUCHER 2017-04-13

    $('#deptDiscPrice').html((discStr.substring(3) == '') ? '0' : discStr.substring(3));
    $('#deptAmtOffPrice').html((amtOffStr.substring(3) == '') ? '0' : amtOffStr.substring(3));
    $('#deptVoucherPrice').html((voucherStr.substring(3) == '') ? '0' : voucherStr.substring(3)); // INHOUSE VOUCHER 2017-04-13
    $('#deptNettPrice').data('nprice', sPrice).html(numberWithCommas(parseInt(sPrice)));
    $('#deptSubtotalPrice').html(numberWithCommas(subtotalPrice)); // INHOUSE VOUCHER 2017-04-13
    $('#deptNettPrice').data('discamt', discAmtArray);
}

// INHOUSE VOUCHER 2017-04-13
function calculatePaymentVoucher(voucherBarcode, redeemRes) {
    saleTx.openDeductAmount = redeemRes.mvRedeem.openAmountDeductionList;

    var finalSubtotalTxAmount = CASHIER.getFinalSubtotalTxAmount(saleTx, { payments: saleTx.payments });
    var pymtMediaTypeName = CONSTANTS.PAYMENT_MEDIA_TYPES.VOUCHER.name;

    var voucherAmt = redeemRes.mvRedeem.result.voucherAmt;
    var payment = (finalSubtotalTxAmount < voucherAmt) ? finalSubtotalTxAmount : voucherAmt;

    CASHIER.executePaymentMedia(saleTx, pymtMediaTypeName, payment, { 'voucherData': { 'voucherNum': voucherBarcode, 'voucherAmount': voucherAmt } });

    var voucherObj = {
        id: voucherBarcode,
        priceUnit: voucherAmt,
        itemTotal: numberWithCommas(voucherAmt),
        priceSubtotal: numberWithCommas(voucherAmt),
        shortDesc: 'MVOUCHER #' + voucherBarcode,
        quantity: 1,
        salesType: 'SALE',
        ean13Code: '',
        isTaxInclusive: false,
        discountAmount: '',
        memberDiscountAmount: '',
        crmMemberDiscountAmount: '',
        cmcDiscountLabel: '',
        categoryId: 'MVOUCHER',
        expDate: redeemRes.mvRedeem.result.expDate,
        openDeductAmount: saleTx.openDeductAmount
    };

    return voucherObj;
}

function calculateDeptStoreVoucher(voucherBarcode, groupItems, redeemRes) {
    console.log(groupItems);
    var voucherObj = null;
    /*var redeemRes = redeemEventRewards(voucherBarcode, groupItems, (typeof groupItems.last.openDeductAmount == 'undefined' ? [] : groupItems.last.openDeductAmount));
                	
    if(redeemRes.mvRedeem.rspCode != 200)
    {
        showMsgDialog(redeemRes.mvRedeem.rspCode + ' - ' + redeemRes.mvRedeem.msg, 'warning');
        return false;
    }*/

    var voucherAmt = parseInt(redeemRes.mvRedeem.result.voucherAmt);
    var voucherNumber = redeemRes.mvRedeem.voucherNumber;
    var voucherOpenDeductAmount = redeemRes.mvRedeem.openAmountDeductionList;
    for (var p in groupItems) {
        if (!groupItems[p].isVoided) {
            var itemPrice = groupItems[p].priceSubtotal -
                groupItems[p].discountAmount -
                groupItems[p].memberDiscountAmount -
                groupItems[p].crmMemberDiscountAmount -
                groupItems[p].discBtnAmount -
                groupItems[p].secondLayerDiscountAmount;
            var voucherDisc = Math.round(((itemPrice / redeemRes.mvRedeem.totalTrxAmount) * voucherAmt));
            voucherDisc = (voucherDisc > itemPrice) ? itemPrice : voucherDisc;

            console.log('VOUCHER DISCOUNT: ' + voucherDisc);
            if (typeof groupItems[p].idx != 'undefined') {
                console.log(saleTx.orderItems[groupItems[p].idx]);
                saleTx.orderItems[groupItems[p].idx].discVoucher.push(voucherDisc);
                saleTx.orderItems[groupItems[p].idx].discVoucherBarcode.push(voucherNumber);
                saleTx.orderItems[groupItems[p].idx].discountAmount += voucherDisc;

                /*if(typeof saleTx.orderItems[groupItems[p].idx].openDeductAmount == 'undefined')
                    saleTx.orderItems[groupItems[p].idx].openDeductAmount = [];*/
                saleTx.orderItems[groupItems[p].idx].openDeductAmount = voucherOpenDeductAmount;
            }
        }
    }

    var voucherObj = {
        id: voucherBarcode,
        priceUnit: voucherAmt,
        itemTotal: numberWithCommas(voucherAmt),
        priceSubtotal: numberWithCommas(voucherAmt),
        shortDesc: 'MVOUCHER #' + voucherNumber,
        quantity: 1,
        salesType: 'SALE',
        ean13Code: '',
        isTaxInclusive: false,
        discountAmount: '',
        memberDiscountAmount: '',
        crmMemberDiscountAmount: '',
        cmcDiscountLabel: '',
        categoryId: 'MVOUCHER',
        expDate: redeemRes.mvRedeem.result.expDate,
        openDeductAmount: voucherOpenDeductAmount
    };

    return voucherObj;
}
// INHOUSE VOUCHER 2017-04-13

$("#depstore-class-dialog").dialog({
    width: 400,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        $("#depstoreClassField").val('');
    },
    buttons: {
        Cancel: function () {
            $(this).dialog("close");
        },
        OK: function () {
            $(this).dialog("close");
            if ($('#depstoreClassField').val() != '') {
                printCashierDepstoreReport($('#depstoreClassField').val());
            }
        }
    }
});
/**************************************
 * END METRO/PROFIT BARCODE SELECTION
 **************************************/

/**************************************
 * BEGIN PWP PENDING INFORMATION
 **************************************/
$("#pendingPWPDialog").dialog({
    width: 600,
    height: 500,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    buttons: {
        Close: function () {
            $(this).dialog("close");
        }
    }
});
/**************************************
 * END PWP PENDING INFORMATION
 **************************************/

$("#function-dialog").on("dialogclose", function (event, ui) {
    clearShortcutFuncDialog();
});

$("#function-dialog").dialog({
    width: 400,
    height: 280,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    open: function (event, ui) {
        $("#functionResultDiv").hide();
        $("#functionSearchDiv").show();
    }
});

function generateVoidList(priceToVoid) {
    var __voidTxAvailable = getSummarizedItemsVoidDeptStore(lastBarcodeScanned, priceToVoid);
    //console.log(__voidTxAvailable);
    if (!priceToVoid && __voidTxAvailable.length > 0) {
        if (__voidTxAvailable[0].categoryId == 'DEPTSTORE') return false;
        $('#voidDeptStorePrice').attr('disabled', 'disabled'); //.css('display', 'none').blur();
        $('#voidDeptStorePrice').getkeyboard().close();
    }

    //generate <thead> inner html
    var __header = [];
    var headerCombined = "";
    var __i = 0;
    __header[__i++] = "BARCODE";
    __header[__i++] = "ITEM NAME";
    __header[__i++] = "QTY";
    __header[__i++] = "DISCOUNT";
    __header[__i++] = "VOID?";

    for (var i = 0; i < __header.length; i++) headerCombined += "<th style='height: 50px'>" + __header[i] + "</th>";

    $("#voidDeptStoreTableHead").html("<tr style='color: white;'>" + headerCombined + "</tr>");
    $("#voidDeptStoreTableBody").html('');
    //generate <tbody> inner html
    if (__voidTxAvailable !== null && __voidTxAvailable.length > 0) {
        var bodyCombined = "";
        for (var i = 0; i < __voidTxAvailable.length; i++) {
            var checkBoxCss = null;
            var trCss = null;
            if (__voidTxAvailable[i].discVoucher.length === 0) {
                //never get mkt voucher
                trCss = { 'background-color': 'white' };
                checkBoxCss = { type: 'checkbox', id: currentVoid };
            } else {
                //item already get mkt voucher
                trCss = { 'background-color': 'orange' };
                checkBoxCss = { type: 'checkbox', id: currentVoid, disabled: true };
            }

            var tt = $('<tr>');
            var currentVoid = 'voidDeptStoreCheck_' + i;
            var tempCurrentPrice = __voidTxAvailable[i]["priceSubtotal"] - __voidTxAvailable[i]["discountAmount"] - __voidTxAvailable[i]["memberDiscountAmount"] - __voidTxAvailable[i]["crmMemberDiscountAmount"] - __voidTxAvailable[i]["discBtnAmount"] - __voidTxAvailable[i]["secondLayerDiscountAmount"];
            var discountList = '';
            if (__voidTxAvailable[i]["discMarkdown"] && __voidTxAvailable[i]["discMarkdown"] > 0) {
                discountList += __voidTxAvailable[i]["discMarkdown"] + ', ';
            }
            if (__voidTxAvailable[i]["crmMemberDiscountAmount"] && __voidTxAvailable[i]["crmMemberDiscountAmount"] > 0) {
                discountList += __voidTxAvailable[i]["crmMemberDiscountAmount"] + ', ';
            }
            if (__voidTxAvailable[i]["discBtnAmount"] && __voidTxAvailable[i]["discBtnAmount"] > 0) {
                discountList += __voidTxAvailable[i]["discBtnAmount"] + ', ';
            }
            if (__voidTxAvailable[i]["discAmount"] && __voidTxAvailable[i]["discAmount"].length > 0) {
                for (var v in __voidTxAvailable[i]["discAmount"]) {
                    discountList += __voidTxAvailable[i]["discAmount"][v] + ', ';
                }
            }
            if (__voidTxAvailable[i]["memberDiscountAmount"] && __voidTxAvailable[i]["memberDiscountAmount"] > 0) discountList += '<strong>' + __voidTxAvailable[i]["memberDiscountAmount"] + '</strong>,';

            discountList = discountList.substring(0, discountList.length - 2);


            tt.css(trCss);
            tt.append($('<td>').css({ "padding-left": "5px", "padding-right": "5px", "width": "15%" }).html(__voidTxAvailable[i]["ean13Code"]));
            tt.append($('<td>').css({ "padding-left": "5px", "padding-right": "5px", "width": "40%" }).html(__voidTxAvailable[i]["shortDesc"]));
            tt.append($('<td>').css({ "text-align": "center" }).html(__voidTxAvailable[i]["quantity"]));
            tt.append($('<td>').css({ "padding-left": "5px", "padding-right": "5px", "width": "40%" }).html(discountList));
            tt.append(
                $('<td>').append(
                    $('<input>')
                        .attr(checkBoxCss)
                        .data('voidObject', JSON.stringify(__voidTxAvailable[i]))
                        .addClass('voidDeptStoreSelected big-checkbox').click(
                            function () {
                                $(".voidDeptStoreSelected").not(this).prop('checked', false);
                                // var indexVoidDeptStore = $(".voidDeptStoreSelected:checked")[0].id.split("_");

                                revertEmployeeDiscount();
                                var voidObject = JSON.parse($(this).data('voidObject'));
                                voidObject.currentPrice = tempCurrentPrice;
                                //console.log(voidObject);

                                if (voidItem(voidObject, voidObject['quantity'])) {
                                    renderProductDetails(voidObject);
                                    refreshPromotion(false);
                                    renderTotal();
                                    saveTxn();
                                    toggleFNButton("fnVoid", false);
                                    if (toggleTVS) {
                                        restoreSysMsg();
                                    } else {
                                        promptSysMsg();
                                    }
                                    // set following variable to default value
                                    isAuthenticated = false;
                                    isPreAuthenticated = false;
                                    // will disable CLEAR function.
                                    disableClrFn = true;
                                    Hypercash.service.autoTagCustomerAsNonMember();
                                } else {
                                    reApplyEmployeeDiscount();
                                }
                                $("#voidDeptStore-dialog").dialog("close");
                            }
                        )
                )
            );
            $("#voidDeptStoreTableBody").append(tt);
        }
    }
}

// CR RETURN
function generateReturnListItem(prodObj) {
    //generate <thead> inner html
    var __header = [];
    var headerCombined = "";
    var __i = 0;
    //__header[__i++]="BARCODE";
    __header[__i++] = "ITEM NAME";
    __header[__i++] = "QTY";
    __header[__i++] = "TOTAL PRICE";
    __header[__i++] = "TOTAL DISCOUNT";
    __header[__i++] = "MEGA DISCOUNT";
    __header[__i++] = "NETT"; // NETT = TOTAL PRICE - TOTAL DISCOUNT - MEGA DISCOUNT
    __header[__i++] = "RETURN?";

    for (var i = 0; i < __header.length; i++) headerCombined += "<th style='height: 50px'>" + __header[i] + "</th>";
    $("#returnTableHead").html("<tr style='color: white;'>" + headerCombined + "</tr>");
    $("#returnTableBody").html('');

    var bodyCombined = "";
    uilog('DBUG', 'RETURN_REFUND.baseTransactionDetails.qtyInfo');
    uilog('DBUG', JSON.stringify(RETURN_REFUND.baseTransactionDetails.qtyInfo));

    var barcode = '';
    var freshItem = isFreshGoods(prodObj);
    // DEBUG CR RETURN DEPTSTORE
    //console.log(prodObj);
    var deptStoreItem = isDeptStoreItem(prodObj);

    if (freshItem) {
        for (var f in RETURN_REFUND.baseTransactionDetails.qtyInfo) {
            if (f.substring(0, 6) == prodObj.ean13Code.substring(0, 6) && isWeightSupplied(prodObj) && f.substring(0, 12) == lastBarcodeScanned.substring(0, 12))
                //&& f == lastBarcodeScanned)
                barcode = f;
            else if (f.substring(0, 6) == prodObj.ean13Code.substring(0, 6) && f == lastBarcodeScanned && !isWeightSupplied(prodObj))
                barcode = f;
        }
        if (isWeightSupplied(prodObj)) $("#returnQty").attr('disabled', 'disabled');
        else $("#returnQty").removeAttr('disabled');
    }
    // FIX ITEM NOT SHOW
    else if (deptStoreItem) {
        for (var f in RETURN_REFUND.baseTransactionDetails.qtyInfo) {
            if (f.substring(1, 7) == prodObj.ean13Code.substring(1, 7) && f == lastBarcodeScanned)
                barcode = f;
        }
        $("#returnQty").removeAttr('disabled');
    }
    // FIX ITEM NOT SHOW
    else {
        barcode = prodObj.ean13Code;
        $("#returnQty").removeAttr('disabled');
    }

    if (RETURN_REFUND.baseTransactionDetails.qtyInfo[barcode].itemList) {
        var prodList = RETURN_REFUND.baseTransactionDetails.qtyInfo[barcode].itemList;
        //console.log(prodList);
        for (var i = 0; i < prodList.length; i++) {
            prodObj = prodList[i];
            var trCss = { 'background-color': 'white' };
            var checkBoxCss = { type: 'checkbox' };

            var tt = $('<tr>');

            var itemName = prodObj.shortDesc;
            var currTxnItemCount = 0;
            var returnedTotalDisc = prodObj.discount_amount / prodObj.netQty;
            var returnedMegaDisc = prodObj.member_discount_amount / prodObj.netQty;

            //Hypercash.util.getTotalValidQuantityByBarcode(saleTx.orderItems, prodObj.ean13code);
            for (var o in saleTx.orderItems) {
                var oItem = saleTx.orderItems[o];
                //console.log('oItem');
                //console.log(oItem);
                if (typeof oItem.returnItemId != 'undefined' && oItem.returnItemId == prodObj.id) {
                    // FIX FOR RETURN ITEM ALREADY VOIDED IN SALE TX
                    if (oItem.isVoided && (prodObj.netQty > oItem.quantity)) currTxnItemCount -= oItem.quantity;
                    else if (oItem.isVoided) currTxnItemCount = 0;
                    else currTxnItemCount += oItem.quantity;
                }
            }
            var maxReturnQty = prodObj.netQty - currTxnItemCount;
            //console.log("value currTxnItemCount : " + currTxnItemCount);

            var totalPrice = maxReturnQty * prodObj.price_unit;
            var totalDisc = prodObj.discount_amount - (returnedTotalDisc * currTxnItemCount);
            var megaDisc = prodObj.member_discount_amount - (returnedMegaDisc * currTxnItemCount);
            var net = totalPrice - totalDisc - megaDisc;
            //console.log("ID : " + prodObj.id);
            tt.css(trCss);
            // item name
            tt.append($('<td>')
                .css({ "padding-left": "5px", "padding-right": "5px", "width": "20%" })
                .addClass("return-button")
                .data("prodObj", prodObj)
                .html(itemName));
            // qty
            tt.append($('<td>').css({ "padding-left": "5px", "padding-right": "5px", "padding-top": "20px", "padding-bottom": "20px", "width": "5%" }).html(maxReturnQty));
            tt.append($('<td>').css({ "padding-left": "5px", "padding-right": "5px", "width": "15%" }).html(Math.round(totalPrice)));
            // total discount
            tt.append($('<td>').css({ "padding-left": "5px", "padding-right": "5px", "width": "20%" }).html(Math.round(totalDisc)));
            // mega discount
            tt.append($('<td>').css({ "padding-left": "5px", "padding-right": "5px", "width": "20%" }).html(Math.round(megaDisc)));
            // Nett = (qty * current price) - total discount - mega discount
            tt.append($('<td>').css({ "padding-left": "5px", "padding-right": "5px", "width": "15%" }).html(Math.round(net)));
            tt.append(
                $('<td>').append(
                    $('<input>')
                        .attr(checkBoxCss)
                        .data("prodObj", JSON.stringify(prodObj))
                        .data("freshItem", JSON.stringify(freshItem))
                        .data("deptItem", JSON.stringify(deptStoreItem))
                        .click(
                            function () {
                                $("#returnConfirmation-dialog").data("itemName", $(this).parent().parent().find('td:eq(0)').text())
                                    .data("maxReturnQty", $(this).parent().parent().find('td:eq(1)').text())
                                    .data("totalPrice", $(this).parent().parent().find('td:eq(2)').text())
                                    .data("totalDiscount", $(this).parent().parent().find('td:eq(3)').text())
                                    .data("megaDiscount", $(this).parent().parent().find('td:eq(4)').text())
                                    .data("nett", $(this).parent().parent().find('td:eq(5)').text())
                                    .data("prodObj", JSON.parse($(this).data("prodObj")))
                                    .data("freshItem", $(this).data("freshItem"))
                                    .data("deptItem", $(this).data("deptItem"))
                                    .dialog("open");

                                $(this).attr('checked', false);
                            }
                        )
                )
            );

            if (maxReturnQty > 0) $("#returnTableBody").append(tt);
        }
    }
}
//DONATION
function donationListItem(reqCatDon) {
    console.log("donasi : " + reqCatDon);
    var prodDonate = reqCatDon;
    var __header = [];
    var headerCombined = "";
    var __i = 0;
    //__header[__i++]="BARCODE";
    __header[__i++] = "ITEM NAME";
    __header[__i++] = "AMOUNT";
    __header[__i++] = "";
    console.log(__header);
    if (!toggleVoid) {
        delete __header[2];
        __header[1] = "";
        __header.length = 2;
    }
    for (var i = 0; i < __header.length; i++) {
        headerCombined += "<th style='height: 50px'>" + __header[i] + "</th>";
    }

    $("#donationTableHead").html("<tr style='color: white;'>" + headerCombined + "</tr>");
    $("#donationTableBody").html('');
    if (toggleVoid) {
        $("#donation-dialog").dialog('option', 'title', "VOID DONATION");
        for (var a = 0; a <= saleTx.orderItems.length - 1; a++) {
            var voidDonation = saleTx.orderItems[a];
            var allVoidedDon = true;
            if (voidDonation.allvoided) {

            }
            console.log("DONATION : " + JSON.stringify(voidDonation));
            if (voidDonation.categoryId == "DONATION" && voidDonation.salesType != "VOID" && voidDonation.allvoided != true) {
                console.log("VOID DONATION : " + JSON.stringify(voidDonation));
                var trCss = { 'background-color': 'white' };
                var checkBoxCss = { type: 'checkbox' };

                var tt = $('<tr>');

                var itemName = voidDonation.name;
                var amount = voidDonation.priceUnit;
                var donasiKode = voidDonation.ean13Code;
                var subDonasi = "0";
                tt.css(trCss);
                // item name
                tt.append($('<td>')
                    .css({ "background-color": "#FFFFFF", "color": "#000000", "padding-left": "5px", "padding-right": "5px", "width": "60%" })
                    .html(itemName));
                tt.append($('<td>')
                    .css({ "background-color": "#FFFFFF", "color": "#000000", "padding-left": "5px", "padding-right": "5px", "width": "20%" })
                    .html(amount));
                tt.append($('<td>')
                    .css({ "background-color": "#FFFFFF", "color": "#000000", "padding-left": "5px", "padding-right": "5px", "width": "80%", "display": "none" })
                    .html(donasiKode));
                tt.append(
                    $('<td>').append(
                        $('<input>')
                            .attr(checkBoxCss)
                            .click(
                                function () {
                                    $("#donasiVoidConfirmation-dialog").data("donItemName", $(this).parent().parent().find('td:eq(0)').text())
                                        .data("amount", $(this).parent().parent().find('td:eq(1)').text())
                                        .data("kodeDonasi", $(this).parent().parent().find('td:eq(2)').text())
                                        .dialog("open");

                                    $(this).attr('checked', false);
                                    //$("#donation-dialog").dialog("close");
                                }
                            )
                    )
                );
                $("#donationTableBody").append(tt);
            }
        }
    } else {
        $("#donation-dialog").dialog('option', 'title', "Donation Dialog");
        if (hasDonationCheck) {
            var trCss = { 'background-color': 'white' };
            var ttt = $('<tr>');
            var amount = saleTx.totalAmount;
            /*if(saleTx.totalDiscount != 0){
                console.log("Disni amount1 : " + amount);
                amount = amount - saleTx.totalDiscount;
            }
            if(saleTx.cmcAmount){
                amount = amount + saleTx.cmcAmount;
            }*/

            /*if(saleTx.promotionItems.length > 0 ){
                for(var i in saleTx.promotionItems){
                    var discount = saleTx.promotionItems[i].totalDiscount;
                    amount -= discount;
                }
            } else if(saleTx.promotionItems.length <= 0 && donationPromoItem.length > 0) {
                for(var i in donationPromoItem){
                    var discount = donationPromoItem[i].totalDiscount;
                    amount -= discount;
                }
            }*/
            amount -= getTotalDiscount(saleTx);
            ttt.css(trCss);
            ttt.append($('<td colspan="2">')
                .css({ "background-color": "#FFFFFF", "color": "#000000", "text-align": "center", "padding-left": "5px", "padding-right": "5px", "width": "40%", "height": "25px" })
                .html(" Total Transaksi Rp. " + amount + "&nbsp&nbsp&nbsp&nbsp | &nbsp&nbsp&nbsp&nbsp" + " Total Kembali Rp. " + donationVal));
            $("#donationTableBody").append(ttt);
        }
        for (var a = 0; a <= reqCatDon.length - 1; a++) {
            var donation = reqCatDon[a];
            donation = donation.split(",");
            var trCss = { 'background-color': 'white' };
            var checkBoxCss = { type: 'checkbox' };

            var tt = $('<tr>');

            var itemName = donation[3];
            var donasiKode = donation[1];
            var subDonasi = "0";
            tt.css(trCss);
            // item name
            tt.append($('<td>')
                .css({ "background-color": "#FFFFFF", "color": "#000000", "padding-left": "5px", "padding-right": "5px", "width": "80%" })
                .html(itemName));
            tt.append($('<td>')
                .css({ "background-color": "#FFFFFF", "color": "#000000", "padding-left": "5px", "padding-right": "5px", "width": "80%", "display": "none" })
                .html(donasiKode));
            $("#donationTableBody").append(tt);
            tt.append(
                $('<td>').append(
                    $('<input>')
                        .attr(checkBoxCss)
                        .click(
                            function () {
                                console.log("disni");
                                $("#donasiConfirmation-dialog").data("donasiProdName", $(this).parent().parent().find('td:eq(0)').text())
                                    .data("eanCode", $(this).parent().parent().find('td:eq(1)').text())
                                    .data("subDonasi", $(this).parent().parent().find('td:eq(2)').text())
                                    .dialog("open");

                                $(this).attr('checked', false);
                            }
                        )
                )
            );
        }
    }
}
var clickNo = 0;
var unpClick = 0;
//LOYALTY 
$("#addColumn").click(function () {
    var TrNumberVal = $("#IdvalTrNumber").val();
    var tt = $('<tr>');
    var no = 1;


    if (TrNumberVal == '') {
        showMsgDialog(getMsgValue('pos_warning_msg_invalid_amount') + donationValidPaymentMedia,
            "warning");
    } else if (TrNumberVal.length < 17) {
        showMsgDialog("Nomor Transaksi kurang dari 17 digit", "error");
        $("#IdvalTrNumber").val("");
    } else {
        //var tmp = $("#valProgName").val();
        var tmp = $('input[name=groupEvent]:checked').val();
        var code = tmp.split("-");
        var progCode = code[0];
        var trNumber = TrNumberVal;
        var type = "validate_tr";

        loyaltyServiceValidate(trNumber, type, progCode);
        if (trNumberFlag == true) {
            clickNo += no;
            tt.append($('<td>').append($('<input id="chk' + clickNo + '" type="checkBox" style="margin-top: -5px !important;">')));
            tt.append($('<td>').append($('<input readonly id="ValTrNumber' + clickNo + '" value="' + TrNumberVal + '" style="width:160px !important;">')));
            tt.append($('<td>').append($('<input readonly id="ValTrNumberPoint' + clickNo + '" value="' + trNumberPoint + '" style="width:70px !important;">')));
            tt.append($('<td>').append($('<input type="hidden" id="ValTrEvenId' + clickNo + '" value="' + trEventId + '" style="width:70px !important;">')));
            $("#loyaltyTableBody").append(tt);
            console.log("masuk sini");
        } else {
            $("#IdvalTrNumber").val("");
            //trNumber.val("");
        }
        $("#IdvalTrNumber").val("");
        //trNumber.val("");
    }
});
$("#chk" + clickNo).click(function () {
    $(this).closest("#ValTb").find("td input:checkBox").prop("checked", this.checked);
});
$("#DeleteColumn").click(function () {
    // console.log("masuk sinidele");
    var lenRow = $("#ValTb tbody tr").length;
    var lenchecked = $("#ValTb input[type='checkBox']:checked").length;
    var row = $("#ValTb tbody input[type='checkBox']:checked").parent().parent();
    row.remove();
});
var UnpTrNumberVal;
var UnpTrNumberPoint;
var unpTrEventId;
$("#unpAddColumn").click(function () {
    UnpTrNumberVal = $("#unpTrNumber").val();


    if (UnpTrNumberVal == '') {
        showMsgDialog(getMsgValue('pos_warning_msg_invalid_amount') + donationValidPaymentMedia,
            "warning");
    } else if (UnpTrNumberVal.length < 17) {
        alert("Nomor Transaksi kurang dari 17 digit");
        $("#unpTrNumber").val("");
    } else {
        var tmp2 = $("#valUnpProgName").val();
        var maxReward = tmp2.split("-");
        var type = "validate_tr";
        loyaltyServiceValidateManual(UnpTrNumberVal, type, maxReward[0]);
        var tt = $('<tr>');
        var no = 1;
        var progName = $("#valUnpProgName").val();
        console.log("trNumberFlag" + trNumberFlag);
        if (trNumberFlag == true) {
            tt.append($('<td>').append($('<input id="chk' + unpClick + '" type="checkBox" style="margin-top: -5px !important;">')));
            tt.append($('<td>').append($('<input readonly id="UnpValTrNumber' + unpClick + '" value="' + UnpTrNumberVal + '" style="width:160px !important;">')));
            tt.append($('<td>').append($('<input id="UnpValTrPoint' + unpClick + '" value="' + UnpTrNumberPoint + '" style="width:70px !important;">')));
            tt.append($('<td>').append($('<input type="hidden" id="UnpValTrEvenId' + unpClick + '" value="' + unpTrEventId + '" style="width:70px !important;">')));

            $("#unpTableBody").append(tt);
            $("#unpTrNumber").val('');
            $("#UnpValTrPoint" + unpClick).keyboard({
                //display: completeDisplay,
                display: numberDisplay1,
                layout: 'custom',
                customLayout: customNumberLayout1,
                visible: function (e, keyboard, el) {
                    addClickHandler(keyboard);
                }
            });
            trNumberFlag = false;
        } else {
            $("#unpTrNumber").val("");
        }
        $("#unpTrNumber").val("");
    }
    $("#unpTrNumber").val("");
});
$("#chk" + unpClick).click(function () {
    $(this).closest("#unpValTb").find("td input:checkBox").prop("checked", this.checked);
});
$("#unpDeleteColumn").click(function () {
    // console.log("masuk sinidele");`
    var lenRow = $("#unpValTb tbody tr").length;
    var lenchecked = $("#unpValTb input[type='checkBox']:checked").length;
    var row = $("#unpValTb tbody input[type='checkBox']:checked").parent().parent();
    row.remove();
});

//DONASI
function generateDonasiConfirmation() {
    $("#donasiItemName").text($("#donasiConfirmation-dialog").data("donasiProdName"));
    $("#eanCode").text($("#donasiConfirmation-dialog").data("eanCode"));
    $("#subDonate").val($("#donasiConfirmation-dialog").data("subDonasi"));
}

function generateVoidDonasiConfirmation() {
    $("#donasiVoidItemName").text($("#donasiVoidConfirmation-dialog").data("donItemName"));
    $("#amountVoid").text($("#donasiVoidConfirmation-dialog").data("amount"));
    $("#eanCodeVoid").text($("#donasiVoidConfirmation-dialog").data("kodeDonasi"));
}

function generateReturnConfirmationItem() {
    $("#returnItemName").text($("#returnConfirmation-dialog").data("itemName"));
    $("#returnMaxQuantity").text($("#returnConfirmation-dialog").data("maxReturnQty"));
    $("#returnQty").val($("#returnConfirmation-dialog").data("maxReturnQty"));
    $("#returnTotalPrice").val($("#returnConfirmation-dialog").data("totalPrice"));
    $("#returnTotalDiscount").val($("#returnConfirmation-dialog").data("totalDiscount"));
    $("#returnMegaDiscount").val($("#returnConfirmation-dialog").data("megaDiscount"));
    $("#returnNett").text($("#returnConfirmation-dialog").data("nett"));

    if (!connectionOnline || $("#fnReturnTx").data("isAuthenticated")) {
        $("#returnLabelMax").text("");
        $("#returnMaxQuantity").text("");
        $("#returnConfirmation-dialog").data("itemDiscount", 0);
        $("#returnConfirmation-dialog").data("itemMegaDiscount", 0);

        $("#returnTotalPrice").removeAttr('disabled');
    } else {
        if ($("#returnConfirmation-dialog").data("totalDiscount") == 0) $("#returnTotalDiscount").attr('disabled', 'disabled');
        else $("#returnTotalDiscount").removeAttr('disabled');
        if ($("#returnConfirmation-dialog").data("megaDiscount") == 0) $("#returnMegaDiscount").attr('disabled', 'disabled');
        else $("#returnMegaDiscount").removeAttr('disabled');

        $("#returnTotalPrice").attr('disabled', 'disabled');
    }

    var savedQty = $("#returnQty").val();

    $("#returnQty").click(
        function () {
            savedQty = this.value;
        }
    );

    $("#returnQty").unbind('change').change(
        function () {
            if ((this.value == '' ||
                parseInt(this.value) > parseInt($("#returnConfirmation-dialog").data("maxReturnQty")) ||
                this.value <= 0) &&
                connectionOnline && !($("#fnReturnTx").data("isAuthenticated"))
            ) {
                this.value = savedQty;
                updateReturnItemInfo();
                return false;
            } else {
                savedQty = this.value;
                updateReturnItemInfo();
                return true;
            }
        }
    );

    $("#returnTotalDiscount, #returnMegaDiscount, #returnTotalPrice").unbind('change').change(
        function () {
            updateReturnItemInfo();
        }
    );
}

function updateReturnItemInfo() {
    var prodObj = $("#returnConfirmation-dialog").data("prodObj");
    var totalPrice;
    var discItem = $("#returnConfirmation-dialog").data("itemDiscount");
    var megaDiscItem = $("#returnConfirmation-dialog").data("itemMegaDiscount");

    var limitTotalDisc = parseInt($("#returnConfirmation-dialog").data("totalDiscount"));
    var limitMegaDisc = parseInt($("#returnConfirmation-dialog").data("megaDiscount"));

    if (limitTotalDisc >= $("#returnTotalDiscount").val()) {
        if ($("#returnTotalDiscount").val() == '' || $("#returnTotalDiscount").val() == null) $("#returnTotalDiscount").val(0);
    } else if (limitTotalDisc != 0) {
        showMsgDialog('Maximum value for total discount : ' + limitTotalDisc, "warning");
        $("#returnTotalDiscount").val(limitTotalDisc);
    }

    if (limitMegaDisc >= $("#returnMegaDiscount").val()) {
        if ($("#returnTotalDiscount").val() == '' || $("#returnTotalDiscount").val() == null) $("#returnTotalDiscount").val(0);
    } else if (limitMegaDisc != 0) {
        showMsgDialog('Maximum value for mega discount : ' + limitMegaDisc, "warning");
        $("#returnMegaDiscount").val(limitMegaDisc);
        if ($("#returnMegaDiscount").val() == '' || $("#returnMegaDiscount").val() == null) $("#returnMegaDiscount").val(0);
    }

    if (!connectionOnline || $("#fnReturnTx").data("isAuthenticated"));
    else {
        totalPrice = prodObj.price_unit * $("#returnQty").val();
        totalPrice = Math.round(totalPrice);

        $("#returnTotalPrice").val(totalPrice);
    }
    var nett = Math.round(
        $("#returnTotalPrice").val() -
        $("#returnTotalDiscount").val() -
        $("#returnMegaDiscount").val());
    $("#returnNett").text(nett);
}
$("#trkPoint-dialog").on("dialogclose", function (event, ui) {
    $("#trkPoint").val('');
});
$("#trkSales-dialog").on("dialogclose", function (event, ui) {
    $("#trkSales").val('');
});
$("#genRewardsPointInfo-dialog").on("dialogclose", function (event, ui) {
    $("#valGenKtp").val('');
    $("#valOtpCode").val('');
    $("#valGenGenTglLahir").val('');
    $("#valGenGenBlnLahir").val('');
    $("#valGenGenThnLahir").val('');
    $("#valGenEmailRedeem").val('');
    $("#invalidOtp").html('');
    $("#invalidKtp").html('');
    document.getElementById("valGenGenderF").checked = false;
    document.getElementById("valGenGenderM").checked = false;
});
$("#trkPoint-dialog").dialog({
    width: 400,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        console.log("MASUK KESINII --n ");
    },
    buttons: {
        CANCEL: function () {
            $(this).dialog("close");
            $("#inputDisplay").val('');
        },
        OK: function () {
            var trkPointCode = $("#trkPoint").val();
            console.log("no ref : " + trkPointCode);
            var pymtMediaTypeName = $("#trkPoint-dialog").data("mediaType");
            if (trkPointCode == "") {
                showMsgDialog("Masukan No Referensi", "warning");
            } else {
                trkNextProcess(pymtMediaTypeName);
            }
            $(this).dialog("close");
        }
    }
});

$("#trkSales-dialog").dialog({
    width: 400,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        console.log("MASUK KESINII --n ");
    },
    buttons: {
        CANCEL: function () {
            $(this).dialog("close");
            $("#inputDisplay").val('');
        },
        OK: function () {
            var trkSalesCode = $("#trkSales").val();
            var payment = CASHIER.getFinalSubtotalTxAmount(saleTx, { payments: saleTx.payments });
            var pymtMediaTypeName = $("#trkSales-dialog").data("mediaType");
            if (trkSalesCode == "") {
                showMsgDialog("Masukan No Referensi", "warning");
            } else {
                trkNextProcess(pymtMediaTypeName);
            }
            $(this).dialog("close");
        }
    }
});

// Code init donation-dialog
$("#donation-dialog").dialog({
    width: 510,
    height: 400,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        //clearReturnDialog('all');
        console.log("MASUK KESINII");
        donationListItem($("#donation-dialog").data("reqCatDon"));
        var listDona = $("#donation-dialog").data("reqCatDon");
        var change = "";
        if (hasDonationCheck) {
            change = donationVal;
        }
        var data = {
            donation: listDona,
            change: change,
            totalTrans: saleTx.totalAmount
        }

        displayDonasiCustomer(data);
        CustomerPopupScreen.cus_showDonasiCustomer(data);
        CustomerPopupScreen.cus_showDonasiDialog(data);
    },
    buttons: {
        /*BACK : function()
                {
                        //clearReturnDialog('all');
                        $(this).dialog("close");
                        beforeDonationPayment = 0;
                },*/
        CONTINUE: function () {
            if (hasDonationCheck) {
                uilog('DBUG', "Donation Donasi Execute : " + JSON.stringify(donationExecute));
                if (saleTx.promotionItems.length <= 0) {
                    saleTx.promotionItems = donationPromoItem;
                }
                CASHIER.executePaymentMedia(saleTx, donationExecute[1], donationExecute[2], donationExecute[3]);
            }
            $(this).dialog("close");
        }
    }
});

// Code init return-dialog
$("#return-dialog").dialog({
    width: 710,
    height: 600,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        clearReturnDialog('all');
        generateReturnListItem($("#return-dialog").data("prodObj"));
    },
    buttons: {
        EXIT: function () {
            clearReturnDialog('all');
            $(this).dialog("close");
        }
    }
});

//Donasi Confirmation Dialog
$("#donasiConfirmation-dialog").dialog({
    width: 400,
    height: 250,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        generateDonasiConfirmation();
        console.log("donation val : " + donationVal);
        if (hasDonationCheck) {
            $("#subDonate").val(donationVal);
            $('.ui-keyboard-preview').val(donationVal);
        }
        console.log("donation val 2 : " + ($("#subDonate").val()));
    },
    buttons: {
        CANCEL: function () {
            if (hasDonationCheck) {
                $(this).dialog("close");
            } else {
                $("#donation-dialog").dialog("close");
                $(this).dialog("close");
            }
        },
        OK: function () {
            if (hasDonationCheck) {
                if ($("#subDonate").val() > donationVal) {
                    showMsgDialog(getMsgValue('donation_valid_payment') + donationVal,
                        "warning");
                } else {
                    donasiRes = $("#subDonate").val();
                    donasiCode = $("#eanCode").text();
                    donasiFlag = true;
                    processSaleScan(donasiCode);
                    $(this).dialog("close");
                    $("#donation-dialog").dialog("close");
                    enablePaymentMedia = true;
                    if (checkCancelCmc) {
                        cancelCmcDonation = true;
                    }
                    if (saleTx.promotionItems.length <= 0) {
                        saleTx.promotionItems = donationPromoItem;
                    }

                    $("div#fnPad div#fnCash").click();
                }
            } else {
                donasiRes = $("#subDonate").val();
                donasiCode = $("#eanCode").text();
                donasiFlag = true;
                processSaleScan(donasiCode);
                //$("#confirmBtn").click();
                $(this).dialog("close");
                $("#donation-dialog").dialog("close");
            }
        }
    }
});

//VOID Donasi Confirmation Dialog
$("#donasiVoidConfirmation-dialog").dialog({
    width: 400,
    height: 250,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        generateVoidDonasiConfirmation();
    },
    buttons: {
        CANCEL: function () {
            $(this).dialog("close");
            $("#donation-dialog").dialog("close");
        },
        OK: function () {
            var amount = $("#amountVoid").text();
            donasiCode = $("#eanCodeVoid").text();
            console.log("amount : " + amount);
            donasiVoidPrice = amount;
            processVoidItemScan(donasiCode);
            //$("#confirmBtn").click();
            $(this).dialog("close");
            $("#donation-dialog").dialog("close");
        }
    }
});


$("#donasiConfirmation-dialog").on("dialogclose", function (event, ui) {
    donasiFlag = false;
    donasiCode = "";
    donasiRes = "";
    $("#subDonate").val('');
    $('.ui-keyboard-preview').val('');

});

$("#donation-dialog").on("dialogclose", function (event, ui) {
    donasiFlag = false;
    donasiCode = "";
    donasiRes = "";
    donasiVoidPrice = "";
    //hasDonationCheck = false;
    var data = $("#donation-dialog").data("reqCatDon");
    CustomerPopupScreen.cus_removeDonasiDialog(data);
});
// Code init returnConfirmation-dialog
$("#returnConfirmation-dialog").dialog({
    width: 400,
    height: 450,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        generateReturnConfirmationItem();
    },
    buttons: {
        CANCEL: function () {
            $(this).dialog("close");
        },
        OK: function () {
            var returnNett = $("#returnNett").text();
            console.log("returnNett : " + returnNett);
            if (returnNett < 0) {
                showMsgDialog("Nett Kurang!", "warning");
            } else {
                $("#returnReason-dialog").dialog("open");
            }
        }
    }
});

// CR RETURN

// voidDeptStore 2017022
$("#voidDeptStore-dialog").dialog({
    width: 710,
    height: 600,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        clearVoidDeptStore('all');
        generateVoidList();
    },
    buttons: {
        EXIT: function () {
            clearVoidDeptStore('all');
            $(this).dialog("close");
        },
        SEARCH: function () {
            var priceToVoid = $("#voidDeptStorePrice").val();
            generateVoidList(priceToVoid);
        }
    }
});
// voidDeptStore 2017022

// INDENT 2017-05-18
$("#indentSales-dialog").dialog({
    width: 350,
    height: 250,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    dialogClass: "no-close",
    closeOnEscape: false
});

$("#indentSalesCreate-dialog").dialog({
    width: 430,
    height: 350,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {

    },
    buttons: {
        Cancel: function () {
            if (typeof saleTx.indentSlip !== "undefined") {
                delete saleTx.indentSlip;
            }
            if (typeof saleTx.indentExpectedDeliveryDate !== "undefined") {
                delete saleTx.indentExpectedDeliveryDate;
            }
            if (typeof saleTx.indentHomdel !== "undefined") {
                delete saleTx.indentHomdel;
            }

            clearIndentSales('create');
            $(this).dialog("close");
        },
        OK: function () {
            if ($("#indentSlip").val() == '' || $("#indentExpectedDeliveryDate").val() == '') {
                return false;
            } else {
                saleTx.indentSlip = $("#indentSlip").val();
                saleTx.indentExpectedDeliveryDate = $("#indentExpectedDeliveryDate").val();
                saleTx.indentHomdel = $('#indentHomdelCheck').is(":checked") ? 'YES' : 'NO';
                $(this).dialog("close");
                promptSysMsg();
            }
        }
    }
});

$("#indentSalesInquiry-dialog").dialog({
    width: 710,
    height: 600,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        $("#indentSlipInquiry").empty();
    },
    buttons: {
        EXIT: function () {
            clearIndentSales('inquiry');
            $(this).dialog("close");
        },
        SEARCH: function () {
            //generate <thead> inner html
            var __header = [];
            var headerCombined = "";
            var __i = -1;
            __header[__i++] = "Struck No";
            __header[__i++] = "Item Code/<br> Barcode";
            __header[__i++] = "Item Name";
            __header[__i++] = "Qty Sales";
            __header[__i++] = "Profit Status/<br>PO#/<br>RR#/<br>Del-Date";
            for (var i = 0; i < __header.length; i++) headerCombined += "<th>" + __header[i] + "</th>";
            $("#indentInqInfoHead").html("<tr>" + headerCombined + "</tr>");

            var emptyMessage = "---";
            var struckNo = emptyMessage;
            var storeCode = emptyMessage;
            var indentSlipNo = emptyMessage;
            var indentStatus = emptyMessage;
            var indentDate = emptyMessage;
            var indentExpDate = emptyMessage;

            var returnRequest = getIndentInquiry($("#indentSlipInquiry").val());

            if (returnRequest !== null) {
                //generate <tbody> inner html
                var tableData = returnRequest["result"];
                var bodyCombined = "";
                var profitPoStatus = emptyMessage;
                var profitPoNumber = emptyMessage;
                var profitRrNumber = emptyMessage;
                var profitPoDeliveryDate = emptyMessage;


                var idn_info = {};
                for (var i = 0; i < tableData.length; i++) {
                    try {
                        idn_info = JSON.parse(tableData[i]["idn_info"]);
                        //console.log("JSON PARSE INDENT OK|" + JSON.stringify(idn_info) + "|END");
                    } catch (e) {
                        idn_info = {};
                        //console.log("JSON PARSE INDENT ERROR|" + e.message + "|" + tableData[i]["idn_info"] + "|END");
                    }
                    struckNo = tableData[i]["pos_txn_id"];
                    storeCode = tableData[i]["code"];
                    indentSlipNo = typeof idn_info["slipNumber"] !== 'undefined' ? idn_info["slipNumber"] : emptyMessage;
                    indentStatus = tableData[i]["idn_status"];
                    indentDate = tableData[i]["creadate"];
                    indentExpDate = typeof idn_info["expectedDeliveryDate"] !== 'undefined' ? idn_info["expectedDeliveryDate"] : emptyMessage;

                    profitPoStatus = typeof idn_info["profitPoStatus"] !== 'undefined' ? idn_info["profitPoStatus"] : emptyMessage;
                    profitPoNumber = typeof idn_info["profitPoNumber"] !== 'undefined' ? idn_info["profitPoNumber"] : emptyMessage;
                    profitRrNumber = typeof idn_info["profitRrNumber"] !== 'undefined' ? idn_info["profitRrNumber"] : emptyMessage;
                    profitPoDeliveryDate = typeof idn_info["profitPoDeliveryDate"] !== 'undefined' ? idn_info["profitPoDeliveryDate`"] : emptyMessage;

                    bodyCombined += "<tr>";
                    bodyCombined += "<td>" + tableData[i]["sku"] + "/<br>" + tableData[i]["ean13code"] + "</td>";
                    bodyCombined += "<td>" + tableData[i]["description"] + "</td>";
                    bodyCombined += "<td>" + tableData[i]["quantity"] + "</td>";
                    bodyCombined += "<td>" + profitPoStatus + "/<br>" + profitPoNumber + "/<br>" + profitRrNumber + "/<br>" + profitPoDeliveryDate + "/<br>" + "</td>";
                    bodyCombined += "</tr>";
                }
                $("#indentInqInfoBody").html(bodyCombined);
            }

            var __statusColor = "transparent";
            switch (indentStatus) {
                case '---':
                    __statusColor = 'transparent';
                    break;
                case 'NEW':
                    __statusColor = 'green'
                    break;
                case 'CLOSED':
                    __statusColor = 'red'
                    break;
                default:
                    __statusColor = 'yellow'
            }

            $("#indentInqInfoLabel").html("<table style='width:100%'>" +
                "<tr>" +
                "<td><b>Store Code</b></td>" +
                "<td>" + storeCode + "</td>" +
                "<td><b>Struck No</b></td>" +
                "<td id='indentSlipStruckNo'>" + struckNo + "</td>" +
                "</tr>" +
                "<tr>" +
                "<td><b>Indent Slip No</b></td>" +
                "<td>" + indentSlipNo + "</td>" +
                "<td><b>Indent Status</b></td>" +
                "<td id='indentSlipStatus'><span style='background-color:" + __statusColor + "'>" + indentStatus + "</span></td>" +
                "</tr>" +
                "<tr>" +
                "<td><b>Indent Date</b></td>" +
                "<td>" + indentDate + "</td>" +
                "<td><b>Indent Delivery Date</b></td>" + //INDENT MOIDFIED 20170130
                "<td>" + indentExpDate + "</td>" +
                "</tr>" +
                "</table>");
        },
        "CLOSE INDENT": function () {
            if (!cashierRole.isCustomerServiceCashier) {
                showMsgDialog("MUST BE CUSTOMER SERVICE", "error");
            } else {
                if ($("#indentSlipStruckNo").length === 0) {
                    showMsgDialog("PLEASE SEARCH FIRST", "error");
                } else {
                    if ($("#indentSlipStruckNo").html() === '---') {
                        showMsgDialog("INDENT NOT FOUND", "error");
                    }

                    if ($("#indentSlipStatus").text() === 'CLOSED') {
                        showMsgDialog("INDENT ALREADY CLOSED", "error");
                    } else if ($("#indentSlipStatus").text() === 'VOIDED') {
                        showMsgDialog("INDENT ALREADY VOIDED", "error");
                    } else if ($("#indentSlipStatus").text() === 'CANCELED') {
                        showMsgDialog("INDENT ALREADY CANCELED", "error");
                    } else {
                        showConfirmDialog(
                            'CONFIRM TO CLOSE? ' + $("#indentSlipStruckNo").html(),
                            'warning',
                            function () {
                                //console.log("CLOSE INDENT|OK BUTTON PRESSED");
                                var returnRequest = closeIndent($("#indentSlipStruckNo").html());

                                // voidDeptStore 2017022
                                if (returnRequest === null) {
                                    showMsgDialog("CLOSE FAILED, NO RESPONSE FROM SERVER", "error");
                                    //console.log("close indent FAILED|CLOSE REQUEST FAILED");
                                } else if (returnRequest['result'] > 0) {
                                    // voidDeptStore 2017022
                                    showMsgDialog("CLOSE SUCCESS", "info");
                                    //console.log("close indent OK|" + JSON.stringify(returnRequest));
                                } else {
                                    showMsgDialog("CLOSE FAILED", "error");
                                    //console.log("close indent FAILED|" + JSON.stringify(returnRequest));
                                }
                                clearIndentSales('inquiry');
                            },
                            function () {
                                //console.log("CLOSE INDENT|CANCEL BUTTON PRESSED");
                            }
                        );
                    }
                }
            }
        }
    }
});
// INDENT 2017-05-18

$("#amountConfirmDialog").dialog({
    autoResize: true,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close"
});

$("#txnIdConfirmDialog").dialog({
    autoResize: true,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close"
});


/**
 * Reset dialog labels and texts
 */
function resetPriceConfirmationDialogTexts() {
    $('#confirmationDialog-Amount-label').text("Enter Price");
    $('#itemScanned').empty();
    $("#priceConfirmationMsg").empty();
    //will return to parent screen and redered data.
    $("#inputDisplay").empty();
}

/**
 * Clear authentication form
 */
function clearAuthenticationForm() {
    // make authentication flag set to default value.
    isPreAuthenticated = false;
    $("#fnReturnTx").removeData("isAuthenticated");
    $("#authFormMsg").empty();
    $("#authFormUsername").val("");
    $("#authFormUsername").removeAttr("disabled");
    $("#authFormEmpPin").val("");
    $("#barcodeAuthFormEmpCode").val("");
}

/**
 * Validates authentication form and will return true if all fields are not
 * empty otherwise will return false.
 */
function validateAuthenticationForm() {
    if ($("#authFormUsername").val() != "" && $("#authFormEmpPin").val() != "") {
        return true;
    } else {
        return false;
    }
}

/**
 * Clear authentication form
 */
function clearPin() {
    $("#firstLogonMsg").empty();
    $("#newPassword1").val("");
    $("#newPassword2").val("");
}

function clearShortcutFuncDialog() {
    $("#functionSearchMsg").empty();
    $("#functionNumField").val("");
}

/**
 * Function to show order-summary buttons
 */
function showOkButtonOnOrderMessage() {
    $("#order-message").dialog('option', 'buttons', {
        Ok: function () {
            $(this).dialog("close");
        }
    });
}

/**
 * Amount input confirmation dialog.
 *
 * Call back oriented impelentation of priceConfirmation-dialog
 * It uses callback for OK, Cancel buttons, and also returns the
 * both Input box and Error Msg jQuery instance to the OK-callback.
 */
function showAmountConfirmationDialog(title,
    descriptionLabel,
    defaultAmount,
    okCallbackFn,
    cancelCallbackFn) {

    var $amountConfirmDialog = $("#amountConfirmDialog");
    var $amountDialogConfirmErrorMsg = $amountConfirmDialog.find("#amountDialogConfirmErrorMsg");
    var $amountDialogConfirmMsg = $amountConfirmDialog.find("#amountDialogConfirmMsg");
    var $amountDialogConfirmInput = $amountConfirmDialog.find("#amountDialogConfirmInput");

    // If has title, override the default
    var originalTitleText = $amountConfirmDialog.dialog("option", "title");
    var originalDescriptionText = $amountDialogConfirmMsg.text();
    if (title) {
        $amountConfirmDialog.dialog("option", "title", title);
    }
    if (descriptionLabel) {
        $amountDialogConfirmMsg.text(descriptionLabel);
    }
    // Sets the default value
    $amountDialogConfirmInput.val(defaultAmount);
    $amountConfirmDialog.dialog({
        close: function (event, ui) {
            $amountDialogConfirmInput.val(null);
            $amountConfirmDialog.dialog("option", "title", originalTitleText);
            $amountDialogConfirmMsg.text(originalDescriptionText);
            $amountDialogConfirmErrorMsg.html("");
        },
        buttons: {
            OK: function () {
                var amount = $amountDialogConfirmInput.val().replace(/,/g, '');
                // call callback function after dialog close
                var okCallbackFnReturn = okCallbackFn &&
                    okCallbackFn(parseInt(amount),
                        // The dialog itself
                        $amountConfirmDialog,
                        // Returns the reference to dialog's input box
                        $amountDialogConfirmInput,
                        // Returns the reference to dialog's Error message span
                        $amountDialogConfirmErrorMsg);
                if ( // If the callback is undefined, continue
                    okCallbackFnReturn == undefined
                    // checks if callbackFn returns TRUE.
                    ||
                    okCallbackFnReturn) {
                    // Clearing the input type.
                    $amountDialogConfirmInput.val(null);
                    // set to null so that it wont be reuse again.
                    okCallbackFn = null;
                    // Closing the dialog
                    $(this).dialog("close");
                }
            },
            Cancel: function () {
                if (cancelCallbackFn) {
                    cancelCallbackFn();
                    // set to null so that it wont be reuse again.
                    cancelCallbackFn = null;
                }
                $(this).dialog("close");
            }
        }
    });
    $amountConfirmDialog.dialog("open");
};

function showTxnIdConfirmationDialog(title,
    descriptionLabel,
    defaultValue,
    okCallbackFn,
    cancelCallbackFn) {

    var $txnIdConfirmDialog = $("#txnIdConfirmDialog");
    var $txnIdDialogConfirmErrorMsg = $txnIdConfirmDialog.find("#txnIdDialogConfirmErrorMsg");
    var $txnIdDialogConfirmMsg = $txnIdConfirmDialog.find("#txnIdDialogConfirmMsg");
    var $txnIdDialogConfirmInput = $txnIdConfirmDialog.find("#txnIdDialogConfirmInput");

    // If has title, override the default
    var originalTitleText = $txnIdConfirmDialog.dialog("option", "title");
    var originalDescriptionText = $txnIdDialogConfirmMsg.text();
    $txnIdDialogConfirmMsg.show();
    $txnIdDialogConfirmInput.show();
    if (title) {
        $txnIdConfirmDialog.dialog("option", "title", title);
    }
    if (descriptionLabel) {
        $txnIdDialogConfirmMsg.text(descriptionLabel);
    }
    // Sets the default value
    $txnIdDialogConfirmInput.val(defaultValue);
    $txnIdConfirmDialog.dialog({
        close: function (event, ui) {
            $txnIdDialogConfirmInput.val(null);
            $txnIdConfirmDialog.dialog("option", "title", originalTitleText);
            $txnIdDialogConfirmMsg.text(originalDescriptionText);
            $txnIdDialogConfirmErrorMsg.html("");
        },
        buttons: [{
            id: "OkId",
            text: "OK",
            click: function () {
                var inputValue = $txnIdDialogConfirmInput.val();
                // call callback function after dialog close
                var okCallbackFnReturn = okCallbackFn &&
                    okCallbackFn(inputValue,
                        // The dialog itself
                        $txnIdConfirmDialog,
                        // Returns the reference to dialog's input box
                        $txnIdDialogConfirmInput,
                        // Returns the reference to dialog's Error message span
                        $txnIdDialogConfirmErrorMsg);
                if ( // If the callback is undefined, continue
                    okCallbackFnReturn == undefined
                    // checks if callbackFn returns TRUE.
                    ||
                    okCallbackFnReturn) {
                    // Clearing the input type.
                    $txnIdDialogConfirmInput.val(null);
                    // set to null so that it wont be reuse again.
                    okCallbackFn = null;
                    // Closing the dialog
                    $(this).dialog("close");
                }
            }
        },
        {
            id: "CancelId",
            text: "Cancel",
            click: function () {
                if (cancelCallbackFn) {
                    cancelCallbackFn();
                    // set to null so that it wont be reuse again.
                    cancelCallbackFn = null;
                }
                $(this).dialog("close");
            }
        }
        ]
    });
    $txnIdConfirmDialog.dialog("open");
};



/**
 * Show the transaction complete dialog, with OK
 * button callback
 *
 */
function showTransactionCompletedDialog(title,
    txSummary,
    msg,
    okCallback) {
    var $parentFormDialog = $("#order-message");
    var $dialogOrderSummary = $parentFormDialog.find("#orderSummary");
    var $dialogOrderMsgReminder = $parentFormDialog.find("#orderMsgReminder");

    var originalTitle = $parentFormDialog.dialog('option', 'title');
    var originalTxSummary = $dialogOrderSummary.text();
    var originalMsgReminder = $dialogOrderMsgReminder.text();
    /*
     * Saving to temp variable, the default dialog open
     * function implementation, and reassign it again after the dialog
     * has been closed.
     */
    var defualtOpenFn = $parentFormDialog.dialog('option', 'open');
    if (title) {
        $parentFormDialog.dialog('option', 'title', title);
    }
    if (txSummary) {
        $dialogOrderSummary.html(txSummary);
    }
    if (msg) {
        $dialogOrderMsgReminder.text(msg);
    }
    $parentFormDialog.dialog({
        open: null, // Disabling the default dialog open function implementation.
        close: function (event, ui) {
            $parentFormDialog.dialog('option', 'title', originalTitle);
            $parentFormDialog.dialog('option', 'open', defualtOpenFn);
            $dialogOrderSummary.text(originalTxSummary);
            $dialogOrderMsgReminder.text(originalMsgReminder);
            // Clearing the OK callback
            okCallback = null;
        },
        buttons: {
            Ok: function () {
                if (okCallback) {
                    okCallback();
                }
                $parentFormDialog.dialog("close");
            }
        }
    });
    $parentFormDialog.dialog("open");

};

/**
 * Show the balance CRM points
 * @param crmResponse
 * @param crmID
 */
function showPointsInformation(crmResponse, crmID) {
    if (crmResponse && crmResponse.type == 'SUCCESS') {
        customerIdForReward = crmResponse.accountNumber;

        var msg = "Member Name: " + "<br />" + " <em>" + crmResponse.memberName + "</em><br />";
        msg += "Member ID: " + " <em>" + crmResponse.accountNumber + "</em><br />";
        msg += "Total Points: " + " <em>" + crmResponse.totalPoints + "</em><br />";
        msg += "<br />";

        $("#enterPin-message").dialog('option', 'title',
            'INFORMATION');
        $("#enterPin-message").dialog('option', 'buttons', {
            Ok: function () {
                $(this).dialog("close");
                CustomerPopupScreen.cus_crmCloseShowPoints();
                checkIfMembershipHasExpired(crmResponse, crmID);
            }
        });
        $("#enterPinMsgReminder").html(msg);
        $("#enterPin-message").dialog("open");
        $("#crm-dialog").dialog("close");

        CustomerPopupScreen.cus_crmShowPoints(crmResponse);

        if (isMembershipToBeRenewed) {
            var crmResponse = renewMembership(crmResponse.accountNumber, saleTx);
        }
    } else {
        $("#crmMsgSpan").html(getMsgValue('pos_label_invalid_pin'));
    }
};

function showMemberInputOptionDialog() {
    $("#crm-member-input-option").dialog("open");
}

function showMemberInputOptionLoyaltyDialog() {
    $("#loyalty-member-input-option").dialog("open");
}

/**
 * Check if membership has expired
 * @param crmResponse
 * @param crmID
 */
function checkIfMembershipHasExpired(crmResponse, crmID) {

    if (crmResponse && crmResponse.type == 'SUCCESS') {
        if (crmResponse.loyaltyCardExpired) {
            showConfirmDialog(getMsgValue('pos_label_membership_expired'), "warning",

                function () {
                    crmToggleMembershipRenewal = true;
                    console.log("crmToggleMembershipRenewal 3");
                    promptSysMsg(getMsgValue('pos_label_scan_membership_renewal'), 'Membership Renewal');
                    isMembershipToBeRenewed = true;
                    enablePaymentMedia = true;
                    $("#enterPin-message").dialog("close");
                    $("#crm-dialog").dialog("close");
                },

                function () {
                    $("div#numPad div#keyClr").triggerHandler('click');
                    isRenewMembershipSelected = false;
                    crmEarnPointsSelected = false;
                });
        } else {
            $("#crmCmdDiv").hide();
            $("#crmTxIdDiv").hide();
            if (isRenewMembershipSelected) {
                promptSysMsg(getMsgValue('pos_label_membership_not_expired'), 'Membership Renewal');
            }
            $("#crm-dialog").dialog("close");
            $("#systemMessageDiv").click();
            $("#systemMessageDiv").triggerHandler('click');

            isRenewMembershipSelected = false;
            isMembershipToBeRenewed = false;

            isRenewMembershipSelected = false;
            isMembershipToBeRenewed = false;

            if (crmEarnPointsSelected != true) {
                memberWillEarnPoints = false;
            }
            clearInputDisplay();
        }
    }
};

/**
 * Triggers the post authentication functions for cashier.
 * @param $domWithData the JQuery dom instance containing
 * the authentication data.
 */
function triggerPostAuthFunctions($domWithData) {
    isAuthenticated = isPreAuthenticated;

    var trainingMode = $(this).data("trainingMode");
    var currDefer = $domWithData.data('defer');

    // Start: Supervisor intervention data processing
    var supervisorInterventionData =
        SUPERVISOR_INTERVENTION.extractSupervisorInterventionData($domWithData, isTrainingModeOn /*Global Variable*/);
    // End: Supervisor intervention data processing
    if (currDefer) {
        /* Calls the next chained callback
         * if a defer object is passed.
         * RETURNS supervisorInterventionData to pipe
         */
        currDefer.resolve(supervisorInterventionData);
        /* Clearing the JQuery deferred object passed to this
         * authentication dialog.
         */
        $domWithData.data('defer', null);
    }

    if (toggleVoid) {
        if ($('#tempQtyDiv').html() != undefined) {
            renderQuantity(itemQty);
        }
        if (toggleTVS) {
            saveSysMsg();
        }
        promptSysMsg("SCAN/ENTER ITEM TO BE VOIDED.");
    } else if (forceSignOffFlag) {
        executeForceSignOff(supervisorInterventionData);
    } else if (trainingMode) {
        isTrainingModeOn = isTrainingModeOn ? false : true;
        promptSysMsg();
    } else if (toggleTVS) {
        showConfirmDialog("Turn-On Open Price?", "OPEN PRICE", function () {
            activateTVS();
        }, function () {
            clearTVS();
        });
    } else if (CRMAccountModule.Hypercash.toggleCrmOfflineMode) {
        CRMAccountModule.Hypercash.postCRMOfflineModeFunction();
    } else if (toggleBankMega) {
        toggleBankMega = false;

        if (supervisorInterventionData) {
            supervisorInterventionData.amount = 0;
            supervisorInterventionData.interventionType = CONSTANTS.TX_TYPES.BANK_MEGA.name;
            SUPERVISOR_INTERVENTION.saveCustomSupervisorIntervention(supervisorInterventionData);
        }
    } else if (fn103) {
        fn103 = false;

        if (supervisorInterventionData) {
            supervisorInterventionData.amount = 0;
            supervisorInterventionData.interventionType = CONSTANTS.TX_TYPES.CASHIER_X_REPORT.name;
            SUPERVISOR_INTERVENTION.saveCustomSupervisorIntervention(supervisorInterventionData);
        }
    } else if(midnightSalesPreLogin){
        midnightSalesSuccessLogin = true;
        midnightSalesPreLogin = false;
        applyEmployeeDiscount();
        midnightSalesTimeout = setTimeout(midnightSalesLogin, parseInt(getConfigValue('EMP_LOGIN_TIMEOUT')));
    }
}

function midnightSalesLogin() {
    showMsgDialog("Button Discount Session Timeout", "warning");
    midnightSalesSuccessLogin = false;
    clearTimeout(midnightSalesTimeout);
}


/**
 * Dialog for balloon game redemption
 */
$("#balloonGameInputMember-dialog").dialog({
    width: 400,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    open: function (event, ui) {
        $("#balloonGameMemberMsg").empty();
        $("#balloonGameMemberIdField").val("");
    },
    buttons: {
        Cancel: function () {
            BALLOON_GAME.closeCashierLoadingDialog();

            /*
             * TODO: Find a better way to do this
             * this will fire the final leg of the txn
             */
            $("#balloonGamePrompt-dialog").dialog("close");

            $(this).dialog("close");
        },
        OK: function () {
            var balloonGameMemberId = $("#balloonGameMemberIdField").val();

            if (balloonGameMemberId == "" || isNaN(balloonGameMemberId)) {
                $("#balloonGameMemberMsg").html("INVALID ENTRY");
            } else {



                $("#loading-dialog").dialog("open");
                $("#loadingDialogMessage").html(getMsgValue("balloon_game_loading_msg3"));
                $(this).dialog("close"); // remove input member

                // TODO: find a better way to do this
                // Add delay to show the loading screen and avoiding hanging on an input box
                setTimeout(function () {
                    BALLOON_GAME.getRedeemableItems(balloonGameMemberId, saleTx.orderItems);
                }, 100);

            }
        }
    }
});

$("#balloonGameLoading-dialog").dialog({
    hide: "highlight",
    show: "highlight",
    width: 300,
    height: 250,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        // do nothing
    },
    buttons: {
        Cancel: function () {
            CustomerPopupScreen.cus_closeBalloonGameItemsDialog();
            $(this).dialog("close");
        }
    }
});

$("#flashizCheckPayment-dialog").dialog({
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    width: 365,
    close: function () {
        $("#flashizCheckPaymentDialogMsg").empty();
        CustomerPopupScreen.cus_closeFlashizQRCodeDialog();
    }
});

// MLC 2017-04-21
$("#MLCCheckPayment-dialog").dialog({
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    width: 365,
    close: function () {
        $("#MLCCheckPaymentDialogMsg").empty();
        CustomerPopupScreen.cus_closeMLCQRCodeDialog();
    }
});
// MLC 2017-04-21

$("#OVOCheckPayment-dialog").dialog({
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    width: 365,
    open: function (event, ui) {
        ovoCountCashier=70;
        ovoCounterCashier=setInterval(ovoTimerCashier, 1000);
    },
    close: function () {
        $("#OVOCheckPaymentDialogMsg").empty();
        CustomerPopupScreen.cus_closeOVOQRCodeDialog();
    }
});

// MLC 2017-04-21
$("#ALTOWCCheckPayment-dialog").dialog({
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    width: 365,
    close: function () {
        $("#ALTOWCCheckPaymentDialogMsg").empty();
        CustomerPopupScreen.cus_closeAltoWeChatQRCodeDialog();
    }
});
// MLC 2017-04-21

$("#balloonGameInputMember-dialog").on("dialogclose", function (event, ui) {
    $("#balloonGameMemberMsg").empty();
    $("#balloonGameMemberIdField").val("");

});

$("#eft-retrieve-transaction-dialog").on("dialogclose", function (event, ui) { });
$("#eft-retrieve-transaction-dialog").dialog({
    width: 340,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    open: function (event, ui) { }
});
$("div.eft-retrieve-transaction-selection-class").click(function (eventObj) {
    var targetElement = eventObj.currentTarget;
    var targetElementId = $(targetElement).attr("id");
    /*reprint last transaction*/
    if (targetElementId == "eftLastTxnBtn") {
        EFT.isLastTransaction = true;
        var eftParams = {
            bank: configuration.banks[CONSTANTS.EFT.BANK.BANK_MEGA.name],
            onlineFlag: CONSTANTS.EFT.STATUS.ONLINE,
            transactionType: eftTransactionType,
            vendor: eftVendor
        };
        EFT.processEFTOnlineTransaction(eftParams);
        $("#eft-processing-dialog").dialog("open");
    } /*reprint specific transaction by trace number*/
    else if (targetElementId == "eftSpecificTxnBtn") {
        EFT.isLastTransaction = false;
        $("#bank-mega-input-trace-number-dialog").dialog("open");
    } else {
        showMsgDialog(getMsgValue("pos_error_msg_eft_transaction_is_not_supported"), "error");
    }
    if ($('#eft-retrieve-transaction-dialog').dialog("isOpen")) {
        $('#eft-retrieve-transaction-dialog').dialog("close");
    }
});


/**
 * Retrieved Eft Transaction Details
 */
$("#eft-retrieve-transaction-details").on("dialogclose", function (event, ui) {
    $("#eftTransactionDetails").empty();
    clearEFT(true);
});
$("#eft-retrieve-transaction-details").dialog({
    width: 400,
    height: 500,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    open: function (event, ui) {
        var output = "";
        if (eftDataObj) {
            output += "<em>===== Transaction Status ===== </em><br />";
            output += "<em>" + getMsgValue('pos_receipt_eft_batch') + ": " + eftDataObj.batchNum + "</em><br />";
            output += "<em>" + getMsgValue('pos_receipt_eft_trace') + ": " + eftDataObj.traceNum + "</em><br />";
            output += "<em>" + getMsgValue('pos_receipt_eft_rref') + ": " + eftDataObj.referenceCode + "</em><br />";
            output += "<em>" + getMsgValue('pos_receipt_eft_approval') + ": " + eftDataObj.approvalCode + "</em><br />";
            output += "<br/>";
            output += "<em>===== Card Details ===== </em><br />";
            output += "<em>" + getMsgValue('pos_receipt_eft_card_type') + ": " + getCardType(eftDataObj.cardNum, creditCardType) + "</em><br />";
            output += "<em>" + getMsgValue('pos_receipt_eft_card_number') + ": " + eftDataObj.cardNum + "</em><br />";
            output += "<em>" + getMsgValue('pos_receipt_eft_card_holder_name') + ": " + eftDataObj.cardHolder + "</em><br />";
            output += "<br/>";

            output += "<em>===== Transaction Details ===== </em><br />";
            if (eftTransactionType.search(CONSTANTS.EFT.INSTALLMENT_TYPE.MEGA_PAY) != -1) {
                output += "<em>" + getMsgValue('pos_receipt_eft_period') + ": " + eftDataObj.period + getMsgValue('pos_receipt_eft_month') + "</em><br />";
                output += "<em>" + getMsgValue('pos_receipt_eft_interest_rate') + ": " + eftDataObj.interestRate + getMsgValue('pos_receipt_eft_percent_symbol') + "</em><br />";
                output += "<em>" + getMsgValue('pos_receipt_eft_first_installment_amount') + ": " + getMsgValue('pos_receipt_currency_symbol') + " " + numberWithCommas(eftDataObj.firstInstallment) + "</em><br />";
            } else if (eftTransactionType == CONSTANTS.EFT.EFT_TRANSACTION_TYPE.MEGA_POINT.name) {
                var redeemPoint = (parseInt(eftDataObj.openingPoint) - parseInt(eftDataObj.availablePoint)).toString();
                output += "<em>" + getMsgValue('pos_receipt_eft_redeem_ref') + ": " + eftDataObj.redeemReference + "</em><br />";
                output += "<em>" + getMsgValue('pos_receipt_eft_catalog_code') + ": " + eftDataObj.catalogCode + "</em><br />";
                output += "<em>" + getMsgValue('pos_receipt_eft_opening_point') + ": " + eftDataObj.openingPoint + "</em><br />";
                output += "<em>" + getMsgValue('pos_receipt_eft_redeem_point') + ": " + redeemPoint + "</em><br />";
                output += "<em>" + getMsgValue('pos_receipt_eft_available_point') + ": " + eftDataObj.availablePoint + "</em><br />";
                output += "<em>" + getMsgValue('pos_receipt_eft_amount_for_point') + ": " + eftDataObj.amountForPoint + "</em><br />";
                output += "<em>" + getMsgValue('pos_receipt_eft_amount_for_sale') + ": " + eftDataObj.amountForSale + "</em><br />";
            }
            output += "<em>" + getMsgValue('pos_receipt_eft_total_amount') + ": " + getMsgValue('pos_receipt_eft_currency') + numberWithCommas(removeLeadingZeroes(eftDataObj.transactionAmount)) + "</em><br />";
        }
        $("#eftTransactionDetails").append(output);
        showAddPaymentButtonOnRetrieveEftTransaction();
    }
});

/**
 * Function to show order-summary buttons
 */
function showAddPaymentButtonOnRetrieveEftTransaction() {
    if (enablePaymentMedia) {
        $("#eft-retrieve-transaction-details").dialog('option', 'buttons', {
            "Add Payment": function () {
                EFT.addRetrievedTransactionAsPayment();
                $(this).dialog("close");
            },
            Close: function () {
                $(this).dialog("close");
            }
        });
    } else {
        $("#eft-retrieve-transaction-details").dialog('option', 'buttons', {
            Close: function () {
                $(this).dialog("close");
            }
        });
    }
}


$("#billPaymentContractNumInput-dialog").dialog({
    width: 430,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    open: function (event, ui) {
        $("#billPaymentContractNumMsg").empty();
        $("#billPaymentContractNumInputField").empty();
        //BILL_PAYMENT.refreshBillPayment();
    },
    buttons: {
        Cancel: function () {
            BILL_PAYMENT.refreshBillPayment();
            $(this).dialog("close");
        },
        OK: function () {
            var customerNumber = $("#billPaymentContractNumInputField").val();

            if (!isAlphaNumeric($.trim(customerNumber))) {
                $("#billPaymentContractNumMsg").text(getMsgValue('bp_error_no_contract_num_input'));
            } else {
                //call to bills payment web service
                BILL_PAYMENT.retrieveCustomerInfo(customerNumber);
            }
        }
    }
});

$("#billPaymentContractNumInput-dialog").on("dialogclose", function (event, ui) {
    $("#billPaymentContractNumMsg").empty();
    $("#billPaymentContractNumInputField").val("");
});

$("#billPaymentContractInfo-dialog").dialog({
    width: 430,
    height: 340,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    dialogClass: "no-close",
    closeOnEscape: false,
    open: function (event, ui) {
        var billPaymentInfo = $("#billPaymentContractInfo-dialog").data("billPaymentInfo");
        $("#billPaymentContractInfoMsg").empty();
        $("#billPaymentContractPeriod").text(getMsgValue("bp_label_contract_period_months")
            .format(billPaymentInfo.paymentPeriod));
        $("#billPaymentTotalAmt").text(numberWithCommas(billPaymentInfo.totalAmount));
        $("#billPaymentPenaltyFee").text(numberWithCommas(billPaymentInfo.penaltyFee));
        $("#billPaymentAdminFee").text(numberWithCommas(billPaymentInfo.adminFee));
        $("#billPaymentCustomerName").text(billPaymentInfo.customerName);

        var adminFee = billPaymentInfo.adminFee ? billPaymentInfo.adminFee : 0;
        var penaltyFee = billPaymentInfo.penaltyFee ? billPaymentInfo.penaltyFee : 0
        var installment = Math.round(billPaymentInfo.totalAmount - adminFee - penaltyFee);

        $("#billPaymentInstallmentAmt").text(numberWithCommas(installment));

    },
    buttons: {
        Cancel: function () {
            $("#billPaymentContractNumMsg").empty();
            $("#billPaymentContractNumInputField").val("");
            $("#billPaymentContractPeriod").empty();
            $("#billPaymentTotalAmt").empty();
            $("#billPaymentPenaltyFee").empty();
            $("#billPaymentAdminFee").empty();
            $("#billPaymentInstallmentAmt").empty();
            $("#billPaymentContractNumInput-dialog").dialog("open");
            $(this).dialog("close");
        },
        OK: function () {
            //display_print receipt
            var billPaymentInfo = $("#billPaymentContractInfo-dialog").data("billPaymentInfo");
            var itemInfoList = BILL_PAYMENT.getItemInfoList(billPaymentInfo);

            if (!(saleTx.startDate))
                saleTx.startDate = new Date();

            //init bill payment trasaction type
            saleTx.type = CONSTANTS.TX_TYPES.BILL_PAYMENT.name
            saleTx.totalAmount = billPaymentInfo.totalAmount;
            saleTx.totalQuantity = 1;
            saleTx.billPaymentItem = billPaymentInfo;

            disableClrFn = true;
            enableCoBrand = false;
            renderTransactionType();
            renderProductDetails(itemInfoList[0]);
            renderScannedItem(itemInfoList[0]);
            renderTotal();
            clearInputDisplay();
            $("#btnAddItem").empty();

            changeCustomerActiveScreen(CONSTANTS.CUSTOMER_PAGE_SCREEN_TYPES.TRANSACTION);

            if (!isHcEnabled) {
                printReceipt({
                    header: setReceiptHeader(saleTx),
                    body: setReceiptItems(saleTx,
                        itemInfoList, { currency: "Rp" })
                });
            }

            $(this).dialog("close");
        }
    }
});

$("#holdRecallFunctions-dialog").dialog({
    width: 350,
    height: 250,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false
});

$("#billPaymentFunctions-dialog").dialog({
    width: 350,
    height: 250,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false
});
$("#trkPaymentFunctions-dialog").dialog({
    width: 350,
    height: 250,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false
});
var staffFlag = false;
var tmpStaff = "";
$("#staffId-dialog").dialog({
    width: 450,
    height: 350,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    dialogClass: "no-close",
    closeOnEscape: false,
    open: function (event, ui) {
        console.log("posdialog.js 3");
    },
    buttons: {
        Cancel: function () {
            $(this).dialog("close");
        },
        Submit: function () {
            console.log("posdialog.js 4");
            staffFlag = true;
            tmpStaff = $("#tstaffId").val();
            $(this).dialog("close");
        }
    }
});

$("#grabId-dialog").dialog({
    width: 450,
    height: 350,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    dialogClass: "no-close",
    closeOnEscape: false,
    open: function (event, ui) {
        console.log("posdialog.js 3");
    },
    buttons: {
        Cancel: function () {
            $(this).dialog("close");
        },
        Submit: function () {
            console.log("posdialog.js 4");
            // staffFlag = true;
            // tmpStaff = $("#tstaffId").val();
            $(this).dialog("close");
        }
    }
});

var tmpSpcOrder = ""; //RAHMAT SPO
$("#specialOrder-dialog").dialog({
    width: 450,
    height: 350,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    dialogClass: "no-close",
    closeOnEscape: false,
    open: function (event, ui) {
        $("#tspcOrder").focus();
        $(".spoTypeRadio").attr("checked", false);
    },
    buttons: {
        Cancel: function () {
            $(this).dialog("close");
        },
        Submit: function () {
            var msg = "Harap di isi semua.";
            if ($("#tspcOrder").val() == "" || $('input[name=spoType]:checked').val() == undefined) {
                $("#specOrder").html(msg);
            } else {
                // console.log($('input[name=spoType]:checked').val());
                $("#specOrder").html('');
                specialOrder = true;
                specialOrderType = $('input[name=spoType]:checked').val();
                tmpSpcOrder = ($("#tspcOrder").val().toUpperCase()[0] === 'S') ? $("#tspcOrder").val().toUpperCase() : 'S' + $("#tspcOrder").val().toUpperCase();
                promptSysMsg(" ", "SPECIAL ORDER");
                $(this).dialog("close");
            }
        }
    }
});

$("#receipt_output-dialog").dialog({
    width: 400,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        document.getElementById("valRec2Printer").checked = false;
        document.getElementById("valRec2eMail").checked = false;
        document.getElementById("valRecNone").checked = false;
    },
    buttons: {
        OK: function () {
            printTo = $('input[name=recPrintOpt]:checked').val();
            uilog('DBUG', 'printTo : ' + printTo);
            if (!printTo) {
                $("#receipt_outputMsg").html("Silahkan pilih output struk");
                return false;
            } else {
                $("#receipt_outputMsg").html('');
                if (printTo == "E") {
                    loyEarnPointsSelected = true;

                    $("#loyProgTxIdDiv label").text('ENTER MOBILE NO:');

                    console.log("Masuk ke earn Point");

                    if (loyEarnPointsSelected == true) {
                        promptSysMsg(getMsgValue('pos_label_input_member_contact'), getMsgValue('pos_label_employee_loyalty_card'));
                    } else {
                        promptSysMsg();
                    }
                }
            }
            $(this).dialog("close");
        }
    }
});
$("#custLoyalty_mail_info-dialog").dialog({
    width: 400,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        console.log("InfoloyaltyProgram on open custLoyalty_mail_info-dialog");
        console.log(InfoloyaltyProgram);
        CustomerPopupScreen.cus_showLoyaltyMailDialog(InfoloyaltyProgram);
        displayLoyaltyMail(InfoloyaltyProgram);
    },
    buttons: {
        OK: function () {
            promptSysMsg(getMsgValue('pos_label_member_id_is_active'), getMsgValue('pos_label_employee_loyalty_card'));
            $("#inputDisplay").val("");
            renderCustomerInfo(InfoloyaltyProgram.memberName, InfoloyaltyProgram.hpNumber);
            saleTx.customerId = InfoloyaltyProgram.hpNumber;
            saleTx.isLoyalty = true;
            customerIdForReward = InfoloyaltyProgram.hpNumber;
            empLoyaltyPointsAvail = true;
            console.log("customer sale tx" + saleTx.customerId);
            CustomerPopupScreen.cus_removeLoyaltyMailDialog();
            $(this).dialog("close");
        },
        UPDATE: function () {
            CustomerPopupScreen.cus_removeLoyaltyMailDialog();
            $(this).dialog("close");
            $("#custLoyalty_mail_upd-dialog").dialog("open");
        }
    }
});
$("#valUpdDREmail").keyboard({
    display: completeDisplay,
    layout: 'custom',
    customLayout: customCompleteLayout,
    visible: function (e, keyboard, el) {
        addClickHandler(keyboard);
    }
});
$("#custLoyalty_mail_upd-dialog").dialog({
    width: 400,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        $("#labUpdDRMemberName").html(getMsgValue("member_name_loyalty"));
        $("#labUpdDRHpNumber").html(getMsgValue("handphone_number_loyalty"));
        $("#labUpdDREmail").html(getMsgValue("email_loyalty"));
        $("#valUpdDRHpNumber").val(InfoloyaltyProgram.hpNumber);
        $("#valUpdDRMemberName").val(InfoloyaltyProgram.memberName);
        $("#valUpdDREmail").val(InfoloyaltyProgram.email);
    },
    buttons: {
        //no buttons
        SUBMIT: function () {
            var RegHpNumber = $("#valUpdDRHpNumber").val();
            var RegEmail = $("#valUpdDREmail").val();
            var saveFlag = true;
            var message = "Please fill up this field";

            function validateEmail(RegEmail) {
                var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return re.test(RegEmail);
            }
            if (RegEmail == "") {
                if (printTo == "E") {
                    $("#invalidUpdDREmail").html('Untuk bisa menerima digital receipt, email tidak boleh kosong');
                    saveFlag = false;
                } else {
                    $("#invalidUpdDREmail").html('');
                }
            } else if (!validateEmail(RegEmail)) {
                $("#invalidUpdDREmail").html(RegEmail + " is Not valid ! " + "Example: abc@def.com");
                saveFlag = false;
            } else {
                $("#invalidUpdDREmail").html('');
            }
            var type = "upd_email";
            if (saveFlag) {
                regLoyaltyProgram = {
                    hpNumber: RegHpNumber,
                    email: RegEmail,
                    userName: loggedInUsername,
                    storeCode: configuration.storeCode
                }
                updMailServices(type, regLoyaltyProgram);
            }
        },
        BACK: function () {
            if (printTo == "E") {
                if (InfoloyaltyProgram.email == "") {
                    $("#invalidUpdDREmail").html('Untuk bisa menerima digital receipt, email tidak boleh kosong');
                } else {
                    $("#custLoyalty_mail_info-dialog").dialog("open");
                    // CustomerPopupScreen.cus_showLoyaltyMailDialog(InfoloyaltyProgram);
                    $(this).dialog("close");
                }
            } else {
                // CustomerPopupScreen.cus_showLoyaltyMailDialog(InfoloyaltyProgram);
                $("#custLoyalty_mail_info-dialog").dialog("open");
                $(this).dialog("close");
            }
        }
    }
});
$("#custLoyalty_mail_upd-dialog").on("dialogclose", function (event, ui) {
    $("#valUpdDRHpNumber").val('');
    $("#valUpdDRMemberName").val('');
    $("#valUpdDREmail").val('');
});

function updMailServices(type, dataBody) {
    var data = {
        type: type,
        hpNumber: dataBody.hpNumber,
        email: dataBody.email,
        userName: dataBody.userName,
        storeCode: dataBody.storeCode
    }
    data = JSON.stringify(data);
    console.log("updMail data : " + data);
    $.ajax({
        type: 'POST',
        url: posWebContextPath + '/cashier/loyalty/process',
        async: false,
        contentType: "application/json",
        data: data,
        timeout: 30000,
        success: function (response) {
            if (response.rspCode == "00") {
                console.log("updMailServices resp : " + JSON.stringify(response));
                promptSysMsg(getMsgValue('pos_label_member_id_is_active'), getMsgValue('pos_label_employee_loyalty_card'));
                $("#inputDisplay").val("");
                renderCustomerInfo(response.memberList[0].cust_full_name, response.memberList[0].phone_no_1);
                saleTx.customerId = dataBody.hpNumber;
                saleTx.isLoyalty = true;
                customerIdForReward = dataBody.hpNumber;
                empLoyaltyPointsAvail = true;
                InfoloyaltyProgram = {
                    memberName: response.memberList[0].cust_full_name,
                    hpNumber: response.memberList[0].phone_no_1,
                    beginningPoints: response.memberList[0].prev_point,
                    earnedPoint: response.memberList[0].earnedPoint,
                    balancePoint: response.memberList[0].current_point,
                    email: response.memberList[0].email
                }
                console.log("customer sale tx after upd: ");
                console.log(InfoloyaltyProgram);
                $("#custLoyalty_mail_upd-dialog").dialog("close");
                $("#custLoyalty_mail_info-dialog").dialog("open");
                // CustomerPopupScreen.cus_showLoyaltyMailDialog(InfoloyaltyProgram);
                // displayLoyaltyMail(InfoloyaltyProgram);
            } else {
                alert(response.msg);
            }
        },
        error: function () {
            uilog('DBUG', 'call Update Mail');
        }
    });
}

/* 
    CHANGE REQUEST : MAX DISCOUNT DEPTSTORE
    Configuration will be maintained in Krofit application to add maximum discount for item hierarchy
    Maximum discount will prioritize from smaller to higher hierarchy (subfamily > family >> group family > dept > division)
*/
function deptstoreMaximumDiscount() {
    var product = findItem(deptStoreTempEan);
    var productDiv = product.sku.substring(0, 1);
    var productDept = product.sku.substring(0, 2);
    var productGroupfam = product.sku.substring(0, 3);
    var productFam = product.sku.substring(0, 4);
    var productSubfam = product.sku.substring(0, 5);

    var maxDisc = 100;

    if (product.categoryId != 'undefined' && (product.categoryId == 'DEPTSTORE' || product.categoryId == 'DEPT_STORE'))
        maxDisc = 100;
    else if (typeof (configuration.properties["DEPSTORE_" + productSubfam]) != 'undefined')
        maxDisc = parseInt(configuration.properties["DEPSTORE_" + productSubfam]);
    else if (typeof (configuration.properties["DEPSTORE_" + productFam]) != 'undefined')
        maxDisc = parseInt(configuration.properties["DEPSTORE_" + productFam]);
    else if (typeof (configuration.properties["DEPSTORE_" + productGroupfam]) != 'undefined')
        maxDisc = parseInt(configuration.properties["DEPSTORE_" + productGroupfam]);
    else if (typeof (configuration.properties["DEPSTORE_" + productDept]) != 'undefined')
        maxDisc = parseInt(configuration.properties["DEPSTORE_" + productDept]);
    else if (typeof (configuration.properties["DEPSTORE_" + productDiv]) != 'undefined')
        maxDisc = parseInt(configuration.properties["DEPSTORE_" + productDiv]);

    return maxDisc;
}

function deptstoreMaximumDiscountValid() {
    var sPrice = Math.round($('#deptNettPrice').data('sprice'));
    var markdown = $('#deptNettPrice').data('discmarkdown'); // INHOUSE VOUCHER 2017-04-13
    var discArray = $('#deptNettPrice').data('discprice'); // INHOUSE VOUCHER 2017-04-13

    if (markdown > 0) sPrice -= markdown;

    //To estimate percentage discount given
    var sPriceInitial = sPrice;
    var sPriceFinal = sPrice;

    for (var f = 0; f < discArray.length; f++) {
        var discAmt = 0;
        if (discArray[f] <= 1) {
            discAmt = Math.round(sPrice * discArray[f]);
        } else {
            discAmt = discArray[f];
        }
        sPriceFinal -= discAmt;
    }

    var maxDisc = deptstoreMaximumDiscount();
    var curDisc = ((sPriceInitial - sPriceFinal) / sPriceInitial) * 100;

    if (curDisc > maxDisc)
        return false;
    else
        return true;

}
//FAHMI - CR MAXDISC END

$("#couponReturn-dialog").on("dialogclose", function (event, ui) {
    $("#stdCouponReturnField").val("");
});

$("#couponReturn-dialog").dialog({
    width: 550,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        $("#stdCouponReturnField").val("");
    },
    buttons: {
        Back: function () {
            $(this).dialog("close");
        },
        Clear: function () {
            $("#stdCouponReturnField").val("");
            $("#stdCouponReturnMsgSpanValue").remove();
            $("#stdCouponReturnValue").remove();
        },
        Confirm: function () {
            var mediaType = CONSTANTS.PAYMENT_MEDIA_TYPES.COUPON_RETURN.name;
            var pymtMediaTypeName = CONSTANTS.PAYMENT_MEDIA_TYPES.COUPON_RETURN.name;
            console.log("Value of coupon return : " + $('#stdCouponReturnValue').html());

            if ($('#stdCouponReturnValue').html() != undefined) {
                var payment = parseInt($('#stdCouponReturnValue').html());
                processNonCmcPayment(function () {
                    if (PAYMENT_MEDIA.isValidForTriggering(saleTx, pymtMediaTypeName, payment, enablePaymentMedia) && isNoneGiftCardItemInTransaction()) {
                        var txnId = $("#stdCouponReturnField").val();
                        CASHIER.executePaymentMedia(saleTx, pymtMediaTypeName, payment, { 'couponReturn': { 'couponReturnId': txnId } });
                    }
                }, mediaType);

                $("#stdCouponReturnField").val("");
                $("#stdCouponReturnMsgSpanValue").remove();
                $("#stdCouponReturnValue").remove();
                $(this).dialog("close");
            } else {
                $("#stdCouponReturnMsgSpanValue").remove();
                $("#stdCouponReturnValue").remove();

                var cardNumber = $('input[name=optGroup]:checked').val();
                var txnId = $("#stdCouponReturnField").val();
                console.log(txnId);
                console.log(saleTx);

                var couponReturnGet = RETURN_REFUND.return.ajax.getCouponReturn(txnId);
                console.log(couponReturnGet);

                try {
                    couponReturnData = JSON.parse(couponReturnGet);

                    if (!couponReturnData.result) {
                        showMsgDialog("Nomor transaksi tidak ada", "warning");
                    } else {
                        couponReturnData = couponReturnData.result;
                        var isoDate = couponReturnData.create_date_aud.split(" ").join("T");
                        console.log("iso date : " + isoDate);

                        var transactionDate = new Date(isoDate);
                        console.log("transaction date : " + transactionDate);
                        var timeUntilMidnight = transactionDate.setHours(24, 0, 0, 0);
                        console.log("time until midnight : " + timeUntilMidnight);

                        var now = new Date();

                        console.log(now + "," + timeUntilMidnight + "," + transactionDate);

                        var canBeUsedInThisStore = saleTx.storeCd == couponReturnData.store_id;
                        var canBeUsedRightNow = now < timeUntilMidnight;

                        var payment = couponReturnData.amount;

                        console.log("Can be used in this store : " + canBeUsedInThisStore);
                        console.log("Can be used right now : " + canBeUsedRightNow);

                        var success = false;
                        console.log(saleTx);
                        if (couponReturnData.is_trk_item == 1 && !saleTx.saleGameItemTrkFlag) {
                            showMsgDialog("Kupon hanya dapat digunakan pada transaksi TRK SALE GAME ITEM", "warning");
                        } else if (couponReturnData.is_trk_item == 0 && saleTx.saleGameItemTrkFlag) {
                            showMsgDialog("Kupon yang dapat digunakan adalah kupon khusus untuk TRK SALE GAME ITEM", "warning");
                        } else if (SALE_RETURN_COUPON.isCouponAlreadyUsedInTransaction(txnId)) {
                            showMsgDialog("Kupon hanya dapat digunakan sekali pada transaksi yang sama", "warning");
                        } else if (!canBeUsedInThisStore) {
                            showMsgDialog("Kupon hanya dapat digunakan di toko yang sama dengan transaksi penukaran sebelumnya", "warning");
                        } else if (!canBeUsedRightNow) {
                            showMsgDialog("Kupon hanya dapat digunakan di hari yang sama dengan transaksi penukaran sebelumnya", "warning");
                        } else if (couponReturnData.is_used == 1) {
                            showMsgDialog("Kupon hanya dapat digunakan sekali", "warning");
                        } else if (canBeUsedInThisStore && canBeUsedRightNow && PAYMENT_MEDIA.isValidForTriggering(saleTx, pymtMediaTypeName, payment, enablePaymentMedia) && isNoneGiftCardItemInTransaction()) {
                            var formattedPayment = numberWithCommas(payment);
                            $(this).append($("<span id='stdCouponReturnMsgSpanValue'><label>Coupon Amount : <span id='stdCouponReturnFormattedValue'>Rp {0}</span></label></span>".format(formattedPayment)));
                            $(this).append($("<span id='stdCouponReturnValue'>{0}</span>".format(payment)));
                            $("#stdCouponReturnValue").hide();
                            success = true;
                        }

                        if (!success) {
                            $("#stdCouponReturnField").val("");
                        }
                    }
                } catch (err) {
                    $("#couponReturnOffline-dialog").dialog("open");
                    if (couponReturnGet) {
                        showMsgDialog(couponReturnGet, "warning");
                    } else {
                        showMsgDialog("PROBLEM OCCURED", "warning");
                    }
                    $(this).dialog("close");
                }
            }
        }
    }
});

$("#couponReturnOffline-dialog").on("dialogclose", function (event, ui) {
    $("#stdCouponReturnOfflineField").val("");
    $("#stdCouponReturnAmountField").val("");
    $("#stdCouponReturnOfflineMsgSpan").empty();
});

$("#couponReturnOffline-dialog").dialog({
    width: 550,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        $("#stdCouponReturnOfflineField").val("");
        $("#stdCouponReturnAmountField").val("");
        $("#stdCouponReturnOfflineMsgSpan").empty();
    },
    buttons: {
        Back: function () {
            $(this).dialog("close");
        },
        Clear: function () {
            $("#stdCouponReturnOfflineField").val("");
            $("#stdCouponReturnAmountField").val("");
            $("#stdCouponReturnOfflineMsgSpan").empty();
        },
        Confirm: function () {
            var mediaType = CONSTANTS.PAYMENT_MEDIA_TYPES.COUPON_RETURN.name;
            var pymtMediaTypeName = CONSTANTS.PAYMENT_MEDIA_TYPES.COUPON_RETURN.name;

            var payment = parseInt($('#stdCouponReturnAmountField').val());
            var txnId = $("#stdCouponReturnOfflineField").val();

            processNonCmcPayment(function () {
                if (PAYMENT_MEDIA.isValidForTriggering(saleTx, pymtMediaTypeName, payment, enablePaymentMedia) && isNoneGiftCardItemInTransaction()) {
                    var txnId = $("#stdCouponReturnField").val();
                    CASHIER.executePaymentMedia(saleTx, pymtMediaTypeName, payment, { 'couponReturn': { 'couponReturnId': txnId } });
                }
            }, mediaType);
            $(this).dialog("close");
        }
    }
});

$("#simpatindo-dialog").on("dialogclose", function (event, ui) {
    $("#simpatindoCmdField").val("");
});

$("#simpatindo-dialog").dialog({
    width: 350,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) { },
});

$("#simpatindoInquiry-dialog").on("dialogclose", function (event, ui) { });

$("#simpatindoInquiry-dialog").dialog({
    width: 550,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        $("#simpatindoInquiryField").val("");
        $("#simpatindoInquiryMsgSpan").empty();

        $(this).data("inquiryTryLeft", 2);
        $("#simpatindoInquiryLeftMsg").html($(this).data("inquiryTryLeft"));
    },
    buttons: {
        Back: function () {
            $(this).dialog("close");
        },
        Clear: function () {
            $("#simpatindoInquiryField").val("");
            $("#simpatindoInquiryMsgSpan").empty();
        },
        Confirm: function () {
            var inquiryTryLeft = $(this).data("inquiryTryLeft");
            var txId = $("#simpatindoInquiryField").val();

            if (!txId) {
                $("#simpatindoInquiryMsgSpan").html("Invalid Transaction ID.");
            } else {
                if (inquiryTryLeft > 0) {
                    var inquiry = SIMPATINDO.manualInquiry(saleTx, txId);
                    console.log("Inquiry : ");
                    console.log(inquiry);

                    if (typeof inquiry == "object") {
                        if (inquiry) {
                            console.log("Inquiry true");
                            $("#simpatindoInquiryInfo-dialog").data("inquiryResponse", inquiry);
                            $("#simpatindoInquiryInfo-dialog").dialog("open");
                            $(this).dialog("close");
                        }
                    } else {
                        $(this).data("inquiryTryLeft", inquiryTryLeft - 1);
                        $("#simpatindoInquiryLeftMsg").html($(this).data("inquiryTryLeft"));
                    }
                } else {
                    showMsgDialog("Transaksi sedang dalam proses.", "info");
                    $(this).dialog("close");
                }
            }
        }
    }
});

$("#simpatindoInquiryInfo-dialog").on("dialogclose", function (event, ui) {
    $("#simpatindoInquiryInfoResponseCode").empty();
    $("#simpatindoInquiryInfoResponseMsg").empty();
    $("#simpatindoInquiryInfoResponseScreen").empty();
    $(this).data("inquiryResponse", null);
});

$("#simpatindoInquiryInfo-dialog").dialog({
    width: 550,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        console.log("inquiry info");
        var inquiry = $("#simpatindoInquiryInfo-dialog").data("inquiryResponse").response;

        $("#simpatindoInquiryInfoResponseCode").html(inquiry.rescode);
        $("#simpatindoInquiryInfoResponseMsg").html(inquiry.resmessage);
        $("#simpatindoInquiryInfoResponseScreen").html(inquiry.scrmessage);
    },
    buttons: {
        OK: function () {
            $(this).dialog("close");
        }
    }
});

$("#simpatindoBarcode-dialog").on("dialogclose", function (event, ui) {
    $("#simpatindoBarcodeField").empty();
});

$("#simpatindoBarcode-dialog").dialog({
    width: 550,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        $("#simpatindoBarcodeMsgSpan").empty();
        $("#simpatindoBarcodeField").val("");
    },
    buttons: {
        Back: function () {
            $(this).dialog("close");
        },
        Clear: function () {
            $("#simpatindoBarcodeMsgSpan").empty();
            $("#simpatindoBarcodeField").val("");
        },
        Confirm: function () {
            var barcode = $("#simpatindoBarcodeField").val();
            console.log("barcode");
            console.log(barcode);

            // var barcode = "2482004494258"; //pdam
            // var barcode = "2482004493961"; //gopay
            // var barcode = "2482004494074"; //bpjs
            // var barcode = "2482004494326"; //pln

            if (!barcode) {
                $("#simpatindoBarcodeMsgSpan").html("Invalid Barcode");
            } else {
                $("#loading-dialog").dialog("open");
                var item = SIMPATINDO.findSimpatindoItemByBarcode(barcode);
                console.log(item);
                $("#loading-dialog").dialog("close");

                if (item) {
                    $(this).dialog("close");
                    $("#simpatindoCustomer-dialog").data("item", item);
                    $("#simpatindoCustomer-dialog").dialog("open");
                }
            }
        }
    }
});

$("#simpatindoCustomer-dialog").on("dialogclose", function (event, ui) {
    $(this).data('item', null);
});

$("#simpatindoCustomer-dialog").dialog({
    width: 550,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        $("#simpatindoCustomerMsgSpan").empty();
        $("#simpatindoIdField").val("");
        $("#simpatindoNoField").val("");

        var item = $(this).data("item");
        console.log(item);
        $("#simpatindoProductName").html(item.name);

        $(this).data("customerTryLeft", 2);
        $("#simpatindoCustomerLeftMsg").html($(this).data("customerTryLeft"));
    },
    buttons: {
        Back: function () {
            $(this).dialog("close");
            $("#simpatindoBarcode-dialog").dialog("open");
        },
        Clear: function () {
            $("#simpatindoCustomerMsgSpan").empty();
            $("#simpatindoIdField").val("");
            $("#simpatindoNoField").val("");
        },
        Order: function () {
            var item = $(this).data("item");

            var id = $("#simpatindoIdField").val();
            var no = $("#simpatindoNoField").val();
            var period = $("#simpatindoPeriodField").val() || false;

            var customerTryLeft = $(this).data("customerTryLeft");

            if (!id) {
                $("#simpatindoCustomerMsgSpan").html("Invalid ID.");
            } else if (!no) {
                $("#simpatindoCustomerMsgSpan").html("Invalid No.");
            } else {
                item.id = id;
                item.no = no;
                item.period = period;

                if (customerTryLeft > 0) {
                    var order = SIMPATINDO.order(saleTx, item);
                    console.log("Order : ");
                    console.log(order);

                    if (typeof order == "object") {
                        if (order.response.rescode == 0 || order.response.rescode == 4) {
                            $("#simpatindoOrder-dialog").data("item", item);
                            $("#simpatindoOrder-dialog").data("orderResponse", order);
                            $("#simpatindoOrder-dialog").dialog("open");
                            $(this).dialog("close");
                        } else {
                            $("#simpatindoFailed-dialog").data("failedType", "order");
                            $("#simpatindoFailed-dialog").data("failedResponse", order);
                            $("#simpatindoFailed-dialog").dialog("open");
                        }
                        CustomerPopupScreen.cus_showSimpatindo(order);
                        CustomerPopupScreen.cus_showSimpatindoDialog(order);
                    } else {
                        $(this).data("customerTryLeft", customerTryLeft - 1);
                        $("#simpatindoCustomerLeftMsg").html($(this).data("customerTryLeft"));
                    }
                } else {
                    showMsgDialog("Tidak dapat diakses.", "info");
                    $(this).dialog("close");
                }
            }
        }
    }
});

$("#simpatindoOrder-dialog").on("dialogclose", function (event, ui) {
    $("#simpatindoOrderResponseCode").empty();
    $("#simpatindoOrderResponseMsg").empty();
    $("#simpatindoOrderResponseScreen").empty();
    CustomerPopupScreen.cus_simpatindoStatusRemove({});
});

$("#simpatindoOrder-dialog").dialog({
    width: 550,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        var data = $(this).data("orderResponse").response;

        console.log("Order Data ? ");
        console.log(data);

        $("#simpatindoOrderResponseCode").html(data.rescode);
        $("#simpatindoOrderResponseMsg").html(data.resmessage);
        $("#simpatindoOrderResponseScreen").html(data.scrmessage);

        if (data.ext_data && typeof data.ext_data != 'object') {
            var screen = data.ext_data.split("|");

            var delimiterScreen = "";

            for (var i = 0; i < screen.length; i++) {
                delimiterScreen += screen[i] + "<br/>";
            }
            $("#simpatindoOrderResponseScreen").html(delimiterScreen);
        }

    },
    buttons: {
        Back: function () {
            $(this).dialog("close");
            $("#simpatindoCustomer-dialog").dialog("open");
        },
        Confirm: function () {
            var data = $(this).data("orderResponse");
            console.log("Order response data");
            console.log(data);

            var item = $(this).data("item");
            console.log("Item : ");
            console.log(item);

            data.id = data.id[0];
            data.name = item.name;
            data.type = item.type;
            data.item = item;
            data.timeout = true;
            data.tempPrice = item.tempPrice;
            data.vtype = item.sku;

            $("#simpatindoOrder-dialog").data("orderResponse", data);

            SIMPATINDO.saveSimpatindoItem(item);
            $(this).dialog("close");
        }
    }
});

$("#simpatindoConfirm-dialog").on("dialogclose", function (event, ui) {
    $(this).data("item", null);
    $(this).data("confirmResponse", null);
    $("#simpatindoOrder-dialog").data("item", null);
    $("#simpatindoOrder-dialog").data("orderResponse", null);

    $("#simpatindoConfirmResponseCode").empty();
    $("#simpatindoConfirmResponseMsg").empty();
    $("#simpatindoConfirmResponseScreen").empty();

    CustomerPopupScreen.cus_removeSimpatindoAdviceDialog({});
});

$("#simpatindoConfirm-dialog").dialog({
    width: 550,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        var data = $(this).data("confirmResponse").response;

        console.log("Data ? ");
        console.log(data);

        $("#simpatindoConfirmResponseCode").html(data.rescode);
        $("#simpatindoConfirmResponseMsg").html(data.resmessage);
        $("#simpatindoConfirmResponseScreen").html(data.scrmessage);

        if (data.ext_data && typeof data.ext_data != 'object') {
            var screen = data.ext_data.split("|");

            var delimiterScreen = "";

            for (var i = 0; i < screen.length; i++) {
                delimiterScreen += screen[i] + "<br/>";
            }
            $("#simpatindoConfirmResponseScreen").html(delimiterScreen);
        }

        $(this).data("confirmTryLeft", 2);
        $("#simpatindoConfirmLeftMsg").html($(this).data("confirmTryLeft"));
    },
    buttons: {
        Close: function () {
            var data = $(this).data("confirmResponse");
            var callbackData = $(this).data("callbackData");
            saleTx.simpatindo = data;
            SIMPATINDO.printSimpatindoTransaction(callbackData);
            $(this).dialog("close");
        },
        Inquiry: function () {
            var data = $(this).data("confirmResponse");
            var confirmTryLeft = $(this).data("confirmTryLeft");
            var callbackData = $(this).data("callbackData");

            console.log("Data for inquiry :");
            console.log(data);
            if (confirmTryLeft > 0) {
                $(this).data("confirmTryLeft", confirmTryLeft - 1);
                var inquiry = SIMPATINDO.inquiry(saleTx, data);
                console.log("Inquiry : ");
                console.log(inquiry);

                if (typeof inquiry == "object") {
                    if (inquiry) {
                        data.timeout = false;
                        $(this).data("confirmResponse", data);
                        $("#simpatindoConfirmResponseCode").html(inquiry.rescode);
                        $("#simpatindoConfirmResponseMsg").html(inquiry.resmessage);
                        $("#simpatindoConfirmResponseScreen").html(inquiry.scrmessage);
                    }
                } else {
                    $("#simpatindoConfirmLeftMsg").html($(this).data("confirmTryLeft"));
                }
                $("#simpatindoConfirmLeftMsg").html($(this).data("confirmTryLeft"));
            } else {
                saleTx.simpatindo = data;
                $(this).dialog("close");
                SIMPATINDO.printSimpatindoTransaction(callbackData);
            }
        },
        OK: function () {
            var data = $(this).data("confirmResponse");
            var confirmTryLeft = $(this).data("confirmTryLeft");
            var callbackData = $(this).data("callbackData");

            if (data.timeout && confirmTryLeft > 0) {
                showMsgDialog("Timeout saat konfirmasi. Silahkan lakukan inquiry", "info");
            } else {
                saleTx.simpatindo = data;
                $(this).dialog("close");
                SIMPATINDO.printSimpatindoTransaction(callbackData);
            }
        }
    }
});

$("#simpatindoTelcoPing-dialog").on("dialogclose", function (event, ui) { });

$("#simpatindoTelcoPing-dialog").dialog({
    width: 550,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        var telcoPingTest = SIMPATINDO.telcoPingTest(saleTx);
        console.log(telcoPingTest);

        if (telcoPingTest && typeof telcoPingTest == 'object') {
            $("#simpatindoTelcoPingResponseCode").html(telcoPingTest.rescode);
            $("#simpatindoTelcoPingResponseMsg").html(telcoPingTest.resmessage);
            $("#simpatindoTelcoPingResponseScreen").html(telcoPingTest.scrmessage);
        } else {
            if (telcoPingTest) {
                showMsgDialog("TIMEOUT", "warning");
            }
            $(this).dialog("close");

        }
    },
    buttons: {
        Back: function () {
            $(this).dialog("close");
        }
    }
});

$("#simpatindoFailed-dialog").on("dialogclose", function (event, ui) {
    $("#simpatindoFailedResponseCode").empty();
    $("#simpatindoFailedResponseMsg").empty();
    $("#simpatindoFailedResponseScreen").empty();
    CustomerPopupScreen.cus_simpatindoStatusRemove({});
    CustomerPopupScreen.cus_removeSimpatindoAdviceDialog({});
});

$("#simpatindoFailed-dialog").dialog({
    width: 550,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        var failed = $(this).data("failedResponse").response;
        console.log(failed);

        $("#simpatindoFailedResponseCode").html(failed.rescode);
        $("#simpatindoFailedResponseMsg").html(failed.resmessage);
        $("#simpatindoFailedResponseScreen").html(failed.scrmessage);
    },
    buttons: {
        Ok: function () {
            var data = $(this).data("failedResponse");
            var callbackData = $(this).data("callbackData");
            var failedType = $(this).data("failedType");

            if (failedType == 'confirm') {
                saleTx.simpatindo = data;
                $(this).dialog("close");
                SIMPATINDO.printSimpatindoTransaction(callbackData);
            } else {
                $(this).dialog("close");
            }
        }
    }
});

// $("#simpatindoInquiry-dialog").on("dialogclose", function(event, ui) {});

// $("#simpatindoInquiry-dialog").dialog({
//     width: 550,
//     height: 300,
//     resizable: false,
//     draggable: false,
//     modal: true,
//     autoOpen: false,
//     closeOnEscape: false,
//     dialogClass: "no-close",
//     open: function(event, ui) {
//         $("#simpatindoInquiryField").val("");
//         $("#simpatindoInquiryMsgSpan").empty();

//         $(this).data("inquiryTryLeft", 2);
//         $("#simpatindoInquiryLeftMsg").html($(this).data("inquiryTryLeft"));
//     },
//     buttons: {
//         Back: function() {
//             $(this).dialog("close");
//         },
//         Clear: function() {
//             $("#simpatindoInquiryField").val("");
//             $("#simpatindoInquiryMsgSpan").empty();
//         },
//         Confirm: function() {
//             var inquiryTryLeft = $(this).data("inquiryTryLeft");
//             var txId = $("#simpatindoInquiryField").val();

//             if (!txId) {
//                 $("#simpatindoInquiryMsgSpan").html("Invalid Transaction ID.");
//             } else {
//                 if (inquiryTryLeft > 0) {
//                     var inquiry = SIMPATINDO.manualInquiry(saleTx, txId);
//                     console.log("Inquiry : ");
//                     console.log(inquiry);

//                     if (typeof inquiry == "object") {
//                         if (inquiry) {
//                             console.log("Inquiry true");
//                             $("#simpatindoInquiryInfo-dialog").data("inquiryResponse", inquiry);
//                             $("#simpatindoInquiryInfo-dialog").dialog("open");
//                             $(this).dialog("close");
//                         }
//                     } else {
//                         $(this).data("inquiryTryLeft", inquiryTryLeft - 1);
//                         $("#simpatindoInquiryLeftMsg").html($(this).data("inquiryTryLeft"));
//                     }
//                 } else {
//                     showMsgDialog("Transaksi sedang dalam proses.", "info");
//                     $(this).dialog("close");
//                 }
//             }
//         }
//     }
// });

// $("#simpatindoInquiryInfo-dialog").on("dialogclose", function(event, ui) {
//     $("#simpatindoInquiryInfoResponseCode").empty();
//     $("#simpatindoInquiryInfoResponseMsg").empty();
//     $("#simpatindoInquiryInfoResponseScreen").empty();
//     $(this).data("inquiryResponse", null);
// });

// $("#simpatindoInquiryInfo-dialog").dialog({
//     width: 550,
//     height: 300,
//     resizable: false,
//     draggable: false,
//     modal: true,
//     autoOpen: false,
//     closeOnEscape: false,
//     dialogClass: "no-close",
//     open: function(event, ui) {
//         console.log("inquiry info");
//         var inquiry = $("#simpatindoInquiryInfo-dialog").data("inquiryResponse").response;

//         $("#simpatindoInquiryInfoResponseCode").html(inquiry.rescode);
//         $("#simpatindoInquiryInfoResponseMsg").html(inquiry.resmessage);
//         $("#simpatindoInquiryInfoResponseScreen").html(inquiry.scrmessage);
//     },
//     buttons: {
//         OK: function() {
//             $(this).dialog("close");
//         }
//     }
// });

$("#mCashBarcode-dialog").on("dialogclose", function (event, ui) {
    $("#mCashBarcodeField").empty();
});

$("#mCashBarcode-dialog").dialog({
    width: 550,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        $("#mCashBarcodeMsgSpan").empty();
        $("#mCashBarcodeField").val("");
    },
    buttons: {
        Back: function () {
            $(this).dialog("close");
        },
        Clear: function () {
            $("#mCashBarcodeMsgSpan").empty();
            $("#mCashBarcodeField").val("");
        },
        Confirm: function () {
            var barcode = $("#mCashBarcodeField").val();
            console.log("barcode");
            console.log(barcode);

            // var barcode = "2482004494258"; //pdam
            // var barcode = "2482004493961"; //gopay
            // var barcode = "2482004494074"; //bpjs
            // var barcode = "2482004494326"; //pln

            if (!barcode) {
                $("#mCashBarcodeMsgSpan").html("Invalid Barcode");
            } else {
                $("#loading-dialog").dialog("open");
                var item = MCASH.findMCashItemByBarcode(barcode);
                console.log(item);
                $("#loading-dialog").dialog("close");

                if (item) {
                    $(this).dialog("close");
                    $("#mCashCustomer-dialog").data("item", item);
                    $("#mCashCustomer-dialog").dialog("open");
                }
            }
        }
    }
});

$("#mCashCustomer-dialog").on("dialogclose", function (event, ui) {
    $(this).data('item', null);
});

$("#mCashCustomer-dialog").dialog({
    width: 550,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        $("#mCashCustomerMsgSpan").empty();
        $("#mCashIdField").val("");

        var item = $(this).data("item");
        console.log(item);
        $("#mCashProductName").html(item.name);

        $(this).data("customerTryLeft", 2);
        $("#mCashCustomerLeftMsg").html($(this).data("customerTryLeft"));
    },
    buttons: {
        Back: function () {
            $(this).dialog("close");
            $("#mCashBarcode-dialog").dialog("open");
        },
        Clear: function () {
            $("#mCashCustomerMsgSpan").empty();
            $("#mCashIdField").val("");
        },
        Order: function () {
            var item = $(this).data("item");

            var id = $("#mCashIdField").val();
            var period = $("#mCashPeriodField").val() || false;

            var customerTryLeft = $(this).data("customerTryLeft");

            // var id = "089900112233";
            // var no = "089900112233";
            // var period = "6";

            if (!id) {
                $("#mCashCustomerMsgSpan").html("Invalid ID.");
            } else {
                if (MCASH.isTopUpMCash(item)) {
                    var order = {
                        'type': 'topup',
                        'id': id,
                        'vtype': 'topup'
                    }

                    $("#mCashOrder-dialog").data("item", item);
                    $("#mCashOrder-dialog").data("orderResponse", order);
                    $("#mCashOrder-dialog").dialog("open");
                    $(this).dialog("close");
                } else {
                    item.id = id;
                    item.period = period;

                    if (customerTryLeft > 0) {
                        var order = MCASH.order(saleTx, item);
                        order.type = 'bill';

                        console.log("Order : ");
                        console.log(order);

                        if (typeof order == "object") {
                            if (order.rescode == 0 || order.rescode == 4) {
                                $("#mCashOrder-dialog").data("item", item);
                                $("#mCashOrder-dialog").data("orderResponse", order);
                                $("#mCashOrder-dialog").dialog("open");
                                $(this).dialog("close");
                            } else {
                                $("#mCashFailed-dialog").data("failedResponse", order);
                                $("#mCashFailed-dialog").dialog("open");
                            }
                            CustomerPopupScreen.cus_showMCash(order);
                            CustomerPopupScreen.cus_showMCash(order);
                        } else {
                            $(this).data("customerTryLeft", customerTryLeft - 1);
                            $("#mCashCustomerLeftMsg").html($(this).data("customerTryLeft"));
                        }
                    } else {
                        showMsgDialog("Tidak dapat diakses.", "info");
                        $(this).dialog("close");
                    }
                }
            }
        }
    }
});

$("#mCashOrder-dialog").on("dialogclose", function (event, ui) {
    $("#mCashOrderResponseCode").empty();
    $("#mCashOrderResponseMsg").empty();
    $("#mCashOrderResponseScreen").empty();
    CustomerPopupScreen.cus_simpatindoStatusRemove({});
});

$("#mCashOrder-dialog").dialog({
    width: 550,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        var data = $(this).data("orderResponse");

        console.log("Order Data ? ");
        console.log(data);

        if (data.type == 'topup') {
            $("#mCashOrderResponseScreen").html(data.id);
        } else {
            $("#mCashOrderResponseCode").html(data.rescode);
            $("#mCashOrderResponseMsg").html(data.resmessage);
            $("#mCashOrderResponseScreen").html(data.scrmessage);
        }

    },
    buttons: {
        Back: function () {
            $(this).dialog("close");
            $("#mCashCustomer-dialog").dialog("open");
        },
        Confirm: function () {
            var data = $(this).data("orderResponse");
            console.log("Order response data");
            console.log(data);

            var item = $(this).data("item");
            console.log("Item : ");
            console.log(item);

            data.name = item.name;
            data.type = item.type;
            data.item = item;
            data.timeout = true;
            data.tempPrice = item.tempPrice;
            data.vtype = item.sku;

            $("#mCashOrder-dialog").data("orderResponse", data);

            MCASH.saveMCashItem(data);
            $(this).dialog("close");
        }
    }
});

// $("#simpatindoConfirm-dialog").on("dialogclose", function(event, ui) {
//     $(this).data("item", null);
//     $(this).data("confirmResponse", null);
//     $("#simpatindoOrder-dialog").data("item", null);
//     $("#simpatindoOrder-dialog").data("orderResponse", null);

//     $("#simpatindoConfirmResponseCode").empty();
//     $("#simpatindoConfirmResponseMsg").empty();
//     $("#simpatindoConfirmResponseScreen").empty();

//     CustomerPopupScreen.cus_removeSimpatindoAdviceDialog({});
// });

// $("#simpatindoConfirm-dialog").dialog({
//     width: 550,
//     height: 300,
//     resizable: false,
//     draggable: false,
//     modal: true,
//     autoOpen: false,
//     closeOnEscape: false,
//     dialogClass: "no-close",
//     open: function(event, ui) {
//         var data = $(this).data("confirmResponse").response;

//         console.log("Data ? ");
//         console.log(data);

//         $("#simpatindoConfirmResponseCode").html(data.rescode);
//         $("#simpatindoConfirmResponseMsg").html(data.resmessage);
//         $("#simpatindoConfirmResponseScreen").html(data.scrmessage);

//         if (data.ext_data && typeof data.ext_data != 'object') {
//             var screen = data.ext_data.split("|");

//             var delimiterScreen = "";

//             for (var i = 0; i < screen.length; i++) {
//                 delimiterScreen += screen[i] + "<br/>";
//             }
//             $("#simpatindoConfirmResponseScreen").html(delimiterScreen);
//         }

//         $(this).data("confirmTryLeft", 2);
//         $("#simpatindoConfirmLeftMsg").html($(this).data("confirmTryLeft"));
//     },
//     buttons: {
//         Close: function() {
//             var data = $(this).data("confirmResponse");
//             saleTx.simpatindo = data;
//             SIMPATINDO.printSimpatindoTransaction();
//             $(this).dialog("close");
//         },
//         Inquiry: function() {
//             var data = $(this).data("confirmResponse");
//             var confirmTryLeft = $(this).data("confirmTryLeft");

//             console.log("Data for inquiry :");
//             console.log(data);
//             if (confirmTryLeft > 0) {
//                 $(this).data("confirmTryLeft", confirmTryLeft - 1);
//                 var inquiry = SIMPATINDO.inquiry(saleTx, data);
//                 console.log("Inquiry : ");
//                 console.log(inquiry);

//                 if (typeof inquiry == "object") {
//                     if (inquiry) {
//                         data.timeout = false;
//                         $(this).data("confirmResponse", data);
//                         $("#simpatindoConfirmResponseCode").html(inquiry.rescode);
//                         $("#simpatindoConfirmResponseMsg").html(inquiry.resmessage);
//                         $("#simpatindoConfirmResponseScreen").html(inquiry.scrmessage);
//                     }
//                 } else {
//                     $("#simpatindoConfirmLeftMsg").html($(this).data("confirmTryLeft"));
//                 }
//                 $("#simpatindoConfirmLeftMsg").html($(this).data("confirmTryLeft"));
//             } else {
//                 saleTx.simpatindo = data;
//                 $(this).dialog("close");
//                 SIMPATINDO.printSimpatindoTransaction();
//             }
//         },
//         OK: function() {
//             var data = $(this).data("confirmResponse");
//             var confirmTryLeft = $(this).data("confirmTryLeft");

//             if (data.timeout && confirmTryLeft > 0) {
//                 showMsgDialog("Timeout saat konfirmasi. Silahkan lakukan inquiry", "info");
//             } else {
//                 saleTx.simpatindo = data;
//                 $(this).dialog("close");
//                 SIMPATINDO.printSimpatindoTransaction();
//             }
//         }
//     }
// });

// $("#simpatindoTelcoPing-dialog").on("dialogclose", function(event, ui) {});

// $("#simpatindoTelcoPing-dialog").dialog({
//     width: 550,
//     height: 300,
//     resizable: false,
//     draggable: false,
//     modal: true,
//     autoOpen: false,
//     closeOnEscape: false,
//     dialogClass: "no-close",
//     open: function(event, ui) {
//         var telcoPingTest = SIMPATINDO.telcoPingTest(saleTx);
//         console.log(telcoPingTest);

//         if (telcoPingTest && typeof telcoPingTest == 'object') {
//             $("#simpatindoTelcoPingResponseCode").html(telcoPingTest.rescode);
//             $("#simpatindoTelcoPingResponseMsg").html(telcoPingTest.resmessage);
//             $("#simpatindoTelcoPingResponseScreen").html(telcoPingTest.scrmessage);
//         } else {
//             if (telcoPingTest) {
//                 showMsgDialog("TIMEOUT", "warning");
//             }
//             $(this).dialog("close");

//         }
//     },
//     buttons: {
//         Back: function() {
//             $(this).dialog("close");
//         }
//     }
// });

$("#mCashFailed-dialog").on("dialogclose", function (event, ui) {
    $("#mCashFailedResponseCode").empty();
    $("#mCashFailedResponseMsg").empty();
    $("#mCashFailedResponseScreen").empty();
    CustomerPopupScreen.cus_simpatindoStatusRemove({});
    CustomerPopupScreen.cus_removeSimpatindoAdviceDialog({});
});

$("#mCashFailed-dialog").dialog({
    width: 550,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        var failed = $(this).data("failedResponse").response;
        console.log(failed);

        $("#mCashFailedResponseCode").html(failed.rescode);
        $("#mCashFailedResponseMsg").html(failed.resmessage);
        $("#mCashFailedResponseScreen").html(failed.scrmessage);
    },
    buttons: {
        Cancel: function () {
            $(this).dialog("close");
        }
    }
});

$("#ADAF-dialog").on("dialogclose", function (event, ui) {
    $("#ADAFIdField").val("");
    $("#ADAFMsgSpan").empty();
});

$("#ADAF-dialog").dialog({
    width: 550,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) { },
    buttons: {
        Close: function () {
            $(this).dialog("close");
        },
        Clear: function () {
            $("#ADAFIdField").val("");
            $("#ADAFMsgSpan").empty();
        },
        Submit: function () {
            var id = $("#ADAFIdField").val();
            var data = { adaf_id: id };
            console.log(id);
            ADAF.getItem(data);
        },
    }
});

$("#KC-dialog").dialog({
    width: 550,
    height: 300,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) { },
    buttons: {
        Cancel: function () {
            $(this).dialog("close");
        },
        Submit: function () {
            var id = $("#ADAFIdField").val();
            var data = { adaf_id: id };
            console.log(id);
            ADAF.getItem(data);
        },
    }
});

function mergeItemScanned(obj) {
    var r = {};
    obj.forEach(function (o) {
        r[o.sku] = (r[o.sku] || 0) + o.quantity;
    });

    var result = Object.keys(r).map(function (k) {
        return { sku: k, quantity: r[k] };
    });
    return result;
}

function mergeItemScanned2(a) {
    var o = {};

    a.forEach((i) => {
        var sku = i.sku;
        i.quantity = parseInt(i.quantity);
        if (!o[sku]) {
            return (o[sku] = i);
        }
        return (o[sku].quantity = o[sku].quantity + i.quantity);
    });

    var a2 = [];
    Object.keys(o).forEach((key) => {
        a2.push(o[key]);
    });

    return a2
}

function checkValidationGrabOrderSku(array1, array2) {
    return array1.filter((object1) => {
        return !array2.some((object2) => {
            if (object1.isFresh) {
                return object1.sku === object2.sku;
            } else {
                return object1.sku === object2.sku && object1.quantity === object2.quantity;
            }
        });
    });
}

function reserveCheckValidationGrabOrderSku(arrayObjOne, arrayObjTwo) {
    var res = arrayObjOne.filter(
        (item1) =>
            !arrayObjTwo.some(
                (item2) => item2.sku === item1.sku
            )
    );
    return res;
}

function findGrabItem(nameKey, myArray) {
    for (var i = 0; i < myArray.length; i++) {
        if (myArray[i].id === nameKey) {
            return myArray[i];
        }
    } 
}

function findScanItemName(nameKey, myArray) {
    console.log(nameKey);
    console.log(myArray);
    for (var i = 0; i < myArray.length; i++) {
        if (myArray[i].sku === nameKey) {
            return myArray[i];
        }
    }
}

function ovoTimerCashier(){
    ovoCountCashier=ovoCountCashier-1;
    if (ovoCountCashier < 0){
      clearInterval(ovoCounterCashier);
      $("#OVOCheckPaymentDialogMsgCountdown").text("QR Code Expired");
      return;  
    }
    $("#OVOCheckPaymentDialogMsgCountdown").text("Expired : " + ovoCountCashier + " secs");
  }

  $("#semver-dialog").dialog({
    width: 500,
    height: 250,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    open: function (event, ui) {
    },
    buttons: {
    }
});

$("#omniTelkomsel-dialog").dialog({
    width: 400,
    height: 250,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    open: function (event, ui) {
        var saleType = $("#omniTelkomsel-dialog").data("saleType").toUpperCase();
        if (saleType == CONSTANTS.TX_TYPES.SALE.name) {
            $("#omniTelkomselCmdDiv").show();
        } else if (saleType == CONSTANTS.TX_TYPES.RETURN.name || saleType == CONSTANTS.TX_TYPES.REFUND.name) {
            $("#omniTelkomselCmdDiv").hide();
        }
    },
    buttons: {
        ENTER: function () {
            if (connectionOnline && saleTx.orderItems.length < 1 && !saleTx.omniTelkomsel ) {
                var qrValue = $("#omniTelkomselCmdField").val();
                var responseOmniTel = inquiryOmniTelkomsel(qrValue);
                // var responseOmniTel = {
                //     "response": {
                //         "head": {
                //             "version": "4.0.5",
                //             "function": "destination.query",
                //             "respTime": "2022-07-27T09:19:55+07:00",
                //             "reqMsgId": "IOMNI1202204270828010700900012"
                //         },
                //         "body": {
                //             "inquiryResults": [
                //                 {
                //                     "inquiryId": "INQ.202302161648261897897",
                //                     "inquiryStatus": {
                //                         "code": "10",
                //                         "status": "SUCCESS",
                //                         "message": "Success"
                //                     },
                //                     "destinationInfo": {
                //                         "primaryParam": "4445",
                //                         "secondaryParam": ""
                //                     },
                //                     "customerName": "",
                //                     "totalAmount": {
                //                         "value": 115000,
                //                         "currency": "IDR"
                //                     },
                //                     "baseAmount": {
                //                         "value": 100000,
                //                         "currency": "IDR"
                //                     },
                //                     "adminFee": {
                //                         "value": 15000,
                //                         "currency": "IDR"
                //                     },
                //                     "providerName": "OMNI_TELKOMSEL",
                //                     "payment_code": "976713614",
                //                     "cust_phone": "6281318446543",
                //                     "product_length": "30 Days",
                //                     "expiry_time": "2023-02-16 16:48:26",
                //                     "commercial_name": "Combo Sakti Unlimited",
                //                     "description": "17GB, 150MntTsel, 400SMSTsel",
                //                     "allowance_description": "17GB, 150MntTsel, 400SMSTsel"
                //                 }
                //             ]
                //         }
                //     }
                // }
                var resInquiryOmniTelkomsel = responseOmniTel.response.body.inquiryResults[0];
                if (resInquiryOmniTelkomsel && resInquiryOmniTelkomsel["inquiryStatus"]["code"] == "10") {
                    var resOmniTelkomselItem = reqItemOmniTelkomsel(resInquiryOmniTelkomsel["baseAmount"]["value"]);
                    var resOmniTelkomselItemAdmnFee = reqItemOmniTelkomsel(resInquiryOmniTelkomsel["adminFee"]["value"]);
                    if (resOmniTelkomselItem && resOmniTelkomselItemAdmnFee) {
                        resInquiryOmniTelkomsel["eancode"] = resOmniTelkomselItem[1];
                        resInquiryOmniTelkomsel["item_name"] = resOmniTelkomselItem[3];
                        resInquiryOmniTelkomsel["eancode_adminfee"] = resOmniTelkomselItemAdmnFee[1];
                        resInquiryOmniTelkomsel["item_name_adminfee"] = resOmniTelkomselItemAdmnFee[3];
                        resInquiryOmniTelkomsel["totalAmount"] = resInquiryOmniTelkomsel["totalAmount"]["value"];
                        resInquiryOmniTelkomsel["baseAmount"] = resInquiryOmniTelkomsel["baseAmount"]["value"];
                        resInquiryOmniTelkomsel["adminFee"] = resInquiryOmniTelkomsel["adminFee"]["value"];
                        resInquiryOmniTelkomsel["primaryParam"] = resInquiryOmniTelkomsel["destinationInfo"]["primaryParam"];
                        $("#omniTelkomselCmdField").val("");
                        $(this).dialog("close");
                        $("#omniTelkomselConfirmation-dialog").data("resInquiryOmniTelkomsel", resInquiryOmniTelkomsel).dialog("open");
                    }
                    else {
                        $("#omniTelkomselCmdField").val("");
                        $(this).dialog("close");
                        showMsgDialog("Product Item Omni Telkomsel Not Found", "warning");
                    }

                }
                else {
                    if (resInquiryOmniTelkomsel) {
                        showMsgDialog("Inquiry: " + resInquiryOmniTelkomsel["rc"] + " - " + resInquiryOmniTelkomsel["rd"], "warning");
                        $("#omniTelkomselCmdField").val("");
                        $(this).dialog("close");
                    }
                    else {
                        showMsgDialog("Inquiry Allo Topup Failed", "warning");
                        $("#omniTelkomselCmdField").val("");
                        $(this).dialog("close");
                    }
                }
            }
            else {
                showKeyNotAllowedMsg();
            }
        }
    }
});

$("#omniTelkomselConfirmation-dialog").dialog({
    width: 500,
    height: 400,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        var resInquiryOmniTelkomsel = $("#omniTelkomselConfirmation-dialog").data("resInquiryOmniTelkomsel");
        displayInquiryOmniTelkomsel(resInquiryOmniTelkomsel);
    },
    buttons: {
        CANCEL: function () {
            $(this).dialog("close");
        },
        SUBMIT: function () {
            if (connectionOnline) {
                var omniTelkomselInqId = $("#omniTelkomselInqIdCnfrm").text();
                var omniTelkomselCustomerId = $("#omniTelkomselCstmrPhCnfrm").text();
                var omniTelkomselPymtCd = $("#omniTelkomselPymtCdCnfrm").text();
                var omniTelkomselAmount = $("#omniTelkomselTtlAmtCnfrm").text();
                var omniTelkomselBaseAmt = $("#omniTelkomselBaseAmtCnfrm").text();
                var omniTelkomselAdmFee = $("#omniTelkomselAdmFeeCnfrm").text();
                var omniTelkomselBarcode = $("#omniTelkomselBarcode").text();
                var resInquiryOmniTelkomselFee = $("#omniTelkomselConfirmation-dialog").data("resInquiryOmniTelkomsel");

                //proses first 
                resInquiryOmniTelkomselFee.transactionId = saleTx.transactionId;
                var resOrderOmniTelSuccess = paymentOmniTelkomsel(resInquiryOmniTelkomselFee);
                // var resOrderOmniTelSuccess = {
                //     "response": {
                //         "head": {
                //             "version": "4.0.5",
                //             "function": "order.create",
                //             "respTime": "2023-02-21T13:09:35+07:00",
                //             "reqMsgId": "1676984914"
                //         },
                //         "body": {
                //             "order": {
                //                 "requestId": "POMNI20220214102821000000115",
                //                 "orderId": "TL.202302141427201566",
                //                 "createdTime": "2023-02-14T14:27:20+07:00",
                //                 "modifiedTime": "",
                //                 "destinationInfo": {
                //                     "primaryParam": "4445"
                //                 }
                //             },
                //             "orderStatus": {
                //                 "code": "10",
                //                 "status": "SUCCESS",
                //                 "message": "Success"
                //             },
                //             "serialNumber": "0123456789",
                //             "refNumber": "",
                //             "product": {
                //                 "productId": "OMNITEL",
                //                 "type": "OMNI_TELKOMSEL",
                //                 "provider": "omni",
                //                 "price": {
                //                     "value": 0,
                //                     "currency": "IDR"
                //                 },
                //                 "availability": true
                //             }
                //         }
                //     },
                //     "signature": "kRbEoMu7CAjzmrxb3+U3F2VslucwufeWxjKaKbsoX0mS8W1AnPpo04y50mUTjdamH+0BUZtA6o0Xnvnydg1X/rz4NrvrDdNZdIeqFyEbZlmTw5oCDxGzGraYCNqdZ2MPJ4fdVqB/RcbqLanmxqVM9oKAPupym9TJMRKH4h8DO1271NfU2fYlnFBUG64R57bo+DDz5YcAPqiNxYVVBmgY11fKsE+RjkDRyl2aNnkOvXnyYSHfpcDMUa/pdQm09fjDFT89wy/z/K2mXzFjJ3MbPZSBhKI6VdbRDeRcgpfVQxgOfZmFkHizZLx3gIm9dGJCR1PAr6xBgRNY/8yabWu1lQ=="
                // }
                if (resOrderOmniTelSuccess) {
                    if (resOrderOmniTelSuccess.response.body.orderStatus["code"] == "10") {
                        var resOrderOmniTel = resOrderOmniTelSuccess.response.body;
                        saleTx.customerId = resOrderOmniTel["account_no"];
                        saleTx.omnnitel = {
                            inquiryId: omniTelkomselInqId,
                            customerId: omniTelkomselCustomerId,
                            totalAmount: omniTelkomselAmount,
                            baseAmount: omniTelkomselBaseAmt,
                            adminFee: omniTelkomselAdmFee,
                        };

                        showMsgDialog("Order Omnitel Success", "");
                        processSaleScan(omniTelkomselBarcode);
                        processSaleScan(resInquiryOmniTelkomselFee.eancode_adminfee);
                        $(this).dialog("close");
                    } else {
                        showMsgDialog("Order: " + resOrderOmniTelSuccess.response.body.orderStatus["code"] + " - " + resOrderOmniTelSuccess.response.body.orderStatus["status"], "warning");
                    }
                } else {
                    showMsgDialog("Order Omnitel Failed", "warning");
                }
                
            }
            else {
                showKeyNotAllowedMsg();
            }
        }
    }
});

function inquiryOmniTelkomsel(qrValue) {
    var isHTTPStatusOK = false;
    var reqData = {
        "version": "4.0.5",
        "functionHead": "destination.query",
        "path": "/destination/inquiry",
        "clientId": configuration.storeCode.toLowerCase(),
        "body": {
            "destinationInfos": [
                {
                    "primaryParam": qrValue,
                    "secondaryParam": ""
                }
            ],
            "productId": "OMNITEL"
        }
    };
    var data = $.ajax({
        url: posWebContextPath + "/cashier/tiphone/api",
        type: "POST",
        async: false,
        contentType: 'application/json',
        dataType: "json",
        data: JSON.stringify(reqData),
        beforeSend: function() {
            if (!$("#loading-dialog").dialog("isOpen")) {
                $("#loading-dialog").dialog("open");
            }
        },
        success: function (response) {
            isHTTPStatusOK = true;
            $("#loading-dialog").dialog('close');
        },
        error: function (jqXHR, status, error) {
            $("#loading-dialog").dialog('close');
        },
    }).responseText;

    if (isHTTPStatusOK) return JSON.parse(data);
    else return null;
}

function paymentOmniTelkomsel(data) {
    var isHTTPStatusOK = false;

    var  trxReqId =  data.transactionId.toString();
    var  primaryParam =  data.primaryParam.toString();
    var  inquiryId =  data.inquiryId.toString();
    var reqData = {
        version: "4.0.5",
        functionHead: "order.create",
        path: "/order/create",
        clientId: configuration.storeCode.toLowerCase(),
        body: {
            requestId: trxReqId,
            productId: "OMNITEL",
            destinationInfo: {
                primaryParam: primaryParam,
                secondaryParam: ""
            },
            price: {
                value: "0",
                currency: "IDR"
            },
            extendInfo: {
                inquiryId: inquiryId
            }
        }
    };
    var data = $.ajax({
        url: posWebContextPath + "/cashier/tiphone/api",
        type: "POST",
        async: false,
        contentType: 'application/json',
        dataType: "json",
        data: JSON.stringify(reqData),
        beforeSend: function() {
            if (!$("#loading-dialog").dialog("isOpen")) {
                $("#loading-dialog").dialog("open");
            }
        },
        success: function (response) {
            isHTTPStatusOK = true;
            $("#loading-dialog").dialog('close');
        },
        error: function (jqXHR, status, error) {
            $("#loading-dialog").dialog('close');
        },
    }).responseText;

    if (isHTTPStatusOK) return JSON.parse(data);
    else return null;
}


function reqItemOmniTelkomsel(amount) {
    var isHTTPStatusOK = false;
    var data = $.ajax({
        url: "/reqCategoryOmniTelkomsel",
        type: "GET",
        async: false,
        contentType: 'application/json',
        dataType: "json",
        beforeSend: function() {
            if (!$("#loading-dialog").dialog("isOpen")) {
                $("#loading-dialog").dialog("open");
            }
        },
        success: function (data, status) {
            isHTTPStatusOK = true;
            $("#loading-dialog").dialog('close');
        },
        error: function (jqXHR, status, error) {
            $("#loading-dialog").dialog('close');
        },
    }).responseText;

    if (isHTTPStatusOK) {
        var response;
        data = JSON.parse(data);
        for (var i in data) {
            var itemTopup = data[i].split(",");
            if (parseInt(itemTopup[5]) == parseInt(amount)) {
                response = itemTopup;
            }
        }
        return response;
    }
    else return null;
}

// $("#topupBarcodeInputAmount").keyboard({
//     display: numberDisplay2,
//     layout: 'custom',
//     customLayout: customNumberLayout2,
//     maxLength: 6,
//     visible: function (e, keyboard, el) {
//         addClickHandler(keyboard);
//     }
// });

//DEVELOPED MSIB
function fbtnAlloTopup(amount) {
            
    if (connectionOnline) {
        if (saleTx.orderItems.length > 0 && saleTx.qrtts || itemQty > 1) {
            showMsgDialog("Multiplier not allowed for Allo Topup", "warning");
        }else{
            var topUpType = $("#topUpTypeDropdown").val();
            var phoneNum = $("#topUpPhoneNumber").val();
            // console.log("phoneNum:", phoneNum);
            // console.log("AMOUNTTT:", amount);
            if (phoneNum == "" && topUpType != "ALLO") {
                var noEmpty = "Harap isi nomor HP!";
                showMsgDialog(noEmpty, "alert");
            } else {
                var topupRespBarcode = topupReqBarcode(amount, topUpType, phoneNum);
                // var topupRespBarcode = {
                //     "responseData": {
                //     "partnerReferenceNo": "xxxxxx144a789aa1edab5ab6fe64",
                //     "referenceNo": "xxxxxxx0001910116811277333921",
                //     "barcode": "16950204023811540701"
                //     },
                //     "code": "0",
                //     "transactionNo": "2c313dd8d53b4daabe3fe0c19e5b5cee",
                //     "message": "server allo error"
                // }
                // $("#topupBarcodeWaitingAmountTopup").text(amount);
                // // console.log(topUpType, amount);
            }
            
            if(topupRespBarcode){
                if (topupRespBarcode["code"] == "0") {
                    var resItemTopup = reqItemForTopup(amount, topUpType);
                    if (resItemTopup) {
                        topupRespBarcode["eancode"] = resItemTopup[1];
                        topupRespBarcode["item_name"] = resItemTopup[3];
                        $("#topupBarcodeInput-dialog").dialog("close");
                        CustomerPopupScreen.cus_openTopupBarcodeDialog(topupRespBarcode);
                        processSaleScan(resItemTopup[1]);
                        $("#topupBarcodeWaiting-dialog").data("topupRespBarcode", topupRespBarcode)
                        .data("topUpType", topUpType)
                        .data("phoneNumber", phoneNum)
                        .data("amount", amount)
                        .dialog("open");
                    }
                    else {
                        $("#topupBarcodeInputAmount").val("");
                        $("#topupBarcodeInput-dialog").dialog("close");
                        showMsgDialog("Product Item Allo Topup Not Found", "warning");
                    }
                }
            }else{
                showMsgDialog("Allo topup Barcode Failed", "warning");
            }
            
        }
        
    }
    else {
        showKeyNotAllowedMsg();
    }
}

//BEFORE MSIB
// function fbtnAlloTopup(amount) {
            
//     if (connectionOnline) {
//         if (saleTx.orderItems.length > 0 && saleTx.qrtts || itemQty > 1) {
//             showMsgDialog("Multiplier not allowed for Allo Topup", "warning");
//         }else{
//             var topupRespBarcode = topupReqBarcode(amount);
//             // var topupRespBarcode = {
//             //     "responseData": {
//             //       "partnerReferenceNo": "xxxxxx144a789aa1edab5ab6fe64",
//             //       "referenceNo": "xxxxxxx0001910116811277333921",
//             //       "barcode": "16950204023811540701"
//             //     },
//             //     "code": "076345843",
//             //     "transactionNo": "2c313dd8d53b4daabe3fe0c19e5b5cee",
//             //     "message": "server allo error"
//             // }
//             $("#topupBarcodeWaitingAmountTopup").text(amount);
            
//             if(topupRespBarcode){
//                 if (topupRespBarcode["code"] == "0") {
//                     var resItemAlloTopup = reqItemAlloTopup(amount);
//                     if (resItemAlloTopup) {
//                         topupRespBarcode["eancode"] = resItemAlloTopup[1];
//                         topupRespBarcode["item_name"] = resItemAlloTopup[3];
//                         $("#topupBarcodeInput-dialog").dialog("close");
//                         CustomerPopupScreen.cus_openTopupBarcodeDialog(topupRespBarcode);
//                         processSaleScan(resItemAlloTopup[1]);
//                         $("#topupBarcodeWaiting-dialog").data("topupRespBarcode", topupRespBarcode).dialog("open");
//                     }
//                     else {
//                         $("#topupBarcodeInputAmount").val("");
//                         $("#topupBarcodeInput-dialog").dialog("close");
//                         showMsgDialog("Product Item Allo Topup Not Found", "warning");
//                     }
                
//                 }else{
//                     showMsgDialog(topupRespBarcode['message'], "warning");
//                 }
//             }else{
//                 showMsgDialog("Allo topup Barcode Failed", "warning");
//             }
            
//         }
        
//     }
//     else {
//         showKeyNotAllowedMsg();
//     }
// }


//DEVELOPED MSIB
$("#topupBarcodeInput-dialog").dialog({
    width: 700,
    height: 500,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    open: function (event, ui) {
        var saleType = $("#topupBarcodeInput-dialog").data("saleType").toUpperCase();
        $("#topUp-number-dialog").hide();
        $("#topUpPhoneNumber").val('');

        if (saleType == CONSTANTS.TX_TYPES.SALE.name) {
            $("#topupBarcodeCmdDiv").show();
            var topUp = getConfigValue("TOPUP")
            console.log("TOPUP " + topUp);
            var topUp2 = topUp.split(";");
            $("#topUpTypeDropdown").html('');

            for (i in topUp2) {
                var nametopUp = topUp2[i];
                var selOption = $('<option>').attr('value', nametopUp).text(nametopUp);
                selOption.css('padding', '17px');
                $("#topUpTypeDropdown").append(selOption);
            }
            // Bind the change event to the dropdown
            $("#topUpTypeDropdown").on('change', function () {
                var merhcantType = $(this).val();
                if (merhcantType == "ALLO") {
                    $("#topUp-number-dialog").hide();
                } else {
                    $("#topUp-number-dialog").show();
                    $("#topUpPhoneNumber").val('');
                }
                reqItemTopup(merhcantType);
            });

            // Initial request based on the default value
            var initialMerhcantType = $("#topUpTypeDropdown").val();
            reqItemTopup(initialMerhcantType);
            

        } else if (saleType == CONSTANTS.TX_TYPES.RETURN.name || saleType == CONSTANTS.TX_TYPES.REFUND.name) {
            $("#topupBarcodeCmdDiv").hide();
        }
    },
    close: function () {
        CustomerPopupScreen.cus_closeTopupBarcodeDialog();
    },
    buttons: {

    }
});

//BEFORE MSIB
// $("#topupBarcodeInput-dialog").dialog({
//     width: 700,
//     height: 500,
//     resizable: false,
//     draggable: false,
//     modal: true,
//     autoOpen: false,
//     closeOnEscape: false,
//     open: function (event, ui) {
//         var saleType = $("#topupBarcodeInput-dialog").data("saleType").toUpperCase();

//         if (saleType == CONSTANTS.TX_TYPES.SALE.name) {
//             $("#topupBarcodeCmdDiv").show();
//         } else if (saleType == CONSTANTS.TX_TYPES.RETURN.name || saleType == CONSTANTS.TX_TYPES.REFUND.name) {
//             $("#topupBarcodeCmdDiv").hide();
//         }
//     },
//     close: function () {
//         CustomerPopupScreen.cus_closeTopupBarcodeDialog();
//     },
//     buttons: {

//     }
// });


//DEVELOPED MSIB
$("#topupBarcodeWaiting-dialog").dialog({
    width: 500,
    height: 400,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    dialogClass: "no-close",
    open: function (event, ui) {
        var dataWaitingTopup = $("#topupBarcodeWaiting-dialog").data("topupRespBarcode");
        var dataWaitingTopupType = $("#topupBarcodeWaiting-dialog").data("topUpType");
        var dataWaitingTopupAmount = $("#topupBarcodeWaiting-dialog").data("amount");
        console.log("dataWaitingTopupType:", dataWaitingTopupType);
        var dataWaitingTopupPhoneNum = $("#topupBarcodeWaiting-dialog").data("phoneNumber");
        $("#topupBarcodeWaitingMerchant").text(dataWaitingTopupType);
        if (dataWaitingTopupType == "ALLO") {
            $("#phoneNumber-dialog").hide();
        } else {
            var dataWaitingTopupPhoneNum = $("#topupBarcodeWaiting-dialog").data("phoneNumber");
            $("#topupBarcodeWaitingPhoneNum").text(dataWaitingTopupPhoneNum);
        }
        $("#topupBarcodeWaitingBarcode").text(dataWaitingTopup["responseData"]['barcode']);
        $("#topupBarcodeWaitingReferenceNo").text(dataWaitingTopup["responseData"]['referenceNo']);
        $("#topupBarcodeWaitingPartnerReferenceNo").text(dataWaitingTopup["responseData"]['partnerReferenceNo']);
        $("#topupBarcodeWaitingAmountTopup").text(dataWaitingTopupAmount);
        $("#topupBarcodeWaitingEancode").text(dataWaitingTopup["eancode"]);
        $("#topupBarcodeWaitingItemName").text(dataWaitingTopup["item_name"]);
    },
    close: function () {
        //$("#MLCCheckPaymentDialogMsg").empty();
        CustomerPopupScreen.cus_closeTopupBarcodeDialog();
    },
    buttons: {
        CANCEL: function () {
            if (connectionOnline) {
                var topupBarcodeMerchant = $("#topupBarcodeWaitingMerchant").text();
                var topupBarcode = $("#topupBarcodeWaitingBarcode").text();
                var topupBarcodeEancode = $("#topupBarcodeWaitingEancode").text();
                var topupBarcodeWaitingReferenceNo = $("#topupBarcodeWaitingReferenceNo").text();
                var topupRespStatus = topupReqStatus(topupBarcode, topupBarcodeWaitingReferenceNo, topupBarcodeMerchant);
                // var topupRespStatus = {
                //     "responseData": {
                //       "referenceNo": "20230410000001910116811277333921",
                //       "partnerReferenceNo": "8f1a4eb3dd144a789aa1edab5ab6fe64",
                //       "barcode": "16950204023811540701",
                //       "topUpStatus": "00",
                //       "topUpMessage": "Top Up Success",
                //       "topUpAmount": {
                //         "value": "50000.00",
                //         "currency": "IDR"
                //       },
                //       "msisdn": "8812146033"
                //     },
                //     "code": "0",
                //     "transactionNo": "10019013230401066",
                //     "message": "Success"
                // }
                if (topupRespStatus) {
                    if (topupRespStatus["responseData"]['topUpStatus'] == "00") {
                        showMsgDialog("Cancel: Topup Success cannot cancel transaction", "message");
                    }else{
                        $("#topupBarcodeInput-dialog").dialog("close");
                        $(this).dialog("close");
                    }
                }else {
                    showMsgDialog("Network Payment Allo Topup Failed", "warning");
                }
            }else{
                showKeyNotAllowedMsg();
            }
                
            
        },
        SUBMIT: function () {
            if (connectionOnline) {

                var topupBarcode = $("#topupBarcodeWaitingBarcode").text();
                var topupBarcodeEancode = $("#topupBarcodeWaitingEancode").text();
                var topupBarcodeWaitingReferenceNo = $("#topupBarcodeWaitingReferenceNo").text();
                
                var topupRespStatus = topupReqStatus(topupBarcode, topupBarcodeWaitingReferenceNo);
                // var topupRespStatus = {
                //     "responseData": {
                //       "referenceNo": "20230410000001910116811277333921",
                //       "partnerReferenceNo": "8f1a4eb3dd144a789aa1edab5ab6fe64",
                //       "barcode": "16950204023811540701",
                //       "topUpStatus": "00",
                //       "topUpMessage": "Top Up Success",
                //       "topUpAmount": {
                //         "value": "50000.00",
                //         "currency": "IDR"
                //       },
                //       "msisdn": "8812146033"
                //     },
                //     "code": "0",
                //     "transactionNo": "10019013230401066",
                //     "message": "Success"
                // }

                if (topupRespStatus) {
                    // console.log("CUYYY ", topupRespStatus)
                    if (topupRespStatus["responseData"]['topUpStatus'] == "00") {
                        saleTx.customerId = topupRespStatus["responseData"]['referenceNo'];
                        saleTx.qrtts = {
                            keyNo: topupRespStatus["responseData"]['referenceNo'],
                            customerId: topupRespStatus["responseData"]['referenceNo'],
                            topupAmount: topupRespStatus["responseData"]['topUpAmount']['value'],
                            rd: topupRespStatus["responseData"]['topUpStatus'],
                            accountNumber: topupRespStatus["responseData"]['referenceNo'],
                            approvalCode: topupRespStatus["responseData"]['referenceNo'],
                            benefitCity: topupRespStatus["responseData"]['referenceNo'],
                            benefitName: topupRespStatus["responseData"]['referenceNo'],
                            benefitNnsName: topupRespStatus["responseData"]['referenceNo'],
                            benefitPan: topupRespStatus["responseData"]['referenceNo'],
                            invoiceNumber: topupRespStatus["responseData"]['referenceNo'],
                            rrn: topupRespStatus["responseData"]['referenceNo'],
                            senderPan: topupRespStatus["responseData"]['referenceNo'],
                            currCode: topupRespStatus["responseData"]['referenceNo'],
                            transactionType: 'ALLO_TOPUP_BARCODE',
                        };

                        showMsgDialog("Payment Allo Topup Success", "");
                        // processSaleScan(topupBarcodeEancode);
                        $(this).dialog("close");
                    } else {
                        showMsgDialog("Submit: " + topupRespStatus["responseData"]['topUpStatus'] + " - " + topupRespStatus["responseData"]['topUpMessage'], "message");
                    }
                } else {
                    showMsgDialog("Network Payment Allo Topup Failed", "warning");
                }
                
            }else {
                showKeyNotAllowedMsg();
            }
        },
        
    }
});


//BEFORE MSIB
// $("#topupBarcodeWaiting-dialog").dialog({
//     width: 500,
//     height: 400,
//     resizable: false,
//     draggable: false,
//     modal: true,
//     autoOpen: false,
//     closeOnEscape: false,
//     dialogClass: "no-close",
//     open: function (event, ui) {
//         var dataWaitingTopup = $("#topupBarcodeWaiting-dialog").data("topupRespBarcode");
//         $("#topupBarcodeWaitingBarcode").text(dataWaitingTopup["responseData"]['barcode']);
//         $("#topupBarcodeWaitingReferenceNo").text(dataWaitingTopup["responseData"]['referenceNo']);
//         $("#topupBarcodeWaitingPartnerReferenceNo").text(dataWaitingTopup["responseData"]['partnerReferenceNo']);
//         $("#topupBarcodeWaitingAmountTopup").text($("#topupBarcodeInputAmount").val());
//         $("#topupBarcodeWaitingEancode").text(dataWaitingTopup["eancode"]);
//         $("#topupBarcodeWaitingItemName").text(dataWaitingTopup["item_name"]);
//     },
//     close: function () {
//         //$("#MLCCheckPaymentDialogMsg").empty();
//         CustomerPopupScreen.cus_closeTopupBarcodeDialog();
//     },
//     buttons: {
//         CANCEL: function () {
//             if (connectionOnline) {
//                 var topupBarcode = $("#topupBarcodeWaitingBarcode").text();
//                 var topupBarcodeEancode = $("#topupBarcodeWaitingEancode").text();
//                 var topupBarcodeWaitingReferenceNo = $("#topupBarcodeWaitingReferenceNo").text();
//                 var topupRespStatus = topupReqStatus(topupBarcode, topupBarcodeWaitingReferenceNo);
//                 // var topupRespStatus = {
//                 //     "responseData": {
//                 //       "referenceNo": "20230410000001910116811277333921",
//                 //       "partnerReferenceNo": "8f1a4eb3dd144a789aa1edab5ab6fe64",
//                 //       "barcode": "16950204023811540701",
//                 //       "topUpStatus": "00",
//                 //       "topUpMessage": "Top Up Success",
//                 //       "topUpAmount": {
//                 //         "value": "50000.00",
//                 //         "currency": "IDR"
//                 //       },
//                 //       "msisdn": "8812146033"
//                 //     },
//                 //     "code": "0",
//                 //     "transactionNo": "10019013230401066",
//                 //     "message": "Success"
//                 // }
//                 if (topupRespStatus) {
//                     if (topupRespStatus["responseData"]['topUpStatus'] == "00") {
//                         showMsgDialog("Cancel: Topup Success cannot cancel transaction", "message");
//                     }else{
//                         $("#topupBarcodeInput-dialog").dialog("close");
//                         $(this).dialog("close");
//                     }
//                 }else {
//                     showMsgDialog("Network Payment Allo Topup Failed", "warning");
//                 }
//             }else{
//                 showKeyNotAllowedMsg();
//             }
                
            
//         },
//         SUBMIT: function () {
//             if (connectionOnline) {

//                 var topupBarcode = $("#topupBarcodeWaitingBarcode").text();
//                 var topupBarcodeEancode = $("#topupBarcodeWaitingEancode").text();
//                 var topupBarcodeWaitingReferenceNo = $("#topupBarcodeWaitingReferenceNo").text();
                
//                 var topupRespStatus = topupReqStatus(topupBarcode, topupBarcodeWaitingReferenceNo);
//                 // var topupRespStatus = {
//                 //     "responseData": {
//                 //       "referenceNo": "20230410000001910116811277333921",
//                 //       "partnerReferenceNo": "8f1a4eb3dd144a789aa1edab5ab6fe64",
//                 //       "barcode": "16950204023811540701",
//                 //       "topUpStatus": "00",
//                 //       "topUpMessage": "Top Up Success",
//                 //       "topUpAmount": {
//                 //         "value": "50000.00",
//                 //         "currency": "IDR"
//                 //       },
//                 //       "msisdn": "8812146033"
//                 //     },
//                 //     "code": "0",
//                 //     "transactionNo": "10019013230401066",
//                 //     "message": "Success"
//                 // }

//                 if (topupRespStatus) {
//                     if (topupRespStatus["responseData"]['topUpStatus'] == "00") {
//                         saleTx.customerId = topupRespStatus["responseData"]['referenceNo'];
//                         saleTx.qrtts = {
//                             keyNo: topupRespStatus["responseData"]['referenceNo'],
//                             customerId: topupRespStatus["responseData"]['referenceNo'],
//                             topupAmount: topupRespStatus["responseData"]['topUpAmount']['value'],
//                             rd: topupRespStatus["responseData"]['topUpStatus'],
//                             accountNumber: topupRespStatus["responseData"]['referenceNo'],
//                             approvalCode: topupRespStatus["responseData"]['referenceNo'],
//                             benefitCity: topupRespStatus["responseData"]['referenceNo'],
//                             benefitName: topupRespStatus["responseData"]['referenceNo'],
//                             benefitNnsName: topupRespStatus["responseData"]['referenceNo'],
//                             benefitPan: topupRespStatus["responseData"]['referenceNo'],
//                             invoiceNumber: topupRespStatus["responseData"]['referenceNo'],
//                             rrn: topupRespStatus["responseData"]['referenceNo'],
//                             senderPan: topupRespStatus["responseData"]['referenceNo'],
//                             currCode: topupRespStatus["responseData"]['referenceNo'],
//                             transactionType: 'ALLO_TOPUP_BARCODE',
//                         };

//                         showMsgDialog("Payment Allo Topup Success", "");
//                         // processSaleScan(topupBarcodeEancode);
//                         $(this).dialog("close");
//                     } else {
//                         showMsgDialog("Submit: " + topupRespStatus["responseData"]['topUpStatus'] + " - " + topupRespStatus["responseData"]['topUpMessage'], "message");
//                     }
//                 } else {
//                     showMsgDialog("Network Payment Allo Topup Failed", "warning");
//                 }
                
//             }else {
//                 showKeyNotAllowedMsg();
//             }
//         },
        
//     }
// });


// DEVELOPED MSIB
$("#topupBarcodeCheck-dialog").dialog({
    width: 400,
    height: 350,
    resizable: false,
    draggable: false,
    modal: true,
    autoOpen: false,
    closeOnEscape: false,
    open: function (event, ui) {
        var datacheckTopup = $("#topupBarcodeCheck-dialog").data("topupRespStatus");
        $("#topupBarcodeCheckStatus").text(datacheckTopup["responseData"]['topUpStatus']);
        $("#topupBarcodeCheckMessage").text(datacheckTopup["responseData"]['topUpMessage']);
        $("#topupBarcodeCheckBarcode").text(datacheckTopup["responseData"]['barcode']);
        $("#topupBarcodeCheckReferenceNo").text(datacheckTopup["responseData"]['referenceNo']);
        $("#topupBarcodeCheckPartnerReferenceNo").text(datacheckTopup["responseData"]['partnerReferenceNo']);
        $("#topupBarcodeCheckAmountTopup").text(datacheckTopup["responseData"]['topUpAmount']['value']);
    }
});

// DEVELOPED MSIB
// function topupReqBarcode(amount, topUpType, phoneNum) {
//     var isHTTPStatusOK = false;
//     var typeOfTopUp = topUpType.toLowerCase();
//     var typeOfTopUpUpper = topUpType.toUpperCase();
    
//     var reqData = {
//         transactionNo: saleTx.transactionId,
//         requestData: {
//             partnerReferenceNo: saleTx.transactionId,
//             customerNumber: phoneNum,
//             merchantId: configuration.properties[typeOfTopUpUpper+'_OFFLINE_TOPUP_MID'],
//             storeId: configuration.storeCode,
//             cashierId: configuration.terminalCode,
//             transactionDate: new Date(),
//             amount: {
//                 value: amount.toString() + ".00",
//                 currency: "IDR"
//             },
//             feeAmount: {
//                 value: configuration.properties[typeOfTopUpUpper+'_TOPUP_FEE'] + ".00",
//                 currency: "IDR"
//             },                   
//         },
//         type: "generate"
//     };
//     // var url = posWebContextPath + "/cashier/" +typeOfTopUp+ "/offlineTopup?topUp=" + typeOfTopUpUpper;
//     // console.log(JSON.stringify(reqData));
//     var data = $.ajax({
//         url: posWebContextPath + "/cashier/" +typeOfTopUp+ "/offlineTopup?topUp=" + typeOfTopUpUpper,
//         type: "POST",
//         async: false,
//         contentType: 'application/json',
//         dataType: "json",
//         data: JSON.stringify(reqData),
//         beforeSend: function() {
//             // console.log("INI URL : " + url);
//             if (!$("#loading-dialog").dialog("isOpen")) {
//                 $("#loading-dialog").dialog("open");
//             }
//         },
//         success: function (response) {
//             isHTTPStatusOK = true;
//             $("#loading-dialog").dialog('close');
//         },
//         error: function (jqXHR, status, error) {
//             $("#loading-dialog").dialog('close');
//         },
//     }).responseText;

//     if (isHTTPStatusOK) return JSON.parse(data);
//     else return null;
// }


//BEFORE MSIB
function topupReqBarcode(amount) {
    var isHTTPStatusOK = false;
    var reqData = {
        transactionNo: saleTx.transactionId,
        requestData: {
            partnerReferenceNo: saleTx.transactionId,
            merchantId: configuration.properties['ALLO_OFFLINE_TOPUP_MID'],
            storeId: configuration.storeCode,
            cashierId: configuration.terminalCode,
            topUpAmount: {
                value: amount.toString() + ".00",
                currency: "IDR"
            }
        },
        type: "generate"
    };
    var data = $.ajax({
        url: posWebContextPath + "/cashier/allo/offlineTopup",
        type: "POST",
        async: false,
        contentType: 'application/json',
        dataType: "json",
        data: JSON.stringify(reqData),
        beforeSend: function() {
            if (!$("#loading-dialog").dialog("isOpen")) {
                $("#loading-dialog").dialog("open");
            }
        },
        success: function (response) {
            isHTTPStatusOK = true;
            $("#loading-dialog").dialog('close');
        },
        error: function (jqXHR, status, error) {
            $("#loading-dialog").dialog('close');
        },
    }).responseText;

    if (isHTTPStatusOK) return JSON.parse(data);
    else return null;
}


// DEVELOPED MSIB
// function topupReqStatus(barcode, originalReferenceNo, topupBarcodeMerchant) {
//     var isHTTPStatusOK = false;
//     var reqData = {
//         transactionNo: saleTx.transactionId,
//         requestData: {
//             barcode: barcode,
//             originalReferenceNo: originalReferenceNo,
//             serviceCode: ,
//             merchantId: configuration.properties[topupBarcodeMerchant+'_OFFLINE_TOPUP_MID'],
//             storeId: configuration.storeCode,
//             cashierId: configuration.terminalCode,
//         },
//         type: "query"
//     };
//     var data = $.ajax({
//         url: posWebContextPath + "/cashier/"+topupBarcodeMerchant+"/offlineTopup",
//         type: "POST",
//         async: false,
//         contentType: 'application/json',
//         dataType: "json",
//         data: JSON.stringify(reqData),
//         beforeSend: function() {
//             if (!$("#loading-dialog").dialog("isOpen")) {
//                 $("#loading-dialog").dialog("open");
//             }
//         },
//         success: function (response) {
//             isHTTPStatusOK = true;
//             $("#loading-dialog").dialog('close');
//         },
//         error: function (jqXHR, status, error) {
//             $("#loading-dialog").dialog('close');
//         },
//     }).responseText;

//     if (isHTTPStatusOK) return JSON.parse(data);
//     else return null;
// }

//BEFORE MSIB
function topupReqStatus(barcode, originalReferenceNo) {
    var isHTTPStatusOK = false;
    var reqData = {
        transactionNo: saleTx.transactionId,
        requestData: {
            barcode: barcode,
            originalReferenceNo: originalReferenceNo,
            merchantId: configuration.properties['ALLO_OFFLINE_TOPUP_MID'],
            storeId: configuration.storeCode,
            cashierId: configuration.terminalCode,
        },
        type: "query"
    };
    var data = $.ajax({
        url: posWebContextPath + "/cashier/allo/offlineTopup",
        type: "POST",
        async: false,
        contentType: 'application/json',
        dataType: "json",
        data: JSON.stringify(reqData),
        beforeSend: function() {
            if (!$("#loading-dialog").dialog("isOpen")) {
                $("#loading-dialog").dialog("open");
            }
        },
        success: function (response) {
            isHTTPStatusOK = true;
            $("#loading-dialog").dialog('close');
        },
        error: function (jqXHR, status, error) {
            $("#loading-dialog").dialog('close');
        },
    }).responseText;

    if (isHTTPStatusOK) return JSON.parse(data);
    else return null;
}

