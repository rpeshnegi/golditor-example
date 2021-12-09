import { FB_LOGIN, FB_LOGOUT } from '../constants';

const FBAuthReducer = (state = { FB_AUTH: null }, action) => {

    switch (action.type) {
        case FB_LOGIN:
            return {
                ...state,
                FB_AUTH: action.payload,
            };
        case FB_LOGOUT:
            return {
                ...state,
                FB_AUTH: null,
            };
        default:
            return state;
    }
}

export default FBAuthReducer