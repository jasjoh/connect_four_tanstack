/** Various utility functions */

export function fisherSort(arrayToSort : any[]) : any[] {
  // randomly sort the array () - Fisher Yates
  for (let i = arrayToSort.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * i);
    [arrayToSort[i], arrayToSort[j]] = [arrayToSort[j], arrayToSort[i]];  }
  return arrayToSort;
}

/** Generates a random hex color (for use in creating players) */
export function generateRandomHexColor() : string {
  const red = Math.floor(Math.random() * 256);
  const green = Math.floor(Math.random() * 256);
  const blue = Math.floor(Math.random() * 256);

  const hexColor = `#${red.toString(16).padStart(2, '0')}` +
    `${green.toString(16).padStart(2, '0')}` +
    `${blue.toString(16).padStart(2, '0')}`;

  return hexColor;
}

/** Generates a random all-caps string for use as a name
 * Accepts a number for the length of the string (defaults to 6)
 */
export function generateRandomName(length : number = 6) : string {
  let name = '';
  let char = 1;
  while (char <= length) {
    name += String.fromCharCode(Math.floor(Math.random() * 26) + 65);
    char++;
  }
  return name;
}

/**
 * Accepts a string representing a valid camelCase variable name
 * Converts that string into a snake_case string.
 * Assumption: String will not be empty. Valid camelCase start with lowercase.
 * Supports: Strings that are all lower case (simply returns them as is).
 * Examples:
 * -- 'awesomeSauce' => 'awesome_sauce'
 * -- 'aManAPlan' => 'a_man_a_plan'
 * -- 'happy' => 'happy'
 */
export function camelToSnake(camelCaseString: string) {
  if (camelCaseString[0].toUpperCase() === camelCaseString[0]) {
    // we don't support strings starting with capital letters
    return camelCaseString;
  }
  let foundCap = false;
  let invalid = false;
  const arrayOfChars = camelCaseString.split("");
  const snakeCaseArray = arrayOfChars.map(char => {
    if (char.toUpperCase() === char) {
      // char is capitalized
      if (foundCap) {
        // prior char was also capitalized so invalid input
        invalid = true;
      }
      foundCap = true; // track we found a cap
      return `_${char.toLowerCase()}`;
    } else {
      foundCap = false; // track this wasn't a cap
      return char;
    }
  });
  if (invalid) return camelCaseString;
  return snakeCaseArray.join("");
}