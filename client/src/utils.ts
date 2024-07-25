/** Some generic utility functions and values */
export const gameStates = [
  'New',
  'Started',
  'Won',
  'Tied'
]

export interface DelayHandle {
  promise: Promise<void>;
  timeout: NodeJS.Timeout | null;
}

/** Simple function to generate hexadecimal MD5 hashes from strings */
export function generateMD5HashHex(str: string) : string {
  let currentHashVal = 0;

  for (let char of str) {
    currentHashVal = (currentHashVal << 5) - currentHashVal + char.charCodeAt(0);
  }

  return (currentHashVal >>> 0).toString(16);
}

/** Generates and returns a pseudo-random hex color */
export function generateRandomHexColor() : string {
  const randNum = Math.floor(Math.random() * 9999999 + 100000000);
  return randNum.toString(16).slice(0, 6);
}

/**
 * Serves as a simplified 'wait n ms' capability
 * Simply 'await delay(delayInMs)' anywhere you want to pause in your code
 */
export async function delay(ms: number) : Promise<void> {
  return new Promise( resolve => setTimeout(resolve, ms));
}

/**
 * A more advanced version of the delay() function
 * In addition to awaiting it's promise, you can also
 * cancel its timer via clearTimeout(timeout)
 */
export function delayWithHandle(ms: number) : DelayHandle {
  let timeout = null;
  const p : Promise<void> = new Promise( resolve => {
    timeout = setTimeout(resolve, ms);
  });
  return { promise: p, timeout: timeout };
}