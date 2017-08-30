export var NORMAL: 1;
export var MAX: 3;
export var MIN: 7;

interface ShortcutOptions {
    /** The file path to the shortcut's target. See above about environment variables. **/
    target?: string;
    /** The arguments to be passed to the shortcut, as a string. **/
    args?: string;
    /** The working directory of the shortcut. **/
    workingDir?: string;
    /** State to open the window in: ws.NORMAL (1), ws.MAX (3), or ws.MIN (7). **/
    runStyle?: 1 | 3 | 7;
    /** The path to the shortcut icon file. **/
    icon?: string;
    /** An optional index for the image in the icon file. **/
    iconIndex?: number;
    /** 
     * A number representing a hotkey.  
     * To find out this value, create a shortcut manually and use ws.query on it. 
     * Sorry about that inconvenience, but there isn't any more documentation either with shortcut.exe or from Microsoft.  
     **/
    hotkey?: number;
    /** A string description of the shortcut. **/
    desc?: string;
}

interface CreateOrEditCallback {
    /**
     * @param error null if there was no error, or a string error message if there was.
     */
    (error: string | null): void;
}

interface QueryCallback {
    /**
     * @param error A string error message if there was an error, otherwise null
     * 
     * @param options 
     * The options set on the shortcut with the same properties as above, 
     * except an additional property expanded is added which contains the file name properties with any environment variables expanded.
     * For example, if options.target is "%WINDIR%/foo.exe", options.expanded.target would be "C:/Windows/foo.exe".
     */
    (error: string | null, options?: ShortcutOptions): void;
}

/**
 * Creates a new shortcut.
 * 
 * @param path 
 * The file path to the new shortcut. 
 * This can be a folder, in which case a .lnk file will be created in that folder 
 * with the name of the target file, or the name of a .lnk file, which will be created. 
 * Note that a folder that does not exist will not be created. 
 * Environment variables like %WINDIR% can be used, but they will be expanded when the shortcut is created. 
 * If you want them to be expanded when the shortcut is clicked, use carets before the percent signs: ^%WINDIR^%.
 * 
 * @param target 
 * If a string is passed as the second parameter, it is used as the options.target value (see above).
 * 
 * @param callback 
 * A function to be executed when ws.create is finished executing. 
 */
export function create(path: string, target: string, callback?: CreateOrEditCallback);

/**
 * Creates a new shortcut.
 * 
 * @param path 
 * The file path to the new shortcut. 
 * This can be a folder, in which case a .lnk file will be created in that folder 
 * with the name of the target file, or the name of a .lnk file, which will be created. 
 * Note that a folder that does not exist will not be created. 
 * Environment variables like %WINDIR% can be used, but they will be expanded when the shortcut is created. 
 * If you want them to be expanded when the shortcut is clicked, use carets before the percent signs: ^%WINDIR^%.
 * 
 * @param options 
 * An object with optional parameters
 * 
 * @param callback 
 * A function to be executed when ws.create is finished executing. 
 */
export function create(path: string, options: ShortcutOptions, callback?: CreateOrEditCallback);

/**
 * Edits an existing shortcut, applying new options.
 * @param path The file path to an existing shortcut
 * @param options An object with optional parameters
 * @param callback A function to be executed when ws.edit is finished executing
 */
export function edit(path: string, options: ShortcutOptions, callback?: CreateOrEditCallback);

/**
 * Collects information about an existing shortcut.
 * @param path The file path to an existing shortcut
 * @param callback A function to be executed when ws.query is finished executing
 */
export function query(path: string, callback: (error: string | null, options?: ShortcutOptions) => void);

