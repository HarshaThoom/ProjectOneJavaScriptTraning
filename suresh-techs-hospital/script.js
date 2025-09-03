let bmiForm = document.querySelector(".bmi-form");
bmiForm.addEventListener("submit", function (e) {
  //To prevent the default behavior of the form submission
  e.preventDefault();
  // e.target refers to the form element
  const form = e.target;

  // Access individual form elements using e.target
  const name = form.querySelector("#name").value;
  const weight = +form.querySelector("#weight").value;
  const height = +form.querySelector("#height").value;

  let heightinmeters = height / 100;
  let bmi = +(weight / heightinmeters ** 2).toFixed(2);
  console.log("BMI:", bmi);
  // bmi <= 18.5
  //   ? console.log("Thin")
  //   : bmi > 25
  //   ? console.log("Fat")
  //   : console.log("Normal");

  let result = bmi <= 18.5
  ? "Thin"
  : bmi > 25
  ? "Fat"
  : "Normal";

console.log(result);

  //Write your logic here.
  //Logic begins

  //Logic ends

  //Uncomment below code after writing your logic
  form.querySelector("#result").textContent = `${name}, You are ${result}`;
});

//Below code is reset the form - will explain later
document.querySelector("#reset").addEventListener("click", function (e) {
  bmiForm.querySelector("#name").value = "";
  bmiForm.querySelector("#weight").value = "";
  bmiForm.querySelector("#height").value = "";
  bmiForm.querySelector("#result").textContent = "";
});
