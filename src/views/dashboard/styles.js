import { StyleSheet } from 'react-native';
import Theme from  '../../themes';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.Colors.backpgroundColor,
        color: '#ffffff'
    },
    container2: {
        borderWidth: 1,
        borderColor: Theme.Colors.backgroundColorAlt,
        marginBottom: 5,
        marginTop: 7,
        marginHorizontal: 9,
        borderRadius: 10,
        padding: 10,
      },
});
export default styles;