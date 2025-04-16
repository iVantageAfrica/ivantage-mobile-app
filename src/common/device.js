import * as Application from 'expo-application';
import { Platform } from 'expo-modules-core';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import G from './utils';

export const getDeviceId = async () => {
  if (Platform.OS === 'android') {
    return Application.getAndroidId();
  } else {
    const deviceId = await Application.getIosIdForVendorAsync();;
    return deviceId;
  }
}

export const getAppConfig = () => {
    return Constants.expoConfig.extra
}

export const getAppMantifest = () => {
    return Constants.expoConfig
}

export const isAndroid = Platform.OS === "android"

