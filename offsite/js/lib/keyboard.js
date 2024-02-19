/*!
jQuery UI Virtual Keyboard
Version 1.17.7 minified (MIT License)
Caret code modified from jquery.caret.1.02.js (MIT License)
*/
;(function(c){c.keyboard=function(d,m){var a=this,e;a.$el=c(d);a.el=d;a.$el.data("keyboard",a);a.init=function(){a.options=e=c.extend(!0,{},c.keyboard.defaultOptions,m);a.shiftActive=a.altActive=a.metaActive=a.sets=a.capsLock=!1;a.lastKeyset=[!1,!1,!1];a.rows=["","-shift","-alt","-alt-shift"];a.acceptedKeys=[];a.mappedKeys={};c('\x3c!--[if lte IE 8]><script>jQuery("body").addClass("oldie");\x3c/script><![endif]--\x3e\x3c!--[if IE]><script>jQuery("body").addClass("ie");\x3c/script><![endif]--\x3e').appendTo("body").remove(); a.msie=c("body").hasClass("oldie");a.allie=c("body").hasClass("ie");a.inPlaceholder=a.$el.attr("placeholder")||"";a.watermark="undefined"!==typeof document.createElement("input").placeholder&&""!==a.inPlaceholder;a.regex=c.keyboard.comboRegex;a.decimal=/^\./.test(e.display.dec)?!0:!1;a.repeatTime=1E3/(e.repeatRate||20);a.temp=c('<input style="position:absolute;left:-9999em;top:-9999em;" type="text" value="testing">').appendTo("body").caret(3,3);a.checkCaret=e.lockInput||3!==a.temp.hide().show().caret().start? !0:!1;a.temp.remove();a.lastCaret={start:0,end:0};a.temp=["",0,0];c.each("initialized beforeVisible visible hidden canceled accepted beforeClose".split(" "),function(b,j){c.isFunction(e[j])&&a.$el.bind(j+".keyboard",e[j])});e.alwaysOpen&&(e.stayOpen=!0);c(document).bind("mousedown.keyboard keyup.keyboard touchstart.keyboard",function(b){a.opening||(a.escClose(b),b.target&&c(b.target).hasClass("ui-keyboard-input")&&(b=c(b.target).data("keyboard"))&&b.options.openOn&&b.focusOn())});a.$el.addClass("ui-keyboard-input "+ e.css.input).attr({"aria-haspopup":"true",role:"textbox"});(a.$el.is(":disabled")||a.$el.attr("readonly")&&!a.$el.hasClass("ui-keyboard-lockedinput"))&&a.$el.addClass("ui-keyboard-nokeyboard");e.openOn&&a.$el.bind(e.openOn+".keyboard",function(){a.focusOn()});!a.watermark&&(""===a.$el.val()&&""!==a.inPlaceholder&&""!==a.$el.attr("placeholder"))&&a.$el.addClass("ui-keyboard-placeholder").val(a.inPlaceholder);a.$el.trigger("initialized.keyboard",[a,a.el]);e.alwaysOpen&&a.reveal()};a.focusOn=function(){e.usePreview&& a.$el.is(":visible")&&(a.lastCaret=a.$el.caret());if(!a.isVisible()||e.alwaysOpen)clearTimeout(a.timer),a.reveal()};a.reveal=function(){a.opening=!0;c(".ui-keyboard:not(.ui-keyboard-always-open)").hide();if(a.$el.is(":disabled")||a.$el.attr("readonly")&&!a.$el.hasClass("ui-keyboard-lockedinput"))a.$el.addClass("ui-keyboard-nokeyboard");else{a.$el.removeClass("ui-keyboard-nokeyboard");e.openOn&&a.$el.unbind(e.openOn+".keyboard");"undefined"===typeof a.$keyboard&&a.startup();c(".ui-keyboard-has-focus").removeClass("ui-keyboard-has-focus"); c(".ui-keyboard-input-current").removeClass("ui-keyboard-input-current");a.$el.addClass("ui-keyboard-input-current");a.isCurrent(!0);!a.watermark&&a.el.value===a.inPlaceholder&&a.$el.removeClass("ui-keyboard-placeholder").val("");a.originalContent=a.$el.val();a.$preview.val(a.originalContent);e.acceptValid&&a.checkValid();var b;a.position=e.position;a.position.of=a.position.of||a.$el.data("keyboardPosition")||a.$el;a.position.collision=e.usePreview?a.position.collision||"fit fit":"flip flip";e.resetDefault&& (a.shiftActive=a.altActive=a.metaActive=!1,a.showKeySet());a.$keyboard.css({position:"absolute",left:0,top:0});a.$el.trigger("beforeVisible.keyboard",[a,a.el]);a.$keyboard.addClass("ui-keyboard-has-focus").show();e.usePreview&&a.msie&&("undefined"===typeof a.width&&(a.$preview.hide(),a.width=Math.ceil(a.$keyboard.width()),a.$preview.show()),a.$preview.width(a.width));c.ui.position&&a.$keyboard.position(a.position);e.initialFocus&&a.$preview.focus();a.checkDecimal();a.lineHeight=parseInt(a.$preview.css("lineHeight"), 10)||parseInt(a.$preview.css("font-size"),10)+4;e.caretToEnd&&(b=a.originalContent.length,a.lastCaret={start:b,end:b});a.allie&&(b=a.lastCaret.start||a.originalContent.length,b={start:b,end:b},a.lastCaret||(a.lastCaret=b),0===a.lastCaret.end&&0<a.lastCaret.start&&(a.lastCaret.end=a.lastCaret.start),0>a.lastCaret.start&&(a.lastCaret=b));setTimeout(function(){a.opening=!1;e.initialFocus&&a.$preview.caret(a.lastCaret.start,a.lastCaret.end);a.$el.trigger("visible.keyboard",[a,a.el])},10);return a}};a.startup= function(){a.$keyboard=a.buildKeyboard();a.$allKeys=a.$keyboard.find("button.ui-keyboard-button");a.preview=a.$preview[0];a.$decBtn=a.$keyboard.find(".ui-keyboard-dec");a.wheel=c.isFunction(c.fn.mousewheel);a.alwaysAllowed=[20,33,34,35,36,37,38,39,40,45,46];e.enterNavigation&&a.alwaysAllowed.push(13);a.$preview.bind("keypress.keyboard",function(b){var j=a.lastKey=String.fromCharCode(b.charCode||b.which);a.$lastKey=[];a.checkCaret&&(a.lastCaret=a.$preview.caret());a.capsLock=65<=j&&90>=j&&!b.shiftKey|| 97<=j&&122>=j&&b.shiftKey?!0:!1;if(e.restrictInput){if((8===b.which||0===b.which)&&c.inArray(b.keyCode,a.alwaysAllowed))return;-1===c.inArray(j,a.acceptedKeys)&&b.preventDefault()}else if((b.ctrlKey||b.metaKey)&&(97===b.which||99===b.which||118===b.which||120<=b.which&&122>=b.which))return;a.hasMappedKeys&&a.mappedKeys.hasOwnProperty(j)&&(a.lastKey=a.mappedKeys[j],a.insertText(a.lastKey),b.preventDefault());a.checkMaxLength()}).bind("keyup.keyboard",function(b){switch(b.which){case 9:a.tab&&e.tabNavigation&& !e.lockInput?(a.shiftActive=b.shiftKey,c.keyboard.keyaction.tab(a),a.tab=!1):b.preventDefault();break;case 27:return a.close(),!1}clearTimeout(a.throttled);a.throttled=setTimeout(function(){a.isVisible()&&a.checkCombos()},100);a.checkMaxLength();c.isFunction(e.change)&&e.change(c.Event("change"),a,a.el);a.$el.trigger("change.keyboard",[a,a.el])}).bind("keydown.keyboard",function(b){switch(b.which){case 9:return a.tab=!0,!1;case 13:c.keyboard.keyaction.enter(a,null,b);break;case 20:a.shiftActive=a.capsLock= !a.capsLock;a.showKeySet(this);break;case 86:if(b.ctrlKey||b.metaKey){if(e.preventPaste){b.preventDefault();break}a.checkCombos()}}}).bind("mouseup.keyboard touchend.keyboard",function(){a.checkCaret&&(a.lastCaret=a.$preview.caret())});a.$keyboard.bind("mousedown.keyboard click.keyboard touchstart.keyboard",function(a){a.stopPropagation()});e.preventPaste&&(a.$preview.bind("contextmenu.keyboard",function(a){a.preventDefault()}),a.$el.bind("contextmenu.keyboard",function(a){a.preventDefault()}));e.appendLocally? a.$el.after(a.$keyboard):a.$keyboard.appendTo("body");a.$allKeys.bind(e.keyBinding.split(" ").join(".keyboard ")+".keyboard repeater.keyboard",function(b){if(!a.$keyboard.is(":visible"))return!1;var j;j=c.data(this,"key");var h=j.action.split(":")[0];a.$preview.focus();a.$lastKey=c(this);a.lastKey=j.curTxt;a.checkCaret&&a.$preview.caret(a.lastCaret.start,a.lastCaret.end);h.match("meta")&&(h="meta");if(c.keyboard.keyaction.hasOwnProperty(h)&&c(this).hasClass("ui-keyboard-actionkey")){if(!1===c.keyboard.keyaction[h](a, this,b))return!1}else"undefined"!==typeof j.action&&(j=a.lastKey=a.wheel&&!c(this).hasClass("ui-keyboard-actionkey")?j.curTxt:j.action,a.insertText(j),!a.capsLock&&(!e.stickyShift&&!b.shiftKey)&&(a.shiftActive=!1,a.showKeySet(this)));a.checkCombos();a.checkMaxLength();c.isFunction(e.change)&&e.change(c.Event("change"),a,a.el);a.$el.trigger("change.keyboard",[a,a.el]);a.$preview.focus();a.checkCaret&&a.$preview.caret(a.lastCaret.start,a.lastCaret.end);b.preventDefault()}).bind("mouseenter.keyboard mouseleave.keyboard", function(b){if(a.isCurrent()){var j=c(this),h=c.data(this,"key");"mouseenter"===b.type&&("password"!==a.el.type&&!j.hasClass(e.css.buttonDisabled))&&j.addClass(e.css.buttonHover).attr("title",function(b,j){return a.wheel&&""===j&&a.sets?e.wheelMessage:j});"mouseleave"===b.type&&(h.curTxt=h.original,h.curNum=0,c.data(this,"key",h),j.removeClass("password"===a.el.type?"":e.css.buttonHover).attr("title",function(a,b){return b===e.wheelMessage?"":b}).find("span").text(h.original))}}).bind("mousewheel.keyboard", function(b,e){if(a.wheel){var h,d=c(this),g=c.data(this,"key");h=g.layers||a.getLayers(d);g.curNum+=0<e?-1:1;g.curNum>h.length-1&&(g.curNum=0);0>g.curNum&&(g.curNum=h.length-1);g.layers=h;g.curTxt=h[g.curNum];c.data(this,"key",g);d.find("span").text(h[g.curNum]);return!1}}).bind("mouseup.keyboard mouseleave.kb touchend.kb touchmove.kb touchcancel.kb",function(b){"mouseleave"===b.type?c(this).removeClass(e.css.buttonHover):(a.isVisible()&&a.isCurrent()&&a.$preview.focus(),a.checkCaret&&a.$preview.caret(a.lastCaret.start, a.lastCaret.end));a.mouseRepeat=[!1,""];clearTimeout(a.repeater);return!1}).bind("click.keyboard",function(){return!1}).filter(":not(.ui-keyboard-actionkey)").add(".ui-keyboard-tab, .ui-keyboard-bksp, .ui-keyboard-space, .ui-keyboard-enter",a.$keyboard).bind("mousedown.kb touchstart.kb",function(){if(0!==e.repeatRate){var b=c(this);a.mouseRepeat=[!0,b];setTimeout(function(){a.mouseRepeat[0]&&a.mouseRepeat[1]===b&&a.repeatKey(b)},e.repeatDelay)}return!1});c(window).resize(function(){a.isVisible()&& a.$keyboard.position(a.position)})};a.isVisible=function(){return"undefined"===typeof a.$keyboard?!1:a.$keyboard.is(":visible")};a.insertText=function(b){var e,d;d=a.$preview.val();var c=a.$preview.caret(),g=a.$preview.scrollLeft();e=a.$preview.scrollTop();var f=d.length;c.end<c.start&&(c.end=c.start);c.start>f&&(c.end=c.start=f);"TEXTAREA"===a.preview.tagName&&(a.msie&&"\n"===d.substr(c.start,1)&&(c.start+=1,c.end+=1),d=d.split("\n").length-1,a.preview.scrollTop=0<d?a.lineHeight*d:e);e="bksp"=== b&&c.start===c.end?!0:!1;b="bksp"===b?"":b;d=c.start+(e?-1:b.length);g+=parseInt(a.$preview.css("fontSize"),10)*("bksp"===b?-1:1);a.$preview.val(a.$preview.val().substr(0,c.start-(e?1:0))+b+a.$preview.val().substr(c.end)).caret(d,d).scrollLeft(g);a.checkCaret&&(a.lastCaret={start:d,end:d})};a.checkMaxLength=function(){var b,c=a.$preview.val();!1!==e.maxLength&&c.length>e.maxLength&&(b=Math.min(a.$preview.caret().start,e.maxLength),a.$preview.val(c.substring(0,e.maxLength)),a.$preview.caret(b,b),a.lastCaret= {start:b,end:b});a.$decBtn.length&&a.checkDecimal()};a.repeatKey=function(b){b.trigger("repeater.keyboard");a.mouseRepeat[0]&&(a.repeater=setTimeout(function(){a.repeatKey(b)},a.repeatTime))};a.showKeySet=function(b){var c="",d=(a.shiftActive?1:0)+(a.altActive?2:0);a.shiftActive||(a.capsLock=!1);if(a.metaActive){if(c=b&&b.name&&/meta/.test(b.name)?b.name:"",""===c?c=!0===a.metaActive?"":a.metaActive:a.metaActive=c,!e.stickyShift&&a.lastKeyset[2]!==a.metaActive||(a.shiftActive||a.altActive)&&!a.$keyboard.find(".ui-keyboard-keyset-"+ c+a.rows[d]).length)a.shiftActive=a.altActive=!1}else!e.stickyShift&&(a.lastKeyset[2]!==a.metaActive&&a.shiftActive)&&(a.shiftActive=a.altActive=!1);d=(a.shiftActive?1:0)+(a.altActive?2:0);c=0===d&&!a.metaActive?"-default":""===c?"":"-"+c;a.$keyboard.find(".ui-keyboard-keyset"+c+a.rows[d]).length?(a.$keyboard.find(".ui-keyboard-alt, .ui-keyboard-shift, .ui-keyboard-actionkey[class*=meta]").removeClass(e.css.buttonAction).end().find(".ui-keyboard-alt")[a.altActive?"addClass":"removeClass"](e.css.buttonAction).end().find(".ui-keyboard-shift")[a.shiftActive? "addClass":"removeClass"](e.css.buttonAction).end().find(".ui-keyboard-lock")[a.capsLock?"addClass":"removeClass"](e.css.buttonAction).end().find(".ui-keyboard-keyset").hide().end().find(".ui-keyboard-keyset"+c+a.rows[d]).show().end().find(".ui-keyboard-actionkey.ui-keyboard"+c).addClass(e.css.buttonAction),a.lastKeyset=[a.shiftActive,a.altActive,a.metaActive]):(a.shiftActive=a.lastKeyset[0],a.altActive=a.lastKeyset[1],a.metaActive=a.lastKeyset[2])};a.checkCombos=function(){if(a.isVisible()){var b, c,d,l,g=a.$preview.val(),f=a.$preview.caret(),k=g.length;f.end<f.start&&(f.end=f.start);f.start>k&&(f.end=f.start=k);a.msie&&"\n"===g.substr(f.start,1)&&(f.start+=1,f.end+=1);e.useCombos&&(a.msie?g=g.replace(a.regex,function(a,b,c){return e.combos.hasOwnProperty(b)?e.combos[b][c]||a:a}):a.$preview.length&&(d=f.start-(0<=f.start-2?2:0),a.$preview.caret(d,f.end),l=(a.$preview.caret().text||"").replace(a.regex,function(a,b,c){return e.combos.hasOwnProperty(b)?e.combos[b][c]||a:a}),a.$preview.val(a.$preview.caret().replace(l)), g=a.$preview.val()));if(e.restrictInput&&""!==g){d=g;c=a.acceptedKeys.length;for(b=0;b<c;b++)""!==d&&(l=a.acceptedKeys[b],0<=g.indexOf(l)&&(/[\[|\]|\\|\^|\$|\.|\||\?|\*|\+|\(|\)|\{|\}]/g.test(l)&&(l="\\"+l),d=d.replace(RegExp(l,"g"),"")));""!==d&&(g=g.replace(d,""))}f.start+=g.length-k;f.end+=g.length-k;a.$preview.val(g);a.$preview.caret(f.start,f.end);a.preview.scrollTop=a.lineHeight*(g.substring(0,f.start).split("\n").length-1);a.lastCaret={start:f.start,end:f.end};e.acceptValid&&a.checkValid(); return g}};a.checkValid=function(){var b=!0;e.validate&&"function"===typeof e.validate&&(b=e.validate(a,a.$preview.val(),!1));a.$keyboard.find(".ui-keyboard-accept")[b?"removeClass":"addClass"]("ui-keyboard-invalid-input")[b?"addClass":"removeClass"]("ui-keyboard-valid-input")};a.checkDecimal=function(){a.decimal&&/\./g.test(a.preview.value)||!a.decimal&&/\,/g.test(a.preview.value)?a.$decBtn.attr({disabled:"disabled","aria-disabled":"true"}).removeClass(e.css.buttonDefault+" "+e.css.buttonHover).addClass(e.css.buttonDisabled): a.$decBtn.removeAttr("disabled").attr({"aria-disabled":"false"}).addClass(e.css.buttonDefault).removeClass(e.css.buttonDisabled)};a.getLayers=function(a){var e;e=a.attr("data-pos");return a.closest(".ui-keyboard").find('button[data-pos="'+e+'"]').map(function(){return c(this).find("> span").text()}).get()};a.isCurrent=function(b){var e=c.keyboard.currentKeyboard||!1;b?e=c.keyboard.currentKeyboard=a.el:!1===b&&e===a.el&&(e=c.keyboard.currentKeyboard="");return e===a.el};a.switchInput=function(b,d){if("function"=== typeof e.switchInput)e.switchInput(a,b,d);else{a.$keyboard.hide();var h;h=!1;var l=c("button, input, textarea, a").filter(":visible"),g=l.index(a.$el)+(b?1:-1);a.$keyboard.show();g>l.length-1&&(h=e.stopAtEnd,g=0);0>g&&(h=e.stopAtEnd,g=l.length-1);h||(a.close(d),(h=l.eq(g).data("keyboard"))&&h.options.openOn.length?h.focusOn():l.eq(g).focus())}return!1};a.close=function(b){if(a.isVisible()){clearTimeout(a.throttled);var d=b?a.checkCombos():a.originalContent;if(b&&(e.validate&&"function"===typeof e.validate&& !e.validate(a,d,!0))&&(d=a.originalContent,b=!1,e.cancelClose))return;a.isCurrent(!1);a.$el.removeClass("ui-keyboard-input-current ui-keyboard-autoaccepted").addClass(b?!0===b?"":"ui-keyboard-autoaccepted":"").trigger(e.alwaysOpen?"":"beforeClose.keyboard",[a,a.el,b||!1]).val(d).scrollTop(a.el.scrollHeight).trigger(b?"accepted.keyboard":"canceled.keyboard",[a,a.el]).trigger(e.alwaysOpen?"inactive.keyboard":"hidden.keyboard",[a,a.el]).blur();e.openOn&&(a.timer=setTimeout(function(){a.$el.bind(e.openOn+ ".keyboard",function(){a.focusOn()});c(":focus")[0]===a.el&&a.$el.blur()},500));e.alwaysOpen||a.$keyboard.hide();!a.watermark&&(""===a.el.value&&""!==a.inPlaceholder)&&a.$el.addClass("ui-keyboard-placeholder").val(a.inPlaceholder);a.$el.trigger("change")}return!!b};a.accept=function(){return a.close(!0)};a.escClose=function(b){if("keyup"===b.type)return 27===b.which?a.close():"";var c=a.isCurrent();if(a.isVisible()&&!(e.alwaysOpen&&!c||!e.alwaysOpen&&e.stayOpen&&c&&!a.isVisible())&&b.target!==a.el&& c)a.allie&&b.preventDefault(),a.close(e.autoAccept?"true":!1)};a.keyBtn=c("<button />").attr({role:"button","aria-disabled":"false",tabindex:"-1"}).addClass("ui-keyboard-button");a.addKey=function(b,d,h){var l,g,f;d=!0===h?b:e.display[d]||b;var k=!0===h?b.charCodeAt(0):b;/\(.+\)/.test(d)&&(g=d.replace(/\(([^()]+)\)/,""),l=d.match(/\(([^()]+)\)/)[1],d=g,f=g.split(":"),g=""!==f[0]&&1<f.length?f[0]:g,a.mappedKeys[l]=g);f=d.split(":");""===f[0]&&""===f[1]&&(d=":");d=""!==f[0]&&1<f.length?c.trim(f[0]): d;l=1<f.length?c.trim(f[1]).replace(/_/g," ")||"":"";g=1<d.length?" ui-keyboard-widekey":"";g+=h?"":" ui-keyboard-actionkey";return a.keyBtn.clone().attr({"data-value":d,name:k,"data-pos":a.temp[1]+","+a.temp[2],title:l}).data("key",{action:b,original:d,curTxt:d,curNum:0}).addClass("ui-keyboard-"+k+g+" "+e.css.buttonDefault).html("<span>"+d+"</span>").appendTo(a.temp[0])};a.buildKeyboard=function(){var b,d,h,l,g,f,k,m,n=0,q=c("<div />").addClass("ui-keyboard "+e.css.container+(e.alwaysOpen?" ui-keyboard-always-open": "")).attr({role:"textbox"}).hide();e.usePreview?(a.$preview=a.$el.clone(!1).removeAttr("id").removeClass("ui-keyboard-placeholder ui-keyboard-input").addClass("ui-keyboard-preview "+e.css.input).attr("tabindex","-1").show(),c("<div />").addClass("ui-keyboard-preview-wrapper").append(a.$preview).appendTo(q)):(a.$preview=a.$el,e.position.at=e.position.at2);e.lockInput&&a.$preview.addClass("ui-keyboard-lockedinput").attr({readonly:"readonly"});if("custom"===e.layout||!c.keyboard.layouts.hasOwnProperty(e.layout))e.layout= "custom",c.keyboard.layouts.custom=e.customLayout||{"default":["{cancel}"]};c.each(c.keyboard.layouts[e.layout],function(p,r){if(""!==p){n++;h=c("<div />").attr("name",p).addClass("ui-keyboard-keyset ui-keyboard-keyset-"+p).appendTo(q)["default"===p?"show":"hide"]();for(d=0;d<r.length;d++){g=c.trim(r[d]).replace(/\{(\.?)[\s+]?:[\s+]?(\.?)\}/g,"{$1:$2}");k=g.split(/\s+/);for(f=0;f<k.length;f++)if(a.temp=[h,d,f],l=!1,0!==k[f].length)if(/^\{\S+\}$/.test(k[f]))if(b=k[f].match(/^\{(\S+)\}$/)[1].toLowerCase(), /\!\!/.test(b)&&(b=b.replace("!!",""),l=!0),/^sp:((\d+)?([\.|,]\d+)?)(em|px)?$/.test(b)&&(m=parseFloat(b.replace(/,/,".").match(/^sp:((\d+)?([\.|,]\d+)?)(em|px)?$/)[1]||0),c("<span>&nbsp;</span>").width(b.match("px")?m+"px":2*m+"em").addClass("ui-keyboard-button ui-keyboard-spacer").appendTo(h)),/^meta\d+\:?(\w+)?/.test(b))a.addKey(b,b);else switch(b){case "a":case "accept":a.addKey("accept",b).addClass(e.css.buttonAction);break;case "alt":case "altgr":a.addKey("alt","alt");break;case "b":case "bksp":a.addKey("bksp", b);break;case "c":case "cancel":a.addKey("cancel",b).addClass(e.css.buttonAction);break;case "combo":a.addKey("combo","combo").addClass(e.css.buttonAction);break;case "dec":a.acceptedKeys.push(a.decimal?".":",");a.addKey("dec","dec");break;case "e":case "enter":a.addKey("enter",b).addClass(e.css.buttonAction);break;case "empty":a.addKey(""," ").addClass(e.css.buttonDisabled).attr("aria-disabled",!0);break;case "s":case "shift":a.addKey("shift",b);break;case "sign":a.acceptedKeys.push("-");a.addKey("sign", "sign");break;case "space":a.acceptedKeys.push(" ");a.addKey("space","space");break;case "t":case "tab":a.addKey("tab",b);break;default:if(c.keyboard.keyaction.hasOwnProperty(b))a.addKey(b,b)[l?"addClass":"removeClass"](e.css.buttonAction)}else a.acceptedKeys.push(k[f].split(":")[0]),a.addKey(k[f],k[f],!0);h.find(".ui-keyboard-button:last").after('<br class="ui-keyboard-button-endrow">')}}});1<n&&(a.sets=!0);a.hasMappedKeys=!c.isEmptyObject(a.mappedKeys);return q};a.destroy=function(){c(document).unbind("mousedown.keyboard keyup.keyboard touchstart.keyboard"); a.$keyboard&&a.$keyboard.remove();var b=c.trim(e.openOn+" accepted beforeClose canceled change contextmenu hidden initialized keydown keypress keyup visible").split(" ").join(".keyboard ");a.$el.removeClass("ui-keyboard-input ui-keyboard-lockedinput ui-keyboard-placeholder ui-keyboard-notallowed ui-keyboard-always-open "+e.css.input).removeAttr("aria-haspopup").removeAttr("role").unbind(b+".keyboard").removeData("keyboard")};a.init()};c.keyboard.keyaction={accept:function(d){d.close(!0);return!1}, alt:function(d,c){d.altActive=!d.altActive;d.showKeySet(c)},bksp:function(d){d.insertText("bksp")},cancel:function(d){d.close();return!1},clear:function(d){d.$preview.val("")},combo:function(d){var c=!d.options.useCombos;d.options.useCombos=c;d.$keyboard.find(".ui-keyboard-combo")[c?"addClass":"removeClass"](d.options.css.buttonAction);c&&d.checkCombos();return!1},dec:function(d){d.insertText(d.decimal?".":",")},"default":function(d,c){d.shiftActive=d.altActive=d.metaActive=!1;d.showKeySet(c)},enter:function(d, m,a){m=d.el.tagName;var e=d.options;if(a.shiftKey)return e.enterNavigation?d.switchInput(!a[e.enterMod],!0):d.close(!0);if(e.enterNavigation&&("TEXTAREA"!==m||a[e.enterMod]))return d.switchInput(!a[e.enterMod],e.autoAccept?"true":!1);"TEXTAREA"===m&&c(a.target).closest("button").length&&d.insertText(" \n")},lock:function(d,c){d.lastKeyset[0]=d.shiftActive=d.capsLock=!d.capsLock;d.showKeySet(c)},meta:function(d,m){d.metaActive=c(m).hasClass(d.options.css.buttonAction)?!1:!0;d.showKeySet(m)},next:function(d){d.switchInput(!0, d.options.autoAccept);return!1},prev:function(d){d.switchInput(!1,d.options.autoAccept);return!1},shift:function(d,c){d.lastKeyset[0]=d.shiftActive=!d.shiftActive;d.showKeySet(c)},sign:function(d){/^\-?\d*\.?\d*$/.test(d.$preview.val())&&d.$preview.val(-1*d.$preview.val())},space:function(d){d.insertText(" ")},tab:function(d){var c=d.options;if("INPUT"===d.el.tagName)return c.tabNavigation?d.switchInput(!d.shiftActive,!0):!1;d.insertText("\t")}};c.keyboard.layouts={alpha:{"default":["` 1 2 3 4 5 6 7 8 9 0 - = {bksp}", "{tab} a b c d e f g h i j [ ] \\","k l m n o p q r s ; ' {enter}","{shift} t u v w x y z , . / {shift}","{accept} {space} {cancel}"],shift:["~ ! @ # $ % ^ & * ( ) _ + {bksp}","{tab} A B C D E F G H I J { } |",'K L M N O P Q R S : " {enter}',"{shift} T U V W X Y Z < > ? {shift}","{accept} {space} {cancel}"]},qwerty:{"default":["` 1 2 3 4 5 6 7 8 9 0 - = {bksp}","{tab} q w e r t y u i o p [ ] \\","a s d f g h j k l ; ' {enter}","{shift} z x c v b n m , . / {shift}","{accept} {space} {cancel}"],shift:["~ ! @ # $ % ^ & * ( ) _ + {bksp}", "{tab} Q W E R T Y U I O P { } |",'A S D F G H J K L : " {enter}',"{shift} Z X C V B N M < > ? {shift}","{accept} {space} {cancel}"]},international:{"default":["` 1 2 3 4 5 6 7 8 9 0 - = {bksp}","{tab} q w e r t y u i o p [ ] \\","a s d f g h j k l ; ' {enter}","{shift} z x c v b n m , . / {shift}","{accept} {alt} {space} {alt} {cancel}"],shift:["~ ! @ # $ % ^ & * ( ) _ + {bksp}","{tab} Q W E R T Y U I O P { } |",'A S D F G H J K L : " {enter}',"{shift} Z X C V B N M < > ? {shift}","{accept} {alt} {space} {alt} {cancel}"], alt:["~ \u00a1 \u00b2 \u00b3 \u00a4 \u20ac \u00bc \u00bd \u00be \u2018 \u2019 \u00a5 \u00d7 {bksp}","{tab} \u00e4 \u00e5 \u00e9 \u00ae \u00fe \u00fc \u00fa \u00ed \u00f3 \u00f6 \u00ab \u00bb \u00ac","\u00e1 \u00df \u00f0 f g h j k \u00f8 \u00b6 \u00b4 {enter}","{shift} \u00e6 x \u00a9 v b \u00f1 \u00b5 \u00e7 > \u00bf {shift}","{accept} {alt} {space} {alt} {cancel}"],"alt-shift":["~ \u00b9 \u00b2 \u00b3 \u00a3 \u20ac \u00bc \u00bd \u00be \u2018 \u2019 \u00a5 \u00f7 {bksp}","{tab} \u00c4 \u00c5 \u00c9 \u00ae \u00de \u00dc \u00da \u00cd \u00d3 \u00d6 \u00ab \u00bb \u00a6", "\u00c4 \u00a7 \u00d0 F G H J K \u00d8 \u00b0 \u00a8 {enter}","{shift} \u00c6 X \u00a2 V B \u00d1 \u00b5 \u00c7 . \u00bf {shift}","{accept} {alt} {space} {alt} {cancel}"]},dvorak:{"default":["` 1 2 3 4 5 6 7 8 9 0 [ ] {bksp}","{tab} ' , . p y f g c r l / = \\","a o e u i d h t n s - {enter}","{shift} ; q j k x b m w v z {shift}","{accept} {space} {cancel}"],shift:["~ ! @ # $ % ^ & * ( ) { } {bksp}",'{tab} " < > P Y F G C R L ? + |',"A O E U I D H T N S _ {enter}","{shift} : Q J K X B M W V Z {shift}", "{accept} {space} {cancel}"]},num:{"default":"= ( ) {b};{clear} / * -;7 8 9 +;4 5 6 {sign};1 2 3 %;0 . {a} {c}".split(";")}};c.keyboard.defaultOptions={layout:"qwerty",customLayout:null,position:{of:null,my:"center top",at:"center top",at2:"center bottom"},usePreview:!0,alwaysOpen:!1,initialFocus:!0,stayOpen:!1,display:{a:"\u2714:Accept (Shift-Enter)",accept:"Accept:Accept (Shift-Enter)",alt:"Alt:\u2325 AltGr",b:"\u232b:Backspace",bksp:"Bksp:Backspace",c:"\u2716:Cancel (Esc)",cancel:"Cancel:Cancel (Esc)", clear:"C:Clear",combo:"\u00f6:Toggle Combo Keys",dec:".:Decimal",e:"\u23ce:Enter",empty:"\u00a0",enter:"Enter:Enter \u23ce",lock:"Lock:\u21ea Caps Lock",next:"Next \u21e8",prev:"\u21e6 Prev",s:"\u21e7:Shift",shift:"Shift:Shift",sign:"\u00b1:Change Sign",space:"&nbsp;:Space",t:"\u21e5:Tab",tab:"\u21e5 Tab:Tab"},wheelMessage:"Use mousewheel to see other keys",css:{input:"ui-widget-content ui-corner-all",container:"ui-widget-content ui-widget ui-corner-all ui-helper-clearfix",buttonDefault:"ui-state-default ui-corner-all", buttonHover:"ui-state-hover",buttonAction:"ui-state-active",buttonDisabled:"ui-state-disabled"},autoAccept:!1,lockInput:!1,restrictInput:!1,acceptValid:!1,cancelClose:!0,tabNavigation:!1,enterNavigation:!1,enterMod:"altKey",stopAtEnd:!0,appendLocally:!1,stickyShift:!0,preventPaste:!1,caretToEnd:!1,maxLength:!1,repeatDelay:500,repeatRate:20,resetDefault:!1,openOn:"focus",keyBinding:"mousedown touchstart",useCombos:!0,combos:{"`":{a:"\u00e0",A:"\u00c0",e:"\u00e8",E:"\u00c8",i:"\u00ec",I:"\u00cc",o:"\u00f2", O:"\u00d2",u:"\u00f9",U:"\u00d9",y:"\u1ef3",Y:"\u1ef2"},"'":{a:"\u00e1",A:"\u00c1",e:"\u00e9",E:"\u00c9",i:"\u00ed",I:"\u00cd",o:"\u00f3",O:"\u00d3",u:"\u00fa",U:"\u00da",y:"\u00fd",Y:"\u00dd"},'"':{a:"\u00e4",A:"\u00c4",e:"\u00eb",E:"\u00cb",i:"\u00ef",I:"\u00cf",o:"\u00f6",O:"\u00d6",u:"\u00fc",U:"\u00dc",y:"\u00ff",Y:"\u0178"},"^":{a:"\u00e2",A:"\u00c2",e:"\u00ea",E:"\u00ca",i:"\u00ee",I:"\u00ce",o:"\u00f4",O:"\u00d4",u:"\u00fb",U:"\u00db",y:"\u0177",Y:"\u0176"},"~":{a:"\u00e3",A:"\u00c3",e:"\u1ebd", E:"\u1ebc",i:"\u0129",I:"\u0128",o:"\u00f5",O:"\u00d5",u:"\u0169",U:"\u0168",y:"\u1ef9",Y:"\u1ef8",n:"\u00f1",N:"\u00d1"}},validate:function(){return!0}};c.keyboard.comboRegex=/([`\'~\^\"ao])([a-z])/mig;c.keyboard.currentKeyboard="";c.fn.keyboard=function(d){return this.each(function(){c(this).data("keyboard")||new c.keyboard(this,d)})};c.fn.getkeyboard=function(){return this.data("keyboard")}})(jQuery);

(function(c,d,m,a){c.fn.caret=function(c,b){if("undefined"===typeof this[0]||this.is(":hidden")||"hidden"===this.css("visibility"))return this;var j,h,l,g,f;f=document.selection;var k=this[0],s=k.scrollTop,n="undefined"!==typeof k.selectionStart;"number"===typeof c&&"number"===typeof b&&(h=c,g=b);if("undefined"!==typeof h)return n?(k.selectionStart=h,k.selectionEnd=g):(f=k.createTextRange(),f.collapse(!0),f.moveStart("character",h),f.moveEnd("character",g-h),f.select()),(this.is(":visible")||"hidden"!== this.css("visibility"))&&this.focus(),k.scrollTop=s,this;n?(j=k.selectionStart,l=k.selectionEnd):"TEXTAREA"===k.tagName?(g=this.val(),h=f[m](),f=h[a](),f.moveToElementText(k),f.setEndPoint("EndToEnd",h),j=f.text.replace(/\r/g,"\n")[d],l=j+h.text.replace(/\r/g,"\n")[d]):(g=this.val().replace(/\r/g,"\n"),h=f[m]()[a](),h.moveEnd("character",g[d]),j=""===h.text?g[d]:g.lastIndexOf(h.text),h=f[m]()[a](),h.moveStart("character",-g[d]),l=h.text[d]);f=(k.value||"").substring(j,l);return{start:j,end:l,text:f, replace:function(a){return k.value.substring(0,j)+a+k.value.substring(l,k.value[d])}}}})(jQuery,"length","createRange","duplicate");
