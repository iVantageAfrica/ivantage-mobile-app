import React, { useState, useCallback, useEffect, useMemo } from "react";
import { View, ScrollView, Platform } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import styles from "./styles";
import Theme from "../../themes";
import Shared from "../../themes/shared";
import {
  Box,
  VStack,
  HStack,
  Button,
  Heading,
  Input,
  Text,
  Checkbox,
  FormControl,
  WarningOutlineIcon,
  Stack,
  Radio,
  KeyboardAvoidingView,
  Select,
} from "native-base";
import { useValidation } from "react-native-form-validator";
import { useAuthentication } from "../../queries/useAuthentication";
import CurrencyInput from "react-native-currency-input";
import * as Clipboard from "expo-clipboard";

import DateInput from "../../components/dateinput";

import AlertBox from "../../components/alertbox";
import Loader from "../../components/loader";

const FundAcctScreen = ({ navigation, route }) => {
  const { account_info = null, accountType } = route.params;
  const { fetchData: initiateFunding } = useAuthentication(
    "fund_account",
    "post",
    navigation
  );

  const saveFrequency = [
    { value: 1, label: "Daily" },
    { value: 7, label: "Weekly" },
    { value: 30, label: "Monthly" },
  ];

  const [account, setAccount] = useState(null);
  const [toaccount, setToAccount] = useState(account_info?.AccountNo);
  const [amount, setAmount] = useState(null);
  const [narration, setNarration] = useState("");
  const [frequency, setFrequency] = useState(1);
  const [isAutoSave, setIsAutoSave] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCard, setIsCard] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const { validate, isFieldInError, getErrorsInField } = useValidation({
    state: { toaccount, amount },
  });

  useEffect(() => {
    const valid = validate({
      toaccount: { numbers: true, required: true },
      amount: { numbers: true, required: true },
    });

    setIsValid(valid);
  }, [toaccount, amount]);

  const copyAccountDetail = async () => {
    await Clipboard.setStringAsync(
      `Account Type: \n ${accountType.label} \n\n  Bank Name: \n ${account_info.AccountName} \n\n Bank Account Number: \n ${account_info.AccountNo}`
    );
    AlertBox.showSuccess("Account information copied successfully.");
  };

  const transferFundsToAccount = async () => {
    if (amount <= 0) {
      return;
    }
    if (!toaccount) {
      AlertBox.showError(
        "Destination account not set correctly.",
        "Invalid Account"
      );
      return;
    }
    setIsLoading(true);
    try {
      const res = await initiateFunding({
        accountToCredit: toaccount,
        autoSave: isAutoSave,
        nextChargeDate: startDate,
        frequency: frequency,
        narration: narration.trim().length > 0 ? narration : "Not provided",
        amount: parseFloat(amount),
      });
      setIsLoading(false);
      if (res && res.data && res.data.success) {
        navigation.replace("FundWebView", {
          viewData: res.data.data,
          source: "fund-account",
          callbackViewData: { ...res.data.data, amount },
        });
        return;
      }
      AlertBox.showErrorEx(res);
      return null;
    } catch (error) {
      setIsLoading(false);
      AlertBox.showErrorEx(error);
      return null;
    }
  };

  if (isLoading) {
    return <Loader />;
  }

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
        <VStack>
          <Box px={7}>
            <Box mb={5}>
              <Heading size="2xl" fontWeight="800" color="#ffffff">
                Fund Account
              </Heading>
            </Box>
            <VStack
              mb={5}
              style={{
                borderColor: "#e9e9e9",
                borderWidth: 1,
                padding: 10,
                backgroundColor: Theme.Colors.backgroundColorAlt,
                borderRadius: 10,
              }}
              space={3}
            >
              <Box>
                <Text style={{ color: "#ffffff" }}>Account Type</Text>
                <Text
                  mt={1}
                  style={{ color: "#ffffff", fontSize: 18, fontWeight: "bold" }}
                >
                  {accountType.label}
                </Text>
              </Box>
              <Box>
                <Text style={{ color: "#ffffff" }}>Account Name</Text>
                <Text
                  mt={1}
                  style={{ color: "#ffffff", fontSize: 18, fontWeight: "bold" }}
                >
                  {account_info.AccountName}
                </Text>
              </Box>
              <Box>
                <Text style={{ color: "#ffffff" }}>Account Number</Text>
                <Text
                  mt={1}
                  style={{ color: "#ffffff", fontSize: 18, fontWeight: "bold" }}
                >
                  {account_info.AccountNo}
                </Text>
              </Box>
            </VStack>
            <VStack mb={5}>
              <VStack>
                <Radio.Group
                  name="myRadioGroup"
                  accessibilityLabel="favorite number"
                  value={isCard}
                  onChange={(nextValue) => {
                    setIsCard(nextValue);
                    setIsAutoSave(false);
                  }}
                >
                  <Stack
                    direction={{
                      base: "row",
                      md: "row",
                    }}
                    alignItems={{
                      base: "flex-start",
                      md: "center",
                    }}
                    space={4}
                    w="75%"
                    maxW="300px"
                  >
                    <Radio
                      colorScheme={"orange"}
                      _text={{ color: "#ffffff", fontSize: 14 }}
                      accessibilityLabel={"Transfer from Card"}
                      value={true}
                      my={1}
                    >
                      From Card
                    </Radio>
                    <Radio
                      colorScheme={"orange"}
                      _text={{ color: "#ffffff", fontSize: 14 }}
                      accessibilityLabel={"Transfer from another bank"}
                      value={false}
                      my={1}
                    >
                      From another bank
                    </Radio>
                  </Stack>
                </Radio.Group>
              </VStack>
            </VStack>
            {!isCard && (
              <VStack space={3}>
                <Box _text={{ color: "#ffffff", fontSize: 14 }}>
                  1. Copy the account details provided above
                </Box>
                <Box _text={{ color: "#ffffff", fontSize: 14 }}>
                  2. Transfer the amount you want to fund
                </Box>
                <Box>
                  <Text style={{ color: "#ffffff", fontSize: 14 }}>
                    {" "}
                    3. Your {accountType.label} will be funded immediately{" "}
                  </Text>
                </Box>
              </VStack>
            )}
            <VStack>
              {isCard && (
                <VStack space={2}>
                  <FormControl isRequired>
                    <FormControl.Label
                      type={"Email"}
                      _text={{
                        color: "#ffffff",
                        fontWeight: "medium",
                        fontSize: "sm",
                      }}
                    >
                      Amount
                    </FormControl.Label>
                    <CurrencyInput
                      precision={2}
                      minValue={0}
                      delimiter={","}
                      // separator={'.'}
                      style={{ ...Shared.TextInput.roundedInput, fontSize: 18 }}
                      placeholder={"Enter Amount"}
                      onChangeValue={(t) => {
                        setAmount(t);
                      }}
                      variant={"rounded"}
                      value={amount}
                      keyboardType={"numeric"}
                    />
                    {isFieldInError("amount") && (
                      <FormControl.ErrorMessage
                        leftIcon={<WarningOutlineIcon size="xs" />}
                      >
                        Amount not set correctly
                      </FormControl.ErrorMessage>
                    )}
                  </FormControl>
                  <FormControl>
                    <FormControl.Label
                      _text={{
                        color: "#ffffff",
                        fontWeight: "medium",
                        fontSize: "sm",
                      }}
                    >
                      Description
                    </FormControl.Label>
                    <Input
                      w={"full"}
                      onChangeText={(v) => {
                        setNarration(v);
                      }}
                      value={narration}
                      borderRadius={20}
                      multiline={true}
                      h={100}
                      placeholder={"Description"}
                      bgColor={"#ffffff"}
                      style={{ ...Shared.Select.default }}
                    />
                  </FormControl>
                  <VStack space={5} mt={3}>
                    <Checkbox
                      onChange={(v) => {
                        setIsAutoSave(v);
                      }}
                      value={isAutoSave}
                      colorScheme="orange"
                      accessibilityLabel={"On"}
                    >
                      <Text color={"#ffffff"}>Auto Save</Text>
                    </Checkbox>
                    {isAutoSave && (
                      <Box py={3}>
                        <VStack space={3}>
                          <FormControl>
                            <FormControl.Label
                              _text={{
                                color: "#ffffff",
                                fontWeight: "medium",
                                fontSize: "sm",
                              }}
                            >
                              How often will you like to save?
                            </FormControl.Label>
                            <Select
                              w={"full"}
                              onValueChange={(v) => {
                                setFrequency(v);
                              }}
                              value={frequency}
                              placeholder={"Select"}
                              bgColor={"#ffffff"}
                              borderRadius={20}
                              style={{ ...Shared.Select.default }}
                              variant={"rounded"}
                            >
                              {saveFrequency.map((y) => (
                                <Select.Item
                                  key={y.value}
                                  label={y.label}
                                  value={y.value}
                                />
                              ))}
                            </Select>
                          </FormControl>
                          <FormControl>
                            <FormControl.Label
                              _text={{
                                color: "#ffffff",
                                fontWeight: "medium",
                                fontSize: "sm",
                              }}
                            >
                              Pick a start date
                            </FormControl.Label>
                            <DateInput
                              noOfYrs={20}
                              isFutureDate={true}
                              asFarBackAs={0}
                              onDateSelected={(d) => {
                                setStartDate(d);
                              }}
                            />
                          </FormControl>
                        </VStack>
                      </Box>
                    )}
                  </VStack>
                </VStack>
              )}
              <VStack mt={10}>
                <VStack
                  marginBottom={5}
                  alignItems={"center"}
                  justifyContent={"center"}
                  space={5}
                >
                  <Box w={"full"}>
                    {isCard && (
                      <Button
                        isDisabled={!isValid}
                        variant={"solid"}
                        w={"full"}
                        size={"lg"}
                        style={Shared.Button.primary}
                        onPress={() => {
                          transferFundsToAccount();
                        }}
                      >
                        Proceed
                      </Button>
                    )}
                    {!isCard && (
                      <Button
                        variant={"solid"}
                        w={"full"}
                        size={"lg"}
                        style={Shared.Button.primary}
                        onPress={() => {
                          copyAccountDetail();
                        }}
                      >
                        Copy account details
                      </Button>
                    )}
                  </Box>
                </VStack>
              </VStack>
            </VStack>
          </Box>
        </VStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default FundAcctScreen;
