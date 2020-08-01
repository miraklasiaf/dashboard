import { Box } from '@chakra-ui/core';

const Inbox = (props) => (
  <Box as="svg" fill="currentColor" viewBox="0 0 20 20" {...props}>
    <path
      fillRule="evenodd"
      d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v7h-2l-1 2H8l-1-2H5V5z"
      clipRule="evenodd"
    />
  </Box>
);

export default Inbox;
