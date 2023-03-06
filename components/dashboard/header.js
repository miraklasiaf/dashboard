import NextLink from 'next/link';
import { Button, Flex, useColorModeValue, HStack } from '@chakra-ui/react';
import ThemeToggle from '../theme-toggle';
import ProfileOptions from '../profile-options';
import MobileNav from './mobile-nav';
import { MY_APP } from '@/utils/constants';

export default function Header() {
  const bgColor = useColorModeValue('white', 'gray.800');

  return (
    <Flex
      as="header"
      position="fixed"
      top={0}
      left={[0, 0, 64]}
      right={0}
      align="center"
      h={16}
      px={[4, 6, 8]}
      bg={bgColor}
      zIndex="docked"
    >
      <Flex w="full" align="center" justify="center">
        <Flex w="full" align="center" justify="space-between">
          <Flex align="center">
            <NextLink href="/dashboard" passHref>
              <Button as="a" variant="ghost" px={0} fontWeight="bold">
                {MY_APP}
              </Button>
            </NextLink>
          </Flex>

          <Flex>
            <HStack spacing="1em">
              <ThemeToggle mr={`-${3}`} />
              <ProfileOptions mr={`-${3}`}/>
            </HStack>
            <MobileNav />
          </Flex>

        </Flex>
      </Flex>
    </Flex>
  );
}
