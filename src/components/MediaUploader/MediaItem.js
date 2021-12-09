import React from 'react';

import {
    Box, Divider, Button
    , ListItem
    , ListItemText
} from '@material-ui/core';
import { deleteRecord } from '../../utils/common';

const MediaItem = ({ media, setMediaFiles }) => {

    const deleteMedia = () => {
        deleteRecord(media.id)

        // removing deleted file
        setMediaFiles((state) => state.filter((item) => item.id !== media.id))
    }

    return (
        <Box>
            <ListItem alignItems="flex-start">
                <Box mr={2}>
                    {media.mime_type.includes('video') ?
                        <video width="250" height="150" controls>
                            <source src={media.source_url} type={media.mime_type} />
                            <track kind="captions" />
                            Your browser does not support the video tag.
                        </video>
                        :
                        <img style={{ width: '100%', maxWidth: 180 }} alt={media.title.raw} src={media.source_url} />
                    }
                </Box>
                <ListItemText secondaryTypographyProps={{
                    marginTop: "10px"
                }}
                    primary={media.title.raw} secondary={
                        <>
                            <Button sx={{ mt: 1 }}
                                variant="contained"
                                color="primary"
                                size="small"
                                type="button"
                                onClick={deleteMedia}
                            >
                                Delete
                            </Button>
                        </>
                    }
                />
            </ListItem>
            <Divider variant="inset" component="li" />
        </Box>
    );
}

export default MediaItem;