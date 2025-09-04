// PartySetupTab.tsx
import { VStack, HStack, Input, Box } from "@chakra-ui/react"
import { UnitState } from "../types/battleTypes"

interface Props {
  units: UnitState[]
  setUnits: (units: UnitState[]) => void
}

export function PartySetupTab({ units, setUnits }: Props) {
    const updateUnit = <K extends keyof UnitState>(
        index: number,
        key: K,
        value: UnitState[K]
      ) => {
    const next = [...units]
    next[index][key] = value
    setUnits(next)
  }

  return (
    <VStack gap={3} align="stretch">
      {units.map((u, idx) => (
        <HStack key={u.id} gap={2}>
          <Input
            placeholder="Name"
            value={u.name}
            onChange={e => updateUnit(idx, "name", e.target.value)}
          />
          <Input
            placeholder="SPD"
            type="number"
            value={u.baseSPD}
            onChange={e => updateUnit(idx, "baseSPD", Number(e.target.value))}
          />
        </HStack>
      ))}
    </VStack>
  )
}
