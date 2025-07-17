import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Platform } from "react-native";
import styles from "./styles";
import Theme from "../../themes";
import Shared from "../../themes/shared";
import { useAuthentication } from "../../queries/useAuthentication";
import AlertBox from "../../components/alertbox";
import Loader from "../../components/loader";
import OTPInput from "../../components/otp";
import {
  Box,
  VStack,
  Center,
  Link,
  Button,
  Heading,
  Text,
  KeyboardAvoidingView,
} from "native-base";
import { MSStorage } from "../../common/storage";


const onOTPSuccessful = (navigation) => {
  navigation.reset({
    index: 0,
    routes: [
      {
        name: "SuccessScreen",
        params: {
          context: { nextPage: "LoginScreen" },
          buttonText: "Proceed to Login",
          title: "Account Created Successfully",
          message: "Your profile has been created successfully.",
        },
      },
    ],
  });
};

const OTPScreen = ({ navigation, route }) => {
  const { fetchData: emailOTP } = useAuthentication("emailotp", 'post', navigation);
  const { fetchData: resendEmailOTP } = useAuthentication("resendemailotp", 'post', navigation);
  const [otp, setOTP] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResend, setResend] = useState(false);
  const [isEnableBtn, setEnableBtn] = useState(false);
  const { params: userInfo, screen } = route.params;

  const validateOTP = () => {
    if (otp.length != 6) {
      return;
    }
    setIsLoading(true);
    emailOTP({
      identifier: userInfo.objectId,
      verificationCode: otp,
    })
      .then(async (res) => {
        if (res.data && res.data.success && res.data.data.emailVerified) {
          AlertBox.showSuccess(res.data.message ?? "Verification successful");
          await MSStorage.deleteItem("password");
          onOTPSuccessful(navigation);
          return;
        } else {
          AlertBox.showErrorEx(res);
        }
        setIsLoading(false);
        resetOTP();
      })
      .catch((err) => {
        setIsLoading(false);
        resetOTP();
        AlertBox.showErrorEx(err);
      });
  };

  const resendOTP = () => {
    if (isResend) {
      return;
    }
    setResend(true);
    resendEmailOTP({
      identifier: userInfo.objectId,
    })
      .then(async (res) => {
        if (res.data && res.data.success) {
          AlertBox.showSuccess(
            res.data.message ?? "Verification code resent successful."
          );
          setResend(false);
        } else {
          AlertBox.showErrorEx(res);
        }
        // setIsLoading(false)
        setResend(false);
        resetOTP();
      })
      .catch((err) => {
        setResend(false);
        resetOTP();
        AlertBox.showErrorEx(err);
      });
  };

  const resetOTP = () => {
    setOTP("");
  };

  return (
    <KeyboardAvoidingView
      h={{
        base: "400px",
        lg: "auto",
      }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Center h={"full"} mt={20} w="100%">
        <Box safeArea p="2" py="8" w="full" maxW="350">
          <Heading size="2xl" fontWeight="800" color="#ffffff">
            Got a code?
          </Heading>
          <Text style={{ color: "#ffffff" }}>
            An OTP was sent to your email. Enter OTP code below
          </Text>
          <VStack space={3} mt="5">
            <OTPInput
              pinLen={6}
              onTextComplete={(text) => {
                setOTP(text);
                setEnableBtn(true);
              }}
            />
            <Button
              isLoading={isLoading}
              isLoadingText={"Verifying OTP..."}
              isDisabled={!isEnableBtn}
              onPress={() => {
                validateOTP();
              }}
              mt="2"
              variant={"solid"}
              w={"full"}
              size={"md"}
              style={Shared.Button.primary}
            >
              Validate
            </Button>
            <Center>
              <Link
                onPress={() => {
                  resendOTP();
                }}
                _text={{
                  fontSize: "sm",
                  fontWeight: "500",
                  color: Theme.CustomTheme["color-active-button"],
                }}
                mt={5}
              >
                Didn't receive any token?
              </Link>
            </Center>
          </VStack>
        </Box>
      </Center>
      {isResend && <Loader />}
    </KeyboardAvoidingView>
  );
};

export default OTPScreen;
