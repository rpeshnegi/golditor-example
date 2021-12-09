import React from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, Button, Typography } from '@material-ui/core';
import imgsvg from '../../../assets/images/backgrounds/welcome-bg2-2x-svg.svg';


const WelcomeCard = () => {
    const AUTH_USER = useSelector((state) => state.UserReducer.user);
    return (
        <Card
            elevation={0}
            sx={{
                position: 'relative',
                backgroundColor: (theme) => `${theme.palette.mode === 'dark' ? '#32363e' : ''}`,
                '&:before': {
                    content: `""`,
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    background: `url(${imgsvg})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '45%',
                    transform: (theme) => `${theme.direction === 'rtl' ? '' : 'unset'}`,
                    backgroundPosition: {
                        xs: 'top 0px right -9px',
                    },
                },
                borderWidth: '0px',
            }}
        >
            <CardContent>
                <Typography
                    sx={{
                        marginTop: '8px',
                        marginBottom: '0px',
                        lineHeight: '35px',
                        position: 'relative',
                        zIndex: 9,
                    }}
                    variant="h3"
                    gutterBottom
                >
                    Hey {AUTH_USER.name}, <br /> Download Latest Report
                </Typography>
                <Button
                    sx={{
                        marginTop: '15px',
                    }}
                    variant="contained"
                    color="primary"
                >
                    Download
                </Button>
            </CardContent>
        </Card>
    )
}

export default WelcomeCard;
