import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { apiRequest, setAccessToken } from "../lib/api";
import type { ApiEnvelope } from "../types/api";

type LoginResponse = {
  user: {
    id: string;
    email: string;
    fullName?: string;
    role: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
};

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    try {
      const response = await apiRequest<ApiEnvelope<LoginResponse>>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password
        })
      });

      setAccessToken(response.data.tokens.accessToken);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h1>Đăng nhập</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Đăng nhập</button>
      </form>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      <p>
        Chua co tài khoản? <Link to="/register">Đăng ký</Link>
      </p>
    </main>
  );
}

