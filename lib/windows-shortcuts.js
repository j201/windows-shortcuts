var execFile = require('child_process').execFile;
var pathUtils = require('path');

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

// This function is supposed to act like a windows shell for compatibility with v0.1.2
// Meaning, treat carets as escape characters (replace ^<any> with <any>) and expand env vars
function expandEnv(path) {
	var envRE = /(^|[^^])%((?:\^.|[^^%])*)%/g; // Matches env vars, accounting for escaped chars. I feel dirty.
	return path.replace(envRE, function(_, g1, g2) {
		return g1 + process.env[g2];
	}).replace(/\^(.)/g,"$1");
}

function commandArgs(type, path, options) {
	// Generates a command for shortcut.exe
	var args = ['/A:' + type, '/F:' + expandEnv(path)];

	if (options) {
		if (options.target)
			args.push('/T:' + expandEnv(options.target));
		if (options.args)
			args.push('/P:' + expandEnv(options.args));
		if (options.workingDir)
			args.push('/W:' + expandEnv(options.workingDir) + '');
		if (options.runStyle)
			args.push('/R:' + options.runStyle);
		if (options.icon) {
			args.push('/I:' + expandEnv(options.icon) + ('iconIndex' in options ? ',' + options.iconIndex : ''));
		}
		if (options.hotkey)
			args.push('/H:' + options.hotkey);
		if (options.desc)
			args.push('/D:' + expandEnv(options.desc) + '');
	}
	return args;
}

function isString(x) {
	return Object.prototype.toString.call(x) === "[object String]";
}

exports.query = function(path, callback) {
	execFile(__dirname + '/shortcut/Shortcut.exe',
		['/A:Q', '/F:' + expandEnv(path)],
		function(error, stdout, stderr) {
			var result = parseQuery(stdout);
			callback(error ? stderr || stdout : null, result);
		});
};

exports.create = function(path, optionsOrCallbackOrTarget, callback) {
	var options = isString(optionsOrCallbackOrTarget) ? {target : optionsOrCallbackOrTarget} : optionsOrCallbackOrTarget;
	callback = typeof optionsOrCallbackOrTarget === 'function' ? optionsOrCallbackOrTarget : callback;

	if (pathUtils.extname(path) !== ".lnk") { // Automatically generate shortcut if a .lnk file name is not given
		if (options && options.target) {
			var targetObj = pathUtils.parse(options.target); // TODO: deal with parse failure?
			var basename = targetObj.ext === ".lnk" ?
				options.target :
				targetObj.name + ".lnk";
			path = pathUtils.join(path, basename);
		} else {
			path = pathUtils.join(path, "New Shortcut.lnk");
		}
	}

	execFile(__dirname + '\\shortcut\\Shortcut.exe',
		 commandArgs('C', path, options),
	     function(error, stdout, stderr) {
		 	if (callback)
				callback(error ? stderr || stdout : null);
		});
};

exports.edit = function(path, options, callback) {
	execFile(__dirname + '/shortcut/Shortcut.exe',
		commandArgs('E', path, options),
		function(error, stdout, stderr) {
			if (callback)
				callback(error ? stderr || stdout : null);
		});
};

// Shortcut open states
exports.NORMAL = 1;
exports.MAX = 3;
exports.MIN = 7;
