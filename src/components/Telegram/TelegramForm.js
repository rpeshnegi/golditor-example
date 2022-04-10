import React, { useEffect, useState } from 'react';
import {
    Grid, Button
} from '@material-ui/core';
import * as Yup from 'yup';
import { Formik, Form, ErrorMessage, Field } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import CustomErrorMessage from '../forms/custom-elements/CustomErrorMessage';
import CustomFormLabel from '../forms/custom-elements/CustomFormLabel';
import axiosInstance from '../../utils/axios';
import { ADD_SNACKBAR_MSG, SHOW_SNACKBAR_ERROR } from '../../redux/constants';
import CustomTextField from '../forms/custom-elements/CustomTextField';

const validations = Yup.object().shape({
    text: Yup.string().required('Required'),
    chatUser: Yup.string().required('Required')
});

const TelegramForm = ({ moduleData }) => {
    const [isSubmitting, setIsSubmitting] = useState(null);
    const TELEGRAM_AUTH = useSelector((state) => state.SocialAuthReducer.telegram);
    const dispatch = useDispatch();

    const initialValues = {
        text: `${moduleData.title}\n${moduleData.content}${moduleData.acf['golditor-tags']}`,
        chatUser: ''
    };

    // eslint-disable-next-line no-unused-vars
    const loadTwitterApi = () => {
        localStorage.setItem('FALLBACK_URL', window.location.pathname + window.location.hash)
        const callBackUrl = `${window.location.origin}/auth/social-media?project_id=${moduleData.acf['golditor-project'].ID}&auth_type=telegram`
        const script = document.createElement('script')
        script.src = 'https://telegram.org/js/telegram-widget.js?15'
        script.setAttribute("data-telegram-login", "goldi_test_bot");
        script.setAttribute("data-size", "large");
        script.setAttribute("data-auth-url", callBackUrl);
        script.setAttribute("data-request-access", "write");

        script.onload = () => { }
        document.getElementById('telegram-button').appendChild(script)
    }

    useEffect(() => {
        // loadTwitterApi()
        return () => { };
    }, [])

    useEffect(() => {
        if (TELEGRAM_AUTH) {
            // getShows(ACAST_AUTH.api_key)
        }
        return () => { };
    }, [TELEGRAM_AUTH])

    const handleSubmit = (values) => {
        setIsSubmitting(true)
        const url = `${process.env.REACT_APP_TELEGRAM_API_URL}/bot${TELEGRAM_AUTH.token}/sendMessage?chat_id=@${values.chatUser}&text=${values.text}`

        axiosInstance.get(url).then(() => {
            setIsSubmitting(false)
            dispatch({
                type: ADD_SNACKBAR_MSG,
                payload: `Podcast has been publsihed successfully.`
            })
        }).catch((error) => {
            console.log(error.response);
            setIsSubmitting(false)
            dispatch({
                type: SHOW_SNACKBAR_ERROR,
                payload: { msg: error.response.data.description, error: true }
            })
        })
    }

    return (
        <>
            {/* <div id='telegram-button' /> */}
            <Formik
                initialValues={initialValues}
                validationSchema={validations}
                onSubmit={handleSubmit}
            >
                {() => (
                    <Form>
                        <Grid container spacing={3} sx={{
                            mt: 0,
                        }}>
                            <Grid item lg={4} md={6} sm={12} >
                                <CustomFormLabel
                                    sx={{
                                        mt: 0,
                                    }}
                                    htmlFor="chatUser">Channel username</CustomFormLabel>
                                <Field name="chatUser" id="chatUser" variant="outlined" fullWidth size="small" as={CustomTextField} placeholder="Channel username" />
                                <ErrorMessage name="chatUser" component={CustomErrorMessage} />
                            </Grid>
                            <Grid item lg={4} md={6} sm={12} >
                                <CustomFormLabel
                                    sx={{
                                        mt: 0,
                                    }}
                                    htmlFor="text">Text</CustomFormLabel>
                                <Field multiline
                                    rows={4} name="text" id="text" variant="outlined" fullWidth size="small" as={CustomTextField} placeholder="text" />
                                <ErrorMessage name="text" component={CustomErrorMessage} />
                            </Grid>
                            <Grid item lg={2} md={4} sm={6}>
                                <Button variant="contained" color="primary" type="submit"
                                    disabled={!TELEGRAM_AUTH || isSubmitting}
                                    sx={{
                                        m: 'auto',
                                    }}>
                                    Share
                                </Button>
                            </Grid>
                        </Grid>
                    </Form>
                )
                }
            </Formik >
        </>
    );
}

export default TelegramForm