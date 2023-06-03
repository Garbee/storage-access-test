# Storage Access Demo Project

Quick concept of using the storage access API in Safari.

Running locally is possible but more work since you need to make up some fake domains
to route locally using a hosts file to force this.

Steps to test using a hosted version:

1. Visit https://storage.garbee.me which is the host domain
1. Click the "Send ajax request" button which will just fetch itself
1. Visit https://storage.garbee.me which is the iframed domain
1. Open DevTools
1. Click the "Send ajax request" button which is in side of the iframe of the host.
1. See the popup asking to give permission to access cookies
1. Allow access
1. Check the network request and verify the HTTP only cookie was sent with `header=value;` at the start

To clear the prompt memory, you need to clear history. If you conducted the rest recently and need to keep Safari history you can delete the last hour. Otherwise figure out how to delete these domains specifically or all history.
