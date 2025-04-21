import React, { useState, useCallback, useEffect } from "react";
import { View } from "react-native";
import styles from "./styles";
import Theme from "../../themes";
import Shared from "../../themes/shared";
import { useAuthentication } from "../../queries/useAuthentication";
import {
  Box,
  VStack,
  Radio,
  HStack,
  Button,
  FormControl,
  FlatList,
  Heading,
  Input,
  Image,
  Text,
  Select,
  Center,
  ScrollView,
  Checkbox,
  Stack,
} from "native-base";
import AlertBox from "../../components/alertbox";
import { useValidation } from "react-native-form-validator";
import Loader from "../../components/loader";
import CurrencyInput from "react-native-currency-input";
import Utils from "../../common/utils";

const AffordabilityCalculatorScreen = ({ navigation, route }) => {
  const maxLoanAge = 60;
  const incTaxIns = false;
  const incPMI = false;
  const taxes = 0;
  const hoaDues = 0;
  const debtToIncome = 0.33;
  const homeInsurance = 0;
  const [isLoading, setIsLoading] = useState(true);
  const [borrowingWithPartner, setBorrowingWithPartner] = useState(false);
  const [hasOtherLoan, setHasOtherLoan] = useState(false);
  const [otherLoanAmount, setOtherLoanAmount] = useState(0.0);
  const [partnerMonthlyIncome, setPartnerMonthlyIncome] = useState(0.0);
  const [monthlyIncome, setMonthlyIncome] = useState("0.00");
  const [annualIncome, setAnnualIncome] = useState("0.00");
  const [monthlyDebt, setMonthlyDebt] = useState(0.0);
  const [downPayment, setDownPayment] = useState("0.00");
  const [interestRate, setInterestRate] = useState(0.26);
  const [age, setAge] = useState(0);
  const [affordableValue, setAffordableValue] = useState(0.0);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const getAffordability = () => {
    const mainMonthlyIncome = getTotalMonthly();
    if (mainMonthlyIncome <= 0) {
      AlertBox.showError("You are not eligible for a loan");
      return;
    }

    let payment =
      (Number(mainMonthlyIncome) - getTotalMonthlyDebt()) * debtToIncome;
    const loanTerm = Number(getLoanTerm());
    if (loanTerm <= 0) {
      AlertBox.showError("You are not eligible for a loan");
      return;
    }

    const yrs = loanTerm * 12;
    const rte = interestRate / 12;
    const loanAmount = (payment * (1 - Math.pow(1 + rte, -1 * yrs))) / rte;

    const affordability_amt = Number(loanAmount) + Number(downPayment);
    setAffordableValue(affordability_amt.toFixed(2));
    navigation.navigate("AffordabilityListingScreen", {
      affordability_amt,
      loanTerm,
      repayment: payment,
      amt: loanAmount,
    });
  };

  const getLoanTerm = () => {
    if (age <= 17) {
      return -1;
    }
    if (age >= maxLoanAge) {
      return -1;
    }
    const t = maxLoanAge - age;
    return t > 20 ? 20 : t;
  };

  const getTotalMonthly = () => {
    let monthly = Number(monthlyIncome);
    if (borrowingWithPartner) {
      monthly += Number(partnerMonthlyIncome);
    }

    if (annualIncome && annualIncome > 0) {
      monthly += Number(annualIncome) / 12;
    }
    return monthly;
  };

  const getTotalMonthlyDebt = () => {
    let monthlyDebt = 0;
    if (hasOtherLoan) {
      monthlyDebt += Number(otherLoanAmount);
    }
    return monthlyDebt;
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <ScrollView contentInset={{ bottom: 100 }} style={styles.container} px={5}>
      <Box>
        <Box safeArea p="2" w="full" mb={10}>
          <Heading size="xl" fontWeight="800" color="#ffffff">
            Affordability Calculator
          </Heading>
          <VStack mt={3} space={2}>
            <FormControl isInvalid>
              <FormControl.Label
                _text={{
                  color: "#ffffff",
                  fontWeight: "medium",
                  fontSize: "sm",
                }}
              >
                What is your Net monthly income?
              </FormControl.Label>
              <CurrencyInput
                precision={0}
                delimiter={","}
                minValue={0}
                //  separator={'.'}
                style={{ ...Shared.TextInput.roundedInput, fontSize: 18 }}
                placeholder={"Monthly Income"}
                onChangeValue={(text) => {
                  setMonthlyIncome(text);
                }}
                variant={"rounded"}
                value={monthlyIncome}
                keyboardType={"numeric"}
              />
            </FormControl>
            <FormControl isInvalid>
              <FormControl.Label
                _text={{
                  color: "#ffffff",
                  fontWeight: "medium",
                  fontSize: "sm",
                }}
              >
                What is your annual additional income?
              </FormControl.Label>
              <CurrencyInput
                precision={0}
                delimiter={","}
                minValue={0}
                //separator={"."}
                style={{ ...Shared.TextInput.roundedInput, fontSize: 18 }}
                placeholder={"Additional annual income"}
                onChangeValue={(text) => {
                  setAnnualIncome(text);
                }}
                variant={"rounded"}
                value={annualIncome}
                keyboardType={"numeric"}
              />
            </FormControl>
            <FormControl isInvalid>
              <FormControl.Label
                _text={{
                  color: "#ffffff",
                  fontWeight: "medium",
                  fontSize: "sm",
                }}
              >
                Are you borrowing with a partner?
              </FormControl.Label>
              <Radio.Group
                onChange={(v) => {
                  setBorrowingWithPartner(v);
                }}
                value={borrowingWithPartner}
                name="withPartner"
                defaultValue=""
                accessibilityLabel="pick an option"
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
                  <Radio value={true} colorScheme="orange" size="lg" my={1}>
                    <Text color={"#a0a5ab"}> Yes, with a partner </Text>
                  </Radio>
                  <Radio value={false} colorScheme="orange" size="lg" my={1}>
                    <Text color={"#a0a5ab"}>No</Text>
                  </Radio>
                </Stack>
              </Radio.Group>
            </FormControl>
            {borrowingWithPartner && (
              <FormControl isInvalid>
                <FormControl.Label
                  _text={{
                    color: "#ffffff",
                    fontWeight: "medium",
                    fontSize: "sm",
                  }}
                >
                  What is your partner's net monthly income?
                </FormControl.Label>
                <CurrencyInput
                  precision={0}
                  delimiter={","}
                  minValue={0}
                  // separator={"."}
                  style={{ ...Shared.TextInput.roundedInput, fontSize: 18 }}
                  placeholder={"Partner's monthly income"}
                  onChangeValue={(text) => {
                    setPartnerMonthlyIncome(text);
                  }}
                  variant={"rounded"}
                  value={partnerMonthlyIncome}
                  keyboardType={"numeric"}
                />
              </FormControl>
            )}
            <FormControl isInvalid>
              <FormControl.Label
                _text={{
                  color: "#ffffff",
                  fontWeight: "medium",
                  fontSize: "sm",
                }}
              >
                Age
              </FormControl.Label>
              <Input
                placeholder="18-60 years old"
                keyboardType="numeric"
                onChangeText={(text) => {
                  setAge(parseInt(text));
                }}
                value={age}
                style={{ ...Shared.TextInput.default, fontSize: 18 }}
                variant={"rounded"}
              />
            </FormControl>
            <FormControl isInvalid>
              <FormControl.Label
                _text={{
                  color: "#ffffff",
                  fontWeight: "medium",
                  fontSize: "sm",
                }}
              >
                Down Payment
              </FormControl.Label>
              <CurrencyInput
                precision={0}
                delimiter={","}
                minValue={0}
                // separator={"."}
                style={{ ...Shared.TextInput.roundedInput, fontSize: 18 }}
                placeholder={"Down payment"}
                onChangeValue={(text) => {
                  setDownPayment(text);
                }}
                variant={"rounded"}
                value={downPayment}
                keyboardType={"numeric"}
              />
            </FormControl>
            <FormControl isInvalid>
              <FormControl.Label
                _text={{
                  color: "#ffffff",
                  fontWeight: "medium",
                  fontSize: "sm",
                }}
              >
                Do you have other loan obligation?
              </FormControl.Label>
              <Radio.Group
                onChange={(v) => {
                  setHasOtherLoan(v);
                }}
                value={hasOtherLoan}
                name="qGroup"
                defaultValue={false}
                accessibilityLabel="pick an option"
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
                  <Radio value={true} colorScheme="orange" size="lg" my={1}>
                    <Text color={"#a0a5ab"}> Yes </Text>
                  </Radio>
                  <Radio value={false} colorScheme="orange" size="lg" my={1}>
                    <Text color={"#a0a5ab"}>No</Text>
                  </Radio>
                </Stack>
              </Radio.Group>
            </FormControl>
            {hasOtherLoan && (
              <FormControl>
                <FormControl.Label
                  _text={{
                    color: "#ffffff",
                    fontWeight: "medium",
                    fontSize: "sm",
                  }}
                >
                  What is your total monthly repayment obligation?
                </FormControl.Label>
                <CurrencyInput
                  precision={0}
                  delimiter={","}
                  minValue={0}
                  //   separator={"."}
                  style={{ ...Shared.TextInput.roundedInput, fontSize: 18 }}
                  placeholder={"0.00"}
                  onChangeValue={(text) => {
                    setOtherLoanAmount(text);
                  }}
                  variant={"rounded"}
                  value={otherLoanAmount}
                  keyboardType={"numeric"}
                />
              </FormControl>
            )}
          </VStack>
          <Box
            mt={10}
            px={1}
            marginBottom={5}
            alignItems={"center"}
            justifyContent={"center"}
            space={5}
          >
            <Button
              onPress={getAffordability}
              variant={"solid"}
              w={"full"}
              size={"lg"}
              style={Shared.Button.primary}
            >
              Check Loan Affordability
            </Button>
          </Box>
        </Box>
      </Box>
    </ScrollView>
  );
};

export default AffordabilityCalculatorScreen;
