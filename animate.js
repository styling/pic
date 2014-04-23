var VG = {};

VG.$ = function(id) {
	return typeof id === "object" ? id : document.getElementById(id)
};

VG.$$ = function(tagName, oParent) {
	return (oParent || document).getElementsByTagName(tagName)
};

VG.$$$ = function(className, tagName, oParent) {
	var reg = new RegExp("(^|\\s)" + className + "(\\s|$)"),
		aEl = VG.$$(tagName || "*", oParent)
		len = aEl.length,
		aClass = [],
		i = 0;
	for(;i < len; i++) reg.test(aEl[i].className) && aClass.push(aEl[i]);
	return aClass
};

VG.index = function(element) {
	var aChild = element.parentNode.children;
	for(var i = aChild.length; i--;)
		if(element == aChild[i]) return i
};

VG.css = function(element, attr, value) {
	if(arguments.length == 2) {
		var style = element.style,
			currentStyle = element.currentStyle;
		if(typeof attr === "string")
			return parseFloat(currentStyle ? currentStyle[attr] : getComputedStyle(element, null)[attr])
		for(var property in attr)
			property == "opacity" ? (style.filter = "alpha(opacity=" + attr[property] + ")", style.opacity = attr[property] / 100) : style[property] = attr[property]		
	}
	else if(arguments.length == 3) {
		switch(attr) {
			case "width":
			case "height":
			case "paddingTop":
			case "paddingRight":
			case "paddingBottom":
			case "paddingLeft":
				value = Math.max(value, 0);
			case "top":
			case "right":
			case "bottom":
			case "left":
			case "marginTop":
			case "marginRigth":
			case "marginBottom":
			case "marginLeft":	
				element.style[attr] = value + "px";
				break;
			case "opacity":
				element.style.filter = "alpha(opacity=" + value + ")";
				element.style.opacity = value / 100;
				break;
			default:
				element.style[attr] = value
		}
	}
};

VG.attr = function(element, attr, value) {
	if(arguments.length == 2) {
		return element.attributes[attr] ? element.attributes[attr].nodeValue : undefined	
	}
	else if(arguments.length == 3) {
		element.setAttribute(attr, value)	
	}
};

VG.contains = function(element, oParent) {
	if(oParent.contains) {
		return oParent.contains(element)	
	}
	else if(oParent.compareDocumentPosition) {
		return !!(oParent.compareDocumentPosition(element) & 16)
	}
};

VG.isParent = function(element, tagName) {
	while(element != undefined && element != null && element.tagName.toUpperCase() !== "BODY") {
		if(element.tagName.toUpperCase() == tagName.toUpperCase())
			return true;
		element = element.parentNode;	
	}
	return false
};

VG.extend = function(destination, source) {
	for (var property in source) destination[property] = source[property];
	return destination
};

VG.ajax = function(config) {
	var oAjax = null,
	config = VG.extend({
		cache: !0,
		param: "",
		type: "GET",
		success: function() {}
	},
	config);
	config.url += config.param && "?" + config.param;
	if (config.cache === !1) {
		var timestamp = (new Date).getTime(),
		re = config.url.replace(/([?&])_=[^&]*/, "$1_=" + timestamp);
		config.url = re + (config.url === re ? (/\?/.test(config.url) ? "&": "?") + "_=" + timestamp: "")
	}
	oAjax = window.XMLHttpRequest ? new XMLHttpRequest: new ActiveXObject("Microsoft.XMLHTTP");
	oAjax.onreadystatechange = function() {
		oAjax.readyState === 4 && oAjax.status === 200 && config.success(oAjax.responseText)
	};
	oAjax.open(config.type, config.url, !0);
	config.type.toUpperCase() === "POST" && oAjax.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	oAjax.send(config.type.toUpperCase() === "POST" && config.param || null)
};

VG.animate = function(obj, json, opt) {
	clearInterval(obj.timer);
	obj.iSpeed = 0;
	opt = VG.extend({
		type: "buffer",
		callback: function() {}
	}, opt);
	obj.timer = setInterval(function() {
		var iCur = 0,
			complete = !0,
			property = null,
			maxSpeed = 30;
		for(property in json) {
			iCur = VG.css(obj, property);
			property == "opacity" && (iCur = parseInt(iCur.toFixed(2) * 100));
			switch(opt.type) {
				case "buffer":
					obj.iSpeed = (json[property] - iCur) / 5;
					obj.iSpeed = obj.iSpeed > 0 ? Math.ceil(obj.iSpeed) : Math.floor(obj.iSpeed);
					json[property] == iCur || (complete = !1, VG.css(obj, property, property == "zIndex" ? iCur + obj.iSpeed || iCur * -1 : iCur + obj.iSpeed));
					break;
				case "flex":
					obj.iSpeed += (json[property] - iCur) / 5;
					obj.iSpeed *= 0.7;
					obj.iSpeed = Math.abs(obj.iSpeed) > maxSpeed ? obj.iSpeed > 0 ? maxSpeed : -maxSpeed : obj.iSpeed;
					Math.abs(json[property] - iCur) <=1 && Math.abs(obj.iSpeed) <= 1 || (complete = !1, VG.css(obj, property, iCur + obj.iSpeed));
					break;	
			}
		}
		if(complete) {
			clearInterval(obj.timer);
			if(opt.type == "flex") for(property in json) VG.css(obj, property, json[property]);
			opt.callback.apply(obj, arguments);	
		}		
	}, 30)	
};

function complete() {
	var oBox = VG.$("box"),
		oLeft = VG.$("left"),
		oTools = VG.$("tools"),
		oPhoto = null,
		oGlass = null,
		oNormal = VG.$$$("normal")[0],
		oActive = VG.$$$("active")[0],
		oContent = VG.$$$("content")[0],
		oRight = VG.$("right"),
		oLMask = VG.$$$("mask", "div", oLeft)[0],
		oRMask = VG.$$$("mask", "div", oRight)[0],
		oGlassList = VG.$$$("glassList")[0],
		zIndex = 0;

	//事件委托
	oBox.onclick = function(e) {
		e = e || event;
		var oTarget = e.target || e.srcElement;

		//筛选
		(function() {
			if(oTarget.tagName.toUpperCase() === "A" && VG.contains(oTarget, oNormal)) {
				var oUl = VG.$$("ul", oActive)[0],
					iW = oActive.offsetWidth,	
					iL = oTarget.parentNode.offsetLeft - VG.css(oActive, "marginLeft"),				
					maxH = VG.css(oActive, "height"),
					minH = VG.css(oActive, "lineHeight");
				VG.animate(oActive, {height:minH}, {
					callback: function() {
						VG.animate(oUl, {left:-iL});
						VG.animate(oActive, {left:iL}, {
							callback: function() {
								VG.animate(oActive, {height:maxH}, {
									callback: function() {
										var i = 0,
											aLi = VG.$$("li", oContent),
											sType = VG.attr(oTarget, "data-type"),
											aType = function() {
												if(sType === "*") {
													for(var i = aLi.length, a = []; i--;) a[i] = i;
													return a	
												}
												return sType.split(",")
											}();
										for(i = aLi.length; i--;) VG.css(aLi[i], {opacity:20}), aLi[i].className = "hidden";
										for(i = aType.length; i--;) VG.animate(aLi[aType[i]], {opacity:100}), aLi[aType[i]].className = "active"
									}	
								})	
							}	
						})	
					}	
				})	
			}			
		})();
		
		//模特选择
		if(oTarget.tagName.toUpperCase() === "IMG" && oTarget.parentNode.className !== "hidden" && VG.contains(oTarget, oContent)) {
			VG.animate(oLMask, {opacity:100, zIndex:1}, {
				callback: function() {
					oPhoto = document.createElement("img");
					oPhoto.src = oTarget.src.replace("model", "big");
					oPhoto.className = "photo";
					oLeft.insertBefore(oPhoto, oLMask);
					VG.animate(oPhoto, {width:428, height:526, top:0, left:0}, {
						callback: function() {
							VG.animate(oTools, {top:8, left:385}, {
								callback: function() {
									VG.animate(oRMask, {opacity:0, zIndex:-1})	
								}	
							})	
						}	
					})
				}	
			})	
		}
		
		//工具条
		(function() {
			var count = 0;
			switch(oTarget.className) {
				case "open":
					oTarget.className = "close";
					oTarget.innerHTML = "\u5c55\u5f00";
					VG.animate(oTools, {height:33});
					break;
				case "close":
					oTarget.className = "open";
					oTarget.innerHTML = "\u6536\u7f29";
					VG.animate(oTools, {height:173});
					break;
				case "reset":
					oGlass && oGlass.parentNode.removeChild(oGlass), oGlass = null;
					VG.animate(oRMask, {opacity:70, zIndex:++zIndex});
					VG.animate(oPhoto, {left:-530}, {
						callback: function() {
							this.parentNode.removeChild(this);
							++count == 2 && VG.animate(oLMask, {opacity:0, zIndex:-1})	
						}	
					});
					VG.animate(oTools, {top:-30, left:-55}, {
						callback: function() {
							++count == 2 && VG.animate(oLMask, {opacity:0, zIndex:-1})	
						}	
					});
					break;
			}			
		})();

		//眼镜选择
		(function() {
			var oImg = null,
				aLI = null,
				i = 0;
			if(VG.contains(oTarget, oGlassList) && VG.isParent(oTarget, "li")) {
				for(aLi = VG.$$("li", oGlassList), i = aLi.length; i--;) aLi[i].className = "";
				oGlass && oGlass.parentNode.removeChild(oGlass), oGlass = null;
				oGlass = document.createElement("div");
				oImg = document.createElement("img");
				oImg.src = function() {
					switch(oTarget.tagName.toUpperCase()) {
						case "IMG":
							oTarget.parentNode.className = "current";
							return oTarget.src.replace(".jpg", ".png");
							break;
						case "LI":
							oTarget.className = "current";
							return VG.$$("img", oTarget)[0].src.replace(".jpg", ".png");
							break;
						default:
							oTarget.parentNode.className = "current";
							return VG.$$("img", oTarget.parentNode)[0].src.replace(".jpg", ".png")
					}	
				}();
				oGlass.className = "glass";
				oGlass.appendChild(oImg);
				oLeft.insertBefore(oGlass, oPhoto);
				
				//眼镜拖动
				oGlass.onmousedown = function(e) {
					e = e || event;
					var disX = e.clientX - this.offsetLeft;
					var disY = e.clientY - this.offsetTop;
					document.onmousemove = function(e) {
						e = e || event;
						var iL = e.clientX - disX;
						var iT = e.clientY - disY;
						var maxL = oPhoto.offsetWidth - oGlass.offsetWidth;
						var maxT = oPhoto.offsetHeight - oGlass.offsetHeight;
						iL < 0 && (iL = 0);
						iT < 0 && (iT = 0);
						iL > maxL && (iL = maxL);
						iT > maxT && (iT = maxT);
						VG.css(oGlass, {top:iT + "px", left: iL + "px"});
						return false
					};
					document.onmouseup = function() {
						this.onmouseup = null;
						this.onmousemove = null;	
						oGlass.releaseCapture && oGlass.releaseCapture()
					}
					this.setCapture && this.setCapture();
					return false
				};
			}			
		})();
			
		//模拟select
		(function() {
			var oSearch = VG.$$$("search")[0],
				aUl = VG.$$("ul", oSearch),
				oUl = null,
				aLi = null,
				oSelect = null,
				param = "",
				i = 0;
			switch(oTarget.className) {
				case "select":
					for(i = aUl.length; i--;) VG.css(aUl[i], {display:"none"});
					oUl = VG.$$("ul", oTarget.parentNode)[0];
					VG.css(oUl, {display:"block"});
					VG.css(oTarget.parentNode, {zIndex:++zIndex});
					document.onclick = function() {						
						this.onclick = null;
						VG.css(oUl, {display:"none"})
					};
					e.cancelBubble = true;				
					break;
				case "btn":
					param = VG.attr(VG.$$$("selectWrap")[0], "data-param");
					if(param == undefined) {
						alert("请选择品牌！")
					}
					else {
						oGlassList.innerHTML = "";
						VG.ajax({
							url: "data.asp?code=" + param,
							cache: !1,
							success: function(data) {
								oGlassList.innerHTML = data;
							}	
						})
					}
					break;
				default:
					if(oTarget.tagName.toUpperCase() == "A" && VG.contains(oTarget, oSearch) && VG.isParent(oTarget, "LI")) {
						aLi = VG.$$("li", oTarget.parentNode.parentNode);
						for(i = aLi.length; i--;) aLi[i].className = "";
						oTarget.parentNode.className = "current";
						oSelect = VG.$$$("select", "a" ,oTarget.parentNode.parentNode.parentNode)[0];
						oSelect.innerHTML = oTarget.innerHTML;
						VG.attr(oSelect.parentNode, "data-param", VG.index(oTarget.parentNode))
					}					
			}
		})()					
	}//事件委托结束
}