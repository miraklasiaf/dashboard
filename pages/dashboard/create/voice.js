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
        // console.log("excluded")
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
    // console.log({'uniqueListNames': uniqueListNames})

    // for every item in uniqueListnames, keep only the values before the hyphen and then count the number of times it appears in the array
    var uniqueCountNames = [];
    for (var i = 0; i < uniqueListNames.length; i++) {
      var name = uniqueListNames[i];
      var name = name.substring(0, name.indexOf("-"));
      uniqueCountNames.push(name);
    }
    // console.log({'uniqueCountNames': uniqueCountNames})

    // count the number of times each item appears in the array
    var counts = [];
    uniqueCountNames.forEach(function(x) { counts[x] = (counts[x] || 0)+1; });

    // count the number of times each item appears in the array and save it as an array, with each item being an object with the name and the count
    var countsArray = [];
    for (var key in counts) {
      
      // create a percentCompleted variable that is the count multiplied by 10 (to get a percentage out of 100) if the count is less than 10 and greater then 0, else set it to 100 if the count is 10 or greater, else set it to 0
      var percentCompleted = (counts[key] < 10 && counts[key] > 0) ? (counts[key] * 10) : (counts[key] >= 10) ? 100 : 0;
      countsArray.push({name: key, count: counts[key], percentCompleted: percentCompleted});

    }
    // console.log({'countsArray1': countsArray})

    var listsToCheck = ['list1', 'list2', 'list3', 'list4', 'list5', 'list6', 'list7', 'list8', 'list9', 'list10'];
    // if countsArray does not contain all the lists, add them to the array with a count of 0
    for (var i = 0; i < listsToCheck.length; i++) {
      if (countsArray.some(e => e.name === listsToCheck[i])) {
        // console.log("list exists")
      } else {
        countsArray.push({name: listsToCheck[i], count: 0, percentCompleted: 0});
      }
    }
    // console.log({'countsArray2': countsArray})
    return {uniqueListNames, counts, countsArray};
  }


  const GoToSimpleProcess = () => {
    Router.push('/dashboard/create/voice/process/simple')
  }

  const ListtoComplete = (itemname) => {
    // keep characters after the last t in the string
    var listNumberString = itemname.substring(itemname.lastIndexOf("t") + 1);
    console.log({'to send': listNumberString})
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
      </div>

      <br />

      {/* create two columns with 2em between them */}
      <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
        <div>
          <Heading> Simple voice training </Heading>
          <p> The point of this section is to create a simple voice that can be used for testing purposes. </p>
          <p> In order to do so we have 10 sentances that you must record yourself saying. </p>
          <p> This will provide us with 10 audio samples that are phonetically diverse.  </p>
          <br/>
          <Button backgroundColor='blue.500' onClick={GoToSimpleProcess} marginBottom='2em'> Click here once you have completed at least 5 lists to create and process a simple voice </Button>
          <br />  
          <p> The lists you <strong> have and have not yet  </strong> completed:</p>
            { getUniqueListNames().countsArray.map((item, index) => {
                return (
                  <div key={index}>
                    {item?.percentCompleted < 100 ? 
                      <Button margin='1em' onClick={() => ListtoComplete(item?.name)} backgroundColor='yellow.500'> {item?.name} - incomplete </Button> :
                      <Button margin='1em' onClick={() => ListtoComplete(item?.name)} backgroundColor='green.500'> {item?.name} - completed </Button>
                    }
                  </div>
                )
              }
              )
            }
        </div>

      </div>

    </div>
  );
}

Voice.getLayout = getLayout;
export default Voice;