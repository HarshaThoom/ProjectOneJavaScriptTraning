let name = "Suresh";
let address="palasa, Srikakulam, Andhra Pradesh";

console .log( `${name} is from ${address}` );

let student={
    name:"Suresh",
    address:"palasa, Srikakulam, Andhra Pradesh",
    gender:" Male",
}
console.log(`${student.name}is from ${student.address}`);
console.log(student);
student.Age=20;
console.log(student);
//delete student.address;
console.log(student);
console.log(student.address);
// Check if the address property exists before logging
 if (student.address) {
     console.log(student.address);
 } else {
     console.log("Address property does not exist.");
 }

 let fullName= "Suresh Kumar";
 console.log(fullName.toUpperCase());