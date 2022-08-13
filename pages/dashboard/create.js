import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase/firebase";
import Router from 'next/router'
import { getLayout } from '@/layouts/dashboard';

import { getFileSingle, getFiles, uploadFile, deleteFile } from "../../services/FileuploadService";

import { Header, Grid, GridItem, Button, Select } from '@chakra-ui/react';

function Team() {
    const [user, loading, error] = useAuthState(auth);
    const [fileInfos, setFileInfos] = useState([]);
    const [audioFiles, setAudioFiles] = useState([]);
    const [imageFiles, setImageFiles] = useState([]);
    const [selectedAudio, setSelectedAudio] = useState(undefined);
    const [selectedImage, setSelectedImage] = useState(undefined);
    const [buttonClicked1, setButtonClicked1] = useState(false);

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


    const buttonClick1 = () => {

      console.log("buttonClick1");
      console.log('currentAudioSelected: ', selectedAudio);
      console.log('currentImageSelected: ', selectedImage);

      setButtonClicked1(true);
    }







      return (
        <div>
           

           <Grid templateColumns='repeat(5, 1fr)' gap={6}>
            <GridItem w='100%' h='10'>
              <Select 
                value={selectedAudio}
                onChange={(e) => setSelectedAudio(e.target.value)}
              > 
                  {audioFiles.map((fileInfo) => (
                    <option key={fileInfo.id} value={fileInfo.id}>{fileInfo.name}</option>
                  ))}
              </Select> 
            </GridItem>
            <GridItem w='100%' h='10'>
              <Select
                value={selectedImage}
                onChange={(e) => setSelectedImage(e.target.value)}
              > 
              {imageFiles.map((fileInfo) => (
                <option key={fileInfo.id} value={fileInfo.id}>{fileInfo.name}</option>
              ))}
            </Select> 
            </GridItem>
            <GridItem w='100%' h='10'>
              <Button onClick={buttonClick1}>
              Select and Run
            </Button>
            </GridItem>
          </Grid>











        </div>
      );
    }

Team.getLayout = getLayout;
export default Team;