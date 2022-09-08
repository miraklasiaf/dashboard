import { getLayout } from '@/layouts/dashboard';

import React, { useEffect } from "react";
import { useRouter } from 'next/router';
import { useAuthUserContext } from '../../context/AuthUserContext';

import { Box, Center, Grid, GridItem, SimpleGrid, Icon, Text, Stack, Flex } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

import { Button } from '@chakra-ui/react'



function Create() {

    const { authUser, loading } = useAuthUserContext();
    const Router = useRouter();
    
    useEffect(() => {
      if (loading) return;
      if (!authUser) {Router.push('/connect/login')};
    }, [authUser, loading]);

    const displayName = authUser?.uid;
    const displayEmail = authUser?.email;

    const GoToDigitalClone = () => {
      Router.push('/dashboard/create/clone')
    }

    return (
      <div>


    `  <Box p={4}>
        <Grid templateColumns='repeat(1, 1fr)' gap={6}>
            <GridItem w='100%' h='10'> 
              <Center>
                <Button isDisabled='true'> Cartoonize Face </Button> 
              </Center>
            </GridItem>
            <GridItem w='100%' h='10'> 
              <Center>
                <Button isDisabled='true'> Clone Voice </Button>
              </Center>
            </GridItem>
            <GridItem w='100%' h='10'> 
              <Center>
                <Button isDisabled='true'> Text to Cloned Voice </Button> 
              </Center>
            </GridItem>
            <GridItem w='100%' h='10'> 
              <Center>
                <Button onClick={GoToDigitalClone}> Digital Clone </Button> 
              </Center>
            </GridItem>
          </Grid>
      </Box>`




      </div>
    );

}

Create.getLayout = getLayout;
export default Create;