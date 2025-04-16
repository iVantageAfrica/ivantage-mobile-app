import { Box, HStack, Text } from "native-base"
import { StyleSheet, TouchableOpacity } from "react-native";
import Theme from '../themes';

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderColor: Theme.Colors.backgroundColor,
        marginBottom: 7,
        borderRadius: 10
    },
    billItem: {
        padding: 5,
        height: 70,
        flex: 1,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: Theme.Colors.backgroundColorAlt,
        borderColor: Theme.Colors.backgroundColor,
    }
});
const BillCard = (props) => {

    const gillerGroups = [
         {
          "id": 2,
          "name": "Disco",
          "slug": "ELECTRIC_DISCO",
        },
         {
          "id": 3,
          "name": "PAY TV",
          "slug": "PAY_TV",
        },
         {
          "id": 6,
          "name": "Airtime & Data",
          "slug": "AIRTIME_AND_DATA",
        },
        //  {
        //   "id": 5,
        //   "name": "Transport and Toll Payment",
        //   "slug": "TRANSPORT_AND_TOLL_PAYMENT",
        // },
        //  {
        //   "id": 6,
        //   "name": "Collections",
        //   "slug": "COLLECTIONS",
        // },
        //  {
        //   "id": 7,
        //   "name": "Betting and Lottery",
        //   "slug": "BETTING_AND_LOTTERY",
        // },
        //  {
        //   "id": 10,
        //   "name": "Food",
        //   "slug": "FOOD",
        // },
      ]

    const goTo = (slug, item) => {
        props.navigation.navigate(slug, item)
    }

    return (<Box m={3} style={styles.container}>
        <Box p={3}>
            <Text style={{ color: 'gray', fontSize: 18 }}>Services</Text>
        </Box>
        <HStack space={3} >
            {gillerGroups && gillerGroups.map(bg => <TouchableOpacity
            key={bg.name}
            onPress={() => goTo('bills.billers', bg)}
            style={styles.billItem} >
            <Box >
                <Text color={'#ffffff'}>{bg.name}</Text>
            </Box>
            </TouchableOpacity>)}
            <TouchableOpacity
            onPress={() => goTo('bills.home', {})}
            style={styles.billItem} >
            <Box >
                <Text color={'#ffffff'}>View All</Text>
            </Box>
            </TouchableOpacity>
        </HStack>
    </Box>)
}

export default BillCard