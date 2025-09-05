import { useState } from "react"
import { VStack, Box, Heading } from "@chakra-ui/react"
import { UnitState, BuffTemplate } from "../types/battleTypes"
import { PartySetupTab } from "./PartySetupTab"
import { BuffControls } from "./BuffControls"

export function BattleControls() {
  const [units, setUnits] = useState<UnitState[]>([
    { id: 'u1', name: 'Unit 1', baseSPD: 100, currentSPD: 100, baseAV: 100, currentAV: 100, buffs: [] },
    { id: 'u2', name: 'Unit 2', baseSPD: 100, currentSPD: 100, baseAV: 100, currentAV: 100, buffs: [] },
    { id: 'u3', name: 'Unit 3', baseSPD: 100, currentSPD: 100, baseAV: 100, currentAV: 100, buffs: [] },
    { id: 'u4', name: 'Unit 4', baseSPD: 100, currentSPD: 100, baseAV: 100, currentAV: 100, buffs: [] },
  ])

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
          onChange={setBuffTemplates} // pass changes back
        />
      </Box>
      <Box>
        <Heading size="md" mb={2}>Debug Dump</Heading>
        <pre style={{ fontSize: "12px", whiteSpace: "pre-wrap" }}>
          {JSON.stringify({ units, buffTemplates }, null, 2)}
        </pre>
      </Box>

    </VStack>
  )
}
