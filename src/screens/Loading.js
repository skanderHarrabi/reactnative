/* eslint-disable react-native/no-inline-styles */
import React, {Component, Fragment} from 'react';
import {SafeAreaView, Image, ActivityIndicator} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {StackActions, NavigationActions} from 'react-navigation';

class Loading extends Component {
  async componentDidMount() {
    try {
      const userDetails = await AsyncStorage.getItem('userDetails');
      if (userDetails !== null) {
        const resetAction = StackActions.reset({
          index: 0,
          actions: [NavigationActions.navigate({routeName: 'Main'})],
        });
        this.props.navigation.dispatch(resetAction);
      } else {
        const resetAction = StackActions.reset({
          index: 0,
          actions: [NavigationActions.navigate({routeName: 'Login'})],
        });
        this.props.navigation.dispatch(resetAction);
      }
    } catch (e) {
      console.warn(e);
    }
  }
  render() {
    return (
      <Fragment>
        <SafeAreaView
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#57574A',
          }}>
          <Image
            source={require('../assets/img/loadingScreen.png')}
            style={{width: 450, height: 450}}
          />
          <ActivityIndicator
            size="large"
            color="#fff"
            style={{marginTop: 10}}
          />
        </SafeAreaView>
      </Fragment>
    );
  }
}

export default Loading;
