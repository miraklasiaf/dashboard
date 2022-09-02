import React, { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/router';
import { useAuthUserContext } from '../../context/AuthUserContext';
import { getLayout } from '@/layouts/dashboard';
import { ref, listAll, getDownloadURL} from "firebase/storage";
import ReactAudioPlayer from 'react-audio-player';

import { Table, Thead, Tbody, Tr, Th, Td, TableContainer} from '@chakra-ui/react'
import { Tag, Badge, Box, Heading, Avatar, Flex, Grid, GridItem, Button, Select } from '@chakra-ui/react';

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from '@chakra-ui/react'

import axios from "axios";

function Create() {

  const { authUser, loading, storage } = useAuthUserContext();
  const Router = useRouter();
  const [audioFiles, setAudioFiles] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [audioToSend, setAudioToSend] = useState(null);
  const [selectedAudio, setSelectedAudio] = useState([]);
  const [imageToSend, setImageToSend] = useState([]);
  const [selectedImage, setSelectedImage] = useState([]);
  const [previewDone, setPreviewDone] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const { isOpen: isUploadOpen, onOpen: onUploadOpen, onClose: onUploadClose } = useDisclosure()


  const cancelRef = React.useRef()



  useEffect(() => {
    if (loading) return;
    if (!authUser) {Router.push('/connect/login')};
    firebaseDataretrieve();
  }, [authUser, loading]);




  const firebaseDataretrieve = () => {
    setAudioFiles([]);
    setImageFiles([]);
    listAll(ref(storage, `user/${authUser?.uid}`))
      .then(res => {
        res.items.forEach((item) => {
          getDownloadURL(item).then((url) => {
            const dataCollect = {"name": item.name, "url": url};
            if (item.name.includes(".wav") || item.name.includes(".m4a")) {
              setAudioFiles(audioFiles => [...audioFiles, dataCollect]);
            }
            if (item.name.includes(".jpg") || item.name.includes(".jpeg") || item.name.includes(".png")) {
              setImageFiles(imageFiles => [...imageFiles, dataCollect]);
            }
          }).catch(err => {
            console.log(err);
          })
        })
      }).catch(err => {
        console.log(err);
      })
  }

  const handleAudioChange = (targetValue) => {
    setSelectedAudio(targetValue);
    setPreviewDone(false);
    setAudioToSend(null);
    setImageToSend(null);
    console.log(audioToSend)
  }

  const handleImageChange = (targetValue) => {
    setSelectedImage(targetValue);
    setPreviewDone(false)
    setAudioToSend(null);
    setImageToSend(null);
    console.log(selectedImage)
  }

  const generatePreview = () => {
    setPreviewDone(true);
    gettingDataImage();
    gettingDataAudio();
  }

  const resetWindow = () => {
    setPreviewDone(false);
    setAudioToSend(null);
    setImageToSend(null);
    setSelectedAudio([]);
    setSelectedImage([]);
  }

  const gettingDataImage = () => {
    for (let i = 0; i < imageFiles.length; i++) {
      if (imageFiles[i].url === selectedImage) {
        let selectedImage_url = imageFiles[i].url;
        let selectedImage_name = imageFiles[i].name;
        setImageToSend({'url': selectedImage_url, 'name': selectedImage_name});
        console.log("imageToSend: ", {'url': selectedImage_url, 'name': selectedImage_name});
      } else {
        console.log("no matched image");
      } 
    }
  }

  const gettingDataAudio = () => {
    for (let i = 0; i < audioFiles.length; i++) {
      if (audioFiles[i].url === selectedAudio) {
        let selectedAudio_url = audioFiles[i].url;
        let selectedAudio_name = audioFiles[i].name;
        setAudioToSend({'url': selectedAudio_url, 'name': selectedAudio_name});
        console.log("audioToSend: ", {'url': selectedAudio_url, 'name': selectedAudio_name});
      } else {
        console.log("no matched audio");
      }
    }
  }
  


  const startApiCall1 = () => {

    var configPost = {
      method: 'post',
      url: 'http://localhost:5000/start-task',
      data : {
        input_string: imageToSend.name,
        user_uuid: authUser?.uid,
      },
      headers: { 
        'content-type': 'application/json',
        'accept': 'application/json',
    }}

    console.log("configPost: ", configPost);

    axios(configPost)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
      setApiResponse(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });

    onUploadOpen();

  };


  const a2hCelery = () => {

    const configPost2 = {
      method: 'post',
      url: 'http://localhost:5000/start-task/video1',
      data : {
        user_uuid: authUser?.uid,
        image_url: imageToSend.url,
        audio_url: audioToSend.url,
        image_name: imageToSend.name,
        audio_name: audioToSend.name
      },
      headers: { 
        'content-type': 'application/json',
        'accept': 'application/json',
    }}

    console.log("configPost2: ", configPost2);

    axios(configPost2)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
      setApiResponse(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });

    onUploadOpen();

  };


  const a2h_batchAws = () => {

    const configPost3 = {
      method: 'post',
      url: 'http://localhost:5000/start-task/aws-batch/video1/',
      data : {
        user_uuid: authUser?.uid,
        image_url: imageToSend.url,
        audio_url: audioToSend.url,
        image_name: imageToSend.name,
        audio_name: audioToSend.name
      },
      headers: { 
        'content-type': 'application/json',
        'accept': 'application/json',
    }}

    console.log("configPost3: ", configPost3);

    axios(configPost3)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
      setApiResponse(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });

    onUploadOpen();

  };


  const a2h_lambda = () => {

    // check this out for dummy secure, simple additional header 
    // https://aws.amazon.com/blogs/aws/announcing-aws-lambda-function-urls-built-in-https-endpoints-for-single-function-microservices/

    const configPost3 = {
      method: 'post',
      url: 'https://6k64tutroqfhh3eab35qc2u7um0rgaoj.lambda-url.us-east-1.on.aws/',
      data : {
        user_uuid: authUser?.uid,
        image_url: imageToSend.url,
        audio_url: audioToSend.url,
        image_name: imageToSend.name,
        audio_name: audioToSend.name
      },
      headers: {
        'content-type': 'application/json',
        'accept': 'application/json',
        'access-control-allow-origin': 'http://localhost:3000/dashboard/create',
    }}

    console.log("configPost3: ", configPost3);

    axios(configPost3)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
      setApiResponse(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });

    onUploadOpen();

  };




  const succesfullUpload = () => {
    onUploadClose();
  }

  const GotoProcessing = () => {
    Router.push('/dashboard/processed')
  }
  
    



  return (
    <div>

          <Grid templateColumns='repeat(5, 1fr)' gap={6} mb='10'>
            <GridItem w='100%' h='10'>
              <Box p={5} shadow='md' borderWidth='1px'>
                <Heading fontSize='xl' mb='2'>Image</Heading> 
                <Select
                      value={selectedImage}
                      onChange={(e) => handleImageChange(e.target.value)}
                    > 
                    {imageFiles.map((fileInfo) => (
                      <option key={fileInfo.id} value={fileInfo.url}>{fileInfo.name}</option>
                    ))}
                </Select>             
              </Box>
            </GridItem>

            <GridItem w='100%' h='10'>
              <Box p={5} shadow='md' borderWidth='1px'>
                <Heading fontSize='xl' mb='2'>Audio</Heading> 
                  <Select 
                  value={selectedAudio}
                  onChange={(e) => handleAudioChange(e.target.value)}
                  > 
                    {audioFiles.map((fileInfo) => (                                      
                      <option key={fileInfo.id} value={fileInfo.url} >{fileInfo.name}</option>
                    ))}
                  </Select>             
              </Box>
            </GridItem>
          </Grid>
        
          <Flex>
            <TableContainer mt='50'>
                <Table variant='simple' maxWidth='100%' display='block' overflowX='auto'>
                    <Thead>
                    <Tr>
                        <Th>Image Preview</Th>
                        <Th>Audio Preview </Th>
                    </Tr>
                    </Thead>
                    <Tbody>
                            <Tr>
                                <Td> <Avatar src={selectedImage} size='xl'/> </Td>
                                <Td> 
                                    <ReactAudioPlayer 
                                              src={selectedAudio}
                                              controls
                                          /> 
                                </Td>
                            </Tr>
                    </Tbody>
                </Table>
            </TableContainer>
        </Flex>
      

      
        <Flex>
            <Grid templateColumns='repeat(5, 1fr)' gap={6} mt='10'>
            <GridItem w='100%' h='10'>

            {previewDone && (
              <Button onClick={generatePreview} colorScheme='green' isDisabled='true'>
              Selection confirmed!
              </Button>
            )}

            {!previewDone && (
              <Button colorScheme='yellow' onClick={generatePreview}>
              Click to confirm preview selection
              </Button>
            )}

            </GridItem>


            <GridItem w='100%' h='10'>
              <Button onClick={resetWindow}>
              Reset?
              </Button>
            </GridItem>

            </Grid>





        </Flex>

        {previewDone && (
          <Flex>
            <Grid templateColumns='repeat(5, 1fr)' gap={1} mt='10'>
              {/* <GridItem w='100%' h='10'>
                <Button bgGradient='linear(to-l, #7928CA, #FF0080)' onClick={startApiCall1}> Run API #1 - Audio </Button> 
              </GridItem> */}
              <GridItem w='100%' h='10'>
                <Button bgGradient='linear(to-l, #7928CA, #FF0080)' onClick={a2hCelery}> Audio2Head: Audio + Image / Celery Worker </Button>
              </GridItem>
              <GridItem w='100%' h='10'>
                <Button bgGradient='linear(to-l, #7928CA, #FF0080)' onClick={a2h_lambda}> Audio2Head: Audio + Image / AWS Lambda </Button>
              </GridItem>
              <GridItem w='100%' h='10'>
                <Button bgGradient='linear(to-l, #7928CA, #FF0080)' onClick={a2h_batchAws}> Audio2Head: Audio + Image / AWS Batch Process </Button>
              </GridItem>

              

              {/* <GridItem w='100%' h='10'>
                <Button isDisabled='true'> Run API #3 </Button>
              </GridItem> */}
            </Grid>
          </Flex>

        )}



      <AlertDialog
        isOpen={isUploadOpen}
        leastDestructiveRef={cancelRef}
        onClose={onUploadClose}
        >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Processed has started!
            </AlertDialogHeader>
            <AlertDialogBody>
              It has begun processing your media. You can now redirect to the processing page to monitor.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button onClick={succesfullUpload}>
                Return
              </Button>
              <Button colorScheme='blue' onClick={GotoProcessing} ml={3}>
              Monitor progress!
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>


        


    </div>
  );
}

Create.getLayout = getLayout;
export default Create;