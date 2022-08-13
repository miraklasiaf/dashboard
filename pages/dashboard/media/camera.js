import { useEffect, useState, useRef } from "react";
import Camera from "../../../services/Camera";
import { getImageSize } from "../../../utils/image";

import { Button, Center } from '@chakra-ui/react'
import { Grid, GridItem } from '@chakra-ui/react'

import { uploadFileSimple } from "../../../services/FileuploadService";

import React from "react";

import Router from 'next/router'

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from '@chakra-ui/react'

const colorScheme = [
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "cyan",
  "purple"
];

export default function CameraApp() {
  const [isUseCamera, setUseCamera] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [result, setResult] = useState(null);
  const refPhoto = useRef(null);
  const refCanvas = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 100 });
  const [imageSize, setImageSize] = useState({ width: 300, height: 100 });
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = React.useRef()

  useEffect(() => {
    if (refPhoto?.current) {
      const { offsetWidth, offsetHeight } = refPhoto.current;
      setCanvasSize({ width: offsetWidth, height: offsetHeight });
    }
  }, [photo]);

  const drawBox = ({ ctx, x, y, width, height, color }) => {
    ctx.beginPath();
    ctx.lineWidth = "2";
    ctx.rect(x, y, width, height);
    ctx.strokeStyle = color;
    ctx.stroke();
  };

  useEffect(() => {
    if (result) {
      const canvas = refCanvas.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
      const { detected_objects } = result;
      const resolutionMultiply = canvasSize.width / imageSize.width;
      detected_objects.forEach((object, i) => {
        const { bottom, left, right, top } = object.bounding_box;
        const x = left * resolutionMultiply;
        const y = top * resolutionMultiply;
        const width = (right - left) * resolutionMultiply;
        const height = (bottom - top) * resolutionMultiply;
        drawBox({ ctx, x, y, width, height, color: colorScheme[i] });
      });
    }
  }, [result, canvasSize, imageSize]);

  const handleTakePhoto = async (dataUri) => {
    if (dataUri) {
      setPhoto(dataUri);
      const imageSize = await getImageSize(dataUri);
      setImageSize(imageSize);
      setUseCamera(false);
    }
  };


  const handleResetPhoto = () => {
    setPhoto(false);
    setResult(null);
    const canvas = refCanvas.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 300, 100);
  };


  const handleSavePhoto = async () => {
    const blob = await (await fetch(photo)).blob()
    const fileName = new Date().getTime() + ".jpg";
    const file = new File([blob], fileName, {type:"image/jpeg", lastModified:new Date()});
    try 
      {
        const result = uploadFileSimple(file);
        console.log(result);
        onOpen();
      }
      catch (error) {
        console.log(error);
      }
  };


  const TakeAnotherPhoto = () => {
    onClose();
    handleResetPhoto();
    setUseCamera(true);
  }

  const GoToMedia = () => {
    onClose();
    Router.push('/dashboard/media');
  }

  const DisregardPhoto = () => {
    handleResetPhoto();
    setUseCamera(true);
  }

  const ExitCancel = () => {
    Router.push('/dashboard/media');
  }


  return (
    <div>
      <div>
        {/* CANVAS */}

        <div>
          <img ref={refPhoto} src={photo} width="1000" />
          <canvas
            ref={refCanvas}
            width="1000"
          />
        </div>

        {!photo &&
          (isUseCamera ? (
            <Camera onTakePhoto={handleTakePhoto} />
          ) : (
            <div>        

              <Center>
                <Button align='center' size='lg'
                  onClick={() => setUseCamera(true)}
                >
                  Click to activate Camera
                </Button>
              </Center>



            </div>
          ))}
      </div>


      <br />

      {photo && (
        <div>
          <Grid templateColumns='repeat(5, 1fr)' gap={1} >
            <GridItem> 
              <Button onClick={DisregardPhoto}>
                Try Again
              </Button> 
            </GridItem>
            <GridItem> 
              <Button onClick={handleSavePhoto}>
              Save photo
              </Button>
            </GridItem>
          </Grid>


      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Photo Saved!
            </AlertDialogHeader>

            <AlertDialogBody>
              You will now see the photo in your files...
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button onClick={GoToMedia}>
                Go to media
              </Button>
              <Button colorScheme='red' onClick={TakeAnotherPhoto} ml={3}>
                Take another
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>


        </div>
      )}



      {isUseCamera && (
        <Button className="bg-gray-200 p-2" onClick={ExitCancel}>
          Cancel camera
        </Button>
      )}






    </div>
  );
}
