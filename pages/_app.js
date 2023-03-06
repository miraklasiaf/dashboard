import React from 'react';
import { ChakraProvider, CSSReset } from '@chakra-ui/react';
import Nprogress from '@/components/nprogress';
import theme from '@/components/design-system';
import DefaultLayout from '@/layouts/default';

import { AuthUserProvider } from '../context/AuthUserContext';


const App = ({ Component, pageProps }) => {
  const getLayout =
    Component.getLayout || ((page) => <DefaultLayout children={page} />);

  return (
    <AuthUserProvider>
      <ChakraProvider theme={theme}>
        <CSSReset />
        <Nprogress />
        {getLayout(<Component {...pageProps} />)}
      </ChakraProvider>
    </AuthUserProvider>

  );
};

export default App;
