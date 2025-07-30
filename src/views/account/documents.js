import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Platform } from "react-native";
import styles from "./styles";
import Theme from "../../themes";
import Shared from "../../themes/shared";
import {
  Box,
  VStack,
  Stack,
  Radio,
  Checkbox,
  HStack,
  Center,
  FormControl,
  Select,
  WarningOutlineIcon,
  Input,
  Button,
  Heading,
  ScrollView,
  Text,
  KeyboardAvoidingView,
} from "native-base";
import * as DocumentPicker from "expo-document-picker";
import { useAuthentication } from "../../queries/useAuthentication";
import AlertBox from "../../components/alertbox";
import Loader from "../../components/loader";



const AccountDocumentScreen = ({ navigation, route }) => {
  const { uploadDocument } = useAuthentication(
    "attachdocument",
    "post",
    navigation,
    true
  );
  const [accountData, setAccountData] = useState(route.params.params);
  const [isLoading, setIsLoading] = useState(false);
  const [requiredFilesMap, setRequiredFilesMap] = useState({
    C: {
      name: "C",
      title: "ID",
      subtitle: "Any govt issued identification document. (Max. size 1MB)",
      file: null,
    },
    // D: {
    //   name: "D",
    //   title: "Utility Bill",
    //   subtitle: "Power bill receipt, Waste bill receipt, etc. (Max. size 1MB)",
    //   file: null,
    // },
    A: {
      name: "A",
      title: "Passport Photograph",
      allowed: ["image/*"],
      subtitle: "Your recent Passport photograph. (Max. size 1MB)",
      file: null,
    },
    B: {
      name: "B",
      title: "Your Signature",
      allowed: ["image/*"],
      subtitle: "A scanned copy of your signature. (Max. size 1MB)",
      file: null,
    },
  });

  const openDocumentDialog = async (docType) => {
    const defaultOption = {
      copyToCacheDirectory: false,
      type: ["image/*", "application/pdf"],
    };
    if (docType && docType.allowed) {
      defaultOption.type = docType.allowed;
    }

    const documentResult = await DocumentPicker.getDocumentAsync(defaultOption);
    if (documentResult.canceled) {
      return;
    }
    requiredFilesMap[docType.name].file = documentResult && documentResult.assets && documentResult.assets.length > 0? documentResult.assets[0]: null;
    setRequiredFilesMap({ ...requiredFilesMap });
    uploadAccountDocument(docType);
  };

  const uploadAccountDocument = (data) => {
    const form = new FormData();
    data.file.type = data.file.mimeType;
    form.append("document", data.file);
    form.append("document_type", data.name);
    form.append("customer_code", accountData.account_code);
    form.append("account_number", accountData.account_number);
    setIsLoading(true);
    uploadDocument(form)
      .then(async (res) => {
        if (res.data && res.data.success) {
          requiredFilesMap[data.name].fileData = res.data.data;
          setRequiredFilesMap({ ...requiredFilesMap });
          AlertBox.showSuccess(res.data.message);
          return;
        }
        requiredFilesMap[data.name].fileData = null;
        setRequiredFilesMap({ ...requiredFilesMap });
        AlertBox.showErrorEx(res);
      })
      .catch((err) => {
        AlertBox.showErrorEx(
          "Unable to upload this file. Maximum allowed file size is 1MB."
        );
      })
      .finally(() => setIsLoading(false));
  };

  const isAllDocUploaded = () => {
    let allDone = false;
    for (let d in requiredFilesMap) {
      allDone = true;
      if (
        !requiredFilesMap[d].fileData ||
        requiredFilesMap[d].fileData == null
      ) {
        allDone = false;
        break;
      }
    }
    return allDone;
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
      <ScrollView>
        <Box mt={10}>
          <Center h={"full"} mt={1} w="100%">
            <Box safeArea py="4" w="full" px={5}>
              <Heading p={2} size="2xl" fontWeight="800" color="#ffffff">
                Personal Documents
              </Heading>
              <VStack mt="3">
                <Box>
                  <VStack space={3}>
                    {requiredFilesMap &&
                      Object.values(requiredFilesMap).map((docFile, indx) => (
                        <Box
                          key={indx}
                          shadow={2}
                          p={3}
                          style={{ backgroundColor: "#2d3a48" }}
                        >
                          <VStack>
                            <HStack space={5}>
                              <Text style={{ color: "#ffffff" }}>
                                {docFile.title}
                              </Text>
                              <Text
                                style={{
                                  color: "#ffffff",
                                  fontSize: 9,
                                  position: "absolute",
                                  right: 0,
                                }}
                              >
                                {docFile.subtitle}
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
                                  {docFile.file && docFile.file.name
                                    ? docFile.file.name
                                    : "No File Selected"}
                                </Box>
                                <Button
                                  isDisabled={docFile.fileData != null}
                                  onPress={() => openDocumentDialog(docFile)}
                                  style={Shared.Button.primary}
                                  size={"xs"}
                                >
                                  {docFile.fileData != null
                                    ? "Uploaded"
                                    : "Select File"}
                                </Button>
                              </HStack>
                            </Box>
                            <Text style={{ fontSize: 11, color: "#e52f01" }}>
                              Selected file will be uploaded automatically.
                            </Text>
                          </VStack>
                        </Box>
                      ))}
                  </VStack>
                </Box>
                <Button
                  isDisabled={!isAllDocUploaded()}
                  onPress={() => {
                    navigation.reset({
                      index: 0,
                      routes: [{ name: "Home" }],
                    });
                  }}
                  mt={5}
                  variant={"solid"}
                  w={"full"}
                  size={"lg"}
                  style={Shared.Button.primary}
                >
                  All Done.
                </Button>
              </VStack>
            </Box>
          </Center>
        </Box>
        {isLoading && <Loader />}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AccountDocumentScreen;
