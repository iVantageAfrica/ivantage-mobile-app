import {
  Box,
  VStack,
  Text,
  FlatList,
  Heading,
  Image,
  FormControl,
  WarningOutlineIcon,
  Select,
  Input,
  Button,
} from "native-base";
import styles from "./styles";
import { useAuthentication } from "../../queries/useAuthentication";
import { useFocusEffect } from "@react-navigation/native";
import AlertBox from "../../components/alertbox";
import { useCallback, useEffect, useState } from "react";
import MoreItem from "../../components/moreitem";
import Loader from "../../components/loader";
import Theme from "../../themes";
import { MSStorage } from "../../common/storage";

import Shared from "../../themes/shared";
import { useValidation } from "react-native-form-validator";
import CurrencyInput from "react-native-currency-input";

import { Icon } from "native-base";
import { FontAwesome } from "@expo/vector-icons";
import { getAppConfig } from "../../common/device";
import Config from "../../common/config";
import * as LocalAuthentication from 'expo-local-authentication';


const PurchaseScreen = ({ navigation, route }) => {
  const { fetchData: makePurchaseRequest } = useAuthentication(
    "bill_group_biller_lookup",
    "post",
    navigation,
    false
  );
  const { fetchData: getAccounts } = useAuthentication("getbankaccounts", "get", navigation);

  const { product, biller } = route.params;
  const [myaccounts, setMyAccounts] = useState([]);
  const [account, setAccount] = useState(null);
  const [customerNo, setCustomerNo] = useState(null);
  const [amount, setAmount] = useState(product.amount);
  const [isFixedAmount, setIsFixedAmount] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnableBtn, setEnableBtn] = useState(false);
  const displayName = getAppConfig().client_host_wallet_name;
  const { validate, isFieldInError, getErrorsInField } = useValidation({
    state: { account, amount, customerNo },
  });
  const [isBiometricEnabled, setIsBiometricEnable] = useState(false);

   useFocusEffect(useCallback(() => {
        (async () => {
                const isEnable = await MSStorage.getItem('enable_biometric')
                setIsBiometricEnable(isEnable)
        })()
    }, [isBiometricEnabled]))

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({ title: `${biller.name}` });
      if (product.amount && product.amount > 0) {
        setIsFixedAmount(true);
      }
      getBankAccounts();
    }, [])
  );

  useEffect(() => {
    const valid = validate({
      account: { numbers: true, required: true },
      customerNo: { required: true },
      amount: { numbers: true, required: true },
    });
    setEnableBtn(valid);
  }, [customerNo, amount, account]);

  const getBankAccounts = () => {
    getAccounts({}).then((res) => {
      if (res && res.data && res.data.success) {
        setMyAccounts(res.data.data);
      }
    });
  };

  const configureBiometricAuth = async () => {
    if (!isBiometricEnabled) {
      await makePaymentForPackagesData()
      return
    }
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Biometric Authentication Required",
    })
    if (result && result.success) {
      await makePaymentForPackagesData()
    } else {
      if (result && result.error === 'user_cancel') {
        return
      }
      configureBiometricAuth()
    }
  }

  const makePaymentForPackagesData = async () => {
    const valid = validate({
      account: { numbers: true, required: true },
      customerNo: { required: true },
      amount: { numbers: true, required: true },
    });
    setEnableBtn(valid);
    if (!valid) {
      return;
    }
    setIsLoading(true);

    await makePurchaseRequest({
      billerId: biller.id,
      accountNo: account,
      amount: Math.abs(amount),
      customerId: customerNo,
      billerSlug: biller.slug,
      productName: product.slug,
    })
      .then((res) => {
        setIsLoading(false);
        if (res && res.data && res.data.success) {
          AlertBox.showSuccess(
            `${biller.name} ${product.name} for customer number ${customerNo} paid for successfully.`
          );
          const acctInfo = myaccounts.filter(
            (y) => y.account_info.AccountNo === account
          );
          if (acctInfo && acctInfo.length > 0) {
            navigation.navigate("AccountDetail", {
              params: acctInfo[0],
              screen: acctInfo[0].name,
            });
          }

          return;
        }
        AlertBox.showErrorEx(res);
        return;
      })
      .catch((err) => {
        setIsLoading(false);
        AlertBox.showErrorEx(err);
        return;
      });
  };

  const getDropItemLabel = (account) => {
    const lbl = Config().getLabel(account.account_type);
    return `${lbl} Account - ${account.account_info.AccountName}(${account.account_info.AccountNo})`;
  };

  if (isLoading) {
    return (
      <Box>
        {" "}
        <Loader />{" "}
      </Box>
    );
  }

  return (
    <VStack style={styles.container}>
      <Box ml={3} mb={3}>
        <Heading px={2} mt={3} fontWeight="600" color="#ffffff">
          {product.name}
        </Heading>
      </Box>
      <VStack space={3} px={5}>
        <FormControl isRequired>
          <FormControl.Label
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
            // separator={'.'}
            type={"text"}
            keyboardType={"numeric"}
            returnKeyLabel={"Done"}
            style={{ ...Shared.TextInput.roundedInput, fontSize: 18 }}
            placeholder={"Enter Amount"}
            onChangeValue={(t) => {
              if (!isFixedAmount) {
                setAmount(t);
              }
            }}
            variant={"rounded"}
            value={amount}
          />
          {isFieldInError("account") && (
            <FormControl.ErrorMessage
              leftIcon={<WarningOutlineIcon size="xs" />}
            >
              Account not selected
            </FormControl.ErrorMessage>
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
            Select Account
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
                    y.account_info.AccountStatus == "PENDING" || y.is_blocked
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
        </FormControl>
        <FormControl isRequired>
          <FormControl.Label
            _text={{
              color: "#ffffff",
              fontWeight: "medium",
              fontSize: "sm",
            }}
          >
            {biller.name} Customer Number
          </FormControl.Label>
          <Input
            type={"text"}
            returnKeyLabel={"Done"}
            style={{ ...Shared.TextInput.roundedInput, fontSize: 18 }}
            placeholder={`Enter ${biller.name} Number`}
            onChangeText={(v) => {
              setCustomerNo(v);
            }}
            variant={"rounded"}
            value={customerNo}
          />
          {isFieldInError("account") && (
            <FormControl.ErrorMessage
              leftIcon={<WarningOutlineIcon size="xs" />}
            >
              Account not selected
            </FormControl.ErrorMessage>
          )}
        </FormControl>
      </VStack>
      <Box px={3} mt={5}>
        <Button
          mt={5}
          mb={5}
          isLoading={isLoading}
          isLoadingText={"Processing..."}
          isDisabled={!isEnableBtn}
          onPress={configureBiometricAuth}
          variant={"solid"}
          w={"full"}
          size={"lg"}
          style={Shared.Button.primary}
        >
          Proceed
        </Button>
      </Box>
    </VStack>
  );
};

export default PurchaseScreen;
