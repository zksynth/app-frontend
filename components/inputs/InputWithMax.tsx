import React from "react";
import {
	NumberInput,
	NumberInputField,
	NumberInputStepper,
	NumberIncrementStepper,
	NumberDecrementStepper,
	InputRightAddon,
	Text,
	InputGroup,
	Input,
	InputLeftAddon,
	Box,
	Slider,
	SliderTrack,
	SliderFilledTrack,
	SliderThumb,
	SliderMark,
	Flex,
} from "@chakra-ui/react";

import Image from "next/image";
import Big from "big.js";

export default function InputWithMax({
	onUpdate,
	asset,
	max,
	softMax = max,
	min,
	color = "#3EE6C4",
}: any) {
	const [value, setValue] = React.useState(0);

	const handleMax = (_value: any) => {
		setValue(Big(softMax).div(100).toNumber());
		onUpdate(Big(softMax).div(100).toNumber());
	};

	const updateValue = (_value: any) => {
		// setSliderValue((_value * 100) / max);
		setValue(_value);
		onUpdate(_value);
	};

	return (
		<Box>
            <Flex flexDir={'column'} justify={'center'} align='center' gap={2}>
				<Image
					src={`/icons/${asset.symbol}.svg`}
					alt=""
					width={"30"}
					height={"30"}
				/>

				<Text fontSize={"xl"} fontWeight="bold" textAlign="center">
					{asset.symbol}
				</Text>
			</Flex>
			<InputGroup variant={"unstyled"} display="flex">
				<NumberInput
                    w={"100%"}
					value={value || 0}
					onChange={updateValue}
					max={max}
					min={min}
					step={0.01}
					display="flex"
					alignItems="center"
					justifyContent={"center"}
				>
					<NumberInputField
						textAlign={"center"}
						pr={0}
						fontSize={"5xl"}
					/>
				</NumberInput>
                
			</InputGroup>
            {/* <Box    
            textAlign={'center'}
                    onClick={handleMax}
                    cursor={"pointer"}  
                    fontSize={"md"}
                    fontWeight={"bold"}
                    color={"#3EE6C4"}
                    bg={"transparent"}
                    border={"none"}
                    _hover={{bg: "transparent"}}
                    _active={{bg: "transparent"}}
                    _focus={{bg: "transparent"}}
                >
                    MAX
                </Box> */}
			
		</Box>
	);
}
