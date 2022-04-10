import { combineReducers } from 'redux';
import CustomizerReducer from './customizer/CustomizerReducer';
import UserReducer from './user/UserReducer';
import SocialAuthReducer from './user/SocialAuthReducer';
import SnackBar from './SnackBar';

const RootReducers = combineReducers({
    CustomizerReducer,
    UserReducer,
    SnackBar,
    SocialAuthReducer
});

export default RootReducers;
