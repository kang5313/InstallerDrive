
function uploadFile(FormElement){
    var url = "http://localhost:3000/main"
    //document.getElementById("formUpload").submit();
    //document.getElementById("formUpload").onsubmit = function()
    var xmlHttp = new XMLHttpRequest();
    var formData = new FormData();
    //var files = document.getElementById("fileToUpload").files[3];
    
    formData.append("file-to-upload",document.getElementById("fileToUpload").files[0]);
    xmlHttp.open(FormElement.method,url,true);
    xmlHttp.send(formData);
    xmlHttp.onreadystatechange = function(){
        if(this.readyState != 4 ) return;
            
        if(this.status == 200){
            window.alert(xmlHttp.responseText);
            window.location.href=url;
        }
    }
}

function listAllFile(){
    var url = "http://localhost:3000/main/files/getall";
    var currentUrL = window.location;
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET",url,true);
    xmlHttp.onreadystatechange = function(){
        var fileList = document.getElementById("listFiles");
        fileList.innerHTML = "";

        if(this.readyState == 4 && this.status == 200){
        var data = xmlHttp.response;
        var files = [];
        var fileKeys = Object.values(data);
        files = JSON.parse(data);
        files.forEach(element => {
            var node = document.createElement("LI");
            var linkNode = document.createElement("A");
            var textnode = document.createTextNode(element);
            linkNode.setAttribute('href',currentUrL+"/files/"+element);
            linkNode.appendChild(textnode);
            node.appendChild(linkNode);
            fileList.appendChild(node);
        });
    }
    }
    xmlHttp.send();
}

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