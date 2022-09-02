import React, { useState, useEffect, useRef } from "react";

import { useAuthUserContext } from '../../context/AuthUserContext';
import { ref, listAll, getDownloadURL, uploadBytesResumable, deleteObject, getMetadata, updateMetadata} from "firebase/storage";

import { getLayout } from '@/layouts/dashboard';
import Router from 'next/router'

import ReactAudioPlayer from 'react-audio-player';

import { IconButton, Textarea, Badge, Flex, Input, Button, Stack, Alert, AlertIcon, Heading, useDisclosure, Avatar, FormControl, InputGroup, InputRightAddon, FormLabel } from '@chakra-ui/react'
import { Progress, Code, Tag } from '@chakra-ui/react'
import { SettingsIcon } from '@chakra-ui/icons'



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
    const [rowSelectedDetails, setRowSelectedDetails] = useState([]);
    const { isOpen: isUploadOpen, onOpen: onUploadOpen, onClose: onUploadClose } = useDisclosure()
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
    const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure()
    const { isOpen: isUpdateOpen, onOpen: onUpdateOpen, onClose: onUpdateClose } = useDisclosure()

    const [newDocumentName, setNewDocumentName] = useState('');
    const [newDocumentNotes, setNewDocumentNotes] = useState('');
    const [metaFileName, setMetaFileName] = useState('');
    const [metaFileNotes, setMetaNotesName] = useState('');

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
              // // get metadata for each item 
              // getMetadata(item).then((metadata) => {

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


    const modalFirebasedetails = (details) => {
      console.log('modalFirebasedetails', details);
      getMetadata(ref(storage, `user/${authUser?.uid}/${details.name}`))
        .then(res => {
          console.log('getMetadata', res);
          setMetaFileName(res.customMetadata.userDefinedName ? res.customMetadata.userDefinedName : '');
          setMetaNotesName(res.customMetadata.userDefinedNotes ? res.customMetadata.userDefinedNotes : '');
        }).catch((error) => {
          console.log(error);
        }
      )
      setRowSelectedDetails({'name': details.name, 'url': details.url, 'metaDataName': metaFileName, 'metaDataNotes': metaFileNotes});
      onDetailsOpen();
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


    const helperFunctionuploadFirebase = async (file) => {
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
    // once uploadkTask is done, e.g., creating file for first time, run updating metadata function to 
    // insert in original filename as user defined abbreviation
    uploadTask.then(() => {
      updateMetadata(storageRef, {customMetadata: {'userDefinedName': file.name}}).then(() => {
        console.log('Metadata updated successfully');
      }).catch((error) => {
        console.log(error);
      }
      )})
    }
    
 
    const uploadFirebase = async (file) => {
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

    const metaDataExit = () => {
      onDetailsClose();
      setMetaFileName('');
      setMetaNotesName('');
      setRowSelectedDetails([]);
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



    // note to self, looks like file names can not be changed using V9 firestore - storage,
    // but looks like can add custom metadata to the file using V9 firestore - storage,
    // then can use the metadata to change the file name
    // https://firebase.google.com/docs/storage/web/file-metadata 
    // https://firebase.google.com/docs/reference/js/storage.settablemetadata.md#settablemetadatacustommetadata


    const handleSubmit = async event => {
      event.preventDefault();
      try {
        // await dofunctionhere({ email, password });
        console.log('handleSubmit clicked');
        console.log('updatedDocName: ', newDocumentName);
        console.log('updatedDocText: ', newDocumentNotes);
        // update the metadata of the file to the new name
        updateMetadata(ref(storage, `user/${authUser?.uid}/${rowSelectedDetails.name}`), {customMetadata: {'userDefinedName': newDocumentName, 'userDefinedNotes': newDocumentNotes}}).then(() => {
          console.log('Metadata updated successfully');
        onUpdateOpen();
        }
        ).catch((error) => {
          console.log(error);
        }
        )
      } catch (error) {
        console.log(error);
        setNewDocumentName('');
        setNewDocumentNotes('');
      }
    };





  
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

        <Heading as='h5' mt='50'> Your original media </Heading>

        <TableContainer mt='50'>
          <Table variant='simple' maxWidth='100%' display='block' overflowX='auto'>
              <TableCaption>Uploaded files...</TableCaption>
              <Thead>
              <Tr>
                  <Th>Preview </Th>
                  <Th>Manage</Th>
                  <Th>Extension</Th>
                  <Th>File name</Th>
              </Tr>
              </Thead>
              <Tbody>
                {firebaseData.sort((a, b) => (a.name > b.name) ? 1 : -1).map((fileInfo, index) => (
                  <Tr key={index}>
                      <Td> {PreviewFile(fileInfo.url)} </Td>
                      <Td> 
                            {/* <Button mr='2'> <a href={fileInfo.url} target="_blank"> Download</a> </Button> */}
                            {/* <Button mr='2' onClick={() => modalFirebasedetails(fileInfo)}> Details </Button> */}
                            <IconButton
                              colorScheme='teal'
                              aria-label='Search database'
                              onClick={() => modalFirebasedetails(fileInfo)}
                              icon={<SettingsIcon />}
                            />
                            <Button ml='2' colorScheme='yellow' onClick={() => modalFirebasedelete(fileInfo.name)}> Delete </Button>
                      </Td>
                      <Td> <Badge> {fileInfo.name.split('.').pop()} </Badge> </Td>
                      <Td>{fileInfo.name}</Td>
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
                Confirm Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>




      <AlertDialog
        isOpen={isDetailsOpen}
        leastDestructiveRef={cancelRef}
        onClose={metaDataExit}
        >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              File Details: {rowSelectedDetails.name}
            </AlertDialogHeader>
            <AlertDialogBody>
              {/* https://blog.logrocket.com/how-to-create-forms-with-chakra-ui-in-react-apps/ */}

              <form onSubmit={handleSubmit}>
                <Badge fontSize='0.8em' colorScheme='blue'> Original file name: {rowSelectedDetails.name}</Badge>
                <Grid mb='5' templateColumns='repeat(5, 1fr)' gap={0} mt='5'>
                  <GridItem h='10' >
                    <Button mr='2' mb='2'> <a href={rowSelectedDetails.url} target="_blank"> Download File</a> </Button>
                  </GridItem>
                  <GridItem h='10' >
                    <Button mr='2' colorScheme='yellow' onClick={() => modalFirebasedelete(rowSelectedDetails.name)}> Delete </Button>
                  </GridItem>
                </Grid>
                <FormControl>
                  <FormLabel mt='2'>Abbreviated name</FormLabel>
                    <InputGroup size='md'>
                        <Input 
                          type='text'
                          defaultValue={metaFileName}
                          onChange={event => setNewDocumentName(event.currentTarget.value)}
                        />
                        {/* <InputRightAddon children='.jpg/.wav' /> */}
                    </InputGroup>
                    <FormLabel mt='2'>Notes</FormLabel>
                    <InputGroup size='md'>
                        <Textarea 
                            type='text'
                            defaultValue={metaFileNotes}
                            onChange={event => setNewDocumentNotes(event.currentTarget.value)}
                          />
                    </InputGroup>
                </FormControl>
                <Button colorScheme='blue' width="small" mt={4} type="submit">
                  Save Changes
                </Button>
              </form>

            </AlertDialogBody>
            <AlertDialogFooter>
              {/* <Button onClick={onDetailsClose}>
                Return
              </Button> */}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>



      <AlertDialog
        isOpen={isUpdateOpen}
        leastDestructiveRef={cancelRef}
        onClose={onUpdateClose}
        >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Update
            </AlertDialogHeader>
            <AlertDialogBody>
              File metadata updated!
            </AlertDialogBody>
            <AlertDialogFooter>
              {/* <Button onClick={}>
                Return
              </Button> */}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>






        </div>

                


    );
  };
  
  MediaPage.getLayout = getLayout;
  export default MediaPage;

