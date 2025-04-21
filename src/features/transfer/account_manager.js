import React from "react";
import { View } from "react-native";
import styles from "./styles";
import Theme from "../../themes";
import Shared from "../../themes/shared";

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
  Center,
  ScrollView,
} from "native-base";

const { AccountManager, IvantageLogo, Bank } = Theme.SVG;

const AccountManagerScreen = ({ navigation, route }) => {
  return (
    <>
      <ScrollView px={5} style={styles.container}>
        <VStack space={5} mb={10}>
          <Box mt={3}>
            <Center>
              <Image
                w={200}
                h={260}
                alt={"Praise Adebayo"}
                source={{
                  uri: "https://rla-and-mortgage-broker314133607417.s3.amazonaws.com/account_manager.png",
                }}
              />
            </Center>
          </Box>
          <Box mt={5}>
            <VStack space={2}>
              <Text style={{ color: "#e9e9e9", fontSize: 13 }}>
                Account Manager's Name
              </Text>
              <Text style={{ color: "#ffffff", fontSize: 19 }}>
                Praise Adebayo
              </Text>
            </VStack>
          </Box>
          <Box mt={1}>
            <VStack>
              <Text style={{ color: "#e9e9e9", fontSize: 13 }}>
                Account Manager's Email
              </Text>
              <Link
                mt={2}
                href="mailto:praise.adebayo@imperialmortgagebank.com"
                isUnderlined={false}
                _text={{
                  color: "#ffffff",
                  fontSize: 13,
                  fontWeight: "extrabold",
                }}
              >
                <Icon
                  size={4}
                  color={"#ffffff"}
                  as={FontAwesome}
                  name="envelope"
                  mr={2}
                />
                praise.adebayo@imperialmortgagebank.com
              </Link>
              <Text style={{ fontSize: 11, color: "#ffffff" }}>
                (Tap to send email)
              </Text>
            </VStack>
          </Box>
          <Box>
            <VStack space={1}>
              <Text style={{ color: "#e9e9e9", fontSize: 13 }}>
                Account Manager's Phone Number 1
              </Text>
              <Link
                isUnderlined={false}
                href="tel:08081281702"
                _text={{
                  color: "#ffffff",
                  fontSize: 14,
                  fontWeight: "extrabold",
                }}
              >
                {" "}
                <Icon
                  size={4}
                  color={"#ffffff"}
                  as={FontAwesome}
                  name="phone"
                />{" "}
                08081281702
              </Link>
            </VStack>
          </Box>
          <Box>
            <VStack space={1}>
              <Text style={{ color: "#e9e9e9", fontSize: 13 }}>
                Account Manager's Phone Number 2
              </Text>
              <Link
                isUnderlined={false}
                href="tel:01-2716125"
                _text={{
                  color: "#ffffff",
                  fontSize: 14,
                  fontWeight: "extrabold",
                }}
              >
                {" "}
                <Icon
                  size={4}
                  color={"#ffffff"}
                  as={FontAwesome}
                  name="phone"
                />{" "}
                01-2716125
              </Link>
            </VStack>
          </Box>
        </VStack>
      </ScrollView>
      <Box mt={5} mb={5}>
        <Center>
          <Link isUnderlined={false} href="tel:08081281702">
            <Box
              justifyItems={"center"}
              w={"90%"}
              ml={5}
              mr={5}
              py={3}
              style={Shared.Button.primary}
              _text={{ color: "#ffffff", fontSize: 14, alignSelf: "center" }}
            >
              Call Account Manager
            </Box>
          </Link>
        </Center>
      </Box>
    </>
  );
};

export default AccountManagerScreen;
