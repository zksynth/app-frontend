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
} from "@chakra-ui/react";

import Image from "next/image";

export default function InputWithSlider({ onUpdate, asset, max, min, color = '#3EE6C4' }: any) {
	const [sliderValue, setSliderValue] = React.useState(0);
	const [value, setValue] = React.useState(0);

	const updateSlider = (_value: any) => {
		setSliderValue(_value);
		setValue((_value * max) / 100);
		onUpdate((_value * max) / 100);
	};

	const updateValue = (_value: any) => {
		// setSliderValue((_value * 100) / max);
		setValue(_value);
		onUpdate(_value);
	};

  const labelStyles = {
    mt: '-1.5',
    ml: '-1.5',
  }

  const boxStyle = {
    h:3,
    w: 3,
    borderRadius: 100
  }

	return (
		<Box>
			<InputGroup>
				<InputLeftAddon bgColor={"transparent"} width={"18%"} py={4} justifyContent='center'>
					<Image
						src={`https://raw.githubusercontent.com/synthe-x/assets/main/${asset.symbol.toUpperCase()}.png`}
						alt=""
						width={'30'}
						height={'30'}
					/>
				</InputLeftAddon>
				<NumberInput
					width={"65%"}
					value={value || 0}
					onChange={updateValue}
					max={max}
					min={min}
          step={0.01}
				>
					<NumberInputField borderRadius={0} />
					<NumberInputStepper>
						<NumberIncrementStepper />
						<NumberDecrementStepper />
					</NumberInputStepper>
				</NumberInput>
				<InputRightAddon bgColor={"transparent"} width={"18%"} justifyContent='center'>
					<Text fontSize={"sm"} textAlign='center'>{asset.symbol}</Text>
				</InputRightAddon>
			</InputGroup>

			<Slider
				aria-label="slider-ex-1"
				defaultValue={30}
				onChange={updateSlider}
				mt={2.5}
				value={sliderValue}
        width='97%'
        ml={1.5}
			>
        <SliderMark value={0} {...labelStyles}>
          <Box {...boxStyle} bgColor={sliderValue < 0 ? 'gray.200': color}></Box>
        </SliderMark>
        <SliderMark value={25} {...labelStyles}>
          <Box {...boxStyle} bgColor={sliderValue < 25 ? 'gray.200': color}></Box>
        </SliderMark>
        <SliderMark value={50} {...labelStyles}>
        <Box {...boxStyle} bgColor={sliderValue < 50 ? 'gray.200': color}></Box>
        </SliderMark>
        <SliderMark value={75} {...labelStyles}>
        <Box {...boxStyle} bgColor={sliderValue < 75 ? 'gray.200': color}></Box>
        </SliderMark>
        <SliderMark value={100} {...labelStyles}>
        <Box {...boxStyle}  bgColor={sliderValue < 100 ? 'gray.200': color}></Box>
        </SliderMark>
				<SliderTrack>
					<SliderFilledTrack bgColor={color} />
				</SliderTrack>
				<SliderThumb />
			</Slider>
		</Box>
	);
}
