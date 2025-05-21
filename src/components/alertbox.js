import { Alert } from 'react-native';

const AlertBox = {
  showErrorEx: (message, title = 'Request Failed') => {
    let msg = message
    try {
      if (message.response && message.response.data && typeof message.response?.data?.message == 'string') {
        msg = message.response.data.message
      } else if (message?.message && typeof message?.message == 'string') {
        msg = message.message
      } else if (message?.data && typeof message?.data?.data == 'object') {
        const errorMsg = Object.values(message?.data?.data).flatMap((v) => v).join('\n')
        msg = String(errorMsg)
      }
    } catch (error) {
      msg = 'An error occurred while processing this request. Please try again later. Code: E15'
    }
   
    Alert.alert(
      title,
      msg,
      [
        { text: 'OK', onPress: () => { } },
      ],
      { cancelable: false }
    )
  },
  showError: (message, title = 'Request Failed', onClose = null) => {
    Alert.alert(
      title,
      message,
      [
        {
          text: 'OK', onPress: () => {
            if (onClose) {
              onClose()
              return
            }
          }
        },
      ],
      { cancelable: false }
    )
  },
  showSuccess: (message, title = 'Request Successful', onClose = null) => {
    Alert.alert(
      title,
      message,
      [
        {
          text: 'OK', onPress: () => {
            if (onClose) {
              onClose()
              return
            }
          }
        },
      ],
      { cancelable: false }
    )
  },
  confirmBox: (message, onYes, onNo, title = 'Confirmation', options = {}) => {
    Alert.alert(
      title,
      message,
      [
        { text: options.okText || 'OK', onPress: onYes },
        { text: options.cancelText || 'Cancel', onPress: onNo },
      ],
      { cancelable: false }
    )
  }
}

export default AlertBox 