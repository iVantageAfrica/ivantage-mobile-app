import React from "react";
import { HStack, Spinner, Heading } from "native-base";


const InLineLoader = (props) => {
    if(!props.isLoading) {return null }
    return <HStack space={2} justifyContent="center">
      <Spinner color="warning.100" accessibilityLabel={props.text ?? 'Loading...'} />
      {props.text && <Heading color="warning.100" fontSize="md">
        {props.text}
      </Heading>}
    </HStack>;
}

export default InLineLoader;