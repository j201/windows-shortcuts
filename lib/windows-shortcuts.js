var exec = require('child_process').exec;

/*
 * options object (also passed by query())
 * target : The path the shortcut points to
 * args : The arguments passed to the target as a string
 * workingDir : The working directory of the target
 * runStyle : State to open the window in: ws.NORMAL (1), ws.MAX (3), or ws.MIN (7)
 * icon : The path to the shortcut icon file
 * iconIndex : An optional index for the image in the icon file
 * hotkey : A numerical hotkey
 * desc : A description
 */

function parseQuery(stdout) {
	// Parses the stdout of a shortcut.exe query into a JS object
	var result = {};
	result.expanded = {};
	stdout.split(/[\r\n]+/)
		.filter(function(line) { return line.indexOf('=') !== -1; })
		.forEach(function(line) {
				var pair = line.split('=', 2),
				key = pair[0],
				value = pair[1];
				if (key === "TargetPath")
					result.target = value;
				else if (key === "TargetPathExpanded")
					result.expanded.target = value;
				else if (key === "Arguments")
					result.args = value;
				else if (key === "ArgumentsExpanded")
					result.expanded.args = value;
				else if (key === "WorkingDirectory")
					result.workingDir = value;
				else if (key === "WorkingDirectoryExpanded")
					result.expanded.workingDir = value;
				else if (key === "RunStyle")
					result.runStyle = +value;
				else if (key === "IconLocation") {
					result.icon = value.split(',')[0];
					result.iconIndex = value.split(',')[1];
				} else if (key === "IconLocationExpanded") {
					result.expanded.icon = value.split(',')[0];
				} else if (key === "HotKey")
					result.hotkey = +value.match(/\d+/)[0];
				else if (key === "Description")
					result.desc = value;
			});
	Object.keys(result.expanded).forEach(function(key) {
		result.expanded[key] = result.expanded[key] || result[key];
	});
	return result;
}

function generateCommand(type, path, options) {
	// Generates a command for shortcut.exe
	var command = '"' + __dirname + '/shortcut/shortcut.exe"' +
		' /A:' + type +
		' /F:"' + path + '"';

	if (options) {
		if (options.target)
			command += ' /T:"' + options.target.replace(/(\^%[^^]*\^%)/g, '"$1"') + '"'; // ^% environment variables can't be inside quotation marks
		if (options.args)
			command += ' /P:"' + options.args.replace('"','\\"','g') + '"';
		if (options.workingDir)
			command += ' /W:"' + options.workingDir + '"';
		if (options.runStyle)
			command += ' /R:' + options.runStyle;
		if (options.icon) {
			command += ' /I:"' + options.icon + '"';
			if (options.iconIndex)
				command += ',' + options.iconIndex;
		}
		if (options.hotkey)
			command += ' /H:' + options.hotkey;
		if (options.desc)
			command += ' /D:"' + options.desc + '"';
	}
	return command;
}

function isString(x) {
	return Object.prototype.toString.call(x) === "[object String]";
}

exports.query = function(path, callback) {
	exec('"' + __dirname + '/shortcut/shortcut.exe" /A:Q /F:"' + path + '"',
	     function(error, stdout, stderr) {
		 	var result = parseQuery(stdout);
			callback(error ? stderr || stdout : null, result);
		});
};

exports.create = function(path, optionsOrCallbackOrTarget, callback) {
	var options = isString(optionsOrCallbackOrTarget) ? {target : optionsOrCallbackOrTarget} : optionsOrCallbackOrTarget;
	callback = typeof optionsOrCallbackOrTarget === 'function' ? optionsOrCallbackOrTarget : callback;

	if (path.indexOf('.lnk') === -1) { // Automatically generate shortcut if a .lnk file name is not given
		path = path.replace(/[\\\/]?$/, (path ? "\\" : "") +
			(options && options.target ?
				options.target.match(/[^\\\/]+(?=\..*$)/)[0] + ".lnk" :
	        	"New Shortcut.lnk"));
	}

	exec(generateCommand('C', path, options),
	     function(error, stdout, stderr) {
		 	if (callback)
				callback(error ? stderr || stdout : null);
		});
};

exports.edit = function(path, options, callback) {
	exec(generateCommand('E', path, options),
	     function(error, stdout, stderr) {
		 	if (callback)
				callback(error ? stderr || stdout : null);
		});
};

// Shortcut open states
exports.NORMAL = 1;
exports.MAX = 3;
exports.MIN = 7;
