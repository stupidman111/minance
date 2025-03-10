import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({
  id: "minance1",
  name: "Minance1",
  retryFunction: async (attempt) => ({
    delay: Math.pow(2, attempt) * 1000,
    maxAttempts: 2,
  }),
});
