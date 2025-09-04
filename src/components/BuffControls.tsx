// BuffControls.tsx
import { useState } from "react"
import { Box, Button, VStack, HStack, Input, Select, NativeSelect } from "@chakra-ui/react"
import { BuffTemplate, UnitState } from "../types/battleTypes"

interface BuffControlsProps {
    units: UnitState[] // from PartySetupTab
    onChange?: (buffs: BuffTemplate[]) => void
}

export function BuffControls({ units, onChange }: BuffControlsProps) {
    const [buffs, setBuffs] = useState<BuffTemplate[]>([])

    const addBuff = () => {
        const newBuff: BuffTemplate = {
            id: `buff-${buffs.length + 1}`,
            name: "",
            effects: {},
            duration: undefined,
            schedule: {} // unitId -> array of turns
        }
        setBuffs(prev => {
            const next = [...prev, newBuff]
            onChange?.(next)
            return next
        })
    }

    const updateBuffName = (index: number, name: string) => {
        const next = [...buffs]
        next[index].name = name
        setBuffs(next)
        onChange?.(next)
    }

    const updateBuffEffect = (index: number, key: keyof BuffTemplate['effects'], value: number) => {
        const next = [...buffs]
        next[index].effects[key] = value
        setBuffs(next)
        onChange?.(next)
    }

    const addUnitTurn = (buffIndex: number, unitId: string) => {
        const next = [...buffs]
        if (!next[buffIndex].schedule[unitId]) next[buffIndex].schedule[unitId] = []
        next[buffIndex].schedule[unitId].push(1) // default first turn
        setBuffs(next)
        onChange?.(next)
    }

    const updateUnitTurn = (buffIndex: number, unitId: string, turnIndex: number, turn: number) => {
        const next = [...buffs]
        next[buffIndex].schedule[unitId][turnIndex] = turn
        setBuffs(next)
        onChange?.(next)
    }

    return (
        <VStack gap={4} align="stretch">
            <Button colorScheme="blue" onClick={addBuff}>Add Buff</Button>

            {buffs.map((buff, bIdx) => (
                <Box key={buff.id} borderWidth="1px" borderRadius="md" p={4}>
                    <VStack gap={2} align="stretch">
                        <Input
                            placeholder="Buff Name"
                            value={buff.name}
                            onChange={e => updateBuffName(bIdx, e.target.value)}
                        />

                        <HStack gap={2}>
                            <NativeSelect.Root>
                                <NativeSelect.Field placeholder="Effect"
                                    onChange={e => updateBuffEffect(bIdx, 'spdChange', Number(e.target.value))}>
                                    <option value={0}>SPD</option>
                                    <option value={0}>Advance</option>
                                    <option value={0}>Delay</option>
                                </NativeSelect.Field>


                            </NativeSelect.Root>

                            <Input
                                placeholder="Amount"
                                type="number"
                                onChange={e => updateBuffEffect(bIdx, 'spdChange', Number(e.target.value))}
                            />

                            <Input
                                placeholder="Duration (optional)"
                                type="number"
                                onChange={e => {
                                    const next = [...buffs]
                                    next[bIdx].duration = e.target.value ? Number(e.target.value) : undefined
                                    setBuffs(next)
                                    onChange?.(next)
                                }}
                            />
                        </HStack>

                        <VStack gap={1} align="stretch">
                            {units.map(u => (
                                <Box key={u.id}>
                                    <HStack gap={2}>
                                        <span>{u.name}</span>
                                        <Button size="xs" onClick={() => addUnitTurn(bIdx, u.id)}>Add Turn</Button>
                                    </HStack>

                                    <HStack gap={1}>
                                        {buff.schedule[u.id]?.map((turn, tIdx) => (
                                            <Input
                                                key={tIdx}
                                                type="number"
                                                value={turn}
                                                placeholder="Turn"
                                                size="sm"
                                                maxW="60px"
                                                onChange={e => updateUnitTurn(bIdx, u.id, tIdx, Number(e.target.value))}
                                            />
                                        ))}
                                    </HStack>
                                </Box>
                            ))}
                        </VStack>
                    </VStack>
                </Box>
            ))}
        </VStack>
    )
}
