import React, { useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Platform } from "react-native";
import { useValidation } from "react-native-form-validator";
import styles from "./styles";
import Theme from "../../themes";
import Shared from "../../themes/shared";
import { useUser } from "../../context/usercontext";
import { useAuthentication } from "../../queries/useAuthentication";
import AlertBox from "../../components/alertbox";
import { MSStorage } from "../../common/storage";
import OTPInput from "../../components/otp";
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
  KeyboardAvoidingView,
  ScrollView,
} from "native-base";

const ResetPasswordScreen = ({ navigation }) => {
  const { fetchData } = useAuthentication("password_reset", "post", navigation);
  const { fetchData: passwordResetRequest } = useAuthentication(
    "password_reset_update",
    "post",
    navigation
  );

  const { setAuthData } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm_password, setConfirmPassword] = useState("");
  const [otp, setOTP] = useState("");
  const [reference, setReference] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [show_otp, setShowOTP] = useState(false);
  const [show, setShow] = useState(false);

  const { validate, isFieldInError, getErrorsInField } = useValidation({
    state: { otp, reference, confirm_password, password },
  });

  useEffect(() => {
    const valid = validate({
      otp: { required: true },
      reference: { required: true },
      password: { required: true, minlength: 8 },
      confirm_password: { required: true, minlength: 8 },
    });
    setIsValid(valid);
  }, [otp, reference, confirm_password, password]);

  const onResetSuccessful = (navigation) => {
    navigation.reset({
      index: 0,
      routes: [{ name: "LoginScreen" }],
    });
  };

  const initiatePasswordRequest = async () => {
    if (!email || email.trim().length == 0) {
      return;
    }
    setIsLoading(true);
    const _email = email.trim().toLocaleLowerCase();
    await fetchData({
      email: _email,
    })
      .then(async (res) => {
        setIsLoading(false);
        if (res.data && res.data.success) {
          setReference(res.data.data.reference);
          setShowOTP(true);
          AlertBox.showSuccess(res.data.message);
        } else {
          AlertBox.showErrorEx(res);
        }
      })
      .catch((err) => {
        setIsLoading(false);
        AlertBox.showErrorEx(err);
      });
  };

  const completePasswordResetRequest = async () => {
    if (
      !reference ||
      reference.trim().length == 0 ||
      !otp ||
      otp.trim().length == 0 ||
      !password ||
      password.trim().length == 0 ||
      !confirm_password ||
      confirm_password.trim().length == 0 ||
      password != confirm_password
    ) {
      return;
    }
    setIsLoading(true);
    await passwordResetRequest({
      reference,
      verificationCode: otp,
      password,
      password_confirmation: confirm_password,
    })
      .then(async (res) => {
        setIsLoading(false);
        if (res.data && res.data.success) {
          AlertBox.showSuccess(res.data.message);
          onResetSuccessful(navigation);
        } else {
          AlertBox.showErrorEx(res);
        }
      })
      .catch((err) => {
        setIsLoading(false);
        AlertBox.showErrorEx(err);
      });
  };

  const handleClick = () => setShow(!show);

  return (
    <KeyboardAvoidingView
      h={{
        base: "400px",
        lg: "auto",
      }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView>
        <Box>
          <Center h={"full"} mt={20} w="100%">
            <Box safeArea px="10" py="8" w="full">
              <Heading size="2xl" fontWeight="800" color="#282828">
                Password Reset
              </Heading>
              {!show_otp && (
                <Box>
                  <VStack space={3} mt="5">
                    <FormControl required>
                      <FormControl.Label
                        _text={{
                          color: "#282828",
                          fontWeight: "medium",
                          fontSize: "sm",
                        }}
                      >
                        {" "}
                        Email
                      </FormControl.Label>
                      <Input
                        onChangeText={(text) => {
                          setEmail(text);
                        }}
                        value={email}
                        style={Shared.TextInput.default}
                        variant={"rounded"}
                      />
                      {(!email || email.trim().length == 0) && (
                        <FormControl.ErrorMessage
                          leftIcon={<WarningOutlineIcon size="xs" />}
                        >
                          Enter your registered email address.
                        </FormControl.ErrorMessage>
                      )}
                    </FormControl>
                    <Button
                      //isDisabled={!email || email.trim().length == 0}
                      isLoading={isLoading}
                      isLoadingText={"Sending Request"}
                      onPress={() => {
                        //initiatePasswordRequest();
                      }}
                      mt={5}
                      variant={"solid"}
                      w={"full"}
                      style={Shared.Button.primary}
                    >
                      Reset Password
                    </Button>

                    <HStack mt="6" justifyContent="center">
                      <Link
                        _text={{
                          color: Theme.CustomTheme["color-active-button"],
                          fontWeight: "medium",
                          fontSize: "sm",
                        }}
                        onPress={() => navigation.navigate("LoginScreen")}
                      >
                        Proceed to login.
                      </Link>
                    </HStack>
                  </VStack>
                </Box>
              )}
              {show_otp && (
                <VStack space={3} mt="5">
                  <OTPInput
                    fieldDesc={"OTP"}
                    pinLen={6}
                    onTextComplete={(text) => {
                      setOTP(text);
                    }}
                  />
                  <FormControl isInvalid>
                    <FormControl.Label
                      _text={{
                        color: "#ffffff",
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
                          _text={{ color: "#282828" }}
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
                        Password cannot be empty or less than 8 characters
                      </FormControl.ErrorMessage>
                    )}
                  </FormControl>
                  <FormControl>
                    <FormControl.Label
                      _text={{
                        color: "#282828",
                        fontWeight: "medium",
                        fontSize: "sm",
                      }}
                    >
                      Confirm Password
                    </FormControl.Label>
                    <Input
                      onChangeText={(text) => {
                        setConfirmPassword(text);
                      }}
                      value={confirm_password}
                      style={Shared.TextInput.default}
                      variant={"rounded"}
                      type={show ? "text" : "password"}
                      InputRightElement={
                        <Button
                          size="xs"
                          _text={{ color: "#ffffff" }}
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
                    {(isFieldInError("confirm_password") ||
                      confirm_password != password) && (
                      <FormControl.ErrorMessage
                        leftIcon={<WarningOutlineIcon size="xs" />}
                      >
                        Password fields must match
                      </FormControl.ErrorMessage>
                    )}
                  </FormControl>
                  <Button
                    isDisabled={!isValid}
                    isLoadingText={"Processing Request"}
                    isLoading={isLoading}
                    onPress={() => {
                      completePasswordResetRequest();
                    }}
                    mt={5}
                    variant={"solid"}
                    w={"full"}
                    style={Shared.Button.primary}
                  >
                    Reset Password
                  </Button>

                  <Center>
                    <HStack mt="6" justifyContent="center">
                      <Link
                        _text={{
                          color: Theme.CustomTheme["color-active-button"],
                          fontWeight: "medium",
                          fontSize: "sm",
                        }}
                        onPress={() => navigation.navigate("LoginScreen")}
                      >
                        Proceed to login.
                      </Link>
                    </HStack>
                  </Center>
                </VStack>
              )}
            </Box>
          </Center>
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ResetPasswordScreen;
