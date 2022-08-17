import React from "react";
import { useEffect, useState } from "react";
import { Button, Grid, GridItem } from "@chakra-ui/react";

import Router from 'next/router'
import { useAuthUserContext } from '../../../context/AuthUserContext';

import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from '@chakra-ui/react'

import { Progress } from '@chakra-ui/react'

export default function AudioCapture() {

    const { authUser, loading, storage } = useAuthUserContext();

    const [audioURL, setAudioURL] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [recorder, setRecorder] = useState(null);
    const [audioBlobWav, setAudioBlobWav] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure()
    const cancelRef = React.useRef()
    const [progresspercent, setProgresspercent] = useState(0);
    const [uploadFileName, setUploadFileName] = useState(null);

    const [firebaseUrl, setFirebaseUrl] = useState(null);

    useEffect(() => {
      if (loading) return;
      if (!authUser) {Router.push('/connect/login')};
    }, [authUser, loading]);  

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
          setUploadFileName(fileName);
          setAudioBlobWav(new File([e.data], fileName, { type : 'audio/wav; codecs=0' }));
        };
    
        recorder.addEventListener("dataavailable", handleData);
        return () => recorder.removeEventListener("dataavailable", handleData);
      }, [recorder, isRecording]);

    
    async function requestRecorder() {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        return new MediaRecorder(stream);
      }
    
    // // this is saving locally 
    // const saveAudio = async () => {
    // try 
    //     {
    //         const result = await uploadFileSimple(audioBlobWav);
    //         console.log(result);
    //         onOpen();
    //     }
    //         catch (error) {
    //         console.log(error);
    //     }
    // };
    
    const saveAudioFirebase = async () => {
      const storageRef = ref(storage, `user/${authUser?.uid}/${uploadFileName}`);
      const uploadTask = uploadBytesResumable(storageRef, audioBlobWav);
      uploadTask.on("state_changed",
      (snapshot) => {
        const progress =
          Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgresspercent(progress);
      },
      (error) => {
        alert(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFirebaseUrl(downloadURL)
        });
      }
    );
    onOpen();
    };


    const startRecording = () => {
        setIsRecording(true);
    };

    const stopRecording = () => {
        setIsRecording(false);
    };

    const GoToMedia = () => {
        onClose();
        Router.push('/dashboard/media');
      }

    const TakeAnotherAudio = () => {
        setAudioURL("");
        setFirebaseUrl(null);
        onClose();
    }

    const backToMedia = () => {
        onClose();
        Router.push('/dashboard/media');
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
                <Button onClick={saveAudioFirebase} disabled={!audioURL}> 
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



      {
        firebaseUrl &&
          <div>
            <Progress
                value={progresspercent}
                size="xs"
                aria-valuenow={progresspercent}
                colorScheme='pink'
            />
            {progresspercent}%
          </div>
      }

      {
        firebaseUrl &&
        <p> Uploaded file link: {firebaseUrl} </p>
      }







    </div>
  );

}