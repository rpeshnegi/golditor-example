import React from 'react';
import { Typography } from '@material-ui/core';

const CustomErrorMessage = (props) => {
    return (
        <Typography variant="caption" sx={{ color: (theme) => theme.palette.error.main }}>
            {props.children}
        </Typography>
    )
}

export default CustomErrorMessage