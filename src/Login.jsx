import React, { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { auth ,googleProvider} from "./firebase";
import "./Login.css";

export const Login = ({ switchToSignup }) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      

      navigate("/dashboard"); // redirect after login
    } catch (error) {
      alert(error.message);
    }
  };
  const handleGoogleLogin = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
    navigate("/dashboard");
  } catch (error) {
    console.error("Google login error:", error);
  }
};

  return (
    <div className="wholepage">
      <form onSubmit={handleLogin}>
        <div className="loginbox">
          <h2 style={{ color: "#e5840e", textAlign: "center" }}>
            EXPENSE TRACKER
          </h2>

          <label style={{ color: "#e5840e", fontWeight: "502", paddingLeft: "10px" }}>
            Email
          </label>
          <br />
          <input
            type="email"
            placeholder="Email ID"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <br />

          <label style={{ color: "#e5840e", fontWeight: "502", paddingLeft: "10px" }}>
            Password
          </label>
          <br />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <br />

          <button type="submit">Login</button>
          

                <p style={{ textAlign: "center", marginTop: "10px" }}>
        Don’t have an account?{" "}
        <span
          onClick={switchToSignup}
          style={{ color: "#e5840e", fontWeight: "bold", cursor: "pointer" }}
        >
          Sign Up
        </span>
      </p>
      <button onClick={handleGoogleLogin} className="googleBtn">
  Continue with Google
</button>
        </div>
          
      </form>
      
    </div>
  );
};