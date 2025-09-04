import React from "react";
import { Box, Heading, Text, Stack, Button } from "@chakra-ui/react";
import {BattleControls} from "./components/BattleControls";

function App() {
  return (
    <Box p={8}>
      <Heading mb={4}>My Backend Dashboard</Heading>
      <Text mb={6}>
        This frontend is using Chakra UI, so it looks good without custom CSS.
      </Text>

      <Stack direction="row" gap={4} mb={8}>
        <Button colorScheme="blue">Primary Action</Button>
        <Button colorScheme="gray" variant="outline">
          Secondary
        </Button>
      </Stack>

      {/* Battle controls tab interface */}
      <Box borderWidth="1px" borderRadius="md" p={4} shadow="md">
        <BattleControls />
      </Box>
    </Box>
  );
}

export default App;
