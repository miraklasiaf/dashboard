import { Box } from '@chakra-ui/core';

const Moon = (props) => (
  <Box as="svg" fill="currentColor" viewBox="0 0 20 20" {...props}>
    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
  </Box>
);

export default Moon;
