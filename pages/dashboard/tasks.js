import React, { useState, useEffect, useRef } from "react";

import { useAuthUserContext } from '../../context/AuthUserContext';
import { collection, getDocs, getDoc, collectionGroup, query, where, deleteDoc, doc, setDoc } from "firebase/firestore"; 

import { getLayout } from '@/layouts/dashboard';
import Router from 'next/router'

import { Heading, useDisclosure, Box, Text, List, ListItem, useColorModeValue } from '@chakra-ui/react'
import axios from "axios";

import {
  FormControl,
  FormLabel,
  Switch,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react'

import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableCaption,
    TableContainer,
    Button
  } from '@chakra-ui/react'

import { SettingsIcon, IconButton } from '@chakra-ui/icons'


const Tasks = () => {

    const { authUser, loading, db } = useAuthUserContext();
    const [firebaseData, setfirebaseData] = useState([]) // empty array
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
    const [deleteKey, setDeleteKey] = useState(null);
    const [historicalState, setHistoricalState] = useState(false);
    const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure()
    const [detailsKey, setDetailsKey] = useState(null);

    const cancelRef = React.useRef()


    useEffect(() => {
      if (loading) return;
      if (!authUser) {Router.push('/connect/login')};
      firebaseDataretrieve();
    }, [authUser, loading]);  


    // get a snapshot of each document with the collection tasks within each user document
    const firebaseDataretrieve = async () => {
      const q = query(collection(db, "users"), where("uid", "==", authUser.uid));
      const querySnapshot1 = await getDocs(q);
      querySnapshot1.forEach((doc) => {
        console.log(doc.id, " => ", doc.data());
      });
      const constDocID = querySnapshot1.docs[0].id;
      console.log('constDocID', constDocID);

      // querysnapshot getdocs for current user
      const querySnapshot2 = await getDocs(collection(db, `users/${constDocID}/tasks`));
      const count = querySnapshot2.docs.length;
      console.log('count querySnapshot2', count);

      // keep only task_status and task_id from each doc in the querySnapshot
      const firebaseData = querySnapshot2.docs.map(doc => ({
        show_status: doc.data().show_status, 
        task_status: doc.data().task_status, 
        task_id: doc.data().task_id, 
        task_arn: doc.data().task_arn || null,
        output_name: doc.data().output_name || null,
        input_param_audio: doc.data().input_param?.audio_url || null,
        input_param_image: doc.data().input_param?.image_url || null,
        input_duration_total: doc.data().task_duration_readable || null,
        input_duration_runtime: doc.data().task_duration || null,
        // task_result: doc.data().task_result?.result ?? 'still in progress or potential error',
        task_created_at: doc.data().task_created_at?.toString() || null,   // ?.toDate().toLocaleTimeString('en-US') 
        task_finished_at: doc.data().task_finished_at?.toString() || null //?.toDate().toLocaleTimeString('en-US'),
      }));

      // // if historicalState is true, keep only tasks that are finished
      // if (historicalState) {
      //   const filteredFirebaseData = firebaseData.filter(item => item.show_status != historicalState);
      //   setfirebaseData(filteredFirebaseData);
      // } else {
      //   setfirebaseData(firebaseData);
      // }

      // remove firebaseData where show_status is false
      // console.log('historicalState', historicalState);
      // const filteredFirebaseData = firebaseData.filter(item => item.show_status == true || item.show_status == false);
      setfirebaseData(firebaseData);
      console.log(firebaseData)
    }


    const reCheckStatus = (itemId) => {
      axios(
        {
          method: 'get',
          // url: `http://localhost:5000/check_task/${authUser.uid}/${itemId}`,
          url: `https://server.appliedhealthinformatics.com/check_task/${authUser.uid}/${itemId}`,
          headers: {
            'Content-Type': '*/*',
            'Accept': '*/*',
            // 'access-control-allow-origin': 'https://clone.appliedhealthinformatics.com' // added this for https / fastAPI / traekif   
          }
        }
      )
      .then((response) => {
        console.log(JSON.stringify(response.data));
      })
      .catch((error) => {
        console.log(error);
      });
    }

    const reCheckStatusAWS = (itemId) => {
      axios(
        {
          method: 'get',
          // url: `http://localhost:5000/check_task/aws-batch/${authUser.uid}/${itemId}`,
          url: `https://server.appliedhealthinformatics.com/check_task/aws-batch/${authUser.uid}/${itemId}`,
          headers: {
            'Content-Type': '*/*',
            'Accept': '*/*'
          }
        }
      )
      .then((response) => {
        console.log(JSON.stringify(response.data));
      })
      .catch((error) => {
        console.log(error);
      });
    }

    const reCheckStatusAWS2 = (taskarn, itemId) => {
      var configPostBatchAWS = {
        method: 'post',
        // url: `http://localhost:5000/check_aws_batch_task/`,
        url: 'https://server.appliedhealthinformatics.com/check_aws_batch_task/',
        data : {
          user_uuid: authUser?.uid,
          task_uuid: itemId,
          job_arn: taskarn
        },
        headers: { 
          'content-type': 'application/json',
          'accept': 'application/json',
          // 'access-control-allow-origin': 'https://clone.appliedhealthinformatics.com', // added this for https / fastAPI / traekif   
      }}

      console.log('toSend: ', configPostBatchAWS)

      axios(configPostBatchAWS).then((response) => {
        console.log(JSON.stringify(response.data));
      })
      .catch((error) => {
        console.log(error);
      });
    }


    const checkRowItem = async (itemId) => {
      reCheckStatus(itemId);
      await setfirebaseData([]);
      firebaseDataretrieve();
    }

    const checkRowItemAWS = async (taskarn, itemId) => {
      // reCheckStatusAWS(itemId);
      reCheckStatusAWS2(taskarn, itemId);
      await setfirebaseData([]);
      firebaseDataretrieve();
    }


    const deleteButton = (rowName) => {
      console.log('Button action: row to delete', rowName);
      deleteDoc(doc(db, `users/${authUser?.uid}/tasks/${rowName}`)).then(() => {
        console.log('File deleted successfully');
        firebaseDataretrieve();
      }).catch((error) => {
        console.log(error);
      });
      onDeleteClose();
    }

    const softDeleteButton = (rowName) => {
      console.log('Button action: row to soft delete', rowName);
      // soft delete the row by chaging show_status to false
      const docRef = doc(db, `users/${authUser?.uid}/tasks/${rowName}`);
      setDoc(docRef, { show_status: false }, { merge: true}).then(() => {
        console.log('File soft deleted successfully');
        firebaseDataretrieve();
      }).catch((error) => {
        console.log(error);
      });
      onDeleteClose();
    }

    

    const modalFirebasedelete = (rowName) => {
      onDeleteOpen();
      console.log('modalFirebasedelete', rowName);
      setDeleteKey(rowName);
    }


    const redirectAudioUrl = (audioUrl) => {
      console.log('redirectAudioUrl', audioUrl);
      window.open(audioUrl, '_blank');
    }

    const redirectImageUrl = (imageUrl) => {
      console.log('redirectImageUrl', imageUrl);
      window.open(imageUrl, '_blank');
    }

    const manualRefresh = async () => {
      await setfirebaseData([]);
      firebaseDataretrieve();
    }

    // // console log showHistorical switch state 
    // const handleHistoricalState = (event) => {
    //   console.log('handleHistoricalState', event.target.checked);
    //   if (event.target.checked) {
    //     setHistoricalState(true);
    //     manualRefresh();
    //   } else {
    //     setHistoricalState(false);
    //     manualRefresh();
    //   }
    // }

    const metaDataExit = () => {
      onDetailsClose();
    }

    const openDetails = (row) => {
      setDetailsKey(row);
      console.log('openDetails', row);
      onDetailsOpen();
    }


    return (


      <div>
    



        <Heading as='h5' mt='50'> Processing </Heading>

        {/* <Button mt='10' onClick={manualRefresh}> Refresh </Button> */}

        {/* <FormControl display='flex' alignItems='center' mt='5'>
          <FormLabel htmlFor='historical-jobs' mb='0'>
            Show historical jobs?
          </FormLabel>
          <Switch
            isChecked={historicalState}
            onChange={handleHistoricalState}
            color='primary'
          />
        </FormControl> */}

        {/* <Button onClick={reLoadTable} colorScheme="yellow" mt='10'> Recheck status</Button> */}

        <TableContainer mt='50'>
          <Table variant='simple' maxWidth='100%' display='block' overflowX='auto'>
              <TableCaption>Uploaded files...</TableCaption>
              <Thead>
              <Tr>
                  <Th>Status</Th>
                  <Th> Output name</Th>
                  <Th>Parameters</Th>
                  <Th>Actions</Th>
              </Tr>
              </Thead>
              <Tbody>
                {firebaseData.map((fileInfo, index) => (
                  <Tr key={index}>
                      <Td>{fileInfo.task_status}</Td>
                      <Td>
                        {fileInfo?.output_name}
                      </Td>
                      <Td>
                        {fileInfo.input_param_audio ? <a href={fileInfo.input_param_audio} target="_blank"> <Button> audio url </Button> </a> : 'not available'}
                        {fileInfo.input_param_image ? <a href={fileInfo.input_param_image} target="_blank"> <Button> image url</Button>  </a> : 'not available'}
                      </Td>
                      <Td> 
                        {/* {fileInfo.task_status === 'SUCCESS' | fileInfo.task_status === 'SUCCEEDED' ? (<Button isDisabled='yes' colorScheme="green"> Complete </Button>) : <Button onClick={() => checkRowItem(fileInfo.task_id)} colorScheme="yellow"> Recheck status</Button>} */}
                        {fileInfo.task_status === 'SUCCESS' | fileInfo.task_status === 'SUCCEEDED' ? (<Button isDisabled='yes' colorScheme="green" ml='5'> Complete </Button>) : <Button onClick={() => checkRowItemAWS(fileInfo.task_arn, fileInfo.task_id)} colorScheme="yellow" ml='5'> Recheck status</Button>}
                        <Button ml='5' onClick={() => modalFirebasedelete(fileInfo.task_id)} colorScheme="red"> Delete</Button>
                        <Button ml='5' onClick={() => openDetails(fileInfo)} colorScheme="blue"> Details</Button>
                      </Td>
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
              <Button onClick={() => deleteButton(deleteKey)}>
                Permament Delete
              </Button>
              <Button ml='5' colorScheme='red' onClick={() => softDeleteButton(deleteKey)}>
                Soft Delete 
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
            <AlertDialogHeader 
                fontSize='lg' 
                fontWeight='bold'
                color={useColorModeValue('yellow.500', 'yellow.300')}
                textTransform={'uppercase'}
              >
              Task Details
            </AlertDialogHeader>
            <AlertDialogBody>
              <Box>
                <List spacing={2}>
                  <ListItem>
                    <Text as={'span'} fontWeight={'bold'}>
                      Task status:
                    </Text>{' '}
                    {detailsKey?.task_status}
                  </ListItem>
                  <ListItem>
                    <Text as={'span'} fontWeight={'bold'}>
                      Task ID:
                    </Text>{' '}
                    {detailsKey?.task_id}
                  </ListItem>
                  <ListItem>
                    <Text as={'span'} fontWeight={'bold'}>
                      Task ARN:
                    </Text>{' '}
                    {detailsKey?.task_arn}
                  </ListItem>
                  <ListItem>
                    <Text as={'span'} fontWeight={'bold'}>
                      Task created at:
                    </Text>{' '}
                    {detailsKey?.task_created_at}
                  </ListItem>
                  <ListItem>
                    <Text as={'span'} fontWeight={'bold'}>
                      Task finished at:
                    </Text>{' '}
                    {detailsKey?.task_finished_at}
                  </ListItem>
                  <ListItem>
                    <Text as={'span'} fontWeight={'bold'}>
                    Input Duration Runtime:
                    </Text>
                    {detailsKey?.input_duration_runtime}
                  </ListItem>
                  <ListItem>
                    <Text as={'span'} fontWeight={'bold'}>
                      Input Duration Total:
                    </Text>
                    {detailsKey?.input_duration_total}
                  </ListItem>
                  <ListItem>
                    <Text as={'span'} fontWeight={'bold'}>
                      Show Status:
                    </Text>{' '}
                    <Text>{detailsKey?.show_status ? ' True' : ' False'}</Text>
                  </ListItem>
                </List>
              </Box>

            </AlertDialogBody>
            <AlertDialogFooter>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>













        </div>

                


    );
  };
  
  Tasks.getLayout = getLayout;
  export default Tasks;

