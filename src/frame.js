'use strict';
import 'dotenv/config';
import Hapi from '@hapi/hapi';

const init = async () => {

    const server = Hapi.server({
        port: process.env.FRAME_PORT,
        host: 'localhost',
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            return `
            <!doctype html>
            <title>Framed page</title>

            <iframe src="http://localhost:3000/frame">
            </iframe>
            `;
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
