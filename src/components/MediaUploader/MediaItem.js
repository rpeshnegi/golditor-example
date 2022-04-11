import React from 'react';

import {
    Button,
    Card, CardActions,
    Typography
} from '@material-ui/core';
import FeatherIcon from 'feather-icons-react';
import { deleteRecord } from '../../utils/common';

const MediaItem = ({ media, setMediaFiles }) => {

    let renderComp = ''
    if (media.mime_type.includes('image')) renderComp = <Image media={media} />
    else if (media.mime_type.includes('video')) renderComp = <Video media={media} />
    else if (media.mime_type.includes('audio')) renderComp = <Audio media={media} />
    else renderComp = <File media={media} />

    const deleteMedia = () => {
        deleteRecord(media.id)

        // removing deleted file
        setMediaFiles((state) => state.filter((item) => item.id !== media.id))
    }

    return (

        <Card
            sx={{
                textAlign: 'center',
                height: '250px'
            }}
        >
            {renderComp}
            <CardActions disableSpacing sx={{ padding: 0, display: 'block' }}>
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    type="button"
                    onClick={deleteMedia}
                >
                    Delete
                </Button>
            </CardActions>
        </Card>
    );
}

export default MediaItem;


const File = ({ media }) => {
    return (
        <>
            <FeatherIcon size="150px" icon="file" />
            <Typography
                color="textSecondary"
                sx={{
                    fontSize: '14px',
                    mt: '10px',
                }}
            >
                {media.title.rendered}
            </Typography>
        </>
    )
}
const Image = ({ media }) => (<img style={{ width: 'auto', height: '85%' }} alt={media.title.raw} src={media.source_url} />)
const Video = ({ media }) => {
    return (
        <video width="250" height="150" controls>
            <source src={media.source_url} type={media.mime_type} />
            <track kind="captions" />
            Your browser does not support the video tag.
        </video>
    )
}
const Audio = ({ media }) => {
    return (
        <audio controls>
            <source src={media.source_url} type={media.mime_type} />
            <track kind="captions" />
            Your browser does not support the audio element.
        </audio>
    )
}