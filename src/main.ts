// import App from './App.ts'

// document.addEventListener('DOMContentLoaded',()=>{
// const app = new App()
// app.render()

// })

import Form from "./Form";

const form = new Form();
const FormElement = form.element();

FormElement && document.body.appendChild(FormElement);
