//Display the File Upload Container
function displayUpload(){  
    var x = document.getElementById("FileUploadContainer");
    if(x.style.display=="block"){
        x.style.display = "none";
    }else{
        x.style.display = "block";
    }
}

//Get the form file input and set into FormData. POST to expressJS.
function uploadFile(FormElement){
    var url = "http://localhost:3000/main"
    var xmlHttp = new XMLHttpRequest();
    var formData = new FormData();
    if(document.getElementById("fileToUpload").files.length !=0) // Validation for empty input.
    {
        formData.append("file-to-upload",document.getElementById("fileToUpload").files[0]);
        xmlHttp.open(FormElement.method,url,true);
        xmlHttp.send(formData);
        xmlHttp.upload.onprogress = function(e){
            if (e.lengthComputable) {
                var percentage = (e.loaded / e.total) * 100;
                window.alert(percentage+"%");
              }
        }
        xmlHttp.onreadystatechange = function(){
        if(this.readyState != 4 ) return;
        
        if(this.status == 200){
                window.alert(xmlHttp.responseText);
                window.location.reload();
            }
        }

    }
    else{
        window.alert("No File Is Selected");
    }
}

function setAttributes(el, attrs) {
    for(var key in attrs) {
      el.setAttribute(key, attrs[key]);
    }
  }

function listAllFile(){
    var fileCounter = 0;
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
        files = JSON.parse(data);   //Parse the filename into JSON and store into array.
        files.reverse();    // Sort the files in descending order.
        files.forEach(element => {    // Read the directory and append the filenames into the list element in HTML
            var node = document.createElement("LI");
            var div = document.createElement("DIV");
            var deleteButton = document.createElement("A")
            var deleteBtnIcon = document.createElement("I");
            setAttributes(deleteBtnIcon,{'class':"fas fa-trash-alt","id":fileCounter})  //This is to link the delete button with the associated file name
            deleteButton.setAttribute('href',"javascript:deleteFile("+fileCounter+")");
            deleteButton.appendChild(deleteBtnIcon);
            var linkNode = document.createElement("A");
            var textnode = document.createTextNode(element);
            setAttributes(linkNode,{'href':currentUrL+"/files/"+element,"id":"file"+fileCounter});
            linkNode.appendChild(textnode);
            div.appendChild(linkNode);
            div.appendChild(deleteButton);
            node.appendChild(div);
            fileList.appendChild(node);
            fileCounter +=1;
        });
    }
    }
    xmlHttp.send();
    
    var x = document.getElementById("FileContainer");
    if(x.style.display=="block"){
        x.style.display = "none";
    }else{
        x.style.display = "block";
    }
}

function deleteFile(fileCounter){
    var fileToDelete = document.getElementById("file"+fileCounter).textContent;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function(){
        if(this.readyState != 4 ) return;
        
        if(this.status == 200){
                window.alert(xmlHttp.responseText);
                window.location.reload();;
            }
        }
    xmlHttp.open("GET","/delete/filename/"+fileToDelete,true);
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