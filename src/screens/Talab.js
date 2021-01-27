/* eslint-disable react-native/no-inline-styles */
import React, { Component } from 'react';
import {
  View,
  Image,
  Text,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {
  Icon,
  Button,
  Item,
  Label,
  Input,
  Textarea,
  Toast,
  Picker
} from 'native-base';
import AsyncStorage from '@react-native-community/async-storage';
import MapView, { Marker } from 'react-native-maps';

import { SERVER_URL } from '../utils/helpers';
import { globalStyles } from '../assets/style/globalStyles';
import { Hr } from './../components/Hr';
import { DescText } from './../components/DescText';
import RadioBtn from '../components/RadioBtn';
import I18n from '../../i18n';

class Trash extends Component {
  static navigationOptions = {
    headerBackground: () => (
      <Image
        source={require('../assets/img/bg-header.jpg')}
        style={{ height: '100%', width: '100%', resizeMode: 'cover' }}
      />
    ),
    headerTintColor: '#222',
    headerTitle: () => <Text style={globalStyles.headerTitle}>{I18n.t("REQUESTS_LIST")}</Text>,
  };

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,

      deliveryDetails: null,
      isDelivered: true,

      capacity: '',
      capacityErr: false,
      totalWeight: '',
      totalWeightErr: false,

      reason: null,
      reasonErr: false,
      description: '',
      descriptionErr: false,
    };
  }

  async componentDidMount() {
    this.setState({ isLoading: true });

    try {
      const userDetails = await AsyncStorage.getItem('userDetails');
      const delivery_id = this.props.navigation.getParam('id', 0);

      if (userDetails !== null) {
        let details = JSON.parse(userDetails);
        let link = `${SERVER_URL}api/show-delivery/${delivery_id}/user/${details.user.id}`;

        fetch(link)
          .then(res => {
            if (res.ok) {
              res.json().then(resJSON => {
                this.setState({ deliveryDetails: resJSON.data });
              });
            }
          })
          .catch(err => console.warn(err))
          .finally(() => this.setState({ isLoading: false }));
      }
    } catch (e) {
      this.setState({ isLoading: false });
      console.warn(e);
    }
  }

  sendNotif = () => {
    const delivery_id = this.props.navigation.getParam('id', 0);
    let link = `${SERVER_URL}api/notify/delivery`;
    let data = {
      title: 'طلب توصيل',
      body: 'مندوب لباس في طريقه إليك',
      delivery_id,
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
            text: I18n.t('MSG.DONOR_NOTIFIED'),
            buttonText: I18n.t('MSG.OK'),
            type: 'success',
            duration: 3000,
          });
        } else {
          Toast.show({
            text: I18n.t('MSG.SERVER_ERR'),
            buttonText: I18n.t('MSG.OK'),
            type: 'danger',
            duration: 3000,
          });
        }
      })
      .catch(err => {
        console.warn(err);
        Toast.show({
          text: I18n.t('MSG.SERVER_ERR'),
          buttonText: I18n.t('MSG.OK'),
          type: 'danger',
          duration: 3000,
        });
      });
  };

  updateDelivery = () => {
    const {
      isDelivered,
      capacity,
      totalWeight,
      reason,
      description,
    } = this.state;

    const delivery_id = this.props.navigation.getParam('id', 0);
    let data = {};

    if (isDelivered) {
      data = {
        id: delivery_id,
        is_recived: isDelivered,
        qty: capacity,
        weight: totalWeight,
      };
    } else {
      data = {
        id: delivery_id,
        is_recived: isDelivered,
        cause: reason,
        info_cause: description,
      };
    }

    if (isDelivered && this._formValidation_IsDelivered()) {
      this._sendUpdate(data);
    }

    if (!isDelivered && this._formValidation_IsNotDelivered()) {
      this._sendUpdate(data);
    }
  };

  _sendUpdate(data) {
    let link = `${SERVER_URL}api/deliv/update`;

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
            text: I18n.t('MSG.DELIVERY_UPDATED'),
            buttonText: I18n.t('MSG.OK'),
            type: 'success',
            duration: 3000,
          });
          this.props.navigation.push('Talabat');
        } else {
          Toast.show({
            text: I18n.t('MSG.SERVER_ERR'),
            buttonText: I18n.t('MSG.OK'),
            type: 'danger',
            duration: 3000,
          });
        }
      })
      .catch(err => {
        console.warn(err);
        Toast.show({
          text: I18n.t('MSG.SERVER_ERR'),
          buttonText: I18n.t('MSG.OK'),
          type: 'danger',
          duration: 3000,
        });
      });
  }

  _formValidation_IsDelivered = () => {
    const { capacity, totalWeight } = this.state;

    if (capacity === null || capacity === '') {
      this.setState({ capacityErr: true });
      return false;
    }
    if (totalWeight === null || totalWeight === '') {
      this.setState({ totalWeightErr: true });
      return false;
    }

    return true;
  };

  _formValidation_IsNotDelivered = () => {
    const { reason, description } = this.state;

    if (reason === null || reason === '') {
      this.setState({ reasonErr: true });
      return false;
    }
    if (description === null || description === '') {
      this.setState({ descriptionErr: true });
      return false;
    }

    return true;
  };

  render() {
    const {
      isLoading,
      deliveryDetails,
      isDelivered,
      capacity,
      capacityErr,
      totalWeight,
      totalWeightErr,
      reason,
      reasonErr,
      description,
      descriptionErr,
    } = this.state;

    if (isLoading || !deliveryDetails) {
      return (
        <ScrollView style={{ backgroundColor: '#222', padding: 20 }}>
          <ActivityIndicator
            size="large"
            color="#fff"
            style={{ marginTop: 10 }}
          />
        </ScrollView>
      );
    }

    return (
      <ScrollView style={{ backgroundColor: '#222', padding: 20 }}>
        <View>
          <DescText title={I18n.t("NAME")} desc={deliveryDetails.owner} />
          <DescText title={I18n.t("TEL")} desc={deliveryDetails.phone} />
          <DescText title={I18n.t("REQUEST_TYPE")} desc={deliveryDetails.type} />
        </View>
        {deliveryDetails.pictures.length > 0 ? (
          <View>
            <Text style={styles.title}>{I18n.t("PICS")} </Text>
            <View
              style={{
                marginTop: 10,
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              {deliveryDetails.pictures.map((pic, i) => {
                return (
                  <Image
                    key={i}
                    source={{ uri: `${SERVER_URL}images/deliverys/${pic.name}` }}
                    style={{ height: 200, width: 100 }}
                  />
                );
              })}
            </View>
          </View>
        ) : null}

        <View style={{ marginTop: 10 }}>
          <Text style={styles.title}>{I18n.t("RECEIVING_DATE")} </Text>
          <Text style={[styles.title, { color: '#32db64' }]}>
            {deliveryDetails.date}
            {'  '}
            <Icon
              type="FontAwesome"
              name="calendar"
              style={{ color: '#B7B6A1', fontSize: 15 }}
            />
          </Text>
        </View>

        <View style={{ marginTop: 10 }}>
          <Text style={styles.title}>{I18n.t("DESCRIPTION")} </Text>
          <Text style={[styles.title, { color: '#32db64' }]}>
            {deliveryDetails.description}
          </Text>
        </View>

        <View style={{ marginTop: 10 }}>
          <Text style={styles.title}>{I18n.t("LOCATION")} </Text>
          <View style={{ height: 200 }}>
            <MapView
              style={{ flex: 1 }}
              initialRegion={{
                latitude: deliveryDetails.lat,
                longitude: deliveryDetails.lng,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}>
              <Marker
                coordinate={{
                  latitude: deliveryDetails.lat,
                  longitude: deliveryDetails.lng,
                }}
              />
            </MapView>
          </View>
        </View>
        <Hr />
        <View style={[styles.inline, { marginTop: 20 }]}>
          <Button
            disabled={isLoading}
            style={styles.btn}
            onPress={() => this.sendNotif()}>
            <Text style={[styles.inputText, { color: '#000' }]}>{I18n.t("ALERT_DONOR")} </Text>
          </Button>
        </View>

        <Hr />

        <View>
          <View style={[styles.inline, { marginTop: 20 }]}>
            <RadioBtn
              label={I18n.t("DONOR_REACHED")}
              selected={isDelivered}
              onPress={() => this.setState({ isDelivered: true })}
            />
            <RadioBtn
              label={I18n.t("DONOR_NOT_REACHED")}
              selected={!isDelivered}
              onPress={() => this.setState({ isDelivered: false })}
            />
          </View>
          {isDelivered ? (
            <View style={[styles.inline, { marginTop: 10 }]}>
              <View style={{ flex: 1 }}>
                <Item
                  floatingLabel
                  error={capacityErr ? true : false}
                  style={styles.item}>
                  <Label style={styles.inputText}>{I18n.t("QTY")}</Label>
                  {capacityErr ? <Icon type="FontAwesome5" name="exclamation-circle" /> : null}
                  <Input
                    keyboardType="numeric"
                    style={[styles.inputText, styles.green]}
                    value={capacity.toString()}
                    onChangeText={capacity => this.setState({ capacity })}
                    onFocus={() => this.setState({ capacityErr: false })}
                  />
                </Item>
              </View>
              <View style={{ flex: 1 }}>
                <Item
                  floatingLabel
                  error={totalWeightErr ? true : false}
                  style={styles.item}>
                  <Label style={styles.inputText}>{I18n.t("WEIGHT")}</Label>
                  {totalWeightErr ? <Icon type="FontAwesome5" name="exclamation-circle" /> : null}
                  <Input
                    keyboardType="numeric"
                    style={[styles.inputText, styles.green]}
                    value={totalWeight.toString()}
                    onChangeText={totalWeight => this.setState({ totalWeight })}
                    onFocus={() => this.setState({ totalWeightErr: false })}
                  />
                </Item>
              </View>
            </View>
          ) : (
              <View style={{ marginTop: 10 }}>
                <Item picker>
                  <Picker
                    mode="dropdown"
                    iosIcon={
                      <Icon type="FontAwesome5" name="arrow-down" style={{ color: '#B7B6A1' }} />
                    }
                    style={styles.inputText}
                    placeholder={I18n.t("REASON_DONOR_NOT_REACHED")}
                    placeholderStyle={{ color: '#B7B6A1' }}
                    placeholderIconColor="#B7B6A1"
                    selectedValue={reason}
                    onValueChange={reason => this.setState({ reason })}>
                    <Picker.Item label={I18n.t("NO_REPLY")} value="لا يرد" />
                    <Picker.Item label={I18n.t("POSTPONED")} value="تم تأجيله" />
                    <Picker.Item label={I18n.t("CANCELED_WITHOUT_REASON")} value="تم إلغاؤه بدون سبب" />
                    <Picker.Item label={I18n.t("CANNOT_REACH")} value="لا نستطيع الوصول إليه" />
                  </Picker>
                </Item>
                <Item error={descriptionErr}>
                  <Textarea
                    rowSpan={5}
                    placeholder={I18n.t("DESCRIPTION")}
                    style={[styles.inputText, { flex: 1, color: '#32db64' }]}
                    placeholderTextColor="#b8b6a2"
                    value={description}
                    onChangeText={description => this.setState({ description })}
                    onFocus={() => this.setState({ descriptionErr: false })}
                  />
                </Item>
              </View>
            )}
          <View style={[styles.inline, { marginTop: 10 }]}>
            <Button
              disabled={isLoading}
              style={styles.btn}
              onPress={() => this.updateDelivery()}>
              <Text style={[styles.inputText, { color: '#000' }]}>{I18n.t("CONFIRM")}</Text>
            </Button>
          </View>
        </View>
        <Hr />
        <View style={{ marginBottom: 20 }} />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    fontFamily: 'STC-Regular',
    fontSize: 16,
    color: '#B7B6A1',
    lineHeight: 30,
    textAlign: 'left',
  },
  inline: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  inputText: {
    color: '#B7B6A1',
    fontFamily: 'STC-Regular',
    fontSize: 16,
    textAlign: 'right',
  },
  btn: {
    margin: 8,
    width: 150,
    height: 40,
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

export default Trash;
