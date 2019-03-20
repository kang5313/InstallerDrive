

function logout(){
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
      console.log('User signed out.');
    });
    window.location.href = "http://localhost:3000/signout";
}

function getUrlParam(){
    var urlParams = new URLSearchParams(window.location.search);
    return(urlParams.get('uid'));
}

function getCookieValue(cookieName) {
    var b = document.cookie.match('(^|;)\\s*' + cookieName + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
}

function retrieveUserProfile(){
    
    gapi.load('auth2',function(){
        gapi.auth2.init();
    })
    var xhttp = new XMLHttpRequest();
    var uid = getUrlParam();
    var email = getCookieValue("userEmail");
    xhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            document.getElementById("username").innerHTML =
            this.responseText;
        }
    };
    
    xhttp.open("GET","/username/"+email,true);
    xhttp.send();
}