import React, { useEffect } from 'react';
import {
    Card, CardHeader, CardContent, Divider, Accordion, AccordionSummary, AccordionDetails, Typography
} from '@material-ui/core';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import FacebookIcon from '@material-ui/icons/Facebook';
import YouTubeIcon from '@material-ui/icons/YouTube';
import TwitterIcon from '@material-ui/icons/Twitter';
import InstagramIcon from '@material-ui/icons/Instagram';
import MusicNoteIcon from '@material-ui/icons/MusicNote';
import YouTubeForm from '../../components/YouTube/YouTubeForm';
import axiosInstance from '../../utils/axios';
import { SHOW_SNACKBAR_ERROR, UPDATE_SOCIAL_AUTH } from '../../redux/constants';
import FaceBookForm from '../../components/FaceBook/FaceBookForm';
import TwitterForm from '../../components/Twitter/TwitterForm';
import InstagramForm from '../../components/Instagram/InstagramForm';
import TikTokForm from '../../components/TikTok/TikTokForm';
import AcastForm from '../../components/Acast/AcastForm';
import TelegramForm from '../../components/Telegram/TelegramForm';
import TelegramBot from '../../components/Telegram/TelegramBot';

const SocialMediaForm = ({ moduleData, setModuleData, mediaFiles, projects }) => {
    const AUTH_USER = useSelector((state) => state.UserReducer.user);
    const { id } = useParams()
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

    const saveSocialAuthData = (type, data) => {
        const projectData = projects.filter((item) => item.id === +(moduleData.acf['golditor-project']?.ID))
        const projectSocialAuthData = projectData.length > 0
            ? { ...(projectData[0].social_auth_details ? JSON.parse(projectData[0].social_auth_details) : {}), ...{ [type]: data } }
            : {}
        const postData = {
            id: moduleData.acf['golditor-project']?.ID,
            title: moduleData.acf['golditor-project']?.post_title,
            author: AUTH_USER.id,
            fields: { social_auth_details: JSON.stringify(projectSocialAuthData) },
        };
        // eslint-disable-next-line prefer-template
        axiosInstance.post('/wp/v2/golditor-projects/' + moduleData.acf['golditor-project'].ID, postData).then((response) => {
            dispatch({
                type: UPDATE_SOCIAL_AUTH,
                payload: response.data.social_auth_details ? JSON.parse(response.data.social_auth_details) : {}
            })
        }).catch((error) => {
            console.log(error);
        })
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
                    <Accordion expanded={expanded === 'panel-youtube'} onChange={tooglePanel('panel-youtube')}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel-youtube"
                            id="panel-youtube"
                        >
                            <YouTubeIcon className="smicons" /> <Typography>YouTube</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {expanded === 'panel-youtube' &&
                                <YouTubeForm moduleData={moduleData} mediaFiles={mediaFiles} updatePost={updatePost} saveSocialAuthData={saveSocialAuthData} />
                            }
                        </AccordionDetails>
                    </Accordion>
                    <Accordion expanded={expanded === 'panel-fb'} onChange={tooglePanel('panel-fb')}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel-fb"
                            id="panel-fb"
                        >
                            <FacebookIcon className="smicons" /> <Typography>Facebook</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {expanded === 'panel-fb' &&
                                <FaceBookForm moduleData={moduleData} mediaFiles={mediaFiles} updatePost={updatePost} saveSocialAuthData={saveSocialAuthData} />
                            }
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
                            {expanded === 'panel-twitter' &&
                                <TwitterForm moduleData={moduleData} mediaFiles={mediaFiles} updatePost={updatePost} saveSocialAuthData={saveSocialAuthData} />
                            }
                        </AccordionDetails>
                    </Accordion>
                    <Accordion expanded={expanded === 'panel-instagram'} onChange={tooglePanel('panel-instagram')}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel-instagram"
                            id="panel-instagram"
                        >
                            <InstagramIcon className="smicons" /> <Typography>Instagram</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {expanded === 'panel-instagram' &&
                                <InstagramForm moduleData={moduleData} mediaFiles={mediaFiles} updatePost={updatePost} saveSocialAuthData={saveSocialAuthData} />
                            }
                        </AccordionDetails>
                    </Accordion>
                    <Accordion expanded={expanded === 'panel-tiktok'} onChange={tooglePanel('panel-tiktok')}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel-tiktok"
                            id="panel-tiktok"
                        >
                            <MusicNoteIcon className="smicons" /> <Typography>TikTok</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {expanded === 'panel-tiktok' &&
                                <TikTokForm moduleData={moduleData} mediaFiles={mediaFiles} updatePost={updatePost} saveSocialAuthData={saveSocialAuthData} />
                            }
                        </AccordionDetails>
                    </Accordion>
                    <Accordion expanded={expanded === 'panel-acast'} onChange={tooglePanel('panel-acast')}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel-acast"
                            id="panel-acast"
                        >
                            <MusicNoteIcon className="smicons" /> <Typography>aCast</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {expanded === 'panel-acast' &&
                                <AcastForm moduleData={moduleData} mediaFiles={mediaFiles} updatePost={updatePost} saveSocialAuthData={saveSocialAuthData} />
                            }
                        </AccordionDetails>
                    </Accordion>
                    <Accordion expanded={expanded === 'panel-telegram'} onChange={tooglePanel('panel-telegram')}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel-telegram"
                            id="panel-telegram"
                        >
                            <MusicNoteIcon className="smicons" /> <Typography>Telegram</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {expanded === 'panel-telegram' &&
                                <>
                                    <TelegramBot saveSocialAuthData={saveSocialAuthData} />
                                    <TelegramForm moduleData={moduleData} mediaFiles={mediaFiles} updatePost={updatePost} saveSocialAuthData={saveSocialAuthData} />
                                </>
                            }
                        </AccordionDetails>
                    </Accordion>
                </CardContent>
                {/* <Divider /> */}
                {/* <CardActions disableSpacing>
                    <Box p={1}>
                        <Button variant="contained" color="primary" type="submit"
                            // disabled={Object.keys(errors).length > 0 || isSubmitting} 
                            sx={{
                                mr: 1,
                            }}>
                            Submit
                        </Button>
                        <Link
                            to="/posts"
                            style={{
                                textDecoration: 'none',
                            }}
                        >
                            <Button
                                // disabled={isSubmitting}
                                variant="contained"
                                color="error"
                                type="button"
                            >
                                Cancel
                            </Button>
                        </Link>
                    </Box>
                </CardActions> */}
            </Card>

        </>
    );
};

export default SocialMediaForm;
