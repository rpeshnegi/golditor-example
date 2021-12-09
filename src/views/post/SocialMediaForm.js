import React, { useEffect } from 'react';
import {
    Card, CardHeader, CardContent, Divider, Accordion, AccordionSummary, AccordionDetails, Typography
} from '@material-ui/core';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import FacebookIcon from '@material-ui/icons/Facebook';
import YouTubeIcon from '@material-ui/icons/YouTube';
import TwitterIcon from '@material-ui/icons/Twitter';
import InstagramIcon from '@material-ui/icons/Instagram';
import MusicNoteIcon from '@material-ui/icons/MusicNote';
import YouTubeForm from '../../components/YouTube/YouTubeForm';
import axiosInstance from '../../utils/axios';
import { SHOW_SNACKBAR_ERROR } from '../../redux/constants';
import FaceBookForm from '../../components/FaceBook/FaceBookForm';
import TwitterForm from '../../components/Twitter/TwitterForm';
import InstagramForm from '../../components/Instagram/InstagramForm';
import TikTokkForm from '../../components/TikTok/TikTokkForm';

const SocialMediaForm = (props) => {
    const { id } = useParams()
    const { moduleData, setModuleData, mediaFiles } = props
    const [expanded, setExpanded] = React.useState('panel1');
    const dispatch = useDispatch();

    useEffect(async () => {
        const type = window.location.hash.substr(1);
        setExpanded(type)
    }, [id])

    // eslint-disable-next-line no-unused-vars
    const initialValues = {
        id: moduleData?.id || undefined,
        status: 'private',
    };

    const updatePost = (data, field) => {
        initialValues.fields = { [field]: data }
        axiosInstance.post(`/wp/v2/golditor-campaigns/${moduleData.id}`, initialValues).then((response) => {
            const postRes = response.data
            Object.assign(postRes, {
                title: response.data.title.rendered.replace('Private: ', ''),
                content: response.data.content.rendered.replace(/<(.|\n)*?>/g, '')
            })
            setModuleData(postRes)
        }).catch((error) => {
            console.log(error);
            dispatch({
                type: SHOW_SNACKBAR_ERROR,
                payload: { msg: 'Some error has been occured. Please try again.', error: true }
            })
        })
    }

    const tooglePanel = (panel) => (event, newExpanded) => {
        setExpanded(newExpanded ? panel : false)
        if (newExpanded) window.location.hash = panel;
    }

    return (
        <>
            <Card
                sx={{
                    p: 0,
                }}>
                <CardHeader title="Social Media platform" />
                <Divider />
                <CardContent>
                    <Accordion>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel-youtube"
                            id="panel-youtube"
                        >
                            <YouTubeIcon className="smicons" /> <Typography>YouTube</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <YouTubeForm moduleData={moduleData} mediaFiles={mediaFiles} updatePost={updatePost} />
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel-fb"
                            id="panel-fb"
                        >
                            <FacebookIcon className="smicons" /> <Typography>Facebook</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <FaceBookForm moduleData={moduleData} mediaFiles={mediaFiles} updatePost={updatePost} />
                        </AccordionDetails>
                    </Accordion>
                    <Accordion expanded={expanded === 'panel-twitter'} onChange={tooglePanel('panel-twitter')}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel-twitter"
                            id="panel-twitter"
                        >
                            <TwitterIcon className="smicons" /> <Typography>Twitter</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <TwitterForm moduleData={moduleData} mediaFiles={mediaFiles} updatePost={updatePost} />
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel-instagram"
                            id="panel-instagram"
                        >
                            <InstagramIcon className="smicons" /> <Typography>Instagram</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <InstagramForm moduleData={moduleData} mediaFiles={mediaFiles} updatePost={updatePost} />
                        </AccordionDetails>
                    </Accordion>
                </CardContent>
            </Card>

        </>
    );
};

export default SocialMediaForm;
