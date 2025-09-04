import { Button, Box, Heading, Text, Stack } from '@chakra-ui/react'

function App() {
  return (
    <Box p={8}>
      <Heading mb={4}>My Backend Dashboard</Heading>
      <Text mb={6}>
        This frontend is using Chakra UI, so it looks good without custom CSS.
      </Text>

      <Stack direction="row" spacing = {4}>
        <Button colorScheme="blue">Primary Action</Button>
        <Button colorScheme="gray" variant="outline">Secondary</Button>
      </Stack>
    </Box>
  )
}

export default App
