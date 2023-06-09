import { createAgent } from "http://localhost:8081/external.js";

window.agent = createAgent('http://localhost:8081');

const buttonTrigger = document.querySelector('button');

buttonTrigger.addEventListener('click', () => {
  agent.doFetch();
});
