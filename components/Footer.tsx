import { useContext } from 'react';
import {
  Box,
  Container,
  Stack,
  Text,
  Link,
  Flex,
} from '@chakra-ui/react';
import { FaTwitter, FaDiscord, FaGithub } from 'react-icons/fa';
import { AppDataContext } from './context/AppDataProvider';
import { config } from '../src/contract';


export default function Footer() {

  const {block} = useContext(AppDataContext);

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
            <Flex align={'center'} gap={1}>
            <Box h={2} w={2} bgColor={block == 0 ? 'red': 'primary'} rounded='100'></Box>
          <Text fontSize={'xs'}>{block == 0 ? 'Not Connected': block}</Text>
          <Text fontSize={'xs'}>| v{config.latest}-alpha</Text>

            </Flex>
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