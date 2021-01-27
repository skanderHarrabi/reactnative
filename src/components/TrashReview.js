/* eslint-disable react-native/no-inline-styles */
import React, { Component } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Image, Platform } from 'react-native';
import { Icon, Button, Item, Textarea, Toast } from 'native-base';
import { withNavigation } from 'react-navigation';
import ImagePicker from 'react-native-image-picker';


import { SERVER_URL } from '../utils/helpers';
import RadioBtn from './RadioBtn';
import I18n from '../../i18n';

class TrashReview extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      types: [],
      photo: null
    };
  }

  updateTrash = () => {
    const { types, photo } = this.state;
    const id = this.props.trash_id;
    const link = `${SERVER_URL}api/trash/${id}/maintenance/request`;

    if (this._isValid()) {
      let body = {
        types,
        photo: 'data:image/jpeg;base64,' + photo.data,
      }

      this.setState({ isLoading: true });

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
            console.log(res)
            res
              .json()
              .then(res => {
                if (res.status) {
                  Toast.show({
                    text: I18n.t('MSG.CONTAINER_UPDATED'),
                    buttonText: I18n.t('MSG.OK'),
                    type: 'success',
                    duration: 5000,
                  });
                }
              })
          } else if (res.status === 400) {
            console.log(res)
            Toast.show({
              text: I18n.t('MSG.INFO_CONFIRMATION'),
              buttonText: I18n.t('MSG.OK'),
              type: 'danger',
              duration: 3000,
            });
          } else {
            console.log(res)
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
  };

  getImage = () => {
    const options = {
      title: I18n.t('CHOOSE_PHOTO'),
      cancelButtonTitle: I18n.t('CANCEL'),
      takePhotoButtonTitle: I18n.t('TAKE_PHOTO'),
      chooseFromLibraryButtonTitle: I18n.t('CHOOSE_FROM_GALERY'),
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    ImagePicker.showImagePicker(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        this.setState({
          photo: response,
        });
      }
    });
  };

  addType = (type) => {
      const newTypes = [...this.state.types];
      const index = newTypes.indexOf(type);

      if (index > -1) {
        newTypes.splice(index, 1);
      } else {
        newTypes.push(type)
      }

      this.setState({ types: newTypes })
  }

  render() {
    const { isLoading, types, photo } = this.state;
    return (
      <View style={{ marginTop: 10 }}>
        <View>
          <Text style={styles.title}> - {I18n.t('_REVIEW')} </Text>

          <View style={{ ...styles.inline }}>
            <View>
              <RadioBtn
                label={I18n.t('_REVIEW_T1')}
                selected={types.includes(1)}
                onPress={() => this.addType(1)}
              />
              <RadioBtn
                label={I18n.t('_REVIEW_T2')}
                selected={types.includes(2)}
                onPress={() => this.addType(2)}
              />
              <RadioBtn
                label={I18n.t('_REVIEW_T3')}
                selected={types.includes(3)}
                onPress={() => this.addType(3)}
              />
              <RadioBtn
                label={I18n.t('_REVIEW_T4')}
                selected={types.includes(4)}
                onPress={() => this.addType(4)}
              />
              <RadioBtn
                label={I18n.t('_REVIEW_T5')}
                selected={types.includes(5)}
                onPress={() => this.addType(5)}
              />
            </View>

            <View>
              <TouchableOpacity style={styles.card} onPress={this.getImage}>
                {
                  photo === null ? (
                    <Icon
                      type='FontAwesome5'
                      name='camera'
                      style={styles.cameraIcon}
                    />
                  ) : (
                      <Image
                        style={{ width: 130, height: 130, borderRadius: 7 }}
                        source={{ uri: photo.uri }}
                      />
                    )
                }
              </TouchableOpacity>
            </View>
          </View>
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

  _isValid = () => {
    const { types, photo } = this.state;

    if (types.length === 0) {
      Toast.show({
        text: I18n.t('MSG._REVIEW_MISSING_CHOICE'),
        buttonText: I18n.t('MSG.OK'),
        type: 'danger',
        duration: 3000,
      });
      return false;
    }

    if (!photo) {
      Toast.show({
        text: I18n.t('MSG._REVIEW_MISSING_PHOTO'),
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
  btnText: {
    color: '#000',
    fontFamily: 'STC-Regular',
    fontSize: 16,
  },
  btn: {
    margin: 8,
    paddingLeft: 15,
    paddingRight: 15,
    height: 40,
    backgroundColor: '#89da33',
    borderColor: '#000',
    borderWidth: 2,
    borderTopStartRadius: 15,
    borderBottomEndRadius: 15,
    justifyContent: 'center',
  },
  cameraIcon: {
    fontSize: 50,
    color: '#707070',
  },
  card: {
    borderRadius: 7,
    borderColor: '#707070',
    borderWidth: 1,
    height: 140,
    width: 140,
    padding: 7,
    margin: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
});

export default withNavigation(TrashReview);
