/**
 * @format
 */

import 'react-native-gesture-handler';
import 'react-native-reanimated';
import {AppRegistry} from 'react-native';
import App from './apps/native/src/App';
import {name as appName} from './apps/native/app.json';

AppRegistry.registerComponent(appName, () => App);
