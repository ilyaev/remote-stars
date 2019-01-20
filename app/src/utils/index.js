import { DISPATCHER_URL } from './const'

export const getSocketUrl = async () => {
    return fetch(DISPATCHER_URL, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: '{"query":"{photoRemoteSocketHost{host,port}}","variables":null,"operationName":null}'
    })
        .then(res => {
            return res.json()
        })
        .then(data => {
            let host = ''
            let port = 0
            try {
                host = data.data.photoRemoteSocketHost.host
                port = data.data.photoRemoteSocketHost.port
            } catch {
                host = ''
                port = 0
            }
            return host ? 'http://' + host + ':' + port : ''
        })
}
