# -ExpressJS-File-Upload-Download
This web application is developed on previous [USER CRUD Skeleton](https://github.com/kang5313/ExpressJS-User-CRUD). <br>A web application for user to upload their .exe , .dll and .zip files to the web server.

## Get Started
Follow the `GET STARTED` instructions on [USER CRUD Skeleton](https://github.com/kang5313/ExpressJS-User-CRUD). <br>

## Features
### Upload
[Multer](https://github.com/expressjs/multer) middleware is used for handling the `multipart/form-data`,which is primarily used for uploading files.<br>
The limitations for the uploaded file type and size are <b>100MB</b>, only <b>.zip ,.exe , .dll</b>. However, you may change these limitation in <b>index.js</b> `var upload = multer({...})`.<br><br>

A directory named by the useremail will be created in <b>.../uploads</b> for storing the user's uploaded file, once the user has uploaded any file to the web server.

### Download
When the users click on the <b>Download</b> button, the users' uploaded file in the useremail named directory will be read and display to user. The files are sorted in descending order of their uploaded date and time. The users can only retrieve the files uploaded by them. Click on the selected file, the expressJS will send a `res.download(...)` response from the backend server to user.

### Delete
When the files are retrieved from the directory and appended into the `<ul>...</ul>` element in the <b>main.html</b>, every `<li>...</li>` elements are followed by a trashbin icon for deletion. A counter is used to named the id for the trashbin icon element and the associated filename. When the user click on the trashbin icon, the icon id will be read to find the relative file.The relative file will be deleted from the directory by the `res.unlinkSync(...)` in <b>index.js</b>.
