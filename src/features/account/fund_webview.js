import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import { WebView } from 'react-native-webview';

import styles from './styles'
import Theme from '../../themes';
import Shared from '../../themes/shared';

import AlertBox from '../../components/alertbox';
import Loader from '../../components/loader'

const getUrl = (source, data) => {
    if (source === 'fund-account' && data.authorization_url) {
        return data.authorization_url
    }
    AlertBox.showError('Destination not known.')
}

const deriveNavigation = (callbackView) => {
    if(callbackView.indexOf('.') < 0) {
        return [callbackView]
    }
    const c = callbackView.split('.')
    return c
}

const FundWebView = ({ navigation, route }) => {
    const pageSource = route.params.source
    const pageData = route.params.viewData
    let destination = getUrl(pageSource, pageData)
    let webview = null

    const _callbackView = route.params.callbackView
    const _callbackViewData = route.params.callbackViewData
    const callbackView = _callbackView ? _callbackView : 'Home'
    const [display, setDisplay] = useState(true)

    const screenChange = (state) => {
        if (state.url.indexOf('/callback') != -1) {
            if(state.url.indexOf('/callback_proxy') < 0) {
                const destinationPath = deriveNavigation(callbackView)
                if(destinationPath.length > 1) {
                    navigation.navigate(destinationPath[0], { screen: destinationPath[1],  callbackViewData: { ..._callbackViewData, ...pageData }, params:  { ..._callbackViewData, ...pageData }, pageSource })
                }else {
                    navigation.navigate(callbackView, { callbackViewData: { ..._callbackViewData, ...pageData }, params:  { ..._callbackViewData, ...pageData }, pageSource })
                }
                
                return
            }
            // else it is a false positive.
        }
    }

   

    return (
        <View  style={{...styles.container, flex: 1 }}>
            {display && <WebView
                ref={ref => (webview = ref)}
                source={{ uri: destination }}
                startInLoadingState={true}
                renderLoading={() => <Loader style={{ flex: 1 }} />}
                onNavigationStateChange={screenChange}
            />}
            
        </View>
    );
}

export default FundWebView;