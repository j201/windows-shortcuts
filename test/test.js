var ws = require('../lib/windows-shortcuts');
var tape = require('tape');
var tmp = require('tmp');
var touch = require("touch");
var path = require("path");
var onExit = require('signal-exit');
var fs = require('fs');

tmp.setGracefulCleanup();

var filesToDelete = [];

onExit(function() {
	filesToDelete.forEach(function(f) {
		try {
			fs.unlinkSync(f.replace("%TEMP%", process.env.TEMP));
		} catch (e) {
			console.log('Deleting ' + f + ' failed.');
		}
	});
});

tape("create->query", function(t) {
	var target = tmp.tmpNameSync({postfix: ".txt"});
	touch.sync(target);
	filesToDelete.push(target);
	var lnkName = tmp.tmpNameSync({postfix: ".lnk"});
	var lnkOpts = {
		target : target,
		args : '2 "baz quux"',
		workingDir: "C:\\Windows",
		runStyle : ws.MIN,
		hotkey: 100,
		desc : "Does cool stuff."
	};
	ws.create(lnkName, lnkOpts, function(err) {
		t.notOk(err, "No errors on create");
		if (!err) filesToDelete.push(lnkName);
		ws.query(lnkName, function(err, opts) {
			t.notOk(err, "No errors on query");
			Object.keys(lnkOpts).forEach(function(k) {
				t.equal(opts[k], lnkOpts[k]);
			});
			t.end();
		});
	});
});

tape("create->edit->query", function(t) {
	var target = tmp.tmpNameSync({postfix: ".txt"});
	touch.sync(target);
	filesToDelete.push(target);
	var lnkName = tmp.tmpNameSync({postfix: ".lnk"});
	var lnkOpts = {
		target : target,
		args : '2 "baz quux"',
		workingDir: "C:\\Windows",
		runStyle : ws.MIN,
		hotkey: 100,
		desc : "Does cool stuff."
	};
	var lnkNewOpts = {
		runStyle : ws.MAX,
		args: '3 4'
	};
	ws.create(lnkName, lnkOpts, function(err) {
		t.notOk(err, "No errors on create");
		if (!err) filesToDelete.push(lnkName);
		ws.edit(lnkName, lnkNewOpts, function(err) {
			t.notOk(err, "No errors on edit");
			ws.query(lnkName, function(err, opts) {
				t.notOk(err, "No errors on query");
				Object.keys(lnkOpts).forEach(function(k) {
					if (k in lnkNewOpts) {
						t.equal(opts[k], lnkNewOpts[k]);
					} else {
						t.equal(opts[k], lnkOpts[k]);
					}
				});
				t.end();
			});
		});
	});
});

tape("create->query without target extension", function(t) {
	var target = tmp.tmpNameSync();
	touch.sync(target);
	filesToDelete.push(target);
	var lnkName = tmp.tmpNameSync({postfix: ".lnk"});
	var lnkOpts = {
		target : target,
		args : '2 "baz quux"',
		workingDir: "C:\\Windows",
		runStyle : ws.MIN,
		hotkey: 100,
		desc : "Does cool stuff."
	};
	ws.create(lnkName, lnkOpts, function(err) {
		t.notOk(err, "No errors on create");
		if (!err) filesToDelete.push(lnkName);
		ws.query(lnkName, function(err, opts) {
			t.notOk(err, "No errors on query");
			Object.keys(lnkOpts).forEach(function(k) {
				t.equal(opts[k], lnkOpts[k]);
			});
			t.end();
		});
	});
});

tape("create->query in directory", function(t) {
	var target = tmp.tmpNameSync({postfix: ".txt"});
	var targetObj = path.parse(target);
	touch.sync(target);
	filesToDelete.push(target);
	var lnk = tmp.dirSync();
	var lnkOpts = {
		target : target,
		args : '2 "baz quux"',
		workingDir: "C:\\Windows",
		runStyle : ws.MIN,
		hotkey: 100,
		desc : "Does cool stuff."
	};
	ws.create(lnk.name, lnkOpts, function(err) {
		t.notOk(err, "No errors on create");
		var lnkName = lnk.name + "\\" + targetObj.name + ".lnk";
		if (!err) filesToDelete.push(lnkName);
		ws.query(lnkName, function(err, opts) {
			t.notOk(err, "No errors on query");
			Object.keys(lnkOpts).forEach(function(k) {
				t.equal(opts[k], lnkOpts[k]);
			});
			t.end();
		});
	});
});

tape("create->query in directory with spaces", function(t) {
	var tmpDir = tmp.dirSync();
	var spacedDir = tmpDir.name + "\\spaced dir";
	fs.mkdirSync(spacedDir);
	var target = tmp.tmpNameSync({ dir: spacedDir, postfix: ".txt" });
	var targetObj = path.parse(target);
	touch.sync(target);
	filesToDelete.push(target);
	var lnk = tmp.dirSync({dir: spacedDir});
	var lnkOpts = {
		target : target,
		args : '2 "baz quux"',
		workingDir: "C:\\Windows",
		runStyle : ws.MIN,
		hotkey: 100,
		desc : "Does cool stuff."
	};
	ws.create(lnk.name, lnkOpts, function(err) {
		t.notOk(err, "No errors on create");
		var lnkName = lnk.name + "\\" + targetObj.name + ".lnk";
		if (!err) filesToDelete.push(lnkName);
		ws.query(lnkName, function(err, opts) {
			t.notOk(err, "No errors on query");
			Object.keys(lnkOpts).forEach(function(k) {
				t.equal(opts[k], lnkOpts[k]);
			});
			t.end();
		});
	});
});

tape("create->query with environment variables", function(t) {
	var target = tmp.tmpNameSync({ dir: "%TEMP%", postfix: ".txt" });
	t.ok(target.indexOf("%TEMP%") !== -1, "tmp doesn't expand env variables");
	var expandedTarget = target.replace("%TEMP%", process.env.TEMP);
	touch.sync(expandedTarget);
	filesToDelete.push(target);
	var lnkName = tmp.tmpNameSync({ dir: "%TEMP%", postfix: ".lnk" });
	var lnkOpts = {
		target : target,
		args : '2 "baz quux"',
		workingDir: "^%SOMEDIR^%",
		runStyle : ws.MIN,
		hotkey: 100,
		desc : "Does cool stuff."
	};
	ws.create(lnkName, lnkOpts, function(err) {
		t.notOk(err, "No errors on create");
		if (!err) filesToDelete.push(lnkName);
		ws.query(lnkName, function(err, opts) {
			t.notOk(err, "No errors on query");
			Object.keys(lnkOpts).forEach(function(k) {
				if (k === 'workingDir')
					t.equal(opts[k], "%SOMEDIR%");
				else if (k === 'target')
					t.equal(opts[k], expandedTarget);
				else
					t.equal(opts[k], lnkOpts[k]);
			});
			t.end();
		});
	});
});
