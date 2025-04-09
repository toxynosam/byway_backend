
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    review: {
      type: String,
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    likes: {
      count: {
        type: Number,
        default: 0,
      },
      users: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one review per user per course
reviewSchema.index({ course: 1, user: 1 }, { unique: true });

// Static method that helps calculate average rating for a course
reviewSchema.statics.calcAverageRating = async function (courseId) {
  const stats = await this.aggregate([
    {
      $match: { course: courseId, isActive: true },
    },
    {
      $group: {
        _id: "$course",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model("Course").findByIdAndUpdate(courseId, {
      "ratings.average": parseFloat(stats[0].avgRating.toFixed(1)),
      "rating.count": stats[0].count,
    });
  } else {
    await mongoose.model("Course").findByIdAndUpdate(courseId, {
      "ratings.average": 0,
      "ratings.count": 0,
    });
  }
};

// call calcAverageRating after save
reviewSchema.post("save", function () {
  this.constructor.calcAverageRating(this.course);
});

// call calcAverageRating before remove
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // Check if the document exists and call calcAverageRating
  if (this.r) {
    await this.r.constructor.calcAverageRating(this.r.course);
  }
});

const Review = mongoose.model("Review", reviewSchema);
