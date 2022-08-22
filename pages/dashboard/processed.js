import React, { useState, useEffect, useRef } from "react";

import { useAuthUserContext } from '../../context/AuthUserContext';
import { collection, getDocs, getDoc, collectionGroup, query, where } from "firebase/firestore"; 

import { getLayout } from '@/layouts/dashboard';
import Router from 'next/router'

import { Heading, useDisclosure } from '@chakra-ui/react'
import axios from "axios";


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

const Processing = () => {

    const { authUser, loading, db } = useAuthUserContext();
    const [firebaseData, setfirebaseData] = useState([]) // empty array

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
        task_status: doc.data().task_status, 
        task_id: doc.data().task_id, 
        input_param: doc.data().input_param,
        task_result: doc.data().task_result?.result ?? 'still in progress or potential error',
        task_created_at: doc.data().task_created_at?.toDate().toLocaleTimeString('en-US'),
        task_finished_at: doc.data().task_finished_at?.toDate().toLocaleTimeString('en-US'),
      }));
      setfirebaseData(firebaseData);
      console.log(firebaseData)
    }


  const reCheckStatus = (itemId) => {
    axios(
      {
        method: 'get',
        url: `http://localhost:5000/check_task/${authUser.uid}/${itemId}`,
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


    const checkRowItem = async (itemId) => {
      reCheckStatus(itemId);
      await setfirebaseData([]);
      firebaseDataretrieve();
    }



    return (


      <div>
    



        <Heading as='h5' mt='50'> Processed </Heading>

        {/* <Button onClick={reLoadTable} colorScheme="yellow" mt='10'> Recheck status</Button> */}

        <TableContainer mt='50'>
          <Table variant='simple' maxWidth='100%' display='block' overflowX='auto'>
              <TableCaption>Uploaded files...</TableCaption>
              <Thead>
              <Tr>
                  <Th>Input_Param</Th>
                  <Th>Task_Status</Th>
                  <Th>Recheck Status</Th>
                  <Th>Task_Result</Th>
                  <Th>Task_Id </Th>
                  <Th>Start_Time</Th>
                  <Th>End_Time</Th>
              </Tr>
              </Thead>
              <Tbody>
                {firebaseData.map((fileInfo, index) => (
                  <Tr key={index}>
                      <Td>{fileInfo.input_param}</Td>
                      <Td>{fileInfo.task_status}</Td>
                      <Td> <Button onClick={() => checkRowItem(fileInfo.task_id)} colorScheme="yellow"> Recheck status</Button></Td>
                      <Td>{fileInfo.task_result}</Td>
                      <Td>{fileInfo.task_id}</Td>
                      <Td>{fileInfo.task_created_at}</Td>
                      <Td>{fileInfo.task_finished_at}</Td>
                  </Tr>
                ))}
              </Tbody>
          </Table>
        </TableContainer>

        

        </div>

                


    );
  };
  
  Processing.getLayout = getLayout;
  export default Processing;

