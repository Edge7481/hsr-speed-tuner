// BattleControls.tsx
import { useState } from "react"
import { VStack, Box, Heading } from "@chakra-ui/react"
import { UnitState, BuffTemplate } from "../types/battleTypes"
import { PartySetupTab } from "./PartySetupTab"
import { BuffControls } from "./BuffControls"

export function BattleControls() {
  // Shared state for units
  const [units, setUnits] = useState<UnitState[]>([
    { id: 'u1', name: 'Unit 1', baseSPD: 100, currentSPD: 100, baseAV: 100, currentAV: 100, buffs: [] },
    { id: 'u2', name: 'Unit 2', baseSPD: 100, currentSPD: 100, baseAV: 100, currentAV: 100, buffs: [] },
    { id: 'u3', name: 'Unit 3', baseSPD: 100, currentSPD: 100, baseAV: 100, currentAV: 100, buffs: [] },
    { id: 'u4', name: 'Unit 4', baseSPD: 100, currentSPD: 100, baseAV: 100, currentAV: 100, buffs: [] },
  ])

  // Buff templates state (for simulator later)
  const [buffTemplates, setBuffTemplates] = useState<BuffTemplate[]>([])

  return (
    <VStack gap={8} align="stretch">
      <Box>
        <Heading size="md" mb={4}>Party Setup</Heading>
        <PartySetupTab units={units} setUnits={setUnits} />
      </Box>

      <Box>
        <Heading size="md" mb={4}>Buff Controls</Heading>
        <BuffControls
          units={units} 
          // buffs={buffTemplates} 
          // setBuffs={setBuffTemplates} 
        />
      </Box>
    </VStack>
  )
}
