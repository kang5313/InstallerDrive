var registerButton = document.getElementById("registerBtn");

//Register
registerButton.addEventListener("click",function(){
    
    var userFirstName = document.getElementById("inputFirstName").value;
    var userLastName = document.getElementById("inputLastName").value;
    var userPswConfirm = document.getElementById("inputPwConfirm").value;
    var userEmail = document.getElementById("inputEmail").value;
    var userPassword = document.getElementById("inputPassword").value;
    var url="http://localhost:3000/register";
    var xmlHttp = new XMLHttpRequest();

    if(userFirstName=="")                                                           //Input validation
    {
        window.alert("Please enter your first name.");
        document.getElementById("inputFirstName").focus();
    } else if(userLastName=="") {
        window.alert("Please enter your last name");
        document.getElementById("inputLastName").focus();
    } else if(userEmail=="") {
        window.alert("Please enter your email");
        document.getElementById("inputEmail").focus();
    } else if(userPassword=="") {
        window.alert("Please enter your password");
        document.getElementById("inputPassword").focus();
    } else if(userPswConfirm=="") {
        window.alert("Please enter your password again");
        document.getElementById("inputPwConfirm").focus();
    } else if(userPassword!=userPswConfirm){
        window.alert("Those passwords do not match. Try Again");
        document.getElementById("inputPwConfirm").focus();
    }else{
        const data = {
            "firstName":userFirstName,
            "lastName":userLastName,
            "userEmail":userEmail,
            "userPass":userPassword
        }
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
});

                                                                                    //Visible Password
function showPassword(){
    var pswd = document.getElementById("inputPassword");
    if(pswd.type === "password"){
        pswd.type = "text";
    }

    else{
        pswd.type = "password";
    }
}


function resetValue()
{
    document.getElementById("inputFirstName").value='';
    document.getElementById("inputLastName").value='';
    document.getElementById("inputPwConfirm").value='';
    document.getElementById("inputEmail").value='';
    document.getElementById("inputPassword").value='';
}


