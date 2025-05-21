import React, { useState, useEffect, useCallback } from "react";
import { KeyboardAvoidingView, Animated, Easing } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useValidation } from "react-native-form-validator";
import styles from "./styles";
import Theme from "../../themes";
import Shared from "../../themes/shared";
import { useUser } from "../../context/usercontext";
import { useAuthentication } from "../../queries/useAuthentication";
import AlertBox from "../../components/alertbox";
import { MSStorage } from "../../common/storage";
import {
  Box,
  VStack,
  HStack,
  Center,
  FormControl,
  Link,
  WarningOutlineIcon,
  Input,
  Button,
  Heading,
  Image,
  Text,
  safeArea,
} from "native-base";
import { getAppMantifest } from "../../common/device";
import * as LocalAuthentication from "expo-local-authentication";

const { fetchData } = useAuthentication("login");
const { FingerprintWhite, KeyWhite } = Theme.SVG;

const LoginScreen = ({ navigation }) => {
  const { setAuthData } = useUser();
  // DEV_CLEAR
  const [username, setUsername] = useState(""); // devtester@yopmail.com richardboyewa@gmail.com
  const [password, setPassword] = useState(""); // Killer08  Asdfghjkl@1234567890
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [show, setShow] = React.useState(false);
  const [isBiometricEnabled, setIsBiometricEnable] = React.useState(false);
  const [isEnabledBioAuth, setIsEnabledBioAuth] = React.useState(false);
  const [failureCount, setFailureCount] = useState(0);
  const [spinValue] = useState(new Animated.Value(0));

  const sdkVersion = getAppMantifest().sdkVersion;
  const version = getAppMantifest().version;

  const { validate, isFieldInError, getErrorsInField } = useValidation({
    state: { username, password },
  });

  // useFocusEffect(useCallback(() => {
  //     (async () => {
  //         const email = await getStoredEmail()
  //         const passwordData = await getStoredPassword()
  //         if (email) {
  //             setUsername(email)
  //         }
  //         if (passwordData) { setPassword(passwordData) }
  //         if (username && password) {
  //             const isEnable = await MSStorage.getItem('enable_biometric')
  //             setIsBiometricEnable(isEnable)
  //             if (isEnable) {
  //                 setIsEnabledBioAuth(true)
  //                 await configureBiometricAuth()
  //             }
  //         }

  //     })()
  // }, [isBiometricEnabled, isEnabledBioAuth]))

  useEffect(() => {
    (async () => {
      const email = await getStoredEmail();
      const passwordData = await getStoredPassword();
      if (email) {
        setUsername(email);
      }

      if (email && passwordData) {
        const isEnable = await MSStorage.getItem("enable_biometric");
        setIsBiometricEnable(isEnable);

        if (isEnable) {
          setIsEnabledBioAuth(true);
          await configureBiometricAuth();
        }
      }
    })();
  }, [isBiometricEnabled]);

  useEffect(() => {
    const valid = validate({
      username: { required: true },
      password: { required: true, minlength: 8 },
    });
    setIsValid(valid);
  }, [username, password]);

  const onLoginSuccessful = (navigation) => {
    navigation.reset({
      index: 0,
      routes: [{ name: "Home" }],
    });
  };

  const getStoredEmail = async () => await MSStorage.getItem("email");
  const getStoredPassword = async () => await MSStorage.getItem("password");

  const authenticate = async (email, pwd) => {
    setIsLoading(true);
    const usernameData = email ? email.toLowerCase() : username.toLowerCase();
    const _pwd = pwd || password;
    await fetchData({
      username: usernameData,
      password: _pwd,
    })
      .then(async (res) => {
        setIsLoading(false);
        if (res.data && res.data.success) {
          setFailureCount(0);
          await MSStorage.setItem("user", res.data.data);
          await MSStorage.setItem("token", res.data.data.token);
          if (!res.data.data.user.emailVerified) {
            navigation.navigate("OTPScreen", {
              screen: "Profile",
              params: res.data.data.user,
            });
            return;
          }
          await MSStorage.setItem("email", usernameData);
          const isEnable = await MSStorage.getItem("enable_biometric");
          if (isEnable) {
            await MSStorage.setItem("password", _pwd);
          }
          setAuthData(res.data.data);
          onLoginSuccessful(navigation);
        } else {
          let count = failureCount + 1;
          setFailureCount(count);
          if (count > 2) {
            resetBiometric();
          }

          AlertBox.showErrorEx(res);
        }
      })
      .catch((err) => {
        setIsLoading(false);
        if (isBiometricEnabled) {
          configureBiometricAuth();
        } else {
          AlertBox.showErrorEx(err);
        }
      });
  };

  const configureBiometricAuth = async () => {
    if (failureCount > 2) {
      return;
    }
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Biometric Authentication Required",
    });
    if (result && result.success) {
      const passwordInfo = await getStoredPassword();
      const email = await getStoredEmail();
      if (!passwordInfo) {
        setIsEnabledBioAuth(false);
      }
      if (email) {
        setUsername(email);
      }
      if (passwordInfo && email) {
        await authenticate(email, passwordInfo);
      } else {
        setIsEnabledBioAuth(false);
      }
    } else {
      if (result && result.error === "user_cancel") {
        // return configureBiometricAuth()
        return;
      }
      turnOffBiometric();
    }
  };

  const turnOffBiometric = () => {
    setIsEnabledBioAuth(false);
  };

  const resetBiometric = async () => {
    setIsBiometricEnable(false);
    setIsEnabledBioAuth(false);
    setUsername("");
    setPassword("");
  };

  const handleClick = () => setShow(!show);

  // Create the spinning animation
  const startSpinning = () => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  // Start spinning when loading starts
  useEffect(() => {
    if (isLoading) {
      startSpinning();
    }
  }, [isLoading]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const LoadingSpinner = () => (
    <Animated.Image
      source={Theme.Images.icon}
      style={{
        width: 30,
        height: 30,
        transform: [{ rotate: spin }],
      }}
    />
  );

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <Center h={"full"} mt={20} w="100%">
        <Box safeArea p="2" py="8" w="full" px={5}>
          <Heading size="2xl" fontWeight="800" color={Theme.Colors.primaryText}>
            Login
          </Heading>

          <VStack space={3} mt="5">
            <FormControl isInvalid>
              <FormControl.Label
                _text={{
                  color: Theme.Colors.secondaryText,
                  fontWeight: "medium",
                  fontSize: "sm",
                }}
              >
                {" "}
                Email
              </FormControl.Label>
              <Input
                onChangeText={(text) => {
                  setUsername(text);
                  if (isBiometricEnabled && isEnabledBioAuth) {
                    turnOffBiometric();
                  }
                }}
                value={username}
                style={Shared.TextInput.default}
                variant={"rounded"}
              />
              {isFieldInError("username") && (
                <FormControl.ErrorMessage
                  leftIcon={<WarningOutlineIcon size="xs" />}
                >
                  Email cannot be empty.
                </FormControl.ErrorMessage>
              )}
            </FormControl>
            {((!isBiometricEnabled && !isEnabledBioAuth) ||
              failureCount > 2) && (
              <FormControl isInvalid>
                <FormControl.Label
                  _text={{
                    color: Theme.Colors.primaryText,
                    fontWeight: "medium",
                    fontSize: "sm",
                  }}
                >
                  Password
                </FormControl.Label>
                <Input
                  onChangeText={(text) => {
                    setPassword(text);
                  }}
                  value={password}
                  style={Shared.TextInput.default}
                  variant={"rounded"}
                  type={show ? "text" : "password"}
                  InputRightElement={
                    <Button
                      size="xs"
                      _text={{ color: Theme.Colors.secondaryText }}
                      variant={"ghost"}
                      rounded="none"
                      w="1/6"
                      h="full"
                      onPress={handleClick}
                    >
                      {show ? "Hide" : "Show"}
                    </Button>
                  }
                />
                {isFieldInError("password") && (
                  <FormControl.ErrorMessage
                    leftIcon={<WarningOutlineIcon size="xs" />}
                  >
                    Password cannot be empty
                  </FormControl.ErrorMessage>
                )}
              </FormControl>
            )}
            <HStack space={isBiometricEnabled ? 1 : 0}>
              <Button
                isDisabled={
                  isBiometricEnabled && isEnabledBioAuth && !password?.length
                }
                isLoading={isLoading}
                spinner={<LoadingSpinner />}
                onPress={() => {
                  authenticate();
                }}
                mt={5}
                variant={"solid"}
                w={"full"}
                style={{ ...Shared.Button.primary, flex: 1 }}
              >
                Log In
              </Button>
              {isBiometricEnabled && failureCount <= 2 && (
                <Button
                  isLoading={isLoading}
                  onPress={() => {
                    setFailureCount(0);
                    configureBiometricAuth();
                  }}
                  mt={5}
                  variant={"ghost"}
                  w={"full"}
                  style={{ width: 50, color: Theme.Colors.colorWhite }}
                >
                  <FingerprintWhite width={30} height={30} />
                </Button>
              )}
              {isBiometricEnabled && failureCount <= 2 && (
                <Button
                  isLoading={isLoading}
                  onPress={() => {
                    setFailureCount(Infinity);
                    resetBiometric();
                  }}
                  mt={5}
                  variant={"ghost"}
                  w={"full"}
                  style={{ width: 50, color: Theme.Colors.colorWhite }}
                >
                  <KeyWhite width={30} height={30} />
                </Button>
              )}
            </HStack>

            <HStack mt="6" justifyContent="center">
              <Text fontSize="sm" color={Theme.Colors.secondaryText}>
                I'm a new user.{" "}
              </Text>
              <Link
                _text={{
                  color: Theme.CustomTheme["color-active-button"],
                  fontWeight: "medium",
                  fontSize: "sm",
                }}
                onPress={() => navigation.navigate("SignUpScreen")}
              >
                Sign Up
              </Link>
            </HStack>
            <Center>
              <Link
                _text={{
                  fontSize: "sm",
                  fontWeight: "500",
                  color: Theme.CustomTheme["color-active-button"],
                }}
                onPress={() => {
                  navigation.navigate("ResetPasswordScreen");
                }}
                mt="1"
              >
                Forget Password?
              </Link>
            </Center>
          </VStack>
          <VStack mt={2}>
            <Box px={5}>
              <Center>
                <Text
                  style={{ color: Theme.Colors.secondaryText, fontSize: 10 }}
                >
                  Build Version {version}-{sdkVersion}
                </Text>
              </Center>
            </Box>
          </VStack>
        </Box>
      </Center>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
