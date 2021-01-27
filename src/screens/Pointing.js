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
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { Button, Toast, Input, Item, Label } from 'native-base'
import AsyncStorage from '@react-native-community/async-storage';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import RNLocation from 'react-native-location';
import RNBeep from 'react-native-a-beep';

import { SERVER_URL } from '../utils/helpers';
import { globalStyles } from '../assets/style/globalStyles';
import I18n from '../../i18n';


class Talabat extends Component {
    static navigationOptions = {
        headerBackground: () => (
            <Image
                source={require('../assets/img/bg-header.jpg')}
                style={{ height: '100%', width: '100%', resizeMode: 'cover' }}
            />
        ),
        headerTintColor: '#222',
        headerTitle: () => <Text style={globalStyles.headerTitle}>{I18n.t("SCAN")}</Text>,
    };

    constructor(props) {
        super(props);

        this.state = {
            isLoading: false,
            isDisabled: true,
            isVisible: true,

            qrcode: '',
            lat: null,
            lng: null,
            weight: ''
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
    }

    onSuccess = e => {
        RNBeep.beep()
        this.setState({
            qrcode: e.data,
            isDisabled: false
        })
    };

    pointing = async () => {
        const { isLoading, isDisabled, qrcode, lat, lng, weight } = this.state;

        try {
            const uid = await AsyncStorage.getItem('uid');

            if (uid) {
                if (this._isValid()) {
                    const link = `${SERVER_URL}api/trash/pointings/store`;
                    const body = {
                        user_id: uid,
                        barcode: qrcode,
                        longitude: lat,
                        latitude: lng,
                        weight
                    }

                    this.setState({ isLoading: true })

                    fetch(link, {
                        method: 'POST',
                        body: JSON.stringify(body),
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                        },
                    })
                        .then(res => {
                            if (res.status === 200) {
                                res
                                    .json()
                                    .then(res => {
                                        console.log('res', res)
                                        if (res.status) {
                                            Toast.show({
                                                text: I18n.t('MSG.INFO_SAVED'),
                                                buttonText: I18n.t('MSG.OK'),
                                                type: 'success',
                                                duration: 3000,
                                            });

                                            this.setState({
                                                isLoading: false,
                                                isDisabled: true,

                                                qrcode: '',
                                                location: null
                                            }, () => { this.props.navigation.navigate('Main') })
                                        } else {
                                            Toast.show({
                                                text: I18n.t('MSG.QR_NOT_EXIST'),
                                                buttonText: I18n.t('MSG.OK'),
                                                type: 'danger',
                                                duration: 3000,
                                            });
                                        }
                                    })
                            } else if (res.status === 404) {
                                Toast.show({
                                    text: I18n.t('MSG.QR_NOT_EXIST'),
                                    buttonText: I18n.t('MSG.OK'),
                                    type: 'danger',
                                    duration: 3000,
                                });
                            } else if (res.status === 400) {
                                Toast.show({
                                    text: I18n.t('MSG.INFO_CONFIRMATION'),
                                    buttonText: I18n.t('MSG.OK'),
                                    type: 'danger',
                                    duration: 3000,
                                });
                            } else if (res.status === 401) {
                                Toast.show({
                                    text: I18n.t('MSG.WEIGHT_SENT_TWICE'),
                                    buttonText: I18n.t('MSG.OK'),
                                    type: 'danger',
                                    duration: 10000,
                                });

                                this.setState({
                                    isLoading: false,
                                    isDisabled: true,

                                    qrcode: '',
                                    location: null
                                }, () => { this.props.navigation.navigate('Main') })
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
                        })
                        .finally(() => { this.setState({ isLoading: false }) })
                }
            } else {
                Toast.show({
                    text: I18n.t('MSG.LOGIN_AGAIN'),
                    buttonText: I18n.t('MSG.OK'),
                    type: 'danger',
                    duration: 3000,
                });
            }
        } catch (error) { console.error('error', error) }
    }

    render() {
        const { isLoading, isDisabled, isVisible, weight } = this.state;

        return (
            <ScrollView style={{ backgroundColor: '#222' }} contentContainerStyle={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <KeyboardAvoidingView style={{ width: '100%', }} behavior={Platform.OS == "ios" ? "padding" : "height"}>
                    <View style={{ width: '100%', marginTop: 20, marginBottom: 30, paddingRight: 12, paddingLeft: 12 }}>
                        <Item
                            floatingLabel
                            style={styles.item}>
                            <Label style={styles.inputText}>{I18n.t("WEIGHT")}</Label>
                            <Input
                                keyboardType="numeric"
                                style={[styles.inputText, styles.green]}
                                value={weight.toString()}
                                onChangeText={weight => this.setState({ weight })}
                                onFocus={() => this.setState({ isVisible: false })}
                                onEndEditing={() => this.setState({ isVisible: true })}
                            />
                        </Item>
                    </View>
                </KeyboardAvoidingView>

                {
                    isVisible ?
                        <QRCodeScanner
                            showMarker
                            onRead={this.onSuccess}
                            flashMode={RNCamera.Constants.FlashMode.auto}
                            bottomContent={
                                <View>
                                    <Button
                                        disabled={isDisabled}
                                        style={[styles.btn, { backgroundColor: isDisabled ? '#d3d6d0' : '#89da33' }]}
                                        onPress={() => this.pointing()}>

                                        {
                                            isLoading ?
                                                <ActivityIndicator
                                                    size="large"
                                                    color="#fff"
                                                    style={{ marginTop: 10 }}
                                                />
                                                :
                                                <Text style={[styles.inputText, { color: '#000' }]}> {I18n.t("SEND")} </Text>
                                        }
                                    </Button>
                                </View>
                            }
                        /> : null
                }


            </ScrollView>
        );
    }

    _isValid = () => {
        const { weight, qrcode, lat, lng } = this.state;

        if (!weight) {
            Toast.show({
                text: I18n.t('MSG.MISSING_WEIGHT'),
                buttonText: I18n.t('MSG.OK'),
                type: 'danger',
                duration: 3000,
            });
            return false;
        }

        if (!qrcode) {
            Toast.show({
                text: I18n.t('MSG.MISSING_QR'),
                buttonText: I18n.t('MSG.OK'),
                type: 'danger',
                duration: 3000,
            });
            return false;
        }

        return true;
    }
}

const styles = StyleSheet.create({
    inputText: {
        color: '#B7B6A1',
        fontFamily: 'STC-Regular',
        fontSize: 16,
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

export default Talabat;
