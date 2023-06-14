'use strict';
import 'dotenv/config';
import Bcrypt from 'bcrypt';
import Hapi from '@hapi/hapi';
import cookieAuth from '@hapi/cookie';

const users = [
    {
        username: 'john',
        password: '$2a$10$iqJSHD.BGr0E2IxQwYgJmeP3NvhPrXAeLSaGCj6IR/XU5QtjVu5Tm',   // 'secret'
        name: 'John Doe',
        id: crypto.randomUUID(),
    }
];

const init = async () => {

    const server = Hapi.server({
        port: process.env.HOST_PORT,
        host: 'localhost',
    });

    await server.register(cookieAuth);


    server.auth.strategy('session', 'cookie', {
        cookie: {
            name: 'authToken',
            password: '!wsYhFA*C2U6nz=Bu^%A@^F#SF3&kSR6',
            isSecure: false
        },
        redirectTo: '/login',
        validate: async (request, session) => {

            const account = await users.find(
                (user) => (user.id === session.id)
            );

            if (!account) {
                return { isValid: false };
            }

            return { isValid: true, credentials: account };
        }
    });

    server.auth.default('session');

    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            return `
            <!doctype html>
            <title>Landing page</title>
            <p>
                You have successfully logged in.
                You may now return to the application to finish authenticating with it.
            </p>
            <button onclick="closeUp()" hidden>Close login window</button>

            <script>
                if (window.opener) {
                    document.querySelector('button').hidden = false;
                }
                // We should detect if we can even call close... Not sure how right off.
                window.closeUp = function() {
                    window.opener?.postMessage(
                        {
                            action: "loggedIn",
                        },
                    );
                    window.close();
                }
            </script>
            `;
        }
    });

    server.route({
            method: 'GET',
            path: '/frame',
            handler: function (request, h) {

                return `
                <!doctype html>
                <html>
                            <head>
                                <title>Login page</title>
                            </head>
                            <body>
                                <p>
                                    Please <a href="http://localhost:3000/login" rel="opener" target="_blank">log in</a> to use Connectifi.
                                </p>
                                <button>Send fetch</button>
                                <script>
                                    window.addEventListener("message", (e) => {
                                        document.querySelector('p').textContent = "You have successfully logged in please attempt the fetch request.";
                                    });

                                    document.querySelector('button').addEventListener('click', async () => {
                                        console.log(await fetch('http://localhost:3000', {
                                            credentials: 'include',
                                        }));
                                    });
                                </script>
                            </body>
                        </html>`;
            },
            options: {
                auth: false
            }
        });

    server.route({
            method: 'GET',
            path: '/login',
            handler: function (request, h) {

                return `
                <!doctype html>
                <html>
                            <head>
                                <title>Login page</title>
                            </head>
                            <body>
                                <h3>Please Log In</h3>
                                <form method="post" action="/login">
                                    <label>Username: <input type="text" name="username" value="john"></label><br>
                                    <label>Password: <input type="password" name="password" value="secret"></label><br/>
                                <input type="submit" value="Login"></form>
                            </body>
                        </html>`;
            },
            options: {
                auth: false
            }
        });

    server.route({
            method: 'POST',
            path: '/login',
            handler: async (request, h) => {

                const { username, password } = request.payload;
                const account = users.find(
                    (user) => user.username === username
                );

                if (!account || !(await Bcrypt.compare(password, account.password))) {

                    return h.redirect('/login');
        }

                request.cookieAuth.set({ id: account.id });

                return h.redirect('/');
             },
             options: {
                 auth: {
                     mode: 'try'
                 }
             }
        });

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();
