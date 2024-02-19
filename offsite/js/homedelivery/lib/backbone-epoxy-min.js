// Backbone.Epoxy 1.0.2
// (c) 2013 Greg MacWilliam
// Freely distributed under the MIT license
// http://epoxyjs.org
(function(t,e){var n="backbone",i="underscore";"undefined"!=typeof exports?module.exports=e(require(i),require(n)):"function"==typeof define&&define.amd?define([i,n],e):e(t._,t.Backbone)})(this,function(t,e){function n(t){return function(e,n,i){return t.prototype[n].apply(e,i)}}function i(e,n,r,o){for(var s in n)if(n.hasOwnProperty(s)){var u=n[s];if(e.hasComputed(s)){if(o.length&&!(0>t.indexOf(o,s)))throw"Recursive setter: "+o.join(" > ");u=e.c()[s].set(u),u&&w(u)&&(r=i(e,u,r,o.concat(s)))}else r[s]=u}return r}function r(e,n,i,r){i=i||{},i.get&&b(i.get)&&(i._get=i.get),i.set&&b(i.set)&&(i._set=i.set),delete i.get,delete i.set,t.extend(this,i),this.model=e,this.name=n,this.deps=this.deps||[],r||this.init()}function o(e){return b(e)?e():(w(e)&&(e=t.clone(e),t.each(e,function(t,n){e[n]=o(t)})),e)}function s(t){return b(t)?{set:t}:t}function u(e){return function(){var n=arguments,i=b(e)?e:e.get,r=e.set;return function(e){return y(e)?i.apply(this,t.map(n,o)):n[0]((r?r:i).call(this,e))}}}function c(e,n,i,r,o){return(e=t.result(e,r))?(x(e)?(o=o?o+"_":"",n["$"+r]=function(){return F&&F.push([e,"change"]),e},t.each(e.toJSON({computed:!0}),function(t,r){n[o+r]=function(t){return a(e,r,t,i)}})):C(e)&&(n["$"+r]=function(){return F&&F.push([e,"reset add remove sort update"]),e}),e):void 0}function a(t,e,n,i){if(F&&F.push([t,"change:"+e]),!y(n)){if(!w(n)||_(n)){var r=n;(n={})[e]=r}return i&&i.save?t.save(n,i):t.set(n,i)}return t.get(e)}function l(t,e){if(":el"===e)return t.$el;var n=t.$(e);return t.$el.is(e)&&(n=n.add(t.$el)),n}function h(e,n,i,r,o,s){try{var u=M[i]||(M[i]=Function("$f","$c","with($f){with($c){return{"+i+"}}}")),c=u(s,r)}catch(a){throw'Error parsing bindings: "'+i+'"\n>> '+a}var l=t.map(t.union(c.events||[],["change"]),function(t){return t+".epoxy"}).join(" ");t.each(c,function(t,i){o.hasOwnProperty(i)&&e.b().push(new p(n,o[i],t,l,r,c))})}function f(t,e,n,i){if(e.callee.caller&&e.callee.caller.id===n)throw"Recursive access error: "+n;return t&&t.hasOwnProperty(n)?y(i)?o(t[n]):t[n](i):void 0}function d(t,e){var n=[];if(e&&t)for(var i=0,r=e.length;r>i;i++)n.push(e[i]in t?t[e[i]]():null);return n}function p(e,n,i,r,s,u){var c=this,a=e[0].tagName.toLowerCase(),l="input"==a||"select"==a||"textarea"==a||"true"==e.prop("contenteditable"),h=[],f=function(t){c.set(c.$el,o(i),t)};if(c.$el=e,c.evt=r,t.extend(c,n),i=c.init(c.$el,o(i),s,u)||i,F=h,f(),F=null,l&&n.get&&b(i)&&c.$el.on(r,function(t){i(c.get(c.$el,o(i),t))}),h.length)for(var d=0,p=h.length;p>d;d++)c.listenTo(h[d][0],h[d][1],f)}var g,v=e.Epoxy={},m=Array.prototype,y=t.isUndefined,b=t.isFunction,w=t.isObject,_=t.isArray,x=function(t){return t instanceof e.Model},C=function(t){return t instanceof e.Collection},O=function(){},k={mixin:function(t){t=t||{};for(var e in this.prototype)this.prototype.hasOwnProperty(e)&&"constructor"!==e&&(t[e]=this.prototype[e]);return t}},B=n(e.Model),P=["computeds"];v.Model=e.Model.extend({constructor:function(e,n){t.extend(this,t.pick(n||{},P)),B(this,"constructor",arguments),this.initComputeds()},getCopy:function(e){return t.clone(this.get(e))},get:function(t){return g&&g.push(["change:"+t,this]),this.hasComputed(t)?this.c()[t].get():B(this,"get",arguments)},set:function(t,e,n){var r=t;return r&&!w(r)?(r={},r[t]=e):n=e,n=n||{},n.unset||(r=i(this,r,{},[])),B(this,"set",[r,n])},toJSON:function(e){var n=B(this,"toJSON",arguments);return e&&e.computed&&t.each(this.c(),function(t,e){n[e]=t.value}),n},destroy:function(){return this.clearComputeds(),B(this,"destroy",arguments)},c:function(){return this._c||(this._c={})},initComputeds:function(){this.clearComputeds(),t.each(t.result(this,"computeds")||{},function(t,e){t._init=1,this.addComputed(e,t)},this),t.invoke(this.c(),"init")},addComputed:function(t,e,n){this.removeComputed(t);var i=e,o=i._init;if(b(e)){var s=2;i={},i._get=e,b(n)&&(i._set=n,s++),i.deps=m.slice.call(arguments,s)}return this.c()[t]=new r(this,t,i,o),this},hasComputed:function(t){return this.c().hasOwnProperty(t)},removeComputed:function(t){return this.hasComputed(t)&&(this.c()[t].dispose(),delete this.c()[t]),this},clearComputeds:function(){for(var t in this.c())this.removeComputed(t);return this},modifyArray:function(t,e){var n=this.get(t);if(_(n)&&b(m[e])){var i=m.slice.call(arguments,2),r=m[e].apply(n,i);return this.trigger("change change:"+t),r}return null},modifyObject:function(t,e,n){var i=this.get(t),r=!1;return w(i)?(y(n)&&i.hasOwnProperty(e)?(delete i[e],r=!0):i[e]!==n&&(i[e]=n,r=!0),r&&this.trigger("change change:"+t),i):null}},k),t.extend(r.prototype,e.Events,{init:function(){var e={},n=g=[];this.get(!0),g=null,n.length&&(t.each(n,function(n){var i=n[0],r=n[1];e[i]?t.contains(e[i],r)||e[i].push(r):e[i]=[r]}),t.each(e,function(e,n){for(var i=0,r=e.length;r>i;i++)this.listenTo(e[i],n,t.bind(this.get,this,!0))},this))},val:function(t){return this.model.get(t)},get:function(e){if(e===!0&&this._get){var n=this._get.apply(this.model,t.map(this.deps,this.val,this));this.change(n)}return this.value},set:function(t){if(this._get){if(this._set)return this._set.apply(this.model,arguments);throw"Cannot set read-only computed attribute."}return this.change(t),null},change:function(e){t.isEqual(e,this.value)||(this.value=e,this.model.trigger("change:"+this.name+" change",this.model))},dispose:function(){this.stopListening(),this.off(),this.model=this.value=null}});var E={optionText:"label",optionValue:"value"},M={},S={attr:s(function(t,e){t.attr(e)}),checked:s({get:function(e,n){var i=!!e.prop("checked"),r=e.val();if(this.isRadio(e))return r;if(_(n)){n=n.slice();var o=t.indexOf(n,r);return i&&0>o?n.push(r):!i&&o>-1&&n.splice(o,1),n}return i},set:function(e,n){var i=!!n;this.isRadio(e)?i=n==e.val():_(n)&&(i=t.contains(n,e.val())),e.prop("checked",i)},isRadio:function(t){return"radio"===t.attr("type").toLowerCase()}}),classes:s(function(e,n){t.each(n,function(t,n){e.toggleClass(n,!!t)})}),collection:s({init:function(t,e){if(!C(e)||!b(e.view))throw'Binding "collection" requires a Collection with a "view" constructor.';this.v={}},set:function(e,n,i){var r,o=this.v,s=n.models,u=F;if(F=null,i=i||n,x(i))if(o.hasOwnProperty(i.cid))o[i.cid].remove(),delete o[i.cid];else{o[i.cid]=r=new n.view({model:i});var c=t.indexOf(s,i),a=e.children();a.length>c?a.eq(c).before(r.$el):e.append(r.$el)}else if(C(i)){var l=s.length===t.size(o)&&n.every(function(t){return o.hasOwnProperty(t.cid)});e.hide(),l?n.each(function(t){e.append(o[t.cid].$el)}):(this.clean(),n.each(function(t){o[t.cid]=r=new n.view({model:t}),e.append(r.$el)})),e.show()}F=u},clean:function(){for(var t in this.v)this.v.hasOwnProperty(t)&&(this.v[t].remove(),delete this.v[t])}}),css:s(function(t,e){t.css(e)}),disabled:s(function(t,e){t.prop("disabled",!!e)}),enabled:s(function(t,e){t.prop("disabled",!e)}),html:s(function(t,e){t.html(e)}),options:s({init:function(t,e,n,i){this.e=i.optionsEmpty,this.d=i.optionsDefault,this.v=i.value},set:function(e,n){var i=this,r=o(i.e),s=o(i.d),u=o(i.v),c=_(u)?u:[u],a=C(n)?n.models:n,l=a.length,h=!0,f="";l||s||!r?(s&&(a=[s].concat(a)),t.each(a,function(t){f+=i.opt(t,l,c)})):(f+=i.opt(r,l,c),h=!1),e.html(f).prop("disabled",!h);var d=e.val();i.v&&!t.isEqual(u,d)&&i.v(d)},opt:function(e,n,i){var r=e,o=e,s=E.optionText,u=E.optionValue;w(e)&&(r=x(e)?e.get(s):e[s],o=x(e)?e.get(u):e[u]);var c=!n||t.contains(i,o)?'" selected="selected">':'">';return'<option value="'+o+c+r+"</option>"},clean:function(){this.d=this.e=this.v=0}}),template:s({init:function(e,n,i){var r=e.find("script,template");return this.t=t.template(r.length?r.html():e.html()),_(n)?t.pick(i,n):void 0},set:function(t,e){e=x(e)?e.toJSON({computed:!0}):e,t.html(this.t(e))},clean:function(){this.t=null}}),text:s(function(t,e){t.text(e)}),toggle:s(function(t,e){t.toggle(!!e)}),value:s({get:function(t){return t.val()},set:function(t,e){try{t.val()!=e&&t.val(e)}catch(n){}}})},q={all:u(function(){for(var t=arguments,e=0,n=t.length;n>e;e++)if(!t[e])return!1;return!0}),any:u(function(){for(var t=arguments,e=0,n=t.length;n>e;e++)if(t[e])return!0;return!1}),length:u(function(t){return t.length||0}),none:u(function(){for(var t=arguments,e=0,n=t.length;n>e;e++)if(t[e])return!1;return!0}),not:u(function(t){return!t}),format:u(function(t){for(var e=arguments,n=1,i=e.length;i>n;n++)t=t.replace(RegExp("\\$"+n,"g"),e[n]);return t}),select:u(function(t,e,n){return t?e:n}),csv:u({get:function(t){return t+="",t?t.split(","):[]},set:function(t){return _(t)?t.join(","):t}}),integer:u(function(t){return t?parseInt(t,10):0}),decimal:u(function(t){return t?parseFloat(t):0})};v.binding={addHandler:function(t,e){S[t]=s(e)},addFilter:function(t,e){q[t]=u(e)},config:function(e){t.extend(E,e)},emptyCache:function(){M={}}};var F,R=n(e.View),j=["viewModel","bindings","bindingFilters","bindingHandlers","bindingSources","computeds"];return v.View=e.View.extend({constructor:function(e){t.extend(this,t.pick(e||{},j)),R(this,"constructor",arguments),this.applyBindings()},b:function(){return this._b||(this._b=[])},bindings:"data-bind",setterOptions:null,applyBindings:function(){this.removeBindings();var e=this,n=t.clone(t.result(e,"bindingSources")),i=e.bindings,r=e.setterOptions,o=t.clone(S),a=t.clone(q),f=e._c={};t.each(t.result(e,"bindingHandlers")||{},function(t,e){o[e]=s(t)}),t.each(t.result(e,"bindingFilters")||{},function(t,e){a[e]=u(t)}),e.model=c(e,f,r,"model"),e.viewModel=c(e,f,r,"viewModel"),e.collection=c(e,f,r,"collection"),n&&(t.each(n,function(t,e){n[e]=c(n,f,r,e,e)}),e.bindingSources=n),t.each(t.result(e,"computeds")||{},function(t,n){var i=b(t)?t:t.get,r=t.set,o=t.deps;i.id=n,f[n]=function(t){return!y(t)&&r?r.call(e,t):i.apply(e,d(e._c,o))}}),w(i)?t.each(i,function(t,n){var i=l(e,n);i.length&&h(e,i,t,f,o,a)}):l(e,"["+i+"]").each(function(){var t=$(this);h(e,t,t.attr(i),f,o,a)})},getBinding:function(t){return f(this._c,arguments,t)},setBinding:function(t,e){return f(this._c,arguments,t,e)},removeBindings:function(){if(this._c=null,this._b)for(;this._b.length;)this._b.pop().dispose()},remove:function(){this.removeBindings(),R(this,"remove",arguments)}},k),t.extend(p.prototype,e.Events,{init:O,get:O,set:O,clean:O,dispose:function(){this.clean(),this.stopListening(),this.$el.off(this.evt),this.$el=null}}),v});
//@ sourceMappingURL=backbone.epoxy.min.map