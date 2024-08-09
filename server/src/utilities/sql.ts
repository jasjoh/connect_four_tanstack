import { BadRequestError } from "../expressError";
import { camelToSnake } from "./utils";

export interface PartialUpdateInterface {
  [key: string]: any;
}

export const SQLQueries = {
  defaultPlayerCols: `
    id,
    name,
    color,
    ai,
    created_on AS "createdOn"
  `
}

/**
 * Converts an object representing updates to make in a DB table into a string
 * for use in a SET statement with $ tokens and the values for those tokens. *
 *
 * Expected input is two arguments:
 * - Object like {firstName: 'Aliya', age: 32}
 * -- Where 'firstName' is a column to update and 'Aliya' is the value to set.
 * - Object representing camelCase to snake_case mappings for columns
 * -- Example: { columnName: 'column_name' }
 *
 * Output is an object { setCols, values } where:
 * -- 'setCols' is string for use in a SQL SET statements
 * -- Example value for 'setCols': "first_name"=$1, "age"=$2
 * -- 'values' is an array of values from the input object
 * -- Example value for 'values': ['Aliya', 32]
 *
 * If the update object is empty, throws a BadRequestError.
 *
 */

export function sqlForPartialUpdate(data: PartialUpdateInterface) {
  const camelColNames = Object.keys(data);

  if (camelColNames.length === 0) throw new BadRequestError("No data provided.");

  const colAssignments = camelColNames.map((name, idx) =>
      `"${camelToSnake(name)}"=$${idx + 1}`,
  );

  return {
    setCols: colAssignments.join(", "),
    values: Object.values(data),
  };
}
