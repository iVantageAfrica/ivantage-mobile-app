import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  View,
  ScrollView,
  Keyboard,
  Platform,
  KeyboardEvent,
} from "react-native";
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
import { Picker } from "../../components/Picker";
import shared from "../../themes/shared";
import utils from "../../common/utils";

const TransferToOtherAcctScreen = ({ navigation, route }) => {
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
  const { fetchData: getBeneficiaries } = useAuthentication(
    "getbeneficiaries",
    "get",
    navigation
  );
  const { fetchData: getBanks } = useAuthentication("banklist", "get", navigation);
  const [isNameLoading, setNameLoading] = useState(false);
  const { fetchData: nameEnquiry } = useAuthentication("name_enquiry", "get", navigation);

  const TransferType = {
    INTER: "inter",
    INTRA: "intra",
  };
  const keyboardHeight = 0; // useKeyboard();
  const isAndroid = Platform.OS === "android";

  const beneficiaryRef = useRef(null);

  const displayName = getAppConfig().client_host_wallet_name;
  const client_host_bank_code = getAppConfig().client_host_bank_code;
  const transfer_type =
    route.params && route.params.transfer_type
      ? route.params.transfer_type
      : TransferType.INTRA;

  const [beneficiaries, setBeneficiaries] = useState([]);
  const [mainbeneficiaries, setMainBeneficiaries] = useState([]);
  const [beneficiaryFilter, setBeneficiaryFilter] = useState("");
  const [data, setData] = useState({
    bankName: "",
    amount: "",
    description: "",
    accountNumber: "",
  });
  const handleSetData = (value) => {
    setData({
      ...data,
      ...value,
    });
  };
  const [bankFilter, setBankFilter] = useState("");

  const [account, setAccount] = useState(null);
  const [toaccount, setToAccount] = useState(null);
  const [bankCode, setBankCode] = useState(null);
  const [bankName, setBankName] = useState("");
  const [amount, setAmount] = useState(null);
  const [narration, setNarration] = useState("");
  const [myaccounts, setMyAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [isFromBeneficiary, setIsFromBeneficiary] = useState(false);

  const [beneficiaryAccountNo, setBeneficiaryAccountNo] = useState("");
  const [beneficiaryAccountName, setBeneficiaryAccountName] = useState("");
  const [beneficiaryLookupSessionID, setBeneficiaryLookUpSessionID] =
    useState("");
  const [beneficiaryLookupMetaData, setBeneficiaryLookUpMetaData] =
    useState(null);

  const [banks, setBanks] = useState([]);

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
    getBeneficiaryList();
    if (transfer_type === TransferType.INTER) {
      getBankList();
    }
  }, [account, toaccount, amount]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(false);
    }, [])
  );

  const getBankAccounts = () => {
    getAccounts({}).then((res) => {
      if (res && res.data && res.data.success) {
        setMyAccounts(res.data.data);
      }
    });
  };

  const getBankList = () => {
    getBanks({}).then((res) => {
      if (res && res.data && res.data.success) {
        setBanks(res.data.data);

        return;
      }
      setBanks([]);
    });
  };

  const getBeneficiaryList = () => {
    getBeneficiaries({
      params: { transfer_type },
    }).then((res) => {
      setIsLoading(false);
      if (res && res.data && res.data.success) {
        setBeneficiaries(res.data.data);
        setMainBeneficiaries(res.data.data);
        return;
      }
      AlertBox.showErrorEx(res);
    });
  };

  const filterBeneficiaries = (str) => {
    if (!str || str.trim().length == 0) {
      setBeneficiaries(mainbeneficiaries);
      return;
    }
    str = str.trim().toLowerCase();
    const filtered = mainbeneficiaries.filter((t) => {
      return t.accountName.toLowerCase().indexOf(str) > -1;
    });
    setBeneficiaries(filtered);
  };
  const filterBanks = (str) => {
    if (!str || str.trim().length == 0) {
      setBanks(banks);
      return;
    }
    str = str.trim().toLowerCase();
    const filtered = banks.filter((t) => {
      return t.bankName.toLowerCase().indexOf(str) > -1;
    });
    setBanks(banks);
  };

  const getBankCode = (accountNo) => {
    const t = beneficiaries.filter(
      (a) => a.accountNumber && a.accountNumber === accountNo
    );
    return t && t.length === 1 ? t[0] : null;
  };

  const nameEnquiryReq = (data) => {
    setBeneficiaryAccountName("");
    setBeneficiaryAccountNo("");
    setBeneficiaryLookUpMetaData("");
    setBeneficiaryLookUpSessionID("");
    if (!toaccount) {
      AlertBox.showError(
        "Destination account number is missing. Please fill the form properly."
      );
      return;
    }
    if (transfer_type === TransferType.INTER && !bankCode) {
      AlertBox.showError(
        "Destination bank is missing. Please fill the form properly."
      );
      return;
    }
    const params = {
      accountNo: toaccount,
    };
    if (bankCode) {
      params.bankCode = bankCode;
    } else {
      params.bankCode = client_host_bank_code;
    }

    setNameLoading(true);
    nameEnquiry({
      params: { ...params },
    }).then((res) => {
      setNameLoading(false);
      if (res && res.data && res.data.success) {
        setBeneficiaryAccountName(res.data.data.accountName);
        setBeneficiaryAccountNo(res.data.data.accountNumber);
        setBeneficiaryLookUpMetaData(res.data.data);
        setBeneficiaryLookUpSessionID(res.data.data.SessionID);

        setBankCode(params.bankCode);
        return;
      }
      setBeneficiaryAccountName("");
      AlertBox.showErrorEx(res);
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
    if (!bankCode) {
      AlertBox.showError(
        "Invalid bank account selected.",
        "Invalid Account Selected"
      );
      return;
    }
    setIsLoading(true);

    await transferFunds({
      source_account: account,
      bankCode,
      destination_account: toaccount,
      narration: narration.trim().length > 0 ? utils.removeSpecialCharacters(narration) : "Not provided",
      amount: parseFloat(amount),
    })
      .then((res) => {
        if (res && res.data && res.data.success) {
          if (res.data.data.otp_required) {
            navigation.navigate("savings_tranfers_otp", {
              ...res.data.data,
              bankName,
            });
            return;
          }
          setIsLoading(false);
          AlertBox.showSuccess(res.data.message);
          return;
        }
        setIsLoading(false);
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

  const getBeneficiaryItemLabel = (account) => {
    return `${account.accountName}(${account.accountNumber} - ${account.bankName})`;
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <ScrollView style={styles.container}>
      <VStack>
        <Box px={7}>
          <Box mb={5}>
            <Heading mt={5} size="2xl" fontWeight="800" color="#ffffff">
              <Text>{displayName}</Text> Transfer
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
                defaultValue={account}
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
                Select Option
              </FormControl.Label>
              <Select
                w={"full"}
                onValueChange={(v) => {
                  setIsFromBeneficiary(v && v === "To Beneficiary");
                  setToAccount("");
                  setBeneficiaryAccountNo("");
                }}
                defaultValue={
                  isFromBeneficiary ? "To Beneficiary" : "New Account"
                }
                placeholder={"Select"}
                bgColor={"#ffffff"}
                borderRadius={20}
                style={{ ...Shared.Select.default }}
                variant={"rounded"}
              >
                {["To Beneficiary", "New Account"].map((y) => (
                  <Select.Item key={y} label={y} value={y} />
                ))}
              </Select>
            </FormControl>
            {isFromBeneficiary && (
              <HStack>
                <Box w={"3/4"}>
                  <FormControl isRequired>
                    <FormControl.Label
                      type={"Email"}
                      _text={{
                        color: "#ffffff",
                        fontWeight: "medium",
                        fontSize: "sm",
                      }}
                    >
                      Beneficiary Account
                    </FormControl.Label>

                    <Select
                      _actionSheetContent={{ bottom: keyboardHeight }}
                      _actionSheetBody={{
                        ListHeaderComponent: isAndroid ? (
                          <FormControl>
                            <FormControl.Label
                              _text={{
                                color: "#000000",
                                fontWeight: "medium",
                                fontSize: "sm",
                              }}
                            >
                              Search
                            </FormControl.Label>
                            <Input
                              ref={beneficiaryRef}
                              onChangeText={(t) => {
                                setBeneficiaryFilter(t);
                                filterBeneficiaries(t);
                                if (beneficiaryRef && beneficiaryRef.current) {
                                  if (isAndroid) {
                                    beneficiaryRef.current.focus();
                                  }
                                }
                              }}
                              autoFocus={isAndroid}
                              value={beneficiaryFilter}
                              variant={"rounded"}
                              placeholder="Search Beneficiary"
                            />
                          </FormControl>
                        ) : null,
                      }}
                      w={"full"}
                      onValueChange={(v) => {
                        const r = getBankCode(v);
                        if (r) {
                          setBankCode(r.bankCode);
                        } else {
                          setBankCode(null);
                        }
                        setToAccount(v);
                        setBeneficiaryAccountNo(v);
                      }}
                      defaultValue={toaccount}
                      value={toaccount}
                      placeholder={"Select Beneficiary Account"}
                      bgColor={"#ffffff"}
                      borderRadius={20}
                      style={{ ...Shared.Select.default }}
                      variant={"rounded"}
                    >
                      {beneficiaries &&
                        beneficiaries.map((y) => (
                          <Select.Item
                            key={y.objectId}
                            label={getBeneficiaryItemLabel(y)}
                            value={y.accountNumber}
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
                    <Text style={{ fontSize: 11, color: "#ffffff" }}>
                      Select from a list of beneficiaries you created.
                    </Text>
                  </FormControl>
                </Box>
                <Box ml={2} pt={8}>
                  <Button
                    onPress={() => navigation.navigate("manage_beneficiaries")}
                    style={Shared.Button.primary}
                    variant={"solid"}
                  >
                    Add New
                  </Button>
                </Box>
              </HStack>
            )}
            {!isFromBeneficiary && transfer_type === TransferType.INTER && (
              <FormControl mb={2} isRequired>
                <FormControl.Label
                  _text={{
                    color: "#ffffff",
                    fontWeight: "medium",
                    fontSize: "sm",
                  }}
                >
                  Beneficiary Bank
                </FormControl.Label>
                {/* start of new  */}

                <Picker
                  value={data.bankName}
                  items={banks.map(({ bankCode, bankName }) => ({
                    label: bankName,
                    value: bankCode,
                  }))}
                  onSelect={(bankName) => {
                    // const selectedBank = banks.filter(
                    //   (item) => item.bankCode === v.value
                    // )[0];

                    handleSetData({ bankName });
                    const { value, label } = bankName;
                    setBankName(label);
                    setBankCode(value);
                  }}
                  placeholder="Select Bank"
                  coverStyle={{ ...Shared.Select.default }}
                />
                {/* end of new */}
               

                {isFieldInError("account") && (
                  <FormControl.ErrorMessage
                    leftIcon={<WarningOutlineIcon size="xs" />}
                  >
                    Bank Name not selected
                  </FormControl.ErrorMessage>
                )}
              </FormControl>
            )}
            {!isFromBeneficiary && (
              <HStack>
                <Box w={"3/4"}>
                  <FormControl mb={2} isRequired>
                    <FormControl.Label
                      _text={{
                        color: "#ffffff",
                        fontWeight: "medium",
                        fontSize: "sm",
                      }}
                    >
                      Account Number
                    </FormControl.Label>
                    <Input
                      onSubmitEditing={(e) => {
                        nameEnquiryReq(toaccount);
                      }}
                      maxLength={11}
                      style={Shared.TextInput.default}
                      placeholder={"Enter Account Number"}
                      onChangeText={(t) => {
                        setToAccount(t);
                      }}
                      variant={"rounded"}
                      value={toaccount}
                      keyboardType={"number-pad"}
                    />
                    {isFieldInError("account") && (
                      <FormControl.ErrorMessage
                        leftIcon={<WarningOutlineIcon size="xs" />}
                      >
                        Account Number not correctly filled.
                      </FormControl.ErrorMessage>
                    )}
                  </FormControl>
                </Box>
                <Box ml={2} pt={8}>
                  <Button
                    isLoading={isNameLoading}
                    onPress={() => nameEnquiryReq(toaccount)}
                    style={Shared.Button.primary}
                    variant={"solid"}
                  >
                    Search
                  </Button>
                </Box>
              </HStack>
            )}
            {!isFromBeneficiary && (
              <FormControl isRequired>
                <FormControl.Label
                  type={"Email"}
                  _text={{
                    color: "#ffffff",
                    fontWeight: "medium",
                    fontSize: "sm",
                  }}
                >
                  Account Name
                </FormControl.Label>
                <Input
                  w={"full"}
                  value={beneficiaryAccountName}
                  borderRadius={20}
                  isReadOnly
                  placeholder={"Destination Account Name"}
                  bgColor={"#ffffff"}
                  style={{ ...Shared.Select.default }}
                />
              </FormControl>
            )}
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
                //separator={"."}
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
                    isDisabled={
                      !beneficiaryAccountNo ||
                      beneficiaryAccountNo.trim().length <= 0
                    }
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
  );
};

export default TransferToOtherAcctScreen;
