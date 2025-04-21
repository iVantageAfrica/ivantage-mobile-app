import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import styles from "./styles";
import Theme from "../../themes";
import Shared from "../../themes/shared";
import Constants from "expo-constants";

import { Icon } from "native-base";
import { FontAwesome } from "@expo/vector-icons";

import {
  Box,
  VStack,
  HStack,
  Button,
  Heading,
  Image,
  Text,
  Link,
  Checkbox,
} from "native-base";

import { useUser } from "../../context/usercontext";

import TransactionSummary from "../partials/transaction_summary";

const TransactionSummaryScreen = ({ navigation, route }) => {
  const { transaction = null } = route.params;
  const { authData } = useUser();

  useEffect(() => {}, []);

  return (
    <ScrollView>
    <VStack style={styles.container}>
      <Box p={5}>
        <TransactionSummary transaction={transaction} />
      </Box>
    </VStack>
    </ScrollView>
  );
};

export default TransactionSummaryScreen;
