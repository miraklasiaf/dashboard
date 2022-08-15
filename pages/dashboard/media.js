import React, { useState, useEffect, useRef } from "react";

import { getFiles, uploadFile, deleteFile } from "../../services/FileuploadService";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, storage } from "../../firebase/firebase";
import { getStorage, ref, listAll, getDownloadURL, uploadBytesResumable, deleteObject} from "firebase/storage";

import { getLayout } from '@/layouts/dashboard';
import Router from 'next/router'

import ReactAudioPlayer from 'react-audio-player';

import { Flex, Spinner, Input, Button, Stack, Alert, AlertIcon, Heading, useDisclosure, Avatar } from '@chakra-ui/react'
import { Progress } from '@chakra-ui/react'
import { Divider } from '@chakra-ui/react'

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


const UploadFiles = () => {
    const [selectedFiles, setSelectedFiles] = useState(undefined);
    const [progressInfos, setProgressInfos] = useState({ val: [] });
    const [message, setMessage] = useState([]);
    const [fileInfos, setFileInfos] = useState([]);
    const progressInfosRef = useRef(null)
    const [user, loading, error] = useAuthState(auth);
    const [name, setName] = useState("");   
    const [serverStatus, setServerStatus] = useState(true);
    const [fileInfosFirebase, setFileInfosFirebase] = useState([]);
    const [firebaseData, setfirebaseData] = useState([]) // empty array
    const [firebaseUserId, setFirebaseUserId] = useState(null);
    const [firebaseUrl, setFirebaseUrl] = useState(null);
    const [progresspercent, setProgresspercent] = useState(0);

    const { isOpen, onOpen, onClose } = useDisclosure()
    const cancelRef = React.useRef()

    useEffect(() => {
      if (loading) return;
      if (!user) {Router.push('/connect/login')};
      // get user id from firebase auth
      setFirebaseUserId(user.uid);
      console.log('user id', user.uid);
    }, [user, loading]);


    // useEffect(() => {
    //   try {
    //     getFiles().then((response) => {
    //       setFileInfos(response.data);
    //     });
    //   }
    //     catch (error) {
    //         console.log(error);
    //         setServerStatus(false);
    //     }
    // }, []);



    const firebaseDataretrieve = () => {

      setfirebaseData([]);

      let storage = getStorage();
      let storageRef = ref(storage, `user/${firebaseUserId}`);

      listAll(storageRef)
        .then(res => {
          res.items.forEach((item) => {
            getDownloadURL(item).then((url) => {
              // console.log('item', item);
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


    // const deleteButton = (rowName) => {
    //   console.log('Button action: row to delete', rowName);
    //   return deleteFile(rowName).then((response) => {
    //     setMessage(response.data);
    //   }).catch((error) => {
    //     console.log(error);
    //   }).then(() => {
    //     getFiles().then((response) => {
    //       setFileInfos(response.data);
    //     });
    //   }
    //   );
    // }

    const deleteButtonFirebase = (rowName) => {
      console.log('Button action: row to delete', rowName);
      const storageRef = ref(storage, `user/${firebaseUserId}/${rowName}`);
      // Delete the file
      deleteObject(storageRef).then(() => {
        console.log('File deleted successfully');
        firebaseDataretrieve();
      }).catch((error) => {
        console.log(error);
      });
    }

    const PreviewFile = (rowUrl) => {
      // check if rowName contains a .jpg .jpeg .png .gif extension and if it does, use the avatar component
      if (rowUrl.includes('.jpg') || rowUrl.includes('.jpeg') || rowUrl.includes('.png') || rowUrl.includes('.gif')) {
        return (
          <Avatar src={rowUrl} size='lg'/>
        )
      }
      // if it is .wav or .mp3, use the audio component
      else if (rowUrl.includes('.wav') || rowUrl.includes('.mp3')) {
        return (
          <ReactAudioPlayer src={rowUrl} controls />
        )
      }
    }


    // const upload = (idx, file) => {

    //   let _progressInfos = [...progressInfosRef.current.val];

    //   // check if file has any special characters other then a _ and a ., if it does throw an error 
    //   if (file.name.match(/[^a-zA-Z0-9_.]/)) {
    //     console.log(["Please remove all white space and special characters and try again"]);
    //     return ( (alert('Please remove all white space and special characters and try again')));      
    //   }

    //   return uploadFile(file, (event) => {
    //     // check for special characters or whitespace in the filename, replace them with an underscore
    //     _progressInfos[idx].percentage = Math.round(
    //       (100 * event.loaded) / event.total
    //     );
    //     setProgressInfos({ val: _progressInfos });
    //   })
    //     .then(() => {
    //       setMessage((prevMessage) => ([
    //         ...prevMessage,
    //         "Uploaded the file successfully: " + file.name,
    //       ]));
    //     })
    //     .catch(() => {
    //       _progressInfos[idx].percentage = 0;
    //       setProgressInfos({ val: _progressInfos });
  
    //       setMessage((prevMessage) => ([
    //         ...prevMessage,
    //         "Could not upload the file: " + file.name,
    //       ]));
    //     });
    // };


    // const uploadFilesFunction = () => {
    //   const files = Array.from(selectedFiles);
  
    //   let _progressInfos = files.map(file => ({ percentage: 0, fileName: file.name }));
  
    //   progressInfosRef.current = {
    //     val: _progressInfos,
    //   }
  
    //   const uploadPromises = files.map((file, i) => upload(i, file));
  
    //   Promise.all(uploadPromises)
    //     .then(() => getFiles())
    //     .then((files) => {
    //       setFileInfos(files.data);
    //     });
  
    //   setMessage([]);
    // };


    const helperFunctionuploadFirebase = (file) => {
      const storageRef = ref(storage, `user/${firebaseUserId}/${file.name}`);
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
        onOpen();
      })
    };

    const succesfullUpload = () => {
      onClose();
    }


    const GotoCamera = () => {
      Router.push('/dashboard/media/camera')
    }
  
    return (


      <div>
    
        <Flex>
            <Input
                type="file"
                multiple
                onChange={selectFiles}
                variant="flushed"
                accept=".jpg, .jpeg, .wav, .m4a"
            />
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
            <Button onClick={uploadFilesFunctionFirebase} disabled={!selectedFiles}>
              Upload
            </Button>
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

        {/* <Flex>
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
                        {fileInfos && fileInfos.map((fileInfo, index) => (
                            <Tr key={index}>
                                <Td>{fileInfo.name.split('.')[0]}</Td>
                                <Td>{fileInfo.name.split('.')[1]}</Td>
                                <Td> {PreviewFile(fileInfo.url)} </Td>
                                <Td> <Button> <a href={fileInfo.url}> Download</a> </Button></Td>
                                <Td> <Button colorScheme='red' onClick={() => deleteButton(fileInfo.name)}> Delete </Button></Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>
        </Flex> */}



        <Button mt='10' onClick={firebaseDataretrieve}> Firebase Retrieve </Button>


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
                {firebaseData && firebaseData.map((fileInfo, index) => (                      
                      <Tr key={index}>
                          <Td>{fileInfo.name}</Td>
                          <Td>{fileInfo.name.split('.')[1]}</Td>
                          <Td> {PreviewFile(fileInfo.url)} </Td>
                          <Td> <Button> <a href={fileInfo.url}> Download</a> </Button></Td>
                          <Td> <Button colorScheme='red' onClick={() => deleteButtonFirebase(fileInfo.name)}> Delete </Button></Td>
                      </Tr>
                ))}
              </Tbody>
          </Table>
        </TableContainer>

        
      
        <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
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






        </div>

                


    );
  };
  
  UploadFiles.getLayout = getLayout;
  export default UploadFiles;

