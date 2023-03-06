import http from "./Http-common";

export const uploadFile = (file, onUploadProgress) => {
  let formData = new FormData();
  formData.append("file", file);
  return http.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
  });
};

export const uploadFileSimple = (file) => {
  let formData = new FormData();
  formData.append("file", file);
  return http.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getFiles = () => {
  return http.get("/files");
};

export const getFilesProcessed = () => {
  return http.get("/files/processed");
};

export const getFileSingle = (fileName) => {
  let endpoint = "/files/" + fileName;
  return http.get(endpoint);
};

export const deleteFile = (fileName) => {
    let endpoint = "/files/" + fileName
    return http.delete(endpoint);
};



