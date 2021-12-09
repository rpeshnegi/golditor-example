/* eslint-disable no-unused-vars */
import axiosInstance from './axios';

const reader = new FileReader();
let file = {};
let post = null;
let chunksProgress = 0;
let requestExtraSize = 0;
const sliceSize = 10000 * 1024;
const callBack = {}
const fileSliceArray = []

const uploadComplete = (filePath) => {
    const url = `/custom_api/chunks_complete?file=${encodeURIComponent(filePath)}${post ? `&post=${post}` : ''}`
    axiosInstance.get(url).then((response) => {
        // console.log(response)
        callBack.completeCB(response)
    }).catch((error) => {
        console.log(error);
    })
}

const uploadFile = (sliceArrIndex, filePath) => {
    const blob = fileSliceArray[sliceArrIndex];
    const nextsliceArrIndex = sliceArrIndex + 1
    let lastProgress = 0;

    reader.onloadend = (event) => {
        if (event.target.readyState !== FileReader.DONE) {
            return;
        }
        const body = {
            file_data: event.target.result,
            file: file.name,
            file_type: file.type,
            file_path: filePath,
        }
        axiosInstance.post('/custom_api/chunks_upload', body, {
            onUploadProgress: data => {
                chunksProgress += data.loaded - lastProgress
                lastProgress = data.loaded

                let percentDone = Math.floor((chunksProgress / (file.size + requestExtraSize)) * 100); // 764515/177180 extra request size
                if (percentDone <= 100) {
                    if (data.loaded > 0 && percentDone === 0) percentDone = 1
                    callBack.progressCB(percentDone)
                }
            },
        }).then((response) => {

            if (nextsliceArrIndex < fileSliceArray.length) {
                // Update upload progress
                // callBack.progressCB(percentDone)

                // More to upload, call function recursively
                uploadFile(nextsliceArrIndex, response.data.data.file_path);
            } else {
                // Update upload progress
                console.log('Upload Complete!')
                callBack.progressCB(100)

                uploadComplete(response.data.data.file_path)
            }
        }).catch((error) => {
            console.log(error);
            callBack.errorCB()
        })
    };

    reader.readAsDataURL(blob);
}

const makeSlices = (filePath) => {
    let i = 0
    let start = 0
    let end = 0
    do {
        end = start + sliceSize + 1;
        fileSliceArray[i] = file.slice(start, end);

        // calculate extra request bytes
        const extraSize = (764515 / 2292858) * fileSliceArray[i].size
        requestExtraSize += extraSize
        start = end
        i++
    }
    while (end < file.size);
    uploadFile(0, filePath);
}

const uploadInIt = () => {

    axiosInstance.get(`/custom_api/init_chunks_upload?file_name=${file.name}`).then((response) => {
        // console.log(response)
        makeSlices(response.data.data.file_path)
        // uploadFile(0, response.data.data.file_path);
    }).catch((error) => {
        console.log(error);
    })

}

/**
 * 
 * @param {*} uploadData 
 * @param {*} progressCB 
 * @param {*} completeCB 
 */
const ChunksUpload = (uploadData, progressCB, completeCB, errorCB) => {
    file = uploadData.file
    post = uploadData.post || null
    chunksProgress = 0
    callBack.progressCB = progressCB
    callBack.completeCB = completeCB
    callBack.errorCB = errorCB
    uploadInIt();
}

export default ChunksUpload