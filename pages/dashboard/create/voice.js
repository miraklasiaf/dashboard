import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import { useAuthUserContext } from '../../../context/AuthUserContext';
import { getLayout } from '@/layouts/dashboard';

import { Box, Center, Grid, GridItem, SimpleGrid, Icon, Text, Stack, Flex, Heading } from '@chakra-ui/react';
import { Button } from '@chakra-ui/react'

import { ref, listAll, getDownloadURL, uploadBytesResumable, deleteObject, getMetadata, updateMetadata} from "firebase/storage";


// enable user to see which lists they have already done 
// enable user to select which list they want to do next 

function Voice() {
  const { authUser, loading, storage } = useAuthUserContext();
  const [firebaseData, setfirebaseData] = useState([]) // empty array
  const Router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!authUser) {Router.push('/connect/login')};
    firebaseDataretrieve();
  }, [authUser, loading]);

  const firebaseDataretrieve = () => {
    setfirebaseData([]);
    listAll(ref(storage, `user/${authUser?.uid}/voice`))
        .then(res => {
            res.items.forEach((item) => {
                getDownloadURL(item).then((url) => {
                const dataCollect = {"name": item.name, "url": url};
                if (item.name.includes(".txt")) {
                    console.log("excluded")
                } else {
                    setfirebaseData(firebaseData => [...firebaseData, dataCollect]);
                }
                })
            })
        })
    }

  // create a function that counts the numer of items in firebaseData
  const countItems = () => {
    var count = 0;
    for (var i = 0; i < firebaseData.length; i++) {
      if (firebaseData[i].name.includes(".txt")) {
        console.log("excluded")
      } else {
        count++;
      }
    }
    return count;
  }

  // create a function takes the name of each item in the firebaseData array and keep only the values before the first underscore
  const getUniqueListNames = () => {

    var uniqueListNames = [];
    for (var i = 0; i < firebaseData.length; i++) {
      if (firebaseData[i].name.includes(".txt")) {
        console.log("excluded")
      } else {
        var name = firebaseData[i].name;
        var name = name.substring(0, name.indexOf("_"));
        uniqueListNames.push(name);
      }
    }
    console.log({'uniqueListNames': uniqueListNames})

    // for every item in uniqueListnames, keep only the values before the hyphen and then count the number of times it appears in the array
    var uniqueCountNames = [];
    for (var i = 0; i < uniqueListNames.length; i++) {
      var name = uniqueListNames[i];
      var name = name.substring(0, name.indexOf("-"));
      uniqueCountNames.push(name);
    }
    console.log({'uniqueCountNames': uniqueCountNames})

    // count the number of times each item appears in the array
    var counts = [];
    uniqueCountNames.forEach(function(x) { counts[x] = (counts[x] || 0)+1; });
    console.log({'counts': counts})

    // // if each value in counts is not equal to 10, add in a percent column and calculate the percentage out of 10, else add in a percent column and set it to 100
    // for (var key in counts) {
    //   if (counts[key] < 10) {
    //     counts[key] = counts[key] * 10;
    //   } else {
    //     counts[key] = 100;
    //   }
    // }

    // count the number of times each item appears in the array and save it as an array, with each item being an object with the name and the count
    var countsArray = [];
    for (var key in counts) {
      
      // create a percentCompleted variable that is the count multiplied by 10 (to get a percentage out of 100) if the count is less than 10 and greater then 0, else set it to 100 if the count is 10 or greater, else set it to 0
      var percentCompleted = (counts[key] < 10 && counts[key] > 0) ? (counts[key] * 10) : (counts[key] >= 10) ? 100 : 0;
      countsArray.push({name: key, count: counts[key], percentCompleted: percentCompleted});

    }
    console.log({'countsArray1': countsArray})

    var listsToCheck = ['list1', 'list2', 'list3', 'list4', 'list5', 'list6', 'list7', 'list8', 'list9', 'list10'];
    // if countsArray does not contain all the lists, add them to the array with a count of 0
    for (var i = 0; i < listsToCheck.length; i++) {
      if (countsArray.some(e => e.name === listsToCheck[i])) {
        console.log("list exists")
      } else {
        countsArray.push({name: listsToCheck[i], count: 0, percentCompleted: 0});
      }
    }
    console.log({'countsArray2': countsArray})
    


    return {uniqueListNames, counts, countsArray};
  }



  const GoToSimpleRecorder = () => {
    Router.push('/dashboard/create/voice/recorder/simple')
  }

  const GoToSimpleProcess = () => {
    Router.push('/dashboard/create/voice/process/simple')
  }

  const GoToComplex = () => {
    Router.push('/dashboard/create/voice/recorder/complex')
  }

  const ListtoComplete = (listNumberString) => {
    Router.push({
      pathname: '/dashboard/create/voice/recorder/list',
      query: {list: listNumberString}
    })
  }



  return (
    <div>

      <div>
        <Heading size='lg'> Recording Metrics </Heading>
        
        
        <Text> Total number of <strong> recorded voice files </strong> : {countItems()} </Text>
            
        <br />

        {getUniqueListNames().countsArray.map((item, index) => {
              return (
                <div key={index}>
                        <Text> Total recordings from <strong> {item?.name} </strong> saved: {item?.count}; percent completed: {item?.percentCompleted}% </Text>
                </div>
              )
            }
            )}

      </div>

      <br />
      <Heading> Complete lists...</Heading>
      <p> The point of this section is to diversity the sound samples for creating a realistic voice. </p>
      <p> In order to do so we have 10 lists, each with 10 sentances that you must record yourself saying. </p> 
      <p> This will provide us with 100 audio samples that are phonetically diverse.  </p>
           
        <div>
          <Button margin='1em' onClick={() => ListtoComplete('1')}> List 1 </Button>
          <Button margin='1em'onClick={() => ListtoComplete('2')}> List 2 </Button>
          <Button margin='1em'onClick={() => ListtoComplete('3')}> List 3 </Button>
          <Button margin='1em'onClick={() => ListtoComplete('4')}> List 4 </Button>
          <br />
          <Button margin='1em'onClick={() => ListtoComplete('5')}> List 5 </Button>
          <Button margin='1em'onClick={() => ListtoComplete('6')}> List 6 </Button>
          <Button margin='1em'onClick={() => ListtoComplete('7')}> List 7 </Button>
          <Button margin='1em'onClick={() => ListtoComplete('8')}> List 8 </Button>
          <br/>
          <Button margin='1em'onClick={() => ListtoComplete('9')}> List 9 </Button>
          <Button margin='1em'onClick={() => ListtoComplete('10')}> List 10 </Button>

        </div>
             
      

      <Heading size='lg' marginTop={'1em'} marginBottom={'1em'}  > Record </Heading>
      <Heading size='md' marginTop={'-1em'}> Part 1: Record Audio (OLD SECTION TO DELETE) </Heading>
      <Box p={4}>
        <Grid templateColumns='repeat(1, 2fr)' gap={6}>
            <GridItem w='100%' h='10'> 
                <Button onClick={GoToSimpleRecorder}> Load and record simple voice questions (list-1 only) </Button>
            </GridItem>
            <GridItem w='100%' h='10'> 
                <Button onClick={GoToComplex}> Load and record complex voice questions </Button> 
            </GridItem>
          </Grid>
      </Box>

      <br />
      <Heading size='lg'> Process Audio</Heading>
      <Box p={4}>
        <Grid templateColumns='repeat(1, 2fr)' gap={6}>
            <GridItem w='100%' h='10'> 
                <Button onClick={GoToSimpleProcess}> Create and process a simple voice </Button>
            </GridItem>
        </Grid>
      </Box>

    </div>
  );
}

Voice.getLayout = getLayout;
export default Voice;