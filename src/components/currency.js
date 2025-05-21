import React from "react";
import { Text } from "native-base";

const Currency = (props) => {
  const defaultOptions = {
    significantDigits: 2,
    thousandsSeparator: ",",
    decimalSeparator: ".",
    symbol: props.symbol ? props.symbol : "NGN",
  };
  const amountValue = props.value ? props.value : 0.0;
  const formatCurrency = () => {
    let localAmount = amountValue;
    if (typeof localAmount !== "number") {
      localAmount = 0.0;
    }
    localAmount = localAmount.toFixed(defaultOptions.significantDigits);
    const [currency, decimal] = localAmount.split(".");
    return `${defaultOptions.symbol} ${currency.replace(
      /\B(?=(\d{3})+(?!\d))/g,
      defaultOptions.thousandsSeparator
    )}${defaultOptions.decimalSeparator}${decimal}`;
  };
  return <Text {...props}>{props.HLabel ?? ''}{formatCurrency()}</Text>;
};

export default Currency;
