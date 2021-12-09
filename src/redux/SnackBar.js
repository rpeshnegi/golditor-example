import { SHOW_SNACKBAR, HIDE_SNACKBAR, ADD_SNACKBAR_MSG, SHOW_SNACKBAR_ERROR } from './constants';

const initialState = {
    open: false,
    message: '',
    error: false
};

const SnackBar = (state = initialState, action) => {

    switch (action.type) {
        case ADD_SNACKBAR_MSG:
            return {
                ...state,
                message: action.payload,
            };
        case SHOW_SNACKBAR_ERROR:
            return {
                ...state,
                message: action.payload.msg,
                open: true,
                error: action.payload.error,
            };
        case SHOW_SNACKBAR:
            return {
                ...state,
                open: true
            };
        case HIDE_SNACKBAR:
            return {
                ...state,
                open: false,
                message: '',
                error: false
            };
        default:
            return state;
    }
}

export default SnackBar