import React, { useEffect } from "react";
import { useRouter } from 'next/router';
import { useAuthUserContext } from '../../../context/AuthUserContext';
import { getLayout } from '@/layouts/dashboard';

import { Box, Center, Grid, GridItem, SimpleGrid, Icon, Text, Stack, Flex, Heading } from '@chakra-ui/react';
import { Button } from '@chakra-ui/react'


function Voice() {
  const { authUser, loading } = useAuthUserContext();
  const Router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!authUser) {Router.push('/connect/login')};
  }, [authUser, loading]);

  const GoToSimpleRecorder = () => {
    Router.push('/dashboard/create/voice/recorder/simple')
  }

  const GoToSimpleProcess = () => {
    Router.push('/dashboard/create/voice/process/simple')
  }

  const GoToComplex = () => {
    Router.push('/dashboard/create/voice/recorder/complex')
  }



  return (
    <div>

      <Heading size='md'> Part 1: Record Audio</Heading>
      <Box p={4}>
        <Grid templateColumns='repeat(1, 2fr)' gap={6}>
            <GridItem w='100%' h='10'> 
                <Button onClick={GoToSimpleRecorder}> Load and record simple voice questions </Button>
            </GridItem>
            <GridItem w='100%' h='10'> 
                <Button onClick={GoToComplex} isDisabled={true}> Load and record complex voice questions </Button> 
            </GridItem>
          </Grid>
      </Box>

      <Heading size='md'> Part 2: Process Audio</Heading>
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