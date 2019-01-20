import React, { Component } from 'react'
import { StyleSheet, View, Dimensions, Text, TextInput } from 'react-native'
import Button from 'react-native-button'
import io from 'socket.io-client'
import { getSocketUrl } from './utils'
let socket = false

const extractSocketParams = txt => {
    res = {}
    try {
        res = JSON.parse(txt)
    } catch {
        res = {}
    }
    return res
}

const prepareSocket = () => {
    if (socket) {
        return Promise.resolve(socket)
    } else {
        return new Promise((resolve, reject) => {
            getSocketUrl().then(surl => {
                socket = io.connect(surl)
                socket.on('HANDSHAKE', r => {
                    params = extractSocketParams(r)
                    console.log('HS:', params)
                    resolve(socket)
                })
                socket.on('PAIR', r => {
                    params = extractSocketParams(r)
                    if (params.success) {
                        socket.self.setState({
                            pair: 'PAIRED'
                        })
                    } else {
                        socket.self.setState({
                            code: '',
                            pair: 'NOT_PAIRED'
                        })
                    }
                })
                socket.on('RESPONSE', r => {
                    console.log('RESP:', r)
                })
                socket.on('ACTION', r => {
                    console.log('No Photo in Remote Mode')
                })
            })
        })
    }
}

export default class AppRemote extends Component {
    state = {
        code: '',
        pair: 'NOT_PAIRED', // 'PAIRING', 'PAIRED'
        state: 'CONNECTING'
    }

    componentDidMount() {
        prepareSocket().then(res => {
            this.setState({ state: 'CONNECTED' })
            socket.self = this
        })
    }

    onConnect() {
        this.setState({
            pair: 'PAIRING'
        })
        socket.emit('ACTION', JSON.stringify({ type: 'PAIR', code: this.state.code }))
    }

    onPhoto() {
        socket.emit('ACTION', JSON.stringify({ type: 'TAKE_PHOTO', code: this.state.code }))
    }

    componentWillUnmount() {
        if (socket) {
            console.log('Close Connection...')
            socket.close()
            socket = false
        }
    }

    render() {
        return (
            <View style={styles.container}>
                {this.state.state === 'CONNECTING' && this.renderConnectingState()}
                {this.state.state === 'CONNECTED' && this.renderConnectedState()}
            </View>
        )
    }

    renderConnectingState() {
        return (
            <View style={styles.container}>
                <Text>Preparing Session...</Text>
            </View>
        )
    }

    renderConnectedState() {
        return (
            <View style={styles.container}>
                <Text style={styles.caption}>
                    {this.state.pair === 'PAIRED' ? `Connected To ${this.state.code.toUpperCase()}` : 'Enter Code'}
                </Text>
                {this.state.pair !== 'PAIRED' && (
                    <TextInput
                        style={styles.input}
                        value={this.state.code || ''}
                        onChangeText={val => this.setState({ code: val })}
                        editable={this.state.pair === 'NOT_PAIRED'}
                    />
                )}
                {this.state.pair === 'NOT_PAIRED' && (
                    <Button style={styles.btn} onPress={this.onConnect.bind(this)} containerStyle={styles.btn_container}>
                        Connect
                    </Button>
                )}
                {this.state.pair === 'PAIRED' && (
                    <Button style={styles.btn} onPress={this.onPhoto.bind(this)} containerStyle={styles.btn_container}>
                        Take Photo
                    </Button>
                )}
                <Button
                    style={styles.btn}
                    onPress={() => {
                        this.props.onCancel && this.props.onCancel()
                    }}
                    containerStyle={styles.btn_container}
                >
                    Cancel
                </Button>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF'
    },
    caption: {
        fontSize: Dimensions.get('window').height / 20,
        color: 'black',
        marginBottom: Dimensions.get('window').height / 40
    },
    btn_container: {
        paddingTop: Dimensions.get('window').height / 8 / 3,
        height: Dimensions.get('window').height / 8,
        overflow: 'hidden',
        borderRadius: 4,
        width: Dimensions.get('window').width / 2,
        marginBottom: Dimensions.get('window').height / 20,
        backgroundColor: '#EFEFEF'
    },
    btn: {
        width: Dimensions.get('window').width / 2,
        color: 'black',
        height: Dimensions.get('window').height / 8
    },
    input: {
        height: Dimensions.get('window').height / 8,
        borderColor: 'gray',
        borderWidth: 1,
        textAlign: 'center',
        justifyContent: 'center',
        width: Dimensions.get('window').width / 2,
        fontSize: Dimensions.get('window').height / 12,
        marginBottom: Dimensions.get('window').height / 20
    }
})
