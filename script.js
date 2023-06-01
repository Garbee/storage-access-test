window.sendFetch = async function () {
  const doFetch = function () {
    return fetch(this.frame.src, {
      method: 'GET',
      credentials: 'include',
    });
  };

  if (document.hasStorageAccess === null) {
    return await doFetch();
  }

  const hasAccess = await document.hasStorageAccess();
  if (hasAccess) {
    return await doFetch();
  }

  const permission = await navigator.permissions.query({
    name: "storage-access",
  });

  if (permission.state === "granted") {
    await document.requestStorageAccess();
    return await doFetch();
  }
  if (permission.state === "prompt") {
    await document.requestStorageAccess();
    return await doFetch();
  }
  if (permission.state === "denied") {
    // User has denied unpartitioned cookie access, so we'll
    // need to do something else
    console.error('The user has denied access to 3rd party cookies');
  }
};

window.fireLogin = function () {
  const event = new CustomEvent('app-login');
  document.body.dispatchEvent(event);
};

window.showMessage = function (message) {
  const item = document.createElement('li');
  item.textContent = message;
  document.querySelector('output ul').appendChild(item);
};

window.signUp = async function (email, password) {
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error(error);
    return;
  }

  fireLogin();
}

window.login = async function (email, password) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    console.error(error);
    document.cookie = 'loggedin=false';
    return false;
  }

  fireLogin();
  document.cookie = "loggedin=true";
  return true;
}

window.logout = async function () {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    console.error(error);
    return;
  }

  const event = new CustomEvent('app-logout');
  document.body.dispatchEvent(event);
};

window.sendMessage = async function (message) {
  const { data, error } = await supabaseClient
    .from('messages')
    .insert({ id: crypto.randomUUID(), content: message })
    .select();

  if (error) {
    console.error(error);
    return;
  }

  console.log(data);
};

window.isLoggedIn = async function () {
  const { data, error } = await supabaseClient.auth.getSession();

  if (error) {
    console.error(error);
    document.cookie = "loggedin=false";
    return false;
  }

  if (data.session === null) {
    document.cookie = "loggedin=false";
    return false;
  }

  document.cookie = "loggedin=true";

  return true;
};

window.addEventListener('message', async (event) => {
  const { command, data } = event.data;
  switch (command) {
    case 'sendFetch':
      event.source.postMessage({
        responseTo: 'sendFetch',
        data: await window.sendFetch(),
      }, event.origin);
      break;
    case 'login':
      event.source.postMessage({
        responseTo: 'login',
        data: await window.login(data.username, data.password),
      }, event.origin);
      break;
    case 'logout':
      await window.logout();
      event.source.postMessage({
        responseTo: 'logout',
        data: true,
      }, event.origin);
      break;
    case 'sendMessage':
      await window.sendMessage(data.message);
      break;
    case 'isLoggedIn':
      event.source.postMessage({
        responseTo: 'isLoggedIn',
        data: await window.isLoggedIn(),
      }, event.origin);
    default:
      break;
  }
});


const ajaxAction = document.querySelector('#ajax-action');

const isInIframe = window.location !== window.parent.location;
const authForms = document.querySelector('.auth-forms');
const loginForm = document.querySelector('#login-form');
const signupForm = document.querySelector('#signup-form');
const messageForm = document.querySelector('#message-form');
const isLoggedInAction = document.querySelector('#check-login');
const logoutAction = document.querySelector('#logout');

window.supabaseClient = supabase.createClient(
  'https://chycynzncbdqtqyjlyyj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoeWN5bnpuY2JkcXRxeWpseXlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODUyMTA2NTYsImV4cCI6MjAwMDc4NjY1Nn0.H6gwYivdujbtuUauFBwhBAN7lJ7e-etASLgo6vovxJQ',
);

const { data, error } = await supabaseClient.auth.getSession();
if (data.session !== null) {
  authForms.hidden = true;
  logoutAction.hidden = false;

  if (isInIframe === false) {
    messageForm.removeAttribute('hidden');
  }

  const channel = supabaseClient
    .channel('table-db-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      },
      (payload) => showMessage(payload.new.content)
    )
    .subscribe()
}

isLoggedInAction.addEventListener('click', async (event) => {
  const result = await isLoggedIn();
  alert(result);
});

signupForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = event.target.elements.email.value;
  const password = event.target.elements.password.value;
  await signUp(email, password);
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = event.target.elements.email.value;
  const password = event.target.elements.password.value;
  await login(email, password);
});

messageForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const message = event.target.elements.content.value;
  await sendMessage(message);
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

ajaxAction.addEventListener('click', () => {
  agent.sendFetch();
});
