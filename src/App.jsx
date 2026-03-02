import { useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

function App() {

  useEffect(() => {
    addDoc(collection(db, "testCollection"), {
      message: "Firestore Connected!",
      time: new Date()
    })
    .then(() => console.log("✅ Firestore Connected"))
    .catch(err => console.error(err));
  }, []);

  return <h1>React + Firestore</h1>;
}

export default App;