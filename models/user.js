import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, enum: ["admin", "volunteer"], default: "volunteer" },
  headOf: String,
});

export default mongoose.models.User || mongoose.model("User", UserSchema);