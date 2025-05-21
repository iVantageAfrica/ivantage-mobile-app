import React from "react";
import { Text } from "native-base";

const DateLabel = (props) => {
  const defaultOptions = {
    // weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  let dateValue = props.value ? new Date(props.value) : new Date();
  const formatDate = () => {
    if(props.showLastDay) {
      dateValue = new Date(dateValue.getFullYear(), dateValue.getMonth() + 1, 0)
    }else if(props.showFirstDay) {
      dateValue = new Date(dateValue.getFullYear(), dateValue.getMonth(), 1)
    }
    return new Intl.DateTimeFormat("en-US", defaultOptions).format(dateValue)
  };
  return <Text {...props}>{props.HLabel ?? ''}{formatDate()}</Text>;
};

export default DateLabel;
