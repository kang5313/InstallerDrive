const express = require('express');
var bodyParser = require ('body-parser');
var app = express();
var path=require('path');
var cookieParser = require('cookie-parser');
var jwt = require('jsonwebtoken');
const FirebaseAuth = require('firebaseauth');
const firebaseAuth = new FirebaseAuth("AIzaSyAPIYWshsmMtTeoiHBEzFzhWsGRRQ6dU4g"); // Change to your Firebase Web API Key
const admin = require('firebase-admin')
const multer = require('multer')
const fs = require('fs')
const uploadFolder = __dirname+'/uploads/';

//Setup the path and storage for file upload by using multer. Seperate the filename and file extension then add timestamp behind file name
var storage = multer.diskStorage({
    destination:(req,file,callback)=>{  //Get the user email from cookie and check/visit the specific user directory , save the uploaded files into the specific user directory
        var useremail = req.cookies.userEmail;
        var path = __dirname+"/Uploads/"+useremail+"/";
        if(!fs.existsSync(path)){   //check the exist of directory synchronously
            fs.mkdirSync(path);
        }
        callback(null,path); 
    },
    filename:function(req,file,callback){
        var fileName = file.originalname.split(".")[0];
        var extension = file.originalname.split(".")[1];
        var uploadDate = new Date().toISOString().substring(0,10);
        callback(null,uploadDate+"-"+Date.now()+"-"+fileName+"."+extension);
    }
})

//Set limitation for file type and file size.
var upload = multer({
    storage:storage,
    limits : {
        fileSize: 100*1024*1024,    //100MB upload limit
        files :  1      // 1 file
    },
    fileFilter : function(req,file,callback){
        var ext = path.extname(file.originalname);
        if(ext!='.exe' && ext!='.dll' &&ext!='.zip'){
            return callback(new Error('Only .zip , .exe and .dll are allowed'));
        }
            return callback(null,true);
    }
}).any();


var serviceAccount = require('projectone-5e7be-firebase-adminsdk-h55nn-16ebad401b.json');   //Change to the path of your Firebase Admin-SDK private key jason file
admin.initializeApp({
    credential:admin.credential.cert(serviceAccount),
    databaseURL: "https://projectone-5e7be.firebaseio.com"  //Change to your firebase databaseURL
});
var db=admin.firestore();
var i = "Aemulus Corp";
var a = 'http://localhost:3000/aemulus';
var signKey = "TOeo7C5Z-6HVn3mI8G-vX-TUhUBaU128zGNO0v-ghyTj6_B5xt3gbr0uodEZAjommr3GD290a1jLmWKo4yvpzg"; //Change to your signature key for JWT
var uid;

app.use(express.static(__dirname+'/assets'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());

//Generate Custom Token After Login Or Registration
function GenerateToken(email,res){
    var payload = {
        Email : email,
    }

    var signOptions = {
        issuer : i,
        subject : email,
        audience : a,
        expiresIn : "1h",
        algorithm : "HS256"
    };

    res.locals.token = jwt.sign(payload,signKey,signOptions);
    res.cookie("token",res.locals.token);
    res.cookie("userEmail",email);
    res.write("Welcome");
    res.send();
}

//Access Control For Login & Registration Page (Redirect to main)
/*If the cookie is not empty and jwt is successfully verified the page,
the webpage will be redirected to main page. This is to prevent user access the login & register page after they signed in*/
function accessControlAuthenticated(req,res,url,uid){
    var verifyOptions = {
        issuer : i,
        subject : req.body.userEmail,
        audience : a,
        expiresIn : "1h",
        algorithm : "HS256"
    };

    if(req.cookies!=null){
        jwt.verify(req.cookies.token,signKey,verifyOptions,function(err,decoded){
            if(err)
                return;
            else
            {
                uid = decoded.uid;
                res.redirect(url);
            }
        })
    }
    else
         res.redirect('/login');
}

/*Access Control For Unauthenticated User (redirect to login page)
If the cookie is empty or the jwt in the cookie is false after verified,
then the webpage will be redirected to login page.*/
function accessControlUnauthenticated(req,res,url,uid){
    var verifyOptions = {
        issuer : i,
        subject : req.body.userEmail,
        audience : a,
        expiresIn : "1h",
        algorithm : "HS256"
    };
    
    if(req.cookies!=null){
        jwt.verify(req.cookies.token,signKey,verifyOptions,function(err,decoded){
            if(err)
            {
                res.redirect(url);
            }
            else 
            {
                return;
            }
        })
    }
    else{
         res.redirect('/login');
    }
}

//'GET' Login Page
app.get('/login',(req,res,next)=>{
    accessControlAuthenticated(req,res,'/main');
    next();
})
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname,'assets','login.html'));
});

//'POST' Login Page
/*User signs in with email and password. A jwt is generated and sent to the client after successful sign-in*/
app.post('/login', (req, res,next) => {
    var email = req.body.userEmail;
    var password = req.body.userPass;
    firebaseAuth.signInWithEmail(email, password,function(error,result){
        if(error)
        {
            console.log(error.message);
            res.send(error.message);
        }
        else
        {   
            next();
        }
    })
});
app.post('/login',(req,res)=>{
    GenerateToken(req.body.userEmail,res);
})

//'GET' Register
app.get('/register',(req,res,next)=>{
    accessControlAuthenticated(req,res,'/main');
    next();
})
app.get('/register',(req,res)=>{
    res.sendFile(path.join(__dirname,'assets','register.html'));
})

//'POST' Register
/*User registers with email and password. A jwt is generated and sent to the client after successful register*/
app.post('/register', (req, res,next) => {
    var email = req.body.userEmail;
    var password = req.body.userPass;
    var docRef= db.collection('Users').doc(email);
    firebaseAuth.registerWithEmail(email,password,"",function(error,result){
        if(error){
            console.log(error.message);
            res.send(error.message);
        }
        else{
            var information = docRef.set({
                FirstName : req.body.firstName,
                LastName : req.body.lastName
            });
            next();
        }
    });
});
app.post('/register',(req,res)=>{
    GenerateToken(req.body.userEmail,res);
})

//'GET' SignOut
app.get('/signout',(req,res)=>{
     res.clearCookie("token");
     res.redirect('/login');
    
})

//'GET'Main Page
app.get('/main', (req, res,next) => {
    accessControlUnauthenticated(req,res,"/login",uid);
    next();
    });

app.get('/main',(req,res)=>{
    res.sendFile(path.join(__dirname,'assets','main.html'));
})

//UPLOAD FILES TO EXPRESS
app.post('/main',function(req,res){
    upload(req,res,function(err){
        if(err instanceof multer.MulterError){
            console.log()
            res.send(err.message);
        }
        else if (err){
            res.send(err.message);
        }
        else{
            res.send("Files are uploaded successful");
        }
    })
})

//Retrieve all the uploaded files from directory
app.get('/main/files/getall',function(req,res,next){
    accessControlUnauthenticated(req,res,"/login",uid);
    next();
})

app.get('/main/files/getall',function(req,res){
    var directory = uploadFolder+req.cookies.userEmail;
    if(fs.existsSync(directory)){
        fs.readdir(directory,(err,files)=>{
            if(err)
                console.log(err);
            res.send(JSON.stringify(files));    //Pass the files in the directory to the client in string format
        })
    }
})

//Download the uploaded files
app.get('/main/files/:filename',function(req,res,next){
    accessControlUnauthenticated(req,res,"/login",uid);
    next();
})


app.get('/main/files/:filename',function(req,res){
    var filename = req.params.filename;
    var directory = uploadFolder+req.cookies.userEmail+"/";
    res.download(directory+filename);
})

//AJAX retrieve user data from firestore
app.get('/username/:uid',function(req,res,next){
    accessControlUnauthenticated(req,res,"/login",uid);
    next();
})

app.get('/username/:uid',(req,res)=>{
    var userEmail = req.params.uid;
    var userRef = db.collection('Users').doc(userEmail);
    userRef.get()
        .then(doc =>
        {
            if(!doc.exists){
                console.log("No such Document");
            }else{
                username = doc.data().LastName+" "+doc.data().FirstName;
                res.send(username);
            }
        })
        .catch(err =>
            {
                console.log('err');
            })
})

//'POST' Reset Password
app.post('/login/reset',(req,res)=>{
    firebaseAuth.sendPasswordResetEmail(req.body.userEmail,function(error,result){
        if(error)
        {
            console.log(error.message);
        }
        else{
            console.log(result);
        }
    })
})

app.get('/delete/filename/:fileToDelete',(req,res)=>{
    var fileToDelete = req.params.fileToDelete;
    var directory = uploadFolder+req.cookies.userEmail+"/";
    fs.unlinkSync(directory+fileToDelete);
    res.send("Successful!");
})

//LOGIN WITH GOOGLE
app.post('/Google', (req, res) => {
    var docRef= db.collection('Users').doc(req.body.email);
    firebaseAuth.loginWithGoogle(req.body.accesstoken,function(err,result){
        if(err)
            console.log(err);
        else
        {
            var information = docRef.set({
                FirstName : req.body.firstname,
                LastName : req.body.lastname
            });

            GenerateToken(req.body.email,res);
        }
        })

});

const port = process.env.PORT||3000;
app.listen(port,()=>console.log(`Listening on port ${port}...`))