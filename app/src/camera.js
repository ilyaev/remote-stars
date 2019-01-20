import React, { Component } from 'react'
import { StyleSheet, View, Dimensions, Text, CameraRoll, PermissionsAndroid } from 'react-native'
import Button from 'react-native-button'
import io from 'socket.io-client'
import Camera from 'react-native-camera'
import { getSocketUrl } from './utils'

requestExternalStoragePermission = async () => {
    try {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, {
            title: 'Storage Permission',
            message: 'App needs access to your storage ' + 'so you can save your photos'
        })

        return granted
    } catch (err) {
        console.error('Failed to request permission ', err)
        return null
    }
}

requestExternalStoragePermission()

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

export default class AppCamera extends Component {
    state = {
        state: 'CONNECTING', // 'connected'
        code: ''
    }

    camera = false

    componentDidMount = async () => {
        console.log('Mounting Server...')
        surl = await getSocketUrl()
        socket = io.connect(surl)
        socket.on('HANDSHAKE', r => {
            params = extractSocketParams(r)
            this.setState({
                code: params.code,
                state: 'CONNECTED'
            })
        })
        socket.on('DISCONNECT', d => {
            console.log('DISCONNECT')
            socket.close()
            this.camera = false
            this.props.onCancel && this.props.onCancel()
        })
        socket.on('ACTION', a => {
            params = extractSocketParams(a)
            console.log('ACTION: ', params)
            if (params.type === 'PHOTO') {
                this.camera
                    .capture()
                    .then(data => {
                        console.log(data)
                        // console.log(data.path)
                        CameraRoll.saveToCameraRoll(data.path, 'photo')
                        this.camera && this.camera.startPreview()
                    })
                    .catch(err => console.error(err))
            }
        })
    }

    componentWillUnmount() {
        if (socket) {
            console.log('Close Connection...')
            this.camera = false
            socket.close()
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
                <Camera
                    ref={cam => {
                        this.camera = cam
                    }}
                    style={styles.preview}
                    aspect={Camera.constants.Aspect.fill}
                />
                <Button
                    style={styles.btn}
                    onPress={() => {
                        this.props.onCancel && this.props.onCancel()
                    }}
                    containerStyle={styles.btn_container}
                >
                    {this.state.code}
                </Button>
                <Button
                    style={styles.btn}
                    onPress={() => {
                        this.props.onCancel && this.props.onCancel()
                    }}
                    containerStyle={styles.btn_container_bottom}
                >
                    Close
                </Button>
                {/* <Text>{this.state.code}</Text> */}
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
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        height: Dimensions.get('window').height,
        width: Dimensions.get('window').width
    },
    btn_container: {
        position: 'absolute',
        left: 0,
        top: 0,
        height: Dimensions.get('window').height / 8,
        overflow: 'hidden',
        borderRadius: 4,
        width: Dimensions.get('window').width,
        marginBottom: Dimensions.get('window').height / 10,
        backgroundColor: '#EFEFEF'
    },
    btn_container_bottom: {
        position: 'absolute',
        left: 0,
        top: Dimensions.get('window').height - Dimensions.get('window').height / 6,
        height: Dimensions.get('window').height / 8,
        overflow: 'hidden',
        borderRadius: 4,
        width: Dimensions.get('window').width,
        // marginBottom: Dimensions.get('window').height / 10,
        backgroundColor: '#EFEFEF'
    },
    btn: {
        width: Dimensions.get('window').width,
        color: 'black',
        fontSize: Dimensions.get('window').height / 11,
        height: Dimensions.get('window').height / 8
    }
})
