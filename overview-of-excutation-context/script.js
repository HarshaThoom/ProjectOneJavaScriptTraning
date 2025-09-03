let Suresh,Haressh,Naresh;
let currentTotalAge = 0;
Suresh= +(prompt("Suresh, whats your age?"));
thankYouMessage("Suresh", Suresh);
 Hareesh= +(prompt("Hareesh, whats your age?"));
thankYouMessage("Hareesh", Hareesh);
 Naresh =+(prompt("Naresh, whats your age?"));
thankYouMessage("Naresh", Naresh);


function thankYouMessage(name,age) {
    console.log(`${name} age is: ${age||"Age not provided"}`);
    currentTotalAge = currentTotalAge +age;
    let eligibleForDL= age>18;
 if (eligibleForDL) {
       console.log(`${name},you will get a driving license`);
 }else{
    console.log(`${name},you need to wait for ${18 - age} more years to get a driving license`);
 }
    console.log(`Current total age is: ${currentTotalAge}`);
    console.log("Thanks you for answering")
    if(eligibleForDL){
        console.log("please Suscribe to our channel");
    }
   // console.log ("please Suscribe to our channel");
    console.log("Have a nice day");
    }
