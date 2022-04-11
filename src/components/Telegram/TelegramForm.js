/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import {
    Grid, Button, FormControlLabel, RadioGroup, FormControl
} from '@material-ui/core';
import * as Yup from 'yup';
import { Formik, Form, ErrorMessage, Field } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import CustomErrorMessage from '../forms/custom-elements/CustomErrorMessage';
import CustomFormLabel from '../forms/custom-elements/CustomFormLabel';
import { ADD_SNACKBAR_MSG, SHOW_SNACKBAR_ERROR } from '../../redux/constants';
import CustomTextField from '../forms/custom-elements/CustomTextField';
import CustomRadio from '../forms/custom-elements/CustomRadio';
import CustomSelect from '../forms/custom-elements/CustomSelect';

const validations = Yup.object().shape({
    text: Yup.string().required('Required'),
    chatUser: Yup.string().required('Required')
});

const TelegramForm = ({ moduleData, mediaFiles }) => {
    const [isSubmitting, setIsSubmitting] = useState(null);
    const TELEGRAM_AUTH = useSelector((state) => state.SocialAuthReducer.telegram);
    const dispatch = useDispatch();

    const initialValues = {
        text: `${moduleData.title}\n${moduleData.content}${moduleData.acf['golditor-tags']}`,
        chatUser: '',
        postType: 'MSG',
        image: '',
        video: '',
        otherFile: ''
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

    const getApiConfig = (values) => {
        const config = {
            method: 'get',
            url: `${process.env.REACT_APP_TELEGRAM_API_URL}/bot${TELEGRAM_AUTH.token}/`,
            data: null
        };
        if (values.postType === 'MSG') {
            config.url += `sendMessage?chat_id=@${values.chatUser}&text=${values.text}`
            // config.data = {}
        } else if (values.postType === 'PHOTO') {
            config.url += `sendPhoto?chat_id=@${values.chatUser}&photo=${mediaFiles.filter(item => item.id === values.image)[0].source_url}&caption=${encodeURIComponent(values.text)}`
            config.data = {}
        } else if (values.postType === 'VIDEO') {
            config.url += `sendVideo?chat_id=@${values.chatUser}&video=${mediaFiles.filter(item => item.id === values.video)[0].source_url}&caption=${encodeURIComponent(values.text)}`
            // config.data = {}
        } else if (values.postType === 'OTHER') {
            config.url += `sendDocument?chat_id=@${values.chatUser}&document=${mediaFiles.filter(item => item.id === values.otherFile)[0].source_url}&caption=${encodeURIComponent(values.text)}`
            // config.data = {}
        }
        return config
    }

    const handleSubmit = async (values) => {
        setIsSubmitting(true)

        try {
            const res = await axios(getApiConfig(values))
            setIsSubmitting(false)
            dispatch({
                type: ADD_SNACKBAR_MSG,
                payload: `Post has been shared successfully.`
            })
        } catch (error) {
            setIsSubmitting(false)
            dispatch({
                type: SHOW_SNACKBAR_ERROR,
                payload: { msg: error.response.data.description, error: true }
            })
        }
    }

    return (
        <>
            {/* <div id='telegram-button' /> */}
            <Formik
                initialValues={initialValues}
                validationSchema={validations}
                onSubmit={handleSubmit}
            >
                {({ values, handleChange }) => (
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
                            <Grid item lg={6} md={6} sm={12} >
                                <CustomFormLabel
                                    sx={{
                                        mt: 0,
                                    }}
                                    htmlFor="text">Text</CustomFormLabel>
                                <Field multiline
                                    rows={4} name="text" id="text" variant="outlined" fullWidth size="small" as={CustomTextField} placeholder="text" />
                                <ErrorMessage name="text" component={CustomErrorMessage} />
                            </Grid>
                            <Grid item lg={4} md={6} sm={12}>
                                <FormControl component="fieldset">
                                    <RadioGroup
                                        aria-label="postType"
                                        name="postType"
                                        value={values.postType}
                                        onChange={handleChange}
                                    >
                                        <FormControlLabel
                                            value="MSG"
                                            control={<CustomRadio />}
                                            label="Content"
                                        />
                                        <FormControlLabel
                                            value="PHOTO"
                                            control={<CustomRadio />}
                                            label="Photo with Content"
                                        />
                                        <FormControlLabel
                                            value="VIDEO"
                                            control={<CustomRadio />}
                                            label="Video with Content"
                                        />
                                        <FormControlLabel
                                            value="OTHER"
                                            control={<CustomRadio />}
                                            label="Other files with Content"
                                        />
                                    </RadioGroup>
                                </FormControl>
                            </Grid>
                            {values.postType === 'PHOTO' &&
                                <Grid item lg={4} md={6} sm={6}>
                                    <CustomFormLabel sx={{
                                        mt: 0,
                                    }}
                                        htmlFor="fname-text">Image:</CustomFormLabel>
                                    <Field name="image" id="image" variant="outlined" fullWidth size="small"
                                        menuitems={mediaFiles
                                            .filter((item) => item.mime_type.includes('image'))
                                            .map(item => ({ value: item.id, title: item.slug })
                                            )}
                                        as={CustomSelect}
                                    />
                                    <ErrorMessage name="image" component={CustomErrorMessage} />
                                </Grid>
                            }
                            {values.postType === 'VIDEO' &&
                                <Grid item lg={4} md={6} sm={6}>
                                    <CustomFormLabel sx={{
                                        mt: 0,
                                    }}
                                        htmlFor="fname-text">Video:</CustomFormLabel>
                                    <Field name="video" id="video" variant="outlined" fullWidth size="small"
                                        menuitems={mediaFiles
                                            .filter((item) => item.mime_type.includes('video'))
                                            .map(item => ({ value: item.id, title: item.slug })
                                            )}
                                        as={CustomSelect}
                                    />
                                    <ErrorMessage name="video" component={CustomErrorMessage} />
                                </Grid>
                            }
                            {values.postType === 'OTHER' &&
                                <Grid item lg={4} md={6} sm={6}>
                                    <CustomFormLabel sx={{
                                        mt: 0,
                                    }}
                                        htmlFor="fname-text">Other file:</CustomFormLabel>
                                    <Field name="otherFile" id="otherFile" variant="outlined" fullWidth size="small"
                                        menuitems={mediaFiles
                                            .filter((item) => (!item.mime_type.includes('video') && !item.mime_type.includes('image')))
                                            .map(item => ({ value: item.id, title: item.slug })
                                            )}
                                        as={CustomSelect}
                                    />
                                    <ErrorMessage name="video" component={CustomErrorMessage} />
                                </Grid>
                            }
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