/* eslint-disable react-native/no-inline-styles */
import React, { Component, Fragment } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  ImageBackground,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Text, Icon } from 'native-base';
import AsyncStorage from '@react-native-community/async-storage';

import { StackActions, NavigationActions } from 'react-navigation';

import { Hr } from './../components/Hr';
import { SERVER_URL } from './../utils/helpers';
import I18n from '../../i18n';

class Main extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userId: '',
      fullName: '',
      num: '',
      zone: '',
      delivery: 0,
      trashes: 0,

      refreshing: false,
    };
  }

  async componentDidMount() {
    this.getData();
  }

  getData = async () => {
    this.setState({ isLoadingDetails: true });
    try {
      const userDetails = await AsyncStorage.getItem('userDetails');
      if (userDetails !== null) {
        let details = JSON.parse(userDetails);
        console.log('details', details)

        this.setState(
          {
            userId: details.user.id,
            fullName: details.user.display_name,
            num: details.user.unique_id,
            zone: details.zone?.name,
            isLoadingDetails: false,
          },
          () => {
            this.getNumbers('delivery', this.state.userId);
            this.getNumbers('trashes', this.state.userId);
          },
        );
      }
    } catch (e) {
      console.warn(e);
    }
  };

  getNumbers(type, userId) {
    let link = `${SERVER_URL}api/${type}/total/user/${userId}`;

    fetch(link)
      .then(res => {
        if (res.ok) {
          res.json().then(resJSON => {
            this.setState({
              [type]: resJSON.data,
            });
          });
        }
      })
      .catch(err => console.warn(err))
      .finally(() => this.setState({ refreshing: false }));
  }

  onRefresh = () => {
    this.setState({ refreshing: true });
    this.getData();
  };

  signout = async () => {
    await AsyncStorage.removeItem('userDetails');
    const resetAction = StackActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate({ routeName: 'Login' }),
      ],
    });
    this.props.navigation.dispatch(resetAction);
  };

  render() {
    const { fullName, num, zone, delivery, trashes, refreshing } = this.state;
    const { navigation } = this.props;

    return (
      <Fragment>
        <ImageBackground
          source={require('../assets/img/bg-header.jpg')}
          style={{
            height: 90,
            width: '100%',
            alignItems: 'center',
            justifyContent: 'flex-start',
            flexDirection: 'row',
          }}>
          <Image
            source={require('../assets/img/bar-logo.png')}
            style={{
              height: 40,
              width: 133,
              resizeMode: 'contain',
              marginTop: -10,
              marginRight: 10,
              marginLeft: 10,
            }} />

          <TouchableOpacity onPress={() => this.signout()}>
            <Icon
              type="FontAwesome5"
              name="sign-out-alt"
              style={{
                fontSize: 25,
                color: '#4A4440',
                marginRight: 10,
                marginLeft: 10,
              }}
            />
          </TouchableOpacity>
        </ImageBackground>
        <ScrollView
          style={{ backgroundColor: '#222', padding: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => this.onRefresh()}
            />
          }>
          <View
            style={[
              styles.inline,
              { marginTop: 20, justifyContent: 'space-around' },
            ]}>
            <View>
              <View style={styles.inline}>
                <Text style={styles.title}>{I18n.t('WELCOME')} </Text>
                <Text style={[styles.title, { color: '#32db64' }]}>{fullName}</Text>
              </View>
              <View style={styles.inline}>
                <Text style={styles.title}>{I18n.t("JOB_NB")} </Text>
                <Text style={[styles.title, { color: '#32db64' }]}>{num}</Text>
              </View>
              <View style={styles.inline}>
                <Text style={styles.title}>{I18n.t("WORKING_IN")} </Text>
                <Text style={[styles.title, { color: '#32db64' }]}>{zone}</Text>
              </View>
            </View>

            <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => navigation.navigate('Pointing')}>
              <View style={styles.circle}>
                <Icon type="FontAwesome5" name="qrcode" style={{ color: '#32db64' }} />
              </View>
              <Text style={styles.title}>{I18n.t("SCAN")}</Text>
            </TouchableOpacity>
          </View>

          <Hr />

          <TouchableOpacity
            style={[
              styles.inline,
              { marginTop: 30, justifyContent: 'space-around' },
            ]}
            onPress={() => navigation.navigate('Talabat')}>
            <View style={{ alignItems: 'center' }}>
              <Image
                source={require('../assets/img/talabat.png')}
                style={{ width: 80, height: 80, marginBottom: 10 }}
              />
              <Text style={styles.title}>{I18n.t("DIRECT_REQUESTS")}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <View style={styles.circle}>
                <Text style={styles.num}>{delivery}</Text>
              </View>
              <Text style={styles.title}>{I18n.t("NB_REQUESTS")}</Text>
            </View>
          </TouchableOpacity>

          <Hr />

          <TouchableOpacity
            style={[
              styles.inline,
              { marginTop: 30, justifyContent: 'space-around' },
            ]}
            onPress={() => navigation.navigate('Trashes')}>
            <View style={{ alignItems: 'center' }}>
              <Image
                source={require('../assets/img/container.png')}
                style={{ width: 80, height: 80, marginBottom: 10 }}
              />
              <Text style={styles.title}>{I18n.t("DIRECT_CONTAINERS")}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <View style={styles.circle}>
                <Text style={styles.num}>{trashes}</Text>
              </View>
              <Text style={styles.title}>{I18n.t("NB_CONTAINERS")}</Text>
            </View>
          </TouchableOpacity>

          <Hr />
          <View style={{ marginBottom: 40 }} />
        </ScrollView>
      </Fragment>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    fontFamily: 'STC-Regular',
    fontSize: 18,
    color: '#B7B6A1',
    lineHeight: 30,
  },
  num: {
    fontFamily: 'STC-Regular',
    fontSize: 26,
    color: '#B7B6A1',
  },
  inline: {
    flex: 1,
    flexDirection: 'row',
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 80,
    borderColor: '#b8b6a2',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
});

export default Main;
