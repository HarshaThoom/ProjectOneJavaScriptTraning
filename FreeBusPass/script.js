let isSeatAvailable = prompt("is seat available?");

if (isSeatAvailable.toLowerCase()== "yes") {
  console.log("seat is available");
  let isAgeAbove50 = prompt("is age above 50?");
  if (isAgeAbove50.toLowerCase() == "yes") {
    console.log("Age above 50");
    let hasAadhaarCard = prompt("Do you have aadhaar card?");
    if (hasAadhaarCard.toLowerCase() == "yes") {
      console.log("Yes have Aadarcard");
      alert("Please Enter The Bus");
    } else {
      console.log("No Aadarcard");
    }
  } else {
    console.log("But your age is below 50");
  }
} else {
  console.log("seat is not available");
}
