import React from "react";
import Camera from "react-html5-camera-photo";
import "react-html5-camera-photo/build/css/index.css";

export default ({ onTakePhoto }) => {
  return (
    <Camera onTakePhoto={onTakePhoto} isMaxResolution={true} sizeFactor={0.5} />
  );
};
