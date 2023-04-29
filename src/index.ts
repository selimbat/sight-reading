import { Vex } from "vexflow";

function component() {
    const element = document.createElement('div');


    element.innerHTML = "Hello VexFlow";
    return element;
}

document.body.appendChild(component());
console.log(Vex)
