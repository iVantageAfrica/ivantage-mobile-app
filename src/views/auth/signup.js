import React, { useState, useEffect } from "react";
import { KeyboardAvoidingView } from "react-native";
import styles from "./styles";
import Theme from "../../themes";
import Shared from "../../themes/shared";
import { useValidation } from "react-native-form-validator";
import { useAuthentication } from "../../queries/useAuthentication";
import { useUser } from "../../context/usercontext";
import { MSStorage } from "../../common/storage";
import AlertBox from "../../components/alertbox";
import {
  Box,
  VStack,
  Checkbox,
  HStack,
  Center,
  FormControl,
  Link,
  WarningOutlineIcon,
  Input,
  Button,
  Heading,
  ScrollView,
  Text,
} from "native-base";

const { fetchData } = useAuthentication("signup");

const SignUpScreen = ({ navigation }) => {
  const [firstname, setFirstName] = useState("");
  const [touched, setTouched] = useState(false);
  const [middlename, setMiddleName] = useState("");
  const [lastname, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPIN] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [phonenumber, setPhoneNumber] = useState("");
  const [agreetoterms, setAgreeToTerm] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { validate, isFieldInError, getErrorsInField } = useValidation({
    state: {
      firstname,
      lastname,
      email,
      password,
      phonenumber,
      middlename,
      agreetoterms,
      pin,
    },
  });

  useEffect(() => {
    const valid = validate({
      firstname: { required: true },
      middlename: { required: true },
      lastname: { required: true },
      email: { required: true, email: true },
      phonenumber: { required: true, numbers: true },
      password: { required: true, minlength: 8 },
      pin: { required: true, minlength: 4 },
      agreetoterms: { required: true },
    });
    setIsValid(valid);
  }, [
    firstname,
    password,
    lastname,
    email,
    middlename,
    phonenumber,
    agreetoterms,
    pin,
  ]);

  const register = () => {
    const payload = {
      username: email.toLowerCase(),
      firstname: firstname,
      surname: lastname,
      email: email.toLowerCase(),
      pin,
      middlename,
      phone: phonenumber,
      password,
      referralCode,
    };
    if (!payload.referralCode || payload.referralCode.trim().length === 0) {
      delete payload.referralCode;
    }
    setIsLoading(true);
    fetchData({
      ...payload,
    })
      .then(async (res) => {
        if (res.data && res.data.success) {
          await MSStorage.setItem("user", res.data.data);
          // setAuthData(res.data.data);
          navigation.navigate("OTPScreen", {
            screen: "Profile",
            params: res.data.data,
          });
          return;
        }
        AlertBox.showErrorEx(res);
      })
      .catch((err) => {
        AlertBox.showErrorEx(err);
      })
      .finally(() => setIsLoading(false));
  };

  const handleClick = () => setShow(!show);

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <ScrollView>
        <Box>
          <Center h={"full"} mt={1} w="100%">
            <Box safeArea p="2" py="4" w="full" px={5}>
              <Heading
                size="2xl"
                fontWeight="800"
                color={Theme.Colors.primaryText}
              >
                Nice To Meet You
              </Heading>
              <Heading
                mt="1"
                color={Theme.Colors.secondaryText}
                fontWeight="medium"
                size="xs"
              >
                Create a profile now.
              </Heading>

              <VStack mt="3">
                <FormControl isInvalid={submitted && isFieldInError("firstname")}>
                  <FormControl.Label
                    _text={{
                      color: Theme.Colors.colorBlack,
                      fontWeight: "medium",
                      fontSize: "sm",
                    }}
                  >
                    First Name
                  </FormControl.Label>
                  <Input
                    onChangeText={(text) => {
                      setFirstName(text);
                    }}
                    style={Shared.TextInput.default}
                    variant={"rounded"}
                    value={firstname}
                  />
                  {submitted && isFieldInError("firstname") && (
                    <FormControl.ErrorMessage
                      leftIcon={<WarningOutlineIcon size="xs" />}
                      _text={{ color: Theme.Colors.colorBlack }}
                    >
                      First Name is required.
                    </FormControl.ErrorMessage>
                  )}
                </FormControl>

                <FormControl isInvalid={submitted && isFieldInError("middlename")}>
                  <FormControl.Label
                    _text={{
                      color: Theme.Colors.secondaryText,
                      fontWeight: "medium",
                      fontSize: "sm",
                    }}
                  >
                    Middle Name
                  </FormControl.Label>
                  <Input
                    onChangeText={(text) => {
                      setMiddleName(text);
                    }}
                    style={Shared.TextInput.default}
                    variant={"rounded"}
                    value={middlename}
                  />
                  {submitted && isFieldInError("middlename") && (
                    <FormControl.ErrorMessage
                      leftIcon={<WarningOutlineIcon size="xs" />}
                      _text={{ color: Theme.Colors.secondaryText }}
                    >
                      Middle Name is required.
                    </FormControl.ErrorMessage>
                  )}
                </FormControl>

                <FormControl isInvalid={submitted && isFieldInError("lastname")}>
                  <FormControl.Label
                    _text={{
                      color: Theme.Colors.secondaryText,
                      fontWeight: "medium",
                      fontSize: "sm",
                    }}
                  >
                    Last Name
                  </FormControl.Label>
                  <Input
                    onChangeText={(text) => {
                      setLastName(text);
                    }}
                    style={Shared.TextInput.default}
                    variant={"rounded"}
                    value={lastname}
                  />
                  {submitted && isFieldInError("lastname") && (
                    <FormControl.ErrorMessage
                      leftIcon={<WarningOutlineIcon size="xs" />}
                      _text={{ color: Theme.Colors.secondaryText }}
                    >
                      Last Name is required
                    </FormControl.ErrorMessage>
                  )}
                </FormControl>

                <FormControl isInvalid={submitted && isFieldInError("email")}>
                  <FormControl.Label
                    type={"Email"}
                    _text={{
                      color: Theme.Colors.secondaryText,
                      fontWeight: "medium",
                      fontSize: "sm",
                    }}
                  >
                    Email Address
                  </FormControl.Label>
                  <Input
                    onChangeText={(text) => {
                      setEmail(text);
                    }}
                    keyboardType={"email-address"}
                    style={Shared.TextInput.default}
                    value={email}
                    variant={"rounded"}
                  />
                  {submitted && isFieldInError("email") && (
                    <FormControl.ErrorMessage
                      leftIcon={<WarningOutlineIcon size="xs" />}
                      _text={{ color: Theme.Colors.secondaryText }}
                    >
                      Email is required.
                    </FormControl.ErrorMessage>
                  )}
                </FormControl>

                <FormControl isInvalid={submitted && isFieldInError("phonenumber")}>
                  <FormControl.Label
                    _text={{
                      color: Theme.Colors.secondaryText,
                      fontWeight: "medium",
                      fontSize: "sm",
                    }}
                  >
                    Phone Number
                  </FormControl.Label>
                  <Input
                    onChangeText={(text) => {
                      setPhoneNumber(text);
                    }}
                    keyboardType={"phone-pad"}
                    value={phonenumber}
                    placeholder={"234 80 xxx xxx xx"}
                    style={Shared.TextInput.default}
                    variant={"rounded"}
                  />
                  {submitted && isFieldInError("phonenumber") && (
                    <FormControl.ErrorMessage
                      leftIcon={<WarningOutlineIcon size="xs" />}
                      _text={{ color: Theme.Colors.secondaryText }}
                    >
                      Phone number is required.
                    </FormControl.ErrorMessage>
                  )}
                </FormControl>

                <Box
                  mt={3}
                  p={3}
                  style={{
                    borderColor: Theme.Colors.primaryText,
                    borderWidth: 1,
                  }}
                >
                  <Text
                    style={{
                      color: Theme.Colors.secondaryText,
                      fontSize: 17,
                      fontWeight: "bold",
                    }}
                  >
                    Security
                  </Text>
                  <FormControl isInvalid={submitted && isFieldInError("password")}>
                    <FormControl.Label
                      _text={{
                        color: Theme.Colors.secondaryText,
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
                      type={show ? "text" : "password"}
                      style={Shared.TextInput.default}
                      value={password}
                      variant={"rounded"}
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
                    {submitted && isFieldInError("password") && (
                      <FormControl.ErrorMessage
                        leftIcon={<WarningOutlineIcon size="xs" />}
                        _text={{ color: Theme.Colors.secondaryText }}
                      >
                        Min. 8 characters (alphanumeric and special characters)
                      </FormControl.ErrorMessage>
                    )}
                  </FormControl>
                  <FormControl>
                    <FormControl.Label
                      _text={{
                        color: Theme.Colors.secondaryText,
                        fontWeight: "medium",
                        fontSize: "sm",
                      }}
                    >
                      Transaction PIN
                    </FormControl.Label>
                    <Input isInvalid
                      maxLength={4}
                      keyboardType={"numeric"}
                      onChangeText={(text) => {
                        setPIN(text);
                      }}
                      type={"password"}
                      style={{ ...Shared.TextInput.default, fontSize: 18 }}
                      value={pin}
                      variant={"rounded"}
                    />
                    {submitted && isFieldInError("pin") && (
                      <FormControl.ErrorMessage
                        leftIcon={<WarningOutlineIcon size="xs" />}
                        _text={{ color: Theme.Colors.secondaryText }}
                      >
                        Transaction PIN is not set properly.
                      </FormControl.ErrorMessage>
                    )}
                    <Text style={{ color: Theme.Colors.secondaryText }}>
                      This will be required for completing transactions.
                    </Text>
                  </FormControl>
                </Box>
                <Box mt={3}>
                  <FormControl isInvalid={submitted && isFieldInError("referralCode")}>
                    <FormControl.Label
                      _text={{
                        color: Theme.Colors.secondaryText,
                        fontWeight: "medium",
                        fontSize: "sm",
                      }}
                    >
                      Referral Code
                    </FormControl.Label>
                    <Input
                      onChangeText={(text) => {
                        setReferralCode(text);
                      }}
                      keyboardType={"default"}
                      value={referralCode}
                      placeholder={"Who referred you?"}
                      style={Shared.TextInput.default}
                      variant={"rounded"}
                    />
                  </FormControl>
                </Box>
                <VStack mt={5} mb={5} space={3}>
                  <Checkbox
                    onChange={(e) => {
                      setAgreeToTerm(e);
                    }}
                    colorScheme="orange"
                    value={agreetoterms}
                  >
                    <Text color={Theme.Colors.secondaryText}> Agree to</Text>
                    <Link
                      _text={{
                        color: Theme.CustomTheme["color-active-button"],
                        fontWeight: "medium",
                        fontSize: "sm",
                      }}
                      onPress={() => navigation.navigate("LoginScreen")}
                    >
                      terms and conditions
                    </Link>
                  </Checkbox>
                  <Checkbox colorScheme="orange" shadow={2} value="test">
                    <Text color={Theme.Colors.secondaryText}>
                      Don't send me information via email
                    </Text>
                  </Checkbox>
                </VStack>
                <Button
                  isDisabled={!isValid || !agreetoterms}
                  onPress={() => {
                    setSubmitted(true);
                    if (isValid && agreetoterms) {
                      register();
                    }
                  }}
                  mt="2"
                  isLoading={isLoading}
                  variant={"solid"}
                  w={"full"}
                  size={"md"}
                  style={Shared.Button.primary}
                >
                  Sign Up
                </Button>
                <HStack mt="6" justifyContent="center">
                  <Text fontSize="sm" color={Theme.Colors.secondaryText}>
                    Already have a profile?{" "}
                  </Text>
                  <Link
                    _text={{
                      color: Theme.CustomTheme["color-active-button"],
                      fontWeight: "medium",
                      fontSize: "sm",
                    }}
                    onPress={() => navigation.navigate("LoginScreen")}
                  >
                    Login
                  </Link>
                </HStack>
              </VStack>
            </Box>
          </Center>
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUpScreen;
