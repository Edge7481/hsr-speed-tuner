import React, { useState } from "react";
import { Box, Stack } from "@chakra-ui/react";
import PartySetupTab from "./PartySetupTab";
import {BuffControls} from "./BuffControls";

export default function BattleControls() {
  // Any state needed by multiple blocks can live here or be lifted up
  const [battleState, setBattleState] = useState(null);

  return (
    <Stack direction="row" gap={4} align="flex-start">
      {/* Party Setup Block */}
      <Box flex={1} borderWidth="1px" borderRadius="md" p={4}>
        <PartySetupTab />
      </Box>

      <Box flex={1} borderWidth="1px" borderRadius="md" p={4}>
        <BuffControls units={[]} />
      </Box>



      
    </Stack>
  );
}
