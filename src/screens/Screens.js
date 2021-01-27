import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';

import Loading from './Loading';
import Login from './Login';
import Main from './Main';
import Talabat from './Talabat';
import Talab from './Talab';
import Trashes from './Trashes';
import Trash from './Trash';
import Pointing from './Pointing';

const Screens = createStackNavigator(
  {
    Loading: {
      screen: Loading,
      navigationOptions: {
        headerShown: false,
      },
    },
    Login: {
      screen: Login,
      navigationOptions: {
        headerShown: false,
      },
    },
    Main: {
      screen: Main,
      navigationOptions: {
        headerShown: false,
        headerBackTitle: null,
      },
    },
    Talabat: {
      screen: Talabat,
    },
    Talab: {
      screen: Talab,
    },
    Trashes: {
      screen: Trashes,
    },
    Trash: {
      screen: Trash,
    },
    Pointing: {
      screen: Pointing,
    },
  },
  {gesturesEnabled: false, initialRouteName: 'Loading'},
);

export default createAppContainer(Screens);
