# Storage Access Demo Project

Quick concept app using Supabase authentication and database to test a concept with
the Storage Access API.


To run:

1. Install dependencies with `npm ci`
1. Run the servers with `npm start`
1. Open `http://localhost:8081` and signup, this is the main host for authorization
1. Open `http://localhost:8089/frame.html`, this will fail on load to pickup authentication. Press "Am I logged in?" to check the status.
1. Login on another browser/profile (can be same account)
1. Send a message from either browser
1. See it appear on the other browser (they are broadcast to anyone logged in at the time they are sent)


This is probably not strong enough differences on the origin to hit partitioned cookies.
That will require hosting it remotely on actual sites with different URLs.
Since localhost is always kinda special, not sure if it triggers it or not.
