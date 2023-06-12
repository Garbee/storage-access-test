'use strict';
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
        port: 3000,
        host: 'localhost'
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
            return 'Hello World!';
        }
    });

    server.route({
            method: 'GET',
            path: '/login',
            handler: function (request, h) {

                return ` <html>
                            <head>
                                <title>Login page</title>
                            </head>
                            <body>
                                <h3>Please Log In</h3>
                                <form method="post" action="/login">
                                    Username: <input type="text" name="username" value="john"><br>
                                    Password: <input type="password" name="password" value="secret"><br/>
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
