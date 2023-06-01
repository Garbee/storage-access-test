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

  async getCookie() {
    if (document.hasStorageAccess === null) {
      return document.cookie;
    }

    const hasAccess = await document.hasStorageAccess();

    if (hasAccess) {
      return document.cookie;
    }

    const permission = await navigator.permissions.query({
      name: "storage-access",
    });

    if (permission.state === "granted") {
      // If so, you can just call requestStorageAccess() without a user interaction,
      // and it will resolve automatically.
      await document.requestStorageAccess();
      return document.cookie;
    } else if (permission.state === "prompt") {
      // Need to call requestStorageAccess() after a user interaction
      document.body.addEventListener("click", async () => {
        try {
          await document.requestStorageAccess();
          return document.cookie;
        } catch (err) {
          console.error(`Error obtaining storage access: ${err}.`);
        }
      });
    } else if (permission.state === "denied") {
      // User has denied unpartitioned cookie access, so we'll
      // need to do something else
    }
  }

  doFetch() {
    return fetch(this.frame.src, {
      method: 'GET',
      credentials: 'include',
    });
  }

  async sendFetch() {
    if (document.hasStorageAccess === null) {
      return await this.doFetch();
    }

    const hasAccess = await document.hasStorageAccess();
    if (hasAccess) {
      return await this.doFetch();
    }

    // Chromium only thing
    // const permission = await navigator.permissions.query({
    //   name: "storage-access",
    // });

    try {
      await document.requestStorageAccess();
    } catch {
      console.error('Access to our cookies was denied');
    }

    return await doFetch();
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
