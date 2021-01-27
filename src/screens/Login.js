/* eslint-disable react-native/no-inline-styles */
import React, { Component, Fragment } from 'react';
import {
  SafeAreaView,
  View,
  Image,
  ActivityIndicator,
  StyleSheet,
  PermissionsAndroid,
} from 'react-native';
import { Button, Text, Input, Item, Label, Toast, Icon } from 'native-base';
import AsyncStorage from '@react-native-community/async-storage';
import { StackActions, NavigationActions } from 'react-navigation';
import RNFS from 'react-native-fs';
import NetInfo from "@react-native-community/netinfo";

import { SERVER_URL } from './../utils/helpers';
import I18n from '../../i18n';

const path = RNFS.ExternalStorageDirectoryPath + '/lebas-cp-test.txt';

class Loading extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,

      email: '',
      emailErr: false,
      password: '',
      passwordErr: false,
    };
  }

  async componentDidMount() {

  }

  _formValidation = () => {
    const { email, password } = this.state;

    if (email === null || email === '') {
      this.setState({ emailErr: true });
      return false;
    }
    if (password === null || password === '') {
      this.setState({ passwordErr: true });
      return false;
    }

    return true;
  };

  login = async () => {
    const isValid = this._formValidation();

    if (isValid) {
      this.setState({ isLoading: true });

      try {
        const player_id = await AsyncStorage.getItem('player_id');

        if (player_id !== null) {
          const { email, password } = this.state;
          let link = `${SERVER_URL}api/login`;

          let data = {
            email,
            password,
            player_id,
          };

          RNFS.write(path, `- ${new Date()} - ${JSON.stringify(data)} \n`, -1, 'utf8');

          fetch(link, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Connection: 'keep-alive',
            },
          })
            .then(res => {
              if (res.ok) {
                res
                  .json()
                  .then(async resJSON => {
                    if (resJSON.status) {
                      let userDetails = {
                        role: resJSON.role,
                        user: resJSON.user,
                        zone: resJSON.zone,
                      };

                      try {
                        await AsyncStorage.setItem('userDetails', JSON.stringify(userDetails));
                        await AsyncStorage.setItem('uid', JSON.stringify(resJSON.user.id));

                        const resetAction = StackActions.reset({
                          index: 0,
                          actions: [
                            NavigationActions.navigate({ routeName: 'Main' }),
                          ],
                        });
                        this.props.navigation.dispatch(resetAction);
                      } catch (e) {
                        console.warn(e);
                      }
                    } else {
                      Toast.show({
                        text: resJSON.msg ? resJSON.msg : I18n.t('MSG.INFO_CONFIRMATION'),
                        buttonText: I18n.t('MSG.OK'),
                        type: 'danger',
                        duration: 5000,
                      });
                    }
                  });
              } else {
                Toast.show({
                  text: I18n.t('MSG.SERVER_ERR'),
                  buttonText: I18n.t('MSG.OK'),
                  type: 'danger',
                  duration: 5000,
                });
              }
            })
            .catch(err => {
              Toast.show({
                text: I18n.t('MSG.SERVER_ERR'),
                buttonText: I18n.t('MSG.OK'),
                type: 'danger',
                duration: 5000,
              });
            })
            .finally(() => this.setState({ isLoading: false }));
        } else {
          Toast.show({
            text: I18n.t('MSG.SERVER_ERR'),
            buttonText: I18n.t('MSG.OK'),
            type: 'danger',
            duration: 5000,
          });
        }
      } catch (e) {
        this.setState({ isLoading: false });
      }
    }
  };

  render() {
    const { isLoading, email, emailErr, password, passwordErr } = this.state;
    return (
      <Fragment>
        <SafeAreaView
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#d5d3c6',
          }}>
          <View>
            <Image
              source={require('../assets/img/logo.png')}
              style={{ width: 120, height: 120 }}
            />
          </View>

          <View style={{ marginTop: 30 }}>
            <Text style={styles.title}>{I18n.t('DELEGATES_ONLY')}</Text>
          </View>

          <View
            style={{
              marginTop: 10,
              paddingRight: 40,
              paddingLeft: 40,
              width: '100%',
            }}>
            <Item floatingLabel style={styles.item} error={emailErr}>
              <Label style={styles.inputText}>{I18n.t('EMAIL')}</Label>
              {emailErr ? <Icon type="FontAwesome5" name="exclamation-circle" /> : null}
              <Input
                style={styles.inputText}
                value={email}
                onChangeText={email => this.setState({ email })}
                onFocus={() => this.setState({ emailErr: false })}
              />
            </Item>

            <Item floatingLabel style={styles.item} error={passwordErr}>
              <Label style={styles.inputText}>{I18n.t('PASSWORD')}</Label>
              {passwordErr ? <Icon type="FontAwesome5" name="exclamation-circle" /> : null}
              <Input
                secureTextEntry={true}
                style={styles.inputText}
                value={password}
                onChangeText={password => this.setState({ password })}
                onFocus={() => this.setState({ passwordErr: false })}
              />
            </Item>
          </View>
          <View style={{ marginTop: 30 }}>
            <Button
              disabled={isLoading}
              style={styles.btn}
              onPress={() => {
                this.login();
              }}>
              {isLoading ? (
                <ActivityIndicator
                  size="large"
                  color="#fff"
                  style={{ marginTop: 10 }}
                />
              ) : (
                  <Text style={styles.inputText}>{I18n.t('LOGIN')}</Text>
                )}
            </Button>
          </View>
        </SafeAreaView>
      </Fragment>
    );
  }
}

const styles = StyleSheet.create({
  item: {
    marginTop: 10,
    flexDirection: 'row',
    borderColor: '#63625e',
  },
  title: {
    fontFamily: 'STC-Regular',
    fontSize: 22,
    color: '#da5c33',
  },
  inputText: {
    color: '#63625e',
    fontFamily: 'STC-Regular',
    fontSize: 16,
  },
  btn: {
    margin: 8,
    width: 150,
    height: 40,
    backgroundColor: '#89da33',
    borderColor: '#615f52',
    borderWidth: 2,
    borderTopStartRadius: 15,
    borderBottomEndRadius: 15,
    justifyContent: 'center',
  },
});

export default Loading;
