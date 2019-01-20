import React, { Component } from 'react'
import { Platform, StyleSheet, View, Dimensions } from 'react-native'
import AppIndex from './src/index'
import AppCamera from './src/camera'
import AppRemote from './src/remote'

// const instructions = Platform.select({
//     ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
//     android: 'Double tap R on your keyboard to reload,\n' + 'Shake or press menu button for dev menu'
// })

export default class App extends Component {
    camera = false

    state = {
        mode: 'index'
    }

    onCamera() {
        this.setState({
            mode: 'camera'
        })
    }

    onRemote() {
        this.setState({
            mode: 'remote'
        })
    }

    render() {
        return (
            <View style={styles.container}>
                {this.state.mode === 'index' && <AppIndex onCamera={this.onCamera.bind(this)} onRemote={this.onRemote.bind(this)} />}
                {this.state.mode === 'camera' && <AppCamera onCancel={() => this.setState({ mode: 'index' })} />}
                {this.state.mode === 'remote' && <AppRemote onCancel={() => this.setState({ mode: 'index' })} />}
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
    capture: { flex: 0, backgroundColor: '#fff', borderRadius: 5, color: '#000', padding: 10, margin: 40 },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5
    }
})
