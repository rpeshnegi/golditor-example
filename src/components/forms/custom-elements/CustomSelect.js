import React from 'react';
import { styled } from '@material-ui/core/styles';
import { Select, MenuItem } from '@material-ui/core';

const CustomSelect = styled((props) =>
    <Select {...props} >
        {props.menuitems && props.menuitems.map((item, index) => {
            // eslint-disable-next-line react/no-array-index-key
            return <MenuItem key={`select-item_${index}`} value={item.value}>
                {item.title}
            </MenuItem>
        })}
    </Select>
)(({ theme }) => ({
    '& .MuiSelect-select': {
        color: '#767e89',
    },
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: `${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : '#dee3e9'}`,
    },
    '& .MuiSelect-select::-webkit-input-placeholder': {
        color: '#767e89',
        opacity: '1',
    },
}));
export default CustomSelect;
