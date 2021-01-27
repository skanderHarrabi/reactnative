import {StyleSheet, Platform} from 'react-native';

export const globalStyles = StyleSheet.create({
  headerTitle: {
    fontFamily: 'STC-Regular',
    fontSize: 20,
    ...Platform.select({
      ios: {
        textAlign: 'center',
      },
      android: {
        flex: 1,
        justifyContent: 'flex-end',
        marginRight: 10,
      },
    }),
  },
});
