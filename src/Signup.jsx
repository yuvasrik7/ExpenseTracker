import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";
import "./Login.css";

function Signup({ switchToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await setDoc(doc(db, "users", userCred.user.uid), {
        name,
        email,
        role: "student",
        createdAt: serverTimestamp(),
      });

      alert("Signup successful 🎉");

      switchToLogin(); // After signup go back to login
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
      <form onSubmit={handleSignup}>
        <div className="loginbox">
          <h2 style={{ color: "#e5840e", textAlign: "center" }}>
            CREATE ACCOUNT
          </h2>

          <label style={{ color: "#e5840e", paddingLeft: "10px" }}>
            Name
          </label>
          <br />
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <br />

          <label style={{ color: "#e5840e", paddingLeft: "10px" }}>
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

          <label style={{ color: "#e5840e", paddingLeft: "10px" }}>
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

          <button type="submit">Sign Up</button>

          <p style={{ textAlign: "center", marginTop: "10px" }}>
            Already have an account?{" "}
            <span
              onClick={switchToLogin}
              style={{
                color: "#e5840e",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Login
            </span>
          </p>
          <button onClick={handleGoogleLogin} className="googleBtn">
  Continue with Google
</button>
        </div>
      </form>
    </div>
  );
}

export default Signup;