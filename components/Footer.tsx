import { ReactNode } from 'react';
import {
  Box,
  Container,
  Stack,
  SimpleGrid,
  Text,
  Link,
  VisuallyHidden,
  chakra,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaTwitter, FaYoutube, FaInstagram, FaDiscord, FaGithub } from 'react-icons/fa';

const ListHeader = ({ children }: { children: ReactNode }) => {
  return (
    <Text fontWeight={'500'} fontSize={'lg'} mb={2}>
      {children}
    </Text>
  );
};

const SocialButton = ({
  children,
  label,
  href,
}: {
  children: ReactNode;
  label: string;
  href: string;
}) => {
  return (
    <chakra.button
      bg={useColorModeValue('blackAlpha.100', 'whiteAlpha.100')}
      rounded={'full'}
      w={8}
      h={8}
      cursor={'pointer'}
      as={'a'}
      href={href}
      display={'inline-flex'}
      alignItems={'center'}
      justifyContent={'center'}
      transition={'background 0.3s ease'}
      _hover={{
        bg: useColorModeValue('blackAlpha.200', 'whiteAlpha.200'),
      }}>
      <VisuallyHidden>{label}</VisuallyHidden>
      {children}
    </chakra.button>
  );
};

export default function LargeWithAppLinksAndSocial() {
  return (
    <Box
      bg={'#171717'}
      color={'gray.200'}
      mt={10}>
      <Box
        borderTopWidth={1}
        borderStyle={'solid'}
        borderColor={'#171717'}>
        <Container
          as={Stack}
          maxW={'1200px'}
          py={2}
          direction={{ base: 'column', md: 'row' }}
          spacing={4}
          justify={{ md: 'space-between' }}
          align={{ md: 'center' }}>
          <Text fontSize={'xs'} mb={1}>© 2022 SyntheX Finance. All rights reserved</Text>
          <Stack direction={'row'} spacing={6}>
            <Link target={'_blank'} href={'https://twitter.com/synthe_x'}>
              <FaTwitter />
            </Link>
            <Link target={'_blank'} href={'https://discord.gg/SN5wJEBGvb'}>
              <FaDiscord />
            </Link>
            <Link target={'_blank'} href={'https://github.com/synthe-x'}>
              <FaGithub />
            </Link>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}