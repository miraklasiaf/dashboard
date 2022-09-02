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


const SharePage = () => {

    const { authUser, loading, storage } = useAuthUserContext();
    const [progressInfos, setProgressInfos] = useState({ val: [] });
    const [message, setMessage] = useState([]);
    const progressInfosRef = useRef(null)
    const [firebaseData, setfirebaseData] = useState([]) // empty array
    const [deleteKey, setDeleteKey] = useState(null);

    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()

    const cancelRef = React.useRef()

    useEffect(() => {
      if (loading) return;
      if (!authUser) {Router.push('/connect/login')};
      firebaseDataretrieve();
    }, [authUser, loading]);  


    const firebaseDataretrieve = () => {
      setfirebaseData([]);
      listAll(ref(storage, `user/${authUser?.uid}/processed`))
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


    const modalFirebasedelete = (rowName) => {
      onDeleteOpen();
      console.log('modalFirebasedelete', rowName);
      setDeleteKey(rowName);
    }

    const deleteButtonFirebase = (rowName) => {
      console.log('Button action: row to delete', rowName);
      deleteObject(ref(storage, `user/${authUser?.uid}/processed/${rowName}`)).then(() => {
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









  
    return (


      <div>
    

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

        <Heading as='h5' mt='50'> Your Digital Clones </Heading>

        <TableContainer mt='50'>
          <Table variant='simple' maxWidth='100%' display='block' overflowX='auto'>
              <TableCaption>Uploaded files...</TableCaption>
              <Thead>
              <Tr>
                  <Th>View and Download</Th>
                  <Th>Extension</Th>
                  <Th>Actions</Th>
                  <Th>File name</Th>
              </Tr>
              </Thead>
              <Tbody>
                {firebaseData.sort((a, b) => (a.name > b.name) ? 1 : -1).map((fileInfo, index) => (
                  <Tr key={index}>
                      <Td> <Button> <a href={fileInfo.url} target="_blank"> View</a> </Button></Td>
                      <Td> {fileInfo.name.split('.').pop()} </Td>
                      <Td> <Button colorScheme='yellow' onClick={() => modalFirebasedelete(fileInfo.name)}> Delete </Button></Td>
                      <Td>{fileInfo.name}</Td>
                  </Tr>
                ))}
              </Tbody>
          </Table>
        </TableContainer>

        

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
  
  SharePage.getLayout = getLayout;
  export default SharePage;

