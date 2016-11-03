(function() {


	// selector是 选择器 或者 html字符串
	var wLibory = function(selector, context) {
		
		return new wLibory.fn.init(selector, context);
	};

	// 核型原型
	wLibory.fn = wLibory.prototype = {
		constructor: wLibory,
		init: function(selector, context) {
			// 不合法值
			if(!selector) {
				return this;
			}

			// 字符串的判断
			else if( wLibory.isString(selector) ) {
				if(selector.charAt(0) !== "<") {
					// 选择器
					[].push.apply(this, select(selector, context));
					// 设置 selector属性的值，因为此时，是通过选择器获取到的元素
					this.selector = selector;
				} else {
					// 创建DOM元素
					[].push.apply( this, parseHTML(selector) );
				}
			}

			// DOM对象
			// nodeType 来判断
			else if( wLibory.isDOM(selector) ) {
				// 要将这一个DOM对象添加到this中
				this[0] = selector;
				this.length = 1;
			}

			// wLibory对象
			else if( wLibory.iswLibory(selector) ) {
				return selector;
			}

			// 函数
			else if( wLibory.isFunction(selector) ) {

				// 入口函数
				if(window.addEventListener) {
					window.addEventListener("load", selector);
				} else {
					window.attachEvent("onload", selector);
					// 了解
					// eventList.push(selector);
				}
				
			}

			// DOM数组
			else if( wLibory.isArrayLike(selector) ) {
				// selector 是一个数组
				[].push.apply( this, selector );
			}

			return this;

		},

		selector: "" // 用来判断是不是wLibory类型的对象
	};

	// 修改原型链的指向
	wLibory.fn.init.prototype = wLibory.prototype;

	// 实现将HTML字符串转化为DOM数组的方法
	var parseHTML = function(html) {
		var tempDiv = null,
			arr = [],
			cNodes = null,
			i = 0;

		tempDiv = document.createElement("div");
		tempDiv.innerHTML = html;

		cNodes = tempDiv.childNodes;

		for(i = 0; i < cNodes.length; i++) {
			arr.push(cNodes[i]);
		}

		// 将放有 创建出来的DOM对象的数组 返回
		return arr;
	};


	// 要给框架提供一个扩展功能的方法
	// 将给静态成员和实例成员添加 extend 方法的逻辑合并到一起！
	wLibory.extend = wLibory.fn.extend = function(obj) {
		var k;
		for(k in obj) {
			this[k] = obj[k];
		}
	};

	// 提供静态方法 each 的实现
	wLibory.extend({
		// 判断伪数组的方式：length && length >= 0
		each: function(obj, callback) {
			var i, length;

			// 如果直接判断 obj.length ，如果length为0，会造成判断失败
			// if(obj.length && obj.length >= 0) {
			
			// 1
			// 首先保证 obj 不是null/undefined等
			// 再保证值 >= 0 即可！
			// if( obj && obj.length >= 0) {  

		 	// 2
			// 判断只要有 length属性，属性的值>=0即可！
			// if( ("length" in obj) && obj.length >= 0) {
			if( wLibory.isArrayLike(obj) ) {
				// 遍历数组或伪数组
				for(i = 0, length = obj.length; i < length; i++) {
					if( callback.call(obj[i], i, obj[i]) === false ) {
						break;
					}
				}
			} else {
				// 遍历对象
				for(i in obj) {
					if( callback.call(obj[i], i, obj[i]) === false ) {
						break;
					}
				}
			}

			// 直接返回第一个参数
			return obj;
		}
	});

	wLibory.extend({
		myTrim: function(str) {
			// 判断是否兼容trim方法
			if(String.prototype.trim) {
				return str.trim();
			}
			return str.replace(/^\s+|\s+$/g, "");
		}
	});

	// 添加实例方法each
	wLibory.fn.extend({
		each: function(callback) {
			// this 是谁？？ 谁调用的这个each方法，this就是谁
			// 直接调用 wLibory.each 这个静态方法
			/*wLibory.each(this, callback);

			return this;*/
			// wLibory.each 返回的是：each方法的第一个参数
			// 在这次调用中，相当于把 this 给返回
			// 
			// this 是谁？对于 wLibory("div").each这种调用方式来说
			// each方法内部的this 就是调用each方法的对象 ，也就是：wLibory("div")
			return wLibory.each(this, callback);
		}
	});

	// 类型判断模块
	// 因为类型判断模块的功能 与实例没有关系
	// 是一些工具型函数，所以，给wLibory函数来扩展！
	wLibory.extend({
		isString: function(obj) {
			// 判断是不是string
			return typeof obj === "string";
		},
		isDOM: function(obj) {
			// 判断是不是DOM对象
			return !!obj.nodeType;
		},
		iswLibory: function(obj) {
			// 判断是不是wLibory对象
			return "selector" in obj;
		},
		isArrayLike: function(obj) {
			// 判断是不是伪数组
			return "length" in obj && obj.length >= 0;
		},
		isFunction: function(obj) {
			// 判断是不是函数
			return typeof obj === "function";
		}
	});


	// 用来获取指定DOM对象的下一个元素节点
	// 参数：就是获取下一个元素节点 DOM对象
	var getNextElement = function(node) {
		while( (node = node.nextSibling) !== null ) {
			if(node.nodeType === 1) {
				return node;
			}
		}

		// 如果没有找到元素节点，就返回 null
		return null;
	};

	// 作用：用来获取指定元素后面的所有元素几点
	var getNextAllEelments = function(node) {
		// 接受获取到的所有的 元素节点
		var retArr = [];

		while(node = node.nextSibling) {
			if(node.nodeType === 1) {
				retArr.push(node);
			}
		}

		return retArr;
	};
	
	// DOM操作模块
	wLibory.fn.extend({
		appendTo: function(selector) {
			// 找到数据源 和 目标元素
			// 将 elements 属性去掉！
			var srcElements = this,	// 数据源
				tarElements = wLibory(selector),  // 目标元素
				length = tarElements.length;	// 目标元素的个数

			// 用来存储获取的DOM对象（包含this，以及克隆出来的元素）
			var tempArr = [], 
				tempNode = null;	// 临时变量用来存储克隆出来的元素

			tarElements.each(function(i, v) {
				// srcElements也是一个itast对象
				srcElements.each(function() {
					tempNode = (i ===  length - 1)? this: this.cloneNode(true);
					v.appendChild(tempNode);
					// 将克隆出来的元素（或者this本身）追加到 数组中
					tempArr.push(tempNode);
				});
			});


			// 实现链式编程
			// 返回的是：包含了this以及克隆出来的元素
			// 需要将数组转化为 wLibory对象，再返回！
			return wLibory(tempArr);
		},
		append: function(selector) {
			// 数据元素：selector对应的DOM对象集合
			// 目标元素：this

			// wLibory(selector) 是selelctor参数对应的DOM对象
			// this 就是wLibory对象
			wLibory(selector).appendTo(this);

			// 实现链式编程
			return this;
		},
		prependTo: function(selector) {
			// 数据源： this
			// 目标元素： wLibory(selector)
			var srcElements = this,
				tarElements = wLibory(selector),
				tarLength = tarElements.length;

			var tempArr = [],
				tempNode = null;


			// 怎么获取到每次插入的父元素
			tarElements.each(function(i, v) {
				// 因为如果每次都获取 v.firstChild ，在插入新元素之后，
				// 在获取，就会获取到新插入的元素，此时，会导致 插入顺序颠倒的问题！
				// 解决：先保存被插入元素的第一个子元素
				var refNode = v.firstChild;
				// v 就是要被插入的元素
				srcElements.each(function() {
					// 当前元素：this
					// v.firstChild 表示：v这个元素的第一个子元素
					tempNode = (i === tarLength - 1) ? this: this.cloneNode(true);
					v.insertBefore(tempNode, refNode);
					tempArr.push(tempNode);
				});
			});

			// 实现链式编程效果
			return wLibory(tempArr);
		},
		prepend: function(selector) {
			// 数据源： selector 对应的元素
			// 目标对象： this
			wLibory(selector).prependTo( this );

			return this;
		},
		nextAll: function() {
			// 用来存储获取到的所有元素节点
			var tempArr = [],
				// 用来存储每一个DOM对象后面的元素节点
				tempNodes = null;
			// 获取每一个DOM对象后面的所有元素节点
			this.each(function() {
				// 因为 getNextAllEelments 返回值是一个数组
				// 所以，需要将多次获取到的数组，进行合并
				tempNodes = getNextAllEelments(this);

				// 将当前tempArr中的元素，与本次获取到的结果进行合并
				tempArr = tempArr.concat(tempNodes);
			});

			// 返回获取到的所有元素
			return wLibory(tempArr);
		},
		next: function() {
			// 用来存储每个DOM对象的下一个节点
			var tempArr = [],
				temp = null;

			// 找谁的下一个元素节点？？
			// this
			// this 可能是包含多个DOM对象
			this.each(function() {
				temp = getNextElement(this);
				if( temp !== null ) {
					tempArr.push(temp);
				}
			});

			return wLibory(tempArr);
		}
	});

	var bindEventList = [];

	// 事件绑定模块
	wLibory.fn.extend({
		on: function(eventName, handler) {
			this.each(function() {
				// this 通过wLibory函数获取到的表示每一个DOM对象
				var self = this;
				// 实现 on 方法，用来绑定事件！
				if (window.addEventListener) {
					this.addEventListener(eventName, handler);
				} else if(window.attachEvent) {
					// this.attachEvent("on" + eventName, function(event) {
					// 	// 处理 this 的指向 和 事件对象
					// 	handler.call(self, event);
					// });
					var fn = function(event) {
						// 处理 this 的指向 和 事件对象
						handler.call(self, event);
					};

					this.attachEvent("on" + eventName, fn);
					bindEventList.push(fn);
				} else {
					var oldHandler = this["on" + eventName];
					if(typeof oldHandler !== "function") {
						// 处理 this 的指向 和 事件对象
						this["on" + eventName] = function(event) {
							event = event || window.event;
							handler.call(self, event);
						};
					} else {
						// 处理 this 的指向 和 事件对象
						this["on" + eventName] = function(event) {
							event = event || window.event;
							// oldHandler(event);
							// handler(event);
							oldHandler.call(self, event);
							handler.call(self, event);
						};
					}
				}
			});

			return this;
		},
		
		off: function(eventName, handler) {
			// removeEventListener
			// detachEvent
			this.each(function() {
				if(window.removeEventListener) {
					this.removeEventListener(eventName, handler);
				} else if(window.detachEvent) {
					// 原因：绑定事件 与 解绑事件不是同一个事件！
					// 思路：绑定事件的时候，需要将绑定的事件存储起来
					// 然后，在解绑事件的时候，通过存储起来的事件，进行解绑！
					// this.detachEvent("on" + eventName, handler);
					for(var i = 0; i < bindEventList.length; i++) {
						this.detachEvent("on" + eventName,  bindEventList[i]);
					}
				} else {
					this["on" + eventName] = null;
				}
			});

			return this;
		}
	});

	// 获取所有事件
	var eventNameList = ("click dblclick mouseenter mouseleave mouseover mouseout " +
					"mousedown mouseup mousemove " +
				  	"keydown keypress keyup " +
			  		"focus blur change " +
				  	"load scroll resize").split(" ");
	
	// 遍历所有的事件，通过on方法来实现给框架添加所有的事件
	wLibory.each(eventNameList, function(i, v) {
		// wLibory.fn["click"] = function() {}
		// wLibory.fn["mouseenter"] = function() {}
		wLibory.fn[v] = function(handler) {
			this.on(v, handler);
			return this;
		};
	});


	// 样式操作模块
	wLibory.fn.extend({
		removeClass: function(name) {
			// 因为获取到的元素可能有多个，所以，需要循环遍历来移除类
			this.each(function() {
				var clsName = " " + this.className + " ";
				clsName = wLibory.myTrim( clsName.replace(" " + name + " ", " ") );
				this.className = clsName;
			});

			return this;
		},
		addClass: function(name) {
			this.each(function() {
				// this.className = name;
				// 1 把现有的类先取出来
				// 2 在添加
				// 
				// 判断当前元素中有没有指定的类，如果有了，就不再处理
				// 如果没有，在添加！
				if(!wLibory(this).hasClass(name)) {
					var clsName = this.className;
					clsName += " " + name;
					// 在设置className属性之前，先去除两端空格，然后再设置！
					this.className = wLibory.myTrim(clsName);
				}
				
			});

			// 支持链式编程！
			return this;
		},
		hasClass: function(name) {
			// 记录有没有类
			var has = false;

			this.each(function() {
				// 怎么判断当前DOM对象有没有指定的类？？
				// this ===> 当前的DOM对象
				// 1 获取到类名 然后split，在循环遍历
				// 2 使用indexOf
				if( (" " + this.className + " ").indexOf(" " + name + " ") > -1 ) {
					has = true;

					// 作用：停止当前的循环
					// 因为有一个类满足指定的类，所以，后续的判断就没有必要！
					return false;
				}
			});

			return has;
		},
		toggleClass: function(name) {
			// 如果有就移除，如果没有就添加
			// 因为 hasClass 方法判断的是所有元素中只要有一个额元素中具有指定的类名
			// 就返回：true。应该需要使用each进行循环，分别进行判断
			// if(this.hasClass(name)) {
			// 	this.removeClass(name);
			// } else {
			// 	this.addClass(name);
			// }

			return this.each(function() {
				// iObj 是一个wLibory对象
				var iObj = wLibory(this);

				if( iObj.hasClass(name) ) {
					iObj.removeClass(name);
				} else {
					iObj.addClass(name);
				}
			});
		}
	});


	// 获取DOM对象的所有文本内容
	var getTextContent = function(node) {
		// 1 获取到参数 node 的子节点(包含了：元素节点、文本节点)
		var cNodes = node.childNodes,
			length = cNodes.length,
			i, 
			textArr = [],				// 存储元素的文本内容
			tempNode = null;

		for(i = 0; i < length; i++) {
			tempNode = cNodes[i];

			// 文本节点
			if(tempNode.nodeType === 3) {
				// nodeValue 这个属性用来获取文本节点内容
				textArr.push( tempNode.nodeValue );
			} else if(tempNode.nodeType === 1) {
				textArr.push( getTextContent(tempNode) );
			}
		}

		// 最终，将获取到的内容转化为字符串然后返回！
		return textArr.join("");
	};

	// 属性操作模块
	wLibory.fn.extend({
		attr: function(name, value) {
			// 根据传入的参数，来判断是获取还是设置属性
			if(typeof value === "undefined") {
				return this[0].getAttribute(name);
			}

			// 设置属性的时候，是给获取到的所有元素都设置
			return this.each(function() {
				this.setAttribute(name, value);
			});
		},
		val: function(v) {
			// 设置内容
			if(typeof v !== "undefined") {
				return this.each(function() {
					this.value = v;
				});
			}

			// 读取内容
			return this[0].value;
		},
		html: function(htmlString) {
			// 判断有没有传入参数
			// if(htmlString === undefined) {
			if(typeof htmlString === "undefined") {
				// 表示获取内容
				return this[0].innerHTML;
			}

			// 设置
			return this.each(function() {
				// 根据传入的内容来设置html
				this.innerHTML = htmlString;
			});
		},
		text: function(txtString) {
			var arr = [];
			// 1 判断有没有传入参数
			if(typeof txtString === "undefined") {
				// 获取内容
				if("textContet" in this[0]) {
					this.each(function() {
						arr.push( this.textContet );
					});
				} else {
					this.each(function() {
						// getTextContent 这个方法的返回值是一个字符串
						arr.push( getTextContent(this) );
					});
				}

				return arr.join("");
			}
			
			// 传入参数，设置内容
			if("textContet" in this[0]) {
				this.each(function() {
					this.textContent = txtString;
				});
			} else {
				// 如果不支持 textContent 该怎么设置文本内容？？
				// 思路：
				// 1 清空该元素的所有内容
				// 		innerHTML = "";
				// 2 创建文本节点
				// 3 将文本节点追加到当前元素中
				this.each(function() {
					this.innerHTML = "";
					var txtNode = document.createTextNode(txtString);
					this.appendChild(txtNode);
				});
			}

			return this;
		}
	});

	// 动画操作模块








// 选择器模块
var select = 

function() {

// 兼容性处理
var support = {};
support.getElementsByClassName = function() {
    // function getElementsByClassName() { [native code] }
    var rnative = /^[^{]+\{\s*\[native \w/;
    return rnative.test(document.getElementsByClassName);
}();

// 判断trim的兼容性
support.trim = !!String.prototype.trim;

// IE8中 兼容 push 方法
var push = [].push;
try {
    // 判断 push 是否可用
    var container = document.createElement("div");
    container.innerHTML = "<p></p><p></p>";
    push.apply([], container.childNodes);
} catch(e) {
    // push不可用，则自己实现
    push = {
        apply: function(target, els) {
        	// 将第二个参数中的内容 添加到第一个参数中去
        	// target : [1, 3, 5]
        	// els:     ["a", "b"]
            var j = target.length;
                i = 0;
            while(target[j++] = els[i++]) {}
           	// target[3] = els[0]
           	// target[4] = els[1]
            target.length = j - 1;
        }
    };
} finally {
    container = null;
}

// 通过标签名来获取元素
var getElmsByTag = function(tagName, context, results) {
	// 1 初始化 results 这个参数
	// 2 假设参数的取值为数组
	results = results || [];
	// IE8中 apply的第二个参数不能是一个伪数组！
	// results.push.apply(results, context.getElementsByTagName(tagName));
	push.apply(results, context.getElementsByTagName(tagName));
	return results;
};

// 封装通过id来获取元素的方法
var getElmById = function(id, results) {
	results = results || [];
	var node = document.getElementById(id);
	if(node !== null) {
		results.push( node );
	}
	return results;
};

// 封装通过类名来获取元素的方法
var getElmsByClsName = function(clsName, context, results) {
	results = results || [];

	// 浏览器支持这个方法
	if(support.getElementsByClassName) {
		// results.push.apply(results, context.getElementsByClassName(clsName));
		push.apply(results, context.getElementsByClassName(clsName));
		return results;
	}

	// 获取到页面中所有的元素
	var allNodes = context.getElementsByTagName("*");

	// 调用 wLibory.each 来循环数组
	wLibory.each(allNodes, function(i, v) {
		if( (" " + v.className + " ").indexOf(" " + clsName + " ") > -1) {
			results.push(v);
		}
	});
	return results;
};

// 匹配单个选择器的正则表达式
var rquickExpr = /^(?:#([\w-]+)|\.([\w-]+)|([\w-]+))$/;
// 获取单个指定的元素
var get = function(selector, context, results) {
	results = results || [];
	// 上下文参数的默认值就是 document
	context = context || document;

	var m = rquickExpr.exec( wLibory.myTrim(selector) );

	// 判断传入的是不是一个选择器
	if(typeof context === "string") {
		// 调用get方法, 将context字符串转化为 DOM对象数组
		context = get(context);
	}

	// DOM对象
	if(context.nodeType) {
		// 将DOM对象转化为数组
		context = [context];
	}

	if(m !== null) {
		if(m[1]) {
			results = results.concat( getElmById(m[1]) );
		} else {
			wLibory.each(context, function(i, v) {
				if(m[2]) {
					results = results.concat( getElmsByClsName(m[2], this) );
				} else {
					results = results.concat( getElmsByTag(m[3], this) );
				}
			});
		}
	}

	return results;
};

// 选择器模块的核心函数
var select = function(selector, context, results) {
	results = results || [];
	context = context || document;

	var singleSelectors = wLibory.myTrim(selector).split(",");
	wLibory.each(singleSelectors, function(i, v) {
		var c = context;
		wLibory.each( wLibory.myTrim(v).split(" "), function(i, v) {
			if(v !== "") {
				c = get(v, c);
			}
		} );

		results = results.concat(c);
	});

	return results;
};

return select;
}();

	// 暴露wLibory
	window.w = window.wLibory = wLibory;
})();