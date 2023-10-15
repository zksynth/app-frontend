import { Box, Button, Divider, Flex, Heading, IconButton, Tag, Tooltip, useColorMode } from '@chakra-ui/react'
import React, { useEffect } from 'react'
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  TableContainer,
  Text,
  Image
} from '@chakra-ui/react'
import { EPOCH_ENDPOINT, EPOCH_REWARDS, dollarFormatter, tokenFormatter } from '../../src/const';
import Head from 'next/head';
import { useAccount } from 'wagmi';
import { useDexData } from '../context/DexDataProvider';
import LeaderboardRow from '../others/LeaderboardRow';
import { VARIANT } from '../../styles/theme';
import { useCountdown } from '../context/useCountdown';
import axios from 'axios';
import {
  ROUTER_ENDPOINT,
  query_claim_rewards,
  query_leaderboard,
} from "../../src/queries/dex";
import { getContract, send } from '../../src/contract';

export default function Leaderboard({epochIndex}: any) {
  const { epoches } = useDexData();
  const { address } = useAccount();
  const [loading, setLoading] = React.useState(false);

  const rank = epoches[epochIndex]?.users?.findIndex((user: any) => user.address.toLowerCase() === address?.toLowerCase()) + 1;
  const isAddressInLeaderboard = rank > 0;
  const multiplier = rank <= 0 ? '1x' : rank < 10 ? '2x' : rank < 25 ? '1.5x' : '1x';

  const {colorMode} = useColorMode();

  const user = epoches[epochIndex]?.user ?? {totalPoints: 0, totalVolumeUSD: 0};

  const [days, hours, minutes, seconds] = useCountdown(epoches[epochIndex]?.endAt * 1000 || Date.now());
  // If ending today, show countdown from endAt, else show date
  const ending = () => {
    if ((new Date(epoches[epochIndex]?.endAt * 1000).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})) == new Date(Date.now()).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) && (epoches[epochIndex]?.endAt * 1000) > Date.now()){
        return {title: "Ending In", value: hours + ":"+ minutes + ":"+ seconds}
    }
    // If already ended, show ended
    else if ((epoches[epochIndex]?.endAt * 1000) < Date.now()){
      return {title: "Ended", value: new Date(epoches[epochIndex]?.endAt * 1000).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}
    }
    else {
      return {title: "Ending On", value: new Date(epoches[epochIndex]?.endAt * 1000).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}
    }
  }

  const [claimData, setClaimData] = React.useState<any>({});

  useEffect(() => {
    if(claimData[epochIndex]) return;
    if(!address) return;
    if(!epoches[epochIndex]?.id) return;
    const chainId: number = Number(process.env.NEXT_PUBLIC_CHAIN_ID as string);

    let _getDataForProof = fetch(
      `${EPOCH_ENDPOINT}/epoch/user/${
        epoches[epochIndex].id
      }/${address?.toLowerCase()}`
    );

    let _getEpochData = axios.post(ROUTER_ENDPOINT(chainId), {
      query: query_claim_rewards(
        address.toLowerCase(),
        epoches[epochIndex].id
      ),
      variables: {},
    });

    Promise.all([_getDataForProof, _getEpochData]).then(async (data) => {
      console.log(data, epochIndex);
      const getDataForProof = data[0];
      const getEpochData = data[1];

      if (getDataForProof.status !== 200) {
        setClaimData({...claimData, [epochIndex]: {
          message: "Claiming not enabled yet",
          canClaim: false,
        }})
        return;
      }

      if (getEpochData.status !== 200) {
        setClaimData({...claimData, [epochIndex]: {
          message: "Claiming not enabled yet",
          canClaim: false,
        }})
        return;
      }

      const claimRewardsContractAddress =
        getEpochData.data.data.epoch.rewardsContract;
      const isClaim = getEpochData.data.data.epoch.users[0].claim;
      if (!claimRewardsContractAddress) {
        setClaimData({...claimData, [epochIndex]: {
          message: "Claiming not enabled yet",
          canClaim: false,
        }})
        return;
      }
      if (isClaim) {
        setClaimData({...claimData, [epochIndex]: {
          message: "ALREADY_CLAIMED",
          canClaim: false,
        }})
        return;
      }

      const getProofAndAmount = (await getDataForProof.json()).data;
      const { proof, userData } = getProofAndAmount;
      const { rewardTokenAlloted } = userData;

      setClaimData({...claimData, [epochIndex]: {
        canClaim: true,
        proof,
        rewardTokenAlloted,
        claimRewardsContractAddress
      }});
    })
  }, [address, epochIndex, epoches]);

  console.log(claimData);

  const claimRewards = async () => {
    if (!address || !claimData[epochIndex]?.canClaim) {
      return;
    }
    setLoading(true);

    const chainId: number = Number(process.env.NEXT_PUBLIC_CHAIN_ID as string);

    const claimRewardsContract = await getContract(
      "ClaimRewards",
      chainId,
      claimData[epochIndex].claimRewardsContractAddress
    );

    send(claimRewardsContract, "claimReward", [
      claimData[epochIndex].rewardTokenAlloted,
      claimData[epochIndex].proof,
    ])
      .then((res: any) => {
        setLoading(false);
        setClaimData({
          ...claimData,
          [epochIndex]: {
            message: "ALREADY_CLAIMED",
            canClaim: false,
          }
        })
      })
      .catch((err: any) => {
        setLoading(false);
      });
  };

  return (
    <>
    <Box>
      <Flex gap={6} className={`${VARIANT}-${colorMode}-halfContainerBody2`} my={4} p={4} align={'center'} wrap={'wrap'}>
          <PointBox title={ending()?.title} value={ending()?.value} tbd={true} />
          <PointDivider />
          <PointBox title='Total Rewards' value={(EPOCH_REWARDS[Number(epoches[epochIndex]?.id) + 1] ? tokenFormatter.format(EPOCH_REWARDS[Number(epoches[epochIndex]?.id) + 1]) : 'NA') + ' ' + process.env.NEXT_PUBLIC_VESTED_TOKEN_SYMBOL} tbd={true} />
          <PointDivider />
          <PointBox title='Your Points' value={<Flex gap={1} align={'center'}> {tokenFormatter.format(user?.totalPoints ?? 0)} <Tag ml={1} p={1} px={2} size={'sm'} colorScheme={multiplier == '1.5x' ? 'primary' : (multiplier == "2x" ? 'secondary' : 'white')}>{multiplier}</Tag> </Flex>} />
          <PointDivider />
          <PointBox title='Your Volume' value={dollarFormatter.format(user?.totalVolumeUSD ?? 0)} />
          <PointDivider />
          <PointBox title={ending().title == "Ended" ? "Your Rewards" : 'Your Estimated Rewards'} value={tokenFormatter.format(
            epoches[epochIndex]?.totalPoints > 0 ? (EPOCH_REWARDS[Number(epoches[epochIndex]?.id) + 1] ?? 0) * ((user?.totalPoints ?? 0) / epoches[epochIndex]?.totalPoints) : 0
          ) + ' ' + process.env.NEXT_PUBLIC_VESTED_TOKEN_SYMBOL + (ending().title !== "Ended" ? "*" : '')} tbd={true} />
          {ending().title == "Ended" && <Tooltip label={claimData[epochIndex]?.message || ''}> 
            <Button colorScheme='primary' isLoading={loading} size='sm' variant='outline' rounded={0} onClick={claimRewards} isDisabled={!claimData[epochIndex]?.canClaim}>Claim Rewards</Button>
          </Tooltip>}
        </Flex>
      </Box>
      <Box mb={10} mt={4}>
      <Box pt={1} pb={5} borderColor='whiteAlpha.50' className={`${VARIANT}-${colorMode}-containerBody`}>
      <TableContainer >
        <Table variant='simple'>
          <Thead>
            <Tr>
              <Th>
                <Flex>
                Rank
                </Flex>
                </Th>
              <Th>Account</Th>
              <Th>Total Points</Th>
              <Th>Total Volume (USD)</Th>

              <Th isNumeric>Multiplier</Th>
            </Tr>
          </Thead>
          <Tbody>
          {epoches[epochIndex]?.users?.map((_account: any, index: number): any => {
          return <>
            <LeaderboardRow _account={_account} index={index + 1} />
          </>
          })}
          {(!isAddressInLeaderboard && address) && <LeaderboardRow _account={{address: address?.toLowerCase(), totalPoints: user?.totalPoints, totalVolumeUSD: user?.totalVolumeUSD}} index={'...'} />}
      </Tbody>
    </Table>
  </TableContainer>

    </Box>
      <Box mt={4}>
        <PointBox title='* To be updated' value={""} tbd={true} />
      </Box>
    </Box>
    </>
  )
}

const PointDivider = () => (<><Divider orientation='vertical' mt={0} h='40px' /></>)

const PointBox = ({title, value, tbd = false}: any) => {
  const { colorMode } = useColorMode();
  return (
    <Box>
      <Text fontSize={'sm'} color={colorMode == 'dark' ? 'whiteAlpha.700' : 'blackAlpha.700'}>{title}</Text>
      <Heading fontSize={'lg'} color={tbd ? `${colorMode == 'dark' ? 'white' : 'black'}Alpha.500` : `${colorMode == 'dark' ? 'white' : 'black'}`}>{value}</Heading>
    </Box>
  )
}