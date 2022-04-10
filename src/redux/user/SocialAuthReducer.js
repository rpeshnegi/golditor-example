import { UPDATE_SOCIAL_AUTH, REMOVE_SOCIAL_AUTH } from '../constants';

const initialState = {
    you_tube: null,
    fb: null,
    insta: null,
    twitter: null,
    tiktok: null,
    acast: null,
    telegram: null
};

const SocialAuthReducer = (state = initialState, action) => {

    switch (action.type) {
        case UPDATE_SOCIAL_AUTH:
            return {
                ...state,
                ...action.payload,
            };
        case REMOVE_SOCIAL_AUTH:
            return initialState;
        default:
            return state;
    }
}

export default SocialAuthReducer