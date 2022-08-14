import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase/firebase";
import Router from 'next/router'
import { getLayout } from '@/layouts/dashboard';
import ReactAudioPlayer from 'react-audio-player';


import { getFileSingle, getFiles, uploadFile, deleteFile } from "../../services/FileuploadService";

import { Box, Heading, Avatar, Flex, Header, Grid, GridItem, Button, Select } from '@chakra-ui/react';

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

function Team() {
    const [user, loading, error] = useAuthState(auth);
    const [fileInfos, setFileInfos] = useState([]);
    const [audioFiles, setAudioFiles] = useState([]);
    const [imageFiles, setImageFiles] = useState([]);
    const [selectedAudio, setSelectedAudio] = useState([]);
    const [selectedImage, setSelectedImage] = useState([]);
    const [selectedAudioPreview, setSelectedAudioPreview] = useState([]);
    const [selectedImagePreview, setSelectedImagePreview] = useState([]);
    const [previewDone, setPreviewDone] = useState(false);

    useEffect(() => {
        if (loading) return;
        if (!user) {Router.push('/connect/login')};
      }, [user, loading]);


    useEffect(() => {
      try {
        getFiles().then((response) => {
          setFileInfos(response.data);
          // if file name ends with .wav, add to audioFiles array
          for (let i = 0; i < response.data.length; i++) {
            if (response.data[i].name.endsWith(".wav") || response.data[i].name.endsWith(".m4a")) {
              setAudioFiles(audioFiles => [...audioFiles, response.data[i]]);
            }
            // if file name ends with .png, add to imageFiles array
            if (response.data[i].name.endsWith(".jpg") || response.data[i].name.endsWith(".jpeg")) {
              setImageFiles(imageFiles => [...imageFiles, response.data[i]]);
            }
          }
        });
      }
        catch (error) {
            console.log(error);
        }
    }, []);







    const generatePreview = () => {

      console.log("buttonClick1");
      console.log('currentAudioSelected: ', selectedAudio);
      console.log('currentImageSelected: ', selectedImage);

      // find matched selectedAudio from fileInfos
      for (let i = 0; i < fileInfos.length; i++) {
        if (fileInfos[i].name === selectedAudio) {
          console.log('matched audio: ', fileInfos[i]);
          setSelectedAudioPreview(fileInfos[i]);
        }
      };

      // find matched selectedImage from fileInfos
      for (let i = 0; i < fileInfos.length; i++) {
        if (fileInfos[i].name === selectedImage) {
          console.log('matched image: ', fileInfos[i]);
          setSelectedImagePreview(fileInfos[i]);
        }
      };





      setPreviewDone(true);

    }









      return (
        <div>
           

           <Heading mb='10'> Create </Heading>

           <Grid templateColumns='repeat(5, 1fr)' gap={6} mb='10'>
            <GridItem w='100%' h='10'>
              <Box p={5} shadow='md' borderWidth='1px'>
                <Heading fontSize='xl' mb='2'>Image</Heading> 
                <Select
                      value={selectedImage}
                      onChange={(e) => setSelectedImage(e.target.value)}
                    > 
                    {imageFiles.map((fileInfo) => (
                      <option key={fileInfo.id} value={fileInfo.id}>{fileInfo.name}</option>
                    ))}
                </Select>             
              </Box>
            </GridItem>

            <GridItem w='100%' h='10'>
              <Box p={5} shadow='md' borderWidth='1px'>
                <Heading fontSize='xl' mb='2'>Audio</Heading> 
                  <Select 
                  value={selectedAudio}
                  onChange={(e) => setSelectedAudio(e.target.value)}
                  > 
                    {audioFiles.map((fileInfo) => (
                      <option key={fileInfo.id} value={fileInfo.id}>{fileInfo.name}</option>
                    ))}
                  </Select>             
              </Box>
            </GridItem>

            <GridItem w='100%' h='10'>
              <Button onClick={generatePreview} colorScheme='pink'>
              Preview
              </Button>
            </GridItem>

          </Grid>





          {previewDone && (
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
                                <Td> <Avatar src={selectedImagePreview.url} size='xl'/> </Td>
                                <Td> 
                                    <ReactAudioPlayer 
                                        src={selectedAudioPreview.url}
                                        controls
                                    /> 
                                </Td>
                                {/* <Td> 
                                  <audio controls>
                                    <source src={selectedAudioPreview.url} type="audio/wav"/>
                                  </audio>
                                </Td> */}
                            </Tr>
                    </Tbody>
                </Table>
            </TableContainer>
        </Flex>
        )}


          {previewDone && (
            <Flex>
              <Grid templateColumns='repeat(5, 1fr)' gap={6} mt='10'>
                <GridItem w='100%' h='10'>
                <Button> Run API #1 </Button> 
                </GridItem>
                <GridItem w='100%' h='10'>
                <Button> Run API #2 </Button>
                </GridItem>
                <GridItem w='100%' h='10'>
                <Button> Run API #3 </Button>
                </GridItem>
              </Grid>
            </Flex>
          )}



        </div>
      );
    }

Team.getLayout = getLayout;
export default Team;