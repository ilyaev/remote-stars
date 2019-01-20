var express = require('express')
var app = express()
var PORT = process.env.PORT || 8080
var server = require('http').createServer(app)
var io = require('socket.io').listen(server)
var sid = require('shortid')

const connections = {}
let connectionId = 1

io.sockets.on('connection', socket => {
    const code = sid
        .generate()
        .substr(0, 4)
        .toUpperCase()
        .replace(/(_|-|L)/gi, 'A')
    connections[code] = socket
    console.log('CONN:', code)

    socket.code = code

    socket.on('disconnect', () => {
        console.log('DCN:', socket.code)
        socket.emit('DISCONNECT', JSON.stringify({ code: socket.code }))
        delete connections[socket.code]
    })

    socket.on('ACTION', r => {
        const cmd = JSON.parse(r)
        cmd.code = (cmd.code || '').trim().toUpperCase()
        console.log('ACTION:', cmd)
        if (cmd.type === 'PAIR') {
            if (cmd.code.length === 4 && typeof connections[cmd.code] !== 'undefined') {
                socket.emit('PAIR', JSON.stringify({ success: true }))
            } else {
                socket.emit('PAIR', JSON.stringify({ success: false }))
            }
        }
        if (cmd.type === 'TAKE_PHOTO') {
            if (cmd.code.length === 4 && typeof connections[cmd.code] !== 'undefined') {
                connections[cmd.code].emit('ACTION', JSON.stringify({ type: 'PHOTO' }))
                socket.emit('RESPONSE', JSON.stringify({ success: true }))
            } else {
                socket.emit('RESPONSE', JSON.stringify({ success: false }))
            }
        }
    })

    socket.emit(
        'HANDSHAKE',
        JSON.stringify({
            id: connectionId++,
            code
        })
    )
})

app.get('/service', function(request, response) {
    response.json({
        success: true
    })
})

server.listen(PORT, function(error) {
    if (error) {
        console.error(error)
    } else {
        console.info('==> \t Listening on port %s. Visit http://[SERVER_NAME_VAR]:%s in your browser', PORT, PORT)
    }
})
