const express = require('express');
var bodyParser = require ('body-parser');
var app = express();
var path=require('path');
var cookieParser = require('cookie-parser');
const fs = require('fs');
var jwt = require('jsonwebtoken');
const FirebaseAuth = require('firebaseauth');
const firebaseAuth = new FirebaseAuth("AIzaSyAPIYWshsmMtTeoiHBEzFzhWsGRRQ6dU4g");
const admin = require('firebase-admin')
var serviceAccount = require('projectone-5e7be-firebase-adminsdk-h55nn-16ebad401b.json');
admin.initializeApp({
    credential:admin.credential.cert(serviceAccount),
    databaseURL: "https://projectone-5e7be.firebaseio.com"
});
var db=admin.firestore();
var i = "Aemulus Corp";
var a = 'http://localhost:3000/aemulus';
var privateKey = fs.readFileSync('private.key','utf8');
var publicKey = fs.readFileSync('public.key','utf8');
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
    var s = email;

    var signOptions = {
        issuer : i,
        subject : s,
        audience : a,
        expiresIn : "1h",
        algorithm : "RS256"
    };

    res.locals.token = jwt.sign(payload,privateKey,signOptions);
    res.cookie("token",res.locals.token);
    res.cookie("userEmail",email);
    res.write("Welcome");
    res.send();
}

//Access Control For Login & Registration Page (Redirect to main)
function accessControlAuthenticated(req,res,url,uid){
    var verifyOptions = {
        issuer : i,
        subject : req.body.userEmail,
        audience : a,
        expiresIn : "1h",
        algorithm : "RS256"
    };

    if(req.cookies!=null){
        var x = jwt.verify(req.cookies.token,publicKey,verifyOptions,function(err,decoded){
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

//Access Control For Unauthenticated User (redirect to login page)
function accessControlUnauthenticated(req,res,url,uid){
    var verifyOptions = {
        issuer : i,
        subject : req.body.userEmail,
        audience : a,
        expiresIn : "1h",
        algorithm : "RS256"
    };
    
    if(req.cookies!=null)
    {var x = jwt.verify(req.cookies.token,publicKey,verifyOptions,function(err,decoded){
            if(err)
                {
                    console.log("You Entered Here")
                    res.redirect(url);}
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

//AJAX retrieve user data from firestore
app.get('/username/:uid',(req,res)=>{
    var userEmail = req.params.uid;
    var userRef = db.collection('Users').doc(userEmail);
    var getDoc = userRef.get()
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