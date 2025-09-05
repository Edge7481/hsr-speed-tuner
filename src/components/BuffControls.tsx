import { useState, useEffect } from "react"
import { Box, Button, VStack, HStack, Input, NativeSelect } from "@chakra-ui/react"
import { BuffTemplate, UnitState, EffectKey } from "../types/battleTypes"

const effectOptions: EffectKey[] = ["spdChange", "spdPercent", "advance", "delay"]

interface BuffTemplateUI extends BuffTemplate {
  selectedEffect?: EffectKey
}

interface BuffControlsProps {
  units: UnitState[]
  onChange?: (buffs: BuffTemplate[]) => void
}

export function BuffControls({ units, onChange }: BuffControlsProps) {
  const [buffs, setBuffs] = useState<BuffTemplateUI[]>([])

  // Keep buffs in sync if units change (add/remove)
  useEffect(() => {
    const next = buffs.map(b => {
      const schedule: Record<string, number[]> = {}
      units.forEach(u => {
        schedule[u.id] = b.schedule?.[u.id] ?? []
      })
      return { ...b, schedule }
    })
    setBuffs(next)
    onChange?.(next)
  }, [units])

  const addBuff = () => {
    const newBuff: BuffTemplateUI = {
      id: `buff-${buffs.length + 1}`,
      name: "",
      effects: {},
      duration: undefined,
      schedule: {}, 
      selectedEffect: undefined
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

  const selectEffect = (index: number, key: EffectKey) => {
    const next = [...buffs]
    next[index].selectedEffect = key
    next[index].effects = {}
    setBuffs(next)
    onChange?.(next)
  }

  const updateBuffEffect = (index: number, key: EffectKey, value: number) => {
    const next = [...buffs]
    next[index].effects = { ...next[index].effects, [key]: value }
    setBuffs(next)
    onChange?.(next)
  }

  const addUnitTurn = (buffIndex: number, unitId: string) => {
    const next = [...buffs]
    if (!next[buffIndex].schedule[unitId]) next[buffIndex].schedule[unitId] = []
    next[buffIndex].schedule[unitId].push(1)
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
                <NativeSelect.Field
                  value={buff.selectedEffect ?? ""}
                  onChange={e => selectEffect(bIdx, e.target.value as EffectKey)}
                >
                  <option value="">Select Effect</option>
                  {effectOptions.map(effect => (
                    <option key={effect} value={effect}>{effect}</option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>

              <Input
                placeholder="Amount"
                type="number"
                value={buff.selectedEffect ? buff.effects[buff.selectedEffect] ?? "" : ""}
                onChange={e =>
                  buff.selectedEffect &&
                  updateBuffEffect(bIdx, buff.selectedEffect, Number(e.target.value))
                }
              />

              <Input
                placeholder="Duration"
                type="number"
                value={buff.duration ?? ""}
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
