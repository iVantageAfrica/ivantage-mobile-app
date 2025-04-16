import React, {useState, useRef} from 'react';
import { HStack, Input, FormControl, Center } from 'native-base';
import Shared from '../themes/shared';

const genRefCollection = (pinLength) => {
    const coltns = new Map()
    for (let index = 0; index < pinLength; index++) {
        coltns.set(index, useRef());
    }
    return coltns
}
const genOTPCollection = (pinLength) => {
    const otpValues = []
    for (let index = 0; index < pinLength; index++) {
        otpValues.push('')
    }
    return otpValues
}
const OTPInput = (props) => {
    const pinLength = props.pinLen ? props.pinLen : 4
    const [otp, setOTP] = useState(genOTPCollection(pinLength))
    const [refColMap, setRefCol] = useState(genRefCollection(pinLength))
    

    const pushInOTP = (text, index) => {
        otp[index] = text
        setOTP([...otp])
        const otpLen = otp.join('').trim().length
        const gRef = getRef(index)
        if(gRef && text.trim().length > 0) {
            if(index < otp.length - 1 && otp[index + 1] == '') {
                gRef.current.focus()
            }else if(index == otp.length - 1 && otp[0] == '') {
                gRef.current.focus()
            }
        }
        if(otpLen == refColMap.size) {
            if(props.onTextComplete && typeof props.onTextComplete === 'function') {
                props.onTextComplete(otp.join(''));
            }
        }
    }

    const getRef = (currentIndex) => {
        const nextIndex = currentIndex < pinLength - 1 ? (currentIndex + 1) : 0
        if(refColMap.has(nextIndex)) {
            return refColMap.get(nextIndex)
        }
        return null
    }

    const renderInput = () => {
        const inputs = []
        {refColMap.forEach((ref_input, key) => {
            inputs.push (<Input 
                textContentType="password"
                key={key} ref={ref_input} autoCapitalize={'none'} value={otp[key]} type={'password'}  secureTextEntry={true} onFocus={() => pushInOTP('', key)} maxLength={2} keyboardType={'numeric'} onChangeText={(text) => pushInOTP(text, key)} w={50} textAlign={'center'} caretHidden={true} style={{...Shared.TextInput.default, fontWeight:'bold', fontSize: 30}} variant={'rounded'} />)
        })}
        return inputs
    }

    return (
        <FormControl >
            <FormControl.Label mb={3} type={'Email'} _text={{
                            color: "#ffffff",
                            fontWeight: "medium",
                            fontSize: "sm"
            }}>{props.fieldDesc ? props.fieldDesc : ''}</FormControl.Label>
        <Center>
        <HStack space={2}>
            {renderInput()}
        </HStack>
        </Center>
    </FormControl>)
}

export default OTPInput