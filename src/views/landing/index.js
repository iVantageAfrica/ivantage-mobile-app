import React from "react";
import styles from "./styles";
import Theme from "../../themes";
import Shared from "../../themes/shared";
import Loader from "../../components/loader";
import { Box, VStack, HStack, Button, Heading, Image, Text } from "native-base";
import AppIntroSlider from "react-native-app-intro-slider";

const RenderItem = ({ item }) => {
  try {
    return (
      <Box safeArea flex={1} justifyContent="center" alignItems="center" px={4}>
        <Image
          width="85%"
          height="300"
          resizeMode="contain"
          alt={item.title}
          source={item.image}
        />
        <Text mt={6} fontSize={22} fontWeight="bold" color={Theme.Colors?.colorTextBold || "#000000"} textAlign="center">
          {item.title}
        </Text>
        <Text mt={2} fontSize={16} color={Theme.Colors?.colorTextBold || "#000000"} textAlign="center">
          {item.description}
        </Text>
      </Box>
    );
  } catch (error) {
    return (
      <Box safeArea flex={1} justifyContent="center" alignItems="center" px={4}>
        <Text>Loading...</Text>
      </Box>
    );
  }
};

const Landing = ({ navigation }) => {
  const slides = [
    {
      key: "s1",
      title: "Your Gateway to Seamless Financial Services",
      description: "Experience effortless access to all your financial needs, from saving to investing, in one place.",
      image: Theme.Images.landing1,
    },
    {
      key: "s2",
      title: "Achieve Your Financial Goals with Ease",
      description: "Experience a seamless blend of savings, investments, and housing options, ",
      image: Theme.Images.landing2,
    },
    {
      key: "s3",
      title: "Save towards your equity with iVantage",
      description: "With 5,000 properties, iVantage lets you buy from trusted developers and grow your savings.",
      image: Theme.Images.landing3,
    },
  ];
  return (
    <VStack safeArea space={3} style={styles.container}>
      <AppIntroSlider
        style={{ flex: 1 }}
        data={slides}
        renderItem={RenderItem}
        showSkipButton={false}
        showNextButton={false}
        showDoneButton={false}
        dotStyle={{
          backgroundColor: "#E0E0E0",
          width: 10,
          height: 10,
          borderRadius: 5,
          marginHorizontal: 4,
        }}
        activeDotStyle={{
          backgroundColor: Theme.CustomTheme["color-active-dot"],
          width: 50,
          height: 10,
          borderRadius: 5,
          marginHorizontal: 4,
        }}
      />
      <Box>
        <HStack
          marginBottom={10}
          alignItems={"center"}
          justifyContent={"center"}
          space={4}
        >
          <Box>
            <Button
              variant={"solid"}
              w={150}
              size={"md"}
              style={Shared.Button.primary}
              onPress={() => navigation.navigate("LoginScreen")}
            >
              Log In
            </Button>
          </Box>
          <Box>
            <Button
              variant={"solid"}
              w={150}
              size={"md"}
              style={Shared.Button.default}
              onPress={() => navigation.navigate("SignUpScreen")}
            >
              Sign Up
            </Button>
          </Box>
        </HStack>
      </Box>
    </VStack>
  );
};

export default Landing;
