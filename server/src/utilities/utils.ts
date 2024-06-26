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
