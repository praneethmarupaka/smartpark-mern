import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model.js';
import { env } from '../config/env.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { logAuditEvent } from '../services/audit.service.js';

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'USER', phone = '', vehicleInfo } = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return ApiResponse.error(res, 'An account with this email already exists', 409);
    }

    // Role safety: public register can only be USER or OWNER, never ADMIN
    const safeRole = role === 'OWNER' ? 'OWNER' : 'USER';

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: safeRole,
      phone: phone.trim(),
      vehicleInfo: vehicleInfo || { vehicleType: 'NONE', vehicleNumber: '' }
    });

    const token = generateToken(user._id, user.role);

    return ApiResponse.created(
      res,
      {
        user,
        token
      },
      'Registration successful'
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return ApiResponse.error(res, 'Invalid email or password', 401);
    }

    if (user.status === 'SUSPENDED') {
      return ApiResponse.error(res, 'Account has been suspended. Please contact administrator.', 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return ApiResponse.error(res, 'Invalid email or password', 401);
    }

    const token = generateToken(user._id, user.role);

    return ApiResponse.success(
      res,
      {
        user,
        token
      },
      'Login successful'
    );
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    return ApiResponse.success(res, { user }, 'User profile fetched');
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, vehicleInfo } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (vehicleInfo) {
      user.vehicleInfo = {
        ...user.vehicleInfo,
        ...vehicleInfo
      };
    }

    await user.save();
    return ApiResponse.success(res, { user }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  return ApiResponse.success(res, {}, 'Logout successful');
};
