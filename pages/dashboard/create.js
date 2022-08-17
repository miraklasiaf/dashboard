import React, { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import { useAuthUserContext } from '../../context/AuthUserContext';
import { getLayout } from '@/layouts/dashboard';
import { getStorage, ref, listAll, getDownloadURL, uploadBytesResumable, deleteObject} from "firebase/storage";
import ReactAudioPlayer from 'react-audio-player';

import {Table, Thead, Tbody, Tr, Th, Td, TableContainer} from '@chakra-ui/react'
import { Box, Heading, Avatar, Flex, Grid, GridItem, Button, Select } from '@chakra-ui/react';

function Create() {

  const { authUser, loading, storage } = useAuthUserContext();
  const Router = useRouter();
  const [audioFiles, setAudioFiles] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [selectedAudio, setSelectedAudio] = useState([]);
  const [selectedImage, setSelectedImage] = useState([]);
  const [previewDone, setPreviewDone] = useState(false);


  useEffect(() => {
    if (loading) return;
    if (!authUser) {Router.push('/connect/login')};
    firebaseDataretrieve();
  }, [authUser, loading]);

  const firebaseDataretrieve = () => {
    setAudioFiles([]);
    setImageFiles([]);
    listAll(ref(storage, `user/${authUser?.uid}`))
      .then(res => {
        res.items.forEach((item) => {
          getDownloadURL(item).then((url) => {
            const dataCollect = {"name": item.name, "url": url};
            if (item.name.includes(".wav") || item.name.includes(".m4a")) {
              setAudioFiles(audioFiles => [...audioFiles, dataCollect]);
            }
            if (item.name.includes(".jpg") || item.name.includes(".jpeg") || item.name.includes(".png")) {
              setImageFiles(imageFiles => [...imageFiles, dataCollect]);
            }
          }).catch(err => {
            console.log(err);
          })
        })
      }).catch(err => {
        console.log(err);
      })
  }


  const generatePreview = () => {

    console.log("buttonClick1");
    console.log('currentAudioSelected: ', selectedAudio);
    console.log('currentImageSelected: ', selectedImage);

    // // find matched selectedAudio from fileInfos
    // for (let i = 0; i < fileInfos.length; i++) {
    //   if (fileInfos[i].name === selectedAudio) {
    //     console.log('matched audio: ', fileInfos[i]);
    //     setSelectedAudioPreview(fileInfos[i]);
    //   }
    // };

    // // find matched selectedImage from fileInfos
    // for (let i = 0; i < fileInfos.length; i++) {
    //   if (fileInfos[i].name === selectedImage) {
    //     console.log('matched image: ', fileInfos[i]);
    //     setSelectedImagePreview(fileInfos[i]);
    //   }
    // };

    setPreviewDone(true);

  }






  return (
    <div>

          <Grid templateColumns='repeat(5, 1fr)' gap={6} mb='10'>
            <GridItem w='100%' h='10'>
              <Box p={5} shadow='md' borderWidth='1px'>
                <Heading fontSize='xl' mb='2'>Image</Heading> 
                <Select
                      value={selectedImage}
                      onChange={(e) => setSelectedImage(e.target.value)}
                    > 
                    {imageFiles.map((fileInfo) => (
                      <option key={fileInfo.id} value={fileInfo.url}>{fileInfo.name}</option>
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
                      <option key={fileInfo.id} value={fileInfo.url} >{fileInfo.name}</option>
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
                                <Td> <Avatar src={selectedImage} size='xl'/> </Td>
                                <Td> 
                                    <ReactAudioPlayer 
                                              src={selectedAudio}
                                              controls
                                          /> 
                                </Td>
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

Create.getLayout = getLayout;
export default Create;