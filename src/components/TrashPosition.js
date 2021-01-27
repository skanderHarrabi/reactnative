/* eslint-disable react-native/no-inline-styles */
import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Icon, Button, Item, Label, Input, Toast } from 'native-base';
import { withNavigation } from 'react-navigation';
import RNLocation from 'react-native-location';

import { SERVER_URL } from '../utils/helpers';
import RadioBtn from './RadioBtn';
import I18n from '../../i18n';

class TrashPosition extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      isLoadingLocation: false,

      options: [true, false, false],
      lat: '',
      lng: '',
      locationErr: false,
      address: '',
      addressErr: false,
    };
  }

  componentDidMount() {
    this.configLocation();
  }

  configLocation = () => {
    RNLocation.configure({
      distanceFilter: 5.0
    });

    RNLocation.requestPermission({
      ios: "whenInUse",
      android: {
        detail: "fine",
        rationale: {
          title: I18n.t('MSG.LOCATION_PERMISSION'),
          message: I18n.t('MSG.LOCATION_PERMISSION_MSG'),
          buttonPositive: I18n.t('MSG.OK'),
          buttonNegative: I18n.t('MSG.CANCEL')
        }
      }
    })
      .then(granted => {
        if (granted) {
          this._getLocation()
        } else {
          Toast.show({
            text: I18n.t('MSG.LOCATION_PERMISSION_NOT_GRANTED'),
            buttonText: I18n.t('MSG.OK'),
            type: 'danger',
            duration: 5000,
          });
        }
      })
      .catch(err => console.log('err', err))
  };

  _getLocation = () => {
    this.setState({ isLoadingLocation: true })

    RNLocation
      .getLatestLocation({ timeout: 6000 })
      .then(location => {
        if (location) {
          this.setState({
            lat: location.latitude,
            lng: location.longitude,
          });
        }
      })
      .finally(() => this.setState({ isLoadingLocation: false }))
  }

  updateTrash = () => {
    const isValid = this._formValidation();
    const { options, lat, lng, address } = this.state;

    if (isValid) {
      this.setState({ isLoading: true });

      let link = `${SERVER_URL}api/trash/update`;
      let position = '';
      options[0] ? (position = 'لم تحرك') : null;
      options[1] ? (position = 'تم تحريكها') : null;
      options[2] ? (position = 'تم سحبها') : null;

      let data = {
        id: this.props.trash_id,
        position,
        lat,
        lng,
        address,
      };

      fetch(link, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          Accept: '*/*',
          Host: 'www.lebasproject.com',
          Connection: 'keep-alive',
        },
      })
        .then(res => {
          if (res.ok) {
            Toast.show({
              text: I18n.t('MSG.CONTAINER_UPDATED'),
              buttonText: I18n.t('MSG.OK'),
              type: 'success',
              duration: 5000,
            });
            this.props.navigation.push('Trashes');
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
          console.warn(err);
          Toast.show({
            text: I18n.t('MSG.SERVER_ERR'),
            buttonText: I18n.t('MSG.OK'),
            type: 'danger',
            duration: 5000,
          });
        })
        .finally(() => this.setState({ isLoading: false }));
    }
  };

  render() {
    const {
      isLoading,
      isLoadingLocation,
      options,
      lat,
      lng,
      locationErr,
      address,
      addressErr,
    } = this.state;
    return (
      <View style={{ marginTop: 10 }}>
        <Text style={styles.title}>{I18n.t('_LOCATION')}</Text>
        <View style={styles.inline}>
          <RadioBtn
            label={I18n.t('DID_NOT_MOVE')}
            selected={options[0]}
            onPress={() => this.setState({ options: [true, false, false] })}
          />
          <RadioBtn
            label={I18n.t('DID_MOVE')}
            selected={options[1]}
            onPress={() => this.setState({ options: [false, true, false] })}
          />
          <RadioBtn
            label={I18n.t('DID_REMOVED')}
            selected={options[2]}
            onPress={() => this.setState({ options: [false, false, true] })}
          />
        </View>

        <View style={[styles.inline, { justifyContent: 'flex-start' }]}>
          <Text style={styles.title}> {I18n.t('LOCATION')} </Text>

          <Button onPress={this._getLocation} style={styles.btn} disabled={isLoadingLocation}>
            {isLoadingLocation ? (
              <ActivityIndicator size="small" color="#89da33" />
            ) : (
                <Text style={styles.btnText}>{I18n.t('REFRESH')}</Text>
              )}
          </Button>

          {locationErr ? (
            <Icon type="FontAwesome5" name="close-circle" style={{ color: 'red' }} />
          ) : null}
        </View>

        <View style={styles.inline}>
          <View style={{ flex: 1 }}>
            <Item floatingLabel style={styles.item}>
              <Label style={styles.inputText}>{I18n.t('LAT')}</Label>
              <Input
                disabled
                style={[styles.inputText, styles.green]}
                value={lat.toString()}
                onChangeText={lat => this.setState({ lat })}
              />
            </Item>
          </View>
          <View style={{ flex: 1 }}>
            <Item floatingLabel style={styles.item}>
              <Label style={styles.inputText}>{I18n.t('LNG')}</Label>
              <Input
                disabled
                style={[styles.inputText, styles.green]}
                value={lng.toString()}
                onChangeText={lng => this.setState({ lng })}
              />
            </Item>
          </View>
        </View>
        <View style={[styles.inline, { marginTop: 10 }]}>
          <Item
            floatingLabel
            error={addressErr ? true : false}
            style={styles.item}>
            <Label style={styles.inputText}>{I18n.t('ADDRESS')}</Label>
            {addressErr ? <Icon type="FontAwesome5" name="exclamation-circle" /> : null}
            <Input
              style={[styles.inputText, styles.green]}
              value={address}
              onChangeText={address => this.setState({ address })}
              onFocus={() => this.setState({ addressErr: false })}
            />
          </Item>
        </View>
        <View style={[styles.inline, { marginTop: 10 }]}>
          <Button
            disabled={isLoading}
            style={styles.btn}
            onPress={() => this.updateTrash()}>
            {isLoading ? (
              <ActivityIndicator
                size="large"
                color="#fff"
                style={{ marginTop: 10 }}
              />
            ) : (
                <Text style={styles.btnText}>{I18n.t('CONFIRM')}</Text>
              )}
          </Button>
          <Button
            style={styles.btn}
            onPress={() => {
              this.props.cancle();
            }}>
            <Text style={styles.btnText}>{I18n.t('CANCEL')}</Text>
          </Button>
        </View>
      </View>
    );
  }



  _formValidation = () => {
    const { lat, lng, address } = this.state;

    if (lat === null || lat === '') {
      this.setState({ locationErr: true });
      return false;
    }
    if (lng === null || lng === '') {
      this.setState({ locationErr: true });
      return false;
    }
    if (address === null || address === '') {
      this.setState({ addressErr: true });
      return false;
    }

    return true;
  };
}

const styles = StyleSheet.create({
  title: {
    fontFamily: 'STC-Regular',
    fontSize: 16,
    color: '#B7B6A1',
    lineHeight: 30,
  },
  inline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  inputText: {
    color: '#B7B6A1',
    fontFamily: 'STC-Regular',
    fontSize: 16,
  },
  btnText: {
    color: '#000',
    fontFamily: 'STC-Regular',
    fontSize: 16,
  },
  btn: {
    margin: 8,
    height: 40,
    paddingLeft: 15,
    paddingRight: 15,
    backgroundColor: '#89da33',
    borderColor: '#000',
    borderWidth: 2,
    borderTopStartRadius: 15,
    borderBottomEndRadius: 15,
    justifyContent: 'center',
  },
  green: {
    color: '#89da33',
  },
  item: {
    flexDirection: 'row',
  },
});

export default withNavigation(TrashPosition);
