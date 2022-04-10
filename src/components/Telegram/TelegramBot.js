/* eslint-disable no-unused-vars */
/* eslint-disable prefer-template */
import React, { useEffect, useState } from 'react';
import {
    Grid, Button
} from '@material-ui/core';
import * as Yup from 'yup';
import { Formik, Form, ErrorMessage, Field } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { Box } from '@material-ui/system';
import CustomErrorMessage from '../forms/custom-elements/CustomErrorMessage';
import { SHOW_SNACKBAR_ERROR } from '../../redux/constants';
import CustomTextField from '../forms/custom-elements/CustomTextField';
import CustomFormLabel from '../forms/custom-elements/CustomFormLabel';

const validations = Yup.object().shape({
    token: Yup.string().required('Required'),
});

const BotForm = ({ saveSocialAuthData }) => {
    const [isSubmitting, setIsSubmitting] = useState(null);
    const dispatch = useDispatch();

    const initialValues = {
        token: '',
    };

    const handleSubmit = (values) => {
        setIsSubmitting(true)
        fetch(`${process.env.REACT_APP_TELEGRAM_API_URL}/bot${values.token}/getMe`)
            .then(response => response.json())
            .then(response => {
                setIsSubmitting(false)
                if (response.ok) {
                    saveSocialAuthData('telegram', { ...values, ...response.result })
                } else {
                    dispatch({
                        type: SHOW_SNACKBAR_ERROR,
                        payload: { msg: response.description, error: true }
                    })
                }
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
                {({ values, handleChange }) => (
                    <Form>
                        <Grid container spacing={3} sx={{
                            mt: 0,
                        }}>
                            <Grid item lg={4} md={6} sm={12} >
                                <Field name="token" id="token" variant="outlined" fullWidth size="small" as={CustomTextField} placeholder="Token" />
                                <ErrorMessage name="token" component={CustomErrorMessage} />
                            </Grid>
                            <Grid item lg={3} md={6} sm={6}>
                                <Button variant="contained" color="primary" type="submit"
                                    disabled={isSubmitting}
                                    sx={{
                                        mr: 1,
                                    }}>
                                    Authenticate bot
                                </Button>
                            </Grid>
                        </Grid>
                    </Form>
                )}
            </Formik >
        </>
    );
}

const SavedBot = ({ TELEGRAM_AUTH, saveSocialAuthData }) => {
    const removeBot = () => {
        saveSocialAuthData('telegram', null)
    }
    return (
        <Grid container spacing={3} sx={{
            mt: 0,
        }}>
            <Grid item lg={4} md={6} sm={12} >
                <CustomFormLabel sx={{
                    mt: 0,
                }} htmlFor="content">Bot name</CustomFormLabel>
                <Box>
                    {TELEGRAM_AUTH.username}
                </Box>
            </Grid>
            <Grid item lg={3} md={6} sm={6}>
                <Button variant="contained" color="primary" type="btuton"
                    onClick={() => removeBot()}
                    sx={{
                        mr: 1,
                    }}>
                    Remove bot
                </Button>
            </Grid>
        </Grid>
    )
}

const TelegramBot = ({ saveSocialAuthData }) => {
    const TELEGRAM_AUTH = useSelector((state) => state.SocialAuthReducer.telegram);

    return (
        !TELEGRAM_AUTH
            ? <BotForm saveSocialAuthData={saveSocialAuthData} />
            : <SavedBot saveSocialAuthData={saveSocialAuthData} TELEGRAM_AUTH={TELEGRAM_AUTH} />
    )
}

export default TelegramBot