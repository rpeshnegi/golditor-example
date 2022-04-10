/* eslint-disable func-names */
/*
Copyright 2015 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import MediaUploader from './cors_upload';


// var signinCallback = function (result) {
//     if (result.access_token) {
//         var uploadVideo = new UploadVideo();
//         uploadVideo.ready(result.access_token);
//     }
// };

// var STATUS_POLLING_INTERVAL_MILLIS = 60 * 1000; // One minute.
const STATUS_POLLING_INTERVAL_MILLIS = 20000; // 20 sec.


/**
 * YouTube video uploader class
 *
 * @constructor
 */
const UploadVideo = function () {
    /**
     * The array of tags for the new YouTube video.
     *
     * @attribute tags
     * @type Array.<string>
     * @default ['google-cors-upload']
     */
    this.tags = ['youtube-cors-upload'];

    /**
     * The numeric YouTube
     * [category id](https://developers.google.com/apis-explorer/#p/youtube/v3/youtube.videoCategories.list?part=snippet&regionCode=us).
     *
     * @attribute categoryId
     * @type number
     * @default 22
     */
    this.categoryId = 22;

    /**
     * The id of the new video.
     *
     * @attribute videoId
     * @type string
     * @default ''
     */
    this.videoId = '';

    this.uploadStartTime = 0;

    // eslint-disable-next-line no-unused-expressions
    this.setPollVideoStatus;
};


UploadVideo.prototype.ready = async function (accessToken, cb) {
    this.accessToken = accessToken;
    this.gapi = window.gapi
    this.authenticated = true;
    this.gapi.client.request({
        path: '/youtube/v3/channels',
        params: {
            part: 'snippet',
            mine: true
        },
        callback: function (response) {
            cb(response);
            // eslint-disable-next-line no-extra-bind
        }.bind(this)
    });
    // $('#button').on("click", this.handleUploadClicked.bind(this));
};

/**
 * Uploads a video file to YouTube.
 *
 * @method uploadFile
 * @param {object} file File object corresponding to the video to upload.
 */
UploadVideo.prototype.uploadFile = function (file, values, setProgress, setPollVideoStatus) {
    this.setPollVideoStatus = setPollVideoStatus
    const metadata = {
        snippet: {
            title: values.title,
            description: values.description,
            tags: this.tags,
            categoryId: this.categoryId,
            channelId: values.channelId
        },
        status: {
            privacyStatus: values['privacy-status']
        }
    };
    const uploader = new MediaUploader({
        baseUrl: 'https://www.googleapis.com/upload/youtube/v3/videos',
        file,
        token: this.accessToken,
        metadata,
        params: {
            part: Object.keys(metadata).join(',')
        },
        onError: function (data) {
            let message = data;
            // Assuming the error is raised by the YouTube API, data will be
            // a JSON string with error.message set. That may not be the
            // only time onError will be raised, though.
            try {
                const errorResponse = JSON.parse(data);
                message = errorResponse.error.message;
            } finally {
                alert(message);
            }
            // eslint-disable-next-line no-extra-bind
        }.bind(this),
        onProgress: function (data) {
            const bytesUploaded = data.loaded;
            const totalBytes = data.total;
            // eslint-disable-next-line radix
            const percentageComplete = parseInt((bytesUploaded * 100) / totalBytes);
            setProgress(percentageComplete)
            // eslint-disable-next-line no-extra-bind
        }.bind(this),
        onComplete: function (data) {
            const uploadResponse = JSON.parse(data);
            this.videoId = uploadResponse.id;
            this.pollForVideoStatus();
        }.bind(this)
    });
    // This won't correspond to the *exact* start of the upload, but it should be close enough.
    this.uploadStartTime = Date.now();
    uploader.upload();
};

UploadVideo.prototype.pollForVideoStatus = function () {
    this.gapi.client.request({
        path: '/youtube/v3/videos',
        params: {
            part: 'status,player,snippet',
            id: this.videoId
        },
        callback: function (response) {
            if (response.error) {
                // The status polling failed.
                console.log(response.error.message);
                setTimeout(this.pollForVideoStatus.bind(this), STATUS_POLLING_INTERVAL_MILLIS);
            } else {
                let uploadStatus;
                if (response.items.length > 0) {
                    uploadStatus = response.items[0].status.uploadStatus;
                    this.setPollVideoStatus(response.items[0])
                }

                switch (uploadStatus) {
                    // This is a non-final status, so we need to poll again.
                    case 'uploaded':
                        setTimeout(this.pollForVideoStatus.bind(this), STATUS_POLLING_INTERVAL_MILLIS);
                        break;
                    // The video was successfully transcoded and is available.
                    case 'processed':
                        break;
                    // All other statuses indicate a permanent transcoding failure.
                    default:
                        break;
                }
            }
        }.bind(this)
    });
};

UploadVideo.prototype.updateVideo = function (data, cb) {
    window.gapi.client.request({
        path: '/youtube/v3/videos',
        'method': 'PUT',
        params: {
            part: 'snippet,status',
        },
        body: data,
        callback: (response) => {
            cb(response)
        }
    })
}


/**
 * Uploads a thumbnail file to YouTube.
 *
 * @method setThumbnails
 * @param {object} file File object corresponding to the video to upload.
 */
UploadVideo.prototype.setThumbnails = function (youtubeData, file, cb) {

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${youtubeData.id}`, true);
    xhr.setRequestHeader('Authorization', `Bearer ${this.accessToken}`);
    xhr.setRequestHeader('Content-Type', file.type);
    // xhr.setRequestHeader('Content-Range', `bytes ${this.offset}-${end - 1}/${this.file.size}`);
    xhr.setRequestHeader('X-Upload-Content-Type', file.type);
    if (xhr.upload) {
        // xhr.upload.addEventListener('progress', this.onProgress);
    }
    xhr.onload = (e) => {
        console.log(e)
        cb(e)
    };
    xhr.onerror = (e) => {
        console.log(e)
    };;
    xhr.send(file);

    // const metadata = {
    //     videoId: youtubeData.id
    // };
    // const uploader = new MediaUploader({
    //     baseUrl: 'https://www.googleapis.com/upload/youtube/v3/thumbnails/set',
    //     file,
    //     token: this.accessToken,
    //     metadata,
    //     params: {
    //         part: Object.keys(metadata).join(',')
    //     },
    //     onError: (data) => {
    //         let message = data;
    //         try {
    //             const errorResponse = JSON.parse(data);
    //             message = errorResponse.error.message;
    //         } finally {
    //             alert(message);
    //         }
    //         // eslint-disable-next-line no-extra-bind
    //     },
    //     // eslint-disable-next-line no-extra-bind
    //     onProgress: function () { }.bind(this),
    //     onComplete: (data) => {
    //         const uploadResponse = JSON.parse(data);
    //         cb(uploadResponse)
    //     }
    // });
    // uploader.sendPreview();
};

export default UploadVideo