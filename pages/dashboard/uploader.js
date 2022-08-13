import React, { useState, useEffect, useRef } from "react";
import { getFiles, uploadFile, deleteFile } from "../../services/FileuploadService";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase/firebase";
import { getLayout } from '@/layouts/dashboard';
import Router from 'next/router'

import { Flex, Input, Button, Stack, Alert, AlertIcon, Heading, useDisclosure, Avatar } from '@chakra-ui/react'
import { Progress } from '@chakra-ui/react'
import { Divider } from '@chakra-ui/react'

import AlertDialogExample from '../../components/dashboard/uploader/alertDialogDelete'
import AlertTemplate from '../../components/dashboard/uploader/alertDialogTemplate'

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
        getFiles().then((response) => {
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
        getFiles().then((response) => {
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
      else if (rowUrl.includes('.wav') || rowUrl.includes('.mp3')) {
        return (
          <audio controls>
            <source src={rowUrl} type="audio/wav"/>
          </audio>
        )
      }
    }


    const upload = (idx, file) => {
      let _progressInfos = [...progressInfosRef.current.val];

      // check if file has any special characters other then a _ and a ., if it does throw an error 
      if (file.name.match(/[^a-zA-Z0-9_.]/)) {
        console.log(["Please remove all white space and special characters and try again"]);
        return ( (alert('Please remove all white space and special characters and try again')));      
      }

      return uploadFile(file, (event) => {
        // check for special characters or whitespace in the filename, replace them with an underscore
        _progressInfos[idx].percentage = Math.round(
          (100 * event.loaded) / event.total
        );
        setProgressInfos({ val: _progressInfos });
      })
        .then(() => {
          setMessage((prevMessage) => ([
            ...prevMessage,
            "Uploaded the file successfully: " + file.name,
          ]));
        })
        .catch(() => {
          _progressInfos[idx].percentage = 0;
          setProgressInfos({ val: _progressInfos });
  
          setMessage((prevMessage) => ([
            ...prevMessage,
            "Could not upload the file: " + file.name,
          ]));
        });
    };
  
    const uploadFilesFunction = () => {
      const files = Array.from(selectedFiles);
  
      let _progressInfos = files.map(file => ({ percentage: 0, fileName: file.name }));
  
      progressInfosRef.current = {
        val: _progressInfos,
      }
  
      const uploadPromises = files.map((file, i) => upload(i, file));
  
      Promise.all(uploadPromises)
        .then(() => getFiles())
        .then((files) => {
          setFileInfos(files.data);
        });
  
      setMessage([]);
    };



    const GotoCamera = () => {
      Router.push('/dashboard/uploader/camera')
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
            <Button onClick={uploadFilesFunction} disabled={!selectedFiles}>
              Upload
            </Button>
          </GridItem>
          <GridItem h='10' >
            <Button onClick={GotoCamera}>
                Take a selfie!
              </Button>
          </GridItem>
          <GridItem h='10'>
            <Button onClick={() => Router.push('/dashboard/uploader/audio')}>
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

        <Flex>
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
        </Flex>

        </div>

    );
  };
  
  UploadFiles.getLayout = getLayout;
  export default UploadFiles;

