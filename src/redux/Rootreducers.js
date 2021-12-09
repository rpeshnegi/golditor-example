import { combineReducers } from 'redux';
import CustomizerReducer from './customizer/CustomizerReducer';
import UserReducer from './user/UserReducer';
import YTAuthReducer from './user/YTAuthReducer';
import FBAuthReducer from './user/FBAuthReducer';
import SnackBar from './SnackBar';

const RootReducers = combineReducers({
  CustomizerReducer,
  UserReducer,
  SnackBar,
  YTAuthReducer,
  FBAuthReducer
});

export default RootReducers;
