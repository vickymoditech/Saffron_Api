
export function socetOpen(server) {
    let io = require('socket.io')(server);

    io.on('connection', (socket) => {
        socket.on('test', (data) => {
            // we tell the client to execute 'new message'
            console.log("test here", data);
            socket.broadcast.emit("new test", {
                message: data
            });
        });
    });
}
