import React, { useState, useEffect, useRef } from "react";

import { useAuthUserContext } from '../../context/AuthUserContext';
import { ref, listAll, getDownloadURL, uploadBytesResumable, deleteObject} from "firebase/storage";

import { getLayout } from '@/layouts/dashboard';
import Router from 'next/router'

import ReactAudioPlayer from 'react-audio-player';

import { Flex, Input, Button, Stack, Alert, AlertIcon, Heading, useDisclosure, Avatar, FormControl } from '@chakra-ui/react'
import { Progress, Code, Tag } from '@chakra-ui/react'

import axios from "axios";

import {
    Table,
    Thead,
    Tbody,
    Tfoot,
    Tr,
    Th,
    Td,
    TableCaption,
    TableContainer,
  } from '@chakra-ui/react'

  import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
  } from '@chakra-ui/react'


import { Grid, GridItem } from '@chakra-ui/react'


const MediaPage = () => {

    const { authUser, loading, storage } = useAuthUserContext();

    const [selectedFiles, setSelectedFiles] = useState(null);
    const [progressInfos, setProgressInfos] = useState({ val: [] });
    const [message, setMessage] = useState([]);
    const progressInfosRef = useRef(null)
    const [firebaseData, setfirebaseData] = useState([]) // empty array
    const [progresspercent, setProgresspercent] = useState(0);
    const [resetKey, setResetKey] = useState(null);
    const [deleteKey, setDeleteKey] = useState(null);

    const { isOpen: isUploadOpen, onOpen: onUploadOpen, onClose: onUploadClose } = useDisclosure()
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()


    const cancelRef = React.useRef()

    useEffect(() => {
      if (loading) return;
      if (!authUser) {Router.push('/connect/login')};
      firebaseDataretrieve();
    }, [authUser, loading]);  


    const firebaseDataretrieve = () => {
      setfirebaseData([]);
      listAll(ref(storage, `user/${authUser?.uid}`))
        .then(res => {
          res.items.forEach((item) => {
            getDownloadURL(item).then((url) => {
              const dataCollect = {"name": item.name, "url": url};
              setfirebaseData(firebaseData => [...firebaseData, dataCollect]);
            }).catch((error) => {
              console.log(error);
            })
          }).catch((error) => {
            console.log(error);
          }
          )
        }).catch((error) => {
          console.log(error);
        }
      )
    }

    const selectFiles = (event) => {
      setSelectedFiles(event.target.files);
      setProgressInfos({ val: [] });
      console.log(event.target.files);
    };


    const modalFirebasedelete = (rowName) => {
      onDeleteOpen();
      console.log('modalFirebasedelete', rowName);
      setDeleteKey(rowName);
    }

    const deleteButtonFirebase = (rowName) => {
      console.log('Button action: row to delete', rowName);
      deleteObject(ref(storage, `user/${authUser?.uid}/${rowName}`)).then(() => {
        console.log('File deleted successfully');
        firebaseDataretrieve();
      }).catch((error) => {
        console.log(error);
      });
      onDeleteClose();
    }




    const PreviewFile = (rowUrl) => {
      if (rowUrl.includes('.jpg') || rowUrl.includes('.jpeg') || rowUrl.includes('.png') || rowUrl.includes('.gif')) {
        return (
          <Avatar src={rowUrl} size='lg'/>
        )
      }
      else if (rowUrl.includes('.wav') || rowUrl.includes('.mp3')) {
        return (
          <ReactAudioPlayer src={rowUrl} controls />
        )
      }
      else if (rowUrl.includes('.txt')) {
        console.log('rowUrl: ', rowUrl);
        return (
          <Tag size='sm'> <object data={rowUrl} margin='0'/> </Tag>
        )
      }
    }


    const helperFunctionuploadFirebase = (file) => {
      const storageRef = ref(storage, `user/${authUser?.uid}/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on("state_changed",
      (snapshot) => {
        const progress =
          Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgresspercent(progress);
      },
      (error) => {
        alert(error);
      }
    );
    };


    const uploadFirebase = (file) => {
      // check if file has any special characters other then a _ and a ., if it does throw an error 
      if (file.name.match(/[^a-zA-Z0-9_.]/)) {
        console.log(["Please remove all white space and special characters and try again"]);
        return ( (alert('Please remove all white space and special characters and try again')));      
      }
      return helperFunctionuploadFirebase(file)
    };
      


    const uploadFilesFunctionFirebase = () => {
      const files = Array.from(selectedFiles);
      const uploadPromises = files.map((file) => uploadFirebase(file));
      Promise.all(uploadPromises).then(() => {
        onUploadOpen();
      })
    };

    const succesfullUpload = () => {
      onUploadClose();
      clearFiles();
      firebaseDataretrieve();
    }

    // create a function that clears the selected files and progress infos
    const clearFiles = () => {
      setSelectedFiles('');
      setProgressInfos({ val: [] });
      let randomString = Math.random().toString(36);
      setResetKey(randomString);
    }

    const GotoCamera = () => {
      Router.push('/dashboard/media/camera')
    }
  
    return (


      <div>
    
        <Flex>
          <FormControl>
            <Input
                  type="file"
                  multiple
                  onChange={selectFiles}
                  variant="flushed"
                  accept=".jpg, .jpeg, .wav, .m4a, .txt"
                  key={resetKey || '' }
              />
          </FormControl>

        </Flex>


        {progressInfos && progressInfos.val.length > 0 &&
                                progressInfos.val.map((progressInfo, index) => (
                                    <div key={index}>
                                        <span>{progressInfo.fileName}</span>
                                        <div>
                                            <Progress
                                                value={progressInfo.percentage}
                                                size="xs"
                                                aria-valuenow={progressInfo.percentage}
                                                colorScheme='pink'
                                            />
                                        </div>
                                    </div>
                            ))}


        <Grid templateColumns='repeat(5, 1fr)' gap={0} mt='5'>
          <GridItem h='10' >
              <Button colorScheme='green' onClick={uploadFilesFunctionFirebase} disabled={!selectedFiles}>
                Upload files {selectedFiles && selectedFiles.length > 1 ? `(${selectedFiles.length})` : ''}
              </Button>
          </GridItem>
          <GridItem h='10' >
            {selectedFiles && selectedFiles.length >= 1 && (
                  <Button colorScheme='yellow' onClick={clearFiles} disabled={!selectedFiles}>
                    Clear files
                  </Button>
                )}
          </GridItem>
          <GridItem h='10' >
            <Button onClick={GotoCamera}>
                Take a selfie!
              </Button>
          </GridItem>
          <GridItem h='10'>
            <Button onClick={() => Router.push('/dashboard/media/audio')}>
                Record audio!
              </Button>
          </GridItem>
          <GridItem h='10'>
            <Button onClick={() => Router.push('/dashboard/media/text')}>
                Type text!
              </Button>
          </GridItem>
        </Grid>


        {message.length > 0 && (
            <Stack spacing={3}>
                {message.map((item, i) => {
                    <Alert status='error' key={i}>
                        <AlertIcon />
                        {item}
                    </Alert>
                }   
                )}
            </Stack>
        )}

        <Heading as='h5' mt='50'> Media files </Heading>

        <TableContainer mt='50'>
          <Table variant='simple' maxWidth='100%' display='block' overflowX='auto'>
              <TableCaption>Uploaded files...</TableCaption>
              <Thead>
              <Tr>
                  <Th>File name</Th>
                  <Th>Extension</Th>
                  <Th>Preview </Th>
                  <Th>Download</Th>
                  <Th>Actions</Th>
              </Tr>
              </Thead>
              <Tbody>
                {firebaseData.sort((a, b) => (a.name > b.name) ? 1 : -1).map((fileInfo, index) => (
                  <Tr key={index}>
                      <Td>{fileInfo.name}</Td>
                      <Td>{fileInfo.name.split('.')[1]}</Td>
                      <Td> {PreviewFile(fileInfo.url)} </Td>
                      <Td> <Button> <a href={fileInfo.url} target="_blank"> Download</a> </Button></Td>
                      <Td> <Button colorScheme='yellow' onClick={() => modalFirebasedelete(fileInfo.name)}> Delete </Button></Td>
                  </Tr>
                ))}
              </Tbody>
          </Table>
        </TableContainer>

        
        <AlertDialog
        isOpen={isUploadOpen}
        leastDestructiveRef={cancelRef}
        onClose={onUploadClose}
        >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Files Saved!
            </AlertDialogHeader>
            <AlertDialogBody>
              You will now see the photo in your files...
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button onClick={succesfullUpload}>
                Return
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>



      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
        >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Delete file!
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete the file?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button colorScheme='red' onClick={() => deleteButtonFirebase(deleteKey)}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>




        </div>

                


    );
  };
  
  MediaPage.getLayout = getLayout;
  export default MediaPage;

