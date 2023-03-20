import { Button } from '@chakra-ui/react'
import React from 'react'

export default function TestError() {
  return (
    <>
      <Button onClick={() => {throw new Error("Checking error")}}>Push Error</Button>
    </>
  )
}
