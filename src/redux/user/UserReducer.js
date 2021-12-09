import { LOGIN, LOGOUT, AUTH_UPDATE } from '../constants';

const initialState = {
    isAuthenticated: !!localStorage.getItem("AUTH_USER"),
    user: JSON.parse(localStorage.getItem("AUTH_USER"))
};

const UserReducer = (state = initialState, action) => {

    let AUTH_USER;
    switch (action.type) {
        case LOGIN:
            localStorage.setItem("AUTH_USER", JSON.stringify(action.payload));
            return {
                ...state,
                isAuthenticated: true,
                user: action.payload,
            };
        case LOGOUT:
            localStorage.clear();
            return {
                ...state,
                isAuthenticated: false,
                user: null
            };
        case AUTH_UPDATE:
            AUTH_USER = JSON.parse(localStorage.getItem("AUTH_USER"));
            localStorage.setItem("AUTH_USER", JSON.stringify(AUTH_USER));
            return {
                ...state,
                isAuthenticated: true,
                user: AUTH_USER,
            };
        default:
            return state;
    }
}

export default UserReducer