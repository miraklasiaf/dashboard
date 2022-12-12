import React from "react";
import { useEffect, useState } from "react";
import { Button, Grid, GridItem, Heading } from "@chakra-ui/react";

import Router from 'next/router'
import { useAuthUserContext } from '../../../../../context/AuthUserContext';

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

import { getLayout } from '@/layouts/dashboard';


function VoiceList() {

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
    const [simpleList, setSimpleList] = useState(null);

    const [hasBegun, setHasBegun] = useState(false);
    const [assessmentItem, setAssessmentItem] = useState(null);

    const [queryList, setQueryList] = useState(null);

    const [q1, setQ1] = useState(null);
    const [q2, setQ2] = useState(null);
    const [q3, setQ3] = useState(null);
    const [q4, setQ4] = useState(null);
    const [q5, setQ5] = useState(null);
    const [q6, setQ6] = useState(null);
    const [q7, setQ7] = useState(null);
    const [q8, setQ8] = useState(null);
    const [q9, setQ9] = useState(null);
    const [q10, setQ10] = useState(null);
    const [q11, setQ11] = useState(null);

    const retrieveSimple = async () => {
      const simpleData = await fetch('https://server.appliedhealthinformatics.com/sentances/list/' + Router.query.list)
      .then(response => response.json())
      // catch error
      .catch(error => console.log(error))
      .then(data => {
        console.log('data retrieved: ', data);
        setSimpleList(data);
      });
      console.log({'simpleData': simpleData})
      setQueryList('list' + Router.query.list);
    }

    useEffect(() => {
      if (loading) return;
      if (!authUser) {Router.push('/connect/login')};
      retrieveSimple();

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
          const fileName2 = assessmentItem + "_" + fileName;
          setUploadFileName(fileName2);
          setAudioBlobWav(new File([e.data], fileName2, { type : 'audio/wav; codecs=0' }));
        };
    
        recorder.addEventListener("dataavailable", handleData);
        return () => recorder.removeEventListener("dataavailable", handleData);
      }, [recorder, isRecording]);

    
    async function requestRecorder() {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        return new MediaRecorder(stream);
      }
    

    const saveAudioFirebase = () => {
      const storageRef = ref(storage, `user/${authUser?.uid}/voice/${uploadFileName}`);
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
      async () => {
        await getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFirebaseUrl(downloadURL)
          onOpen();
        });
      }
    );
    };


    const resetButton = () => {
      setHasBegun(false);
      setAssessmentItem(null);
      setAudioURL(null);
      setFirebaseUrl(null);
      setSimpleList(null);
      onClose();
    }

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

    const GoToSimpleProcess = () => {
      Router.push('/dashboard/create/voice/process/simple')
    }

    const hasBegunShort = async () => {
        setHasBegun(true);
        setAssessmentItem(queryList + '-q1');
        setQ1({'sentance': simpleList?.[0]?.sentance, 'id': simpleList?.[0]?.id, userFieldName: simpleList?.[0]?.userFieldName});
        setQ2({'sentance': simpleList?.[1]?.sentance, 'id': simpleList?.[1]?.id, userFieldName: simpleList?.[1]?.userFieldName});
        setQ3({'sentance': simpleList?.[2]?.sentance, 'id': simpleList?.[2]?.id, userFieldName: simpleList?.[2]?.userFieldName});
        setQ4({'sentance': simpleList?.[3]?.sentance, 'id': simpleList?.[3]?.id, userFieldName: simpleList?.[3]?.userFieldName});
        setQ5({'sentance': simpleList?.[4]?.sentance, 'id': simpleList?.[4]?.id, userFieldName: simpleList?.[4]?.userFieldName});
        setQ6({'sentance': simpleList?.[5]?.sentance, 'id': simpleList?.[5]?.id, userFieldName: simpleList?.[5]?.userFieldName});
        setQ7({'sentance': simpleList?.[6]?.sentance, 'id': simpleList?.[6]?.id, userFieldName: simpleList?.[6]?.userFieldName});
        setQ8({'sentance': simpleList?.[7]?.sentance, 'id': simpleList?.[7]?.id, userFieldName: simpleList?.[7]?.userFieldName});
        setQ9({'sentance': simpleList?.[8]?.sentance, 'id': simpleList?.[8]?.id, userFieldName: simpleList?.[8]?.userFieldName});
        setQ10({'sentance': simpleList?.[9]?.sentance, 'id': simpleList?.[9]?.id, userFieldName: simpleList?.[9]?.userFieldName});
        setQ11({'id': 'complete'});
    }


  const AudioRecorderCustom = ({starRecordValue, nextItemId, nextItemName}) => {

    console.log('starRecordValue: ', starRecordValue);
    console.log('nextItemId: ', nextItemId);
    console.log('nextItemName: ', nextItemName);
    return(
      <div>
        <br />
        <audio src={audioURL} controls />
        <Grid templateColumns='repeat(5, 1fr)' gap={1} mt='5' mb='5' >
            <GridItem> 
                <Button onClick={startRecording} disabled={isRecording}>
                    start {starRecordValue} recording
                </Button>
            </GridItem>
            <GridItem> 
                <Button onClick={stopRecording} disabled={!isRecording}>
                    stop {starRecordValue} recording
                </Button>
            </GridItem>
            <GridItem>
                <Button onClick={saveAudioFirebase} disabled={!audioURL}> 
                    save {starRecordValue} recording
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
                  {starRecordValue} Audio Saved!
                </AlertDialogHeader>
                <AlertDialogBody>
                  You will now see the audio in your files...
                </AlertDialogBody>
                <AlertDialogFooter>
                  <Button colorScheme='red' onClick={() => (setAssessmentItem(nextItemId), TakeAnotherAudio()) } ml={3}>
                    Proceed to {nextItemName}
                  </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>

      </div>
    )
  }



  const assessmentItemlogic = () => {
    if (assessmentItem === queryList + '-q1') {
      return (
        <div>
          <strong> Sentance: </strong>
          <p> {q1?.sentance} </p>
          <AudioRecorderCustom starRecordValue={q1.userFieldName} nextItemId={q2.id} nextItemName={q2.userFieldName} />
        </div>
      )
    } else if (assessmentItem === queryList + '-q2') {
      return (
        <div>
          <strong> Sentance: </strong>
          <p>{q2?.sentance}</p>
          <AudioRecorderCustom starRecordValue={q2.userFieldName} nextItemId={q3.id} nextItemName={q3.userFieldName} />
        </div>
      )
    } else if (assessmentItem === queryList + '-q3') {
      return (
        <div>
          <strong> Sentance: </strong>
          <p>{q3?.sentance}</p>
          <AudioRecorderCustom starRecordValue={q3.userFieldName} nextItemId={q4.id} nextItemName={q4.userFieldName} />
        </div>
      )
    } else if (assessmentItem === queryList + '-q4') {
      return (
        <div>
          <strong> Sentance: </strong>
          <p>{q4?.sentance}</p>
          <AudioRecorderCustom starRecordValue={q4.userFieldName} nextItemId={q5.id} nextItemName={q5.userFieldName} />
        </div>
      )
    } else if (assessmentItem === queryList + '-q5') {
      return (
        <div>
          <strong> Sentance: </strong>
          <p>{q5?.sentance}</p>
          <AudioRecorderCustom starRecordValue={q5.userFieldName} nextItemId={q6.id} nextItemName={q6.userFieldName} />
        </div>
      )
    } else if (assessmentItem === queryList + '-q6') {
      return (
        <div>
          <strong> Sentance: </strong>
          <p>{q6?.sentance}</p>
          <AudioRecorderCustom starRecordValue={q6.userFieldName} nextItemId={q7.id} nextItemName={q7.userFieldName} />
        </div>
      )
    } else if (assessmentItem === queryList + '-q7') {
      return (
        <div>
          <strong> Sentance: </strong>
          <p>{q7?.sentance}</p>
          <AudioRecorderCustom starRecordValue={q7.userFieldName} nextItemId={q8.id} nextItemName={q8.userFieldName} />
        </div>
      )
    } else if (assessmentItem === queryList + '-q8') {
      return (
        <div>
          <strong> Sentance: </strong>
          <p>{q8?.sentance}</p>
          <AudioRecorderCustom starRecordValue={q8.userFieldName} nextItemId={q9.id} nextItemName={q9.userFieldName} />
        </div>
      )
    } else if (assessmentItem === queryList + '-q9') {
      return (
        <div>
          <strong> Sentance: </strong>
          <p>{q9?.sentance}</p>
          <AudioRecorderCustom starRecordValue={q9.userFieldName} nextItemId={q10.id} nextItemName={q10.userFieldName} />
        </div>
      )
    } else if (assessmentItem === queryList + '-q10') {
      return (
        <div>
          <strong> Sentance: </strong>
          <p>{q10?.sentance}</p>
          <AudioRecorderCustom starRecordValue={q10.userFieldName} nextItemId={q11.id} nextItemName='Completed!' />
        </div>
      )
    } else if (assessmentItem === 'complete') {
      return (
        <div>
          <strong> You have completed the simple recordings list! </strong>
          <br />
          <Button onClick={GoToSimpleProcess}> Begin to process your voice! </Button>
        </div>
      )
    } 
  }

    
  return (
    <div>

      {simpleList && !hasBegun && (
        <div>
        <Heading as='h4' size='md' mb='5' mt='5'> Sentances that will be recorded in this module: </Heading>
        <table>
          <thead>
            <tr>
              <th> </th>
            </tr>
          </thead>
          <tbody>
            {simpleList && simpleList.map((item, index) => (
              <tr key={index}>
                <td>{item.sentance}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        )
      }

      <br />


      {simpleList && !hasBegun && (
        <div>
          <Button onClick={hasBegunShort}>Start new recording set!</Button>
        </div>
        
      )}

      <br />


      {hasBegun && (
        assessmentItemlogic()
      )}






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


      <br />

      {hasBegun && (
        <Button onClick={resetButton}> 
          Reset
        </Button>
      )}

      <br />




    </div>
  );

}



VoiceList.getLayout = getLayout;
export default VoiceList;