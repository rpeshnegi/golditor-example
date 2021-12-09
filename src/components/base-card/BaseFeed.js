import React from 'react';
import { Card, CardContent, Avatar, Typography, Checkbox, Box, Tooltip } from '@material-ui/core';
import PropTypes from 'prop-types';
import Favorite from '@material-ui/icons/Favorite';
import FavoriteBorder from '@material-ui/icons/FavoriteBorder';
import BookmarkBorderIcon from '@material-ui/icons/BookmarkBorder';
import BookmarkIcon from '@material-ui/icons/Bookmark';
import CommentIcon from '@material-ui/icons/Comment';
import ShareIcon from '@material-ui/icons/Share';

const BaseFeed = ({ img, username, time, children }) => {
  return (
    <Card
      sx={{
        mb: 4,
      }}
    >
      <CardContent>
        <Box
          display="flex"
          alignItems="center"
          sx={{
            mb: 3,
          }}
        >
          <Avatar
            src={img}
            sx={{
              borderRadius: '10px',
              width: '50px',
              height: '50px',
            }}
          />
          <Box
            sx={{
              ml: 2,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                whiteSpace: 'nowrap',
              }}
            >
              {username}
            </Typography>
            <Typography color="textSecondary" variant="h6" fontWeight="400">
              {time}
            </Typography>
          </Box>
        </Box>
        {children}
        <Box
          display="flex"
          alignItems="center"
          sx={{
            mt: 3,
          }}
        >
          <Tooltip title="Like">
            <Checkbox
              icon={<FavoriteBorder />}
              checkedIcon={<Favorite />}
              name="likes"
              color="error"
              size="small"
              sx={{
                mr: 1,
              }}
            />
          </Tooltip>
          <Tooltip title="Comment">
            <Checkbox
              icon={<CommentIcon />}
              checkedIcon={<CommentIcon />}
              name="share"
              color="secondary"
              size="small"
              sx={{
                mr: 1,
              }}
            />
          </Tooltip>
          <Tooltip title="Share">
            <Checkbox
              icon={<ShareIcon />}
              checkedIcon={<ShareIcon />}
              name="send"
              color="secondary"
              size="small"
              sx={{
                mr: 1,
              }}
            />
          </Tooltip>
          <Box
            sx={{
              ml: 'auto',
            }}
          >
            <Tooltip title="Saved">
              <Checkbox
                icon={<BookmarkBorderIcon />}
                checkedIcon={<BookmarkIcon />}
                name="save"
                color="default"
                size="small"
              />
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

BaseFeed.propTypes = {
  img: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
  time: PropTypes.any.isRequired,
  children: PropTypes.node.isRequired,
};

export default BaseFeed;
