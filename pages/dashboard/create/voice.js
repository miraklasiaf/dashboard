import React, { useEffect } from "react";
import { useRouter } from 'next/router';
import { useAuthUserContext } from '../../../context/AuthUserContext';
import { getLayout } from '@/layouts/dashboard';

import { Box, Center, Grid, GridItem, SimpleGrid, Icon, Text, Stack, Flex } from '@chakra-ui/react';
import { Button } from '@chakra-ui/react'


function Voice() {
  const { authUser, loading } = useAuthUserContext();
  const Router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!authUser) {Router.push('/connect/login')};
  }, [authUser, loading]);

  const GoToSimple = () => {
    Router.push('/dashboard/create/voice/simple')
  }

  const GoToComplex = () => {
    Router.push('/dashboard/create/voice/complex')
  }

  return (
    <div>

`  <Box p={4}>
        <Grid templateColumns='repeat(1, 1fr)' gap={6}>
            <GridItem w='100%' h='10'> 
              <Center>
                <Button onClick={GoToSimple}> Simple Voice </Button>
              </Center>
            </GridItem>
            <GridItem w='100%' h='10'> 
              <Center>
                <Button onClick={GoToComplex}> Complex Voice </Button> 
              </Center>
            </GridItem>
          </Grid>
      </Box>`


    </div>
  );
}

Voice.getLayout = getLayout;
export default Voice;