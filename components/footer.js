import { Stack, Link, Box, useColorModeValue } from '@chakra-ui/react';
import { links } from '@/utils/constants';

export default function Footer() {
  const color = useColorModeValue('gray.900', 'gray.200');
  const bgColor = useColorModeValue('gray.200', 'gray.500');

  return (
    <Stack direction="row" as="footer" mt={12} justify="center">
      {links.map(([icon, route, title]) => (
        <Link
          href={route}
          key={route}
          isExternal
          title={title}
          color={color}
          borderRadius="lg"
          p={2}
          _hover={{ bg: bgColor }}
        >
          <Box as={icon} boxSize={6} />
        </Link>
      ))}
    </Stack>
  );
}
