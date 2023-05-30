import { createAgent } from "http://localhost:8081/external.js";

window.agent = createAgent('http://localhost:8081');

window.fireLogin = function () {
  const event = new CustomEvent('app-login');
  document.body.dispatchEvent(event);
};

window.logout = function () {
  agent.logout();
};

window.addEventListener('message', event => {
  console.log(event);
  switch (event.data.responseTo) {
    case 'login':
      if (event.data.data === true) {
        fireLogin();
      }
      break;
    case 'isLoggedIn':
      if (event.data.data === true) {
        fireLogin();
      }
      alert(event.data.data);
      break;
    default:
      break;
  }
});

const isLoggedInAction = document.querySelector('#check-login');
const authForms = document.querySelector('.auth-forms');
const loginForm = document.querySelector('#login-form');
const signupForm = document.querySelector('#signup-form');
const messageForm = document.querySelector('#message-form');
const logoutAction = document.querySelector('#logout');

isLoggedInAction.addEventListener('click', () => {
  agent.isLoggedIn();
});

signupForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = event.target.elements.email.value;
  const password = event.target.elements.password.value;
  await agent.signUp(email, password);
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = event.target.elements.email.value;
  const password = event.target.elements.password.value;
  await agent.login(email, password);
});

messageForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const message = event.target.elements.content.value;
  await agent.sendMessage(message);
});

document.body.addEventListener('app-login', () => {
  authForms.hidden = true;
  logoutAction.hidden = false;
  messageForm.removeAttribute('hidden');
});

logoutAction.addEventListener('click', () => {
  logout();
});

document.body.addEventListener('app-logout', () => {
  authForms.hidden = false;
  messageForm.hidden = true;
  logoutAction.hidden = true;
});

// Need to wait a little bit in this demo for the iframe
// to come online.
await new Promise((resolve) => {
  setTimeout(() => {
    resolve();
  }, 2000);
})
agent.isLoggedIn();
