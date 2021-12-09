import { GOOGLE_LOGIN, GOOGLE_LOGOUT } from '../constants';

const YTAuthReducer = (state = { GOOGLE_AUTH: null }, action) => {

    switch (action.type) {
        case GOOGLE_LOGIN:
            return {
                ...state,
                GOOGLE_AUTH: action.payload,
            };
        case GOOGLE_LOGOUT:
            return {
                ...state,
                GOOGLE_AUTH: null,
            };
        default:
            return state;
    }
}

export default YTAuthReducer