import { Favorite } from '../models/Favorite.model.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const toggleFavorite = async (req, res, next) => {
  try {
    const { parkingId } = req.body;
    const userId = req.user._id;

    if (!parkingId) {
      return ApiResponse.error(res, 'Parking ID is required', 400);
    }

    const existing = await Favorite.findOne({ userId, parkingId });

    if (existing) {
      await Favorite.findByIdAndDelete(existing._id);
      return ApiResponse.success(res, { isFavorited: false }, 'Removed from favorites');
    } else {
      await Favorite.create({ userId, parkingId });
      return ApiResponse.created(res, { isFavorited: true }, 'Added to favorites');
    }
  } catch (error) {
    next(error);
  }
};

export const getMyFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ userId: req.user._id })
      .populate('parkingId')
      .sort({ createdAt: -1 });

    const parkings = favorites.map((f) => f.parkingId).filter(Boolean);

    return ApiResponse.success(res, { favorites: parkings }, 'User favorites retrieved');
  } catch (error) {
    next(error);
  }
};
