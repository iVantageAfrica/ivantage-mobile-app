import React, { useState, useCallback, useEffect, useMemo } from "react";
import { ScrollView, View, KeyboardAvoidingView } from "react-native";
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
import { getAppConfig } from "../../common/device";
import Constants from "expo-constants";
import Config from "../../common/config";

import AlertBox from "../../components/alertbox";
import Loader from "../../components/loader";
import CurrencyInput from "react-native-currency-input";

const AddToDealScreen = ({ navigation, route }) => {
  const { fetchParamData: addToDeal } = useAuthentication("addtodeal", "post", navigation);
  const { fetchData: getAccounts } = useAuthentication(
    "getbankaccounts",
    "get",
    navigation
  );
  const displayName = getAppConfig().client_host_wallet_name;

  const [additionalInformation, setAdditionalInformation] = useState("");

  const [account, setAccount] = useState(null);
  const [amount, setAmount] = useState(null);
  const [selectedInvestment, setSelectedInvestment] = useState(
    route.params.selectedInvestment
  );
  const [myaccounts, setMyAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const { validate, isFieldInError, getErrorsInField } = useValidation({
    state: { account, amount },
  });

  useEffect(() => {
    const valid = validate({
      account: { numbers: true, required: true },
      amount: { numbers: true, required: true },
    });
    setIsValid(valid);
    getBankAccounts();
  }, [account, amount]);

  const getBankAccounts = () => {
    getAccounts({}).then((res) => {
      if (res && res.data && res.data.success) {
        setMyAccounts(res.data.data);
      }
    });
  };

  const addToInvestmentDeal = async () => {
    if (amount <= 0) {
      return;
    }
    setIsLoading(true);
    //selectedInvestment
    await addToDeal({
      accountNumber: account,
      additionalInformation:
        additionalInformation.trim().length > 0
          ? additionalInformation
          : "Not Provided",
      amount: parseFloat(amount),
      urlParams: { investment_id: selectedInvestment.item.objectId },
    })
      .then((res) => {
        setIsLoading(false);
        if (res && res.data && res.data.success) {
          AlertBox.showSuccess("Investment updated successfully.");
          navigation.navigate("investment_home");
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
    <>
      <ScrollView>
        <VStack>
          <Box px={5}>
            <Box mb={5}>
              <Heading mt={5} size="2xl" fontWeight="800" color="#ffffff">
                Add To Deal
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
                  Account to debit
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
                        isDisabled={y.account_info.AccountStatus == "PENDING"}
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
                  Amount to debit
                </FormControl.Label>
                <CurrencyInput
                  precision={0}
                  minValue={0}
                  delimiter={","}
                  // separator={'.'}
                  style={{ ...Shared.TextInput.roundedInput, fontSize: 18 }}
                  placeholder={"Enter Amount"}
                  variant={"rounded"}
                  value={amount}
                  keyboardType={"numeric"}
                  onChangeValue={(t) => {
                    setAmount(t);
                  }}
                />
                {isFieldInError("amount") && (
                  <FormControl.ErrorMessage
                    leftIcon={<WarningOutlineIcon size="xs" />}
                  >
                    Ammount to set
                  </FormControl.ErrorMessage>
                )}
              </FormControl>
              <FormControl>
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
                    setAdditionalInformation(v);
                  }}
                  value={additionalInformation}
                  borderRadius={20}
                  multiline={true}
                  h={100}
                  placeholder={"Description"}
                  bgColor={"#ffffff"}
                  style={{ ...Shared.Select.default }}
                />
              </FormControl>
            </VStack>
          </Box>
        </VStack>
      </ScrollView>
      <Box
        px={5}
        mt={5}
        marginBottom={10}
        alignItems={"center"}
        justifyContent={"center"}
        space={5}
      >
        <Button
          isDisabled={!isValid}
          variant={"solid"}
          w={"full"}
          size={"lg"}
          style={Shared.Button.primary}
          onPress={() => {
            addToInvestmentDeal();
          }}
        >
          Add To Deal
        </Button>
      </Box>
    </>
  );
};

export default AddToDealScreen;
