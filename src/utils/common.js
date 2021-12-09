import axiosInstance from "./axios";

export const convertToFormData = (values) => {
    const body = new FormData();
    Object.keys(values).forEach(key => {
        if (typeof values[key] === 'object') {
            Object.keys(values[key]).forEach(objectKey => {
                body.append(`${key}[${objectKey}]`, values[key][objectKey]);
            })
        } else {
            body.append(key, values[key]);
        }
    })
    return body
}

export const deleteRecord = async (id) => {
    try {
        return axiosInstance.delete(`/wp/v2/media/${id}`, { data: { id, force: true } })
    } catch (error) {
        return error
    }
}

export const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    // eslint-disable-next-line prefer-template
    return parseFloat((bytes / (k ** i)).toFixed(dm)) + ' ' + sizes[i];
}