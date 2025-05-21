import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { VStack, Box, Image, Text, HStack, Button } from "native-base";
import * as Clipboard from "expo-clipboard";

import Theme from "../themes";
import Shared from "../themes/shared";
import { useAuthentication } from "../queries/useAuthentication";
import AlertBox from "./alertbox";

const { fetchData: getAffiliateDetail } = useAuthentication(
  "affiliate_detail",
  "get"
);

const AffiliateCard = (props) => {
  const [affiliateInfo, setAffiliateInfo] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getDetail();
  }, []);

  const getDetail = async () => {
    const resp = await getAffiliateDetail({});
    if (resp && resp.data && resp.data.success) {
      setAffiliateInfo(resp.data.data);
    }
    setLoaded(true);
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(affiliateInfo.referralCode);
    AlertBox.showSuccess("Referral code copied successfully.", "Copied");
  };

  if (!loaded) {
    return <></>;
  }

  if (Object.keys(affiliateInfo).length !== 0) {
    return (
      <Box my={5} style={styles.container}>
        <HStack space={3}>
          <Box flex={2} p={1}>
            <VStack>
              <Box>
                <Text
                  fontSize={15}
                  color={Theme.CustomTheme["color-active-button"]}
                >
                  Referral Code
                </Text>
              </Box>
              <Box>
                <Text color={"#ffffff"}>Your referral code is shown below</Text>
              </Box>
              <Box>
                <TouchableOpacity onPress={() => copyToClipboard()}>
                  <HStack space={1}>
                    <Text color={"#ffffff"} fontWeight={"bold"} fontSize={"xl"}>
                      {affiliateInfo.referralCode}
                    </Text>
                    <Text marginTop={3} color={"#ffffff"} fontSize={9}>
                      Tap to copy
                    </Text>
                  </HStack>
                </TouchableOpacity>
              </Box>
            </VStack>
          </Box>
          <Box flex={1}>
            <Button
            size={'xs'}
              onPress={() => {
                props.navigation.navigate("affiliate.detail", {});
              }}
              _text={{ color: "amber.100", fontSize: "xs" }}
              style={{ ...Shared.Button.primary_outline, marginVertical: 15 }}
              variant={"ghost"}
            >
              Details
            </Button>
          </Box>
        </HStack>
      </Box>
    );
  }
  return (
    <Box my={5} style={styles.container}>
      <HStack space={3}>
        <Box flex={3} p={1}>
          <VStack>
            <Box>
              <Text
                fontSize={"xl"}
                color={Theme.CustomTheme["color-active-button"]}
              >
                Become An Affiliate
              </Text>
            </Box>
            <Box>
              <Text color={"#ffffff"}>
                Get some exciting bonuses by introducing our products to friends
                and family.
              </Text>
            </Box>
          </VStack>
        </Box>
        <Box flex={1}>
          <Button
            onPress={() => {
              props.navigation.navigate("affiliate.onboarding", {});
            }}
            _text={{ color: "amber.100", fontSize: "xs" }}
            style={{ ...Shared.Button.primary_outline, marginVertical: 15 }}
            variant={"ghost"}
          >
            Get Started
          </Button>
        </Box>
      </HStack>
    </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: Theme.Colors.backgroundColorAlt,
    marginBottom: 5,
    marginTop: 7,
    marginHorizontal: 9,
    borderRadius: 10,
    padding: 10,
  },
});

export default AffiliateCard;
