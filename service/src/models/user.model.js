import mongoose from "mongoose";
import bcrypt from "bcrypt";

// User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters long"],
      maxlength: [50, "Name must be at most 50 characters long"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+\@.+\..+/, "Please fill a valid email address"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      maxlength: [100, "Password must be at most 100 characters long"],
    },

    refreshToken: {
      type: String,
    },

    plan: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free",
    },

    stripeCustomerId: {
      type: String,
    },

    stripeSubscriptionId: {
      type: String,
    },

    // Per-channel email opt-outs. Defaults are on: someone who added a monitor
    // is asking to be told when it breaks. Each can be turned off independently
    // so muting weekly digests never mutes incident alerts.
    notificationPrefs: {
      incidentEmails: { type: Boolean, default: true },
      sslExpiry: { type: Boolean, default: true },
      weeklyReport: { type: Boolean, default: true },
    },

    // When the last weekly report was delivered. The report job reads this so a
    // worker restart or a retry cannot send the same digest twice.
    lastWeeklyReportAt: {
      type: Date,
    },

    subscriptionStatus: {
      type: String,
      enum: [
        "active",
        "canceled",
        "incomplete",
        "incomplete_expired",
        "past_due",
        "trialing",
        "unpaid",
        "none",
      ],
      default: "none",
    },
  },
  { timestamps: true }
);

// Hashing password before saving the user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
