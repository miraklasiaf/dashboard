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

export const getFiles = () => {
  return http.get("/files");
};

export const deleteFile = (fileName) => {
    let endpoint = "/files/" + fileName
    return http.delete(endpoint);
};