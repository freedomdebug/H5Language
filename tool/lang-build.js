/**
 * Created by wangyuanwai on 9/15/15.
 */


var Fs = require('fs');
var Path = require('path');

var rootPath = __dirname;
var gitignorePath = rootPath + '/.gitignore';
var srcPath = rootPath + '/www'; // 源代码目录
var langPath = srcPath + '/js/i18n'; // 语言包JS目录
var langTypes = 'en,zh-Hans,zh-Hant,zh-HK'.split(','); // 语言类型


// 读取ignore文件列表
function getIgnoreFiles() {
	var content = Fs.readFileSync(gitignorePath, {
		encoding : 'utf-8'
	});
	return content.split(/\r\n|\n/);
}

var ignoreFiles = getIgnoreFiles();

// 遍历文件
function grepFilePaths(rootDirPath, checkFn) {
	var paths = [];

	function walk(dirPath) {
		var files = Fs.readdirSync(dirPath);

		for (var i = 0, len = files.length; i < len; i++) {
			var file = files[i];

			if (file.charAt(0) === '.') {
				continue;
			}

			if (ignoreFiles.indexOf(file) >= 0) {
				continue;
			}

			var path = Path.resolve(Path.join(dirPath, file));

			var stat = Fs.statSync(path);

			if (stat.isDirectory()) {
				walk(path);
			} else if (checkFn(path)) {
				paths.push(path);
			}
		}
	}

	walk(rootDirPath);

	return paths;
}

var filePaths = grepFilePaths(srcPath, function(path) {
	return /\.(js|htm|html)$/.test(path);
});

var langMap = {};

filePaths.forEach(function(path) {
	var content = Fs.readFileSync(path, {
		encoding : 'utf-8'
	});

	// 删除多行注释
	content = content.replace(/\/\*[\S\s]*?\*\//g, '');

	var match;
	var reg = /\bH5Lang\.get\((?:"((?:\\"|[^"])+)"|'((?:\\'|[^'])+)')|\bdata-lang(?:-\w+)?="(.+?)"|@lang\s*\((.+?)\)/g;
	while((match = reg.exec(content))) {
		var key = (match[1] || match[2] || match[3] || match[4]).trim();
		langMap[key] = true;
	}
});

langTypes.forEach(function(lang) {
	var newLangMap = {};

	for (var key in langMap) {
		newLangMap[key] = key;
	}

	var path = Path.join(langPath, lang + '.js');
	if (Fs.existsSync(path)) {
		var content = Fs.readFileSync(path, {
			encoding : 'utf-8'
		});
		var match;
		var reg = /(?:"((?:\\"|[^"])+)"|'((?:\\'|[^'])+)')\s*:\s*(?:"((?:\\"|[^"])+)"|'((?:\\'|[^'])+)')/g;
		while((match = reg.exec(content))) {
			newLangMap[match[1] || match[2]] = match[3] || match[4];
		}
	}

	// create language script
	var script = 'if(!window._H5Lang_) {\n  window._H5Lang_ = {};\n}\nwindow._H5Lang_[\'' + lang + '\'] = {\n';
	for (var key in newLangMap) {
		script += "  '" + key.replace(/'/g, "\\'") + "' : '" + newLangMap[key].replace(/'/g, "\\'") + "',\n";
	}
	script += '};\n';

	//console.log(script);
	Fs.writeFileSync(path, script);

	console.log(lang + '语言包生成成功：' + path);
});