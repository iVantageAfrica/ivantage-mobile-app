import React, { useState, useCallback } from "react";
import styles from "./styles";
import Theme from "../../themes";
import { Platform } from "react-native";
import Shared from "../../themes/shared";
import { Icon } from "native-base";
import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect, CommonActions } from "@react-navigation/native";
import { useValidation } from "react-native-form-validator";
import {
  Box,
  Stack,
  VStack,
  HStack,
  Button,
  Radio,
  Heading,
  FormControl,
  WarningOutlineIcon,
  Input,
  Image,
  Text,
  ScrollView,
  Select,
  KeyboardAvoidingView,
} from "native-base";
import * as DocumentPicker from "expo-document-picker";
import { useAuthentication } from "../../queries/useAuthentication";
import AlertBox from "../../components/alertbox";
import Loader from "../../components/loader";
import { useUser } from "../../context/usercontext";
import CurrencyInput from "react-native-currency-input";


const NewMortgageScreen = ({ navigation, route }) => {
  const { uploadDocument } = useAuthentication(
    "attachmortgagedocument",
    "post",
    navigation,
    true
  );
  const { fetchData } = useAuthentication("createmortgage", "post", navigation);
  const { fetchData: getBanks } = useAuthentication("banklist", "get", navigation);

  
  const [downpayment, setDownPayment] = useState("");
  const [monthlynetincome, setMonthlyNetIncome] = useState("");
  const [document, setDocument] = useState(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [bankName, setBankName] = useState("");
  const [phoneNumberRegisteredWithBank, setPhoneNumber] = useState("");
  const [employed, setEmployed] = useState(true);
  const [isDocumentuploading, setDocumentUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [banks, setBanks] = useState([]);

  const property = route.params.property;

  const { authData, setAuthData } = useUser();

  const { validate, isFieldInError, getErrorsInField } = useValidation({
    state: { downpayment, monthlynetincome, employed },
  });

  useFocusEffect(
    useCallback(() => {
      const valid = validate({
        downpayment: { numbers: true, required: true },
        monthlynetincome: { numbers: true, required: true },
        phoneNumberRegisteredWithBank: { required: true },
        accountNumber: { numbers: true, required: true },
        accountName: { required: true },
      });
      setIsValid(valid);
      getBankList();
    }, [
      downpayment,
      monthlynetincome,
      accountNumber,
      accountName,
      phoneNumberRegisteredWithBank,
    ])
  );

  const openDocumentDialog = async (docType) => {
    const defaultOption = {
      copyToCacheDirectory: false,
      type: ["image/*", "application/pdf"],
    };
    if (docType && docType.allowed) {
      defaultOption.type = docType.allowed;
    }

    const documentResult = await DocumentPicker.getDocumentAsync(defaultOption);
    if (documentResult.type != "success") {
      return;
    }
    setDocument(documentResult);
    uploadAccountDocument({ file: documentResult });
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

  const uploadAccountDocument = (data) => {
    const form = new FormData();
    data.file.type = data.file.mimeType;
    form.append("document", data.file);
    form.append("document_type", "borrower_cv");
    setDocumentUploading(true);
    uploadDocument(form)
      .then(async (res) => {
        if (res.data && res.data.success) {
          const d = document ? { ...document } : {};
          d.fileData = res.data.data;
          setDocument({ ...data.file, ...d });
          AlertBox.showSuccess(res.data.message);
          return;
        }
        AlertBox.showErrorEx(res);
      })
      .catch((err) => {
        AlertBox.showErrorEx(
          "Unable to upload this file. Maximum allowed file size is 1MB."
        );
      })
      .finally(() => setDocumentUploading(false));
  };

  const createNewMortgageRequest = () => {
    setIsLoading(true);
    const derived_loanAmount = Number(property.price) - Number(downpayment);
    fetchData({
      name: `${authData.user.firstname} ${authData.user.surname}`,
      email: authData.user.email,
      phoneNumber: authData.user.phone,
      propertyId: property.objectId,
      propertyValue: property.price,
      loanAmount: derived_loanAmount,
      propertyLocation: `${property.district}, ${property.state}`,
      downPaymentAmount: downpayment,
      monthlyNetIncome: monthlynetincome,
      forEmployed: employed,
      bankName: bankName,
      accountNumber: `${accountNumber}`,
      accountName: accountName,
      borrowerCVLink: document.fileData.document_link,
      phoneNumberRegisteredWithBank: phoneNumberRegisteredWithBank,
    })
      .then(async (res) => {
        if (res.data && res.data.success) {
          AlertBox.showSuccess(res.data.message);
          navigation.dispatch(CommonActions.goBack());
          return;
        }
        AlertBox.showErrorEx(res);
      })
      .catch((err) => {
        AlertBox.showErrorEx(err);
      })
      .finally(() => setIsLoading(false));
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <VStack p={3} style={styles.container}>
      <Box mb={3}>
        <Heading size="2xl" fontWeight="800" color="#ffffff">
          Mortgage
        </Heading>
      </Box>
      <Box
        mb={5}
        borderRadius={7}
        shadow={15}
        style={{ backgroundColor: Theme.Colors.backgroundColorAlt }}
      >
        <HStack space={1}>
          <Image
            size={100}
            borderRadius={7}
            source={{
              uri: property.images[0].url,
            }}
            alt={property.name}
          />
          <VStack style={{ flex: 4 }} p={2}>
            <Box style={{ flex: 3 }}>
              <Text
                w={"full"}
                numberOfLines={1}
                style={{ fontSize: 18, color: "#ffffff", fontWeight: "bold" }}
              >
                {property.name}
              </Text>
            </Box>
            <Box mt={1}>
              <Text
                style={{
                  fontSize: 16,
                  color: "#ffffff",
                  alignSelf: "flex-start",
                }}
              >
                N{property.price}
              </Text>
            </Box>
            <Box mt={3}>
              <HStack>
                <Icon
                  size={4}
                  color={Theme.CustomTheme["color-active-text-alt"]}
                  as={FontAwesome}
                  name="map-marker"
                />
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 13,
                    fontWeight: "300",
                    color: Theme.CustomTheme["color-active-text-alt"],
                  }}
                >{`${property.district}, ${property.state}`}</Text>
              </HStack>
            </Box>
          </VStack>
        </HStack>
      </Box>
      <KeyboardAvoidingView
        h={{
          base: "500px",
          lg: "auto",
        }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView>
          <Box>
            <FormControl isInvalid isRequired>
              <FormControl.Label
                _text={{
                  color: "#ffffff",
                  fontWeight: "medium",
                  fontSize: "sm",
                }}
              >
                Down Payment (N)
              </FormControl.Label>
              <CurrencyInput
                precision={0}
                minValue={0}
                delimiter={","}
                // separator={'.'}
                style={{ ...Shared.TextInput.roundedInput, fontSize: 18 }}
                placeholder={"Down Payment"}
                onChangeValue={(t) => {
                  setDownPayment(t);
                }}
                variant={"rounded"}
                value={downpayment}
                keyboardType={"numeric"}
              />
              {isFieldInError("downpayment") && (
                <FormControl.ErrorMessage
                  leftIcon={<WarningOutlineIcon size="xs" />}
                >
                  Down payment amount must be specified.
                </FormControl.ErrorMessage>
              )}
            </FormControl>
            <FormControl isInvalid isRequired>
              <FormControl.Label
                _text={{
                  color: "#ffffff",
                  fontWeight: "medium",
                  fontSize: "sm",
                }}
              >
                Monthly Net Income (N)
              </FormControl.Label>
              <CurrencyInput
                precision={0}
                minValue={0}
                delimiter={","}
                //  separator={'.'}
                style={{ ...Shared.TextInput.roundedInput, fontSize: 18 }}
                placeholder={"Monthly Net Income"}
                onChangeValue={(t) => {
                  setMonthlyNetIncome(t);
                }}
                variant={"rounded"}
                value={monthlynetincome}
                keyboardType={"numeric"}
              />
              {isFieldInError("monthlynetincome") && (
                <FormControl.ErrorMessage
                  leftIcon={<WarningOutlineIcon size="xs" />}
                >
                  Monthly net income amount must be specified.
                </FormControl.ErrorMessage>
              )}
            </FormControl>
            <FormControl mt={3} isInvalid isRequired>
              <FormControl.Label
                _text={{
                  color: "#ffffff",
                  fontWeight: "medium",
                  fontSize: "sm",
                }}
              >
                Employment Status
              </FormControl.Label>
              <Radio.Group
                onChange={(v) => {
                  setEmployed(v);
                }}
                value={employed}
                name="employed"
                defaultValue=""
                accessibilityLabel="Employed"
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
                    <Text color={"#a0a5ab"}>Employed</Text>
                  </Radio>
                  <Radio value={false} colorScheme="orange" size="lg" my={1}>
                    <Text color={"#a0a5ab"}>Self Employed</Text>
                  </Radio>
                </Stack>
              </Radio.Group>
              {isFieldInError("employed") && (
                <FormControl.ErrorMessage
                  leftIcon={<WarningOutlineIcon size="xs" />}
                >
                  Please select an option.
                </FormControl.ErrorMessage>
              )}
            </FormControl>
            <FormControl isInvalid isRequired>
              <FormControl.Label
                _text={{
                  color: "#ffffff",
                  fontWeight: "medium",
                  fontSize: "sm",
                }}
              >
                Bank Name
              </FormControl.Label>
              <Input
                onChangeText={(v) => {
                  setBankName(v);
                }}
                value={bankName}
                placeholder={"Enter Bank Name"}
                style={Shared.TextInput.default}
                variant={"rounded"}
              />
              {isFieldInError("bankName") && (
                <FormControl.ErrorMessage
                  leftIcon={<WarningOutlineIcon size="xs" />}
                >
                  Bank must be specified.
                </FormControl.ErrorMessage>
              )}
            </FormControl>
            <FormControl isInvalid isRequired>
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
                onChangeText={(text) => {
                  setAccountNumber(text);
                }}
                value={`${accountNumber}`}
                maxLength={11}
                keyboardType={"number-pad"}
                placeholder={"Account Number"}
                style={Shared.TextInput.default}
                variant={"rounded"}
              />
              {isFieldInError("accountNumber") && (
                <FormControl.ErrorMessage
                  leftIcon={<WarningOutlineIcon size="xs" />}
                >
                  Account number must be specified.
                </FormControl.ErrorMessage>
              )}
            </FormControl>
            <FormControl isInvalid isRequired>
              <FormControl.Label
                _text={{
                  color: "#ffffff",
                  fontWeight: "medium",
                  fontSize: "sm",
                }}
              >
                Account Name
              </FormControl.Label>
              <Input
                onChangeText={(text) => {
                  setAccountName(text);
                }}
                value={accountName}
                placeholder={"Account Name"}
                style={Shared.TextInput.default}
                variant={"rounded"}
              />
              {isFieldInError("accountName") && (
                <FormControl.ErrorMessage
                  leftIcon={<WarningOutlineIcon size="xs" />}
                >
                  Account name must be specified.
                </FormControl.ErrorMessage>
              )}
            </FormControl>
            <FormControl isInvalid isRequired>
              <FormControl.Label
                _text={{
                  color: "#ffffff",
                  fontWeight: "medium",
                  fontSize: "sm",
                }}
              >
                Phone Number
              </FormControl.Label>
              <Text
                mt={2}
                style={{
                  color: "#ffffff",
                  fontSize: 9,
                  position: "absolute",
                  right: 0,
                }}
              >
                Must be the same phone number registered with this account
              </Text>
              <Input
                onChangeText={(text) => {
                  setPhoneNumber(text);
                }}
                value={phoneNumberRegisteredWithBank}
                keyboardType={"phone-pad"}
                maxLength={11}
                placeholder={"Phone Number"}
                style={Shared.TextInput.default}
                variant={"rounded"}
              />
              {isFieldInError("downpayment") && (
                <FormControl.ErrorMessage
                  leftIcon={<WarningOutlineIcon size="xs" />}
                >
                  Phone number must be specified.
                </FormControl.ErrorMessage>
              )}
            </FormControl>
            <VStack mt={3}>
              <HStack space={5}>
                <Text style={{ color: "#ffffff" }}>CV of Borrower</Text>
                <Text
                  style={{
                    color: "#ffffff",
                    fontSize: 9,
                    position: "absolute",
                    right: 0,
                  }}
                >
                  Professional history of the borrower
                </Text>
              </HStack>
              <Box>
                <HStack space={3}>
                  <Box
                    w={"3/4"}
                    style={{
                      borderStyle: "dotted",
                      borderWidth: 2,
                      borderColor: "#ffffff",
                      padding: 5,
                      borderRadius: 20,
                    }}
                    _text={{ color: "#ffffff", fontSize: 12 }}
                  >
                    {document ? document.name : "No File Selected"}
                  </Box>
                  <Button
                    isLoading={isDocumentuploading}
                    isLoadingText={"Busy"}
                    onPress={() => openDocumentDialog({})}
                    style={Shared.Button.primary}
                    size={"xs"}
                  >
                    {"Select File"}
                  </Button>
                </HStack>
              </Box>
              <Text style={{ fontSize: 11, color: "#e52f01" }}>
                Selected file will be uploaded automatically. Max. 1MB in size
              </Text>
            </VStack>
          </Box>
          <Box>
            <Button
              isDisabled={!isValid || !document || !document.fileData}
              onPress={() => {
                createNewMortgageRequest();
              }}
              mt={5}
              variant={"solid"}
              w={"full"}
              size={"lg"}
              style={Shared.Button.primary}
            >
              Submit Request
            </Button>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    </VStack>
  );
};

export default NewMortgageScreen;
