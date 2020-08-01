import { Box } from '@chakra-ui/core';

const Folder = (props) => (
  <Box as="svg" fill="currentColor" viewBox="0 0 20 20" {...props}>
    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
  </Box>
);

export default Folder;
