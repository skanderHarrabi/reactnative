import React, { Component } from 'react';
import { Root } from 'native-base';

import OneSignal from 'react-native-onesignal';
import AsyncStorage from '@react-native-community/async-storage';

import { oneSignalAPIKey } from './src/utils/apiKeys';
import Screens from './src/screens/Screens';

class App extends Component {
  constructor(properties) {
    super(properties);
    OneSignal.init(oneSignalAPIKey);

    OneSignal.addEventListener('received', this.onReceived);
    OneSignal.addEventListener('opened', this.onOpened);
    OneSignal.addEventListener('ids', this.onIds);
  }

  componentWillUnmount() {
    OneSignal.removeEventListener('received', this.onReceived);
    OneSignal.removeEventListener('opened', this.onOpened);
    OneSignal.removeEventListener('ids', this.onIds);
  }

  onReceived(notification) {
    console.log('Notification received: ', notification);
  }

  onOpened(openResult) {
    console.log('Message: ', openResult.notification.payload.body);
    console.log('Data: ', openResult.notification.payload.additionalData);
    console.log('isActive: ', openResult.notification.isAppInFocus);
    console.log('openResult: ', openResult);
  }

  async onIds(device) {
    console.log('Device info: ', device);
    try {
      await AsyncStorage.setItem('player_id', device.userId);
    } catch (e) {
      console.warn(e);
    }
  }

  render() {
    return (
      <Root>
        <Screens />
      </Root>
    );
  }
}

export default App;
