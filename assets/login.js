function login(){
    
    var userEmail = document.getElementById("inputEmail").value;
    var userPass = document.getElementById("inputPassword").value;
    var url="http://localhost:3000/login";
    var xmlHttp = new XMLHttpRequest();
    const data = {
        "userEmail":userEmail,
        "userPass":userPass
    }
    if(userEmail==""||!userEmail)                                                           //Input validation
    {
        window.alert("Please enter your email.");
        document.getElementById("inputEmail").focus();
    } else if(userPass=="") {
        window.alert("Please enter your password");
        document.getElementById("inputPassword").focus();
    }else{
        xmlHttp.open("POST",url,true);
        xmlHttp.setRequestHeader('Content-Type','application/json');
        xmlHttp.send(JSON.stringify(data));
        xmlHttp.onreadystatechange = function(){
            if(this.readyState != 4 ) return;
                
            if(this.status == 200){
                window.alert(xmlHttp.responseText);
                window.location.href = "http://localhost:3000/main";
            }
            
        }
    }
}

function resetPw(){
    var userEmail = document.getElementById("inputEmail").value;
    var url="http://localhost:3000/login/reset/";
    const data = {
        "userEmail":userEmail
    }
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("POST",url,true);
    xmlHttp.setRequestHeader('Content-Type','application/json; charset=UTF-8');
    xmlHttp.send(JSON.stringify(data));
    if(xmlHttp.DONE)
        window.location.href="http://localhost:3000/login"
}

function onSignIn(googleUser) {
    // Useful data for your client-side scripts:
    var profile = googleUser.getBasicProfile();
    // The ID token you need to pass to your backend:
    var access_token = googleUser.getAuthResponse().access_token;
    console.log("Access token : " + access_token)

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open('POST',"http://localhost:3000/Google")
    xmlHttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xmlHttp.onload = function() {
        console.log('Signed in as: ' + xmlHttp.responseText);
    };
    xmlHttp.onreadystatechange = function(){
        if(this.readyState != 4 ) return;
            
        if(this.status == 200){
            window.alert(xmlHttp.responseText);
            window.location.href = "http://localhost:3000/main";
        }
    }

    xmlHttp.send('accesstoken='+access_token+'&email='+profile.getEmail()+"&firstname="+profile.getGivenName()+"&lastname="+profile.getFamilyName());
}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
      console.log('User signed out.');
    });
  }