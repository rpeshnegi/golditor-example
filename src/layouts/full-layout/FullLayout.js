import React, { useEffect, useState } from 'react';
import { experimentalStyled, useMediaQuery, Container, Box, Snackbar, Alert } from '@material-ui/core';
import { Outlet, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useCookies } from 'react-cookie';
import Sidebar from './sidebar/Sidebar';
import Header from './header/Header';
import Footer from './footer/Footer';
import Customizer from './customizer/Customizer';
import { TopbarHeight } from '../../assets/global/Theme-variable';
import { SHOW_SNACKBAR, HIDE_SNACKBAR, LOGOUT } from '../../redux/constants';

const MainWrapper = experimentalStyled('div')(() => ({
    display: 'flex',
    minHeight: '100vh',
    overflow: 'hidden',
    width: '100%',
}));
const PageWrapper = experimentalStyled('div')(({ theme }) => ({
    display: 'flex',
    flex: '1 1 auto',
    overflow: 'hidden',

    backgroundColor: theme.palette.background.default,
    [theme.breakpoints.up('lg')]: {
        paddingTop: TopbarHeight,
    },
    [theme.breakpoints.down('lg')]: {
        paddingTop: '64px',
    },
}));

const FullLayout = () => {
    const [cookies, setCookie] = useCookies([]);
    const dispatch = useDispatch();
    const sessionCookie = !!cookies['AUTH-SESSION']
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const customizer = useSelector((state) => state.CustomizerReducer);
    const snackBar = useSelector((state) => state.SnackBar);
    const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
    const location = useLocation()

    useEffect(() => {
        const expires = new Date(Date.now() + 1000 * 60 * 60)
        if (!sessionCookie) {
            dispatch({
                type: LOGOUT,
            })
        } else {
            // eslint-disable-next-line object-shorthand
            setCookie('AUTH-SESSION', 'true', { path: '/', expires: expires })
        }
    }, [location])

    useEffect(() => {
        if (snackBar.message !== '' && !snackBar.open) {
            setTimeout(() => {
                dispatch({
                    type: SHOW_SNACKBAR,
                })
            }, 400)
        } else if (snackBar.open) {
            setTimeout(() => {
                dispatch({
                    type: HIDE_SNACKBAR,
                    payload: ''
                })
            }, 4000)
        }
    }, [snackBar])

    return (
        <MainWrapper className={customizer.activeMode === 'dark' ? 'darkbg' : ''}>
            <Header
                sx={{
                    paddingLeft: isSidebarOpen && lgUp ? '265px' : '',
                    backgroundColor: customizer.activeMode === 'dark' ? '#20232a' : '#fafbfb',
                }}
                toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
                toggleMobileSidebar={() => setMobileSidebarOpen(true)}
            />

            <Sidebar
                isSidebardir={customizer.activeDir === 'ltr' ? 'left' : 'right'}
                isSidebarOpen={isSidebarOpen}
                isMobileSidebarOpen={isMobileSidebarOpen}
                onSidebarClose={() => setMobileSidebarOpen(false)}
            />

            <PageWrapper>
                <Container
                    maxWidth={false}
                    sx={{
                        padding: '0px !important',
                        paddingLeft: isSidebarOpen && lgUp ? '280px!important' : '',
                    }}
                >
                    <Box sx={{ minHeight: 'calc(100vh - 170px)' }}>
                        <Outlet />
                    </Box>
                    <Customizer />
                    <Footer />
                </Container>
            </PageWrapper>
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={snackBar.open}
                // onClose={handleClose}
                autoHideDuration={5000}
            // key={vertical + horizontal}
            >
                <Alert variant="filled" severity={snackBar.error ? 'error' : 'success'}>{snackBar.message}</Alert>
            </Snackbar>
        </MainWrapper>
    );
};

export default FullLayout;
