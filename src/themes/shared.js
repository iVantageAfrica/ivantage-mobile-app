import Theme from "../themes";
import { Dimensions } from "react-native";

const Button = {
  default: {
    borderRadius: 20,
    backgroundColor: "#14BAB0",
    color: Theme.Colors.primaryText,
    fontSize: 12,
    borderColor: Theme.Colors.primaryText,
    borderWidth: 1,
  },
  primary: {
    backgroundColor: Theme.CustomTheme["color-active-button"],
    borderRadius: 20,
    fontSize: 12,
    color: Theme.Colors.primaryText,
  },
  primary_outline: {
    borderColor: Theme.CustomTheme["color-active-button"],
    borderRadius: 20,
    fontSize: 12,
    borderWidth: 1,
    color: "#14BAB0",
  },
  primary_outline_no_radius: {
    borderColor: Theme.CustomTheme["color-active-button"],
    fontSize: 12,
    borderWidth: 1,
    color: "#14BAB0",
  },
  primary_outline_white: {
    borderColor: Theme.Colors.primaryText,
    borderRadius: 20,
    fontSize: 12,
    borderWidth: 1,
    color: Theme.Colors.primaryText,
  },
};

const TextInput = {
  default: {
    borderRadius: 20,
    backgroundColor: "#ffffff",
    color: "#000000",
    fontSize: 14,
    borderColor: "#0D0D0D",
    borderWidth: 0.5,
  },
  roundedInput: {
    borderRadius: 20,
    backgroundColor: "#ffffff",
    color: "#000000",
    padding: 10,
    fontSize: 14,
    borderColor: "#14BAB0",
    borderWidth: 1,
  },
};

const NativeTextInput = {
  default: {
    borderRadius: 20,
    backgroundColor: "#ffffff",
    color: "#000000",
    fontSize: 14,
    borderColor: "#14BAB0",
    borderWidth: 1,
    width: 50,
    height: 50,
  },
  roundedInput: {
    borderRadius: 20,
    width: 50,
    height: 50,
    backgroundColor: "#ffffff",
    color: "#000000",
    padding: 10,
    fontSize: 14,
    borderColor: "#14BAB0",
    borderWidth: 1,
  },
};

const Select = {
  default: {
    borderRadius: 20,
    backgroundColor: "#ffffff",
    color: "#000000",
    fontSize: 14,
    borderColor: "#14BAB0",
    borderWidth: 1,
  },
  
  default2: {
    borderRadius: 20,
    backgroundColor: "#ffffff",
    color: "#000000",
    fontSize: 14,
    borderColor: "#000000",
    borderWidth: 1,
  },
};

const DeviceDimensions = {
  WIDTH: Dimensions.get("window").width,
  HEIGHT: Dimensions.get("window").height,
};

export default {
  Button,
  TextInput,
  Select,
  DeviceDimensions,
  NativeTextInput,
};
