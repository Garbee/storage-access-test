class Agent {
  frame;
  host;

  constructor(host) {
    this.host = host;
    this.frame = document.createElement('iframe');
    const sandboxTokens = [
      // this triggers some console errors in Chrome, fix it later.
      'allow-storage-access-by-user-activation',
      'allow-scripts',
      'allow-same-origin',
    ];
    sandboxTokens.forEach(token => this.frame.sandbox.add(token));

    this.frame.hidden = true;

    this.frame.src = "http://localhost:8081";

    document.body.appendChild(this.frame);
  }

  logout() {
    this.frame.contentWindow.postMessage({
      command: 'logout',
    }, this.host);
  }

  login(username, password) {
    this.frame.contentWindow.postMessage({
      command: 'login',
      data: {
        username,
        password,
      },
    }, this.host);
  }

  sendMessage(message) {
    this.frame.contentWindow.postMessage({
      command: 'sendMessage',
      data: {
        message,
      },
    }, this.host);
  }

  isLoggedIn() {
    this.frame.contentWindow.postMessage({
      command: 'isLoggedIn',
    }, this.host);
  }

  getCookie() {
    return document.cookie;
  }

  destroy() {
    document.body.removeChild(this.frame);
    this.frame.remove();
    this.frame = undefined;
  }
}

export const createAgent = function (host) {
  return new Agent(host);
};
