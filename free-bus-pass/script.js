const seatAvailable = document.getElementById("seatAvailable");
const ageAbove50 = document.getElementById("ageAbove50");
const hasAadhar = document.getElementById("hasAadhar");
const checkButton = document.getElementById("checkStatus");
const passengerStatus = document.getElementById("status");

checkButton.addEventListener("click", function () {
  let isSeatAvailable = seatAvailable.checked;
  let isAgeAbove50 = ageAbove50.checked;
  let hasAadharCard = hasAadhar.checked;

  let feedback;
  if (isSeatAvailable) {
    console.log("seat is available");
    feedback = "Seat is available";
    if (isAgeAbove50) {
      console.log("Age above 50");
      feedback = feedback + ",Age above 50";

      if (hasAadharCard) {
        console.log("Aadhar card is available");
        feedback = feedback + ",Aadhar card is available";
       confirm("Are you sure? Do you want to come inside?")
       let confirmmsg= confirm("Are you sure? Do you want to come inside?");
        if(confirmmsg){
          alert(" please open the door");
        }
      } else {
        console.log("No Aadarcard");
        feedback = feedback + ",No Aadarcard";
      }
    } else {
      console.log("But your age is below 50");
      feedback = feedback + ",But your age is below 50";
    }
  } else {
    console.log("seat is not available");
    feedback = "Seat is not available";
    
  }
  passengerStatus.innerHTML = feedback;
});
