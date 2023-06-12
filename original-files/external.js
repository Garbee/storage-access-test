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

    await document.requestStorageAccess();

    const hasAccess = await document.hasStorageAccess();
    if (hasAccess) {
      return await this.doFetch();
    }

    console.error(
      `For some reason we do not have access.
      Possibly denied by the user or automatically by the user agent.`
    );
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
