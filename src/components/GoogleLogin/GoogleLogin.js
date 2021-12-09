import React, { useState, useEffect } from 'react';
import {
    Button
} from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { GOOGLE_LOGIN, GOOGLE_LOGOUT } from '../../redux/constants';

const GoogleLogin = (props) => {
    const { signinCallback } = props
    const [user, setUser] = useState(null);
    const dispatch = useDispatch();
    const windowGapi = window.gapi;

    const updateUser = (currentUser) => {
        const ytUser = {
            name: currentUser.getBasicProfile().getName(),
            profileImg: currentUser.getBasicProfile().getImageUrl(),
        }
        dispatch({
            type: GOOGLE_LOGIN,
            payload: currentUser
        })
        setUser(ytUser);
        signinCallback(currentUser.getAuthResponse())
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
            if (auth2.isSignedIn.get()) {
                updateUser(auth2.currentUser.get())
            } else {
                attachSignin(document.getElementById('ytLoginBtn'), auth2);
            }
        })
    }

    useEffect(() => {
        setAuth2();
        return () => { };
    }, []);

    const signOut = () => {
        const auth2 = windowGapi.auth2.getAuthInstance();
        auth2.signOut().then(() => {
            setUser(null);
            setAuth2();
            dispatch({
                type: GOOGLE_LOGOUT
            })
            console.log('User signed out.');
        });
    }

    if (user) {
        return (
            <div className="container">
                <Button variant="contained" onClick={signOut} id="" color="primary" type="button"
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