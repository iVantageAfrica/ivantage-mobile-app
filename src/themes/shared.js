import Theme from '../themes';
import { Dimensions } from 'react-native';
const Button = {
    default: {
        borderRadius: 20,
        backgroundColor: '#26323f',
        color:'#ffffff',
        fontSize: 12,
        borderColor:'#ffffff',
        borderWidth: 1
    },
    primary: {
        backgroundColor: Theme.CustomTheme['color-active-button'],
        borderRadius: 20,
        fontSize: 12,
        color:'#ffffff'
    },
    primary_outline: {
        borderColor: Theme.CustomTheme['color-active-button'],
        borderRadius: 20,
        fontSize: 12,
        borderWidth: 1,
        color:'#ffffff'
    },
    primary_outline_no_radius: {
        borderColor: Theme.CustomTheme['color-active-button'],
        fontSize: 12,
        borderWidth: 1,
        color:'#ffffff'
    },
    primary_outline_white: {
        borderColor: '#ffffff',
        borderRadius: 20,
        fontSize: 12,
        borderWidth: 1,
        color:'#ffffff'
    }
}

const TextInput = {
    default: {
        borderRadius: 20,
        backgroundColor: '#ffffff',
        color:'#000000',
        fontSize: 14,
        borderColor:'#ffffff',
        borderWidth: 1
    },
    roundedInput: {
        borderRadius: 20,
        backgroundColor: '#ffffff',
        color:'#000000',
        padding: 10,
        fontSize: 14,
        borderColor:'#ffffff',
        borderWidth: 1
    }
}

const NativeTextInput = {
    default: {
        borderRadius: 20,
        backgroundColor: '#ffffff',
        color:'#000000',
        fontSize: 14,
        borderColor:'#ffffff',
        borderWidth: 1,
        width: 50,
        height:50
    },
    roundedInput: {
        borderRadius: 20,
        width: 50,
        height:50,
        backgroundColor: '#ffffff',
        color:'#000000',
        padding: 10,
        fontSize: 14,
        borderColor:'#ffffff',
        borderWidth: 1
    }
}

const Select = {
    default: {
        borderRadius: 20,
        backgroundColor: '#ffffff',
        color:'#000000',
        fontSize: 14,
        borderColor:'#ffffff',
        borderWidth: 1
    }
}


const DeviceDimensions = {
    WIDTH: Dimensions.get('window').width,
    HEIGHT: Dimensions.get('window').height,
}

export default {
    Button, TextInput, Select, DeviceDimensions, NativeTextInput
};