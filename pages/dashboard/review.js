import React, { useState, useEffect, useRef } from "react";
import { getFiles, getFilesProcessed, uploadFile, deleteFile } from "../../services/FileuploadService";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase/firebase";
import { getLayout } from '@/layouts/dashboard';
import Router from 'next/router'

import dynamic from "next/dynamic";
const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });

import { Flex, Input, Button, Stack, Alert, AlertIcon, Heading, useDisclosure, Avatar } from '@chakra-ui/react'
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


import { Grid, GridItem } from '@chakra-ui/react'


const UploadFiles = () => {

    const [selectedFiles, setSelectedFiles] = useState(undefined);
    const [progressInfos, setProgressInfos] = useState({ val: [] });
    const [message, setMessage] = useState([]);
    const [fileInfos, setFileInfos] = useState([]);
    const progressInfosRef = useRef(null)
    const [user, loading, error] = useAuthState(auth);
    const [name, setName] = useState("");    
  

    useEffect(() => {
        if (loading) return;
        if (!user) {Router.push('/connect/login')};
      }, [user, loading]);


    useEffect(() => {
      try {
        getFilesProcessed().then((response) => {
          setFileInfos(response.data);
        });
      }
        catch (error) {
            console.log(error);
        }
    }, []);

    const selectFiles = (event) => {
      setSelectedFiles(event.target.files);
      setProgressInfos({ val: [] });
      console.log(event.target.files);
    };



    const deleteButton = (rowName) => {
      console.log('Button action: row to delete', rowName);
      return deleteFile(rowName).then((response) => {
        setMessage(response.data);
      }).catch((error) => {
        console.log(error);
      }).then(() => {
        getFilesProcessed().then((response) => {
          setFileInfos(response.data);
        });
      }
      );
    }

    const PreviewFile = (rowUrl) => {
      // check if rowName contains a .jpg .jpeg .png .gif extension and if it does, use the avatar component
      if (rowUrl.includes('.jpg') || rowUrl.includes('.jpeg') || rowUrl.includes('.png') || rowUrl.includes('.gif')) {
        return (
          <Avatar src={rowUrl} size='lg'/>
        )
      }
      // if it is .wav or .mp3, use the audio component
      else if (rowUrl.includes('.wav') || rowUrl.includes('.mp3') || rowUrl.includes('.mp4')) {
        return (
          <ReactPlayer src={rowUrl} controls  />
        )
      }
    }

  
    return (
      <div>
  

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

        <Flex>
            <TableContainer mt='50'>
                <Table variant='simple' maxWidth='100%' display='block' overflowX='auto'>
                    <TableCaption>Uploaded files...</TableCaption>
                    <Thead>
                    <Tr>
                        <Th>File name</Th>
                        <Th>Preview </Th>
                        <Th>Download</Th>
                        <Th>Actions</Th>
                    </Tr>
                    </Thead>
                    <Tbody>
                        {fileInfos && fileInfos.map((fileInfo, index) => (
                            <Tr key={index}>
                                <Td>{fileInfo.name.split('.')[0]}</Td>
                                <Td> {PreviewFile(fileInfo.url)} </Td>
                                <Td> <Button> <a href={fileInfo.url}> Download</a> </Button></Td>
                                <Td> <Button colorScheme='red' onClick={() => deleteButton(fileInfo.name)}> Delete </Button></Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </TableContainer>
        </Flex>


        </div>

    );
  };
  
  UploadFiles.getLayout = getLayout;
  export default UploadFiles;

