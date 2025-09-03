/*let Book = prompt("How is the book?");
console.log(Book);
console.log(Book.toLocaleLowerCase());
if (Book.toLocaleLowerCase == "good") {
  console.log("buy it");
} else {
  console.log("don't buy it");
}*/

let totalScore = Number(prompt("what is your total score?"));
console.log(totalScore);

// if (totalScore === 25) {
//   console.log("Excellent");
// } else if (totalScore >= 20,&& totalScore < 25) {
//   console.log("Good");
// } else {
//   console.log("Average");
// }

totalScore == 25
  ? console.log("Execlent")
  : totalScore >= 20 && totalScore < 25
  ? console.log("Good")
  : console.log("Average");
