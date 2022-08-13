import React from "react";
import { useEffect, useState } from "react";
import { Button, Grid, GridItem } from "@chakra-ui/react";
import { uploadFileSimple } from "../../../services/FileuploadService";

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


export default function AudioCapture() {

    const [audioURL, setAudioURL] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [recorder, setRecorder] = useState(null);
    const [audioBlobWav, setAudioBlobWav] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure()
    const cancelRef = React.useRef()


    useEffect(() => {
        // Lazily obtain recorder first time we're recording.
        if (recorder === null) {
          if (isRecording) {
            requestRecorder().then(setRecorder, console.error);
          }
          return;
        }
    
        // Manage recorder state.
        if (isRecording) {
          recorder.start();
        } else {
          recorder.stop();
        }
    
        // Obtain the audio when ready.
        const handleData = e => {
          setAudioURL(URL.createObjectURL(e.data));
          // get date+time
          const fileName = new Date().getTime() + ".wav";
          setAudioBlobWav(new File([e.data], fileName, { type : 'audio/wav; codecs=0' }));
        };
    
        recorder.addEventListener("dataavailable", handleData);
        return () => recorder.removeEventListener("dataavailable", handleData);
      }, [recorder, isRecording]);

    
    async function requestRecorder() {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        return new MediaRecorder(stream);
      }
    
    
    const saveAudio = async () => {
    try 
        {
            const result = await uploadFileSimple(audioBlobWav);
            console.log(result);
            onOpen();
        }
            catch (error) {
            console.log(error);
        }
    };
    
    
    const startRecording = () => {
        setIsRecording(true);
    };

    const stopRecording = () => {
        setIsRecording(false);
    };

    const GoToMedia = () => {
        onClose();
        Router.push('/dashboard/uploader');
      }

    const TakeAnotherAudio = () => {
        setAudioURL("");
        onClose();
    }

    const backToMedia = () => {
        onClose();
        Router.push('/dashboard/uploader');
    }
    
  return (
    <div>

      <audio src={audioURL} controls />

        <Grid templateColumns='repeat(5, 1fr)' gap={1} mt='5' mb='5' >
            <GridItem> 
                <Button onClick={startRecording} disabled={isRecording}>
                    start recording
                </Button>
            </GridItem>
            <GridItem> 
                <Button onClick={stopRecording} disabled={!isRecording}>
                    stop recording
                </Button>
            </GridItem>
            <GridItem>
                <Button onClick={saveAudio} disabled={!audioURL}> 
                    save recording
                </Button>
            </GridItem>
            <GridItem>
                <Button onClick={backToMedia}>
                    Back
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
                Audio Saved!
                </AlertDialogHeader>

                <AlertDialogBody>
                You will now see the audio in your files...
                </AlertDialogBody>

                <AlertDialogFooter>
                <Button onClick={GoToMedia}>
                    Go to media
                </Button>
                <Button colorScheme='red' onClick={TakeAnotherAudio} ml={3}>
                    Take another audio sample
                </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>




    </div>
  );

}