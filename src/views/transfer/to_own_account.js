import React, { useState, useCallback, useEffect, useMemo } from "react";
import { View, ScrollView, KeyboardAvoidingView } from "react-native";
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
  Select,
  FormControl,
  WarningOutlineIcon,
} from "native-base";
import { useValidation } from "react-native-form-validator";
import { useAuthentication } from "../../queries/useAuthentication";
import CurrencyInput from "react-native-currency-input";

import AlertBox from "../../components/alertbox";
import Loader from "../../components/loader";
import { getAppConfig } from "../../common/device";
import Config from "../../common/config";
import utils from "../../common/utils";

const TransferToOwnAcctScreen = ({ navigation, route }) => {
  const { fetchData: transferFunds } = useAuthentication(
    "transferintra",
    "post",
    navigation
  );
  const { fetchData: getAccounts } = useAuthentication(
    "getbankaccounts",
    "get",
    navigation
  );
  const displayName = getAppConfig().client_host_wallet_name;

  const [account, setAccount] = useState(null);
  const [toaccount, setToAccount] = useState(null);
  const [amount, setAmount] = useState(null);
  const [narration, setNarration] = useState("");
  const [myaccounts, setMyAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const { validate, isFieldInError, getErrorsInField } = useValidation({
    state: { account, toaccount, amount },
  });

  useEffect(() => {
    const valid = validate({
      account: { numbers: true, required: true },
      toaccount: { numbers: true, required: true },
      amount: { numbers: true, required: true },
    });
    setIsValid(valid);
    getBankAccounts();
  }, [account, toaccount, amount]);

  const getBankAccounts = () => {
    getAccounts({}).then((res) => {
      if (res && res.data && res.data.success) {
        setMyAccounts(res.data.data);
      }
    });
  };

  const transferFundsToAccount = async () => {
    if (amount <= 0) {
      return;
    }
    if (account == toaccount) {
      AlertBox.showError(
        "Source and Destination accounts cannot be the same.",
        "Invalid Account Selected"
      );
      return;
    }
    setIsLoading(true);
    const response = await transferFunds({
      source_account: account,
      destination_account: toaccount,
      narration: narration.trim().length > 0 ? utils.removeSpecialCharacters(narration) : "Not provided",
      amount: parseFloat(amount),
    })
      .then((res) => {
        setIsLoading(false);
        if (res && res.data && res.data.success) {
          if (res.data.data.otp_required) {
            AlertBox.showSuccess(res.data.message);
            navigation.navigate("savings_tranfers_otp", { ...res.data.data });
            return;
          }

          navigation.reset({
            index: 0,
            routes: [
              {
                name: "SuccessScreen",
                params: {
                  context: { nextPage: "Home" },
                  title: "Transaction Successful",
                  message: "Transaction completed successfully.",
                },
              },
            ],
          });
          return;
        }
        AlertBox.showErrorEx(res);
        return null;
      })
      .catch((e) => {
        setIsLoading(false);
        AlertBox.showErrorEx(e);
        return null;
      });
  };

  const getDropItemLabel = (account) => {
    const lbl = Config().getLabel(account.account_type);
    return `${lbl} Account - ${account.account_info.AccountName}(${account.account_info.AccountNo})`;
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <KeyboardAvoidingView style={styles.container}>
      <ScrollView>
        <VStack>
          <Box px={7}>
            <Box mb={5}>
              <Heading mt={5} size="2xl" fontWeight="800" color="#ffffff">
                Own Account
              </Heading>
            </Box>
            <VStack>
              <FormControl isRequired>
                <FormControl.Label
                  type={"Email"}
                  _text={{
                    color: "#ffffff",
                    fontWeight: "medium",
                    fontSize: "sm",
                  }}
                >
                  Transfer From
                </FormControl.Label>
                <Select
                  w={"full"}
                  onValueChange={(v) => {
                    setAccount(v);
                  }}
                  value={account}
                  placeholder={"Select Account"}
                  bgColor={"#ffffff"}
                  borderRadius={20}
                  style={{ ...Shared.Select.default }}
                  variant={"rounded"}
                >
                  {myaccounts &&
                    myaccounts.map((y) => (
                      <Select.Item
                        key={y.objectId}
                        isDisabled={
                          y.account_info.AccountStatus == "PENDING" ||
                          y.is_blocked
                        }
                        label={getDropItemLabel(y)}
                        value={y.account_info.AccountNo}
                      />
                    ))}
                </Select>
                {isFieldInError("account") && (
                  <FormControl.ErrorMessage
                    leftIcon={<WarningOutlineIcon size="xs" />}
                  >
                    Account not selected
                  </FormControl.ErrorMessage>
                )}
                <Text style={{ fontSize: 11, color: "#ffffff" }}>
                  Accounts with PENDING status cannot be selected.
                </Text>
              </FormControl>
              <FormControl isRequired>
                <FormControl.Label
                  type={"Email"}
                  _text={{
                    color: "#ffffff",
                    fontWeight: "medium",
                    fontSize: "sm",
                  }}
                >
                  Transfer To
                </FormControl.Label>
                <Select
                  w={"full"}
                  onValueChange={(v) => {
                    setToAccount(v);
                  }}
                  value={toaccount}
                  placeholder={"Select Account"}
                  bgColor={"#ffffff"}
                  borderRadius={20}
                  style={{ ...Shared.Select.default }}
                  variant={"rounded"}
                >
                  {myaccounts &&
                    myaccounts.map((y) => (
                      <Select.Item
                        key={y.objectId}
                        isDisabled={y.account_info.AccountStatus == "PENDING"}
                        label={getDropItemLabel(y)}
                        value={y.account_info.AccountNo}
                      />
                    ))}
                </Select>
                {isFieldInError("toaccount") && (
                  <FormControl.ErrorMessage
                    leftIcon={<WarningOutlineIcon size="xs" />}
                  >
                    Account not selected.
                  </FormControl.ErrorMessage>
                )}
              </FormControl>
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
                  precision={0}
                  minValue={0}
                  delimiter={","}
                  separator={"."}
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
                    Amount not set correctly.
                  </FormControl.ErrorMessage>
                )}
              </FormControl>
              <FormControl isRequired>
                <FormControl.Label
                  type={"Email"}
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
                {isFieldInError("narration") && (
                  <FormControl.ErrorMessage
                    leftIcon={<WarningOutlineIcon size="xs" />}
                  >
                    Narration not set.
                  </FormControl.ErrorMessage>
                )}
              </FormControl>
            </VStack>
            <VStack mt={10}>
              <Box>
                <HStack
                  marginBottom={5}
                  alignItems={"center"}
                  justifyContent={"center"}
                  space={5}
                >
                  <Box w={"full"}>
                    <Button
                      variant={"solid"}
                      w={"full"}
                      size={"lg"}
                      style={Shared.Button.primary}
                      onPress={() => {
                        transferFundsToAccount();
                      }}
                    >
                      Continue
                    </Button>
                  </Box>
                </HStack>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default TransferToOwnAcctScreen;
