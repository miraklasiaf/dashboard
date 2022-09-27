import React, { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/router';
import { getLayout } from '@/layouts/dashboard';

import { useAuthUserContext } from '../../../../../context/AuthUserContext';
import { ref, listAll, getDownloadURL, uploadBytesResumable, deleteObject, getMetadata, updateMetadata} from "firebase/storage";

import { Switch, FormLabel, IconButton, SettingsIcon, Box, Center, Grid, GridItem, SimpleGrid, Icon, Text, Stack, Flex, Heading } from '@chakra-ui/react';
import { Button } from '@chakra-ui/react'

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
            setfirebaseData(firebaseData => [...firebaseData, dataCollect]);
            }).catch((error) => {
            console.log(error);
            })
        }).catch((error) => {
            console.log(error);
        }
        )
        }).catch((error) => {
        console.log(error);
        }
    )
    }

    const handleCheck = (e) => {
        const { checked } = e.target;
        const { value } = e.target;
        console.log(checked);
        console.log(value);
        if (checked) {
            setCheckedRows(checkedRows => [...checkedRows, value]);
        } else {
            setCheckedRows(checkedRows.filter(item => item !== value));
        }
    }

    // // go through each item in checkRows, and remove all characters after the _ and add the value to checkedRowsValues
    // const cleanprocess1 = () => {
    //     checkedRows.forEach((item) => {
    //         const clean = item.split("_")[0];
    //         setCheckedRowsValues(checkedRowsValues => [...checkedRowsValues, clean]);
    //     })
    //     console.log('setCheckedRowsValues: ', checkedRowsValues);
    //     const filteredTemp = simpleList.filter(item => checkedRowsValues.includes(item.id));
    //     setFiltered1(filteredTemp);
    // }

    // const cleanprocess2 = () => {
    //     // then add in the url from firebaseData for the matching items
    //     const filtered2temp = filtered1.forEach((item) => {
    //         firebaseData.forEach((data) => {
    //             if (data.name.includes(item.id)) {
    //                 item.url = data.url;
    //             }
    //         })
    //     }
    //     )
    //     console.log('filtered2: ', filtered2temp);
    //     setFiltered2(filtered2temp);
    // }


    const consoleLogCheckedRows = async () => {
        console.log('initialChecked: ', checkedRows);
        // await cleanprocess1();
        // console.log('filtered1: ', filtered1);
        // // cleanprocess2();
    }


    const clearSelections = () => {
        setCheckedRows([]);
        setAllChecked(false);
        // reload page to clear selections
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
        <p> <strong> Rows selected for processing: </strong> {checkedRows} </p>

        <br/>
        <Button onClick={consoleLogCheckedRows}> Test Button </Button>

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
                                <Switch value={fileInfo.name} onChange={handleCheck} colorScheme='green'>  </Switch>
                            ) : (
                                <Switch value={fileInfo.name}  onChange={handleCheck} colorScheme='green' isChecked>  </Switch>
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