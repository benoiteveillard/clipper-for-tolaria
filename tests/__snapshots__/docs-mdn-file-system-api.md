---
type: Clip
url: https://developer.mozilla.org/en-US/docs/Web/API/File_System_API
published: 2026-08-27
clipped: 2026-09-10
---

# File System API

**Secure context:** This feature is available only in [secure contexts](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Secure_Contexts) (HTTPS), in some or all [supporting browsers](#browser_compatibility).

**Note:** This feature is available in [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API).

The **File System API** — with extensions provided via the [**File System Access API**](https://wicg.github.io/file-system-access/ "External link (opens in new tab)") to access files on the device file system — allows read, write and file management capabilities.

See [Relationship to other file-related APIs](https://developer.mozilla.org/en-US/docs/Web/API/File_API#relationship_to_other_file-related_apis) for a comparison between this API, the [File and Directory Entries API](https://developer.mozilla.org/en-US/docs/Web/API/File_and_Directory_Entries_API), and the [File API](https://developer.mozilla.org/en-US/docs/Web/API/File_API).

## Concepts and Usage

This API allows interaction with files on a user's local device, or on a user-accessible network file system. Core functionality of this API includes reading files, writing or saving files, and access to directory structure.

Most of the interaction with files and directories is accomplished through handles. A parent [`FileSystemHandle`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle) class helps define two child classes: [`FileSystemFileHandle`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle) and [`FileSystemDirectoryHandle`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryHandle), for files and directories respectively.

The handles represent a file or directory on the user's system. You can first gain access to them by showing the user a file or directory picker using methods such as [`window.showOpenFilePicker()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/showOpenFilePicker) and [`window.showDirectoryPicker()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/showDirectoryPicker). Once these are called, the file picker presents itself and the user selects either a file or directory. Once this happens successfully, a handle is returned.

You can also gain access to file handles via:

- The [`DataTransferItem.getAsFileSystemHandle()`](https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem/getAsFileSystemHandle) method of the [HTML Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API).
- The [File Handling API](https://developer.chrome.com/docs/capabilities/web-apis/file-handling "External link (opens in new tab)").

Each handle provides its own functionality and there are a few differences depending on which one you are using (see the [interfaces](#interfaces) section for specific details). You then can access file data, or information (including children) of the directory selected. This API opens up potential functionality the web has been lacking. Still, security has been of utmost concern when designing the API, and access to file/directory data is disallowed unless the user specifically permits it (note that this is not the case with the [Origin private file system](#origin_private_file_system), because it is not visible to the user).

**Note:** The different exceptions that can be thrown when using the features of this API are listed on relevant pages as defined in the spec. However, the situation is made more complex by the interaction of the API and the underlying operating system. A proposal has been made to [list the error mappings in the spec](https://github.com/whatwg/fs/issues/57 "External link (opens in new tab)"), which includes useful related information.

**Note:** Objects based on [`FileSystemHandle`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle) can also be serialized into an [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API "IndexedDB") database instance, or transferred via [`postMessage()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage "postMessage()").

### Origin private file system

The origin private file system (OPFS) is a storage endpoint provided as part of the File System API, which is private to the origin of the page and not visible to the user like the regular file system. It provides access to a special kind of file that is highly optimized for performance and offers in-place write access to its content.

The following are some possible use cases:

- Apps with persistent uploader
	- When a file or directory is selected for upload, you can copy the file into a local sandbox and upload a chunk at a time.
		- The app can restart uploads after an interruption, such as the browser being closed or crashing, connectivity getting interrupted, or the computer getting shut down.
- Video game or other apps with lots of media assets
	- The app downloads one or several large tarballs and expands them locally into a directory structure.
		- The app pre-fetches assets in the background, so the user can go to the next task or game level without waiting for a download.
- Audio or photo editor with offline access or local cache (great for performance and speed)
	- The app can write to files in place (for example, overwriting just the ID3/EXIF tags and not the entire file).
- Offline video viewer
	- The app can download large files (>1GB) for later viewing.
		- The app can access partially downloaded files (so that you can watch the first chapter of your DVD, even if the app is still downloading the rest of the content or if the app didn't complete the download because you had to run to catch a train).
- Offline web mail client
	- The client downloads attachments and stores them locally.
		- The client caches attachments for later upload.

Read our [Origin private file system](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system) for instructions on how to use it.

### Saving files

- In the case of the asynchronous handles, use the [`FileSystemWritableFileStream`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemWritableFileStream) interface. Once the data you'd like to save is in a format of [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob), [`String`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) object, string literal or [`buffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), you can open a stream and save the data to a file. This can be the existing file or a new file.
- In the case of the synchronous [`FileSystemSyncAccessHandle`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemSyncAccessHandle), you write changes to a file using the [`write()`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemSyncAccessHandle/write "write()") method. You can optionally also call [`flush()`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemSyncAccessHandle/flush "flush()") if you need the changes committed to disk at a specific time (otherwise you can leave the underlying operating system to handle this when it sees fit, which should be OK in most cases).

## Interfaces

[`FileSystemChangeRecord`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemChangeRecord)

Contains details of a single change observed by a [`FileSystemObserver`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemObserver).

[`FileSystemHandle`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle)

An object which represents a file or directory entry. Multiple handles can represent the same entry. For the most part you do not work with `FileSystemHandle` directly but rather its child interfaces [`FileSystemFileHandle`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle) and [`FileSystemDirectoryHandle`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryHandle).

[`FileSystemFileHandle`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle)

Provides a handle to a file system entry.

[`FileSystemDirectoryHandle`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryHandle)

Provides a handle to a file system directory.

[`FileSystemObserver`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemObserver)

Provides a mechanism to observe changes to selected files or directories.

[`FileSystemSyncAccessHandle`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemSyncAccessHandle)

Provides a synchronous handle to a file system entry, which operates in-place on a single file on disk. The synchronous nature of the file reads and writes allows for higher performance for critical methods in contexts where asynchronous operations come with high overhead, e.g., [WebAssembly](https://developer.mozilla.org/en-US/docs/WebAssembly). This class is only accessible inside dedicated [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) for files within the [origin private file system](#origin_private_file_system).

[`FileSystemWritableFileStream`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemWritableFileStream)

A [`WritableStream`](https://developer.mozilla.org/en-US/docs/Web/API/WritableStream) object with additional convenience methods, which operates on a single file on disk.

### Extensions to other interfaces

[`Window.showDirectoryPicker()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/showDirectoryPicker)

Displays a directory picker which allows the user to select a directory.

[`Window.showOpenFilePicker()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/showOpenFilePicker)

Shows a file picker that allows a user to select a file or multiple files.

[`Window.showSaveFilePicker()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/showSaveFilePicker)

Shows a file picker that allows a user to save a file.

[`DataTransferItem.getAsFileSystemHandle()`](https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem/getAsFileSystemHandle)

Returns a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) that fulfills with a [`FileSystemFileHandle`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle) if the dragged item is a file, or fulfills with a [`FileSystemDirectoryHandle`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryHandle) if the dragged item is a directory.

[`StorageManager.getDirectory()`](https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/getDirectory)

Used to obtain a reference to a [`FileSystemDirectoryHandle`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryHandle) object allowing access to a directory and its contents, stored in the [origin private file system](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system). Returns a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) that fulfills with a [`FileSystemDirectoryHandle`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryHandle) object.

## Examples

### Accessing files

The below code allows the user to choose a file from the file picker.

The following asynchronous function presents a file picker and once a file is chosen, uses the `getFile()` method to retrieve the contents.

### Accessing directories

The following example returns a directory handle with the specified name. If the directory does not exist, it is created.

The following asynchronous function uses `resolve()` to find the path to a chosen file, relative to a specified directory handle.

### Writing to files

The following asynchronous function opens the save file picker, which returns a [`FileSystemFileHandle`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle) once a file is selected. A writable stream is then created using the [`FileSystemFileHandle.createWritable()`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle/createWritable) method.

A user defined [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob) is then written to the stream which is subsequently closed.

The following show different examples of options that can be passed into the `write()` method.

### Synchronously reading and writing files in OPFS

This example synchronously reads and writes a file to the [origin private file system](#origin_private_file_system).

The following asynchronous event handler function is contained inside a Web Worker. On receiving a message from the main thread it:

- Creates a synchronous file access handle.
- Gets the size of the file and creates an [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) to contain it.
- Reads the file contents into the buffer.
- Encodes the message and writes it to the end of the file.
- Persists the changes to disk and closes the access handle.

**Note:** In earlier versions of the spec, [`close()`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemSyncAccessHandle/close "close()"), [`flush()`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemSyncAccessHandle/flush "flush()"), [`getSize()`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemSyncAccessHandle/getSize "getSize()"), and [`truncate()`](https://developer.mozilla.org/en-US/docs/Web/API/FileSystemSyncAccessHandle/truncate "truncate()") were unergonomically specified as asynchronous methods. This has now been [amended](https://github.com/whatwg/fs/issues/7 "External link (opens in new tab)"), but some browsers still support the asynchronous versions.

## Specifications

| Specification |
| --- |
| [File System](https://fs.spec.whatwg.org/) |
| [File System Access](https://wicg.github.io/file-system-access/) |
