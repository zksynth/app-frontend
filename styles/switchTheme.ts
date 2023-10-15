import { switchAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers, defineStyle } from '@chakra-ui/react'

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(switchAnatomy.keys)

const baseStyleTrack = defineStyle((props) => {
  const { colorScheme: c } = props

  return {
    bg: `${c}.200`,
    _checked: {
      bg: `${c}.200`,
    },
    _dark: {
      bg: `gray.600`,
      _checked: {
        bg: `secondary.400`,
      }
    },
    _light: {
      bg: `gray.600`,
      _checked: {
        bg: `secondary.400`,
      }
    },
  }
})

const baseStyle = definePartsStyle((props) => ({
  // define the part you're going to style
  container: {
    // ...
  },
  thumb: {
    bg: "white",
  },
  track: baseStyleTrack(props)
}))

const boxy = definePartsStyle({
  track: {
    borderRadius: '0',
    p: '2px'
  }
})

export const switchTheme = defineMultiStyleConfig({ baseStyle, variants: { boxy }})