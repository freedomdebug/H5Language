# 支付宝钱包H5APP多语言解决方案


### 适用范围
	1、离线 H5APP
	2、在线 H5页面（不方便服务器端做翻译）

### 项目人员：
	开发：@王员外
	
 
### Update
	 1.0.0
	      ~ H5LangReady之前表示lang 语言包加载完毕，现在表示 翻译完毕
	      + 增加 H5Lang.version 对象
	 0.0.2
				~ 修复 获取语言版本缺陷 
	 0.0.1
	      + 语言中的变量替换
	      + 自定义语言包路径
	      + 修改默认语言
	      + 多语言在同一页面共存  _H5Lang_['en']
	      + 语言包内链页面方式
	 


### 使用方法
	1、在页面中引入 /dist/x.x.x.js 
	2、在项目 根目录建立文件夹：
		 /i18n/
		    en.js  //英文版
		    zh-Hans.js //简体中文
		    zh-Hant.js //台湾繁体
		    zh-HK.js // 香港繁体
	3、修改你的项目即可	    


### 注入的js文件大小
	Uglify 压缩后：~ 3K

### 目录结构：

	i18n/              放语言包
	    zh-Hans.js       简体中文
	    zh-Hant.js       台湾繁体
	    zh-HK.js       香港港繁体
	    en.js          英文
	js/
	    lang.js     处理语言包主逻辑
	    
### 语言版本约定（容器暂定）（来自于 userAgent ）
      zh-Hans ：简体中文
	    zh-Hant ： 台湾繁体
	    zh-HK   ： 香港港繁体
	    en       ： 英文

### 初始化自定义参数
	 < body data-lang-config="{
	        packType : 'file',   //语言包存在方式 : [ file | inline ]
	        baseUrl : './i18n/',  // 语言包相对路径，如果 packType === inline ，不需要配置此项
	        defaultLang : 'zh-Hans' //默认，兜底
	} >


### 语法
	HTML 中：
		 给标签增加 : data-lang 属性。比如：<div data-lang="^_^"></div> (在语言包中，"^_^" : "你好")
		 语言包的 键名 由开发者自己定义
		 
	Javascript 中：
		 获取语言： H5Lang.get('^_^')
		 改变、增加一条翻译：H5Lang.set('^_^', '你好啊啊啊' )
		 
	模板 中：
		 模板中的文字，需要把文字改为变量，并在 Javascript 中替换模板的时候 调用 ：H5Lang.get('^_^')
		 template.replace({
		     hello : H5Lang.get('^_^')
		 });
		 

### 简体中文版的优化
	由于是 HTML 页面初始时，文字部分是空的，翻译替换会让文字显示延后接近100ms，所以页面初始时应该这样：
	
	HTML：
		<div data-lang="^_^">
				<span class="lang-default">你好</div>
		</div> 
		
	CSS:
		/*  js 会为 <body> 增加 .body-lang-<语言版本>  ，可以根据具体情况做优化 */
		.body-lang-zh-Hans .lang-default{  visibility: visible; }
		.lang-default{ visibility: hidden; }	
		
	这样会为中文简体版 节省 五六十 ms，并且不影响非 简体中文版的显示	
	
### 注意事项
	语言包是异步加载，所以如果依赖于语言包的业务逻辑，可以：
	
	 H5LangReady(function(){
          H5Lang.set('aaa', '1234');
          console.log( H5Lang.get('^_^') );
          //获取语言版本
          console.log( H5Lang.type );
    });

### placeholder、title 属性
	<input />、<textarea/> 都支持：data-lang-placeholder 属性
	所有标签支持 data-lang-title 属性
	Demo：
		  <input data-lang-placeholder="^_^" data-lang-title="bbb" data-lang="aaa" />
		  
 

### 图片
	支持 <img/> 多语言版本，使用方法：<img data-lang="ad_img" />
	支持 alt属性： <img data-lang-alt="ad_img" data-lang-title="bbb" />
	支持 有 lazyLoad 功能的图片。

### 阿拉伯文 以及其他从右往左的排版的语言（暂不实现）
	会在 <html/> 上增加 :  dir="rtl" lang="ar"

### 翻译语言中的变量
	 比如翻译语言：
	 lang-key    简体中文
	 --------    ------------------------
	 我的余额     我的余额{%s}元，冻结{%s}元
	 
	 在js中 ，这里有两种用法：
	 1、【变量按照顺序替换】
	    翻译语言：我的余额{%s}，其中被冻结资金{%s} 
	    H5Lang.get('我的余额', 100 ,  20 )
	    翻译语言中有 变量占位符 {%s} 的数量、排序 和 H5Lang.get() 对应 。
	    注意 ：必须是 {%s} 这个字符串
	 
	 2、【变量名替换】
	    翻译语言：我的余额{%money}，其中被冻结资金{%冻结资金} 
	    H5Lang.get('我的余额2', {
          'money' : 100,
          '冻结资金' : 20
 
      })
      
   推荐：使用方案 2（不同语言中的变量，顺序可能不同）.
	
	
### Javascript 模板 （只替换 &lt;script type="text/html" &gt; 的标签text ）
``` 
	模板中，这样标记： @lang( key )
	<script type="text/html" id="tpl1">
      <article>
          <h2>@lang (我)))))), @lang(    我     )</h2>
          <p><img data-src="@lang( 广告图片 )" /></p>
      </article>
   </script >
   会被替换为
  <script type="text/html">
      <article>
          <h2>周星驰，周星驰</h2>
          <p><img data-src="https://i.alipayobjects.com/i/ecmng/png/201411/3qC7hSbxuv.png" /></p>
      </article>
  </script>
``` 
  

### 其他
	自动区分 <input/>、<textarea/>、<div/>
	<style />  可以利用语言包 加入不同 内联 css 样式 
	<script />、<iframe/>  data-lang  : src
	<base>  data-lang  : href
	<link/>(css，icon)  data-lang  : href
	<embed/> 不支持，请自行处理
	
	另外支持  <canvas/>、<comment/>、<noscript/>、<noembed/> 等
	
### 暂不支持 data-lang-* ：
	本计划支持：data-lang-*  替换成 : *
	实际测试发现，大量遍历属性，一个小页面会被 Block 60ms 以上
	
	
	
### document.title 
	因为依赖于js，所以 <title/> 的显示也会延迟一些。
	