import React from 'react';
import {  View, Text, StyleSheet } from 'react-native'

import Theme from  '../themes';

const EmptyList = (props) => {
    return (<View style={{marginTop: 20}} >
        <Text style={{...styles.emptyMassage}}>{props.message ? props.message : 'No Items'}</Text>
    </View>)
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.Colors.backgroundColor,
        color: '#ffffff'
    },
    emptyMassage: {
        color:'grey',
         fontWeight: '400',
         fontSize: 16,
         fontStyle: 'normal',
         textAlign: 'center'
     }
});

export default EmptyList