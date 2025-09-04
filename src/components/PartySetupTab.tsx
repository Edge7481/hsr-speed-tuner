import { useState } from "react";
import { Box, Input, VStack, HStack, Text } from "@chakra-ui/react";

interface UnitConfig {
  id: string;
  name: string;
  spd: number;
}

export default function PartySetupTab() {
  const [units, setUnits] = useState<UnitConfig[]>([
    { id: "u1", name: "Unit 1", spd: 160 },
    { id: "u2", name: "Unit 2", spd: 160 },
    { id: "u3", name: "Unit 3", spd: 160 },
    { id: "u4", name: "Unit 4", spd: 160 },
  ]);

  const updateUnit = (id: string, field: keyof UnitConfig, value: string | number) => {
    setUnits(prev =>
      prev.map(unit =>
        unit.id === id ? { ...unit, [field]: value } : unit
      )
    );
  };

  return (
    <VStack gap={4} align="stretch">
      {units.map(unit => (
        <Box key={unit.id} borderWidth="1px" borderRadius="md" p={4} shadow="sm">
          <Text fontWeight="bold" mb={2}>
            {unit.id.toUpperCase()}
          </Text>
          <HStack gap={4}>
            <Input
              placeholder="Name"
              value={unit.name}
              onChange={e => updateUnit(unit.id, "name", e.target.value)}
            />
            <Input
              placeholder="SPD"
              type="number"
              value={unit.spd}
              onChange={e => updateUnit(unit.id, "spd", parseInt(e.target.value))}
            />
          </HStack>
        </Box>
      ))}
    </VStack>
  );
}
