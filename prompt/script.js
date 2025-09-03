let username = prompt("what is your name?");
console.log(`Welcome ${username} Please sit here.`);
console.log("we will check your BMI today.");
let height = Number(prompt("Please enter the height in cm"));
let weight = Number(prompt("please enter the weight"));

console.log(height + 10);
let heightinmeters = height / 100;
let Bmi = Number((weight / heightinmeters ** 2).toFixed(2));
console.log(`Your BMI is ${Bmi}`);
// if (Bmi < 18.5) {
//   console.log("Thin");
// } else if (Bmi >= 18.5 && Bmi < 24.9) {
//   console.log("Normal weight");
// } else if (Bmi > 24.9) {
//   console.log("Fat");
// }

Bmi >= 18.5 
? console.log("Thin")
: Bmi > 25
? console.log("Fat")
: console.log("Normal");
