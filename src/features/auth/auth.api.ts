import axios from "axios";

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
};

const VALID = {
  email: "eve.holt@reqres.in",
  password: "cityslicka",
};

function mockToken(email: string) {
  return `mock_${btoa(`${email}:${Date.now()}`)}`;
}

export async function loginRequest(payload: LoginPayload): Promise<LoginResponse> {
  // ✅ Block wrong credentials locally (so it NEVER logs in)
  if (payload.email !== VALID.email || payload.password !== VALID.password) {
    throw new Error("Invalid email or password.");
  }

  // ✅ Correct creds: try ReqRes real token first
  try {
    const res = await axios.post("https://reqres.in/api/login", payload, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data as LoginResponse;
  } catch (err) {
    // ✅ If ReqRes blocked/network -> fallback to mock token (still success)
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      if (status === 403 || err.code === "ERR_NETWORK") {
        await new Promise((r) => setTimeout(r, 300));
        return { token: mockToken(payload.email) };
      }
      // if ReqRes returns 400/401 etc, treat as failure (but credentials are valid anyway)
      throw err;
    }
    throw err;
  }
}
