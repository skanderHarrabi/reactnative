/* eslint-disable react-native/no-inline-styles */
import React, { Component } from 'react';
import {
  View,
  Image,
  Text,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal
} from 'react-native';
import { Button, Icon, Toast } from 'native-base';
import { Table, Row } from 'react-native-table-component';
import AsyncStorage from '@react-native-community/async-storage';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import RNBeep from 'react-native-a-beep';

import { SERVER_URL } from '../utils/helpers';
import { globalStyles } from '../assets/style/globalStyles';
import I18n from '../../i18n';

class Trashes extends Component {
  static navigationOptions = {
    headerBackground: () => (
      <Image
        source={require('../assets/img/bg-header.jpg')}
        style={{ height: '100%', width: '100%', resizeMode: 'cover' }}
      />
    ),
    headerTintColor: '#222',
    headerTitle: () => <Text style={globalStyles.headerTitle}>{I18n.t('CONTAINERS_LIST')}</Text>,
  };

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,

      tableHead: [
        I18n.t('_CAPACITY'),
        I18n.t('_TYPE'),
        I18n.t('_CODE'),
        I18n.t('_NUMBER'),
        '',
      ],
      widthArr: [100, 100, 100, 100, 50],

      arrayTrashes: [],
      nextPageUrl: '',
      prevPageUrl: '',
      thisPage: 0,
      lastPage: 0,
      total: 0,

      qrcode: '',
      modalVisible: false,
      isDisabled: true,
      isSearching: false,
    };
  }

  async componentDidMount() {
    this.setState({ isLoading: true });

    try {
      const userDetails = await AsyncStorage.getItem('userDetails');
      if (userDetails !== null) {
        let details = JSON.parse(userDetails);
        let link = `${SERVER_URL}api/trashes/user/${details.user.id}`;

        fetch(link)
          .then(res => {
            if (res.ok) {
              res.json().then(resJSON => {
                let arrayTrashes = [];

                resJSON.data.data.map(({ id, num, barcode, type, capacity }) => {
                  arrayTrashes.push([capacity, type, barcode, num, id]);
                });

                this.setState({
                  arrayTrashes,
                  thisPage: resJSON.data.current_page,
                  lastPage: resJSON.data.last_page,
                  nextPageUrl: resJSON.data.next_page_url,
                  prevPageUrl: resJSON.data.prev_page_url,
                  total: resJSON.data.total,
                });
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

  goTo = async url => {
    this.setState({ isLoading: true });
    let link = url;

    fetch(link)
      .then(res => {
        if (res.ok) {
          res.json().then(resJSON => {
            let arrayTrashes = [];

            resJSON.data.data.map(({ id, num, barcode, type, capacity }) => {
              arrayTrashes.push([capacity, type, barcode, num, id]);
            });

            this.setState({
              arrayTrashes,
              thisPage: resJSON.data.current_page,
              lastPage: resJSON.data.last_page,
              nextPageUrl: resJSON.data.next_page_url,
              prevPageUrl: resJSON.data.prev_page_url,
              total: resJSON.data.total,
            });
          });
        }
      })
      .catch(err => console.warn(err))
      .finally(() => this.setState({ isLoading: false }));
  };

  search = () => {
    const { qrcode } = this.state;
    let link = `${SERVER_URL}api/trash/barcode/${qrcode}`;

    this.setState({ isSearching: true })

    console.log('qrcode', qrcode)

    fetch(link)
      .then(res => {
        if (res.ok) {
          res
            .json()
            .then(resJSON => {
              console.log('resJSON', resJSON)
              if (resJSON.status) {
                this.setState({ modalVisible: false })
                this.props.navigation.navigate('Trash', { id: resJSON.trash.id })
              } else {
                Toast.show({
                  text: I18n.t('MSG.NO_CONTAINER_WITH_THIS_CODE'),
                  buttonText: I18n.t('MSG.OK'),
                  type: 'danger',
                  duration: 3000,
                });
              }
            })
            .catch(err => console.error(err))
        } else {
          Toast.show({
            text: I18n.t('MSG.NO_CONTAINER_WITH_THIS_CODE'),
            buttonText: I18n.t('MSG.OK'),
            type: 'danger',
            duration: 3000,
          });
        }
      })
      .catch(err => console.error(err))
      .finally(() => this.setState({ isSearching: false }))
  }

  onSuccess = e => {
    RNBeep.beep()
    this.setState({
      qrcode: e.data,
      isDisabled: false
    })
  };

  render() {
    const {
      isLoading,
      tableHead,
      arrayTrashes,
      nextPageUrl,
      prevPageUrl,
      modalVisible,
      isDisabled,
      isSearching,
    } = this.state;

    return (
      <ScrollView style={{ backgroundColor: '#222' }}>
        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
          <Button
            onPress={() => this.setState({ modalVisible: true })}
            style={{
              marginTop: 40,
              marginBottom: 40,
              marginLeft: 5,
              marginRight: 5,
              paddingTop: 10,
              paddingBottom: 10,
              paddingLeft: 50,
              paddingRight: 30,
              backgroundColor: '#89da33'
            }}>
            <Text style={styles.inputText}>{I18n.t('SEARCH_CONTAINER')}</Text>
            <Icon type='FontAwesome5' name="search" style={styles.inputText} />
          </Button>
        </View>

        <ScrollView horizontal>
          <View>
            <Table borderStyle={{ borderWidth: 1, borderColor: '#C1C0B9' }}>
              <Row
                data={tableHead}
                widthArr={this.state.widthArr}
                style={styles.header}
                textStyle={[styles.text, { color: '#fff' }]}
              />
            </Table>
            <ScrollView style={styles.dataWrapper}>
              <Table borderStyle={{ borderWidth: 1, borderColor: '#C1C0B9' }}>
                {isLoading ? (
                  <ActivityIndicator
                    size="large"
                    color="#fff"
                    style={{ marginTop: 10 }}
                  />
                ) : (
                    arrayTrashes.map((trash, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() =>
                          this.props.navigation.push('Trash', { id: trash[4] })
                        }>
                        <Row
                          data={trash}
                          widthArr={this.state.widthArr}
                          style={[
                            styles.row,
                            index % 2 && { backgroundColor: '#F7F6E7' },
                          ]}
                          textStyle={styles.text}
                        />
                      </TouchableOpacity>
                    ))
                  )}
              </Table>
            </ScrollView>
          </View>
        </ScrollView>

        {!isLoading ? (
          <View
            style={[
              styles.inline,
              {
                justifyContent: !prevPageUrl ? 'flex-end' : 'space-between',
                alignItems: 'center',
              },
            ]}>
            {prevPageUrl ? (
              <Button
                disabled={isLoading}
                style={styles.btn}
                onPress={() => {
                  this.goTo(prevPageUrl);
                }}>
                <Text style={styles.inputText}>{I18n.t('PREVIOUS')}</Text>
              </Button>
            ) : null}

            {/* <Text style={styles.title}>0</Text> */}

            {nextPageUrl ? (
              <Button
                disabled={isLoading}
                style={styles.btn}
                onPress={() => {
                  this.goTo(nextPageUrl);
                }}>
                <Text style={styles.inputText}>{I18n.t('NEXT')}</Text>
              </Button>
            ) : null}
          </View>
        ) : null}


        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
        >
          <View style={{ backgroundColor: 'red' }}>
            <QRCodeScanner
              showMarker
              onRead={this.onSuccess}
              flashMode={RNCamera.Constants.FlashMode.auto}
            />
            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', backgroundColor: '#222' }}>
              <Button
                style={[styles.btn, { backgroundColor: 'red' }]}
                onPress={() => this.setState({ modalVisible: false })} >
                <Text style={[styles.inputText, { color: '#fff' }]}> {I18n.t('CLOSE')} </Text>
              </Button>

              <Button
                disabled={isDisabled}
                style={[styles.btn, { backgroundColor: isDisabled ? '#d3d6d0' : '#89da33' }]}
                onPress={() => this.search()}>

                {
                  isSearching ?
                    <ActivityIndicator
                      size="large"
                      color="#fff"
                      style={{ marginTop: 10 }}
                    />
                    :
                    <Text style={[styles.inputText, { color: '#000' }]}> {isDisabled ? I18n.t('SEARCH') : I18n.t('CONFIRM')} </Text>
                }
              </Button>
            </View>
          </View>

        </Modal>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    height: 50,
    backgroundColor: '#537791',
  },
  text: {
    fontFamily: 'STC-Regular',
    textAlign: 'center',
  },
  dataWrapper: {
    marginTop: -1,
  },
  row: {
    height: 40,
    backgroundColor: '#E7E6E1',
  },
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
  },
  inputText: {
    color: '#000',
    fontFamily: 'STC-Regular',
    fontSize: 16,
    textAlign: 'right',
  },
  btn: {
    margin: 8,
    width: 100,
    height: 40,
    backgroundColor: '#89da33',
    justifyContent: 'center',
  },
});

export default Trashes;
