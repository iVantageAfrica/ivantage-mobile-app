import React from "react";
import styles from "./styles";
import Theme from "../../themes";
import Shared from "../../themes/shared";
import { Box, VStack, HStack, Button, Heading, Image, Text } from "native-base";

const Landing = ({ navigation }) => {
  return (
    <VStack safeArea space={3} style={styles.container}>
      <Box safeArea justifyContent="center" alignItems="center">
        <Image
          width="80%"
          height="80%"
          resizeMode="contain"
          alt={"Ivantage logo"}
          source={Theme.Images.applogo}
        />
      </Box>

      <Box>
        <HStack
          marginTop={10}
          alignItems={"center"}
          justifyContent={"center"}
          space={5}
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
