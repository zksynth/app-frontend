import { Button } from '@chakra-ui/react'
import React from 'react'

export default function _error() {
  return (
    <Button onClick={() => {throw new Error("DUMMY ERROR");}}>📣</Button>
  )
}
