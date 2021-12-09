import React from 'react';
import { Link } from 'react-router-dom';
import {
    IconButton,
    Tooltip,
} from '@material-ui/core';
import FeatherIcon from 'feather-icons-react';

const ListingAction = (props) => {
    const { route, row } = props

    return (
        <>
            <Tooltip title="Edit">
                <IconButton component={Link} to={`/${route}/edit/${row.id}`}>
                    <FeatherIcon icon="edit-3" width="18" />
                </IconButton>
            </Tooltip>
        </>
    );
}

export default ListingAction