import React, { cloneElement, forwardRef } from 'react';
import { Box, Flex, useColorModeValue } from '@chakra-ui/core';
import NextLink from 'next/link';
import { useRouter } from 'next/router';

const InternalLink = ({ children, ...props }) => {
  const router = useRouter();
  let isActive = false;

  if (router.pathname === props.href) {
    isActive = true;
  }

  return (
    <NextLink passHref {...props}>
      {typeof children === 'function' ? children(isActive) : children}
    </NextLink>
  );
};

export const A = forwardRef(({ children, icon, ...props }, ref) => {
  const color = useColorModeValue('gray.500', 'gray.300');

  return (
    <Flex
      ref={ref}
      as="a"
      w="full"
      align="center"
      cursor="pointer"
      px={3}
      py={2}
      fontWeight="medium"
      color={color}
      borderRadius="md"
      outline="none"
      _focus={{ shadow: 'outline' }}
      _notFirst={{ mt: 1 }}
      {...props}
    >
      {icon && cloneElement(icon, { mr: 3 })}
      <Box w="full">{children}</Box>
    </Flex>
  );
});

export const NavLink = forwardRef(({ href, ...props }, ref) => {
  const hoverColor = useColorModeValue('gray.900', 'white');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const activeColor = useColorModeValue('gray.600', 'teal.200');
  const activeBg = useColorModeValue('gray.100', 'gray.900');

  return (
    <InternalLink href={href}>
      {(isActive) => (
        <A
          ref={ref}
          aria-current={isActive ? 'page' : undefined}
          _hover={{
            color: hoverColor,
            bg: hoverBg
          }}
          {...(isActive && {
            bg: activeBg,
            color: activeColor,
            _hover: {}
          })}
          {...props}
        />
      )}
    </InternalLink>
  );
});
