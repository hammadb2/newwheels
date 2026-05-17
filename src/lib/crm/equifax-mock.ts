// Equifax soft pull — mock implementation.
//
// Build now with a mock response, clearly flagged and swappable without
// architectural changes. When real credentials arrive, swap the fetch call
// inside `softPullCredit` and the response mapping in `mapEquifaxResponse`.

import type { CreditBracket } from "./types";

export type EquifaxSoftPullInput = {
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  address?: string;
};

export type EquifaxSoftPullResult = {
  credit_bracket: CreditBracket;
  score_range: string;
  mock: boolean;
  raw_response?: Record<string, unknown>;
};

// Mock: deterministic bracket based on name hash for consistent dev testing.
function mockBracket(name: string): { bracket: CreditBracket; range: string } {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  }
  const mod = Math.abs(hash) % 3;
  switch (mod) {
    case 0:
      return { bracket: "poor", range: "300-559" };
    case 1:
      return { bracket: "fair", range: "560-659" };
    default:
      return { bracket: "good", range: "660-900" };
  }
}

export async function softPullCredit(
  input: EquifaxSoftPullInput,
): Promise<EquifaxSoftPullResult> {
  const clientId = process.env.EQUIFAX_CLIENT_ID;
  const clientSecret = process.env.EQUIFAX_CLIENT_SECRET;

  // Real implementation placeholder — swap this block when credentials arrive.
  if (clientId && clientSecret) {
    // TODO: Replace with real Equifax API call.
    // const token = await getEquifaxToken(clientId, clientSecret);
    // const res = await fetch("https://api.equifax.ca/...", { ... });
    // return mapEquifaxResponse(await res.json());
  }

  // Mock response — clearly flagged.
  const fullName = `${input.first_name} ${input.last_name}`;
  const { bracket, range } = mockBracket(fullName);

  return {
    credit_bracket: bracket,
    score_range: range,
    mock: true,
    raw_response: {
      _mock: true,
      _note: "Mock Equifax response. Replace with real API when credentials are approved.",
      input_name: fullName,
    },
  };
}
