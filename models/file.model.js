const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    originalName: { type: String, required: true },
    url: { type: String, required: true },
    public_id: { type: String, required: true },
    mimetype: { type: String },
    size: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model("File", fileSchema);
