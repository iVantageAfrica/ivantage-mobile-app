import React, { useState, useCallback, useEffect, useMemo } from "react";
import { View, KeyboardAvoidingView } from "react-native";
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
  ScrollView,
} from "native-base";
import { useValidation } from "react-native-form-validator";
import { useAuthentication } from "../../queries/useAuthentication";
import CurrencyInput from "react-native-currency-input";
import { getAppConfig } from "../../common/device";
import Config from "../../common/config";

import AlertBox from "../../components/alertbox";
import Loader from "../../components/loader";

const NewInvestmentScreen = ({ navigation, route }) => {
  const { fetchData: makeInvestment } = useAuthentication(
    "newinvestment",
    "post",
    navigation
  );
  const { fetchData: getAccounts } = useAuthentication(
    "getbankaccounts",
    "get",
    navigation
  );
  const { fetchData: getTenorList } = useAuthentication("gettenorlist", "get", navigation);
  const { fetchData: getInterestRate } = useAuthentication(
    "interest_rates",
    "get",
    navigation
  );
  const displayName = getAppConfig().client_host_wallet_name;

  const monthsWith30Days = ["04", "06", "09", "11"];
  const [years, setYears] = useState([]);
  const [months, setMonths] = useState([]);
  const [day, setDay] = useState([]);
  const [tenors, setTenors] = useState([]);

  const [selectedYear, setYear] = useState("");
  const [selectedMonth, setMonth] = useState("");
  const [selectedDay, setSelectedDay] = useState("");

  const [tenor, setTenor] = useState("");
  const [interestRateData, setInterestRateData] = useState(null);

  const [account, setAccount] = useState(null);
  const [amount, setAmount] = useState(null);
  const [referralCode, setReferralCode] = useState(null);
  const [myaccounts, setMyAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingInterest, setIsLoadingInterest] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const { validate, isFieldInError, getErrorsInField } = useValidation({
    state: { account, amount },
  });

  useEffect(() => {
    const valid = validate({
      account: { numbers: true, required: true },
      tenor: { required: true },
      amount: { numbers: true, required: true },
    });
    setIsValid(valid);
    getBankAccounts();
    getTenorListRef();
    generateYears();
    generateMonths();
  }, [account, tenor, amount]);

  const getBankAccounts = () => {
    getAccounts({}).then((res) => {
      if (res && res.data && res.data.success) {
        setMyAccounts(res.data.data);
      }
    });
  };

  const getTenorListRef = () => {
    getTenorList({}).then((res) => {
      if (res && res.data && res.data.success) {
        const tenorList = (res.data.data || []).filter(v => {
          return v.value >= 0
        })
        setTenors(tenorList);
      }
    });
  };

  const getInterestRateData = (selected_tenor) => {
    if (!amount || !selected_tenor) {
      return;
    }
    setIsLoadingInterest(true);
    getInterestRate({
      params: { amount, tenor: selected_tenor },
    })
      .then((res) => {
        setIsLoadingInterest(false);
        if (res && res.data && res.data.success) {
          setInterestRateData(res.data.data);
        } else {
          AlertBox.showErrorEx(res);
        }
      })
      .catch((e) => {
        setIsLoadingInterest(false);
        AlertBox.showErrorEx(e);
      });
  };

  const makeInvestmentRequest = async () => {
    if (amount <= 0) {
      return;
    }
    if (amount < 50000) {
      AlertBox.showError(
        "Amount cannot be less then NGN50,000",
        "Invalid Amount"
      );
      return;
    }
    if (amount > 20000000) {
      AlertBox.showError(
        "Amount cannot be more then NGN20,000,000",
        "Invalid Amount"
      );
      return;
    }
    const d = composeDate();
    if (d <= new Date()) {
      AlertBox.showError(
        "Effective date cannot be in the past. Please select a date in the future.",
        "Invalid Date"
      );
      return;
    }
    setIsLoading(true);
    await makeInvestment({
      accountNumber: account,
      tenor,
      effectiveDate: d,
      amount: parseFloat(amount),
      referralCode,
    })
      .then((res) => {
        setIsLoading(false);
        if (res && res.data && res.data.success) {
          AlertBox.showSuccess(
            "Your investment request has been received successfully."
          );
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

  const getTenor = (tenor_item) => {
    return tenor_item.name;
  };

  const generateYears = () => {
    const currentYear = new Date().getFullYear(); // Year allowed to create a bank account.
    const validYears = [];
    for (let i = 0; i < 5; i++) {
      validYears.push((currentYear + i).toString());
    }
    setYears(validYears);
  };

  const generateMonths = () => {
    const validMonths = [];
    for (let i = 1; i <= 12; i++) {
      if (i < 10) {
        validMonths.push("0" + i);
      } else {
        validMonths.push(i.toString());
      }
    }
    setMonths(validMonths);
  };

  const generateDays = (monthSelected) => {
    let endAt = 31;
    if (monthsWith30Days.includes(monthSelected)) {
      endAt = 30;
    } else if (monthSelected == "02") {
      endAt = 29;
    }
    const validDay = [];
    for (let i = 1; i <= endAt; i++) {
      if (i < 10) {
        validDay.push("0" + i);
      } else {
        validDay.push(i.toString());
      }
    }
    setMonth(monthSelected.toString());
    setDay(validDay);
  };

  const composeDate = () => {
    let d = selectedYear + "-" + selectedMonth + "-" + selectedDay;
    const t = new Date(d);
    return isNaN(t) ? false : t;
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <ScrollView>
        <Box px={5}>
          <Box mb={1}>
            <Heading mt={5} size="xl" fontWeight="800" color="#ffffff">
              New Investment
            </Heading>
          </Box>
          <VStack space={1} mb={50}>
            <VStack>
              <FormControl isInvalid isRequired>
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
              </FormControl>
              <FormControl isInvalid isRequired>
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
                  delimiter={","}
                  minValue={0}
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
                    Amount not set.
                  </FormControl.ErrorMessage>
                )}
              </FormControl>
              <FormControl isInvalid isRequired>
                <FormControl.Label
                  type={"Email"}
                  _text={{
                    color: "#ffffff",
                    fontWeight: "medium",
                    fontSize: "sm",
                  }}
                >
                  Tenor
                </FormControl.Label>
                <Select
                  w={"full"}
                  onValueChange={(v) => {
                    setTenor(v);
                    getInterestRateData(v);
                  }}
                  value={tenor}
                  placeholder={"Select Tenor"}
                  bgColor={"#ffffff"}
                  borderRadius={20}
                  style={{ ...Shared.Select.default }}
                  variant={"rounded"}
                >
                  {tenors &&
                    tenors.map((y) => (
                      <Select.Item
                        key={y.value}
                        label={getTenor(y)}
                        value={y.value}
                      />
                    ))}
                </Select>
                {isFieldInError("tenor") && (
                  <FormControl.ErrorMessage
                    leftIcon={<WarningOutlineIcon size="xs" />}
                  >
                    Tenor not selected
                  </FormControl.ErrorMessage>
                )}
                {(!interestRateData || isLoadingInterest) && (
                  <Box
                    mt={5}
                    mb={3}
                    style={{
                      padding: 10,
                      borderWidth: 1,
                      borderColor: Theme.Colors.backgroundColorAlt,
                    }}
                    _text={{
                      color: "#ffffff",
                      fontWeight: "medium",
                      fontSize: "sm",
                    }}
                  >
                    {isLoadingInterest
                      ? "Loading Tenor's interest rate..."
                      : "No Tenor or Amount specified"}
                  </Box>
                )}
                {interestRateData && !isLoadingInterest && (
                  <Box
                    mt={5}
                    mb={3}
                    style={{
                      padding: 10,
                      borderWidth: 1,
                      borderColor: Theme.Colors.backgroundColorAlt,
                    }}
                  >
                    <Text
                      style={{
                        color: "#ffffff",
                        fontWeight: "bold",
                        fontSize: 15,
                      }}
                    >
                      Interest Rate: {interestRateData.interestRate}% p.a.
                    </Text>
                  </Box>
                )}
              </FormControl>
              <FormControl isRequired>
                <FormControl.Label
                  _text={{
                    color: "#ffffff",
                    fontWeight: "medium",
                    fontSize: "sm",
                  }}
                >
                  Effective Date
                </FormControl.Label>
                <HStack space={1} paddingRight={5}>
                  <Select
                    onValueChange={(v) => {
                      setYear(v.toString());
                    }}
                    value={selectedYear}
                    placeholder={"Year"}
                    bgColor={"#ffffff"}
                    borderRadius={20}
                    w={"90"}
                    style={{ ...Shared.Select.default }}
                    variant={"rounded"}
                  >
                    {years &&
                      years.map((y) => (
                        <Select.Item key={y} label={y} value={y} />
                      ))}
                  </Select>
                  <Select
                    value={selectedMonth}
                    onValueChange={(e) => generateDays(e)}
                    placeholder={"Month"}
                    bgColor={"#ffffff"}
                    borderRadius={20}
                    w={"90"}
                    style={{ ...Shared.Select.default }}
                    variant={"rounded"}
                  >
                    {months &&
                      months.map((y) => (
                        <Select.Item key={y} label={y} value={y} />
                      ))}
                  </Select>
                  <Select
                    onValueChange={(v) => {
                      setSelectedDay(v.toString());
                    }}
                    placeholder={"Day"}
                    value={selectedDay}
                    bgColor={"#ffffff"}
                    borderRadius={20}
                    w={"90"}
                    style={{ ...Shared.Select.default }}
                    variant={"rounded"}
                  >
                    {day &&
                      day.map((y) => (
                        <Select.Item key={y} label={y} value={y} />
                      ))}
                  </Select>
                </HStack>
                {(isFieldInError("selectedYear") ||
                  isFieldInError("selectedMonth") ||
                  isFieldInError("selectedDay")) && (
                  <FormControl.ErrorMessage
                    leftIcon={<WarningOutlineIcon size="xs" />}
                  >
                    Date selection not valid
                  </FormControl.ErrorMessage>
                )}
              </FormControl>
              <FormControl mt={3}>
                <FormControl.Label
                  _text={{
                    color: "#ffffff",
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
            </VStack>
          </VStack>
        </Box>
      </ScrollView>
      <Box
        px={5}
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
            makeInvestmentRequest();
          }}
        >
          Make Investment
        </Button>
      </Box>
    </>
  );
};

export default NewInvestmentScreen;
