## windows-shortcuts
### Create, edit, and query Windows shortcuts (.lnk files)
A Node.js API for [shortcut.exe](http://www.optimumx.com/downloads.html) by Optimum X.

## Simple Usage Example

Creating a shortcut to notepad.exe in the current user's Start Menu:

```javascript
var ws = require('windows-shortcuts');

ws.create("%APPDATA%/Microsoft/Windows/Start Menu/Programs/Notepad.lnk", "%WINDIR%/notepad.exe");
```

## API
#### ws.create(path, [options], [callback])
#### ws.create(path, target, [callback])
Creates a new shortcut.

- path - The file path to the new shortcut. This can be a folder, in which case a .lnk file will be created in that folder with the name of the target file, or the name of a .lnk file, which will be created. Note that a folder that does not exist will not be created. Environment variables like %WINDIR% can be used, but they will be expanded when the shortcut is created. If you want them to be expanded when the shortcut is clicked, use carets before the percent signs: ^%WINDIR^%.
- options - An object with the following optional parameters:
	- target - The file path to the shortcut's target. See above about environment variables.
	- args - The arguments to be passed to the shortcut, as a string.
	- workingDir - The working directory of the shortcut.
	- runStyle - State to open the window in: ws.NORMAL (1), ws.MAX (3), or ws.MIN (7).
	- icon - The path to the shortcut icon file.
	- iconIndex - An optional index for the image in the icon file.
	- hotkey - A number representing a hotkey. To find out this value, create a shortcut manually and use ws.query on it. Sorry about that inconvenience, but there isn't any more documentation either with shortcut.exe or from Microsoft.
	- desc - A string description of the shortcut.
- target - If a string is passed as the second parameter, it is used as the options.target value (see above).
- callback - A function to be executed when ws.create is finished executing. One argument is passed to it: `null` if there was no error, or a string error message if there was.

Example:

```javascript
var ws = require('windows-shortcuts');

ws.create("foo.lnk", {
	target : "%APPDATA%/Bar/foo.js",
	args : '2 "baz quux"',
	runStyle : ws.MIN,
	desc : "Does cool stuff."
}, function(err) {
	if (err)
		throw Error(err);
	else
		console.log("Shortcut created!");
});
```

#### ws.edit(path, options, [callback])
Edits an existing shortcut, applying new options. Parameters are the same as above.

Example:

```javascript
ws.edit("foo.lnk", {runStyle : ws.MAX});
```

#### ws.query(path, callback)
Collects information about an existing shortcut. The callback is called with two parameters:

- error - A string error message if there was an error, otherwise `null`
- options - The options set on the shortcut with the same properties as above, except an additional property `expanded` is added which contains the file name properties with any environment variables expanded. For example, if `options.target` is `"%WINDIR%/foo.exe"`, `options.expanded.target` would be `"C:/Windows/foo.exe"`.

Example:

```javascript
ws.query("C:/ProgramData/Microsoft/Windows/Start Menu/Windows Update.lnk", console.log);

/* From console:
null { expanded:
   { args: 'startmenu',
     workingDir: 'C:\\Windows\\system32',
     icon: 'C:\\Windows\\system32\\wucltux.dll' },
  target: '%windir%\\system32\\wuapp.exe',
  args: 'startmenu',
  workingDir: '%windir%\\system32',
  runStyle: 1,
  icon: '%windir%\\system32\\wucltux.dll',
  iconIndex: '0',
  hotkey: 0,
  desc: 'Delivers software updates and drivers, and provides automatic updating options.' }
*/
```

## Testing

```
npm test
```

## Compatibility
Only tested on Windows 7, but shortcut.exe says is compatible with Windows 95 or later, so it should work on modern versions of Windows.

---

Licensed under [the MIT License](http://opensource.org/licenses/MIT).
