import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export const getMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

// Ensures monthlyBudget exists; creates default if missing
export const ensureMonthlyBudget = async (userId) => {
  if (!userId) return null;

  const monthKey = getMonthKey();
  const docRef = doc(db, "users", userId, "monthlyBudgets", monthKey);
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    await setDoc(docRef, {
      budget: 0,
      totalSpent: 0,
      savings: 0,
    });
    return { budget: 0, totalSpent: 0, savings: 0, monthKey };
  }

  return { ...snap.data(), monthKey };
};
function getPreviousMonthKey(currentKey) {
  const [year, month] = currentKey.split("-").map(Number);
  const date = new Date(year, month - 1);
  return date.toISOString().slice(0, 7);
}
export default getPreviousMonthKey;