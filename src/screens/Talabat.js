/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  View,
  Image,
  Text,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {Table, Row} from 'react-native-table-component';
import AsyncStorage from '@react-native-community/async-storage';

import {SERVER_URL} from '../utils/helpers';
import {globalStyles} from '../assets/style/globalStyles';
import I18n from '../../i18n';

class Talabat extends Component {
  static navigationOptions = {
    headerBackground: () => (
      <Image
        source={require('../assets/img/bg-header.jpg')}
        style={{height: '100%', width: '100%', resizeMode: 'cover'}}
      />
    ),
    headerTintColor: '#222',
    headerTitle: () => <Text style={globalStyles.headerTitle}>{I18n.t("REQUESTS_LIST")}</Text>,
  };

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      tableHead: [I18n.t("NAME"), I18n.t("TEL"), I18n.t("ADDRESS"), I18n.t("DELIVERY_DATE"), ''],
      widthArr: [100, 150, 100, 100, 50],

      arrayTalabat: [],
    };
  }

  async componentDidMount() {
    this.setState({isLoading: true});

    try {
      const userDetails = await AsyncStorage.getItem('userDetails');
      if (userDetails !== null) {
        let details = JSON.parse(userDetails);
        let link = `${SERVER_URL}api/delivery/user/${details.user.id}`;

        fetch(link)
          .then(res => {
            if (res.ok) {
              res.json().then(resJSON => {
                let arrayTalabat = [];

                resJSON.data.map(({id, owner, phone, address, date}) => {
                  arrayTalabat.push([date, address, phone, owner, id]);
                });

                this.setState({arrayTalabat});
              });
            }
          })
          .catch(err => console.warn(err))
          .finally(() => this.setState({isLoading: false}));
      }
    } catch (e) {
      this.setState({isLoading: false});
      console.warn(e);
    }
  }

  render() {
    const {isLoading, tableHead, arrayTalabat} = this.state;

    return (
      <ScrollView horizontal style={{backgroundColor: '#222'}}>
        <View>
          <Table borderStyle={{borderWidth: 1, borderColor: '#C1C0B9'}}>
            <Row
              data={tableHead}
              widthArr={this.state.widthArr}
              style={styles.header}
              textStyle={[styles.text, {color: '#fff'}]}
            />
          </Table>
          <ScrollView style={styles.dataWrapper}>
            <Table borderStyle={{borderWidth: 1, borderColor: '#C1C0B9'}}>
              {isLoading ? (
                <ActivityIndicator
                  size="large"
                  color="#fff"
                  style={{marginTop: 10}}
                />
              ) : (
                arrayTalabat.map((talab, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() =>
                      this.props.navigation.navigate('Talab', {id: talab[4]})
                    }>
                    <Row
                      data={talab}
                      widthArr={this.state.widthArr}
                      style={[
                        styles.row,
                        index % 2 && {backgroundColor: '#F7F6E7'},
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
    );
  }
}

const styles = StyleSheet.create({
  header: {height: 50, backgroundColor: '#537791'},
  text: {fontFamily: 'STC-Regular', textAlign: 'center'},
  dataWrapper: {marginTop: -1},
  row: {height: 40, backgroundColor: '#E7E6E1'},
});

export default Talabat;
