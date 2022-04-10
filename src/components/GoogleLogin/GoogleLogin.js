import React, { useEffect } from 'react';
import {
    Button
} from '@material-ui/core';
import { useSelector } from 'react-redux';

const GoogleLogin = (props) => {
    const { signinCallback } = props
    const GOOGLE_AUTH = useSelector((state) => state.SocialAuthReducer.you_tube);

    const windowGapi = window.gapi;

    const updateUser = (currentUser) => {
        const ytUser = {
            name: currentUser.getBasicProfile().getName(),
            profileImg: currentUser.getBasicProfile().getImageUrl(),
            email: currentUser.getBasicProfile().getEmail(),
        }
        signinCallback({ ...ytUser, ...currentUser.getAuthResponse() })
    };

    const attachSignin = (element, auth2) => {
        auth2.attachClickHandler(element, {},
            (googleUser) => {
                updateUser(googleUser);
            }, (error) => {
                console.log(JSON.stringify(error))
            });
    };

    const setAuth2 = async () => {
        windowGapi.auth2.init({
            client_id: process.env.REACT_APP_GAPI_CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube'
        }).then((auth2) => {
            // if (!auth2.isSignedIn.get()) 
            attachSignin(document.getElementById('ytLoginBtn'), auth2);
        })
    }

    useEffect(() => {
        if (!GOOGLE_AUTH) setAuth2();
        else windowGapi.auth.setToken({ access_token: GOOGLE_AUTH.access_token });

        return () => { };
    }, [GOOGLE_AUTH]);

    const signOut = () => {
        // const auth2 = windowGapi.auth2.getAuthInstance();
        signinCallback(null)
        // if (auth2) {
        // auth2.signOut().then(() => {
        //     signinCallback(null)
        //     console.log('User signed out.');
        // });
        // }
    }

    if (GOOGLE_AUTH) {
        return (
            <div className="container">
                <Button variant="contained" onClick={() => signOut()} id="" color="primary" type="button"
                    sx={{
                        mr: 1,
                    }}>
                    Logout
                </Button>
            </div>
        );
    }

    return (
        <Button variant="contained" id="ytLoginBtn" color="primary" type="button"
            sx={{
                mr: 1,
            }}>
            Login
        </Button>
    );
}

export default GoogleLogin