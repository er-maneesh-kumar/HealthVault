import Patient from "../models/patient.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createError } from "../utils/createError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createUser = asyncHandler(async (req, res) => {
  const {
    firebaseUid,
    p_id,
    p_name,
    p_age,
    p_gender,
    p_bloodgroup,
    p_address,
    Allergies,
    Family_History,
  } = req.body;

  // Validate required fields (p_bloodgroup is optional)
  const requiredFields = { firebaseUid, p_id, p_name, p_age, p_gender, p_address, Allergies, Family_History };
  for (const [key, val] of Object.entries(requiredFields)) {
    if (!val || String(val).trim() === "") {
      return res.status(400).json({ message: `Field '${key}' is required.` });
    }
  }

  // Check duplicates
  const existedUser = await Patient.findOne({ $or: [{ firebaseUid }, { p_id }] });
  if (existedUser) {
    return res.status(409).json({ message: "A patient with this ID or account already exists." });
  }

  // Handle avatar — optional: use a default if not provided
  let avatarUrl = "https://ui-avatars.com/api/?name=" + encodeURIComponent(p_name) + "&background=random";

  const avatarFile = req.files?.avatar?.[0]; // safe optional chaining
  if (avatarFile) {
    const avatarLocalPath = avatarFile.path;
    const avatarCloudinary = await uploadOnCloudinary(avatarLocalPath);
    if (!avatarCloudinary) {
      return res.status(500).json({ message: "Error uploading avatar to cloud storage." });
    }
    avatarUrl = avatarCloudinary.url;
  }

  // Create patient
  const newUser = await Patient.create({
    firebaseUid,
    p_id,
    p_name,
    p_age: Number(p_age),
    p_gender,
    p_bloodgroup: p_bloodgroup || "",
    p_address,
    avatar: avatarUrl,
    Allergies,
    Family_History,
  });

  return res.status(201).json(new ApiResponse(201, newUser, "Patient registered successfully."));
});

export { createUser };

export const deleteUser = async (req, res, next) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.status(200).send("User deleted.");
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { p_id, p_name, p_age, p_gender, p_bloodgroup, p_address } = req.body;
    const updatedUser = await Patient.findByIdAndUpdate(
      req.params.id,
      { p_id, p_name, p_age, p_gender, p_bloodgroup, p_address },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send("User not found.");
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await Patient.findById(req.params.id);

    if (!user) {
      return res.status(404).send("User not found.");
    }

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

export const getUsers = async (req, res, next) => {
  const { firebaseUid } = req.query;

  try {
    const users = await Patient.find({ firebaseUid });
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};