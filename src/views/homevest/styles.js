import { StyleSheet } from 'react-native';
import Theme from  '../../themes';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.Colors.backgroundColor
    },
    radio: {
      borderWidth: 1,
      marginVertical: 5,
      borderRadius: 15,
      backgroundColor: '#ffffff',
      borderColor: '#ffce8d'  
    },
    dark_radio: {
      borderWidth: 1,
      marginVertical: 5,
      borderRadius: 15,
      backgroundColor: Theme.Colors.backgroundColorAlt3,
      borderColor: '#ffce8d'  
    },
    checkItem: {
      borderWidth: 1,
      marginVertical: 5,
      borderRadius: 15,
      backgroundColor: '#ffffff',
      borderColor: '#ffce8d'  
    }
});
export default styles;