import React from "react";
import { useEffect, useState } from "react";
import { Button, Grid, GridItem } from "@chakra-ui/react";

import Router from 'next/router'
import { useAuthUserContext } from '../../../context/AuthUserContext';

import { ref, getDownloadURL, uploadBytesResumable, uploadString } from "firebase/storage";

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from '@chakra-ui/react'

import { Progress, Textarea } from '@chakra-ui/react'

export default function TextCapture() {

    const { authUser, loading, storage } = useAuthUserContext();

    const [textURL, setTextURL] = useState("");
    const [textBlobTxt, setTextBlobTxt] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure()
    const cancelRef = React.useRef()
    const [progresspercent, setProgresspercent] = useState(0);
    const [uploadFileName, setUploadFileName] = useState(null);
    const [textInput, setTextInput] = useState(null);
    const [firebaseUrl, setFirebaseUrl] = useState(null);

    useEffect(() => {
      if (loading) return;
      if (!authUser) {Router.push('/connect/login')};
    }, [authUser, loading]);  


    const saveText = async () => {
        console.log('textInput: ', textInput);
        const fileName = new Date().getTime() + ".txt";
        setUploadFileName(fileName);
        const file = new File([textInput], fileName, { type : 'text/plain' });
        setTextURL(URL.createObjectURL(file));
        const storageRef = ref(storage, `user/${authUser?.uid}/${uploadFileName}`);
        const uploadTask = uploadBytesResumable(storageRef, file);
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
    }

    const clearText = () => {
        setTextInput(null);
        document.getElementById("textInputBox").value = "";
    }


    // // Obtain the audio when ready.
    // const handleData = e => {
    //     setAudioURL(URL.createObjectURL(e.data));
    //     const fileName = new Date().getTime() + ".txt";
    //     setUploadFileName(fileName);
    //     setAudioBlobWav(new File([e.data], fileName, { type : 'text/plain' }));
    //   const storageRef = ref(storage, `user/${authUser?.uid}/${uploadFileName}`);
    //   const uploadTask = uploadBytesResumable(storageRef, audioBlobWav);
    //   uploadTask.on("state_changed",
    //   (snapshot) => {
    //     const progress =
    //       Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
    //     setProgresspercent(progress);
    //   },
    //   (error) => {
    //     alert(error);
    //   },
    //   () => {
    //     getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
    //       setFirebaseUrl(downloadURL)
    //     });
    //   }
    // );
    // onOpen();
    //     };
    

    
    // const saveAudioFirebase = async () => {
    //   const storageRef = ref(storage, `user/${authUser?.uid}/${uploadFileName}`);
    //   const uploadTask = uploadBytesResumable(storageRef, audioBlobWav);
    //   uploadTask.on("state_changed",
    //   (snapshot) => {
    //     const progress =
    //       Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
    //     setProgresspercent(progress);
    //   },
    //   (error) => {
    //     alert(error);
    //   },
    //   () => {
    //     getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
    //       setFirebaseUrl(downloadURL)
    //     });
    //   }
    // );
    // onOpen();
    // };



    const GoToMedia = () => {
        onClose();
        Router.push('/dashboard/media');
      }

    const TakeAnotherText = () => {
        setTextURL("");
        setFirebaseUrl(null);
        onClose();
    }

    const backToMedia = () => {
        onClose();
        Router.push('/dashboard/media');
    }
    
  return (
    <div>


      <Textarea 
        placeholder='Enter your text here...' 
        onChange={(e) => setTextInput(e.target.value)}
        value={textInput}
        id='textInputBox'
      />

        <Grid templateColumns='repeat(5, 1fr)' gap={1} mt='5' mb='5' >
            <GridItem>
                <Button onClick={saveText} disabled={!textInput}> 
                    save text
                </Button>
            </GridItem>
            <GridItem>
                <Button onClick={clearText} disabled={!textInput}>
                    clear text
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
                Text Saved!
                </AlertDialogHeader>

                <AlertDialogBody>
                You will now see the text in your files...
                </AlertDialogBody>

                <AlertDialogFooter>
                <Button onClick={GoToMedia}>
                    Go to media
                </Button>
                <Button colorScheme='red' onClick={TakeAnotherText} ml={3}>
                    Take another text sample
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