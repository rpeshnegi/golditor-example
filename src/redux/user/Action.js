import axiosInstance from '../../utils/axios';
import {
    AUTH_UPDATE,
} from '../constants';

// eslint-disable-next-line import/prefer-default-export
export const fetchAuthUser = () => (dispatch) => {
    axiosInstance.get('custom/current-user').then(user => {
        // AUTH_USER = { ...AUTH_USER, ...user.data }
        dispatch({
            type: AUTH_UPDATE,
            payload: user.data
        })
        // history.push('/');
    })
};