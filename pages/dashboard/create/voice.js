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

    var listsToCheck = ['list1', 'list2', 'list3', 'list4', 'list5', 'list6', 'list7', 'list8', 'list9', 'list10',
      'list11', 'list12', 'list13', 'list14', 'list15', 'list16', 'list17', 'list18', 'list19', 'list20',
      'list21', 'list22', 'list23', 'list24', 'list25', 'list26', 'list27', 'list28', 'list29', 'list30',
      'list31', 'list32', 'list33', 'list34', 'list35', 'list36', 'list37', 'list38', 'list39', 'list40',
      'list41', 'list42', 'list43', 'list44', 'list45', 'list46', 'list47', 'list48', 'list49', 'list50',
      'list51', 'list52', 'list53', 'list54', 'list55', 'list56', 'list57', 'list58', 'list59', 'list60',
      'list61', 'list62', 'list63', 'list64', 'list65', 'list66', 'list67', 'list68', 'list69', 'list70',
      'list71', 'list72',
      'list200', 'list201', 'list202', 'list203', 'list204', 'list205', 'list206', 'list207', 'list208', 'list209', 'list210',
      'list211', 'list212', 'list213', 'list214', 'list215', 'list216', 'list217', 'list218', 'list219', 'list220',
      'list221', 'list222', 'list223', 'list224', 'list225', 'list226', 'list227', 'list228', 'list229', 'list230',
      'list231', 'list232', 'list233', 'list234', 'list235', 'list236', 'list237', 'list238', 'list239', 'list240',
      'list241', 'list242', 'list243', 'list244', 'list245', 'list246', 'list247', 'list248', 'list249', 'list250',
      'list251', 'list252', 'list253', 'list254', 'list255', 'list256', 'list257', 'list258', 'list259', 'list260',
      'list261', 'list262', 'list263', 'list264', 'list265', 'list266', 'list267', 'list268', 'list269', 'list270',
      'list271', 'list272',];
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