import React, { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/router';
import { getLayout } from '@/layouts/dashboard';

import { useAuthUserContext } from '../../../../../context/AuthUserContext';
import { ref, listAll, getDownloadURL, uploadBytesResumable, deleteObject, getMetadata, updateMetadata} from "firebase/storage";

import { Switch, FormLabel, IconButton, SettingsIcon, Box, Center, Grid, GridItem, SimpleGrid, Icon, Text, Stack, Flex, Heading } from '@chakra-ui/react';
import { Button, Badge, Tag} from '@chakra-ui/react'

import ReactAudioPlayer from 'react-audio-player';

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

function SimpleProcess() {

    const { authUser, loading, storage } = useAuthUserContext();
    const Router = useRouter();
    const [firebaseData, setfirebaseData] = useState([]) // empty array
    const [simpleList, setSimpleList] = useState(null);
    const [checkedRows, setCheckedRows] = useState([]);
    const [checkedRowsValues, setCheckedRowsValues] = useState([]);
    const [checkedRowsValuesUrls, setCheckedRowsValuesUrls] = useState([]);
    const [allChecked, setAllChecked] = useState(false);
    const [filtered1, setFiltered1] = useState([]);
    const [filtered2, setFiltered2] = useState([]);

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


    const handleCheck = (e) => {
        const { checked } = e.target;
        const { value } = e.target;
        const { id } = e.target;

        // create simple value that only contains the characters before the first underscore
        const simpleValue = value.split("_")[0];
        console.log(checked);
        console.log(value);
        console.log(id);
        if (checked) {
            setCheckedRows(checkedRows => [...checkedRows, value]);
            setCheckedRowsValues(checkedRowsValues => [...checkedRowsValues, simpleValue]);
            setCheckedRowsValuesUrls(checkedRowsValuesUrls => [...checkedRowsValuesUrls, id]);
        } else {
            setCheckedRows(checkedRows.filter(item => item !== value));
            setCheckedRowsValues(checkedRowsValues.filter(item => item !== simpleValue));
            setCheckedRowsValuesUrls(checkedRowsValuesUrls.filter(item => item !== id));
        }
    }



    const handleSaveMetaDataFile = async (textFile) => {
        const fileName = "metaData_list1_" + new Date().getTime() + ".txt";
        // const blob = new Blob(textFile, {type: "text/plain;charset=utf-8"});
        const blob = new Blob(textFile, {type:"text/plain;charset=utf-8", lastModified:new Date()});
        const file = new File([blob], fileName, {type:"text/plain;charset=utf-8", lastModified:new Date()});
        const storageRef = ref(storage, `user/${authUser?.uid}/voice/${fileName}`);
        uploadBytesResumable(storageRef, file);
      };



    const testSubmitButton = async () => {

        console.log('initialChecked: ', checkedRows);
        console.log('initialCheckedValues: ', checkedRowsValues);
        console.log('initialCheckedValuesUrls: ', checkedRowsValuesUrls);

        // create a new array that pulls matching items from simpleList and checkRows
        const filteredTemp = simpleList.filter(item => checkedRowsValues.includes(item.id));
        
        // create new array that adds checkRows values to matching simpleList items based on simpleList id
        filteredTemp.forEach((item) => {
            firebaseData.forEach((data) => {
                if (data.name.includes(item.id)) {
                    item.url = data.url;
                    item.name = data.name;
                }
            })
        }
        )

        console.log('filteredTemp: ', filteredTemp);

        // create custom text file that loops through filteredTemp and create a new line for each item, keeping name | sentance
        const textFile = filteredTemp.map((item) => {
            return item.name + ' | ' + item.sentance;
        }
        )

        console.log('textFile: ', textFile);
        handleSaveMetaDataFile(textFile);

    }


    const clearSelections = () => {
        setCheckedRows([]);
        setAllChecked(false);
        Router.reload();
    }

    const selectedAllRows = () => {
        setAllChecked(true);
        setCheckedRows(firebaseData.map(item => item.name));
    }


    const retrieveSimple = async () => {
        const simpleData = await fetch('https://server.appliedhealthinformatics.com/sentances/list/1')
        .then(response => response.json())
        // catch error
        .catch(error => console.log(error))
        .then(data => {
            console.log('data retrieved: ', data);
            setSimpleList(data);
        });
    }


    const PreviewFile = (rowUrl) => {
    if (rowUrl.includes('.jpg') || rowUrl.includes('.jpeg') || rowUrl.includes('.png') || rowUrl.includes('.gif')) {
        return (
        <Avatar src={rowUrl} size='lg'/>
        )
    }
    else if (rowUrl.includes('.wav') || rowUrl.includes('.mp3')) {
        return (
        <ReactAudioPlayer src={rowUrl} controls />
        )
    }
    else if (rowUrl.includes('.txt')) {
        console.log('rowUrl: ', rowUrl);
        return (
        <Tag size='sm'> <object data={rowUrl} margin='0'/> </Tag>
        )
    }
    }


    useEffect(() => {
        if (loading) return;
        if (!authUser) {Router.push('/connect/login')};
        firebaseDataretrieve();
        retrieveSimple();
    }, [authUser, loading]);


    return (
    <div>

        <Heading size='md'> Simple Voice Processing</Heading>

        <br />
        <p> <strong> Rows selected for processing Full Name: </strong> </p>

        {checkedRows.length > 0 && checkedRows.map((item) => {
            return (
                <Badge colorScheme='green' ml='2'> {item} </Badge>
            )
            }
        )}
        
        <br />
        <p> <strong> Rows selected for processing Short Name: </strong> </p>

        {checkedRowsValues.length > 0 && checkedRowsValues.map((item) => {
            return (
                <Badge colorScheme='red' ml='2'> {item} </Badge>
            )
            }
        )}

        <br />
        <p> <strong> Rows selected for processing URLs: </strong> </p>

        {checkedRowsValuesUrls.length > 0 && checkedRowsValuesUrls.map((item) => {
            return (
                <Badge colorScheme='purple' ml='2'> {item} </Badge>
            )
            }
        )}

        <br/>
        <Button onClick={testSubmitButton}> Test Submit Button </Button>
        <br />

        <br />
        {checkedRows.length > 0 && (
            <Button onClick={clearSelections}> Clear selections </Button>
        )}
        <br />

        {/* <br />
        <Button onClick={selectedAllRows}> Select all </Button>
        <br /> */}

        {/* <br />
        {checkedRows.length > 0 && (
            <Button> Process with selected rows </Button>
        )} */}
        

        <TableContainer mt='50'>
            <Table variant='simple' maxWidth='100%' display='block' overflowX='auto'>
                <Thead>
                <Tr>
                    <Th>Name</Th>
                    <Th>Include</Th>
                    <Th>Preview </Th>
                </Tr>
                </Thead>
                <Tbody>
                    {firebaseData.sort((a, b) => (a.name > b.name) ? 1 : -1).map((fileInfo, index) => (
                    <Tr key={index}>
                        <Td> {fileInfo.name} </Td>
                        <Td> 
                            {!allChecked ? (
                                <Switch value={fileInfo.name} id={fileInfo.url} onChange={handleCheck} colorScheme='green'>  </Switch>
                            ) : (
                                <Switch value={fileInfo.name} id={fileInfo.url} onChange={handleCheck} colorScheme='green' isChecked>  </Switch>
                            )}
                        </Td>
                        <Td> {PreviewFile(fileInfo.url)} </Td>
                    </Tr>
                    ))}
                </Tbody>
            </Table>
        </TableContainer>




    </div>
  );
}

SimpleProcess.getLayout = getLayout;
export default SimpleProcess;