import Ajv2020 from "ajv/dist/2020";
import schema from "../../../docs/product/blueprint.schema.json";
import type { BlueprintResponse } from "./types";

const ajv = new Ajv2020({ allErrors: true });
const validate = ajv.compile<BlueprintResponse>(schema);

export function validateBlueprintSchema(
  data: unknown,
): { valid: true; data: BlueprintResponse } | { valid: false; errors: string[] } {
  if (validate(data)) {
    return { valid: true, data };
  }
  return {
    valid: false,
    errors: (validate.errors ?? []).map((e) => `${e.instancePath} ${e.message}`),
  };
}
