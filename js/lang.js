/**
 * H5 多语言解决方案（支付宝钱包离线H5APP）
 * Author   ：王员外
 * URL      ：http://yuanwai.wang
 * Company  : AliPay
 * Created  ：9/10/2015.
 */

;(function(_doc, _win){
	'use strict';

	var lang = {
			//注册事件
			readyFn : [], //存放 fn 队列
			isLoaded : false, //语言包是否已经加载 ok
			version : '0.0.5',
			opt : {}, //合并后的 option
			pack : {}, //存放当前语言包
			options : {
				packType : 'file',   //语言包存在方式 : [ file | inline ]
				baseUrl : './i18n/',  // 语言包相对路径，如果 packType === inline ，不需要配置此项
				defaultLang : 'zh-Hans' //默认，兜底
			},

			//# 空函数
			noop : function() {
				return function(){};
			},

			//# 对象扩展
			extend : function(){
				var target = arguments[0] || {} , i = 1 , length = arguments.length , options ;
				if ( typeof target !== "object" && typeof target !== "function" ){
					target = {};
				}
				for ( ; i < length; i++ ){
					if ( (options = arguments[ i ]) != null ){
						for ( var name in options ) {
							var copy = options[ name ];
							if ( target === copy ){
								continue;
							}
							if ( copy !== undefined ){
								target[ name ] = copy;
							}
						}
					}
				}
				return target;
			},
			getType : function(){
				//如果 定义了  window.H5LangType ，优先使用 window.H5LangType
				var langs = window.navigator.userAgent.match( /Language\/([\w\-]+)/i) || [] ;
				return window.H5LangType || langs[1] || this.opt.defaultLang || 'zh-Hans';
			},
			type : 'zh-Hans'

		}
		;



	lang.init = function(){
		var self = this,
			config = document.body.getAttribute('data-lang-config') || {};

		self.type = self.getType();

		//合并后的 options
		self.opt = self.extend({}, self.options, parseObj( config ) );

		if( ! _win._H5Lang_ ){
			_win._H5Lang_ = {} ;//语言包变量
		}

		//如果是中文简体版本，就先显示默认，具体由 css 处理
		_doc.body.className += ' body-lang-'+ self.type +' body-lang-load'  ;

		//内链
		if( self.opt.packType === 'inline'){
			// 成功处理
			self.loadSuccess();
		}else{  // 以文件形式加载

			self.loadJs( self.getUrl(), {
				onLoad : function(){
					// 成功处理
					self.loadSuccess();
				},
				onError : function(){
					console.error('[load fail:'+ self.getUrl() +']');
				}
			});
		}
	};

	/*
	 * 文件加载 ok
	 * */
	lang.loadSuccess = function(){
		var self = this;


		self.pack = _win._H5Lang_[ self.type ] || '';


		//没找到语言包
		if( self.pack === '' ){
			console.error('[no lang:'+ self.type +']');
			return ;
		}

		//翻译
		self.translate();


		//加载成功了
		self.isLoaded = true;

		//语言包准备好了
		for( var fni in self.readyFn ) {
			if (typeof self.readyFn[fni] === 'function') {
				self.readyFn[fni]();
			}
		}
	};


	/*
	 * 加载文件 #  （支持跨域）
	 * */
	lang.loadJs = function( src, opt ){
		var self = this,
			head = document.getElementsByTagName('head')[0] || document.documentElement,
			script = document.createElement('script'),
			opts    = {
				onLoad      : self.noop // 加载成功 回调
				, onError   : self.noop //onerror
				, charset   : 'utf-8' // 编码
				, timeout   : 1e4 // 超时时间
			}
			, timer = null //超时

			;
		//不允许地址为空
		if( ! src ){
			return ;
		}
		opts = lang.extend(opts, opt);

		script.type = 'text/javascript';
		script.src = src;
		script.charset = opts.charset;
		script.onload = function(){
			opts.onLoad();
			clearTimeout( timer );
		};
		script.onerror = opts.onError;
		script.onreadystatechange = function(){
			var state = this.readyState;
			if (state === 'loaded' || state === 'complete') {
				script.onreadystatechange = null;
				//清空超时事件
				clearTimeout( timer );
				opts.onLoad();
			}
		};
		head.insertBefore(script, head.firstChild);
		//检测超时
		timer = setTimeout(function(){
			head.removeChild( script );
			//触发错误
			opts.onError();
		}, opts.timeout );
	};

	/*
	 * 获取 语言包地址
	 * */
	lang.getUrl = function(){
		return this.opt.baseUrl + ( this.opt.baseUrl.slice(-1) !== '/' ?  '/' : '')  + this.type +'.js';
	};

	/*
	 * 开始翻译替换
	 * */
	lang.translate = function(){


		//所有节点
		var self = this,
			boxes = document.querySelectorAll('*'),
			item = null,  //遍历的临时变量
			itemLangKey = '',
			itemLang = '',
			itemPlaceholder = '',
			tagName = ''
			;

		for( var i in boxes ){
			item = boxes[i];
			//              判断节点类型     // 翻译过
			if( ! item || item.nodeType !== 1 || item.getAttribute('data-lang-load') !== null ){
				continue;
			}

			itemLangKey = item && item.getAttribute('data-lang') || '';
			itemLang = itemLangKey && this.get( itemLangKey ) || '';

			//区分标签
			tagName = ( item.tagName || '' ).toLowerCase();

			//检查是否有属性，
			if( itemLangKey && itemLang  ){
				//  处理 text , textarea
				if( tagName === 'input' || tagName === 'textarea' ) {
					item.value = itemLang;

				}else if( tagName === 'img' ) {//处理图片
					//如果有 lazyload
					if (item.getAttribute('data-src')) {
						item.setAttribute('data-src', itemLang);
						if (item.hasAttribute('src')) {
							item.setAttribute('src', itemLang);
						}
					} else {
						item.setAttribute('src', itemLang);
					}
				}else if( tagName === 'script' || 'iframe' === tagName ) { // 处理 script、iframe
					item.src = itemLang;
				}else if( 'base' === tagName || 'link' === tagName ){ // base , css, icon
					item.href = itemLang;

				}else{
					//其他标签
					item.innerHTML = itemLang;
				}
			}

			//不处理 data-lang-*  泛匹配

			//处理 script 模板。 对于 <script type="text/html" > 的标签
			/*
			 * <script type="text/html">
			 <article>
			 <h2>@lang (我)))))), @lang(    我     )</h2>
			 <p><img data-src="@lang( 广告图片 )" /></p>
			 </article>
			 </script>
			 */

			if( tagName === 'script' && item.type === 'text/html' ) {
				item.text = ( item.text || '' ).replace(/@lang\s*\(([^\)]+)\)/g, function(target, key){
					key =  (key || '').replace(/^\s+|\s+$/g, '');
					//查找
					return self.get( key );
				});
			}

			//处理 placeholder
			if( tagName === 'input' || tagName === 'textarea' ) {
				item.setAttribute('placeholder', self.get( item.getAttribute('data-lang-placeholder') )  );
				item.removeAttribute('data-lang-placeholder');
			}

			//处理 title
			if( item.getAttribute('data-lang-title')  ){
				item.setAttribute('title', self.get( item.getAttribute('data-lang-title') ) );
				item.removeAttribute('data-lang-title');
			}

			//处理 <a/> href
			if( tagName === 'a' && item.getAttribute('data-lang-href')  ){
				item.setAttribute('href', self.get( item.getAttribute('data-lang-href') ) );
				item.removeAttribute('data-lang-href');

			}

			//处理 img alt
			if( tagName === 'img' && item.getAttribute('data-lang-alt')  ){
				item.setAttribute('alt', self.get( item.getAttribute('data-lang-alt') ) );
				item.removeAttribute('data-lang-alt');
			}

			//删除data-lang 属性， 但不删除<title/> 的
			if( itemLangKey && tagName != 'title' ){
				item.removeAttribute('data-lang');
			}
		}


		//修改标题
		_win.AlipayJSBridge ? self.setTitle() : document.addEventListener('AlipayJSBridgeReady', function () {
			self.setTitle();
		});

		return boxes;

	};



	/*
	 * 修改标题
	 * */
	lang.setTitle  = function( title, subtitle ){

		//容器 对于后期修改标题不起作用，的用容器接口
		var self = this,
			titles = {},
			titleDom = document.querySelector('title');

		//优先使用 传递变量，其次用 <title> 属性
		title = title || self.get( titleDom.getAttribute('data-lang') );

		subtitle = subtitle || self.get( titleDom.getAttribute('data-lang-subtitle') );

		titles = {
			title : title,
			subtitle : subtitle
		};

		AlipayJSBridge.call("setTitle", titles );

	};


	/*
	 * 获取 语言翻译
	 * */
	lang.get  = function(){
		var self = this,
			arg = arguments,
			lang = '',
			key = arg[0],
			len = arg.length
			;


		if( len === 0 ){
			return self.pack;
		}

		lang = key && self.pack[ key ] || '';


		if( len === 1 ){
			return lang ;
		}else{

			//如果是 对象替换  lang.get( '我', { 'money' : 100, '冻结资金' : 20} )  。因为 在不同语言中，变量位置不同
			// 传递的 对象 key 可以是汉字
			if( len === 2 && typeof arg[1] === 'object' ){
				return lang.replace(/\{%([^\}]+)\}/ig, function( a , key ){
					return arg[1][ key ] || '';
				});

			}else{ //按照顺序替换
				//替换 语言中有多少变量 {%s}  : 我的余额{%s}元，冻结{%s}元
				var keyI = 0;
				return lang.replace(/\{%s\}/ig, function(){
					keyI ++;
					return arg[ keyI ] || '';
				});
			}

		}
	};

	/*
	 * 修改 语言翻译
	 * */
	lang.set = function( key, val ){
		var self = this;
		if( self.pack[ key ] ){
			return self.pack[ key ] = val;
		}else{
			return null;
		}
	};


	lang.init();



	//#################公有方法

	//# 执行此方法的时候，语言包刚准备好，还没开始翻译
	_win.H5LangReady = function( fn ){
		//如果语言包加载成功
		if( lang.isLoaded ){
			fn();
		}else{
			//加入队列
			lang.readyFn.push( fn );
		}
	};

	//暴露方法
	_win.H5Lang = lang;



	//##### 私有
	/*字符串转对象*/
	function parseObj(data) {
		data = ( data || '' ).replace(/^\s+|\s+$/, '');
		try {
			return (new Function("return " + data))();
		} catch (e) {
			return {};
		}
	}
})(document, window);