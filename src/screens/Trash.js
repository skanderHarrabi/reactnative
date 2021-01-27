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
import { Icon, Button, Radio, Item, Label, Input } from 'native-base';
import AsyncStorage from '@react-native-community/async-storage';

import { SERVER_URL } from '../utils/helpers';
import { globalStyles } from '../assets/style/globalStyles';
import { Hr } from './../components/Hr';
import { DescText } from './../components/DescText';
import TrashPosition from '../components/TrashPosition';
import TrashReview from '../components/TrashReview';
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
    headerTitle: () => <Text style={globalStyles.headerTitle}>{I18n.t('_DETAILS')}</Text>,
  };

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,

      TrashDetails: null,

      isVisible: true, //Toggle buttons
      isPositionChanged: false, //Toggle TrashPosition
      isReviewChanged: false, //Toggle TrashReview
    };
  }

  async componentDidMount() {


    try {
      const userDetails = await AsyncStorage.getItem('userDetails');
      const trash_id = this.props.navigation.getParam('id', 0);

      if (userDetails !== null) {
        let details = JSON.parse(userDetails);
        let link = `${SERVER_URL}api/show-trash/${trash_id}/user/${details.user.id}`;

        this.setState({ isLoading: true });

        fetch(link)
          .then(res => {
            if (res.ok) {
              res
                .json()
                .then(resJSON => {
                  console.log(resJSON.data);
                  this.setState({ TrashDetails: resJSON.data });
                })
            }
          })
          .catch(err => console.warn(err))
          .finally(() => this.setState({ isLoading: false }));
      }
    } catch (e) {
      console.warn(e);
    }
  }

  _toggleOptions = () => {
    this.setState({
      isVisible: true,
      isPositionChanged: false,
      isReviewChanged: false,
    });
  };

  render() {
    const {
      isLoading,
      isVisible,
      isPositionChanged,
      isReviewChanged,
      TrashDetails,
    } = this.state;

    if (isLoading) {
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

    if (!TrashDetails) {
      return (
        <ScrollView style={{ backgroundColor: '#222', padding: 20 }}>
          <Text style={{ ...styles.title, fontSize: 24 }}>{I18n.t('MSG.NO_CONTAINER')}</Text>
        </ScrollView >
      );
    }

    return (
      <ScrollView style={{ backgroundColor: '#222' }}>
        <View style={{ padding: 20 }}>
          <View>
            <DescText title={I18n.t('_NUMBER')} desc={TrashDetails.num} />
            <DescText title={I18n.t('_CODE')} desc={TrashDetails.barcode} />
            <View>
              <Text style={styles.title}>{I18n.t('DESCRIPTION')} </Text>
              <Text style={[styles.title, { color: '#32db64' }]}>
                {TrashDetails.description}
              </Text>
            </View>
            <DescText title={I18n.t('_TYPE')} desc={TrashDetails.type} />
            <DescText title={I18n.t('_CAPACITY')} desc={TrashDetails.capacity} />
            <DescText title={I18n.t('_LOCATION')} desc={TrashDetails.zone.name} />
          </View>

          <Hr />

          {isVisible && (
            <View style={{ marginTop: 10 }}>
              <Button
                disabled={isLoading}
                style={styles.btn}
                onPress={() => {
                  this.setState({
                    isVisible: false,
                    isPositionChanged: true,
                    isReviewChanged: false,
                  });
                }}>
                <Text style={styles.btnText}>{I18n.t('_PIN_LOCATION')}</Text>
              </Button>
              <Button
                disabled={isLoading}
                style={styles.btn}
                onPress={() => {
                  this.setState({
                    isVisible: false,
                    isPositionChanged: false,
                    isReviewChanged: true,
                  });
                }}>
                <Text style={styles.btnText}>{I18n.t('_REVIEW')}</Text>
              </Button>
            </View>
          )}

          {isPositionChanged && (
            <TrashPosition
              cancle={this._toggleOptions}
              trash_id={this.props.navigation.getParam('id', 0)}
            />
          )}
          {isReviewChanged && (
            <TrashReview
              cancle={this._toggleOptions}
              trash_id={this.props.navigation.getParam('id', 0)}
            />
          )}
        </View>
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
  },
  inline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
    width: '100%',
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
});

export default Trash;
