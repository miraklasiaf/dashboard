import React, { useState, useEffect, useRef } from "react";

import { useAuthUserContext } from '../../context/AuthUserContext';
import { collection, getDocs, getDoc, collectionGroup, query, where } from "firebase/firestore"; 

import { getLayout } from '@/layouts/dashboard';
import Router from 'next/router'


import { Heading, useDisclosure } from '@chakra-ui/react'

import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableCaption,
    TableContainer,
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
      
      // // this is the version below if you want to get all tasks across all users 
      // const querySnapshot = await getDocs(collectionGroup(db, 'tasks'));
      // console.log('querySnapshot', querySnapshot.docs.map(doc => doc.data()));

      // // this is the verison below that is for a specific user, since i fucked up
      // // the document IDs, which are different from user IDs, need to first search and query
      // // should perhaps change the docIds here to authUser.uid's to match and make it easier
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
        task_result: doc.data().task_result?.result ?? 'still in progress or potential error'
      }));
      setfirebaseData(firebaseData);
    }



    return (


      <div>
    



        <Heading as='h5' mt='50'> Processed </Heading>

        <TableContainer mt='50'>
          <Table variant='simple' maxWidth='100%' display='block' overflowX='auto'>
              <TableCaption>Uploaded files...</TableCaption>
              <Thead>
              <Tr>
                  <Th>Input_Param</Th>
                  <Th>Task_Id </Th>
                  <Th>Task_Result</Th>
                  <Th>Task_Status</Th>
              </Tr>
              </Thead>
              <Tbody>
                {firebaseData.map((fileInfo, index) => (
                  <Tr key={index}>
                      <Td>{fileInfo.input_param}</Td>
                      <Td>{fileInfo.task_id}</Td>
                      <Td>{fileInfo.task_result}</Td>
                      <Td>{fileInfo.task_status}</Td>
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

