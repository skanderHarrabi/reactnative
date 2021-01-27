import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import * as RNLocalize from 'react-native-localize';

export const DescText = props => {
  return (
    <View style={styles.inline}>
      <Text style={styles.title}>{props.title} </Text>
      <Text style={[styles.title, {color: '#32db64'}]}>{props.desc}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontFamily: 'STC-Regular',
    fontSize: 16,
    color: '#B7B6A1',
    lineHeight: 30,
  },
  inline: {
    flex: 1,
    flexDirection:'row',
  },
});
