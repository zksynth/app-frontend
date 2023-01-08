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


export default function Footer() {
  return (
    <Box
      bg={'gray.800'}
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