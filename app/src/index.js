import React, { Component } from 'react'
import { StyleSheet, View, Dimensions } from 'react-native'
import Button from 'react-native-button'

export default class AppIndex extends Component {
    render() {
        return (
            <View style={styles.container}>
                <Button style={styles.btn} onPress={this.onCamera.bind(this)} containerStyle={styles.btn_container}>
                    Camera
                </Button>
                <Button style={styles.btn} onPress={this.onRemote.bind(this)} containerStyle={styles.btn_container}>
                    Remote
                </Button>
            </View>
        )
    }

    onCamera() {
        this.props.onCamera && this.props.onCamera()
    }

    onRemote() {
        this.props.onRemote && this.props.onRemote()
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF'
    },
    btn_container: {
        padding: Dimensions.get('window').height / 8 / 3,
        height: Dimensions.get('window').height / 8,
        overflow: 'hidden',
        borderRadius: 4,
        marginBottom: Dimensions.get('window').height / 10,
        backgroundColor: '#EFEFEF'
    },
    btn: {
        width: Dimensions.get('window').width / 2,
        color: 'black',
        height: Dimensions.get('window').height / 8
    }
})
