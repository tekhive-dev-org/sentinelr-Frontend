/**
 * Shared request queue for mutating API calls.
 * Ensures PATCH/PUT/POST/DELETE requests are sequentialized
 * with a minimum gap to avoid 429 rate-limit bursts.
 */

const STAGGER_MS = 300;

let mutationQueue = Promise.resolve();

/**
 * Enqueue a mutating API call so it never fires simultaneously
 * with other mutations. Returns the result of the call.
 *
 * @param {Function} call - async function that makes the API request
 * @returns {Promise} resolves with the call's return value
 */
export function enqueueMutation(call) {
  const promise = mutationQueue.then(call);
  // After each call (success or failure), wait STAGGER_MS before next
  mutationQueue = promise
    .catch(() => {})
    .then(() => new Promise((resolve) => setTimeout(resolve, STAGGER_MS)));
  return promise;
}
