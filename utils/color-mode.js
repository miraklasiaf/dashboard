import { useColorMode as useChakraColorMode } from '@chakra-ui/core';

export default function useColorMode() {
  const { colorMode, toggleColorMode } = useChakraColorMode();

  const isDarkMode = colorMode === 'dark';
  const isLightMode = colorMode === 'light';
  const newColorMode = isLightMode ? 'dark' : 'light';

  const toggle = () => {
    toggleColorMode();
    document.cookie = `colorMode=${newColorMode}`;
  };

  return {
    colorMode,
    toggleColorMode: toggle,
    isDarkMode,
    isLightMode,
    newColorMode
  };
}
